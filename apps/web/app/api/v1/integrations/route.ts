import { z } from "zod";
import {
  createIntegration,
  listIntegrations,
  MAX_CONTEXT_CHARS,
} from "@opsboard/db/integrations";
import { runV1, safeParseBody, unwrapV1 } from "../_lib/v1";

// /api/v1/integrations — register/list external apps as research context
// sources (docs/research-delegate-v2.md §v2b). An integration's `context`
// document is merged into research jobs cued on missions it's linked to.

export const runtime = "nodejs";

export async function GET(req: Request): Promise<Response> {
  return runV1({
    req,
    op: "v1.list_integrations",
    handler: async (p) => {
      const integrations = await listIntegrations(p.userId);
      return { integrations, count: integrations.length };
    },
  });
}

const CreateIntegrationBody = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(64)
    .regex(
      /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/,
      "Slug must be lowercase letters, digits, and hyphens.",
    ),
  description: z.string().trim().max(500).optional(),
  context: z.string().max(MAX_CONTEXT_CHARS).optional(),
});

export async function POST(req: Request): Promise<Response> {
  const body = await safeParseBody(req, CreateIntegrationBody);
  if (!body.ok) return body.response;
  return runV1({
    req,
    op: "v1.register_integration",
    // Audit the identity, not the (potentially long) context document.
    argsForAudit: {
      name: body.data.name,
      slug: body.data.slug,
      contextChars: body.data.context?.length ?? 0,
    },
    successStatus: 201,
    handler: async (p) => {
      const result = unwrapV1(
        await createIntegration(
          {
            name: body.data.name,
            slug: body.data.slug,
            description: body.data.description ?? null,
            context: body.data.context ?? "",
          },
          p.userId,
        ),
      );
      return { integration: result.integration };
    },
  });
}
