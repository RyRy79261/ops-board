import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  createResearchJob,
  getResearchJob,
  getResearchJobsForTask,
  updateResearchJob,
  getResearchNotes,
  getResearchNoteSummariesByMissionId,
  appendResearchNote,
} from "@opsboard/db/research";
import { getTask } from "@opsboard/db/tasks";
import { getMission } from "@opsboard/db/missions";
import { resolveAiKey, NoAiKeyError } from "@/lib/ai-key-resolver";
import { inngest } from "@/lib/inngest/client";
import { rateLimiter } from "@/lib/rate-limit";
import { toResearchJobView } from "@/lib/research-types";
import { runTool, ToolError, notFound } from "../tool-utils";

// The RESEARCH DELEGATE tool surface — the MCP wrapping of the existing AI
// Research engine, so an external client (another app, a claude.ai session)
// can drive the research loop end-to-end over the MCP transport: cue a job on
// a task, poll it, and keep/read the cited notes. These are THIN WRAPPERS over
// the same @opsboard/db/research services the /api/research* HTTP routes call
// — the engine (Inngest runner, prompts, validation) is untouched.
//
// Conventions (same as ./opsboard.ts): every handler wrapped in `runTool`
// (audit + owner-scoping + error masking), Zod at the boundary, foreign ids
// read as not-found, `{ok:false}` service results surfaced as ToolError.
//
// KEY SAFETY: the user's Anthropic key is resolved INSIDE the runner per step
// and never crosses this layer — `cue_research` only does a fail-closed
// EXISTENCE check (the MCP analogue of the HTTP route's 402) so a keyless
// user's cue never creates a job that is doomed to fail inside the runner.
//
// CONSENT MODEL: cueing is non-destructive (the caller's own task, their own
// key) and the persistent write is gated AGAIN by `keep_research_notes`, which
// only ever persists the job's own server-stored result — so neither tool uses
// the delete_* confirm-token dance.
//
// RATE LIMITS: cue/keep share the SAME principal buckets as the HTTP routes
// (`research-cue:{userId}` / `research-keep:{userId}`), so a user's combined
// HTTP + MCP traffic draws from one budget. There is no client IP in the MCP
// tool context — the bearer token already pins the principal, so no IP tier.

// --- Shared validation -------------------------------------------------------

const uuid = z.string().uuid("Expected a UUID.");

/** Same bound as the HTTP route's CueResearchBody. */
const researchQuery = z.string().trim().min(1).max(280);

/**
 * Optional steering appended to the query the runner receives (e.g. "compare
 * options on specs and price; present as a comparison, not step-by-step").
 * A prompt-level nudge only — no engine change.
 */
const researchFocus = z.string().trim().min(1).max(500);

/** Same per-principal budgets as the HTTP routes. */
const CUE_LIMIT_PER_MINUTE = 20;
const KEEP_LIMIT_PER_MINUTE = 30;

const RUNNER_START_FAILED = "Couldn't start the research runner. Try again.";

/** Reserve one token from a principal bucket or throw a caller-visible error. */
async function limitOrThrow(key: string, limit: number): Promise<void> {
  const res = await rateLimiter.limit(key, { limit });
  if (!res.ok) {
    throw new ToolError(
      `Rate limit exceeded — try again in ${res.retryAfterSeconds}s.`,
    );
  }
}

// -----------------------------------------------------------------------------

/**
 * Register the research-delegate tool surface on `server`. Aggregated by
 * `registerOpsboardTools` in ../server.ts alongside the data tools.
 */
