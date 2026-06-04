import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerOpsboardDataTools } from "./tools/opsboard";

// ADAPTED from camp-404 apps/web/lib/mcp/server.ts (scaffolding-plan.md S6).
// `registerOpsboardTools(server)` is the single entry point that registers the
// entire OpsBoard MCP tool surface on a McpServer instance — it's what the
// `[transport]` route's createMcpHandler factory calls (camp called the
// equivalent `registerCampMcpTools`). Camp fanned out across one file per
// domain (people/teams/recipes/…); OpsBoard's surface is single-user and lives
// in ./tools/opsboard.ts (Phase 1 = a "ping" stub; Phase 2 = the 14 tools).
// Keep the route depending only on this function so adding/removing tool
// modules never touches the handler.

/** Register every OpsBoard MCP tool on `server`. */
export function registerOpsboardTools(server: McpServer): void {
  registerOpsboardDataTools(server);
}
