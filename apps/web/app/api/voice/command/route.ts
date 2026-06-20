import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getAuthenticatedUser } from "@/lib/auth";
import { transcribeAudio } from "@/lib/groq";
import { getClientIp, rateLimiter } from "@/lib/rate-limit";
import { callForcedToolStrict } from "@/lib/anthropic";
import { executeIntent } from "@/lib/voice-execute";
import { resolveAiKey } from "@/lib/ai-key-resolver";
import { aiKeyErrorResponse } from "@/app/api/_shared/ai-error-response";
import { vendorErrorResponse } from "@/app/api/_shared/vendor-errors";

import {
  safeParseIntent,
  isDestructive,
  CONFIDENCE_FLOOR,
  VoiceIntent,
} from "@opsboard/types";
import {
  voiceIntentPrompt,
  OPSBOARD_WHISPER_PROMPT,
  INTENT_CLASSIFIER_MODEL,
  EMIT_INTENT_TOOL,
  type VoiceStateSnapshot,
} from "@opsboard/ai-prompts";
import { createHttpDb } from "@opsboard/db";
import { getMissions } from "@opsboard/db/missions";
import { getCategories, getTasksByMissionIds } from "@opsboard/db/tasks";
import { getUserPreferences } from "@opsboard/db/preferences";

// /api/voice/command — the transcript → intent → execute pipeline. Node runtime
// (Groq + Anthropic SDKs + the neon-http driver). Mirrors camp-404's transcribe
// route guard ladder (auth → rate-limit → validate → scrub), collapsed to a
// single principal (lib/auth.ts) but KEEPING per-IP + per-principal rate-limits.
//
// Two request shapes:
//   A) multipart/form-data { audio: File, tz?: string } → full pipeline:
//      transcribe → server-built snapshot → Claude (forced tool_use) →
//      safeParseIntent → confirm-gate → execute.
//   B) application/json { intent: VoiceIntent, confirmed: true } → the confirm
//      re-issue / disambiguation re-issue: skip transcription, execute directly.
//
// The board mutates ONLY through here (voice) or MCP (S6); destructive intents
// are NEVER executed without an explicit confirmed re-issue.

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB hard cap (parallels transcribe).
const DEFAULT_TZ = "UTC";

// The emit_intent forced tool is SHARED from @opsboard/ai-prompts (it declares
// every VoiceIntent field flat so the model reliably emits the per-intent
// required fields; the @opsboard/types Zod union is the real validator). It used
// to be inlined here AND in the dictation-test route — the two drifted, which is
// why this is now one constant.

/** The response contract the FAB consumes (see voice-execute ExecuteOutcome). */
interface CommandResponseBody {
  transcript: string;
  intent: VoiceIntent | null;
  result?: unknown;
  needsConfirmation?: boolean;
  /** A clarify line when a hint couldn't be resolved (soft, non-destructive). */
  clarify?: string;
  needsDisambiguation?: boolean;
  options?: unknown;
  /** A prompt for the confirm / disambiguation surfaces. */
  prompt?: string;
  error?: string;
}

export async function POST(req: Request): Promise<Response> {
  // --- Guard ladder: auth (single principal) -------------------------------
  const user = await getAuthenticatedUser();
  if (!user) {
    // The stub never returns null today, but the route keeps the camp shape so a
    // future real session reader drops in without touching this handler.
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // --- Rate-limit: per-principal AND per-IP (defence in depth) -------------
  const principalLimit = await rateLimiter.limit(`voice-command:${user.id}`, {
    limit: 30,
  });
  if (!principalLimit.ok) {
    return rateLimited(principalLimit.retryAfterSeconds);
  }
  const ipLimit = await rateLimiter.limit(
    `voice-command-ip:${getClientIp(req.headers)}`,
    { limit: 60 },
  );
  if (!ipLimit.ok) {
    return rateLimited(ipLimit.retryAfterSeconds);
  }

  const contentType = req.headers.get("content-type") ?? "";

  // --- Shape B: JSON confirm / disambiguation re-issue ---------------------
  if (contentType.includes("application/json")) {
    return handleReissue(req, user.id);
  }

  // --- Shape A: multipart audio → full pipeline ----------------------------
  // PURE BYO: the resolver keys off the SESSION userId only — there is no env /
  // whitelist fallback, so the email is no longer threaded into resolution.
  return handleAudio(req, user.id);
}

/**
 * Shape B — the confirm re-issue (and the disambiguation pick re-issue). The
 * intent is already parsed; we re-validate it against the union and execute it
 * as CONFIRMED. This is the only path that may run a destructive mutation.
 */
async function handleReissue(req: Request, userId: string): Promise<Response> {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    (payload as { confirmed?: unknown }).confirmed !== true
  ) {
    return NextResponse.json(
      { error: "Re-issue requires { intent, confirmed: true }." },
      { status: 400 },
    );
  }

  const parsed = VoiceIntent.safeParse(
    (payload as { intent?: unknown }).intent,
  );
  if (!parsed.success) {
    return NextResponse.json(
      {
        transcript: "",
        intent: null,
        error: "That command couldn't be understood.",
      } satisfies CommandResponseBody,
      { status: 200 },
    );
  }

  const outcome = await executeIntent(parsed.data, userId);
  const body = outcomeToBody("", parsed.data, outcome);
  if ("result" in outcome) revalidatePath("/");
  return NextResponse.json(body, { status: 200 });
}

