import { describe, expect, it } from "vitest";
import { VoiceIntent, VoiceIntentName } from "@opsboard/types";
import { EMIT_INTENT_TOOL } from "../emit-intent-tool";

// DRIFT GUARD for the headline forced-tool bug: the model is steered by the
// tool's declared `properties`, so every field any VoiceIntent variant can carry
// MUST be advertised here — otherwise the model omits it and the .strict() Zod
// union rejects the result (the intermittent "couldn't parse" failure). If a new
// field is added to a union variant but not to EMIT_INTENT_TOOL, this fails.

// The discriminated union exposes its members via `.options`, each a ZodObject
// with a `.shape`. We read it structurally so this test needs no zod dependency.
type ZodObjectLike = { shape: Record<string, unknown> };
const unionMembers = (VoiceIntent as unknown as { options: ZodObjectLike[] })
  .options;

/** Every field name across all discriminated-union variants. */
function unionFieldNames(): Set<string> {
  const names = new Set<string>();
  for (const member of unionMembers) {
    for (const key of Object.keys(member.shape)) names.add(key);
  }
  return names;
}

describe("EMIT_INTENT_TOOL", () => {
  it("declares every VoiceIntent union field flat in its input_schema", () => {
    const declared = new Set(
      Object.keys(EMIT_INTENT_TOOL.input_schema.properties),
    );
    const missing = [...unionFieldNames()].filter((f) => !declared.has(f));
    expect(missing).toEqual([]);
  });

  it("keeps only the two universal fields structurally required", () => {
    // Per-intent requiredness is enforced by the discriminated Zod union, not by
    // this JSON schema — keeping the schema's `required` minimal lets the model
    // pick the right intent without being fought by a partial mirror.
    expect(EMIT_INTENT_TOOL.input_schema.required).toEqual([
      "intent",
      "confidence",
    ]);
  });

  it("offers exactly the union's intent discriminators", () => {
    const intentProp = EMIT_INTENT_TOOL.input_schema.properties.intent;
    expect(new Set(intentProp.enum)).toEqual(new Set(VoiceIntentName.options));
  });
});
