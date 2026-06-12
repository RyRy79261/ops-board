// @opsboard/types — shared domain + API types (single source of truth).
// Populated in S2 (DB row types) and S5 (voice-intent discriminated union).

export type TaskStatus = "not-started" | "in-progress" | "done";

/** Window state is COMPUTED, never stored (see @opsboard/core). */
export type WindowState = "open" | "closing" | "closed" | "not-yet";

export * from "./voice-intent";
export * from "./research";
