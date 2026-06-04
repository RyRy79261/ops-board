import { describe, expect, it } from "vitest";
import {
  CONFIDENCE_FLOOR,
  DESTRUCTIVE_INTENTS,
  VoiceIntent,
  VoiceIntentName,
  isDestructive,
  needsConfirmation,
  safeParseIntent,
  type VoiceIntent as VoiceIntentT,
} from "../voice-intent";

// ---------------------------------------------------------------------------
// Schema shape
// ---------------------------------------------------------------------------

describe("VoiceIntent union shape", () => {
  it("enumerates EXACTLY the 10 OpsBoard intents", () => {
    expect(VoiceIntentName.options).toEqual([
      "create_mission",
      "create_task",
      "update_task_status",
      "update_task",
      "add_dependency",
      "remove_dependency",
      "delete_task",
      "delete_mission",
      "query",
      "unknown",
    ]);
    expect(VoiceIntentName.options).toHaveLength(10);
  });

  it("marks only delete_* as destructive", () => {
    expect([...DESTRUCTIVE_INTENTS]).toEqual(["delete_task", "delete_mission"]);
    for (const name of VoiceIntentName.options) {
      const destructive = name === "delete_task" || name === "delete_mission";
      expect(isDestructive(name)).toBe(destructive);
    }
  });
});

// ---------------------------------------------------------------------------
// Valid sample of EACH intent parses to the right discriminator
// ---------------------------------------------------------------------------

const validSamples: Array<{
  name: VoiceIntentName;
  input: Record<string, unknown>;
}> = [
  {
    name: "create_mission",
    input: {
      intent: "create_mission",
      confidence: 0.9,
      name: "AfrikaBurn",
      targetDateHint: "2026-04-27",
    },
  },
  {
    name: "create_task",
    input: {
      intent: "create_task",
      confidence: 0.82,
      missionHint: "AfrikaBurn",
      name: "Book Tankwa shuttle",
      categoryHint: "travel",
      tooLateByHint: "2026-04-20",
      notBeforeHint: "2026-02-01",
      dependsOnHints: ["Confirm leave", "Pay camp dues"],
    },
  },
  {
    name: "update_task_status",
    input: {
      intent: "update_task_status",
      confidence: 0.95,
      taskHint: "cardiology follow-up",
      status: "done",
    },
  },
  {
    name: "update_task",
    input: {
      intent: "update_task",
      confidence: 0.7,
      taskHint: "VFS appointment",
      field: "tooLateBy",
      value: "2026-03-15",
    },
  },
  {
    name: "add_dependency",
    input: {
      intent: "add_dependency",
      confidence: 0.88,
      taskHint: "Apply for Schengen visa",
      dependsOnHint: "Get Envivas insurance letter",
    },
  },
  {
    name: "remove_dependency",
    input: {
      intent: "remove_dependency",
      confidence: 0.77,
      taskHint: "Apply for Schengen visa",
      dependsOnHint: "Get Envivas insurance letter",
    },
  },
  {
    name: "delete_task",
    input: {
      intent: "delete_task",
      confidence: 0.99,
      taskHint: "duplicate gear list",
    },
  },
  {
    name: "delete_mission",
    input: {
      intent: "delete_mission",
      confidence: 0.99,
      missionHint: "old test mission",
    },
  },
  {
    name: "query",
    input: {
      intent: "query",
      confidence: 0.9,
      question: "what's blocking me on AfrikaBurn?",
    },
  },
  {
    name: "unknown",
    input: {
      intent: "unknown",
      confidence: 0.2,
      rawTranscript: "uhh hang on what was I... [inaudible]",
    },
  },
];

