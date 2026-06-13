import "server-only";

import type { ResearchStep } from "@opsboard/types";
import { getResearchJob, updateResearchJob } from "@opsboard/db/research";

import { inngest } from "../client";
import { resolveAiKey } from "@/lib/ai-key-resolver";
import { runResearch } from "@/lib/research-runner";

// The durable AI-Research runner. Triggered by `research/job.requested` (sent
// from /api/research on CUE RESEARCH), it runs server-to-server on Inngest —
// so it completes whether or not the user keeps the tab open ("come back later"
// works for free; the client polls the job row in Neon for progress).
//
// Each step.run runs inside a Vercel invocation (~60s on Hobby), so the heavy
// web-search synthesis is ONE bounded step; the user's Anthropic key is resolved
// INSIDE that step and never returned, so it is never persisted in Inngest step
// state. retries: 0 — research spends real tokens, so a failure surfaces on the
// job rather than silently re-running (the user can re-cue).

// Coarse step-log snapshots written to research_jobs.steps for the live UI.
const SEARCHING_STEPS: ResearchStep[] = [
  { state: "done", label: "Parsed intent" },
  { state: "done", label: "Identified task scope" },
  { state: "active", label: "Searching the web" },
  { state: "pending", label: "Drafting notes" },
  { state: "pending", label: "Ready to review" },
];
const DONE_STEPS: ResearchStep[] = [
  { state: "done", label: "Parsed intent" },
  { state: "done", label: "Identified task scope" },
  { state: "done", label: "Searched the web" },
  { state: "done", label: "Drafted notes" },
  { state: "done", label: "Ready to review" },
];

export const researchJob = inngest.createFunction(
  { id: "research-job", retries: 0 },
  { event: "research/job.requested" },
  async ({ event, step }) => {
    const { jobId, userId } = event.data;

    // Load the job (owner-scoped). Skip if it's gone or no longer running
    // (e.g. dismissed, or a duplicate event for an already-finished job).
    const job = await step.run("load-job", async () => {
      const j = await getResearchJob(jobId, userId);
      return j && j.state === "running"
        ? { query: j.query }
        : null;
    });
    if (!job) return { skipped: true };

    await step.run("mark-searching", () =>
      updateResearchJob(jobId, userId, { steps: SEARCHING_STEPS }),
    );

    // The heavy step: resolve the key LOCALLY (never returned → never persisted
    // by Inngest), run the two-step research, and return only the outcome.
    const outcome = await step.run("run-research", async () => {
      let apiKey: string;
      try {
        apiKey = await resolveAiKey(userId, "anthropic");
      } catch {
        return { ok: false as const, error: "No Anthropic key configured." };
      }
      return runResearch(job.query, apiKey);
    });

    if (!outcome.ok) {
      await step.run("fail", () =>
        updateResearchJob(jobId, userId, {
          state: "error",
          errorMessage: outcome.error,
        }),
      );
      return { ok: false };
    }

    await step.run("complete", () =>
      updateResearchJob(jobId, userId, {
        state: "complete",
        result: outcome.result,
        steps: DONE_STEPS,
      }),
    );
    return { ok: true };
  },
);
