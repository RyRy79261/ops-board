import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createHttpDb } from "@opsboard/db";
import { getMissions, getMission } from "@opsboard/db/missions";
import {
  getCategories,
  getTasks,
  getTask,
  getTaskDependencies,
} from "@opsboard/db/tasks";
import {
  createMission,
  deleteMission,
  createTask,
  updateTask,
  deleteTask,
  addDependency,
  removeDependency,
} from "@opsboard/db/mutations";
import type { DependencyEdge as DbDependencyEdge } from "@opsboard/db/tasks";
import type { Task, TaskStatus } from "@opsboard/db/schema";
import {
  deriveBlocked,
  blockingDependencyIds,
  windowStateDetail,
  criticalPath,
  CLOSING_THRESHOLD_DAYS,
  type BlockedTask,
  type DependencyEdge as CoreDependencyEdge,
} from "@opsboard/core";
import { eq, sql } from "drizzle-orm";
import * as schema from "@opsboard/db/schema";
import { runTool, ToolError, notFound, MAX_DATE_RANGE_DAYS } from "../tool-utils";
import { issueConfirmToken, consumeConfirmToken } from "../confirm-token";

// PHASE 2 (scaffolding-plan.md S6, project_brief.md §4). The 14 OpsBoard MCP
// tools — the SAME create/read/update/delete surface the voice layer drives,
// re-exposed over the MCP transport so Claude.ai runs identical commands.
//
// Every handler is wrapped in `runTool({ toolName, extra, argsForAudit,
// handler })` (../tool-utils.ts), which audits the call (success + error, with
// durationMs + redacted args) and masks any uncontrolled throw to a generic
// "Internal error." — so a tool body NEVER leaks SQL / a stack trace. Throw a
// `ToolError` (or the `notFound()` shortcut) for a deliberate, caller-visible
// message; surface the @opsboard/db mutations' `{ ok:false, error }` results as
// such a ToolError.
//
// READS reuse the SAME @opsboard/db query services and @opsboard/core
// derivations the dashboard uses — get_blocked_tasks / get_closing_windows /
// get_critical_path call deriveBlocked / windowStateDetail / criticalPath with
// `now` + `tz` passed IN (core is I/O-free and never reads the clock). The MCP
// transport has no client clock, so `now` is the server's Date.now() at call
// time and `tz` is an optional, validated IANA arg (default UTC).
//
// DESTRUCTIVE tools (delete_task / delete_mission) NEVER auto-delete: the first
// call issues a short-lived confirmation token (confirm-token.ts); a second
// call presenting that token executes the delete (mirrors the voice
// needsConfirmation flow over MCP — project_brief.md §4 / research-dossier §8).

// --- Shared validation -----------------------------------------------------

const DEFAULT_TZ = "UTC";

/** A real "YYYY-MM-DD" calendar date (rejects 2026-13-45 etc.). */
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected a YYYY-MM-DD date.")
  .refine((v) => {
    const [y, m, d] = v.split("-").map(Number) as [number, number, number];
    const dt = new Date(Date.UTC(y, m - 1, d));
    return (
      dt.getUTCFullYear() === y &&
      dt.getUTCMonth() === m - 1 &&
      dt.getUTCDate() === d
    );
  }, "Not a real calendar date.");

const uuid = z.string().uuid("Expected a task/mission UUID.");

const taskStatus = z.enum(["not-started", "in-progress", "done"]);

const categorySlug = z.enum([
  "medical",
  "bureaucratic",
  "travel",
  "gear",
  "tech",
]);

/** A validated IANA tz, falling back to UTC on anything unknown/oversized. */
const tzArg = z
  .string()
  .max(64)
  .optional()
  .transform((value) => {
    if (!value) return DEFAULT_TZ;
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: value });
      return value;
    } catch {
      return DEFAULT_TZ;
    }
  });

// --- Mapping helpers --------------------------------------------------------

/** @opsboard/db edge ({taskId,dependsOnId}) → @opsboard/core edge ({task_id,depends_on_id}). */
function toCoreEdges(edges: readonly DbDependencyEdge[]): CoreDependencyEdge[] {
  return edges.map((e) => ({
    task_id: e.taskId,
    depends_on_id: e.dependsOnId,
  }));
}

