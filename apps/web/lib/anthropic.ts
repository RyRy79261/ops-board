import "server-only";

import Anthropic from "@anthropic-ai/sdk";

// ADAPTED from camp-404 apps/web/lib/anthropic.ts (scaffolding-plan.md S5),
// then REWIRED for OpsBoard BYO keys: the Anthropic client is built per-request
// from a key the caller RESOLVED for the session user
// (apps/web/lib/ai-key-resolver.ts) — NOT a process-wide env-keyed singleton.
// The route fails closed (402) before calling here when the user has no key, so
// there is no silent env path.
//
// MODEL DISCIPLINE: camp inlined a `MODELS` const here. OpsBoard pins model ids
// in @opsboard/ai-prompts instead (INTENT_CLASSIFIER_MODEL) — never inline an id
// in a route. So this file deliberately exposes NO model-id constant; the caller
// (the /api/voice/command route) passes the pinned id in. The helper structure
// mirrors lib/feedback-ai.ts: forced `tool_use`, temperature 0, ~30s timeout,
// fail-safe (any problem returns null so the route can fall back / error cleanly
// instead of throwing the raw SDK error at the boundary).

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
  /**
   * The per-request Anthropic key the route resolved for the SESSION user
   * (apps/web/lib/ai-key-resolver.ts). A fresh client is built per call so two
   * users never share a cached, env-keyed singleton.
   */
  apiKey: string;
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
 * Run a forced single-tool Claude call and return the raw `tool_use.input` (an
 * `unknown` the caller MUST validate with Zod — e.g. `safeParseIntent` from
 * @opsboard/types). THROWS on any SDK/API/timeout error and returns `null` only
 * on a clean "no matching tool_use block" outcome. Most callers want the
 * fail-safe `callForcedTool` wrapper instead; this strict form exists so a
 * caller that must distinguish a bad-KEY vendor 4xx from a model that simply
 * produced nothing (the setup dictation-test) can inspect the thrown error's
 * HTTP status. `temperature` is pinned to 0 for deterministic classification.
 */
/**
 * Opus 4.7+ and Fable/Mythos REJECT sampling params (temperature/top_p/top_k)
 * with a 400; everything else (Haiku, Sonnet, Opus ≤4.6) accepts them. We only
 * send `temperature: 0` (deterministic forced-tool extraction) where it's
 * accepted, so this same helper works whether the caller pins Haiku or Opus 4.8.
 */
function modelAcceptsSampling(model: string): boolean {
  return !/opus-4-(?:7|8)|fable|mythos/i.test(model);
}

export async function callForcedToolStrict(
  opts: ToolCallOptions,
): Promise<unknown | null> {
  const client = new Anthropic({ apiKey: opts.apiKey });
  const response = await client.messages.create(
    {
      model: opts.model,
      max_tokens: opts.maxTokens ?? 1024,
      ...(modelAcceptsSampling(opts.model) ? { temperature: 0 } : {}),
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
    return await callForcedToolStrict(opts);
  } catch (err) {
    // Never leak SDK internals to the boundary; the route maps null → a clean
    // "couldn't understand that" error.
    console.error("callForcedTool failed", err);
    return null;
  }
}
