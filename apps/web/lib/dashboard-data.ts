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
  MissionTaskWindow,
} from "./dashboard-types";

// Server-side read assembly for the read-only board. Fetches missions + EVERY
// mission's tasks/deps (the sidebar NavCards each need their own count +
// nearest-cliff aggregate) + the global category catalogue via @opsboard/db
// services, then server-derives the TWO tz-INDEPENDENT facts per mission:
//   • blocked + blockedByNames (deriveBlocked over the dependency graph)
//   • criticalPathIds (criticalPath toward the mission target chain) — active only
// windowState is deliberately NOT computed here — it is tz-DEPENDENT and lives
// client-side (fed `now` + the browser tz), so the board stays live. The
// per-mission `MissionTaskWindow[]` carries just the window INPUTS so each
// NavCard derives its chip client-side.

type TaskRow = Awaited<ReturnType<typeof getTasks>>[number];
type DepRow = Awaited<ReturnType<typeof getTaskDependencies>>[number];

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

  // One parallel batch: the active mission's detail, the global category
  // catalogue, and — for the sidebar aggregates — EVERY mission's tasks + deps
  // (each mission read is scoped to the SESSION userId; categories are global).
  const [mission, categoryRows, perMission] = await Promise.all([
    getMission(activeMissionSummary.id, userId, db),
    getCategories(db),
    Promise.all(
      missions.map(async (m) => {
        const [taskRows, depRows] = await Promise.all([
          getTasks(m.id, userId, db),
          getTaskDependencies(m.id, userId, db),
        ]);
        return { id: m.id, name: m.name, taskRows, depRows };
      }),
    ),
  ]);

  // The active mission's rows come from the per-mission batch (no double fetch).
  const activeRows = perMission.find((p) => p.id === activeMissionSummary.id);
  const taskRows = activeRows?.taskRows ?? [];
  const depRows = activeRows?.depRows ?? [];

  // Per-mission sidebar summaries — counts + nearest-cliff inputs for each NavCard.
  const missionSummaries = perMission.map((p) => ({
    id: p.id,
    name: p.name,
    taskWindows: deriveMissionTaskWindows(p.taskRows, p.depRows),
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
