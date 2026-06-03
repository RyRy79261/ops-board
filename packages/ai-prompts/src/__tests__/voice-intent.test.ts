import { describe, expect, it } from "vitest";
import {
  INTENT_CLASSIFIER_MODEL,
  OPSBOARD_WHISPER_PROMPT,
  PROMPT_VERSIONS,
  PROMPTED_INTENTS,
  voiceIntentPrompt,
} from "../voice-intent";
import { VoiceIntentName } from "@opsboard/types";

describe("voiceIntentPrompt", () => {
  it("system prompt describes every intent the union accepts", () => {
    // If a new intent is added to the @opsboard/types union but not the prompt,
    // the classifier would silently never emit it. Keep them in lockstep.
    for (const intent of VoiceIntentName.options) {
      expect(voiceIntentPrompt.system).toContain(intent);
    }
    expect(PROMPTED_INTENTS).toEqual(VoiceIntentName.options);
  });

  it("system prompt enforces the destructive + low-confidence safety rule", () => {
    expect(voiceIntentPrompt.system).toMatch(/never auto-executed/i);
    expect(voiceIntentPrompt.system).toMatch(/confirm/i);
    expect(voiceIntentPrompt.system).toMatch(/destructive/i);
    expect(voiceIntentPrompt.system).toMatch(/confidence/i);
  });

  it("system prompt names the five seeded categories", () => {
    for (const cat of ["medical", "bureaucratic", "travel", "gear", "tech"]) {
      expect(voiceIntentPrompt.system).toContain(cat);
    }
  });

  it("user message wraps snapshot + transcript in tags and embeds the snapshot JSON", () => {
    const out = voiceIntentPrompt.user("mark the cardiology follow-up done", {
      today: "2026-06-04",
      timezone: "Africa/Johannesburg",
      missions: [{ name: "AfrikaBurn", targetDate: "2026-04-27" }],
      tasks: [
        {
          name: "cardiology follow-up",
          mission: "AfrikaBurn",
          category: "medical",
          status: "not-started",
        },
      ],
      categories: ["medical", "bureaucratic", "travel", "gear", "tech"],
    });
    expect(out).toContain("<current_state>");
    expect(out).toContain("</current_state>");
    expect(out).toContain(
      "<transcript>\nmark the cardiology follow-up done\n</transcript>",
    );
    expect(out).toContain('"timezone":"Africa/Johannesburg"');
  });
});

describe("OPSBOARD_WHISPER_PROMPT", () => {
  it("stays under Whisper's ~224-token truncation limit", () => {
    // Rough token proxy: ~4 chars/token. 224 tokens ≈ 896 chars; assert a safe cap.
    expect(OPSBOARD_WHISPER_PROMPT.length).toBeLessThan(896);
  });

  it("is dense with the rare domain terms it must bias toward", () => {
    for (const term of [
      "AfrikaBurn",
      "cardiology",
      "Envivas",
      "VFS",
      "medical",
      "bureaucratic",
      "travel",
      "gear",
      "tech",
    ]) {
      expect(OPSBOARD_WHISPER_PROMPT).toContain(term);
    }
  });
});

describe("model + version pinning", () => {
  it("pins the classifier to Claude Haiku 4.5", () => {
    expect(INTENT_CLASSIFIER_MODEL).toBe("claude-haiku-4-5-20251001");
    expect(PROMPT_VERSIONS.intentClassifierModel).toBe(INTENT_CLASSIFIER_MODEL);
  });

  it("carries a versioned, non-empty prompt version", () => {
    expect(PROMPT_VERSIONS.voiceIntent).toMatch(/^\d{4}-\d{2}-\d{2}\.\d+$/);
    expect(PROMPT_VERSIONS.opsboardWhisper).toMatch(/^\d{4}-\d{2}-\d{2}\.\d+$/);
  });
});
