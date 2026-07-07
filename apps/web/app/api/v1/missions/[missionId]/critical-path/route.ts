import { getMission } from "@opsboard/db/missions";
import { getTasks, getTaskDependencies } from "@opsboard/db/tasks";
import { criticalPath } from "@opsboard/core";
import { runV1, notFoundV1 } from "../../../_lib/v1";
import { requireUuid } from "../../../_lib/schemas";

// GET /api/v1/missions/[missionId]/critical-path — mirror of the MCP
// get_critical_path tool: the longest dependency chain gating the timeline.

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ missionId: string }> },
): Promise<Response> {
  return runV1({
    req,
    op: "v1.get_critical_path",
    handler: async (p) => {
      const missionId = requireUuid((await params).missionId);
      const mission = await getMission(missionId, p.userId);
      if (!mission) notFoundV1("No mission with that id.");
      const tasks = await getTasks(missionId, p.userId);
      const edges = await getTaskDependencies(missionId, p.userId);
      const pathIds = criticalPath(
        tasks.map((t) => ({ id: t.id })),
        edges.map((e) => ({ task_id: e.taskId, depends_on_id: e.dependsOnId })),
      );
      const nameById = new Map(tasks.map((t) => [t.id, t.name]));
      const path = pathIds.map((id) => ({
        id,
        name: nameById.get(id) ?? "(unknown task)",
      }));
      return {
        missionId,
        length: path.length === 0 ? 0 : path.length - 1,
        path,
      };
    },
  });
}
