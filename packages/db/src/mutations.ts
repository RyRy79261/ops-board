import { and, eq, inArray } from "drizzle-orm";
import { createHttpDb } from "./index";
import type { OpsboardDb } from "./index";
import * as schema from "./schema";
import type { Mission, Task, TaskStatus } from "./schema";

// @opsboard/db/mutations — the WRITE side of @opsboard/db. The board UI is
// read-only (it only cycles status via ./tasks.ts#updateTaskStatus); these
// create / update / delete mutations are what the S5 voice layer and the S6
// MCP tools call. Every function mirrors the read-service style: an explicit
// input shape, the optional injected `db: OpsboardDb = createHttpDb()` LAST
// param (so the node-pg integration harness drives the real production code),
// input guards before any SQL, and a {ok}|{ok:false,error} result for the
// mutations that can fail a domain rule (never a raw throw at the boundary).

// --- Result types ---------------------------------------------------------

/** A bare success / typed-failure result (no payload). */
export type MutationResult = { ok: true } | { ok: false; error: string };

/** createMission result — always succeeds once inputs validate. */
export type CreateMissionResult = { ok: true; mission: Mission };

/** updateMission result — fails (no throw) on an unknown / unowned mission. */
export type UpdateMissionResult =
  | { ok: true; mission: Mission }
  | { ok: false; error: string };

/** createTask result — fails (no throw) on a bad mission / category ref. */
export type CreateTaskResult =
  | { ok: true; task: Task }
  | { ok: false; error: string };

/** updateTask result — fails on unknown task or a bad category ref. */
export type UpdateTaskResult =
  | { ok: true; task: Task }
  | { ok: false; error: string };

// --- Input shapes ---------------------------------------------------------

export interface CreateMissionInput {
  name: string;
  /** "YYYY-MM-DD" or null/omitted — the fixed real-world event date. */
  targetDate?: string | null;
}

/** A patch for updateMission — provided fields only; omitted are left untouched. */
export interface UpdateMissionPatch {
  name?: string;
  /** "YYYY-MM-DD" or null (clears the anchor date). */
  targetDate?: string | null;
}

export interface CreateTaskInput {
  missionId: string;
  name: string;
  /** Resolve a category by slug (preferred for voice/MCP) … */
  categorySlug?: string | null;
  /** … or pin it directly by id. `categorySlug` wins if both are given. */
  categoryId?: string | null;
  /** The cliff date ("YYYY-MM-DD") — after this the task is moot. */
  tooLateBy?: string | null;
  /** Earliest start date ("YYYY-MM-DD"). */
  notBefore?: string | null;
  status?: TaskStatus;
}

/** A patch for updateTask. Every field is optional; omitted fields are left
 * untouched. `null` explicitly clears a nullable column. */
export interface UpdateTaskPatch {
  name?: string;
  notes?: string | null;
  status?: TaskStatus;
  categorySlug?: string | null;
  categoryId?: string | null;
  tooLateBy?: string | null;
  notBefore?: string | null;
  sortOrder?: number;
}

// --- Guards ---------------------------------------------------------------

