import "server-only";

import Anthropic from "@anthropic-ai/sdk";

// ADAPTED from camp-404 apps/web/lib/anthropic.ts (scaffolding-plan.md S5).
// Lazy Anthropic client + a generic forced-tool_use call helper.
//
// MODEL DISCIPLINE: camp inlined a `MODELS` const here. OpsBoard pins model ids
// in @opsboard/ai-prompts instead (INTENT_CLASSIFIER_MODEL) — never inline an id
// in a route. So this file deliberately exposes NO model-id constant; the caller
// (the /api/voice/command route) passes the pinned id in. The helper structure
// mirrors lib/feedback-ai.ts: forced `tool_use`, temperature 0, ~30s timeout,
// fail-safe (any problem returns null so the route can fall back / error cleanly
// instead of throwing the raw SDK error at the boundary).

let client: Anthropic | null = null;

/** Lazy singleton Anthropic client. Throws only if the key is missing. */
export function anthropic(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not set");
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

/** A single forced-tool definition, in the shape the Anthropic SDK expects. */
export interface ForcedTool {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface ToolCallOptions {
  /** Pinned model id — pass INTENT_CLASSIFIER_MODEL from @opsboard/ai-prompts. */
  model: string;
  /** System prompt (the classifier instructions). */
  system: string;
  /** The single user message (transcript + server-built state snapshot). */
  userMessage: string;
  /** The one tool the model is FORCED to call. */
  tool: ForcedTool;
  /** Defaults to 1024 — an intent object is small. */
  maxTokens?: number;
  /** Request timeout in ms. Defaults to 30_000 (matches feedback-ai.ts). */
  timeoutMs?: number;
}

/**
 * Run a forced single-tool Claude call and return the raw `tool_use.input`
 * (an `unknown` the caller MUST validate with Zod — e.g. `safeParseIntent`
 * from @opsboard/types). Fail-safe: returns `null` on a missing key, an API
 * error, a timeout, or no matching tool_use block — the route turns `null`
 * into a clean error response (never a leaked SDK stack, never a wrong
 * mutation). `temperature` is pinned to 0 for deterministic classification.
 */
export async function callForcedTool(
  opts: ToolCallOptions,
): Promise<unknown | null> {
  try {
    const response = await anthropic().messages.create(
      {
        model: opts.model,
        max_tokens: opts.maxTokens ?? 1024,
        temperature: 0,
        system: opts.system,
        tools: [opts.tool],
        tool_choice: { type: "tool", name: opts.tool.name },
        messages: [{ role: "user", content: opts.userMessage }],
      },
      { timeout: opts.timeoutMs ?? 30_000 },
    );

    const block = response.content.find(
      (b) => b.type === "tool_use" && b.name === opts.tool.name,
    );
    if (!block || block.type !== "tool_use") return null;
    return block.input;
  } catch (err) {
    // Never leak SDK internals to the boundary; the route maps null → a clean
    // "couldn't understand that" error.
    console.error("callForcedTool failed", err);
    return null;
  }
}
