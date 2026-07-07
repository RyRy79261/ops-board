import { getMission } from "@opsboard/db/missions";
import { getTasks, getTaskDependencies } from "@opsboard/db/tasks";
import { deriveBlocked, blockingDependencyIds } from "@opsboard/core";
import { runV1, notFoundV1 } from "../../../_lib/v1";
import { requireUuid } from "../../../_lib/schemas";

// GET /api/v1/missions/[missionId]/blocked — the mission-scoped mirror of the
// MCP get_blocked_tasks tool: tasks whose prerequisites aren't done, each with
// the blocking task names. Same @opsboard/core derivations the board uses.

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ missionId: string }> },
): Promise<Response> {
  return runV1({
    req,
    op: "v1.get_blocked_tasks",
    handler: async (p) => {
      const missionId = requireUuid((await params).missionId);
      const mission = await getMission(missionId, p.userId);
      if (!mission) notFoundV1("No mission with that id.");
      const tasks = await getTasks(missionId, p.userId);
      const edges = await getTaskDependencies(missionId, p.userId);
      const coreEdges = edges.map((e) => ({
        task_id: e.taskId,
        depends_on_id: e.dependsOnId,
      }));
      const statuses = tasks.map((t) => ({
        id: t.id,
        status: t.status as "not-started" | "in-progress" | "done",
      }));
      const blockedMap = deriveBlocked(statuses, coreEdges);
      const nameById = new Map(tasks.map((t) => [t.id, t.name]));
      const blockedTasks = tasks
        .filter((t) => blockedMap.get(t.id) === true)
        .map((t) => ({
          id: t.id,
          name: t.name,
          missionId: t.missionId,
          status: t.status,
          blockedBy: blockingDependencyIds(t.id, statuses, coreEdges).map(
            (bid) => ({ id: bid, name: nameById.get(bid) ?? "(unknown task)" }),
          ),
        }));
      return { missionId, blockedTasks, count: blockedTasks.length };
    },
  });
}
