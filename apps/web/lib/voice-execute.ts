import "server-only";

import type { VoiceIntent } from "@opsboard/types";
import { createHttpDb } from "@opsboard/db";
import type { OpsboardDb } from "@opsboard/db";
import {
  getMissions,
  getMissionWithTasks,
  type MissionView,
} from "@opsboard/db/missions";
import {
  getCategories,
  getTasks,
  getTaskDependencies,
  updateTaskStatus,
  type CategoryView,
  type DependencyEdge,
} from "@opsboard/db/tasks";
import type { Task, TaskStatus } from "@opsboard/db/schema";
import {
  createMission,
  createTask,
  updateTask,
  deleteTask,
  deleteMission,
  addDependency,
  removeDependency,
} from "@opsboard/db/mutations";
import {
  deriveBlocked,
  blockingDependencyIds,
  criticalPath,
  windowStateDetail,
  type WindowStateDetail,
} from "@opsboard/core";
import { resolveHint, type Resolvable } from "./voice-resolve";

export { resolveHint, type Resolvable } from "./voice-resolve";
export type { ResolveResult } from "./voice-resolve";

// @opsboard/web voice intent EXECUTOR — the step-7 layer of /api/voice/command.
// Resolves the classifier's free-text *Hint fields to real DB ids (the pure
// resolver in this file, unit-tested without a DB), then maps each VoiceIntent
// to the @opsboard/db mutation (writes) or @opsboard/core derivation (reads /
// query). It NEVER transcribes or calls the model — the route owns that. It
// NEVER mutates on a `query`. Destructive intents only reach here once the route
// has confirmed them (the route gates needsConfirmation before calling execute).
//
// Errors are scrubbed to generic, user-facing strings — no SQL/stack leakage.

// --- The response contract the route returns (and the FAB consumes) ---------

/** A disambiguation candidate the FAB renders as a tap-to-pick row (Toast pick). */
export interface DisambiguationOption {
  /** The resolved entity id to bind the re-issued intent to. */
  id: string;
  /** Display name (Toast pick `name`). */
  name: string;
  /** Trailing mono short-code (Toast pick `code`) — category/mission context. */
  code: string;
}

/** A single executed-result payload. Discriminated by `kind` so the FAB can pick a toast. */
export type ExecuteResult =
  | { kind: "mission_created"; missionId: string; name: string }
  | {
      kind: "task_created";
      taskId: string;
      name: string;
      mission: string;
    }
  | {
      kind: "task_status_updated";
      taskId: string;
      name: string;
      status: Task["status"];
    }
  | { kind: "task_updated"; taskId: string; name: string; field: string }
  | { kind: "dependency_added"; taskName: string; dependsOnName: string }
  | { kind: "dependency_removed"; taskName: string; dependsOnName: string }
  | { kind: "task_deleted"; name: string }
  | { kind: "mission_deleted"; name: string }
  | { kind: "query_answer"; answer: QueryAnswer };

/** A read-only query answer. Mirrors VoiceQueryResultCard's shape (header/answer/rows). */
export interface QueryAnswer {
  /** Which query was answered — drives the FAB's icon + header word. */
  topic: "blocked" | "closing" | "critical_path" | "general";
  /** Mono caps header, e.g. 'CLOSING THIS WEEK'. */
  header: string;
  /** Natural-language answer line. */
  answer: string;
  /** Optional task read-out rows {name, window/context label}. NEVER mutable. */
  rows: Array<{ taskId: string; name: string; window: string }>;
}

/**
 * The outcome of executing one intent. Exactly one branch is populated:
 *  - `result` — a mutation ran (or a query answered) successfully,
 *  - `needsConfirmation` — the hint couldn't be resolved to a single entity and
 *     the route should ask the user to clarify (a soft, non-destructive gate),
 *  - `needsDisambiguation` + `options` — several entities matched; the FAB shows
 *     a pick-list and re-issues the resolved intent,
 *  - `error` — execution failed; the message is already client-safe.
 */
export type ExecuteOutcome =
  | { result: ExecuteResult }
  | { needsConfirmation: true; clarify: string }
  | { needsDisambiguation: true; options: DisambiguationOption[]; prompt: string }
  | { error: string };

