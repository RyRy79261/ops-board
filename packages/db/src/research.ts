import { and, desc, eq } from "drizzle-orm";
import { createHttpDb } from "./index";
import type { OpsboardDb } from "./index";
import * as schema from "./schema";
import type { ResearchJob, TaskResearchNote } from "./schema";
import { ResearchJobState, ResearchResult, ResearchStep } from "@opsboard/types";

// @opsboard/db/research — persistence for the AI Research (Task Agent) feature.
//
// Mirrors the ./mutations.ts style: an explicit input shape, an optional injected
// `db: OpsboardDb = createHttpDb()` LAST param (so the node-pg integration
// harness drives the real production code), input guards before any SQL, and a
// {ok}|{ok:false,error} result for ops that can fail a domain rule (never a raw
// throw at the boundary; only caller-side MISUSE — a malformed id/shape — throws).
//
// EVERY function is user-scoped: a job/note is created only against a task the
// caller owns, and reads/updates filter by userId. Nothing here decides WHEN a
// job runs or a note is kept — that is the route's consent-gated job (CUE
// RESEARCH / KEEP NOTES). This layer only records the outcome.

// --- Result + input shapes -------------------------------------------------

export type CreateResearchJobResult =
  | { ok: true; job: ResearchJob }
  | { ok: false; error: string };

export type UpdateResearchJobResult =
  | { ok: true; job: ResearchJob }
  | { ok: false; error: string };

export type AppendResearchNoteResult =
  | { ok: true; note: TaskResearchNote }
  | { ok: false; error: string };

export interface CreateResearchJobInput {
  /** The mission the research is scoped to (the locked ScopeChip taxonomy). */
  missionId: string;
  /** The task the findings bind to (and append to on KEEP NOTES). */
  taskId: string;
  /** The research question the user confirmed via CUE RESEARCH. */
  query: string;
}

/** A patch for updateResearchJob — only provided fields are written. */
export interface UpdateResearchJobPatch {
  /** Replace the streaming LIVE STEP LOG. */
  steps?: ResearchStep[];
  /** Move the lifecycle state. A terminal state (complete|error) stamps completedAt. */
  state?: ResearchJob["state"];
  /** The finished AINotesBlock payload (set alongside state='complete'). */
  result?: ResearchResult;
  /** A client-safe failure reason (set alongside state='error'). */
  errorMessage?: string | null;
}

export interface AppendResearchNoteInput {
  /** The task to attach the kept notes to. */
  taskId: string;
  /** The job that produced them (optional — kept as provenance, ON DELETE SET NULL). */
  jobId?: string | null;
  /** The reviewed ResearchResult the user chose to keep. */
  content: ResearchResult;
}

