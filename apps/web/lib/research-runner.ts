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
// drives. Step 1 uses the Anthropic web_search/web_fetch server tools to research
// the confirmed query and synthesise a sourced answer (streamed + pause_turn-
// resumed so a multi-search turn doesn't hit the SDK's request timeout). Step 2
// reformats that prose into the validated ResearchResult JSON via a forced tool.
//
// Runs on the USER'S Anthropic key (BYO). NEVER logs the key; the key is passed
// in by the caller (the Inngest step resolves it locally so it's never persisted
// in Inngest step state).

/** Cap searches so one synthesis turn stays within the runner's time budget (and the user's spend). */
const MAX_SEARCHES = 5;
/** Bound the synthesis request so it fails cleanly before Vercel's function ceiling. */
const SYNTHESIS_TIMEOUT_MS = 50_000;
/** Resume cap for server-tool pause_turn loops. */
const MAX_RESUMES = 5;

export type RunResearchOutcome =
  | { ok: true; result: ResearchResult }
  | { ok: false; error: string };

// The forced tool step 2 emits — its shape mirrors ResearchResult; the raw input
// is Zod-validated against ResearchResult (incl. citation→source integrity).
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
 * Run a research job end-to-end on the caller's Anthropic key. Returns the
 * validated ResearchResult, or a client-safe error string — never throws the raw
 * SDK error at the boundary (the Inngest function records the error on the job).
 */
export async function runResearch(
  query: string,
  apiKey: string,
): Promise<RunResearchOutcome> {
  // Step 1 — web research + synthesis.
  let answer: string;
  try {
    answer = await synthesize(query, apiKey);
  } catch (err) {
    console.error("research synthesis failed", err);
    return { ok: false, error: "Research failed while searching the web." };
  }
  if (answer.trim().length === 0) {
    return { ok: false, error: "The research came back empty — try rephrasing." };
  }

  // Step 2 — structure the prose into validated JSON (cheap model, forced tool).
  const raw = await callForcedTool({
    apiKey,
    model: STRUCTURE_MODEL,
    system: researchStructurePrompt.system,
    userMessage: researchStructurePrompt.user(answer),
    tool: EMIT_RESEARCH_RESULT_TOOL,
    maxTokens: 4000,
  });
  const parsed = ResearchResult.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Couldn't structure the research findings." };
  }
  return { ok: true, result: parsed.data };
}

/** Step 1: stream a web_search-grounded synthesis, resuming on pause_turn. */
async function synthesize(query: string, apiKey: string): Promise<string> {
  const client = new Anthropic({ apiKey });
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: researchSynthesisPrompt.user(query) },
  ];

  let message: Anthropic.Message | null = null;
  for (let i = 0; i <= MAX_RESUMES; i++) {
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
      { timeout: SYNTHESIS_TIMEOUT_MS },
    );
    message = await stream.finalMessage();
    // Server-tool loop hit its iteration cap → re-send to resume (no extra user turn).
    if (message.stop_reason !== "pause_turn") break;
    messages.push({ role: "assistant", content: message.content });
  }

  if (!message) return "";
  return message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}