// --- DB-backed snapshot + resolvers -----------------------------------------

/** The session user's missions as Resolvables (code = target date or "MISSION"). */
async function missionResolvables(
  userId: string,
  db: OpsboardDb,
): Promise<Resolvable[]> {
  const missions = await getMissions(userId, db);
  return missions.map((m) => ({
    id: m.id,
    name: m.name,
    code: m.targetDate ?? "MISSION",
  }));
}

/**
 * Every task across every mission, as Resolvables. The code is the category slug
 * (upper-cased, e.g. MEDICAL) when known, else the owning mission name — enough
 * for the FAB's disambiguation short-code. Same-named tasks in different missions
 * are distinguished by that code.
 */
async function allTaskResolvables(
  userId: string,
  db: OpsboardDb,
): Promise<{ resolvables: Resolvable[]; tasksById: Map<string, TaskWithMission> }> {
  const [missions, categories] = await Promise.all([
    getMissions(userId, db),
    getCategories(db),
  ]);
  const catSlugById = new Map<string, string>(
    categories.map((c) => [c.id, c.slug]),
  );

  const resolvables: Resolvable[] = [];
  const tasksById = new Map<string, TaskWithMission>();

  const perMission = await Promise.all(
    missions.map(async (m) => ({
      mission: m,
      tasks: await getTasks(m.id, userId, db),
    })),
  );
  for (const { mission, tasks } of perMission) {
    for (const t of tasks) {
      const slug = t.categoryId ? catSlugById.get(t.categoryId) : undefined;
      resolvables.push({
        id: t.id,
        name: t.name,
        code: (slug ?? mission.name).toUpperCase().slice(0, 8),
      });
      tasksById.set(t.id, { ...t, missionName: mission.name });
    }
  }
  return { resolvables, tasksById };
}

interface TaskWithMission extends Task {
  missionName: string;
}

function toOptions(matches: readonly Resolvable[]): DisambiguationOption[] {
  return matches.map((m) => ({
    id: m.id,
    name: m.name,
    code: m.code ?? "",
  }));
}

/** Resolve a category hint to a seeded slug (exact slug/name, then contains). */
function resolveCategory(
  hint: string,
  categories: readonly CategoryView[],
): string | null {
  const resolved = resolveHint(
    hint,
    categories.flatMap((c) => [
      { id: c.slug, name: c.slug },
      { id: c.slug, name: c.name },
    ]),
  );
  return resolved.status === "one" ? resolved.match.id : null;
}

// --- The executor -----------------------------------------------------------

/**
 * Execute one already-validated, already-confirmed VoiceIntent for the SESSION
 * user. The route calls this AFTER safeParseIntent and AFTER the
 * needsConfirmation gate, so a delete only lands here when the user confirmed
 * it. `userId` is the verified Neon Auth principal (from the route) — every read
 * and mutation below is scoped to it. `query` is read-only.
 */
export async function executeIntent(
  intent: VoiceIntent,
  userId: string,
  db: OpsboardDb = createHttpDb(),
): Promise<ExecuteOutcome> {
  try {
    switch (intent.intent) {
      case "create_mission":
        return await execCreateMission(intent, userId, db);
      case "create_task":
        return await execCreateTask(intent, userId, db);
      case "update_task_status":
        return await execUpdateTaskStatus(intent, userId, db);
      case "update_task":
        return await execUpdateTask(intent, userId, db);
      case "add_dependency":
        return await execDependency(intent, userId, db, "add");
      case "remove_dependency":
        return await execDependency(intent, userId, db, "remove");
      case "delete_task":
        return await execDeleteTask(intent, userId, db);
      case "delete_mission":
        return await execDeleteMission(intent, userId, db);
      case "query":
        return await execQuery(intent, userId, db);
      case "unknown":
        return {
          needsConfirmation: true,
          clarify:
            "I couldn't tell what you meant. Try rephrasing the command.",
        };
    }
  } catch (err) {
    // Never surface a raw SQL/stack to the boundary.
    console.error("executeIntent failed", err);
    return { error: "Something went wrong running that command." };
  }
}