/**
 * Task rows → the minimal {id,status} shape the @opsboard/core derivations
 * take. `Task.status` is typed `string` (the schema's `text` column) but the
 * DB CHECK pins it to the three TaskStatus values, so the narrow is safe.
 */
function toBlockedTasks(tasks: readonly Task[]): BlockedTask[] {
  return tasks.map((t) => ({ id: t.id, status: t.status as TaskStatus }));
}

/** A board-shaped, client-safe view of a task row (no internal column churn). */
function toTaskView(t: Task) {
  return {
    id: t.id,
    missionId: t.missionId,
    name: t.name,
    categoryId: t.categoryId,
    status: t.status,
    tooLateBy: t.tooLateBy,
    notBefore: t.notBefore,
    notes: t.notes,
    sortOrder: t.sortOrder,
  };
}

/**
 * Turn a failing mutation result into a caller-visible ToolError, returning the
 * success variant narrowed. The @opsboard/db mutations return a discriminated
 * union `{ ok:true; ... } | { ok:false; error:string }`; this throws the
 * `error` message (which runTool surfaces verbatim) when `ok` is false. The
 * `Extract` narrows the return type back to just the success arm.
 */
function unwrap<T extends { ok: boolean }>(
  result: T,
): Extract<T, { ok: true }> {
  if (!result.ok) {
    const error = (result as { error?: string }).error ?? "Operation failed.";
    throw new ToolError(error);
  }
  return result as Extract<T, { ok: true }>;
}

/**
 * Resolve a mission either by id or by a fuzzy name hint (case-insensitive
 * substring; exact-name match wins, then a unique substring). Throws a
 * ToolError when nothing / more than one mission matches a hint.
 */
async function resolveMission(args: { missionId?: string; nameHint?: string }) {
  if (args.missionId) {
    const mission = await getMission(args.missionId);
    if (!mission) notFound("No mission with that id.");
    return mission!;
  }
  if (args.nameHint) {
    const hint = args.nameHint.trim().toLowerCase();
    const missions = await getMissions();
    const exact = missions.filter((m) => m.name.toLowerCase() === hint);
    if (exact.length === 1) return exact[0]!;
    const partial = missions.filter((m) =>
      m.name.toLowerCase().includes(hint),
    );
    if (partial.length === 1) return partial[0]!;
    if (partial.length === 0) notFound(`No mission matching "${args.nameHint}".`);
    throw new ToolError(
      `"${args.nameHint}" matches ${partial.length} missions; be more specific.`,
    );
  }
  throw new ToolError("Provide either missionId or nameHint.");
}

// ---------------------------------------------------------------------------

/**
 * Register the OpsBoard data/tool surface on `server`. Aggregated by
 * `registerOpsboardTools` in ../server.ts, which the `[transport]` route wires
 * into the McpServer.
 */
