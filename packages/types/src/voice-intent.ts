import { z } from "zod";

// @opsboard/types — VoiceIntent discriminated union (project_brief.md §3).
//
// The classifier (Claude Haiku 4.5, pinned in @opsboard/ai-prompts) returns a
// JSON object that MUST be validated against this union at the boundary before
// any mutation runs. Anything that does not match exactly safeParses to a typed
// FAILURE — it is NEVER silently coerced into a wrong intent or a partial
// mutation. Destructive intents (delete_*) are flagged via `isDestructive` and,
// together with low-confidence intents, must be confirmed before execution.

/** The exactly-10 OpsBoard voice intents (the `intent` discriminator values). */
export const VoiceIntentName = z.enum([
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
export type VoiceIntentName = z.infer<typeof VoiceIntentName>;

/** Stored task statuses (matches the DB CHECK constraint; `blocked` is computed, never stored). */
export const TaskStatusValue = z.enum(["done", "in-progress", "not-started"]);
export type TaskStatusValue = z.infer<typeof TaskStatusValue>;

// A non-empty, length-capped free-text field. Hints are fuzzy-matched by the
// classifier against the injected current-state snapshot; they must carry real
// content so the matcher has something to work with. The cap defends against a
// model echoing the whole prompt back into a single field.
const hint = z.string().trim().min(1).max(500);
const optionalHint = hint.optional();

/**
 * The intent confidence the classifier attaches to its own answer, 0..1.
 * Low-confidence answers must be routed to confirmation (see CONFIDENCE_FLOOR
 * and `needsConfirmation`), never auto-executed.
 */
export const confidence = z.number().min(0).max(1);

/**
 * Below this the intent is treated as low-confidence and MUST be confirmed
 * before execution (mirrors the destructive-action rule). The route layer owns
 * the threshold; this is the shared default the prompt is written against.
 */
export const CONFIDENCE_FLOOR = 0.6 as const;

export const VoiceIntent = z.discriminatedUnion("intent", [
  z
    .object({
      intent: z.literal("create_mission"),
      confidence,
      name: hint,
      targetDateHint: optionalHint,
    })
    .strict(),
  z
    .object({
      intent: z.literal("create_task"),
      confidence,
      missionHint: optionalHint,
      name: hint,
      categoryHint: optionalHint,
      tooLateByHint: optionalHint,
      notBeforeHint: optionalHint,
      dependsOnHints: z.array(hint).optional(),
    })
    .strict(),
  z
    .object({
      intent: z.literal("update_task_status"),
      confidence,
      taskHint: hint,
      status: TaskStatusValue,
    })
    .strict(),
  z
    .object({
      intent: z.literal("update_task"),
      confidence,
      taskHint: hint,
      field: hint,
      value: hint,
    })
    .strict(),
  z
    .object({
      intent: z.literal("add_dependency"),
      confidence,
      taskHint: hint,
      dependsOnHint: hint,
    })
    .strict(),
  z
    .object({
      intent: z.literal("remove_dependency"),
      confidence,
      taskHint: hint,
      dependsOnHint: hint,
    })
    .strict(),
  z
    .object({
      intent: z.literal("delete_task"),
      confidence,
      taskHint: hint,
    })
    .strict(),
  z
    .object({
      intent: z.literal("delete_mission"),
      confidence,
      missionHint: hint,
    })
    .strict(),
  z
    .object({
      intent: z.literal("query"),
      confidence,
      question: hint,
    })
    .strict(),
  z
    .object({
      intent: z.literal("unknown"),
      confidence,
      rawTranscript: z.string().max(5000),
    })
    .strict(),
]);
export type VoiceIntent = z.infer<typeof VoiceIntent>;

/** The destructive intents — these must always be confirmed, never auto-executed. */
export const DESTRUCTIVE_INTENTS = ["delete_task", "delete_mission"] as const;
export type DestructiveIntentName = (typeof DESTRUCTIVE_INTENTS)[number];

/**
 * True when an intent (or a bare intent name) mutates by deletion. Accepts both
 * a parsed `VoiceIntent` and a raw `VoiceIntentName` so callers can gate before
 * or after a full parse.
 */
export function isDestructive(intent: VoiceIntent | VoiceIntentName): boolean {
  const name = typeof intent === "string" ? intent : intent.intent;
  return (DESTRUCTIVE_INTENTS as readonly string[]).includes(name);
}

/**
 * True when an intent must be routed to user confirmation before execution:
 * either it is destructive, or its self-reported confidence is below the floor.
 */
export function needsConfirmation(
  intent: VoiceIntent,
  floor: number = CONFIDENCE_FLOOR,
): boolean {
  return isDestructive(intent) || intent.confidence < floor;
}

export type SafeParseIntentResult =
  | { ok: true; intent: VoiceIntent; needsConfirmation: boolean }
  | { ok: false; error: z.ZodError<unknown> };

/**
 * Validate raw classifier output against the VoiceIntent union and return a
 * typed result. On success the parsed intent is returned alongside a
 * pre-computed `needsConfirmation` flag; on any mismatch (truncated/null/wrong
 * type/out-of-range/extra prompt-echo field/wrong discriminator) it returns a
 * typed FAILURE — it never coerces unknown shapes into a valid intent.
 */
export function safeParseIntent(input: unknown): SafeParseIntentResult {
  const parsed = VoiceIntent.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error };
  }
  return {
    ok: true,
    intent: parsed.data,
    needsConfirmation: needsConfirmation(parsed.data),
  };
}
