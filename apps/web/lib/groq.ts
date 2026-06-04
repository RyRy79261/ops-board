import Groq from "groq-sdk";

// LIFTED VERBATIM from camp-404 apps/web/lib/groq.ts (project_brief.md §3 /
// scaffolding-plan.md S5). Lazy Groq client; whisper-large-v3-turbo, JSON
// response, temperature 0. The model id is pinned here (STT is the one model
// id NOT in @opsboard/ai-prompts — the classifier model lives there).

let client: Groq | null = null;

function groqClient(): Groq {
  if (!client) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY is not set");
    client = new Groq({ apiKey });
  }
  return client;
}

export interface TranscribeOptions {
  /**
   * Whisper's domain-biasing prompt. A short paragraph listing the jargon,
   * brand names, and numerals the user is likely to say. Dramatically
   * improves accuracy on names/numbers vs. the default prompt. For OpsBoard
   * pass OPSBOARD_WHISPER_PROMPT from @opsboard/ai-prompts.
   */
  prompt?: string;
}

/**
 * Transcribe an audio blob with Groq's Whisper Large v3 Turbo.
 * ~216x real-time speed, $0.04/audio-hour.
 */
export async function transcribeAudio(
  file: File,
  options: TranscribeOptions = {},
): Promise<string> {
  const res = await groqClient().audio.transcriptions.create({
    file,
    model: "whisper-large-v3-turbo",
    response_format: "json",
    temperature: 0,
    ...(options.prompt ? { prompt: options.prompt } : {}),
  });
  return res.text;
}
