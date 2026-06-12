import { z } from "zod";

// @opsboard/types — AI Research (Task Agent) domain contracts.
//
// The research flow is the ONE place OpsBoard's voice layer WRITES: it appends
// AI-authored research notes to an existing task, behind TWO explicit consent
// gates (CUE RESEARCH before a job runs, KEEP NOTES before notes persist). These
// shapes are the serialized payloads those gates produce and consume — shared by
// @opsboard/db (the research_jobs.steps / research_jobs.result / task_research_
// notes.content jsonb columns), the web runner/route, and the UI view-models.
//
// A job runs async on a durable runner: it parses the confirmed intent, searches
// the web (on the user's own Anthropic key), reads sources, and drafts a summary
// with numbered steps + citations. Progress streams as a ResearchStep[] log; the
// finished work is a ResearchResult. NONE of it auto-commits — the user reviews
// the ResearchResult and explicitly keeps it (→ a task_research_notes row).

/**
 * Lifecycle of a research job. `running` spans the whole pipeline (parse →
 * search → read → draft → ready-to-keep); `complete`/`error` are terminal. There
 * is deliberately NO "fixed ETA" / percentage state — progress is communicated
 * by the step log + a monotonic elapsed timer, never a determinate bar.
 */
export const ResearchJobState = z.enum(["running", "complete", "error"]);
export type ResearchJobState = z.infer<typeof ResearchJobState>;

/** A live step-log row's state: not-yet-started, in-flight, or finished. */
export const ResearchStepState = z.enum(["pending", "active", "done"]);
export type ResearchStepState = z.infer<typeof ResearchStepState>;

/**
 * One row in the streaming LIVE STEP LOG (ResearchStepRow). The runner appends /
 * advances these as it works (e.g. "Searched the web" → done with meta "8
 * RESULTS"; "Reading source 3 of 6" → active with source "tankwatown.org").
 */
export const ResearchStep = z
  .object({
    label: z.string().min(1).max(200),
    state: ResearchStepState,
    /** Optional trailing meta on a done step, e.g. "8 RESULTS". */
    meta: z.string().max(120).optional(),
    /** Optional source hostname on an active step, e.g. "tankwatown.org". */
    source: z.string().max(200).optional(),
  })
  .strict();
export type ResearchStep = z.infer<typeof ResearchStep>;

/**
 * A source the research drew on. `index` is 1-based; ResearchNoteStep.citations
 * reference it. Rendered as a SourceRow (favicon + domain + title + open-link).
 */
export const ResearchSource = z
  .object({
    index: z.number().int().positive(),
    domain: z.string().min(1).max(253),
    title: z.string().max(500),
    url: z.string().url().max(2048),
  })
  .strict();
export type ResearchSource = z.infer<typeof ResearchSource>;

/**
 * One numbered note step (AINotesBlock). `citations` are 1-based indices into
 * the result's `sources[]` — the CitationChips rendered after the step text.
 */
export const ResearchNoteStep = z
  .object({
    index: z.number().int().positive(),
    text: z.string().min(1).max(2000),
    citations: z.array(z.number().int().positive()).max(50),
  })
  .strict();
export type ResearchNoteStep = z.infer<typeof ResearchNoteStep>;

/**
 * The structured result a completed job produces — the AINotesBlock payload and
 * the exact content persisted to a task_research_notes row on KEEP NOTES. The
 * runner validates the model's output against this before marking a job complete,
 * so a malformed draft can never be stored or shown.
 */
export const ResearchResult = z
  .object({
    summary: z.string().min(1).max(4000),
    steps: z.array(ResearchNoteStep).max(50),
    sources: z.array(ResearchSource).max(50),
  })
  .strict();
export type ResearchResult = z.infer<typeof ResearchResult>;

/** Note count shown in the AINotesBlock attribution row ("AI RESEARCH · N NOTES"). */
export function researchNoteCount(result: ResearchResult): number {
  return result.steps.length;
}
