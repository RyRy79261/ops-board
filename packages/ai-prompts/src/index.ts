// @opsboard/ai-prompts — versioned {system, user} prompt constants for the
// voice-intent classifier (Haiku 4.5) + the OpsBoard Whisper bias prompt
// (<224 tokens). See docs/scaffolding-plan.md S5.

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