describe("valid samples parse to a typed success", () => {
  it.each(validSamples)("parses $name", ({ name, input }) => {
    const result = safeParseIntent(input);
    expect(result.ok).toBe(true);
    if (!result.ok) return; // narrow for type-checker
    expect(result.intent.intent).toBe(name);
  });

  it("covers every intent in the union exactly once", () => {
    expect(validSamples.map((s) => s.name).sort()).toEqual(
      [...VoiceIntentName.options].sort(),
    );
  });

  it("parses optional fields away when omitted (create_task minimal)", () => {
    const result = safeParseIntent({
      intent: "create_task",
      confidence: 0.8,
      name: "Pack the tent",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    if (result.intent.intent !== "create_task") {
      throw new Error("wrong discriminator");
    }
    expect(result.intent.missionHint).toBeUndefined();
    expect(result.intent.dependsOnHints).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Confirmation / destructive routing
// ---------------------------------------------------------------------------

describe("needsConfirmation routing", () => {
  it("flags destructive intents even at full confidence", () => {
    const del = VoiceIntent.parse({
      intent: "delete_mission",
      confidence: 1,
      missionHint: "AfrikaBurn",
    });
    expect(needsConfirmation(del)).toBe(true);
    expect(
      safeParseIntent({
        intent: "delete_task",
        confidence: 1,
        taskHint: "x",
      }),
    ).toMatchObject({ ok: true, needsConfirmation: true });
  });

  it("flags low-confidence non-destructive intents", () => {
    const low = VoiceIntent.parse({
      intent: "create_mission",
      confidence: CONFIDENCE_FLOOR - 0.01,
      name: "maybe a trip?",
    });
    expect(needsConfirmation(low)).toBe(true);
  });

  it("does NOT flag a confident non-destructive intent", () => {
    const ok = VoiceIntent.parse({
      intent: "update_task_status",
      confidence: 0.95,
      taskHint: "cardiology follow-up",
      status: "in-progress",
    });
    expect(needsConfirmation(ok)).toBe(false);
    const res = safeParseIntent({
      intent: "query",
      confidence: 0.9,
      question: "what closes this week?",
    });
    expect(res).toMatchObject({ ok: true, needsConfirmation: false });
  });

  it("flags an `unknown` intent even at full confidence (never auto-act)", () => {
    const unknown = VoiceIntent.parse({
      intent: "unknown",
      confidence: 0.99,
      rawTranscript: "uh, do the thing with the stuff",
    });
    expect(needsConfirmation(unknown)).toBe(true);
    const res = safeParseIntent({
      intent: "unknown",
      confidence: 0.99,
      rawTranscript: "garbled",
    });
    expect(res).toMatchObject({ ok: true, needsConfirmation: true });
  });
});

// ---------------------------------------------------------------------------
// ADVERSARIAL-JSON boundary table (the dossier's adversarial-JSON requirement).
// EACH case must safeParse to a typed FAILURE — never silently coerce into a
// wrong intent or a partial/wrong mutation.
// ---------------------------------------------------------------------------

const adversarial: Array<{ label: string; input: unknown }> = [
  {
    label: "truncated JSON object (parsed by JSON.parse but missing fields)",
    // Simulates a model that began emitting delete_mission then got cut off:
    // the dangerous discriminator survives but its required hint does not.
    input: { intent: "delete_mission", confidence: 0.99 },
  },
  {
    label: "raw truncated JSON string (never reaches the schema as an object)",
    input: '{"intent":"delete_task","confidence":0.9,"taskHi',
  },
  {
    label: "null required field (taskHint null)",
    input: {
      intent: "update_task_status",
      confidence: 0.9,
      taskHint: null,
      status: "done",
    },
  },
  {
    label: "null confidence",
    input: { intent: "query", confidence: null, question: "what's blocked?" },
  },
  {
    label: "wrong type — confidence as string",
    input: { intent: "create_mission", confidence: "high", name: "AfrikaBurn" },
  },
  {
    label: "wrong type — name as number",
    input: { intent: "create_mission", confidence: 0.9, name: 42 },
  },
  {
    label: "wrong type — dependsOnHints not an array",
    input: {
      intent: "create_task",
      confidence: 0.8,
      name: "x",
      dependsOnHints: "Confirm leave",
    },
  },
  {
    label: "out-of-range confidence > 1",
    input: { intent: "query", confidence: 1.5, question: "ok?" },
  },
  {
    label: "out-of-range confidence < 0",
    input: { intent: "query", confidence: -0.2, question: "ok?" },
  },
  {
    label: "empty-string required hint",
    input: { intent: "delete_task", confidence: 0.9, taskHint: "" },
  },
  {
    label: "whitespace-only required hint (trim → empty)",
    input: { intent: "delete_mission", confidence: 0.9, missionHint: "   " },
  },
  {
    label: "invalid status enum value",
    input: {
      intent: "update_task_status",
      confidence: 0.9,
      taskHint: "x",
      status: "blocked",
    },
  },
  {
    label: "extra prompt-echo field (model leaked the system prompt back)",
    input: {
      intent: "query",
      confidence: 0.9,
      question: "what closes this week?",
      systemPrompt: "You convert a short spoken transcript...",
    },
  },
  {
    label: "wrong 'intent' discriminator (not in the union)",
    input: { intent: "drop_database", confidence: 0.9, taskHint: "x" },
  },
  {
    label: "missing 'intent' discriminator entirely",
    input: { confidence: 0.9, taskHint: "x", status: "done" },
  },
  {
    label: "intent as wrong type (number)",
    input: { intent: 7, confidence: 0.9 },
  },
  {
    label: "top-level not an object (array)",
    input: [{ intent: "query", confidence: 0.9, question: "ok?" }],
  },
  {
    label: "top-level null",
    input: null,
  },
  {
    label: "top-level string",
    input: "delete everything",
  },
  {
    label: "fields from another intent under wrong discriminator",
    // create_mission shape carrying delete_task's taskHint — strict object must
    // reject the foreign field rather than coerce toward a deletion.
    input: {
      intent: "create_mission",
      confidence: 0.9,
      name: "AfrikaBurn",
      taskHint: "wipe it",
    },
  },
];

describe("adversarial JSON → typed FAILURE (never a wrong mutation)", () => {
  it.each(adversarial)("rejects: $label", ({ input }) => {
    const result = safeParseIntent(input);
    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error("adversarial input must not parse to a valid intent");
    }
    // A typed ZodError, not a thrown exception and not a coerced intent.
    expect(result.error.issues.length).toBeGreaterThan(0);
  });

  it("a string is never silently coerced — caller must JSON.parse first", () => {
    // The dangerous failure mode: a truncated/garbage string being treated as a
    // command. safeParseIntent on a string fails closed.
    const danger = safeParseIntent('{"intent":"delete_mission"');
    expect(danger.ok).toBe(false);
  });

  it("never produces a destructive intent from a malformed delete payload", () => {
    // Even when the malformed input *names* a destructive intent, the result is
    // a failure — so no delete can be auto-executed off bad JSON.
    for (const { input } of adversarial) {
      const result = safeParseIntent(input);
      expect(result.ok).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
// Type-level guard: the success branch is a fully discriminated VoiceIntent.
// ---------------------------------------------------------------------------

describe("typed result narrows correctly", () => {
  it("exposes intent-specific fields after discriminating", () => {
    const result = safeParseIntent({
      intent: "add_dependency",
      confidence: 0.9,
      taskHint: "Apply for Schengen visa",
      dependsOnHint: "Get Envivas insurance letter",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const intent: VoiceIntentT = result.intent;
    if (intent.intent === "add_dependency") {
      expect(intent.dependsOnHint).toBe("Get Envivas insurance letter");
    } else {
      throw new Error("expected add_dependency");
    }
  });
});