// --- Guards ----------------------------------------------------------------

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(v: unknown): v is string {
  return typeof v === "string" && UUID_RE.test(v);
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

// --- Mutations + reads -----------------------------------------------------

/**
 * Start a research job bound to a task the caller owns. Verifies the task
 * belongs to BOTH `userId` and `missionId` (scope + ownership) before inserting;
 * an absent / cross-user / wrong-mission task returns a typed error and writes
 * nothing. The job starts `running` with an empty step log.
 */
export async function createResearchJob(
  input: CreateResearchJobInput,
  userId: string,
  db: OpsboardDb = createHttpDb(),
): Promise<CreateResearchJobResult> {
  if (!isUuid(input.missionId)) {
    throw new TypeError("createResearchJob: `missionId` must be a valid UUID.");
  }
  if (!isUuid(input.taskId)) {
    throw new TypeError("createResearchJob: `taskId` must be a valid UUID.");
  }
  if (!isNonEmptyString(input.query)) {
    throw new TypeError("createResearchJob: `query` must be a non-empty string.");
  }
  if (!isNonEmptyString(userId)) {
    throw new TypeError("createResearchJob: `userId` must be a non-empty string.");
  }

  // The task must exist, be owned by this user, AND live in the scoped mission.
  const [task] = await db
    .select({ id: schema.tasks.id })
    .from(schema.tasks)
    .where(
      and(
        eq(schema.tasks.id, input.taskId),
        eq(schema.tasks.userId, userId),
        eq(schema.tasks.missionId, input.missionId),
      ),
    )
    .limit(1);
  if (!task) {
    return { ok: false, error: "Unknown task — research not started." };
  }

  const [job] = await db
    .insert(schema.researchJobs)
    .values({
      userId,
      missionId: input.missionId,
      taskId: input.taskId,
      query: input.query.trim(),
    })
    .returning();
  return { ok: true, job: job! };
}

/** Read one job, scoped to its owner. Returns null when absent or not owned. */
export async function getResearchJob(
  id: string,
  userId: string,
  db: OpsboardDb = createHttpDb(),
): Promise<ResearchJob | null> {
  if (!isUuid(id)) {
    throw new TypeError("getResearchJob: `id` must be a valid UUID.");
  }
  if (!isNonEmptyString(userId)) {
    throw new TypeError("getResearchJob: `userId` must be a non-empty string.");
  }
  const [job] = await db
    .select()
    .from(schema.researchJobs)
    .where(
      and(
        eq(schema.researchJobs.id, id),
        eq(schema.researchJobs.userId, userId),
      ),
    )
    .limit(1);
  return job ?? null;
}

/** List a task's jobs newest-first, scoped to the owner (for binding/history). */
export async function getResearchJobsForTask(
  taskId: string,
  userId: string,
  db: OpsboardDb = createHttpDb(),
): Promise<ResearchJob[]> {
  if (!isUuid(taskId)) {
    throw new TypeError("getResearchJobsForTask: `taskId` must be a valid UUID.");
  }
  if (!isNonEmptyString(userId)) {
    throw new TypeError(
      "getResearchJobsForTask: `userId` must be a non-empty string.",
    );
  }
  return db
    .select()
    .from(schema.researchJobs)
    .where(
      and(
        eq(schema.researchJobs.taskId, taskId),
        eq(schema.researchJobs.userId, userId),
      ),
    )
    .orderBy(desc(schema.researchJobs.createdAt));
}

/**
 * Advance a running job: stream new steps, mark it complete (with a result), or
 * fail it (with a message). Bumps `updated_at`; a terminal state stamps
 * `completed_at`. Scoped to the owner — an absent/unowned job returns {ok:false}.
 * Only provided fields are written. Throws only on caller-side misuse (a bad id
 * or a state/result that fails validation).
 */
export async function updateResearchJob(
  id: string,
  userId: string,
  patch: UpdateResearchJobPatch,
  db: OpsboardDb = createHttpDb(),
): Promise<UpdateResearchJobResult> {
  if (!isUuid(id)) {
    throw new TypeError("updateResearchJob: `id` must be a valid UUID.");
  }
  if (!isNonEmptyString(userId)) {
    throw new TypeError("updateResearchJob: `userId` must be a non-empty string.");
  }
  if (patch.state !== undefined && !ResearchJobState.safeParse(patch.state).success) {
    throw new TypeError(
      "updateResearchJob: `state` must be running | complete | error.",
    );
  }
  if (patch.steps !== undefined) {
    const ok = ResearchStep.array().safeParse(patch.steps).success;
    if (!ok) throw new TypeError("updateResearchJob: `steps` is malformed.");
  }
  if (patch.result !== undefined && !ResearchResult.safeParse(patch.result).success) {
    throw new TypeError("updateResearchJob: `result` is malformed.");
  }
  // Terminal transitions must carry their payload: completing a job requires a
  // `result`, failing one requires an `errorMessage`. This keeps the lifecycle
  // honest (no `complete` row without findings, no `error` row without a reason)
  // and means `completed_at` is only stamped once the terminal payload exists.
  if (patch.state === "complete" && patch.result === undefined) {
    throw new TypeError(
      "updateResearchJob: completing a job requires `result`.",
    );
  }
  if (patch.state === "error" && !isNonEmptyString(patch.errorMessage)) {
    throw new TypeError(
      "updateResearchJob: failing a job requires a non-empty `errorMessage`.",
    );
  }

  const set: Partial<typeof schema.researchJobs.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (patch.steps !== undefined) set.steps = patch.steps;
  if (patch.state !== undefined) {
    set.state = patch.state;
    if (patch.state === "complete" || patch.state === "error") {
      set.completedAt = new Date();
    }
  }
  if (patch.result !== undefined) set.result = patch.result;
  if (patch.errorMessage !== undefined) set.errorMessage = patch.errorMessage;

  const [row] = await db
    .update(schema.researchJobs)
    .set(set)
    .where(
      and(
        eq(schema.researchJobs.id, id),
        eq(schema.researchJobs.userId, userId),
      ),
    )
    .returning();
  if (!row) return { ok: false, error: "Job not found." };
  return { ok: true, job: row };
}

/**
 * Persist reviewed research as a note on a task the caller owns — the KEEP NOTES
 * write. Verifies task ownership before inserting (an absent/cross-user task
 * returns a typed error, no write). The content is validated against
 * ResearchResult so a malformed payload can never be stored. Append-only:
 * keeping again adds another row, never overwrites.
 */
export async function appendResearchNote(
  input: AppendResearchNoteInput,
  userId: string,
  db: OpsboardDb = createHttpDb(),
): Promise<AppendResearchNoteResult> {
  if (!isUuid(input.taskId)) {
    throw new TypeError("appendResearchNote: `taskId` must be a valid UUID.");
  }
  if (input.jobId != null && !isUuid(input.jobId)) {
    throw new TypeError("appendResearchNote: `jobId` must be a valid UUID or null.");
  }
  if (!isNonEmptyString(userId)) {
    throw new TypeError("appendResearchNote: `userId` must be a non-empty string.");
  }
  if (!ResearchResult.safeParse(input.content).success) {
    throw new TypeError("appendResearchNote: `content` is malformed.");
  }

  // The task must exist and be owned by this user before we attach anything.
  const [task] = await db
    .select({ id: schema.tasks.id })
    .from(schema.tasks)
    .where(
      and(eq(schema.tasks.id, input.taskId), eq(schema.tasks.userId, userId)),
    )
    .limit(1);
  if (!task) {
    return { ok: false, error: "Unknown task — notes not saved." };
  }

  // If a job is cited as provenance, it must belong to THIS user and THIS task —
  // the FK only enforces existence, so without this a note could be linked to an
  // unrelated (or another user's) job, corrupting attribution.
  if (input.jobId != null) {
    const [job] = await db
      .select({ id: schema.researchJobs.id })
      .from(schema.researchJobs)
      .where(
        and(
          eq(schema.researchJobs.id, input.jobId),
          eq(schema.researchJobs.userId, userId),
          eq(schema.researchJobs.taskId, input.taskId),
        ),
      )
      .limit(1);
    if (!job) {
      return { ok: false, error: "Unknown research job — notes not saved." };
    }
  }

  const [note] = await db
    .insert(schema.taskResearchNotes)
    .values({
      taskId: input.taskId,
      userId,
      jobId: input.jobId ?? null,
      content: input.content,
    })
    .returning();
  return { ok: true, note: note! };
}

/** List a task's kept research notes newest-first, scoped to the owner. */
export async function getResearchNotes(
  taskId: string,
  userId: string,
  db: OpsboardDb = createHttpDb(),
): Promise<TaskResearchNote[]> {
  if (!isUuid(taskId)) {
    throw new TypeError("getResearchNotes: `taskId` must be a valid UUID.");
  }
  if (!isNonEmptyString(userId)) {
    throw new TypeError("getResearchNotes: `userId` must be a non-empty string.");
  }
  return db
    .select()
    .from(schema.taskResearchNotes)
    .where(
      and(
        eq(schema.taskResearchNotes.taskId, taskId),
        eq(schema.taskResearchNotes.userId, userId),
      ),
    )
    .orderBy(desc(schema.taskResearchNotes.createdAt));
}
