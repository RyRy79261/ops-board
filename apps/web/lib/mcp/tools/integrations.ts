import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createHttpDb } from "@opsboard/db";
import {
  createIntegration,
  updateIntegration,
  getIntegration,
  listIntegrations,
  deleteIntegration,
  linkIntegrationToMission,
  unlinkIntegrationFromMission,
  listIntegrationsForMission,
  MAX_CONTEXT_CHARS,
} from "@opsboard/db/integrations";
import { getMission } from "@opsboard/db/missions";
import { runTool, ToolError, notFound } from "../tool-utils";
import { issueConfirmToken, consumeConfirmToken } from "../confirm-token";

// INTEGRATIONS as research context sources (docs/research-delegate-v2.md
// §v2b): an external app registers itself with a standing `context` document
// (its constraints and prior decisions); linking it to a mission makes every
// research job cued on that mission snapshot the merged linked context into
// the synthesis prompt. These tools are the MCP face of the same
// @opsboard/db/integrations services the /api/v1 routes use.
//
// Conventions: runTool everywhere, Zod at the boundary, foreign ids read as
// not-found. delete_integration follows the delete_* confirm-token dance.
// Audit rows record context LENGTH, never the document body (it can be long;
// it's the user's own content but the audit log stays scannable).

const uuid = z.uuid("Expected a UUID.");

const integrationSlug = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .regex(
    /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/,
    "Slug must be lowercase letters, digits, and hyphens.",
  );

const integrationContext = z.string().max(MAX_CONTEXT_CHARS);

