import { z } from "zod";
import {
  getIntegration,
  updateIntegration,
  deleteIntegration,
  MAX_CONTEXT_CHARS,
} from "@opsboard/db/integrations";
import {
  runV1,
  safeParseBody,
  unwrapV1,
  notFoundV1,
  V1Error,
} from "../../_lib/v1";
import { requireUuid } from "../../_lib/schemas";

// /api/v1/integrations/[integrationId] — GET, PATCH (rename / redescribe /
// REPLACE the context document), DELETE (requires `?confirm=<integrationId>`;
// unlinks from all missions via cascade — kept notes and past job snapshots
// are untouched).

export const runtime = "nodejs";

type Params = { params: Promise<{ integrationId: string }> };

export async function GET(req: Request, { params }: Params): Promise<Response> {
  return runV1({
    req,
    op: "v1.get_integration",
    handler: async (p) => {
      const integrationId = requireUuid((await params).integrationId);
      const integration = await getIntegration(integrationId, p.userId);
      if (!integration) notFoundV1("No integration with that id.");
      return { integration };
    },
  });
}

const PatchIntegrationBody = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  context: z.string().max(MAX_CONTEXT_CHARS).optional(),
});

export async function PATCH(
  req: Request,
  { params }: Params,
): Promise<Response> {
  const body = await safeParseBody(req, PatchIntegrationBody);
  if (!body.ok) return body.response;
  return runV1({
    req,
    op: "v1.update_integration",
    argsForAudit: {
      name: body.data.name,
      contextChars: body.data.context?.length,
    },
    handler: async (p) => {
      const integrationId = requireUuid((await params).integrationId);
      const result = unwrapV1(
        await updateIntegration(integrationId, body.data, p.userId),
      );
      return { integration: result.integration };
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
    op: "v1.delete_integration",
    argsForAudit: { confirm: Boolean(confirm) },
    handler: async (p) => {
      const integrationId = requireUuid((await params).integrationId);
      const integration = await getIntegration(integrationId, p.userId);
      if (!integration) notFoundV1("No integration with that id.");
      if (confirm !== integrationId) {
        throw new V1Error(
          409,
          `This deletes the integration "${integration!.name}" and unlinks it from every mission. To confirm, repeat the request with ?confirm=${integrationId}.`,
          "CONFIRM_REQUIRED",
        );
      }
      unwrapV1(await deleteIntegration(integrationId, p.userId));
      return { deleted: true, integrationId, name: integration!.name };
    },
  });
}
