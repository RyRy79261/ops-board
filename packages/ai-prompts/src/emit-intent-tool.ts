// @opsboard/ai-prompts — the forced `emit_intent` tool the voice classifier is
// made to call. SHARED by the production voice route AND the setup
// dictation-test route so the two can never drift (they did: both inlined this).
//
// WHY EVERY UNION FIELD IS DECLARED FLAT (not just {intent, confidence}):
// Anthropic forced `tool_use` steers the model by the tool's DECLARED schema
// properties, not by the system-prompt prose. The VoiceIntent Zod union
// (@opsboard/types) is `.strict()` and REQUIRES per-intent fields (create_mission
// needs `name`, update_task_status needs `taskHint`+`status`, …). If the schema
// advertises only {intent, confidence}, the model treats that as a complete
// payload and frequently omits the required field — `safeParseIntent` then
// rejects it and the route returns a generic "couldn't parse". Declaring every
// field flat (all optional except intent+confidence) tells the model the fields
// EXIST so it fills the right ones; the discriminated Zod union remains the real
// validator server-side. This mirrors the proven sibling pipeline's PARSE_TOOL.
//
// The flat-vs-union completeness is drift-guarded by a test
// (__tests__/emit-intent-tool.test.ts): every key on every VoiceIntent variant
// must appear in `properties` here.

import { VoiceIntentName, TaskStatusValue } from "@opsboard/types";

export const EMIT_INTENT_TOOL = {
  name: "emit_intent",
  description:
    "Emit exactly one structured OpsBoard voice intent matching the VoiceIntent union. Set `intent` + `confidence` always, then ONLY the fields that belong to the chosen intent (see each field's description); omit the rest.",
  input_schema: {
    type: "object" as const,
    properties: {
      intent: {
        type: "string",
        enum: [...VoiceIntentName.options],
        description: "The intent discriminator.",
      },
      confidence: {
        type: "number",
        description: "0..1 confidence in BOTH the intent and its key fields.",
      },
      // create_mission / create_task
      name: {
        type: "string",
        description:
          "The new mission name (create_mission), task name (create_task), or category name (create_category). REQUIRED for those intents.",
      },
      colorHint: {
        type: "string",
        description:
          "create_category: an optional colour word/phrase for the new category (e.g. blue, dark green).",
      },
      targetDateHint: {
        type: "string",
        description:
          "create_mission: ISO yyyy-mm-dd or a spoken date phrase for the mission's real-world event date.",
      },
      // create_task / delete_mission
      missionHint: {
        type: "string",
        description:
          "The mission a task belongs to (create_task, optional) or the mission to delete (delete_mission, REQUIRED).",
      },
      categoryHint: {
        type: "string",
        description:
          "create_task: the task's category — match one of the categories listed in the current-state snapshot (map synonyms to the closest).",
      },
      tooLateByHint: {
        type: "string",
        description:
          "create_task: ISO yyyy-mm-dd or spoken phrase — the latest the task can still be done.",
      },
      notBeforeHint: {
        type: "string",
        description:
          "create_task: ISO yyyy-mm-dd or spoken phrase — the earliest the task can start.",
      },
      dependsOnHints: {
        type: "array",
        items: { type: "string" },
        description: "create_task: names of tasks this new task depends on.",
      },
      // update_task_status / update_task / add_dependency / remove_dependency / delete_task
      taskHint: {
        type: "string",
        description:
          "The task to act on. REQUIRED for update_task_status, update_task, add_dependency, remove_dependency, delete_task.",
      },
      status: {
        type: "string",
        enum: [...TaskStatusValue.options],
        description: "update_task_status: the new status. REQUIRED for that intent.",
      },
      field: {
        type: "string",
        description:
          'update_task: the single field to change (e.g. "category", "tooLateBy"). REQUIRED for that intent.',
      },
      value: {
        type: "string",
        description:
          "update_task: the new value for `field` (ISO yyyy-mm-dd if it is a date). REQUIRED for that intent.",
      },
      dependsOnHint: {
        type: "string",
        description:
          "add_dependency / remove_dependency: the task the `taskHint` depends on. REQUIRED for those intents.",
      },
      // query
      question: {
        type: "string",
        description: "query: the natural-language question to answer. REQUIRED for that intent.",
      },
      // unknown
      rawTranscript: {
        type: "string",
        description:
          "unknown: the verbatim transcript you could not classify. REQUIRED for that intent.",
      },
    },
    // The discriminated Zod union (@opsboard/types) is the real validator; only
    // the two universal fields are structurally required here.
    required: ["intent", "confidence"],
  },
};