/** Register the integration tool surface. Aggregated by ../server.ts. */
export function registerIntegrationTools(server: McpServer): void {
  server.registerTool(
    "register_integration",
    {
      title: "Register an integration",
      description:
        "Register an external app as a research context source. `context` is a standing document of that app's constraints (systems, dimensions, budgets, decisions — max 4000 chars); after link_integration, research cued on linked missions is informed by it. `slug` is a stable machine id (lowercase, hyphens).",
      inputSchema: {
        name: z.string().trim().min(1).max(120),
        slug: integrationSlug,
        description: z.string().trim().max(500).optional(),
        context: integrationContext.optional(),
      },
    },
    async (args, extra) =>
      runTool({
        toolName: "register_integration",
        extra,
        argsForAudit: {
          name: args.name,
          slug: args.slug,
          contextChars: args.context?.length ?? 0,
        },
        handler: async (ctx) => {
          const res = await createIntegration(
            {
              name: args.name,
              slug: args.slug,
              description: args.description ?? null,
              context: args.context ?? "",
            },
            ctx.userId,
          );
          if (!res.ok) throw new ToolError(res.error);
          return { integration: res.integration };
        },
      }),
  );

  server.registerTool(
    "update_integration",
    {
      title: "Update an integration",
      description:
        "Rename an integration, change its description, or REPLACE its context document (context is a document, not a log — send the full new text). Changes affect future research cues only; past jobs keep their snapshot.",
      inputSchema: {
        integrationId: uuid,
        name: z.string().trim().min(1).max(120).optional(),
        description: z.string().trim().max(500).nullable().optional(),
        context: integrationContext.optional(),
      },
    },
    async (args, extra) =>
      runTool({
        toolName: "update_integration",
        extra,
        argsForAudit: {
          integrationId: args.integrationId,
          name: args.name,
          contextChars: args.context?.length,
        },
        handler: async (ctx) => {
          const res = await updateIntegration(
            args.integrationId,
            {
              name: args.name,
              description: args.description,
              context: args.context,
            },
            ctx.userId,
          );
          if (!res.ok) {
            if (/not found/i.test(res.error)) notFound(res.error);
            throw new ToolError(res.error);
          }
          return { integration: res.integration };
        },
      }),
  );

  server.registerTool(
    "list_integrations",
    {
      title: "List integrations",
      description:
        "All registered integrations (research context sources), or — with `missionId` — only the ones linked to that mission. Read-only.",
      inputSchema: { missionId: uuid.optional() },
    },
    async (args, extra) =>
      runTool({
        toolName: "list_integrations",
        extra,
        argsForAudit: args,
        handler: async (ctx) => {
          if (args.missionId) {
            const mission = await getMission(args.missionId, ctx.userId);
            if (!mission) notFound("No mission with that id.");
            const integrations = await listIntegrationsForMission(
              args.missionId,
              ctx.userId,
            );
            return {
              missionId: args.missionId,
              integrations,
              count: integrations.length,
            };
          }
          const integrations = await listIntegrations(ctx.userId);
          return { integrations, count: integrations.length };
        },
      }),
  );

  server.registerTool(
    "link_integration",
    {
      title: "Link an integration to a mission",
      description:
        "Make an integration a context source for a mission: future research cued on the mission carries the integration's context. Idempotent.",
      inputSchema: { missionId: uuid, integrationId: uuid },
    },
    async (args, extra) =>
      runTool({
        toolName: "link_integration",
        extra,
        argsForAudit: args,
        handler: async (ctx) => {
          const res = await linkIntegrationToMission(
            args.missionId,
            args.integrationId,
            ctx.userId,
          );
          if (!res.ok) {
            if (/not found/i.test(res.error)) notFound(res.error);
            throw new ToolError(res.error);
          }
          return {
            ok: true,
            missionId: args.missionId,
            integrationId: args.integrationId,
          };
        },
      }),
  );

  server.registerTool(
    "unlink_integration",
    {
      title: "Unlink an integration from a mission",
      description:
        "Stop an integration informing a mission's research. Idempotent; past jobs keep their snapshot.",
      inputSchema: { missionId: uuid, integrationId: uuid },
    },
    async (args, extra) =>
      runTool({
        toolName: "unlink_integration",
        extra,
        argsForAudit: args,
        handler: async (ctx) => {
          const res = await unlinkIntegrationFromMission(
            args.missionId,
            args.integrationId,
            ctx.userId,
          );
          if (!res.ok) {
            if (/not found/i.test(res.error)) notFound(res.error);
            throw new ToolError(res.error);
          }
          return {
            ok: true,
            missionId: args.missionId,
            integrationId: args.integrationId,
          };
        },
      }),
  );

  server.registerTool(
    "delete_integration",
    {
      title: "Delete an integration",
      description:
        "Delete an integration and unlink it from every mission. DESTRUCTIVE: the first call returns a one-time confirmation token and does NOT delete; call again with that `confirm` token to actually delete. Kept notes and past job snapshots are untouched.",
      inputSchema: { integrationId: uuid, confirm: z.string().optional() },
    },
    async (args, extra) =>
      runTool({
        toolName: "delete_integration",
        extra,
        argsForAudit: {
          integrationId: args.integrationId,
          confirm: Boolean(args.confirm),
        },
        handler: async (ctx) => {
          const db = createHttpDb();
          const integration = await getIntegration(
            args.integrationId,
            ctx.userId,
            db,
          );
          if (!integration) notFound("No integration with that id.");

          if (!args.confirm) {
            const token = await issueConfirmToken(
              db,
              ctx.userId,
              "delete_integration",
              args.integrationId,
            );
            return {
              needsConfirmation: true,
              message: `This will delete the integration "${integration!.name}" and unlink it from every mission. To confirm, call delete_integration again with confirm="${token}".`,
              confirm: token,
            };
          }

          if (
            !(await consumeConfirmToken(
              db,
              ctx.userId,
              "delete_integration",
              args.integrationId,
              args.confirm,
            ))
          ) {
            throw new ToolError(
              "Confirmation token is invalid, expired, or doesn't match this integration. Call delete_integration without confirm to get a fresh token.",
            );
          }

          const res = await deleteIntegration(args.integrationId, ctx.userId, db);
          if (!res.ok) throw new ToolError(res.error);
          return {
            deleted: true,
            integrationId: args.integrationId,
            name: integration!.name,
          };
        },
      }),
  );
}
