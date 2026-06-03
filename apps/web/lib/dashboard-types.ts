// Shared dashboard view-model types — the SHARED CONTRACT between the server
// data layer (dashboard-data.ts), the client shell (dashboard-shell.tsx), and
// the three views. These are the SINGLE source of truth for the prop shapes the
// views consume.
//
// Why snake_case `too_late_by` / `not_before` on TaskVM: these fields are passed
// straight into @opsboard/core's `windowState(now, task, tz)` (its
// `WindowStateTask` shape uses snake_case), which is computed CLIENT-side inside
// TaskCard so window-state stays live as `now` ticks. Keeping the VM field names
// aligned with core's input means TaskCard hands the VM to `windowState` with no
// remapping. `blocked` IS pre-derived server-side (tz-independent) and folds into
// the same `WindowStateTask` so the client `windowState` resolves not-yet(blocked).

import type { TaskStatus } from "@opsboard/types";

/** A task, board-shaped, with the server-derived blocked overlay folded in. */
export interface TaskVM {
  id: string;
  name: string;
  /** Stored status — drives the StatusCycleButton (the board's only mutation). */
  status: TaskStatus;
  /** The task's category slug, or null if uncategorised. Drives grouping + CategoryTag. */
  categorySlug: string | null;
  /** The cliff — "after this date the task is moot". ISO `YYYY-MM-DD` or null. */
  too_late_by: string | null;
  /** "Can't start until this date". ISO `YYYY-MM-DD` or null. */
  not_before: string | null;
  /** Server-derived (deriveBlocked): any direct dependency not yet `done`. */
  blocked: boolean;
  /** Names of the not-done prerequisites — the "⚠ blocked by: …" caption. */
  blockedByNames: string[];
  /** Free-text notes (currently unused on the board, carried for completeness). */
  notes?: string | null;
}

/** A category, board-shaped: icon + label + hex tint + ordering. */
export interface CategoryVM {
  slug: string;
  name: string;
  /** Hex mirror of the @opsboard/ui `--color-cat-*` token. */
  color: string;
  /** Lucide icon name (the redundant, CVD-safe icon channel). */
  lucideIcon: string;
  sortOrder: number;
}

/** One dependency edge: `taskId` depends on `dependsOnId`. */
export interface DependencyEdgeVM {
  taskId: string;
  dependsOnId: string;
}

/** The full payload the RSC page hands to the client shell. */
export interface DashboardData {
  /** Every mission, for the sidebar list. */
  missions: { id: string; name: string }[];
  /** The mission whose board is rendered. */
  activeMissionId: string;
  /** Active mission detail (drives the MissionDetailHeader title + target). */
  mission: { id: string; name: string; targetDate: string | null };
  /** Active mission's tasks, with blocked / blockedByNames pre-derived. */
  tasks: TaskVM[];
  /** Categories, sorted by sortOrder. */
  categories: CategoryVM[];
  /** The active mission's dependency edges. */
  deps: DependencyEdgeVM[];
  /** Server-derived longest dependency chain (tz-independent). */
  criticalPathIds: string[];
}

/**
 * The prop shape every view (Category / Timeline / Dependencies) consumes. The
 * shell injects a fresh `now` (epoch ms, re-read on each useNowTick) + the
 * browser `tz` so each view's TaskCards recompute window-state live, and an
 * `onCycle` that runs the status-cycle Server Action inside a transition.
 */
export interface ViewProps {
  tasks: TaskVM[];
  categories: CategoryVM[];
  deps: DependencyEdgeVM[];
  criticalPathIds: string[];
  /** The user's IANA timezone (browser-resolved in the shell). */
  tz: string;
  /** Current epoch ms; advances on each useNowTick so window-state stays live. */
  now: number;
  /** Advance a task to the next stored status (wired to update_task_status). */
  onCycle: (taskId: string, next: TaskStatus) => void;
}