export function registerResearchTools(server: McpServer): void {
  server.registerTool(
    "cue_research",
    {
      title: "Cue research on a task",
      description:
        "Start an async AI research job for a task's open question. Returns a jobId immediately; poll get_research_job until it completes (typically well under 2 minutes). If the task already has a running job, that job is returned instead of starting a duplicate. Each cue spends the user's own Anthropic tokens (web-search synthesis + structuring), so cue deliberately. Optional `focus` steers the answer's shape (e.g. comparison vs step-by-step). Requires an Anthropic key configured in Settings.",
      inputSchema: {
        taskId: uuid,
        query: researchQuery,
        focus: researchFocus.optional(),
      },
    },
    async (args, extra) =>
      runTool({
        toolName: "cue_research",
        extra,
        // query/focus are not secrets — audit them (the key never enters scope).
        argsForAudit: args,
        handler: async (ctx) => {
          await limitOrThrow(
            `research-cue:${ctx.userId}`,
            CUE_LIMIT_PER_MINUTE,
          );

          // missionId is DERIVED from the task, never caller-supplied. A
          // foreign/unknown task reads as not-found (owner-scoped read).
          const task = await getTask(args.taskId, ctx.userId);
          if (!task) notFound("No task with that id.");

          // Fail CLOSED on the BYO key BEFORE any write (the MCP analogue of
          // the HTTP route's 402): never create a job row for a keyless user —
          // the failure would otherwise only surface inside the runner.
          try {
            await resolveAiKey(ctx.userId, "anthropic");
          } catch (err) {
            if (err instanceof NoAiKeyError) {
              throw new ToolError(
                "No Anthropic key configured — add one in Settings before cueing research.",
              );
            }
            throw err;
          }

          // Idempotency: at most one RUNNING job per task — return the
          // in-flight job rather than fanning out duplicate spend. (The DB's
          // partial unique index backstops the read-then-write race.)
          const existing = await getResearchJobsForTask(
            args.taskId,
            ctx.userId,
          );
          const running = existing.find((j) => j.state === "running");
          if (running) {
            return {
              jobId: running.id,
              taskId: args.taskId,
              state: "running" as const,
              alreadyRunning: true,
            };
          }

          // `focus` rides along as a suffix on the stored query — the runner's
          // synthesis prompt reads the whole string; no engine change.
          const query = args.focus
            ? `${args.query}\nFocus: ${args.focus}`
            : args.query;

          const res = await createResearchJob(
            { missionId: task!.missionId, taskId: args.taskId, query },
            ctx.userId,
          );
          if (!res.ok) throw new ToolError(res.error);

          // Fire the durable runner. If the enqueue fails the row would dangle
          // in `running` forever — fail it (best-effort) and surface cleanly.
          try {
            await inngest.send({
              name: "research/job.requested",
              data: { jobId: res.job.id, userId: ctx.userId },
            });
          } catch (err) {
            console.error("inngest.send research/job.requested failed", err);
            await updateResearchJob(res.job.id, ctx.userId, {
              state: "error",
              errorMessage: RUNNER_START_FAILED,
            }).catch(() => {});
            throw new ToolError(RUNNER_START_FAILED);
          }

          return {
            jobId: res.job.id,
            taskId: args.taskId,
            state: "running" as const,
            alreadyRunning: false,
          };
        },
      }),
  );

  server.registerTool(
    "get_research_job",
    {
      title: "Get a research job",
      description:
        "Poll a research job: its state (running | complete | error), live step log, and — once complete — the full cited result ({summary, steps[], sources[]}). Poll every ~5-8s with light backoff; on state=error re-cue rather than retrying blindly. Read-only.",
      inputSchema: { jobId: uuid },
    },
    async (args, extra) =>
      runTool({
        toolName: "get_research_job",
        extra,
        argsForAudit: args,
        handler: async (ctx) => {
          const job = await getResearchJob(args.jobId, ctx.userId);
          if (!job) notFound("No research job with that id.");
          // Same serialized shape the web UI polls — one mapper, no drift.
          return { job: toResearchJobView(job!) };
        },
      }),
  );

  server.registerTool(
    "list_research_jobs",
    {
      title: "List a task's research jobs",
      description:
        "All research jobs cued on a task, newest first (summaries only — fetch a job's steps/result via get_research_job). Lets a client re-attach to jobs it didn't track. Read-only.",
      inputSchema: { taskId: uuid },
    },
    async (args, extra) =>
      runTool({
        toolName: "list_research_jobs",
        extra,
        argsForAudit: args,
        handler: async (ctx) => {
          // Distinguish "no jobs yet" from "not your task": a foreign task
          // reads as not-found, matching every other tool.
          const task = await getTask(args.taskId, ctx.userId);
          if (!task) notFound("No task with that id.");
          const jobs = await getResearchJobsForTask(args.taskId, ctx.userId);
          return {
            taskId: args.taskId,
            jobs: jobs.map((j) => ({
              jobId: j.id,
              state: j.state,
              query: j.query,
              createdAt: j.createdAt.toISOString(),
              completedAt: j.completedAt ? j.completedAt.toISOString() : null,
            })),
            count: jobs.length,
          };
        },
      }),
  );

  server.registerTool(
    "keep_research_notes",
    {
      title: "Keep a research result as task notes",
      description:
        "Persist a COMPLETED research job's result to its task as a cited research note. The content stored is the job's own server-side result — never caller-supplied. Idempotent: keeping an already-kept job returns the existing note. Callers must surface/review the result (get_research_job) before keeping it — this call is the consent gate, like the UI's KEEP NOTES press.",
      inputSchema: { jobId: uuid },
    },
    async (args, extra) =>
      runTool({
        toolName: "keep_research_notes",
        extra,
        argsForAudit: args,
        handler: async (ctx) => {
          await limitOrThrow(
            `research-keep:${ctx.userId}`,
            KEEP_LIMIT_PER_MINUTE,
          );

          const job = await getResearchJob(args.jobId, ctx.userId);
          if (!job) notFound("No research job with that id.");
          if (job!.state !== "complete" || !job!.result) {
            throw new ToolError("This research isn't ready to keep yet.");
          }

          // Idempotency: already kept for THIS job → return the existing note.
          // (The DB's partial unique index on job_id backstops the race.)
          const existing = await getResearchNotes(job!.taskId, ctx.userId);
          const kept = existing.find((n) => n.jobId === args.jobId);
          if (kept) {
            return {
              ok: true,
              taskId: job!.taskId,
              jobId: args.jobId,
              noteId: kept.id,
              alreadyKept: true,
            };
          }

          // Persist the job's OWN result (re-validated inside appendResearchNote).
          const res = await appendResearchNote(
            { taskId: job!.taskId, jobId: args.jobId, content: job!.result },
            ctx.userId,
          );
          if (!res.ok) throw new ToolError(res.error);
          return {
            ok: true,
            taskId: job!.taskId,
            jobId: args.jobId,
            noteId: res.note.id,
            alreadyKept: false,
          };
        },
      }),
  );

  server.registerTool(
    "read_research_notes",
    {
      title: "Read kept research notes",
      description:
        "Read the kept (accepted) research notes. Pass exactly one of: `taskId` for the full cited note content on one task, or `missionId` for a per-task summary rollup (counts + latest job) across a mission. Read-only.",
      inputSchema: {
        taskId: uuid.optional(),
        missionId: uuid.optional(),
      },
    },
    async (args, extra) =>
      runTool({
        toolName: "read_research_notes",
        extra,
        argsForAudit: args,
        handler: async (ctx) => {
          if (Boolean(args.taskId) === Boolean(args.missionId)) {
            throw new ToolError(
              "Provide exactly one of taskId or missionId.",
            );
          }

          if (args.taskId) {
            const task = await getTask(args.taskId, ctx.userId);
            if (!task) notFound("No task with that id.");
            const notes = await getResearchNotes(args.taskId, ctx.userId);
            return {
              taskId: args.taskId,
              notes: notes.map((n) => ({
                noteId: n.id,
                jobId: n.jobId,
                createdAt: n.createdAt.toISOString(),
                content: n.content,
              })),
              count: notes.length,
            };
          }

          const mission = await getMission(args.missionId!, ctx.userId);
          if (!mission) notFound("No mission with that id.");
          const summaries = await getResearchNoteSummariesByMissionId(
            args.missionId!,
            ctx.userId,
          );
          return {
            missionId: args.missionId,
            summaries,
            count: summaries.length,
          };
        },
      }),
  );
}
