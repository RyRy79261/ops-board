import "server-only";
import { createHttpDb } from "@opsboard/db";
import { getMissions, getMission } from "@opsboard/db/missions";
import {
  getCategories,
  getTasks,
  getTaskDependencies,
} from "@opsboard/db/tasks";
import { deriveBlocked, criticalPath } from "@opsboard/core";
import type { DependencyEdge as CoreDependencyEdge } from "@opsboard/core";
import type { TaskStatus } from "@opsboard/types";
import type {
  DashboardData,
  TaskVM,
  CategoryVM,
  DependencyEdgeVM,
} from "./dashboard-types";

// Server-side read assembly for the read-only board. Fetches missions + the
// active mission (default = first) + its tasks/deps/categories via @opsboard/db
// services, then server-derives the TWO tz-INDEPENDENT facts:
//   • blocked + blockedByNames (deriveBlocked over the dependency graph)
//   • criticalPathIds (criticalPath toward the mission target chain)
// windowState is deliberately NOT computed here — it is tz-DEPENDENT and lives
// client-side in TaskCard (fed `now` + the browser tz), so the board stays live.

/**
 * Assemble the dashboard payload for one mission (default: the first mission
 * alphabetically). Returns `null` when there are no missions at all — the page
 * renders the no-missions EmptyState in that case. A missing/unknown
 * `missionId` falls back to the first mission so a stale `?mission=` link never
 * 404s the board.
 */
export async function getDashboardData(
  missionId?: string,
): Promise<DashboardData | null> {
  const db = createHttpDb();

  const missions = await getMissions(db);
  const firstMission = missions[0];
  if (firstMission === undefined) return null;

  // Resolve the active mission: the requested id if it exists, else the first.
  const requested =
    missionId != null ? missions.find((m) => m.id === missionId) : undefined;
  const activeMissionSummary = requested ?? firstMission;

  // Load the active mission's full detail + its tasks, deps, and the category
  // catalogue (sorted by sort_order) in parallel — independent reads.
  const [mission, taskRows, depRows, categoryRows] = await Promise.all([
    getMission(activeMissionSummary.id, db),
    getTasks(activeMissionSummary.id, db),
    getTaskDependencies(activeMissionSummary.id, db),
    getCategories(db),
  ]);

  // Defensive: getMission can race a deletion. Fall back to the summary row so
  // the header still renders rather than throwing.
  const activeMission = mission ?? {
    id: activeMissionSummary.id,
    name: activeMissionSummary.name,
    targetDate: activeMissionSummary.targetDate,
  };

  // categorySlug lookup (the task row stores categoryId; the board groups + tags
  // by slug). One pass over the category catalogue.
  const slugByCategoryId = new Map<string, string>();
  for (const c of categoryRows) {
    // CategoryView has no `id`→slug pairing exposed beyond the row itself.
    slugByCategoryId.set(c.id, c.slug);
  }

  // task name lookup, for the "⚠ blocked by: {name}" captions.
  const nameByTaskId = new Map<string, string>();
  for (const t of taskRows) nameByTaskId.set(t.id, t.name);

  // Dependency edges, board-shaped (camelCase) — the VM shape the views consume.
  const deps: DependencyEdgeVM[] = depRows.map((e) => ({
    taskId: e.taskId,
    dependsOnId: e.dependsOnId,
  }));

  // @opsboard/core's DependencyEdge is snake_case (task_id / depends_on_id) —
  // re-shape once for the core derivations. (The VM stays camelCase per the
  // shared contract.)
  const coreEdges: CoreDependencyEdge[] = depRows.map((e) => ({
    task_id: e.taskId,
    depends_on_id: e.dependsOnId,
  }));

  // ── tz-INDEPENDENT derivation #1: blocked (one-hop, cycle-safe in core).
  const blockedMap = deriveBlocked(
    taskRows.map((t) => ({ id: t.id, status: t.status as TaskStatus })),
    coreEdges,
  );

  // Pre-compute, per task, the names of its not-done direct prerequisites.
  // Group the edges by taskId once, then resolve blocker names against the
  // task-name map (unknown / dangling blockers are skipped from the caption —
  // they still flip `blocked`, they just have no nameable label).
  const depsByTaskId = new Map<string, string[]>();
  for (const e of deps) {
    const list = depsByTaskId.get(e.taskId);
    if (list) list.push(e.dependsOnId);
    else depsByTaskId.set(e.taskId, [e.dependsOnId]);
  }
  const statusByTaskId = new Map<string, string>();
  for (const t of taskRows) statusByTaskId.set(t.id, t.status);

  const tasks: TaskVM[] = taskRows.map((t) => {
    const blocked = blockedMap.get(t.id) === true;
    let blockedByNames: string[] = [];
    if (blocked) {
      const blockerIds = depsByTaskId.get(t.id) ?? [];
      blockedByNames = blockerIds
        .filter((id) => statusByTaskId.get(id) !== "done")
        .map((id) => nameByTaskId.get(id))
        .filter((name): name is string => name != null);
    }
    return {
      id: t.id,
      name: t.name,
      status: t.status as TaskStatus,
      categorySlug: t.categoryId ? (slugByCategoryId.get(t.categoryId) ?? null) : null,
      too_late_by: t.tooLateBy,
      not_before: t.notBefore,
      blocked,
      blockedByNames,
      notes: t.notes,
    };
  });

  // ── tz-INDEPENDENT derivation #2: the longest dependency chain. When the
  // mission names a "target" we'd thread it through; with no per-mission target
  // task, we ask for the global longest chain (the board highlights it).
  const criticalPathIds = criticalPath(
    taskRows.map((t) => ({ id: t.id })),
    coreEdges,
  );

  const categories: CategoryVM[] = categoryRows.map((c) => ({
    slug: c.slug,
    name: c.name,
    color: c.color,
    lucideIcon: c.lucideIcon,
    sortOrder: c.sortOrder,
  }));

  return {
    missions: missions.map((m) => ({ id: m.id, name: m.name })),
    activeMissionId: activeMission.id,
    mission: {
      id: activeMission.id,
      name: activeMission.name,
      targetDate: activeMission.targetDate,
    },
    tasks,
    categories,
    deps,
    criticalPathIds,
  };
}
