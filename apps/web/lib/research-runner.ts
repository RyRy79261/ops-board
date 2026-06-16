import "server-only";

import Anthropic from "@anthropic-ai/sdk";

import { ResearchResult } from "@opsboard/types";
import {
  RESEARCH_MODEL,
  STRUCTURE_MODEL,
  researchSynthesisPrompt,
  researchStructurePrompt,
} from "@opsboard/ai-prompts";
import { callForcedTool, type ForcedTool } from "@/lib/anthropic";

// @opsboard/web research RUNNER — the two-step engine the M4 Inngest function
// drives as TWO SEPARATE steps (each its own ~60s Vercel invocation):
//   1. synthesizeResearch — uses the Anthropic web_search server tool to research
//      the confirmed query and synthesise a sourced answer (streamed + pause_turn-
//      resumed). Wall-budgeted so the whole step fits one invocation.
//   2. structureResearch — reformats that prose into the validated ResearchResult
//      JSON via a forced tool.
//
// Runs on the USER'S Anthropic key (BYO). NEVER logs the key; the key is passed
// in by the caller (the Inngest step resolves it locally so it's never persisted
// in Inngest step state). The synthesised prose IS returned (it's research
// content, not a secret) so it can cross the step boundary.

/** Cap searches so one synthesis turn stays within the runner's time budget (and the user's spend). */
const MAX_SEARCHES = 5;
/** Resume cap for server-tool pause_turn loops. */
const MAX_RESUMES = 5;
/**
 * Overall wall budget for the synthesis STEP. It runs in one Vercel invocation
 * (~60s Hobby), so the whole pause_turn loop — not each request — must fit here.
 * Each stream request is additionally capped, but never beyond the remaining
 * budget, so resumes can't blow past the invocation ceiling.
 */
const SYNTHESIS_BUDGET_MS = 52_000;
/** Per-request cap for a single synthesis stream (further clamped to the remaining budget). */
const SYNTHESIS_TIMEOUT_MS = 50_000;
/** The structure step is its OWN invocation; a tight bound that fits ~60s with headroom. */
const STRUCTURE_TIMEOUT_MS = 30_000;
/**
 * The structured JSON re-encodes the whole synthesis prose (field names, quoting,
 * URL escaping) so it is LARGER than the prose. Synthesis can accumulate prose
 * across up to MAX_RESUMES+1 turns (each up to 8k output tokens), so the structure
 * step's cap must clear that ceiling with headroom — at the old 8k it equalled a
 * SINGLE synthesis turn and truncated multi-turn prose mid-tool-call (→ invalid
 * JSON → ResearchResult parse failure → the job errored). This step runs in its
 * own ~60s invocation on Haiku, so tokens (not wall time) are the only constraint.
 */
const STRUCTURE_MAX_TOKENS = 16_000;

export type SynthesizeOutcome =
  | { ok: true; prose: string }
  | { ok: false; error: string };

export type RunResearchOutcome =
  | { ok: true; result: ResearchResult }
  | { ok: false; error: string };

// The forced tool the structure step emits — its shape mirrors ResearchResult;
// the raw input is Zod-validated against ResearchResult (incl. citation→source
// integrity).
const EMIT_RESEARCH_RESULT_TOOL: ForcedTool = {
  name: "emit_research_result",
  description:
    "Emit the structured research result: a summary, numbered steps with citations, and the sources.",
  input_schema: {
    type: "object",
    properties: {
      summary: { type: "string" },
      steps: {
        type: "array",
        items: {
          type: "object",
          properties: {
            index: { type: "number" },
            text: { type: "string" },
            citations: { type: "array", items: { type: "number" } },
          },
          required: ["index", "text", "citations"],
        },
      },
      sources: {
        type: "array",
        items: {
          type: "object",
          properties: {
            index: { type: "number" },
            domain: { type: "string" },
            title: { type: "string" },
            url: { type: "string" },
          },
          required: ["index", "domain", "title", "url"],
        },
      },
    },
    required: ["summary", "steps", "sources"],
  },
};

/**
 * Step 1 — web research + synthesis on the caller's Anthropic key. Returns the
 * sourced prose, or a client-safe error. Never throws at the boundary (the
 * Inngest step records the error on the job).
 */
export async function synthesizeResearch(
  query: string,
  apiKey: string,
): Promise<SynthesizeOutcome> {
  let prose: string;
  try {
    prose = await synthesize(query, apiKey);
  } catch (err) {
    console.error("research synthesis failed", err);
    return { ok: false, error: "Research failed while searching the web." };
  }
  if (prose.trim().length === 0) {
    return {
      ok: false,
      error: "The research came back empty — try rephrasing.",
    };
  }
  return { ok: true, prose };
}

/**
 * Step 2 — structure the synthesis prose into validated JSON (cheap model, forced
 * tool). Returns the validated ResearchResult or a client-safe error.
 */
export async function structureResearch(
  prose: string,
  apiKey: string,
): Promise<RunResearchOutcome> {
  const raw = await callForcedTool({
    apiKey,
    model: STRUCTURE_MODEL,
    system: researchStructurePrompt.system,
    userMessage: researchStructurePrompt.user(prose),
    tool: EMIT_RESEARCH_RESULT_TOOL,
    maxTokens: STRUCTURE_MAX_TOKENS,
    timeoutMs: STRUCTURE_TIMEOUT_MS,
  });
  const parsed = ResearchResult.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Couldn't structure the research findings." };
  }
  return { ok: true, result: parsed.data };
}

/**
 * Stream a web_search-grounded synthesis, resuming on pause_turn. Bounded by an
 * OVERALL wall budget (not just per-request) so the pause_turn loop fits a single
 * Vercel invocation. Text is accumulated across resumed turns so prose emitted
 * before a pause isn't lost. THROWS if the turn never completes within the budget
 * (so a truncated answer is never presented as a finished result).
 */
async function synthesize(query: string, apiKey: string): Promise<string> {
  const client = new Anthropic({ apiKey });
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: researchSynthesisPrompt.user(query) },
  ];

  const deadline = Date.now() + SYNTHESIS_BUDGET_MS;
  const texts: string[] = [];
  let completed = false;

  for (let i = 0; i <= MAX_RESUMES; i++) {
    const remaining = deadline - Date.now();
    if (remaining <= 1500) break; // out of budget — leave the step room to return
    const stream = client.messages.stream(
      {
        model: RESEARCH_MODEL,
        max_tokens: 8000,
        thinking: { type: "adaptive" },
        system: researchSynthesisPrompt.system,
        tools: [
          {
            type: "web_search_20250305",
            name: "web_search",
            max_uses: MAX_SEARCHES,
          },
        ],
        messages,
      },
      { timeout: Math.min(SYNTHESIS_TIMEOUT_MS, remaining) },
    );
    const message = await stream.finalMessage();
    // Accumulate this turn's text — prose can be emitted across resumed turns.
    for (const b of message.content) {
      if (b.type === "text") texts.push(b.text);
    }
    if (message.stop_reason !== "pause_turn") {
      completed = true;
      break;
    }
    // Server-tool loop paused → re-send to resume (no extra user turn).
    messages.push({ role: "assistant", content: message.content });
  }

  if (!completed) {
    // Ran out of resumes/budget while the turn was still paused — refuse to pass
    // a half-finished answer downstream as if it were complete.
    throw new Error("synthesis did not complete within the step budget");
  }

  return texts.join("\n").trim();
}
