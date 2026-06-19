import "server-only";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-middleware";
import { transcribeAudio } from "@/lib/groq";
import { callForcedToolStrict } from "@/lib/anthropic";
import { resolveAiKey } from "@/lib/ai-key-resolver";
import { aiKeyErrorResponse } from "@/app/api/_shared/ai-error-response";
import { vendorErrorResponse } from "@/app/api/_shared/vendor-errors";

import { safeParseIntent, type VoiceIntent } from "@opsboard/types";
import {
  voiceIntentPrompt,
  OPSBOARD_WHISPER_PROMPT,
  INTENT_CLASSIFIER_MODEL,
  EMIT_INTENT_TOOL,
  type VoiceStateSnapshot,
} from "@opsboard/ai-prompts";
import { z } from "zod";

/**
 * POST /api/setup/dictation-test — the setup-wizard "try your keys" step.
 *
 * EPHEMERAL by design: it runs the SAME transcribe→classify pipeline the voice
 * route uses (so finishing the wizard proves both keys actually work), but it
 * SAVES NOTHING — no db writes, no executeIntent, no revalidate. It returns a
 * preview { transcript, example } where `example` is a short human rendering of
 * the PARSED intent so the user sees what their words WOULD have done, without
 * any mutation happening.
 *
 * Auth: withAuth (verified session principal). Keys: PURE BYO via resolveAiKey
 * (the userId-only resolver — no env fallback). FAIL CLOSED:
 *   - No stored key for a provider → 402 NO_AI_KEY (the user is sent to finish
 *     adding keys). Reuses the shared aiKeyErrorResponse helper.
 *   - A vendor auth/4xx (a bad/rejected key) → a clear 400 telling the user to
 *     re-check THAT provider's key. The raw key is NEVER echoed.
 *
 * Request: multipart/form-data { audio: File, tz?: string } — the same shape the
 * voice route accepts (shape A). Audio must be audio/* and ≤ 10 MB.
 * Response: { transcript: string, example: string }.
 */

export const runtime = "nodejs"; // Groq + Anthropic SDKs + node:crypto (key-vault).

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB — matches the voice route.
const DEFAULT_TZ = "UTC";

// The browser-supplied IANA tz — Zod-validated at the boundary (shape) before
// the runtime Intl validity check in sanitizeTz.
const TzSchema = z.string().trim().min(1).max(64);

// The emit_intent forced tool is SHARED from @opsboard/ai-prompts — the SAME
// constant the production voice route uses, so the "try your keys" step exercises
// the exact classifier contract that production does (these used to be two
// inlined copies that drifted).

interface DictationTestResponse {
  transcript: string;
  example: string;
}

// Vendor (Groq/Anthropic) SDK errors → distinct HTTP statuses (bad key→400,
// rate-limit→429, timeout→504, else→502) via the SHARED helper the production
// voice route also uses (these once had their own copy here).

