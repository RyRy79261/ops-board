// @opsboard/core — pure, I/O-free domain logic. The single source of truth for
// blocked / windowState / criticalPath / detectCycles derivations.
//
// HARD RULE: never import React, the DB, next, or process.env here. The live
// ticker (useNowTick) lives in @opsboard/ui/hooks and passes `now` INTO these
// pure functions. Implemented + unit-tested in S3 (see docs/scaffolding-plan.md).

/** Closing window opens this many days before a task's too_late_by cliff. */
export const CLOSING_THRESHOLD_DAYS = 7;

export {};
