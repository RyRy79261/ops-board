import "server-only";
import { createHttpDb } from "@opsboard/db";
import { getMissions, getMission } from "@opsboard/db/missions";
import {
  getCategories,
  getTasksByMissionIds,
  getTaskDependenciesByMissionIds,
} from "@opsboard/db/tasks";
import { deriveBlocked, criticalPath } from "@opsboard/core";
import type { DependencyEdge as CoreDependencyEdge } from "@opsboard/core";
import type { TaskStatus } from "@opsboard/types";
import type {
  DashboardData,
  TaskVM,
  CategoryVM,
  DependencyEdgeVM,
  MissionTaskWindow,
} from "./dashboard-types";

// Server-side read assembly for the read-only board. Reads ALL the user's tasks
// + dependency edges in TWO bulk queries (not a per-mission fan-out), groups
// them by mission server-side, + the global category catalogue, then derives the
// TWO tz-INDEPENDENT facts per mission:
//   • blocked + blockedByNames (deriveBlocked over the dependency graph)
//   • criticalPathIds (criticalPath toward the mission target chain) — active only
// windowState is deliberately NOT computed here — it is tz-DEPENDENT and lives
// client-side (fed `now` + the browser tz), so the board stays live. The
// per-mission `MissionTaskWindow[]` carries just the window INPUTS so each
// NavCard derives its chip client-side.

type TaskRow = Awaited<ReturnType<typeof getTasksByMissionIds>>[number];
type DepRow = Awaited<
  ReturnType<typeof getTaskDependenciesByMissionIds>
>[number];

/** snake_case edges for @opsboard/core (its DependencyEdge is snake_case). */
function toCoreEdges(depRows: DepRow[]): CoreDependencyEdge[] {
  return depRows.map((e) => ({
    task_id: e.taskId,
    depends_on_id: e.dependsOnId,
  }));
}

/**
 * The minimal per-task window inputs for a mission's sidebar aggregate. `blocked`
 * is derived here (tz-independent) so each NavCard's nearest-cliff chip is
 * faithful — windowState ranks not-yet(blocked) ABOVE closing, so a blocked task
 * must not be counted as closing.
 */
function deriveMissionTaskWindows(
  taskRows: TaskRow[],
  depRows: DepRow[],
): MissionTaskWindow[] {
  const blockedMap = deriveBlocked(
    taskRows.map((t) => ({ id: t.id, status: t.status as TaskStatus })),
    toCoreEdges(depRows),
  );
  return taskRows.map((t) => ({
    status: t.status as TaskStatus,
    too_late_by: t.tooLateBy,
    not_before: t.notBefore,
    blocked: blockedMap.get(t.id) === true,
  }));
}

/**
 * Assemble the dashboard payload for one mission (default: the first mission
 * alphabetically). Returns `null` when there are no missions at all — the page
 * renders the no-missions EmptyState in that case. A missing/unknown
 * `missionId` falls back to the first mission so a stale `?mission=` link never
 * 404s the board.
 */
export async function getDashboardData(
  missionId: string | undefined,
  userId: string,
): Promise<DashboardData | null> {
  const db = createHttpDb();

  const missions = await getMissions(userId, db);
  const firstMission = missions[0];
  if (firstMission === undefined) return null;

  // Resolve the active mission: the requested id if it exists, else the first.
  const requested =
    missionId != null ? missions.find((m) => m.id === missionId) : undefined;
  const activeMissionSummary = requested ?? firstMission;

  // One parallel batch — all reads are independent and userId-scoped: the active
  // mission detail, the global category catalogue, and (in BULK, not a
  // per-mission fan-out) every owned task + dependency edge across all missions.
  const missionIds = missions.map((m) => m.id);
  const [mission, categoryRows, allTasks, allDeps] = await Promise.all([
    getMission(activeMissionSummary.id, userId, db),
    getCategories(db),
    getTasksByMissionIds(missionIds, userId, db),
    getTaskDependenciesByMissionIds(missionIds, userId, db),
  ]);

  // Group the bulk rows by mission server-side. Deps carry no missionId, so map
  // each edge to its task's mission via a taskId→missionId lookup.
  const tasksByMission = new Map<string, TaskRow[]>();
  const missionByTaskId = new Map<string, string>();
  for (const t of allTasks) {
    const list = tasksByMission.get(t.missionId);
    if (list) list.push(t);
    else tasksByMission.set(t.missionId, [t]);
    missionByTaskId.set(t.id, t.missionId);
  }
  const depsByMission = new Map<string, DepRow[]>();
  for (const e of allDeps) {
    const mid = missionByTaskId.get(e.taskId);
    if (mid == null) continue;
    const list = depsByMission.get(mid);
    if (list) list.push(e);
    else depsByMission.set(mid, [e]);
  }

  // The active mission's rows come from the grouped maps (no extra fetch).
  const taskRows = tasksByMission.get(activeMissionSummary.id) ?? [];
  const depRows = depsByMission.get(activeMissionSummary.id) ?? [];

  // Per-mission sidebar summaries — counts + nearest-cliff inputs for each NavCard.
  const missionSummaries = missions.map((m) => ({
    id: m.id,
    name: m.name,
    taskWindows: deriveMissionTaskWindows(
      tasksByMission.get(m.id) ?? [],
      depsByMission.get(m.id) ?? [],
    ),
  }));

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

  const coreEdges = toCoreEdges(depRows);

  // ── tz-INDEPENDENT derivation #1: blocked (one-hop, cycle-safe in core).
  const blockedMap = deriveBlocked(
    taskRows.map((t) => ({ id: t.id, status: t.status as TaskStatus })),
    coreEdges,
  );

  // Pre-compute, per task, the names of its not-done direct prerequisites.
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
      categorySlug: t.categoryId
        ? (slugByCategoryId.get(t.categoryId) ?? null)
        : null,
      too_late_by: t.tooLateBy,
      not_before: t.notBefore,
      blocked,
      blockedByNames,
      notes: t.notes,
    };
  });

  // ── tz-INDEPENDENT derivation #2: the longest dependency chain (active mission).
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
    missions: missionSummaries,
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
