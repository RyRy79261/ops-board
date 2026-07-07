import {
  linkIntegrationToMission,
  unlinkIntegrationFromMission,
} from "@opsboard/db/integrations";
import { runV1, unwrapV1 } from "../../../../_lib/v1";
import { requireUuid } from "../../../../_lib/schemas";

// /api/v1/missions/[missionId]/integrations/[integrationId] — PUT links the
// integration as a context source for the mission (idempotent), DELETE
// unlinks (idempotent). Both endpoints must belong to the principal.

export const runtime = "nodejs";

type Params = { params: Promise<{ missionId: string; integrationId: string }> };

export async function PUT(req: Request, { params }: Params): Promise<Response> {
  return runV1({
    req,
    op: "v1.link_integration",
    successStatus: 201,
    handler: async (p) => {
      const { missionId: rawM, integrationId: rawI } = await params;
      const missionId = requireUuid(rawM);
      const integrationId = requireUuid(rawI);
      unwrapV1(await linkIntegrationToMission(missionId, integrationId, p.userId));
      return { ok: true, missionId, integrationId };
    },
  });
}

export async function DELETE(
  req: Request,
  { params }: Params,
): Promise<Response> {
  return runV1({
    req,
    op: "v1.unlink_integration",
    handler: async (p) => {
      const { missionId: rawM, integrationId: rawI } = await params;
      const missionId = requireUuid(rawM);
      const integrationId = requireUuid(rawI);
      unwrapV1(
        await unlinkIntegrationFromMission(missionId, integrationId, p.userId),
      );
      return { ok: true, missionId, integrationId };
    },
  });
}
