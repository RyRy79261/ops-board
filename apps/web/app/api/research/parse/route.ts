import { NextResponse } from "next/server";
import { z } from "zod";

import { getAuthenticatedUser } from "@/lib/auth";
import { transcribeAudio } from "@/lib/groq";
import { getClientIp, rateLimiter } from "@/lib/rate-limit";
import { callForcedTool } from "@/lib/anthropic";
import { resolveAiKey } from "@/lib/ai-key-resolver";
import { aiKeyErrorResponse } from "@/app/api/_shared/ai-error-response";
import { rankTaskMatches, toMatchPct, type MatchableTask } from "@/lib/research-match";
import type { ResearchParseResult } from "@/lib/research-types";

import {
  researchParsePrompt,
  RESEARCH_PARSE_MODEL,
  OPSBOARD_WHISPER_PROMPT,
  type ResearchScopeSnapshot,
} from "@opsboard/ai-prompts";
import { createHttpDb } from "@opsboard/db";
import { getMission } from "@opsboard/db/missions";
import { getCategories, getTasks } from "@opsboard/db/tasks";

// /api/research/parse — the /research capture step: a spoken request → a parsed
// RESEARCH proposal (query + ranked target-task candidates), scoped to ONE
// mission. Node runtime (Groq + Anthropic SDKs + neon-http). Mirrors the
// /api/voice/command guard ladder (auth → rate-limit → BYO-key resolve →
// transcribe → classify), but it NEVER mutates: it returns a proposal the user
// reviews and confirms with CUE RESEARCH (which hits /api/research).
//
// PURE BYO: the user's own Groq (transcribe) + Anthropic (parse) keys are
// resolved from the vault; a missing key fails closed with a 402 NO_AI_KEY.

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB, parallels /api/voice/command.
const MAX_CANDIDATES = 5;

// Forced tool — the model emits exactly { query, taskHint, confidence }. The raw
// input is Zod-validated below; this JSON schema stays permissive so the model
// isn't fought by a partial mirror (same idiom as EMIT_INTENT_TOOL).
const EMIT_RESEARCH_TOOL = {
  name: "emit_research",
  description:
    "Emit the parsed research request: a clean web-research query, a fuzzy target-task hint, and a confidence.",
  input_schema: {
    type: "object" as const,
    properties: {
      query: { type: "string", description: "The cleaned web-research question." },
      taskHint: {
        type: "string",
        description: "Fuzzy reference to the task the notes attach to.",
      },
      confidence: {
        type: "number",
        description: "0..1 confidence in BOTH the query and the target task.",
      },
    },
    required: ["query", "taskHint", "confidence"],
  },
};

const RawResearchParse = z.object({
  query: z.string().trim().min(1).max(280),
  taskHint: z.string().trim().max(200),
  confidence: z.number().min(0).max(1),
});

export async function POST(req: Request): Promise<Response> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const principalLimit = await rateLimiter.limit(`research-parse:${user.id}`, {
    limit: 20,
  });
  if (!principalLimit.ok) return rateLimited(principalLimit.retryAfterSeconds);
  const ipLimit = await rateLimiter.limit(
    `research-parse-ip:${getClientIp(req.headers)}`,
    { limit: 40 },
  );
  if (!ipLimit.ok) return rateLimited(ipLimit.retryAfterSeconds);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

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

  const missionId = form.get("missionId");
  if (typeof missionId !== "string" || missionId.length === 0) {
    return NextResponse.json({ error: "Missing `missionId`" }, { status: 400 });
  }

  // Scope: the mission must exist AND belong to this user. This is the locked
  // ScopeChip taxonomy — the parse only ever sees THIS mission's tasks.
  const db = createHttpDb();
  const mission = await getMission(missionId, user.id, db);
  if (!mission) {
    return NextResponse.json({ error: "Unknown mission" }, { status: 404 });
  }

  // Transcribe (Groq Whisper, OpsBoard bias prompt, per-user key — fail closed).
  let groqKey: string;
  try {
    groqKey = await resolveAiKey(user.id, "groq");
  } catch (err) {
    const failClosed = aiKeyErrorResponse(err);
    if (failClosed) return failClosed;
    throw err;
  }
  let transcript: string;
  try {
    transcript = (
      await transcribeAudio(file, groqKey, { prompt: OPSBOARD_WHISPER_PROMPT })
    ).trim();
  } catch (err) {
    console.error("research-parse transcription error", err);
    return NextResponse.json(
      { error: "Couldn't transcribe that audio." },
      { status: 200 },
    );
  }
  if (transcript.length === 0) {
    return NextResponse.json(
      { error: "I didn't catch that — try again." },
      { status: 200 },
    );
  }

  // Build the mission-scoped snapshot from the DB (never from model output).
  const [tasks, categories] = await Promise.all([
    getTasks(missionId, user.id, db),
    getCategories(db),
  ]);
  const slugById = new Map(categories.map((c) => [c.id, c.slug]));
  const matchable: MatchableTask[] = tasks.map((t) => ({
    id: t.id,
    name: t.name,
    category: t.categoryId ? (slugById.get(t.categoryId) ?? null) : null,
  }));
  const snapshot: ResearchScopeSnapshot = {
    mission: mission.name,
    tasks: matchable.map((t) => ({
      name: t.name,
      category: t.category ?? "uncategorised",
    })),
  };

  // Parse (Claude, pinned Haiku, forced tool_use — per-user key, fail closed).
  let anthropicKey: string;
  try {
    anthropicKey = await resolveAiKey(user.id, "anthropic");
  } catch (err) {
    const failClosed = aiKeyErrorResponse(err);
    if (failClosed) return failClosed;
    throw err;
  }
  const raw = await callForcedTool({
    apiKey: anthropicKey,
    model: RESEARCH_PARSE_MODEL,
    system: researchParsePrompt.system,
    userMessage: researchParsePrompt.user(transcript, snapshot),
    tool: EMIT_RESEARCH_TOOL,
  });
  // callForcedTool returns null on a transient Anthropic SDK/API/timeout error
  // (it swallows to null). Distinguish that "try again" case from a genuine
  // schema mismatch so the surface can message it accurately.
  if (raw === null) {
    return NextResponse.json(
      { error: "The agent is busy right now — try again in a moment." },
      { status: 200 },
    );
  }
  const parsed = RawResearchParse.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: `Couldn't parse "${transcript}".` },
      { status: 200 },
    );
  }

  // Rank the mission's tasks against the fuzzy target hint (deterministic).
  const ranked = rankTaskMatches(parsed.data.taskHint, matchable).slice(
    0,
    MAX_CANDIDATES,
  );

  const body: ResearchParseResult = {
    transcript,
    query: parsed.data.query,
    confidence: toMatchPct(parsed.data.confidence),
    candidates: ranked.map((t) => ({
      taskId: t.id,
      name: t.name,
      category: t.category ?? "uncategorised",
      matchPct: toMatchPct(t.score),
    })),
  };
  return NextResponse.json(body, { status: 200 });
}

function rateLimited(retryAfterSeconds: number): Response {
  return NextResponse.json(
    { error: "Rate limit exceeded", retryAfterSeconds },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}
