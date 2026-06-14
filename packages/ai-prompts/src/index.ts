// @opsboard/ai-prompts — versioned {system, user} prompt constants for the
// voice-intent classifier (Opus 4.8) + the OpsBoard Whisper bias prompt
// (<224 tokens) + the Groq transcript-cleanup prompt (runs before the
// classifier) + the research-parse prompt. See docs/scaffolding-plan.md S5.

export {
  voiceIntentPrompt,
  OPSBOARD_WHISPER_PROMPT,
  INTENT_CLASSIFIER_MODEL,
  PROMPT_VERSIONS,
  PROMPTED_INTENTS,
} from "./voice-intent";
export type {
  VoiceStateSnapshot,
  IntentClassifierModel,
  PromptVersions,
} from "./voice-intent";
export { EMIT_INTENT_TOOL } from "./emit-intent-tool";
export {
  transcriptCleanupPrompt,
  GROQ_CLEANUP_MODEL,
  TRANSCRIPT_CLEANUP_PROMPT_VERSIONS,
} from "./transcript-cleanup";
export type {
  GroqCleanupModel,
  TranscriptCleanupPromptVersions,
} from "./transcript-cleanup";
export {
  researchParsePrompt,
  RESEARCH_PARSE_MODEL,
  RESEARCH_PROMPT_VERSIONS,
} from "./research-parse";
export type {
  ResearchScopeSnapshot,
  ResearchParseModel,
  ResearchPromptVersions,
} from "./research-parse";
