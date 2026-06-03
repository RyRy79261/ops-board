import type { TaskStatus } from "@opsboard/types";
import type { DependencyEdge } from "./cycle";
import { buildDependencyMap } from "./cycle";

// Pure "blocked" derivation. `blocked` is NEVER stored (product-brief §2) — it is
// computed from the dependency graph at read time: a task is blocked iff ANY of
// its direct dependencies has a status other than 'done'. I/O-FREE and
// CYCLE-SAFE (a self-dep or a cycle must not hang the walk).

/** Minimal task shape blocked-derivation needs. */
export interface BlockedTask {
  id: string;
  status: TaskStatus;
}

/**
 * Map of task id → whether it is blocked. A task is blocked iff at least one of
 * its direct dependencies is not yet `done`.
 *
 * Decisions, made explicit so corrupt data can't surprise a caller:
 * - **Direct dependencies only** — blocked is a one-hop predicate (a task whose
 *   dependency is itself blocked but not-done is still blocked *via that one
 *   non-done dependency*, so transitive closure is unnecessary and would only
 *   risk a cyclic-hang).
 * - **A self-dependency (a→a)** blocks the task unless the task itself is done
 *   (it depends on a non-done copy of itself). Handled naturally by the rule.
 * - **A dependency on an UNKNOWN id** (not in `tasks`) counts as not-done, so it
 *   blocks — a dangling edge is treated as an unmet prerequisite, never ignored.
 * - Every task in `tasks` gets an entry (default `false`); ids only seen in
 *   `deps` are not added to the result (they aren't tasks we render).
 */
export function deriveBlocked(
  tasks: readonly BlockedTask[],
  deps: readonly DependencyEdge[],
): Map<string, boolean> {
  const statusById = new Map<string, TaskStatus>();
  for (const task of tasks) statusById.set(task.id, task.status);

  const adjacency = buildDependencyMap(deps);

  const blocked = new Map<string, boolean>();
  for (const task of tasks) {
    const dependencyIds = adjacency.get(task.id);
    let isBlocked = false;
    if (dependencyIds) {
      for (const dependencyId of dependencyIds) {
        // An unknown dependency id is undefined → treated as not 'done' → blocks.
        if (statusById.get(dependencyId) !== "done") {
          isBlocked = true;
          break;
        }
      }
    }
    blocked.set(task.id, isBlocked);
  }
  return blocked;
}

/** Convenience: whether a single task id is blocked, given a derived map. */
export function isBlocked(
  taskId: string,
  blockedMap: ReadonlyMap<string, boolean>,
): boolean {
  return blockedMap.get(taskId) === true;
}

/**
 * The ids of the (direct) dependencies that are blocking `taskId` — i.e. the
 * not-done prerequisites whose names the UI shows as "⚠ blocked by: …". Returns
 * `[]` when the task is not blocked. Unknown dependency ids ARE included (a
 * dangling edge is a real, if unnameable, blocker).
 */
export function blockingDependencyIds(
  taskId: string,
  tasks: readonly BlockedTask[],
  deps: readonly DependencyEdge[],
): string[] {
  const statusById = new Map<string, TaskStatus>();
  for (const task of tasks) statusById.set(task.id, task.status);

  const adjacency = buildDependencyMap(deps);
  const dependencyIds = adjacency.get(taskId);
  if (!dependencyIds) return [];

  const blockers: string[] = [];
  for (const dependencyId of dependencyIds) {
    if (statusById.get(dependencyId) !== "done") blockers.push(dependencyId);
  }
  return blockers;
}
