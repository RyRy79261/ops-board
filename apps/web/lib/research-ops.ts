import { getTask } from "@opsboard/db/tasks";
import {
  createResearchJob,
  getResearchJob,
  getResearchJobsForTask,
  updateResearchJob,
  getResearchNotes,
  appendResearchNote,
} from "@opsboard/db/research";
import { getMergedContextForMission } from "@opsboard/db/integrations";
import { resolveAiKey, NoAiKeyError } from "@/lib/ai-key-resolver";
import { inngest } from "@/lib/inngest/client";

// Transport-agnostic research operations — ONE implementation of the cue /
// keep flows, shared by the MCP tools (lib/mcp/tools/research.ts) and the
// /api/v1 REST surface so the two transports can never drift. Outcomes carry a
// machine `code` each transport maps to its own vocabulary (ToolError message,
// HTTP status). The voice UI's original /api/research route keeps its own
// inline flow (it carries extra body/consent framing); its behaviour is
// mirrored here 1:1.
//
// KEY SAFETY: `resolveAiKey` is called only as a fail-closed EXISTENCE check —
// the key value never leaves this function; the runner re-resolves it per step.

export const RUNNER_START_FAILED = "Couldn't start the research runner. Try again.";
export const NO_KEY_MESSAGE =
  "No Anthropic key configured — add one in Settings before cueing research.";
export const NOT_READY_MESSAGE = "This research isn't ready to keep yet.";

export type CueResearchOutcome =
  | {
      ok: true;
      jobId: string;
      taskId: string;
      missionId: string;
      alreadyRunning: boolean;
    }
  | {
      ok: false;
      code: "not-found" | "no-key" | "rejected" | "enqueue-failed";
      error: string;
    };

/**
 * Cue a research job on a task the caller owns. In order: ownership (foreign
 * task reads as not-found) → one-running-job-per-task idempotency → fail-closed
 * BYO-key existence check → cue-time integration-context snapshot → create →
 * enqueue (marking the job `error` if the enqueue throws, so nothing dangles
 * in `running`).
 */
export async function cueResearchForTask(
  input: { taskId: string; query: string; focus?: string },
  userId: string,
): Promise<CueResearchOutcome> {
  const task = await getTask(input.taskId, userId);
  if (!task) {
    return { ok: false, code: "not-found", error: "No task with that id." };
  }

  // Idempotency FIRST: re-attaching to an in-flight job creates nothing and
  // spends nothing, so it must work even if the key was removed/rotated while
  // the job runs — the key check only gates the create path below.
  const existing = await getResearchJobsForTask(input.taskId, userId);
  const running = existing.find((j) => j.state === "running");
  if (running) {
    return {
      ok: true,
      jobId: running.id,
      taskId: input.taskId,
      missionId: task.missionId,
      alreadyRunning: true,
    };
  }

  // Fail CLOSED on the BYO key BEFORE any write: never create a job row for a
  // keyless user — the failure would otherwise only surface inside the runner.
  try {
    await resolveAiKey(userId, "anthropic");
  } catch (err) {
    if (err instanceof NoAiKeyError) {
      return { ok: false, code: "no-key", error: NO_KEY_MESSAGE };
    }
    throw err;
  }

  // `focus` rides along as a suffix on the stored query — the synthesis prompt
  // reads the whole string; no engine change.
  const query = input.focus
    ? `${input.query}\nFocus: ${input.focus}`
    : input.query;

  // Cue-time SNAPSHOT of the mission's merged linked-integration context (null
  // when nothing is linked) — recorded on the job so a completed result shows
  // exactly what informed it.
  const context = await getMergedContextForMission(task.missionId, userId);

  const res = await createResearchJob(
    { missionId: task.missionId, taskId: input.taskId, query, context },
    userId,
  );
  if (!res.ok) return { ok: false, code: "rejected", error: res.error };

  try {
    await inngest.send({
      name: "research/job.requested",
      data: { jobId: res.job.id, userId },
    });
  } catch (err) {
    console.error("inngest.send research/job.requested failed", err);
    await updateResearchJob(res.job.id, userId, {
      state: "error",
      errorMessage: RUNNER_START_FAILED,
    }).catch((rollbackErr) => {
      // A double-failure strands the row in `running` (blocking re-cues via
      // the idempotency check) — make it operationally discoverable.
      console.error(
        `research job ${res.job.id} stuck in "running" — rollback to "error" also failed`,
        rollbackErr,
      );
    });
    return { ok: false, code: "enqueue-failed", error: RUNNER_START_FAILED };
  }

  return {
    ok: true,
    jobId: res.job.id,
    taskId: input.taskId,
    missionId: task.missionId,
    alreadyRunning: false,
  };
}

export type KeepResearchNotesOutcome =
  | {
      ok: true;
      taskId: string;
      jobId: string;
      noteId: string;
      alreadyKept: boolean;
    }
  | { ok: false; code: "not-found" | "not-ready" | "rejected"; error: string };

/**
 * Persist a COMPLETED job's own server-stored result to its task. Idempotent
 * per job (returns the existing note); never accepts caller-supplied content.
 */
export async function keepResearchNotesForJob(
  jobId: string,
  userId: string,
): Promise<KeepResearchNotesOutcome> {
  const job = await getResearchJob(jobId, userId);
  if (!job) {
    return {
      ok: false,
      code: "not-found",
      error: "No research job with that id.",
    };
  }
  if (job.state !== "complete" || !job.result) {
    return { ok: false, code: "not-ready", error: NOT_READY_MESSAGE };
  }

  // Idempotency: already kept for THIS job → return the existing note. (The
  // DB's partial unique index on job_id backstops the race.)
  const existing = await getResearchNotes(job.taskId, userId);
  const kept = existing.find((n) => n.jobId === jobId);
  if (kept) {
    return {
      ok: true,
      taskId: job.taskId,
      jobId,
      noteId: kept.id,
      alreadyKept: true,
    };
  }

  const res = await appendResearchNote(
    { taskId: job.taskId, jobId, content: job.result },
    userId,
  );
  if (!res.ok) return { ok: false, code: "rejected", error: res.error };
  return {
    ok: true,
    taskId: job.taskId,
    jobId,
    noteId: res.note.id,
    alreadyKept: false,
  };
}
