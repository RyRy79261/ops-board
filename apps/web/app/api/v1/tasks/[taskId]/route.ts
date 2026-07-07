import { z } from "zod";
import { getTask } from "@opsboard/db/tasks";
import { updateTask, deleteTask } from "@opsboard/db/mutations";
import {
  runV1,
  safeParseBody,
  unwrapV1,
  notFoundV1,
  V1Error,
} from "../../_lib/v1";
import { isoDate, taskStatus, categorySlug, requireUuid } from "../../_lib/schemas";
import { toTaskView } from "../../_lib/views";

// /api/v1/tasks/[taskId] — GET, PATCH (partial update, MCP update_task
// mirror), DELETE (requires `?confirm=<taskId>`, the REST confirm echo).

export const runtime = "nodejs";

type Params = { params: Promise<{ taskId: string }> };

export async function GET(req: Request, { params }: Params): Promise<Response> {
  return runV1({
    req,
    op: "v1.get_task",
    handler: async (p) => {
      const taskId = requireUuid((await params).taskId);
      const task = await getTask(taskId, p.userId);
      if (!task) notFoundV1("No task with that id.");
      return { task: toTaskView(task!) };
    },
  });
}

const PatchTaskBody = z.object({
  name: z.string().trim().min(1).optional(),
  category: categorySlug.nullable().optional(),
  status: taskStatus.optional(),
  tooLateBy: isoDate.nullable().optional(),
  notBefore: isoDate.nullable().optional(),
  notes: z.string().nullable().optional(),
});

export async function PATCH(
  req: Request,
  { params }: Params,
): Promise<Response> {
  const body = await safeParseBody(req, PatchTaskBody);
  if (!body.ok) return body.response;
  return runV1({
    req,
    op: "v1.update_task",
    argsForAudit: body.data,
    handler: async (p) => {
      const taskId = requireUuid((await params).taskId);
      const patch: Parameters<typeof updateTask>[1] = {};
      if (body.data.name !== undefined) patch.name = body.data.name;
      if (body.data.status !== undefined) patch.status = body.data.status;
      if (body.data.tooLateBy !== undefined) patch.tooLateBy = body.data.tooLateBy;
      if (body.data.notBefore !== undefined) patch.notBefore = body.data.notBefore;
      if (body.data.notes !== undefined) patch.notes = body.data.notes;
      if (body.data.category !== undefined) patch.categorySlug = body.data.category;
      if (Object.keys(patch).length === 0) {
        throw new V1Error(400, "Provide at least one field to update.");
      }
      const result = unwrapV1(await updateTask(taskId, patch, p.userId));
      return { task: toTaskView(result.task) };
    },
  });
}

export async function DELETE(
  req: Request,
  { params }: Params,
): Promise<Response> {
  const confirm = new URL(req.url).searchParams.get("confirm");
  return runV1({
    req,
    op: "v1.delete_task",
    argsForAudit: { confirm: Boolean(confirm) },
    handler: async (p) => {
      const taskId = requireUuid((await params).taskId);
      const task = await getTask(taskId, p.userId);
      if (!task) notFoundV1("No task with that id.");
      if (confirm !== taskId) {
        throw new V1Error(
          409,
          `This deletes the task "${task!.name}" and its dependency edges. To confirm, repeat the request with ?confirm=${taskId}.`,
          "CONFIRM_REQUIRED",
        );
      }
      unwrapV1(await deleteTask(taskId, p.userId));
      return { deleted: true, taskId, name: task!.name };
    },
  });
}