async function execCreateMission(
  intent: Extract<VoiceIntent, { intent: "create_mission" }>,
  userId: string,
  db: OpsboardDb,
): Promise<ExecuteOutcome> {
  const targetDate = isoDateOrNull(intent.targetDateHint);
  const res = await createMission(
    { name: intent.name, targetDate },
    userId,
    db,
  );
  return {
    result: {
      kind: "mission_created",
      missionId: res.mission.id,
      name: res.mission.name,
    },
  };
}

/**
 * Resolve which mission a new task belongs to. Returns the chosen mission, or an
 * `outcome` to short-circuit (clarify / disambiguate). With a hint it must match
 * exactly one; with no hint it defaults to the sole mission, else asks.
 */
function resolveTaskMission(
  missionHint: string | undefined,
  missions: readonly MissionView[],
): { mission: MissionView } | { outcome: ExecuteOutcome } {
  if (missionHint) {
    const resolved = resolveHint(
      missionHint,
      missions.map((m) => ({
        id: m.id,
        name: m.name,
        code: m.targetDate ?? "MISSION",
      })),
    );
    if (resolved.status === "none") {
      return {
        outcome: {
          needsConfirmation: true,
          clarify: `I couldn't find a mission matching "${missionHint}".`,
        },
      };
    }
    if (resolved.status === "many") {
      return {
        outcome: {
          needsDisambiguation: true,
          options: toOptions(resolved.matches),
          prompt: "Which mission?",
        },
      };
    }
    const mission = missions.find((m) => m.id === resolved.match.id);
    return mission
      ? { mission }
      : { outcome: { error: "Could not resolve the mission for that task." } };
  }
  if (missions.length === 1) return { mission: missions[0]! };
  return {
    outcome: {
      needsConfirmation: true,
      clarify:
        missions.length === 0
          ? "There are no missions yet — create one first."
          : "Which mission should this task go on?",
    },
  };
}

async function execCreateTask(
  intent: Extract<VoiceIntent, { intent: "create_task" }>,
  userId: string,
  db: OpsboardDb,
): Promise<ExecuteOutcome> {
  // Resolve the owning mission. With no hint and exactly one mission, default to
  // it; otherwise the hint must resolve to exactly one.
  const missions = await getMissions(userId, db);
  const resolvedMission = resolveTaskMission(intent.missionHint, missions);
  if ("outcome" in resolvedMission) return resolvedMission.outcome;
  const mission = resolvedMission.mission;

  let categorySlug: string | null = null;
  if (intent.categoryHint) {
    const categories = await getCategories(db);
    categorySlug = resolveCategory(intent.categoryHint, categories);
  }

  const res = await createTask(
    {
      missionId: mission.id,
      name: intent.name,
      categorySlug,
      tooLateBy: isoDateOrNull(intent.tooLateByHint),
      notBefore: isoDateOrNull(intent.notBeforeHint),
    },
    userId,
    db,
  );
  if (!res.ok) {
    return { error: "Could not create that task." };
  }
  return {
    result: {
      kind: "task_created",
      taskId: res.task.id,
      name: res.task.name,
      mission: mission.name,
    },
  };
}

async function execUpdateTaskStatus(
  intent: Extract<VoiceIntent, { intent: "update_task_status" }>,
  userId: string,
  db: OpsboardDb,
): Promise<ExecuteOutcome> {
  const { resolvables, tasksById } = await allTaskResolvables(userId, db);
  const resolved = resolveHint(intent.taskHint, resolvables);
  if (resolved.status === "none") {
    return {
      needsConfirmation: true,
      clarify: `I couldn't find a task matching "${intent.taskHint}".`,
    };
  }
  if (resolved.status === "many") {
    return {
      needsDisambiguation: true,
      options: toOptions(resolved.matches),
      prompt: "Which task?",
    };
  }
  const res = await updateTaskStatus(resolved.match.id, intent.status, userId, db);
  if (!res.ok) return { error: "Could not update that task." };
  const task = tasksById.get(resolved.match.id);
  return {
    result: {
      kind: "task_status_updated",
      taskId: res.task.id,
      name: task?.name ?? res.task.name,
      status: res.task.status,
    },
  };
}