export const POST = withAuth(async (request, { userId }) => {
  // --- Parse the multipart audio (same shape as the voice route) -----------
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  // The multipart `audio` File is validated with explicit guards (not a single
  // Zod parse) so each failure keeps its correct HTTP status — 400 missing /
  // 415 unsupported media / 413 too large — which a collapsed Zod error can't
  // express. The free-form text input (tz) IS Zod-validated (sanitizeTz).
  const file = form.get("audio");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing `audio` file" }, { status: 400 });
  }
  if (!file.type.startsWith("audio/")) {
    return NextResponse.json({ error: "File must be audio/*" }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Audio too large" }, { status: 413 });
  }

  const tz = sanitizeTz(form.get("tz"));

  // --- Resolve the Groq key (PURE BYO) → 402 if none stored ----------------
  let groqKey: string;
  try {
    groqKey = await resolveAiKey(userId, "groq");
  } catch (err) {
    const failClosed = aiKeyErrorResponse(err);
    if (failClosed) return failClosed;
    throw err;
  }

  // --- Transcribe (Groq Whisper). A bad key → 400, never a leaked key. ------
  let transcript: string;
  try {
    transcript = (
      await transcribeAudio(file, groqKey, { prompt: OPSBOARD_WHISPER_PROMPT })
    ).trim();
  } catch (err) {
    console.error("[setup/dictation-test] transcription error", err);
    return vendorErrorResponse(err, {
      provider: "groq",
      fallbackMessage: "Couldn't transcribe that audio. Try again.",
    });
  }

  if (transcript.length === 0) {
    return NextResponse.json(
      { error: "I didn't catch that — try again." },
      { status: 400 },
    );
  }

  // --- Resolve the Anthropic key (PURE BYO) → 402 if none stored -----------
  let anthropicKey: string;
  try {
    anthropicKey = await resolveAiKey(userId, "anthropic");
  } catch (err) {
    const failClosed = aiKeyErrorResponse(err);
    if (failClosed) return failClosed;
    throw err;
  }

  // --- Classify via Claude. The classifier is EPHEMERAL here: no snapshot is
  //     built from the DB (we never touch the user's data), so hints stay as
  //     the spoken phrases. We use the STRICT variant so a bad-KEY vendor 4xx
  //     THROWS (→ a clear 400) rather than being swallowed to null like the
  //     fail-safe callForcedTool does; a clean "no tool_use" outcome still
  //     returns null (handled below as an unusable-but-keys-work preview).
  let raw: unknown | null;
  try {
    raw = await callForcedToolStrict({
      apiKey: anthropicKey,
      model: INTENT_CLASSIFIER_MODEL,
      system: voiceIntentPrompt.system,
      userMessage: voiceIntentPrompt.user(transcript, ephemeralSnapshot(tz)),
      tool: EMIT_INTENT_TOOL,
    });
  } catch (err) {
    console.error("[setup/dictation-test] classify error", err);
    return vendorErrorResponse(err, {
      provider: "anthropic",
      fallbackMessage: "Couldn't reach the parser. Try again.",
    });
  }

  // The model produced an unusable shape (not a key problem) — still a useful
  // preview: tell the user we heard them but couldn't structure it.
  if (raw === null) {
    return NextResponse.json(
      {
        transcript,
        example: `I heard "${transcript}" but couldn't turn it into an action — your keys work, though.`,
      } satisfies DictationTestResponse,
      { status: 200 },
    );
  }

  const result = safeParseIntent(raw);
  if (!result.ok) {
    return NextResponse.json(
      {
        transcript,
        example: `I heard "${transcript}" but couldn't turn it into an action — your keys work, though.`,
      } satisfies DictationTestResponse,
      { status: 200 },
    );
  }

  // SAVE NOTHING — render a human preview of what the intent WOULD do.
  return NextResponse.json(
    {
      transcript,
      example: renderIntentExample(result.intent),
    } satisfies DictationTestResponse,
    { status: 200 },
  );
});

// --- Helpers ----------------------------------------------------------------

/**
 * A minimal, EMPTY snapshot for the ephemeral test — we deliberately do NOT
 * read the user's missions/tasks (no data access during the wizard). The
 * classifier just structures the spoken phrase; hints stay as raw phrases.
 */
function ephemeralSnapshot(tz: string): VoiceStateSnapshot {
  return {
    today: isoTodayInTz(tz),
    timezone: tz,
    missions: [],
    tasks: [],
    categories: [
      "medical",
      "bureaucratic",
      "travel",
      "gear",
      "tech",
      "general",
    ],
  };
}

/**
 * Render a short, human, NON-EXECUTING description of a parsed intent — what it
 * WOULD have done. Never mutates; used only for the wizard preview.
 */
function renderIntentExample(intent: VoiceIntent): string {
  switch (intent.intent) {
    case "create_mission":
      return `I'd create the mission: "${intent.name}"${
        intent.targetDateHint ? ` (around ${intent.targetDateHint})` : ""
      }.`;
    case "create_task":
      return `I'd create the task: "${intent.name}"${
        intent.missionHint ? ` in ${intent.missionHint}` : ""
      }.`;
    case "create_category":
      return `I'd create the category: "${intent.name}".`;
    case "update_task_status":
      return `I'd mark "${intent.taskHint}" as ${intent.status}.`;
    case "update_task":
      return `I'd set ${intent.field} of "${intent.taskHint}" to "${intent.value}".`;
    case "add_dependency":
      return `I'd make "${intent.taskHint}" depend on "${intent.dependsOnHint}".`;
    case "remove_dependency":
      return `I'd remove the dependency of "${intent.taskHint}" on "${intent.dependsOnHint}".`;
    case "delete_task":
      return `I'd delete the task "${intent.taskHint}" (after asking you to confirm).`;
    case "delete_mission":
      return `I'd delete the mission "${intent.missionHint}" (after asking you to confirm).`;
    case "query":
      return `I'd answer the question: "${intent.question}".`;
    case "unknown":
      return `I heard "${intent.rawTranscript}" but couldn't turn it into an action — your keys work, though.`;
  }
}

/** Today's calendar date (YYYY-MM-DD) in `tz`. Mirrors the voice route. */
function isoTodayInTz(tz: string): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  } catch {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: DEFAULT_TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  }
}

/** Validate a browser-supplied IANA tz; fall back to UTC. Mirrors the voice route. */
function sanitizeTz(value: FormDataEntryValue | null): string {
  const parsed = TzSchema.safeParse(value);
  if (!parsed.success) return DEFAULT_TZ;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: parsed.data });
    return parsed.data;
  } catch {
    return DEFAULT_TZ;
  }
}
