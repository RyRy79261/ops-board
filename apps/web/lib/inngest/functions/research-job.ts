import "server-only";

import type { ResearchStep } from "@opsboard/types";
import { getResearchJob, updateResearchJob } from "@opsboard/db/research";

import { inngest } from "../client";
import { resolveAiKey } from "@/lib/ai-key-resolver";
import { synthesizeResearch, structureResearch } from "@/lib/research-runner";

// The durable AI-Research runner. Triggered by `research/job.requested` (sent
// from /api/research on CUE RESEARCH), it runs server-to-server on Inngest —
// so it completes whether or not the user keeps the tab open ("come back later"
// works for free; the client polls the job row in Neon for progress).
//
// SYNTHESIS and STRUCTURE are SEPARATE steps so each gets its own ~60s Vercel
// (Hobby) invocation — the heavy web-search synthesis is wall-budgeted to fit one
// invocation, and the structure step gets a fresh one. The user's Anthropic key
// is resolved INSIDE each step and never returned, so it is never persisted in
// Inngest step state; only the (non-secret) synthesised prose crosses the
// boundary. retries: 0 — research spends real tokens, so a failure surfaces on
// the job rather than silently re-running (the user can re-cue). `onFailure`
// guarantees a terminal transition: if a step is killed/throws (e.g. an
// over-budget invocation), a still-`running` row is flipped to `error` so the
// live UI never polls a stranded job forever.

// Coarse step-log snapshots written to research_jobs.steps for the live UI.
const SEARCHING_STEPS: ResearchStep[] = [
  { state: "done", label: "Parsed intent" },
  { state: "done", label: "Identified task scope" },
  { state: "active", label: "Searching the web" },
  { state: "pending", label: "Drafting notes" },
  { state: "pending", label: "Ready to review" },
];
const DRAFTING_STEPS: ResearchStep[] = [
  { state: "done", label: "Parsed intent" },
  { state: "done", label: "Identified task scope" },
  { state: "done", label: "Searched the web" },
  { state: "active", label: "Drafting notes" },
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
  {
    id: "research-job",
    retries: 0,
    // Backstop: a killed/throwing step never reaches the `fail` step below, so
    // flip any still-running row to `error` rather than leaving it stranded.
    onFailure: async ({ event, step }) => {
      const data = event.data.event.data as
        | { jobId?: string; userId?: string }
        | undefined;
      const jobId = data?.jobId;
      const userId = data?.userId;
      if (!jobId || !userId) return;
      await step.run("mark-failed", async () => {
        const j = await getResearchJob(jobId, userId);
        if (!j || j.state !== "running") return { skipped: true };
        return updateResearchJob(jobId, userId, {
          state: "error",
          errorMessage: "Research stopped unexpectedly — try cueing it again.",
        });
      });
    },
  },
  { event: "research/job.requested" },
  async ({ event, step }) => {
    const { jobId, userId } = event.data;

    // Load the job (owner-scoped). Skip if it's gone or no longer running
    // (e.g. dismissed, or a duplicate event for an already-finished job).
    const job = await step.run("load-job", async () => {
      const j = await getResearchJob(jobId, userId);
      return j && j.state === "running" ? { query: j.query } : null;
    });
    if (!job) return { skipped: true };

    await step.run("mark-searching", () =>
      updateResearchJob(jobId, userId, { steps: SEARCHING_STEPS }),
    );

    // Step 1 — synthesis. Key resolved LOCALLY (never returned → never persisted
    // by Inngest); only the non-secret prose is returned across the boundary.
    const synth = await step.run("synthesize", async () => {
      let apiKey: string;
      try {
        apiKey = await resolveAiKey(userId, "anthropic");
      } catch {
        return { ok: false as const, error: "No Anthropic key configured." };
      }
      return synthesizeResearch(job.query, apiKey);
    });
    if (!synth.ok) {
      await step.run("fail", () =>
        updateResearchJob(jobId, userId, {
          state: "error",
          errorMessage: synth.error,
        }),
      );
      return { ok: false };
    }

    await step.run("mark-drafting", () =>
      updateResearchJob(jobId, userId, { steps: DRAFTING_STEPS }),
    );

    // Step 2 — structure the prose into validated JSON (its own invocation).
    const outcome = await step.run("structure", async () => {
      let apiKey: string;
      try {
        apiKey = await resolveAiKey(userId, "anthropic");
      } catch {
        return { ok: false as const, error: "No Anthropic key configured." };
      }
      return structureResearch(synth.prose, apiKey);
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
