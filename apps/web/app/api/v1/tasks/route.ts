import { z } from "zod";
import { createHttpDb } from "@opsboard/db";
import { getMissions } from "@opsboard/db/missions";
import {
  getCategories,
  getTasksByMissionIds,
  getTaskDependenciesByMissionIds,
} from "@opsboard/db/tasks";
import { createTask, updateTask, addDependency } from "@opsboard/db/mutations";
import { deriveBlocked } from "@opsboard/core";
import type { Task, TaskStatus } from "@opsboard/db/schema";
import { runV1, safeParseBody, unwrapV1, V1Error } from "../_lib/v1";
import {
  uuid,
  isoDate,
  taskStatus,
  categorySlug,
  requireUuid,
} from "../_lib/schemas";
import { toTaskView } from "../_lib/views";

// /api/v1/tasks — REST mirror of the MCP list_tasks / create_task tools.
// GET filters: ?missionId=&category=&status=&blocked=true|false.

export const runtime = "nodejs";

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  return runV1({
    req,
    op: "v1.list_tasks",
    handler: async (p) => {
      const db = createHttpDb();
      const missionIdParam = url.searchParams.get("missionId");
      const category = url.searchParams.get("category");
      const statusParam = url.searchParams.get("status");
      const blockedParam = url.searchParams.get("blocked");

      const status = statusParam
        ? taskStatus.safeParse(statusParam).data
        : undefined;
      if (statusParam && !status) {
        throw new V1Error(400, "status must be not-started | in-progress | done.");
      }

      let categoryId: string | null = null;
      if (category) {
        const cats = await getCategories(db);
        const cat = cats.find((c) => c.slug === category);
        if (!cat) throw new V1Error(400, `Unknown category: ${category}`);
        categoryId = cat.id;
      }

      const missionIds = missionIdParam
        ? [requireUuid(missionIdParam)]
        : (await getMissions(p.userId, db)).map((m) => m.id);

      const all = await getTasksByMissionIds(missionIds, p.userId, db);
      let tasks: Task[] = missionIds.flatMap((mid) =>
        all.filter((t) => t.missionId === mid),
      );

      // blocked=true|false needs the dependency graph — derive per-mission
      // with the same core function the board and MCP tools use.
      if (blockedParam === "true" || blockedParam === "false") {
        const wantBlocked = blockedParam === "true";
        const edges = await getTaskDependenciesByMissionIds(
          missionIds,
          p.userId,
          db,
        );
        const keep = new Set<string>();
        for (const mid of missionIds) {
          const mTasks = tasks.filter((t) => t.missionId === mid);
          const mTaskIds = new Set(mTasks.map((t) => t.id));
          const blockedMap = deriveBlocked(
            mTasks.map((t) => ({ id: t.id, status: t.status as TaskStatus })),
            edges
              .filter((e) => mTaskIds.has(e.taskId))
              .map((e) => ({ task_id: e.taskId, depends_on_id: e.dependsOnId })),
          );
          for (const t of mTasks) {
            if ((blockedMap.get(t.id) === true) === wantBlocked) keep.add(t.id);
          }
        }
        tasks = tasks.filter((t) => keep.has(t.id));
      }

      const filtered = tasks.filter((t) => {
        if (categoryId !== null && t.categoryId !== categoryId) return false;
        if (status && t.status !== status) return false;
        return true;
      });

      return { tasks: filtered.map(toTaskView), count: filtered.length };
    },
  });
}

const CreateTaskBody = z.object({
  missionId: uuid,
  name: z.string().trim().min(1),
  category: categorySlug.optional(),
  tooLateBy: isoDate.optional(),
  notBefore: isoDate.optional(),
  dependsOn: z.array(uuid).optional(),
  notes: z.string().optional(),
});

export async function POST(req: Request): Promise<Response> {
  const body = await safeParseBody(req, CreateTaskBody);
  if (!body.ok) return body.response;
  return runV1({
    req,
    op: "v1.create_task",
    argsForAudit: body.data,
    successStatus: 201,
    handler: async (p) => {
      const created = unwrapV1(
        await createTask(
          {
            missionId: body.data.missionId,
            name: body.data.name,
            categorySlug: body.data.category ?? null,
            tooLateBy: body.data.tooLateBy ?? null,
            notBefore: body.data.notBefore ?? null,
          },
          p.userId,
        ),
      );
      const task = created.task;

      if (body.data.notes !== undefined) {
        unwrapV1(await updateTask(task.id, { notes: body.data.notes }, p.userId));
      }

      const addedDeps: string[] = [];
      for (const depId of body.data.dependsOn ?? []) {
        const dep = await addDependency(task.id, depId, p.userId);
        if (!dep.ok) {
          throw new V1Error(
            400,
            `Task created, but dependency on ${depId} failed: ${dep.error}`,
          );
        }
        addedDeps.push(depId);
      }

      return { task: toTaskView(task), dependsOn: addedDeps };
    },
  });
}
