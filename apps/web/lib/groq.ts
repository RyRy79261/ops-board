import Groq from "groq-sdk";

// LIFTED from camp-404 apps/web/lib/groq.ts (project_brief.md §3 /
// scaffolding-plan.md S5), then REWIRED for OpsBoard BYO keys: the Groq client
// is built per-request from a key the caller RESOLVED for the session user
// (apps/web/lib/ai-key-resolver.ts) — NOT read from a process-wide env var. The
// route fails closed (402) before ever calling here when the user has no key,
// so there is no silent env path. whisper-large-v3-turbo, JSON response,
// temperature 0; the model id is pinned here (STT is the one model id NOT in
// @opsboard/ai-prompts — the classifier model lives there).

export interface TranscribeOptions {
  /**
   * Whisper's domain-biasing prompt. A short paragraph listing the jargon,
   * brand names, and numerals the user is likely to say. Dramatically improves
   * accuracy on names/numbers vs. the default prompt. For OpsBoard pass
   * OPSBOARD_WHISPER_PROMPT from @opsboard/ai-prompts.
   */
  prompt?: string;
}

/**
 * Transcribe an audio blob with Groq's Whisper Large v3 Turbo. ~216x real-time
 * speed, $0.04/audio-hour. `apiKey` is the per-request key the route resolved
 * for the SESSION user — a fresh client is built per call so two users never
 * share a cached, env-keyed singleton.
 */
export async function transcribeAudio(
  file: File,
  apiKey: string,
  options: TranscribeOptions = {},
): Promise<string> {
  const client = new Groq({ apiKey });
  const res = await client.audio.transcriptions.create({
    file,
    model: "whisper-large-v3-turbo",
    response_format: "json",
    temperature: 0,
    ...(options.prompt ? { prompt: options.prompt } : {}),
  });
  return res.text;
}
