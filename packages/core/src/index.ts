// @opsboard/core — pure, I/O-free domain logic. The single source of truth for
// blocked / windowState / criticalPath / detectCycles derivations.
//
// HARD RULE — enforced by review and the I/O-free test: inside this package NEVER
// import React, the DB (@opsboard/db / drizzle), next/*, or read process.env, and
// NEVER read the wall clock (no Date.now(), no `new Date()` with no argument).
// The caller passes `now` (epoch milliseconds) and the user's IANA `tz` INTO the
// pure functions. The live ticker (useNowTick) lives in @opsboard/ui/hooks and
// feeds `now` in — keeping this layer trivially, deterministically testable.

// Window-state derivation. CLOSING_THRESHOLD_DAYS (pinned = 7, design-brief §9 /
// research-dossier §8) is declared in window-state.ts beside its use and
// re-exported here so it stays a single source of truth.
export {
  CLOSING_THRESHOLD_DAYS,
  windowState,
  windowStateDetail,
  type WindowState,
  type WindowStateTask,
  type WindowStateDetail,
} from "./window-state";

// Blocked derivation.
export {
  deriveBlocked,
  isBlocked,
  blockingDependencyIds,
  type BlockedTask,
} from "./blocked";

// Cycle detection.
export {
  detectCycles,
  hasCycle,
  buildDependencyMap,
  type DependencyEdge,
} from "./cycle";

// Critical-path (longest dependency chain).
export {
  criticalPath,
  criticalPathLength,
  type PathTask,
} from "./critical-path";