async function execUpdateTask(
  intent: Extract<VoiceIntent, { intent: "update_task" }>,
  userId: string,
  db: OpsboardDb,
): Promise<ExecuteOutcome> {
  const { resolvables } = await allTaskResolvables(userId, db);
  const resolved = resolveHint(intent.taskHint, resolvables);
  if (resolved.status === "none") {
    return {
      needsConfirmation: true,
      clarify: `I couldn't find a task matching "${intent.taskHint}".`,
    };
  }
  if (resolved.status === "many") {
    return {
      needsDisambiguation: true,
      options: toOptions(resolved.matches),
      prompt: "Which task?",
    };
  }

  const field = normalizeField(intent.field);
  if (!field) {
    return {
      needsConfirmation: true,
      clarify: `I don't know how to change "${intent.field}".`,
    };
  }

  // A category change needs the spoken value resolved to a seeded slug FIRST,
  // so the write only ever carries a known slug. Other fields go straight in.
  let patch: Parameters<typeof updateTask>[1];
  if (field === "category") {
    const categories = await getCategories(db);
    const slug = resolveCategory(intent.value, categories);
    if (!slug) {
      return {
        needsConfirmation: true,
        clarify: `"${intent.value}" isn't one of the known categories.`,
      };
    }
    patch = { categorySlug: slug };
  } else {
    const built = buildPatch(field, intent.value);
    if ("error" in built) {
      return { needsConfirmation: true, clarify: built.error };
    }
    patch = built.patch;
  }

  const res = await updateTask(resolved.match.id, patch, userId, db);
  if (!res.ok) return { error: "Could not update that task." };
  return {
    result: {
      kind: "task_updated",
      taskId: res.task.id,
      name: res.task.name,
      field,
    },
  };
}

async function execDependency(
  intent:
    | Extract<VoiceIntent, { intent: "add_dependency" }>
    | Extract<VoiceIntent, { intent: "remove_dependency" }>,
  userId: string,
  db: OpsboardDb,
  mode: "add" | "remove",
): Promise<ExecuteOutcome> {
  const { resolvables } = await allTaskResolvables(userId, db);

  const task = resolveHint(intent.taskHint, resolvables);
  if (task.status === "none") {
    return {
      needsConfirmation: true,
      clarify: `I couldn't find a task matching "${intent.taskHint}".`,
    };
  }
  if (task.status === "many") {
    return {
      needsDisambiguation: true,
      options: toOptions(task.matches),
      prompt: "Which task should the dependency apply to?",
    };
  }

  const dependsOn = resolveHint(intent.dependsOnHint, resolvables);
  if (dependsOn.status === "none") {
    return {
      needsConfirmation: true,
      clarify: `I couldn't find a task matching "${intent.dependsOnHint}".`,
    };
  }
  if (dependsOn.status === "many") {
    return {
      needsDisambiguation: true,
      options: toOptions(dependsOn.matches),
      prompt: `Which task does "${task.match.name}" depend on?`,
    };
  }

  const res =
    mode === "add"
      ? await addDependency(task.match.id, dependsOn.match.id, userId, db)
      : await removeDependency(task.match.id, dependsOn.match.id, userId, db);
  if (!res.ok) {
    // addDependency returns typed domain errors (self-dep / dup / missing).
    return { error: res.error };
  }
  return {
    result: {
      kind: mode === "add" ? "dependency_added" : "dependency_removed",
      taskName: task.match.name,
      dependsOnName: dependsOn.match.name,
    },
  };
}

async function execDeleteTask(
  intent: Extract<VoiceIntent, { intent: "delete_task" }>,
  userId: string,
  db: OpsboardDb,
): Promise<ExecuteOutcome> {
  const { resolvables } = await allTaskResolvables(userId, db);
  const resolved = resolveHint(intent.taskHint, resolvables);
  if (resolved.status === "none") {
    return {
      needsConfirmation: true,
      clarify: `I couldn't find a task matching "${intent.taskHint}".`,
    };
  }
  if (resolved.status === "many") {
    return {
      needsDisambiguation: true,
      options: toOptions(resolved.matches),
      prompt: "Which task should I delete?",
    };
  }
  await deleteTask(resolved.match.id, userId, db);
  return { result: { kind: "task_deleted", name: resolved.match.name } };
}