export function registerOpsboardDataTools(server: McpServer): void {
  // === READ tools ==========================================================

  server.registerTool(
    "list_missions",
    {
      title: "List missions",
      description:
        "Every mission with its target date. Read-only, no side effects.",
      inputSchema: {},
    },
    async (args, extra) =>
      runTool({
        toolName: "list_missions",
        extra,
        argsForAudit: args,
        handler: async () => {
          const missions = await getMissions();
          return { missions };
        },
      }),
  );

  server.registerTool(
    "get_mission",
    {
      title: "Get a mission",
      description:
        "One mission (by id, or fuzzy name hint) plus its tasks. Read-only.",
      inputSchema: {
        missionId: uuid.optional(),
        nameHint: z.string().min(1).optional(),
      },
    },
    async (args, extra) =>
      runTool({
        toolName: "get_mission",
        extra,
        argsForAudit: args,
        handler: async () => {
          const mission = await resolveMission(args);
          const tasks = await getTasks(mission.id);
          return { mission, tasks: tasks.map(toTaskView) };
        },
      }),
  );

  server.registerTool(
    "list_tasks",
    {
      title: "List tasks",
      description:
        "Tasks across a mission (or all missions), optionally filtered by category slug, status, or blocked-state. Read-only.",
      inputSchema: {
        missionId: uuid.optional(),
        category: categorySlug.optional(),
        status: taskStatus.optional(),
        blocked: z.boolean().optional(),
      },
    },
    async (args, extra) =>
      runTool({
        toolName: "list_tasks",
        extra,
        argsForAudit: args,
        handler: async () => {
          const db = createHttpDb();
          // Resolve a category slug → id once (so we can filter in memory).
          let categoryId: string | null = null;
          if (args.category) {
            const cats = await getCategories(db);
            const cat = cats.find((c) => c.slug === args.category);
            if (!cat) throw new ToolError(`Unknown category: ${args.category}`);
            categoryId = cat.id;
          }

          // Gather the candidate task set (one mission, or all of them).
          const missionIds = args.missionId
            ? [args.missionId]
            : (await getMissions(db)).map((m) => m.id);

          let tasks: Task[] = [];
          for (const mid of missionIds) {
            tasks = tasks.concat(await getTasks(mid, db));
          }

          // blocked=true needs the dependency graph; derive per-mission so the
          // adjacency is scoped (and we reuse the same core fn the board uses).
          let blockedFilter: Set<string> | null = null;
          if (args.blocked === true || args.blocked === false) {
            blockedFilter = new Set();
            for (const mid of missionIds) {
              const mTasks = tasks.filter((t) => t.missionId === mid);
              const edges = await getTaskDependencies(mid, db);
              const blockedMap = deriveBlocked(
                toBlockedTasks(mTasks),
                toCoreEdges(edges),
              );
              for (const t of mTasks) {
                if ((blockedMap.get(t.id) === true) === args.blocked) {
                  blockedFilter.add(t.id);
                }
              }
            }
          }

          const filtered = tasks.filter((t) => {
            if (categoryId !== null && t.categoryId !== categoryId) return false;
            if (args.status && t.status !== args.status) return false;
            if (blockedFilter && !blockedFilter.has(t.id)) return false;
            return true;
          });

          return { tasks: filtered.map(toTaskView), count: filtered.length };
        },
      }),
  );

  server.registerTool(
    "get_blocked_tasks",
    {
      title: "List blocked tasks",
      description:
        "Tasks whose dependencies aren't all done yet, each with the NAMES of the prerequisites blocking it. Read-only.",
      inputSchema: { missionId: uuid.optional() },
    },
    async (args, extra) =>
      runTool({
        toolName: "get_blocked_tasks",
        extra,
        argsForAudit: args,
        handler: async () => {
          const db = createHttpDb();
          const missionIds = args.missionId
            ? [args.missionId]
            : (await getMissions(db)).map((m) => m.id);

          const blocked: Array<{
            id: string;
            name: string;
            missionId: string;
            status: string;
            blockedBy: Array<{ id: string; name: string }>;
          }> = [];

          for (const mid of missionIds) {
            const tasks = await getTasks(mid, db);
            const edges = await getTaskDependencies(mid, db);
            const coreEdges = toCoreEdges(edges);
            const blockedMap = deriveBlocked(
              toBlockedTasks(tasks),
              coreEdges,
            );
            const nameById = new Map(tasks.map((t) => [t.id, t.name]));
            for (const t of tasks) {
              if (blockedMap.get(t.id) !== true) continue;
              const blockerIds = blockingDependencyIds(
                t.id,
                toBlockedTasks(tasks),
                coreEdges,
              );
              blocked.push({
                id: t.id,
                name: t.name,
                missionId: t.missionId,
                status: t.status,
                // A dangling/unknown dep id is a real blocker — name it "(unknown task)".
                blockedBy: blockerIds.map((bid) => ({
                  id: bid,
                  name: nameById.get(bid) ?? "(unknown task)",
                })),
              });
            }
          }

          return { blockedTasks: blocked, count: blocked.length };
        },
      }),
  );

  server.registerTool(
    "get_closing_windows",
    {
      title: "List closing windows",
      description:
        "Tasks whose action window is closing — their too_late_by cliff falls within `daysAhead` days from now (default 7). Uses the same window-state derivation the dashboard does. Read-only.",
      inputSchema: {
        missionId: uuid.optional(),
        daysAhead: z
          .number()
          .int()
          .min(0)
          .max(MAX_DATE_RANGE_DAYS)
          .optional(),
        tz: tzArg,
      },
    },
    async (args, extra) =>
      runTool({
        toolName: "get_closing_windows",
        extra,
        argsForAudit: args,
        handler: async () => {
          const db = createHttpDb();
          const now = Date.now();
          const tz = args.tz ?? DEFAULT_TZ;
          const daysAhead = args.daysAhead ?? CLOSING_THRESHOLD_DAYS;

          const missionIds = args.missionId
            ? [args.missionId]
            : (await getMissions(db)).map((m) => m.id);

          const closing: Array<{
            id: string;
            name: string;
            missionId: string;
            tooLateBy: string | null;
            state: string;
            reason: string;
            daysUntilClose: number | null;
          }> = [];

          for (const mid of missionIds) {
            const tasks = await getTasks(mid, db);
            const edges = await getTaskDependencies(mid, db);
            const blockedMap = deriveBlocked(
              toBlockedTasks(tasks),
              toCoreEdges(edges),
            );
            for (const t of tasks) {
              const detail = windowStateDetail(
                now,
                {
                  too_late_by: t.tooLateBy,
                  not_before: t.notBefore,
                  blocked: blockedMap.get(t.id) === true,
                },
                tz,
              );
              // A task with a cliff that's already closed OR within `daysAhead`
              // whole days (and not past) is "closing soon". Skip tasks with no
              // cliff (daysUntilClose === null) and ones still far out.
              if (
                detail.daysUntilClose !== null &&
                detail.daysUntilClose <= daysAhead
              ) {
                closing.push({
                  id: t.id,
                  name: t.name,
                  missionId: t.missionId,
                  tooLateBy: t.tooLateBy,
                  state: detail.state,
                  reason: detail.reason,
                  daysUntilClose: detail.daysUntilClose,
                });
              }
            }
          }

          // Soonest cliff first.
          closing.sort(
            (a, b) => (a.daysUntilClose ?? 0) - (b.daysUntilClose ?? 0),
          );
          return { closingTasks: closing, count: closing.length, daysAhead };
        },
      }),
  );

  server.registerTool(
    "get_critical_path",
    {
      title: "Get the critical path",
      description:
        "The longest dependency chain in a mission — the sequence of tasks that gates the timeline. Returns the chain as an ordered list of task names (dependents first, deepest prerequisite last). Read-only.",
      inputSchema: { missionId: uuid },
    },
    async (args, extra) =>
      runTool({
        toolName: "get_critical_path",
        extra,
        argsForAudit: args,
        handler: async () => {
          const db = createHttpDb();
          const mission = await getMission(args.missionId, db);
          if (!mission) notFound("No mission with that id.");
          const tasks = await getTasks(args.missionId, db);
          const edges = await getTaskDependencies(args.missionId, db);
          const pathIds = criticalPath(
            tasks.map((t) => ({ id: t.id })),
            toCoreEdges(edges),
          );
          const nameById = new Map(tasks.map((t) => [t.id, t.name]));
          const path = pathIds.map((id) => ({
            id,
            name: nameById.get(id) ?? "(unknown task)",
          }));
          return {
            missionId: args.missionId,
            length: path.length === 0 ? 0 : path.length - 1,
            path,
          };
        },
      }),
  );

  // === WRITE tools =========================================================

  server.registerTool(
    "create_mission",
    {
      title: "Create a mission",
      description:
        "Create a new mission. `targetDate` (YYYY-MM-DD) is the optional fixed real-world event date.",
      inputSchema: {
        name: z.string().min(1),
        targetDate: isoDate.optional(),
      },
    },
    async (args, extra) =>
      runTool({
        toolName: "create_mission",
        extra,
        argsForAudit: args,
        handler: async () => {
          const result = unwrap(
            await createMission({
              name: args.name,
              targetDate: args.targetDate ?? null,
            }),
          );
          return { mission: result.mission };
        },
      }),
  );

  server.registerTool(
    "update_mission",
    {
      title: "Update a mission",
      description:
        "Rename a mission and/or change its target date (YYYY-MM-DD). Pass `targetDate: null` to clear it. At least one field is required.",
      inputSchema: {
        missionId: uuid,
        name: z.string().min(1).optional(),
        targetDate: isoDate.nullable().optional(),
      },
    },
    async (args, extra) =>
      runTool({
        toolName: "update_mission",
        extra,
        argsForAudit: args,
        handler: async () => {
          if (args.name === undefined && args.targetDate === undefined) {
            throw new ToolError("Provide name and/or targetDate to update.");
          }
          // @opsboard/db/mutations doesn't yet export updateMission — do a
          // guarded direct update of only the supplied columns, mirroring the
          // mutations-layer style (validated input, {ok}-shaped result).
          const db = createHttpDb();
          const set: Partial<typeof schema.missions.$inferInsert> = {
            updatedAt: new Date(),
          };
          if (args.name !== undefined) set.name = args.name.trim();
          if (args.targetDate !== undefined) set.targetDate = args.targetDate;
          const [row] = await db
            .update(schema.missions)
            .set(set)
            .where(eq(schema.missions.id, args.missionId))
            .returning();
          if (!row) notFound("No mission with that id.");
          return { mission: row };
        },
      }),
  );

  server.registerTool(
    "create_task",
    {
      title: "Create a task",
      description:
        "Add a task to a mission. `category` is a category slug (medical | bureaucratic | travel | gear | tech). `tooLateBy` is the cliff after which the task is moot (NOT a due date); `notBefore` is the earliest start date. `dependsOn` lists the task ids this one waits on.",
      inputSchema: {
        missionId: uuid,
        name: z.string().min(1),
        category: categorySlug.optional(),
        tooLateBy: isoDate.optional(),
        notBefore: isoDate.optional(),
        dependsOn: z.array(uuid).optional(),
        notes: z.string().optional(),
      },
    },
    async (args, extra) =>
      runTool({
        toolName: "create_task",
        extra,
        argsForAudit: args,
        handler: async () => {
          const created = unwrap(
            await createTask({
              missionId: args.missionId,
              name: args.name,
              categorySlug: args.category ?? null,
              tooLateBy: args.tooLateBy ?? null,
              notBefore: args.notBefore ?? null,
            }),
          );
          const task = created.task;

          // Notes aren't a createTask input — patch them in if supplied.
          if (args.notes !== undefined) {
            unwrap(await updateTask(task.id, { notes: args.notes }));
          }

          // Wire up each dependency edge; surface the FIRST failure (so a bad
          // edge doesn't silently vanish), but the task itself already exists.
          const addedDeps: string[] = [];
          for (const depId of args.dependsOn ?? []) {
            const dep = await addDependency(task.id, depId);
            if (!dep.ok) {
              throw new ToolError(
                `Task created, but dependency on ${depId} failed: ${dep.error}`,
              );
            }
            addedDeps.push(depId);
          }

          return { task: toTaskView(task), dependsOn: addedDeps };
        },
      }),
  );

  server.registerTool(
    "update_task",
    {
      title: "Update a task",
      description:
        "Patch a task. Only the fields you pass change. `category` is a slug (or null to clear); `status` is not-started | in-progress | done; `tooLateBy` / `notBefore` are YYYY-MM-DD (or null to clear).",
      inputSchema: {
        taskId: uuid,
        name: z.string().min(1).optional(),
        category: categorySlug.nullable().optional(),
        status: taskStatus.optional(),
        tooLateBy: isoDate.nullable().optional(),
        notBefore: isoDate.nullable().optional(),
        notes: z.string().nullable().optional(),
      },
    },
    async (args, extra) =>
      runTool({
        toolName: "update_task",
        extra,
        argsForAudit: args,
        handler: async () => {
          const patch: Parameters<typeof updateTask>[1] = {};
          if (args.name !== undefined) patch.name = args.name;
          if (args.status !== undefined) patch.status = args.status;
          if (args.tooLateBy !== undefined) patch.tooLateBy = args.tooLateBy;
          if (args.notBefore !== undefined) patch.notBefore = args.notBefore;
          if (args.notes !== undefined) patch.notes = args.notes;
          // category: a slug sets/moves it; explicit null clears it.
          if (args.category !== undefined) patch.categorySlug = args.category;

          if (Object.keys(patch).length === 0) {
            throw new ToolError("Provide at least one field to update.");
          }

          const result = unwrap(await updateTask(args.taskId, patch));
          return { task: toTaskView(result.task) };
        },
      }),
  );

  server.registerTool(
    "add_dependency",
    {
      title: "Add a dependency",
      description:
        "Make `taskId` depend on `dependsOnId` (the prerequisite must finish first). Rejects self-dependencies and duplicate edges.",
      inputSchema: { taskId: uuid, dependsOnId: uuid },
    },
    async (args, extra) =>
      runTool({
        toolName: "add_dependency",
        extra,
        argsForAudit: args,
        handler: async () => {
          unwrap(await addDependency(args.taskId, args.dependsOnId));
          return { ok: true, taskId: args.taskId, dependsOnId: args.dependsOnId };
        },
      }),
  );

  server.registerTool(
    "remove_dependency",
    {
      title: "Remove a dependency",
      description:
        "Remove the dependency edge from `taskId` to `dependsOnId`. Idempotent — removing a non-existent edge succeeds.",
      inputSchema: { taskId: uuid, dependsOnId: uuid },
    },
    async (args, extra) =>
      runTool({
        toolName: "remove_dependency",
        extra,
        argsForAudit: args,
        handler: async () => {
          unwrap(await removeDependency(args.taskId, args.dependsOnId));
          return { ok: true, taskId: args.taskId, dependsOnId: args.dependsOnId };
        },
      }),
  );

  // === DESTRUCTIVE tools (confirmation-gated) ==============================

  server.registerTool(
    "delete_task",
    {
      title: "Delete a task",
      description:
        "Delete a task (and its dependency edges). DESTRUCTIVE: the first call returns a one-time confirmation token and does NOT delete; call again with that `confirm` token to actually delete.",
      inputSchema: { taskId: uuid, confirm: z.string().optional() },
    },
    async (args, extra) =>
      runTool({
        toolName: "delete_task",
        extra,
        // Never audit the confirm token value — only whether one was presented.
        argsForAudit: { taskId: args.taskId, confirm: Boolean(args.confirm) },
        handler: async () => {
          const db = createHttpDb();
          const task = await getTask(args.taskId, db);
          if (!task) notFound("No task with that id.");

          if (!args.confirm) {
            const token = issueConfirmToken("delete_task", args.taskId);
            return {
              needsConfirmation: true,
              message: `This will delete the task "${task!.name}" and its dependency edges. To confirm, call delete_task again with confirm="${token}".`,
              confirm: token,
            };
          }

          if (!consumeConfirmToken("delete_task", args.taskId, args.confirm)) {
            throw new ToolError(
              "Confirmation token is invalid, expired, or doesn't match this task. Call delete_task without confirm to get a fresh token.",
            );
          }

          unwrap(await deleteTask(args.taskId, db));
          return { deleted: true, taskId: args.taskId, name: task!.name };
        },
      }),
  );

  server.registerTool(
    "delete_mission",
    {
      title: "Delete a mission",
      description:
        "Delete a mission and ALL of its tasks (cascade). DESTRUCTIVE: the first call returns a one-time confirmation token and does NOT delete; call again with that `confirm` token to actually delete.",
      inputSchema: { missionId: uuid, confirm: z.string().optional() },
    },
    async (args, extra) =>
      runTool({
        toolName: "delete_mission",
        extra,
        argsForAudit: {
          missionId: args.missionId,
          confirm: Boolean(args.confirm),
        },
        handler: async () => {
          const db = createHttpDb();
          const mission = await getMission(args.missionId, db);
          if (!mission) notFound("No mission with that id.");
          const [{ count } = { count: 0 }] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(schema.tasks)
            .where(eq(schema.tasks.missionId, args.missionId));

          if (!args.confirm) {
            const token = issueConfirmToken("delete_mission", args.missionId);
            return {
              needsConfirmation: true,
              message: `This will delete the mission "${mission!.name}" and all ${count} of its tasks. To confirm, call delete_mission again with confirm="${token}".`,
              confirm: token,
              taskCount: count,
            };
          }

          if (
            !consumeConfirmToken(
              "delete_mission",
              args.missionId,
              args.confirm,
            )
          ) {
            throw new ToolError(
              "Confirmation token is invalid, expired, or doesn't match this mission. Call delete_mission without confirm to get a fresh token.",
            );
          }

          unwrap(await deleteMission(args.missionId, db));
          return {
            deleted: true,
            missionId: args.missionId,
            name: mission!.name,
            deletedTaskCount: count,
          };
        },
      }),
  );
}
