import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  getResearchJob,
  getResearchJobsForTask,
  getResearchNotes,
  getResearchNoteSummariesByMissionId,
} from "@opsboard/db/research";
import { getTask } from "@opsboard/db/tasks";
import { getMission } from "@opsboard/db/missions";
import {
  cueResearchForTask,
  keepResearchNotesForJob,
} from "@/lib/research-ops";
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
// The cue / keep FLOWS live in @/lib/research-ops (shared with the /api/v1
// REST surface — one implementation, two transports); this layer only maps
// outcome codes onto the MCP error vocabulary.
//
// KEY SAFETY: the user's Anthropic key is resolved INSIDE the runner per step
// and never crosses this layer — the cue flow only does a fail-closed
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

const uuid = z.uuid("Expected a UUID.");

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

          // The shared flow: ownership → fail-closed key check → idempotency →
          // context snapshot → create → enqueue (see @/lib/research-ops).
          // missionId is DERIVED from the task, never caller-supplied.
          const out = await cueResearchForTask(
            { taskId: args.taskId, query: args.query, focus: args.focus },
            ctx.userId,
          );
          if (!out.ok) {
            if (out.code === "not-found") notFound(out.error);
            throw new ToolError(out.error);
          }
          return {
            jobId: out.jobId,
            taskId: out.taskId,
            state: "running" as const,
            alreadyRunning: out.alreadyRunning,
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

          // Shared flow (see @/lib/research-ops): complete-only, idempotent
          // per job, persists the job's OWN server-stored result.
          const out = await keepResearchNotesForJob(args.jobId, ctx.userId);
          if (!out.ok) {
            if (out.code === "not-found") notFound(out.error);
            throw new ToolError(out.error);
          }
          return {
            ok: true,
            taskId: out.taskId,
            jobId: out.jobId,
            noteId: out.noteId,
            alreadyKept: out.alreadyKept,
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