async function execDeleteMission(
  intent: Extract<VoiceIntent, { intent: "delete_mission" }>,
  userId: string,
  db: OpsboardDb,
): Promise<ExecuteOutcome> {
  const resolved = resolveHint(
    intent.missionHint,
    await missionResolvables(userId, db),
  );
  if (resolved.status === "none") {
    return {
      needsConfirmation: true,
      clarify: `I couldn't find a mission matching "${intent.missionHint}".`,
    };
  }
  if (resolved.status === "many") {
    return {
      needsDisambiguation: true,
      options: toOptions(resolved.matches),
      prompt: "Which mission should I delete?",
    };
  }
  await deleteMission(resolved.match.id, userId, db);
  return { result: { kind: "mission_deleted", name: resolved.match.name } };
}

// --- Query (read-only; answers from @opsboard/core + reads) ------------------

async function execQuery(
  intent: Extract<VoiceIntent, { intent: "query" }>,
  userId: string,
  db: OpsboardDb,
): Promise<ExecuteOutcome> {
  const q = intent.question.toLowerCase();
  // Pick a query topic from cheap keyword cues; default to a blocked read-out.
  if (q.includes("critical") || q.includes("path") || q.includes("chain")) {
    return {
      result: {
        kind: "query_answer",
        answer: await queryCriticalPath(userId, db),
      },
    };
  }
  if (
    q.includes("clos") ||
    q.includes("window") ||
    q.includes("soon") ||
    q.includes("week") ||
    q.includes("late")
  ) {
    return {
      result: { kind: "query_answer", answer: await queryClosing(userId, db) },
    };
  }
  // Default + explicit "blocked"/"waiting"/"stuck".
  return {
    result: { kind: "query_answer", answer: await queryBlocked(userId, db) },
  };
}

/** The session user's tasks blocked by an unmet dependency, across their missions. */
async function queryBlocked(
  userId: string,
  db: OpsboardDb,
): Promise<QueryAnswer> {
  const missions = await getMissions(userId, db);
  const rows: QueryAnswer["rows"] = [];
  for (const mission of missions) {
    const [tasks, edges] = await Promise.all([
      getTasks(mission.id, userId, db),
      getTaskDependencies(mission.id, userId, db),
    ]);
    const coreEdges = toCoreEdges(edges);
    // `Task.status` is the DB `text` column (typed `string`); the three legal
    // values are pinned by the CHECK, so the narrow to TaskStatus is safe.
    const blockedTasks = tasks.map((t) => ({
      id: t.id,
      status: t.status as TaskStatus,
    }));
    const blockedMap = deriveBlocked(blockedTasks, coreEdges);
    const nameById = new Map(tasks.map((t) => [t.id, t.name]));
    for (const t of tasks) {
      if (blockedMap.get(t.id) !== true) continue;
      const blockerNames = blockingDependencyIds(t.id, blockedTasks, coreEdges)
        .map((id) => nameById.get(id) ?? "an unknown task")
        .join(", ");
      rows.push({
        taskId: t.id,
        name: t.name,
        window: blockerNames ? `WAITING ON ${blockerNames}` : "BLOCKED",
      });
    }
  }
  return {
    topic: "blocked",
    header: "BLOCKED TASKS",
    answer:
      rows.length === 0
        ? "Nothing is blocked right now."
        : `${rows.length} task${rows.length === 1 ? " is" : "s are"} blocked by an unfinished dependency.`,
    rows,
  };
}

/** The session user's tasks whose window is closing or closed soon, across their missions. */
async function queryClosing(
  userId: string,
  db: OpsboardDb,
): Promise<QueryAnswer> {
  const now = Date.now();
  // The query route hands a tz to the executor via a module-level default; for
  // the read path we use UTC labels since the executor doesn't receive a tz here
  // (the route's snapshot carries the tz for the CLASSIFIER, not the reader).
  const tz = "UTC";
  const missions = await getMissions(userId, db);
  const rows: QueryAnswer["rows"] = [];
  for (const mission of missions) {
    const tasks = await getTasks(mission.id, userId, db);
    for (const t of tasks) {
      const detail: WindowStateDetail = windowStateDetail(
        now,
        {
          too_late_by: t.tooLateBy,
          not_before: t.notBefore,
        },
        tz,
      );
      if (detail.state === "closing") {
        rows.push({
          taskId: t.id,
          name: t.name,
          window:
            detail.daysUntilClose != null
              ? `${detail.daysUntilClose}D LEFT`
              : "CLOSING",
        });
      }
    }
  }
  return {
    topic: "closing",
    header: "CLOSING THIS WEEK",
    answer:
      rows.length === 0
        ? "No task windows are closing this week."
        : `${rows.length} task window${rows.length === 1 ? "" : "s"} ${rows.length === 1 ? "is" : "are"} closing soon.`,
    rows,
  };
}