const STATUSES: readonly TaskStatus[] = ["not-started", "in-progress", "done"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

/** Reject malformed ids at the boundary so a bad UUID never reaches SQL as a
 *  raw "invalid input syntax for type uuid" Postgres error. */
function isUuid(v: unknown): v is string {
  return typeof v === "string" && UUID_RE.test(v);
}

function isValidStatus(v: unknown): v is TaskStatus {
  return typeof v === "string" && (STATUSES as readonly string[]).includes(v);
}

/** "YYYY-MM-DD" that is ALSO a real calendar date — DATE_RE alone admits
 *  impossible dates like 2026-13-45 / 2026-02-30, which would otherwise reach
 *  SQL and throw a raw Postgres error. Verify the parts round-trip. */
function isRealDate(v: string): boolean {
  if (!DATE_RE.test(v)) return false;
  const [y, m, d] = v.split("-").map(Number) as [number, number, number];
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

/** A date-only column accepts a real "YYYY-MM-DD" or null/undefined (cleared). */
function isValidDateOrNullish(v: unknown): v is string | null | undefined {
  return v == null || (typeof v === "string" && isRealDate(v));
}

/**
 * Pull a Postgres SQLSTATE off a thrown error regardless of driver. The
 * node-postgres `DatabaseError` and the neon drivers both surface a `.code`;
 * some wrap the original in `.cause`. We never trust the message text.
 */
function pgErrorCode(err: unknown): string | undefined {
  if (typeof err !== "object" || err === null) return undefined;
  const e = err as { code?: unknown; cause?: { code?: unknown } };
  if (typeof e.code === "string") return e.code;
  if (e.cause && typeof e.cause.code === "string") return e.cause.code;
  return undefined;
}

// SQLSTATE classes we translate into typed errors instead of throwing.
const UNIQUE_VIOLATION = "23505";
const CHECK_VIOLATION = "23514";
const FK_VIOLATION = "23503";

/**
 * Resolve a category slug to its id. Returns:
 *  - { ok: true, categoryId: string } when the slug exists,
 *  - { ok: false } when the slug is unknown (caller turns this into an error).
 */
async function resolveCategorySlug(
  slug: string,
  db: OpsboardDb,
): Promise<{ ok: true; categoryId: string } | { ok: false }> {
  const [row] = await db
    .select({ id: schema.categories.id })
    .from(schema.categories)
    .where(eq(schema.categories.slug, slug))
    .limit(1);
  return row ? { ok: true, categoryId: row.id } : { ok: false };
}

// --- Missions -------------------------------------------------------------

/**
 * Create a mission. `targetDate` is the optional "YYYY-MM-DD" anchor event
 * date. Always succeeds once the name is non-empty and the date (if given) is
 * well-formed — there is no domain rule a mission insert can violate.
 */
export async function createMission(
  input: CreateMissionInput,
  userId: string,
  db: OpsboardDb = createHttpDb(),
): Promise<CreateMissionResult> {
  if (!isNonEmptyString(input.name)) {
    throw new TypeError("createMission: `name` must be a non-empty string.");
  }
  if (!isNonEmptyString(userId)) {
    throw new TypeError("createMission: `userId` must be a non-empty string.");
  }
  if (!isValidDateOrNullish(input.targetDate)) {
    throw new TypeError(
      'createMission: `targetDate` must be "YYYY-MM-DD" or null.',
    );
  }

  const [mission] = await db
    .insert(schema.missions)
    .values({
      userId,
      name: input.name.trim(),
      targetDate: input.targetDate ?? null,
    })
    .returning();
  return { ok: true, mission: mission! };
}

/**
 * Delete a mission. The `tasks.mission_id` FK is ON DELETE CASCADE, so this
 * also removes every task on the mission (and, transitively, their dependency
 * edges). Idempotent: deleting a missing mission is a no-op {ok:true}.
 */
export async function deleteMission(
  missionId: string,
  userId: string,
  db: OpsboardDb = createHttpDb(),
): Promise<MutationResult> {
  if (!isUuid(missionId)) {
    throw new TypeError("deleteMission: `missionId` must be a valid UUID.");
  }
  if (!isNonEmptyString(userId)) {
    throw new TypeError("deleteMission: `userId` must be a non-empty string.");
  }
  await db
    .delete(schema.missions)
    .where(
      and(
        eq(schema.missions.id, missionId),
        eq(schema.missions.userId, userId),
      ),
    );
  return { ok: true };
}

/**
 * Patch a mission's editable fields (name, target date). Only provided fields
 * are written; an explicit `null` `targetDate` clears it. Bumps `updated_at`.
 * Owner-scoped — an absent/unowned mission returns {ok:false} (never throws).
 * Throws only on caller-side misuse (a bad id, empty name, or malformed date).
 */
export async function updateMission(
  missionId: string,
  patch: UpdateMissionPatch,
  userId: string,
  db: OpsboardDb = createHttpDb(),
): Promise<UpdateMissionResult> {
  if (!isUuid(missionId)) {
    throw new TypeError("updateMission: `missionId` must be a valid UUID.");
  }
  if (!isNonEmptyString(userId)) {
    throw new TypeError("updateMission: `userId` must be a non-empty string.");
  }
  if (patch.name !== undefined && !isNonEmptyString(patch.name)) {
    throw new TypeError("updateMission: `name` must be a non-empty string.");
  }
  if (
    patch.targetDate !== undefined &&
    !isValidDateOrNullish(patch.targetDate)
  ) {
    throw new TypeError(
      'updateMission: `targetDate` must be "YYYY-MM-DD" or null.',
    );
  }

  const set: Partial<typeof schema.missions.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (patch.name !== undefined) set.name = patch.name.trim();
  if (patch.targetDate !== undefined) set.targetDate = patch.targetDate ?? null;

  const [mission] = await db
    .update(schema.missions)
    .set(set)
    .where(
      and(
        eq(schema.missions.id, missionId),
        eq(schema.missions.userId, userId),
      ),
    )
    .returning();
  if (!mission) return { ok: false, error: "Mission not found." };
  return { ok: true, mission };
}

// --- Tasks ----------------------------------------------------------------

/**
 * Create a task on a mission. A category can be supplied by `categorySlug`
 * (resolved here — preferred for voice/MCP where the model knows the slug) or
 * directly by `categoryId`; `categorySlug` wins when both are present. Returns
 * a typed error (never throws) for an unknown slug or a bad mission/category
 * FK; throws only on caller-side misuse (empty name, malformed date/status).
 */
export async function createTask(
  input: CreateTaskInput,
  userId: string,
  db: OpsboardDb = createHttpDb(),
): Promise<CreateTaskResult> {
  if (!isUuid(input.missionId)) {
    throw new TypeError("createTask: `missionId` must be a valid UUID.");
  }
  if (!isNonEmptyString(userId)) {
    throw new TypeError("createTask: `userId` must be a non-empty string.");
  }
  if (input.categoryId != null && !isUuid(input.categoryId)) {
    throw new TypeError(
      "createTask: `categoryId` must be a valid UUID or null.",
    );
  }
  if (!isNonEmptyString(input.name)) {
    throw new TypeError("createTask: `name` must be a non-empty string.");
  }
  if (input.status !== undefined && !isValidStatus(input.status)) {
    throw new TypeError(
      "createTask: `status` must be not-started | in-progress | done.",
    );
  }
  if (!isValidDateOrNullish(input.tooLateBy)) {
    throw new TypeError(
      'createTask: `tooLateBy` must be "YYYY-MM-DD" or null.',
    );
  }
  if (!isValidDateOrNullish(input.notBefore)) {
    throw new TypeError(
      'createTask: `notBefore` must be "YYYY-MM-DD" or null.',
    );
  }

  // Verify the mission belongs to this user BEFORE inserting anything. This is
  // what upholds the tasks.userId == missions.userId invariant (and prevents a
  // user planting a task on someone else's mission). If the mission is absent
  // or owned by someone else, return a typed error and do NOT insert.
  const [mission] = await db
    .select({ id: schema.missions.id })
    .from(schema.missions)
    .where(
      and(
        eq(schema.missions.id, input.missionId),
        eq(schema.missions.userId, userId),
      ),
    )
    .limit(1);
  if (!mission) {
    return {
      ok: false,
      error: "Unknown mission or category — task not created.",
    };
  }

  // Resolve the category. An EXPLICIT `categorySlug` must resolve (unknown →
  // typed error). When NEITHER a slug nor a categoryId is given, default to the
  // "general" catch-all so a new task lands in a visible bucket — but
  // BEST-EFFORT: if "general" isn't seeded, fall back to uncategorised (null)
  // rather than failing the create.
  let categoryId: string | null = input.categoryId ?? null;
  const explicitSlug = isNonEmptyString(input.categorySlug)
    ? input.categorySlug
    : null;
  if (explicitSlug) {
    const resolved = await resolveCategorySlug(explicitSlug, db);
    if (!resolved.ok) {
      return { ok: false, error: `Unknown category slug: ${explicitSlug}` };
    }
    categoryId = resolved.categoryId;
  } else if (input.categoryId == null) {
    const resolved = await resolveCategorySlug("general", db);
    if (resolved.ok) categoryId = resolved.categoryId;
  }

  try {
    const [task] = await db
      .insert(schema.tasks)
      .values({
        missionId: input.missionId,
        userId,
        name: input.name.trim(),
        categoryId,
        status: input.status ?? "not-started",
        tooLateBy: input.tooLateBy ?? null,
        notBefore: input.notBefore ?? null,
      })
      .returning();
    return { ok: true, task: task! };
  } catch (err) {
    if (pgErrorCode(err) === FK_VIOLATION) {
      return {
        ok: false,
        error: "Unknown mission or category — task not created.",
      };
    }
    throw err;
  }
}

/**
 * Patch a task. Only the provided fields are written; an explicit `null`
 * clears a nullable column. A category can be moved by slug (resolved) or id.
 * Bumps `updated_at`. Returns {ok:false} (never throws) for an unknown task,
 * an unknown category slug, or a bad category FK; throws only on caller-side
 * misuse (malformed status/date, empty name).
 */
export async function updateTask(
  taskId: string,
  patch: UpdateTaskPatch,
  userId: string,
  db: OpsboardDb = createHttpDb(),
): Promise<UpdateTaskResult> {
  if (!isUuid(taskId)) {
    throw new TypeError("updateTask: `taskId` must be a valid UUID.");
  }
  if (!isNonEmptyString(userId)) {
    throw new TypeError("updateTask: `userId` must be a non-empty string.");
  }
  if (patch.categoryId != null && !isUuid(patch.categoryId)) {
    throw new TypeError(
      "updateTask: `categoryId` must be a valid UUID or null.",
    );
  }
  if (patch.name !== undefined && !isNonEmptyString(patch.name)) {
    throw new TypeError("updateTask: `name` must be a non-empty string.");
  }
  if (patch.status !== undefined && !isValidStatus(patch.status)) {
    throw new TypeError(
      "updateTask: `status` must be not-started | in-progress | done.",
    );
  }
  if (patch.tooLateBy !== undefined && !isValidDateOrNullish(patch.tooLateBy)) {
    throw new TypeError(
      'updateTask: `tooLateBy` must be "YYYY-MM-DD" or null.',
    );
  }
  if (patch.notBefore !== undefined && !isValidDateOrNullish(patch.notBefore)) {
    throw new TypeError(
      'updateTask: `notBefore` must be "YYYY-MM-DD" or null.',
    );
  }
  if (patch.sortOrder !== undefined && !Number.isInteger(patch.sortOrder)) {
    throw new TypeError("updateTask: `sortOrder` must be an integer.");
  }

  // Build the SET object from only the keys the caller actually supplied, so
  // omitted fields are untouched and an explicit `null` clears the column.
  const set: Partial<typeof schema.tasks.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (patch.name !== undefined) set.name = patch.name.trim();
  if (patch.notes !== undefined) set.notes = patch.notes;
  if (patch.status !== undefined) set.status = patch.status;
  if (patch.tooLateBy !== undefined) set.tooLateBy = patch.tooLateBy;
  if (patch.notBefore !== undefined) set.notBefore = patch.notBefore;
  if (patch.sortOrder !== undefined) set.sortOrder = patch.sortOrder;

  // Category move: slug wins over id; both `null` and a real id are honoured.
  if (isNonEmptyString(patch.categorySlug)) {
    const resolved = await resolveCategorySlug(patch.categorySlug, db);
    if (!resolved.ok) {
      return {
        ok: false,
        error: `Unknown category slug: ${patch.categorySlug}`,
      };
    }
    set.categoryId = resolved.categoryId;
  } else if (patch.categorySlug === null || patch.categoryId !== undefined) {
    // Explicitly clearing via slug:null, or setting/clearing via categoryId.
    set.categoryId = patch.categoryId ?? null;
  }

  try {
    const [row] = await db
      .update(schema.tasks)
      .set(set)
      .where(and(eq(schema.tasks.id, taskId), eq(schema.tasks.userId, userId)))
      .returning();
    if (!row) return { ok: false, error: "Task not found." };
    return { ok: true, task: row };
  } catch (err) {
    if (pgErrorCode(err) === FK_VIOLATION) {
      return { ok: false, error: "Unknown category — task not updated." };
    }
    throw err;
  }
}

/**
 * Delete a task. The two `task_dependencies` FKs (task_id, depends_on_id) are
 * ON DELETE CASCADE, so every edge into or out of this task is removed too.
 * Idempotent: deleting a missing task is a no-op {ok:true}.
 */
export async function deleteTask(
  taskId: string,
  userId: string,
  db: OpsboardDb = createHttpDb(),
): Promise<MutationResult> {
  if (!isUuid(taskId)) {
    throw new TypeError("deleteTask: `taskId` must be a valid UUID.");
  }
  if (!isNonEmptyString(userId)) {
    throw new TypeError("deleteTask: `userId` must be a non-empty string.");
  }
  await db
    .delete(schema.tasks)
    .where(and(eq(schema.tasks.id, taskId), eq(schema.tasks.userId, userId)));
  return { ok: true };
}

// --- Dependency edges -----------------------------------------------------

/**
 * Add a dependency edge: `taskId` depends on `dependsOnId`. Two domain rules
 * are enforced at the DB boundary and translated into typed errors here rather
 * than thrown:
 *  - the `task_dependencies_no_self_dep_check` CHECK rejects a self-dependency,
 *  - the `task_dependencies_edge_idx` unique index rejects a duplicate edge.
 * A bad task FK (either endpoint missing) is likewise returned as {ok:false}.
 * Cross-edge CYCLE detection is NOT done here — that lives in @opsboard/core.
 */
export async function addDependency(
  taskId: string,
  dependsOnId: string,
  userId: string,
  db: OpsboardDb = createHttpDb(),
): Promise<MutationResult> {
  if (!isUuid(taskId) || !isUuid(dependsOnId)) {
    throw new TypeError(
      "addDependency: `taskId` and `dependsOnId` must be valid UUIDs.",
    );
  }
  if (!isNonEmptyString(userId)) {
    throw new TypeError("addDependency: `userId` must be a non-empty string.");
  }
  // Cheap pre-check so the common self-dep case never hits the DB; the CHECK
  // below is still the source of truth for the same race.
  if (taskId === dependsOnId) {
    return { ok: false, error: "A task cannot depend on itself." };
  }

  // Both endpoints must be the user's own tasks before we create the edge —
  // otherwise a user could wire an edge into / out of someone else's task.
  // We count the user's tasks among {taskId, dependsOnId}: exactly 2 means
  // both are owned.
  const owned = await db
    .select({ id: schema.tasks.id })
    .from(schema.tasks)
    .where(
      and(
        inArray(schema.tasks.id, [taskId, dependsOnId]),
        eq(schema.tasks.userId, userId),
      ),
    );
  if (owned.length !== 2) {
    return { ok: false, error: "One or both tasks do not exist." };
  }

  try {
    await db.insert(schema.taskDependencies).values({ taskId, dependsOnId });
    return { ok: true };
  } catch (err) {
    const code = pgErrorCode(err);
    if (code === CHECK_VIOLATION) {
      return { ok: false, error: "A task cannot depend on itself." };
    }
    if (code === UNIQUE_VIOLATION) {
      return { ok: false, error: "That dependency already exists." };
    }
    if (code === FK_VIOLATION) {
      return { ok: false, error: "One or both tasks do not exist." };
    }
    throw err;
  }
}

/**
 * Remove a dependency edge. Idempotent: removing an edge that doesn't exist is
 * a no-op {ok:true}.
 */
export async function removeDependency(
  taskId: string,
  dependsOnId: string,
  userId: string,
  db: OpsboardDb = createHttpDb(),
): Promise<MutationResult> {
  if (!isUuid(taskId) || !isUuid(dependsOnId)) {
    throw new TypeError(
      "removeDependency: `taskId` and `dependsOnId` must be valid UUIDs.",
    );
  }
  if (!isNonEmptyString(userId)) {
    throw new TypeError(
      "removeDependency: `userId` must be a non-empty string.",
    );
  }
  // Scope the delete to edges whose `task_id` is one of the user's own tasks
  // (the edge's ownership flows through its tasks — there is no user_id column
  // on task_dependencies). A subquery keeps this a single round-trip and means
  // another user's edge with the same id pair is never touched.
  const ownedTaskIds = db
    .select({ id: schema.tasks.id })
    .from(schema.tasks)
    .where(eq(schema.tasks.userId, userId));
  await db
    .delete(schema.taskDependencies)
    .where(
      and(
        eq(schema.taskDependencies.taskId, taskId),
        eq(schema.taskDependencies.dependsOnId, dependsOnId),
        inArray(schema.taskDependencies.taskId, ownedTaskIds),
      ),
    );
  return { ok: true };
}
