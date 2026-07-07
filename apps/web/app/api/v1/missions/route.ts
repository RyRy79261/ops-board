import { z } from "zod";
import { getMissions } from "@opsboard/db/missions";
import { createMission } from "@opsboard/db/mutations";
import { runV1, safeParseBody, unwrapV1 } from "../_lib/v1";
import { isoDate } from "../_lib/schemas";

// /api/v1/missions — REST mirror of the MCP list_missions / create_mission
// tools (docs/research-delegate-v2.md §v2a). Thin over the same services.

export const runtime = "nodejs";

export async function GET(req: Request): Promise<Response> {
  return runV1({
    req,
    op: "v1.list_missions",
    handler: async (p) => {
      const missions = await getMissions(p.userId);
      return { missions, count: missions.length };
    },
  });
}

const CreateMissionBody = z.object({
  name: z.string().trim().min(1),
  targetDate: isoDate.optional(),
});

export async function POST(req: Request): Promise<Response> {
  const body = await safeParseBody(req, CreateMissionBody);
  if (!body.ok) return body.response;
  return runV1({
    req,
    op: "v1.create_mission",
    argsForAudit: body.data,
    successStatus: 201,
    handler: async (p) => {
      const result = unwrapV1(
        await createMission(
          { name: body.data.name, targetDate: body.data.targetDate ?? null },
          p.userId,
        ),
      );
      return { mission: result.mission };
    },
  });
}
