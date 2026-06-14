import { describe, expect, it } from "vitest";
import { modelAcceptsSampling } from "@/lib/anthropic";

// modelAcceptsSampling decides whether `temperature: 0` is sent. Sending it to a
// model that rejects sampling is a hard 400, so this regex is security-adjacent;
// lock its behavior — especially the fail-safe default for unknown models.

describe("modelAcceptsSampling", () => {
  it("accepts sampling for Haiku / Sonnet / Opus ≤4.6", () => {
    for (const m of [
      "claude-haiku-4-5",
      "claude-haiku-4-5-20251001",
      "claude-sonnet-4-6",
      "claude-opus-4-6",
      "claude-opus-4-0",
    ]) {
      expect(modelAcceptsSampling(m)).toBe(true);
    }
  });

  it("omits sampling for Opus 4.7+ and Fable/Mythos (they 400 on it)", () => {
    for (const m of [
      "claude-opus-4-7",
      "claude-opus-4-8",
      "claude-fable-5",
      "claude-mythos-5",
    ]) {
      expect(modelAcceptsSampling(m)).toBe(false);
    }
  });

  it("fails SAFE for unknown/future models — omits sampling by default", () => {
    // The whole reason this is an allowlist: an unknown model must NOT be sent
    // temperature (a 400), it should just run non-deterministically.
    for (const m of ["claude-opus-4-9", "claude-opus-4-60", "claude-opus-5", "some-new-model"]) {
      expect(modelAcceptsSampling(m)).toBe(false);
    }
  });
});
