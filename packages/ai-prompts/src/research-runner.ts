// @opsboard/ai-prompts — the AI Research RUNNER prompts (the M4 durable job).
//
// The runner is a TWO-STEP pipeline (structured output is incompatible with the
// web_search citation feature, so they can't share one call):
//   1. SYNTHESIS — a research-grade model uses the web_search/web_fetch server
//      tools to research the confirmed query and write an actionable answer +
//      a SOURCES list, in prose.
//   2. STRUCTURE — a cheap model converts that prose into the ResearchResult
//      JSON (summary + numbered steps + citations + sources) via a forced tool.
//
// MODEL DISCIPLINE (project_brief.md §3): ids are PINNED, versioned constants.
//
// COST LEVER: the synthesis call runs web_search on the USER'S OWN Anthropic key,
// so the model choice is their per-job spend. Set to Opus 4.8 — the strongest
// synthesis + reasoning, for the best research depth. Drop RESEARCH_MODEL to
// "claude-sonnet-4-6" (~1/3 cost) or "claude-haiku-4-5" (cheapest, fastest — and
// most likely to finish within the ~60s step budget) to trade depth for spend.
// The structure step is a cheap mechanical reformat → Haiku.

export const RESEARCH_MODEL = "claude-opus-4-8" as const;
export type ResearchModel = typeof RESEARCH_MODEL;

export const STRUCTURE_MODEL = "claude-haiku-4-5" as const;
export type StructureModel = typeof STRUCTURE_MODEL;

/**
 * Step 1 — the web-research synthesis prompt. The model is given the web_search
 * server tool and must ground its answer in real sources, then list them so
 * step 2 can structure them (we read the SOURCES from the prose rather than
 * parsing the citation blocks).
 */
export const researchSynthesisPrompt = {
  system: `You are OpsBoard's research agent. Use the web_search tool to research the user's question thoroughly, then write a clear, actionable answer grounded in what you actually found.

Produce, in this order:
1. A short SUMMARY — 2–4 sentences answering the question.
2. STEPS — the concrete actions the user should take, as a numbered list, in order. Each item is a single actionable instruction (real offices, forms, requirements, URLs where relevant).
3. A "SOURCES" section — every page you genuinely drew on, one per line as "Title — https://full-url". List only sources you actually used.

Rules:
- Search before answering; base the answer on current, real sources, not memory alone.
- Be specific and practical. For a process (permits, applications, bookings), give the real steps and where to do them.
- If you cannot find reliable information, say so plainly — do not invent steps, offices, or URLs.`,

  /** The confirmed research query (already reviewed by the user via CUE RESEARCH). */
  user: (query: string) =>
    `Research this and produce an actionable answer with sources:\n\n${query}`,
} as const;

/**
 * Step 2 — convert the synthesis prose into the ResearchResult JSON via the
 * forced emit_research_result tool. No web_search here, so structured output is
 * fine. The output is Zod-validated against ResearchResult at the boundary.
 */
export const researchStructurePrompt = {
  system: `You convert a research write-up into a structured JSON object via the emit_research_result tool. Return the tool call only — no prose.

From the provided answer, extract:
- summary: the SUMMARY paragraph (prose).
- steps: the numbered actionable steps, in order. Each: index (1-based), text (the single instruction), citations (an array of 1-based indices into "sources" that back this step; [] if unclear).
- sources: the SOURCES list, in the order listed. Each: index (1-based), domain (hostname only, e.g. "capenature.co.za"), title, url.

Rules:
- Preserve the author's steps, wording, and ordering; do NOT invent steps or sources.
- Every citation index MUST reference an existing source (1..sources.length); when unsure, use [].
- If the answer has no usable steps or sources, return them as empty arrays with the summary.`,

  user: (answer: string) => `Structure this research answer:\n\n${answer}`,
} as const;

/** Versioned templates + pinned model ids (bump on any meaningful change). */
export const RESEARCH_RUNNER_PROMPT_VERSIONS = {
  researchSynthesis: "2026-06-13.1",
  researchStructure: "2026-06-13.1",
  researchModel: RESEARCH_MODEL,
  structureModel: STRUCTURE_MODEL,
} as const;
export type ResearchRunnerPromptVersions = typeof RESEARCH_RUNNER_PROMPT_VERSIONS;