/** Longest dependency chain across the session user's missions (the critical path). */
async function queryCriticalPath(
  userId: string,
  db: OpsboardDb,
): Promise<QueryAnswer> {
  const missions = await getMissions(userId, db);
  let best: { rows: QueryAnswer["rows"]; mission: string } = {
    rows: [],
    mission: "",
  };
  for (const mission of missions) {
    const full = await getMissionWithTasks(mission.id, userId, db);
    if (!full) continue;
    const edges = await getTaskDependencies(mission.id, userId, db);
    const path = criticalPath(
      full.tasks.map((t) => ({ id: t.id })),
      toCoreEdges(edges),
    );
    if (path.length <= best.rows.length) continue;
    const nameById = new Map(full.tasks.map((t) => [t.id, t.name]));
    best = {
      mission: mission.name,
      rows: path.map((id, i) => ({
        taskId: id,
        name: nameById.get(id) ?? "unknown task",
        window: `STEP ${i + 1}`,
      })),
    };
  }
  return {
    topic: "critical_path",
    header: "CRITICAL PATH",
    answer:
      best.rows.length === 0
        ? "No dependency chains found."
        : `The longest chain on ${best.mission} runs ${best.rows.length} step${best.rows.length === 1 ? "" : "s"} deep.`,
    rows: best.rows,
  };
}

// --- Field / value helpers --------------------------------------------------

type UpdatableField = "category" | "tooLateBy" | "notBefore" | "name" | "notes";

/** Map a spoken field word to the canonical update field, or null if unknown. */
function normalizeField(raw: string): UpdatableField | null {
  const f = raw.toLowerCase().replace(/[\s_-]+/g, "");
  if (f.includes("categor")) return "category";
  if (f.includes("toolate") || f.includes("cliff") || f.includes("window"))
    return "tooLateBy";
  if (f.includes("notbefore") || f.includes("start") || f.includes("earliest"))
    return "notBefore";
  if (f === "name" || f.includes("title")) return "name";
  if (f.includes("note")) return "notes";
  return null;
}

type PatchBuild =
  | { patch: Parameters<typeof updateTask>[1] }
  | { error: string };

/**
 * Build the updateTask patch from a resolved NON-category field + spoken value.
 * Category is handled by the caller (it must resolve a seeded slug first).
 */
function buildPatch(
  field: Exclude<UpdatableField, "category">,
  value: string,
): PatchBuild {
  switch (field) {
    case "name":
      return { patch: { name: value } };
    case "notes":
      return { patch: { notes: value } };
    case "tooLateBy": {
      const date = isoDateOrNull(value);
      if (!date)
        return { error: `"${value}" isn't a date I can set as the window.` };
      return { patch: { tooLateBy: date } };
    }
    case "notBefore": {
      const date = isoDateOrNull(value);
      if (!date)
        return { error: `"${value}" isn't a date I can set as the start.` };
      return { patch: { notBefore: date } };
    }
  }
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Accept only a well-formed "YYYY-MM-DD" the classifier already resolved; an
 * unresolved phrase (e.g. "next week") returns null so we never fabricate a
 * date. The DB mutation re-validates calendar reality.
 */
function isoDateOrNull(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return ISO_DATE_RE.test(trimmed) ? trimmed : null;
}

/** Map the DB read-service edge shape to @opsboard/core's snake_case edge. */
function toCoreEdges(edges: readonly DependencyEdge[]) {
  return edges.map((e) => ({
    task_id: e.taskId,
    depends_on_id: e.dependsOnId,
  }));
}
