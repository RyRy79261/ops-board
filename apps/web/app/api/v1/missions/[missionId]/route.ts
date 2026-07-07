import { z } from "zod";
import { and, eq, sql } from "drizzle-orm";
import { createHttpDb } from "@opsboard/db";
import * as schema from "@opsboard/db/schema";
import { getMission } from "@opsboard/db/missions";
import { getTasks } from "@opsboard/db/tasks";
import { deleteMission } from "@opsboard/db/mutations";
import {
  runV1,
  safeParseBody,
  unwrapV1,
  notFoundV1,
  V1Error,
} from "../../_lib/v1";
import { isoDate, requireUuid } from "../../_lib/schemas";
import { toTaskView } from "../../_lib/views";

// /api/v1/missions/[missionId] — GET (mission + tasks), PATCH (rename /
// retarget), DELETE (cascade; requires `?confirm=<missionId>` — the REST
// analogue of the MCP confirm-token dance: the caller must echo the exact
// resource id to prove intent).

export const runtime = "nodejs";

type Params = { params: Promise<{ missionId: string }> };

export async function GET(req: Request, { params }: Params): Promise<Response> {
  return runV1({
    req,
    op: "v1.get_mission",
    handler: async (p) => {
      const missionId = requireUuid((await params).missionId);
      const mission = await getMission(missionId, p.userId);
      if (!mission) notFoundV1("No mission with that id.");
      const tasks = await getTasks(missionId, p.userId);
      return { mission, tasks: tasks.map(toTaskView) };
    },
  });
}

const PatchMissionBody = z.object({
  name: z.string().trim().min(1).optional(),
  targetDate: isoDate.nullable().optional(),
});

export async function PATCH(
  req: Request,
  { params }: Params,
): Promise<Response> {
  const body = await safeParseBody(req, PatchMissionBody);
  if (!body.ok) return body.response;
  return runV1({
    req,
    op: "v1.update_mission",
    argsForAudit: body.data,
    handler: async (p) => {
      const missionId = requireUuid((await params).missionId);
      if (body.data.name === undefined && body.data.targetDate === undefined) {
        throw new V1Error(400, "Provide name and/or targetDate to update.");
      }
      // Same guarded direct update the MCP update_mission tool performs (the
      // mutations layer doesn't export updateMission yet) — WHERE scoped to
      // the authorizing user, so a foreign mission reads as not-found.
      const db = createHttpDb();
      const set: Partial<typeof schema.missions.$inferInsert> = {
        updatedAt: new Date(),
      };
      if (body.data.name !== undefined) set.name = body.data.name;
      if (body.data.targetDate !== undefined)
        set.targetDate = body.data.targetDate;
      const [row] = await db
        .update(schema.missions)
        .set(set)
        .where(
          and(
            eq(schema.missions.id, missionId),
            eq(schema.missions.userId, p.userId),
          ),
        )
        .returning();
      if (!row) notFoundV1("No mission with that id.");
      return { mission: row };
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
    op: "v1.delete_mission",
    argsForAudit: { confirm: Boolean(confirm) },
    handler: async (p) => {
      const missionId = requireUuid((await params).missionId);
      const db = createHttpDb();
      const mission = await getMission(missionId, p.userId, db);
      if (!mission) notFoundV1("No mission with that id.");
      const [{ count } = { count: 0 }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.tasks)
        .where(
          and(
            eq(schema.tasks.missionId, missionId),
            eq(schema.tasks.userId, p.userId),
          ),
        );
      if (confirm !== missionId) {
        throw new V1Error(
          409,
          `This deletes the mission "${mission!.name}" and all ${count} of its tasks. To confirm, repeat the request with ?confirm=${missionId}.`,
          "CONFIRM_REQUIRED",
        );
      }
      unwrapV1(await deleteMission(missionId, p.userId, db));
      return {
        deleted: true,
        missionId,
        name: mission!.name,
        deletedTaskCount: Number(count),
      };
    },
  });
}
