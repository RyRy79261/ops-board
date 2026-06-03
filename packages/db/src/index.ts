// @opsboard/db — Drizzle schema + two drivers (createHttpDb / createPooledDb)
// + a BUILD_PLACEHOLDER_URL so builds don't need a live DB. Populated in S2:
// missions / categories / tasks / task_dependencies + the MCP OAuth/audit
// tables (mcpOauthClients / mcpAuthCodes / mcpAccessTokens / mcp_audit_log),
// which the S6 OAuth shell hard-depends on. See docs/scaffolding-plan.md S2.

export const BUILD_PLACEHOLDER_URL =
  "postgres://placeholder:placeholder@localhost:5432/placeholder";

export {};
