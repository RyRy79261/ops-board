import { addDependency, removeDependency } from "@opsboard/db/mutations";
import { runV1, unwrapV1 } from "../../../../_lib/v1";
import { requireUuid } from "../../../../_lib/schemas";

// /api/v1/tasks/[taskId]/dependencies/[dependsOnId] — PUT adds the edge
// (taskId waits on dependsOnId), DELETE removes it (idempotent). Mirror of the
// MCP add_dependency / remove_dependency tools.

export const runtime = "nodejs";

type Params = { params: Promise<{ taskId: string; dependsOnId: string }> };

export async function PUT(req: Request, { params }: Params): Promise<Response> {
  return runV1({
    req,
    op: "v1.add_dependency",
    successStatus: 201,
    handler: async (p) => {
      const { taskId: rawTask, dependsOnId: rawDep } = await params;
      const taskId = requireUuid(rawTask);
      const dependsOnId = requireUuid(rawDep);
      // Both endpoints must belong to the principal — the mutation enforces it.
      unwrapV1(await addDependency(taskId, dependsOnId, p.userId));
      return { ok: true, taskId, dependsOnId };
    },
  });
}

export async function DELETE(
  req: Request,
  { params }: Params,
): Promise<Response> {
  return runV1({
    req,
    op: "v1.remove_dependency",
    handler: async (p) => {
      const { taskId: rawTask, dependsOnId: rawDep } = await params;
      const taskId = requireUuid(rawTask);
      const dependsOnId = requireUuid(rawDep);
      unwrapV1(await removeDependency(taskId, dependsOnId, p.userId));
      return { ok: true, taskId, dependsOnId };
    },
  });
}