/**
 * Shape A — the normal capture: transcribe → server snapshot → classify →
 * validate → confirm-gate → execute.
 */
async function handleAudio(req: Request, userId: string): Promise<Response> {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("audio");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Missing `audio` file" },
      { status: 400 },
    );
  }
  if (!file.type.startsWith("audio/")) {
    return NextResponse.json(
      { error: "File must be audio/*" },
      { status: 415 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Audio too large" }, { status: 413 });
  }

  const tz = sanitizeTz(form.get("tz"));

  // 0. Resolve the SESSION user's Groq key. FAIL CLOSED: a user with no stored
  //    key gets a 402 NO_AI_KEY (pure BYO — there is NO env fallback at all).
  let groqKey: string;
  try {
    groqKey = await resolveAiKey(userId, "groq");
  } catch (err) {
    const failClosed = aiKeyErrorResponse(err);
    if (failClosed) return failClosed;
    throw err;
  }

  // 1. Transcribe (Groq Whisper, OpsBoard bias prompt, per-user key).
  let transcript: string;
  try {
    transcript = (
      await transcribeAudio(file, groqKey, { prompt: OPSBOARD_WHISPER_PROMPT })
    ).trim();
  } catch (err) {
    // Distinguish a rejected Groq KEY (400) / rate-limit (429) / timeout (504)
    // from a real fault (502) — a bad key must NOT read as "bad audio".
    console.error("voice-command transcription error", err);
    return vendorErrorResponse(err, {
      provider: "groq",
      fallbackMessage: "Couldn't transcribe that audio.",
    });
  }

  if (transcript.length === 0) {
    return NextResponse.json(
      {
        transcript: "",
        intent: null,
        error: "I didn't catch that — try again.",
      } satisfies CommandResponseBody,
      { status: 200 },
    );
  }

  // 2. Build the snapshot SERVER-SIDE from the DB (never from model output).
  //    Scoped to the SESSION user so the classifier only ever sees THIS user's
  //    missions / tasks (no cross-user names leak into the prompt).
  const snapshot = await buildSnapshot(tz, userId);

  // 3. Resolve the SESSION user's Anthropic key, then classify via Claude (Opus
  //    — the human-boundary model per the model-tier rule; forced tool_use, ~30s;
  //    temperature is omitted for Opus 4.7+, which rejects it). FAIL CLOSED on no
  //    stored key with a 402 NO_AI_KEY — pure BYO, same as transcription. We use
  //    the STRICT call so a vendor error (bad key→400, rate-limit→429,
  //    timeout→504, else→502) is reported DISTINCTLY instead of being swallowed
  //    to a generic "couldn't understand" — a misconfigured key was previously
  //    indistinguishable from a model miss.
  let anthropicKey: string;
  try {
    anthropicKey = await resolveAiKey(userId, "anthropic");
  } catch (err) {
    const failClosed = aiKeyErrorResponse(err);
    if (failClosed) return failClosed;
    throw err;
  }
  let raw: unknown | null;
  try {
    raw = await callForcedToolStrict({
      apiKey: anthropicKey,
      model: INTENT_CLASSIFIER_MODEL,
      system: voiceIntentPrompt.system,
      userMessage: voiceIntentPrompt.user(transcript, snapshot),
      tool: EMIT_INTENT_TOOL,
    });
  } catch (err) {
    console.error("voice-command classify error", err);
    return vendorErrorResponse(err, {
      provider: "anthropic",
      fallbackMessage: "I couldn't reach the parser. Try again.",
    });
  }
  // A clean "no tool_use block" (raw === null) is a model MISS, not an error —
  // keep the soft 200 so the user just rephrases.
  if (raw === null) {
    return NextResponse.json(
      {
        transcript,
        intent: null,
        error: "I couldn't understand that command.",
      } satisfies CommandResponseBody,
      { status: 200 },
    );
  }

  // 4. Validate against the VoiceIntent union — never execute an unvalidated shape.
  const result = safeParseIntent(raw);
  if (!result.ok) {
    return NextResponse.json(
      {
        transcript,
        intent: null,
        error: `Couldn't parse "${transcript}".`,
      } satisfies CommandResponseBody,
      { status: 200 },
    );
  }

  const intent = result.intent;

  // 5. Confirm gate: unknown + low-confidence intents are ALWAYS gated (never
  // auto-act on a guess). Destructive intents are gated per the user's
  // voiceConfirmDestructive preference (default true) — the setting was fully
  // plumbed UI→DB→API but nothing read it, so the toggle did nothing; now a user
  // who turns it off gets high-confidence deletes executed without the extra
  // step. Prefs are fetched ONLY for the destructive case to avoid a per-command
  // round-trip.
  // (Order matters: the unknown/low-confidence gate runs FIRST and is never
  // skipped, so a low-confidence destructive intent is always confirmed
  // regardless of the preference. Don't merge/reorder these two blocks.)
  let mustConfirm =
    intent.intent === "unknown" || intent.confidence < CONFIDENCE_FLOOR;
  if (!mustConfirm && isDestructive(intent)) {
    try {
      const prefs = await getUserPreferences(userId);
      mustConfirm = prefs.voiceConfirmDestructive;
    } catch {
      // Fail CLOSED: if the preference read fails, confirm the destructive
      // action rather than risk auto-executing a delete the user didn't see.
      mustConfirm = true;
    }
  }
  if (mustConfirm) {
    return NextResponse.json(
      {
        transcript,
        intent,
        needsConfirmation: true,
      } satisfies CommandResponseBody,
      { status: 200 },
    );
  }

  // 6. Execute (resolve hints → mutation / read). May still surface a soft
  // confirm / disambiguation if a hint resolves to 0 / many.
  const outcome = await executeIntent(intent, userId);
  const body = outcomeToBody(transcript, intent, outcome);
  if ("result" in outcome) revalidatePath("/");
  return NextResponse.json(body, { status: 200 });
}

// --- Snapshot + helpers -----------------------------------------------------

/**
 * Build the compact current-state snapshot the classifier fuzzy-matches
 * against, scoped to the SESSION user. Categories are global; missions + tasks
 * are read with `userId` so the prompt never carries another user's data.
 */
async function buildSnapshot(
  tz: string,
  userId: string,
): Promise<VoiceStateSnapshot> {
  const db = createHttpDb();
  const [missions, categories] = await Promise.all([
    getMissions(userId, db),
    getCategories(db),
  ]);
  const catNameById = new Map(categories.map((c) => [c.id, c.slug]));
  const missionById = new Map(missions.map((m) => [m.id, m]));

  // ONE bulk read of every task across the user's missions (was a per-mission
  // getTasks fan-out — 1 + N round-trips on the hot path of every voice command).
  const taskRows = await getTasksByMissionIds(
    missions.map((m) => m.id),
    userId,
    db,
  );

  const tasks: VoiceStateSnapshot["tasks"] = [];
  for (const t of taskRows) {
    tasks.push({
      name: t.name,
      mission: missionById.get(t.missionId)?.name ?? "",
      category: t.categoryId
        ? (catNameById.get(t.categoryId) ?? "uncategorised")
        : "uncategorised",
      // `Task.status` is the DB `text` column (typed `string`); the CHECK pins
      // it to the three legal values, so the narrow is safe for the snapshot.
      status: t.status as "not-started" | "in-progress" | "done",
    });
  }

  return {
    today: isoTodayInTz(tz),
    timezone: tz,
    missions: missions.map((m) => ({ name: m.name, targetDate: m.targetDate })),
    tasks,
    categories: categories.map((c) => c.slug),
  };
}

/** Today's calendar date (YYYY-MM-DD) as seen in `tz` — the classifier's anchor. */
function isoTodayInTz(tz: string): string {
  try {
    // en-CA renders ISO-ordered YYYY-MM-DD.
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

/** Validate a browser-supplied IANA tz; fall back to UTC on anything dodgy. */
function sanitizeTz(value: FormDataEntryValue | null): string {
  if (typeof value !== "string" || value.length === 0 || value.length > 64) {
    return DEFAULT_TZ;
  }
  try {
    // Throws RangeError for an unknown zone.
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return value;
  } catch {
    return DEFAULT_TZ;
  }
}

function rateLimited(retryAfterSeconds: number): Response {
  return NextResponse.json(
    { error: "Rate limit exceeded", retryAfterSeconds },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSeconds) },
    },
  );
}

/** Fold an ExecuteOutcome into the wire response the FAB handles. */
function outcomeToBody(
  transcript: string,
  intent: VoiceIntent,
  outcome: Awaited<ReturnType<typeof executeIntent>>,
): CommandResponseBody {
  if ("result" in outcome) {
    return { transcript, intent, result: outcome.result };
  }
  if ("needsDisambiguation" in outcome) {
    return {
      transcript,
      intent,
      needsDisambiguation: true,
      options: outcome.options,
      prompt: outcome.prompt,
    };
  }
  if ("needsConfirmation" in outcome) {
    return {
      transcript,
      intent,
      needsConfirmation: true,
      clarify: outcome.clarify,
    };
  }
  return { transcript, intent, error: outcome.error };
}
