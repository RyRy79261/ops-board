import { getMission } from "@opsboard/db/missions";
import { listIntegrationsForMission } from "@opsboard/db/integrations";
import { runV1, notFoundV1 } from "../../../_lib/v1";
import { requireUuid } from "../../../_lib/schemas";

// GET /api/v1/missions/[missionId]/integrations — the mission's linked
// research context sources (what a cue on this mission will snapshot).

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ missionId: string }> },
): Promise<Response> {
  return runV1({
    req,
    op: "v1.list_mission_integrations",
    handler: async (p) => {
      const missionId = requireUuid((await params).missionId);
      const mission = await getMission(missionId, p.userId);
      if (!mission) notFoundV1("No mission with that id.");
      const integrations = await listIntegrationsForMission(
        missionId,
        p.userId,
      );
      return { missionId, integrations, count: integrations.length };
    },
  });
}
