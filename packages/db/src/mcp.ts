import { and, eq, gt, isNull } from "drizzle-orm";
import { createHttpDb } from "./index";
import * as schema from "./schema";

// @opsboard/db/mcp — the server-only MCP auth-state helpers the S6 OAuth
// shell depends on (`appendMcpAuditLog`, token lookup/touch). OpsBoard is
// single-user: camp-404 scoped every row to a `users.id`; here we write a
// single constant principal into the nullable `principal_id` column instead.

/**
 * The single-user principal. OpsBoard has no users table — every MCP call
 * acts as this constant principal, written into the nullable `principal_id`
 * columns so the audit / token rows stay attributable.
 */
export const MCP_PRINCIPAL_ID = "owner";

/** Append one row to mcp_audit_log. Best-effort — never throws into the caller. */
export async function appendMcpAuditLog(input: {
  principalId?: string | null;
  clientId: string;
  tool: string;
  argsJson: Record<string, unknown> | null;
  outcome: "success" | "error";
  errorMessage?: string | null;
  durationMs?: number | null;
}): Promise<void> {
  try {
    const db = createHttpDb();
    await db.insert(schema.mcpAuditLog).values({
      principalId: input.principalId ?? MCP_PRINCIPAL_ID,
      clientId: input.clientId,
      tool: input.tool,
      argsJson: input.argsJson,
      outcome: input.outcome,
      errorMessage: input.errorMessage ?? null,
      durationMs: input.durationMs ?? null,
    });
  } catch {
    // Auditing must never break a tool call. Swallow + rely on DB-level
    // monitoring for persistent audit-log write failures.
  }
}

/** Bump `mcp_oauth_clients.last_used_at` and `mcp_access_tokens.last_used_at`. */
export async function touchAccessToken(tokenHash: string): Promise<void> {
  try {
    const db = createHttpDb();
    const now = new Date();
    const [token] = await db
      .update(schema.mcpAccessTokens)
      .set({ lastUsedAt: now })
      .where(eq(schema.mcpAccessTokens.tokenHash, tokenHash))
      .returning({ clientId: schema.mcpAccessTokens.clientId });
    if (token) {
      await db
        .update(schema.mcpOauthClients)
        .set({ lastUsedAt: now })
        .where(eq(schema.mcpOauthClients.clientId, token.clientId));
    }
  } catch {
    // Best-effort housekeeping.
  }
}

/**
 * Find a non-revoked, non-expired access token by its SHA-256 hash.
 * Returns null when the hash is unknown / expired / revoked.
 */
export async function findActiveAccessToken(
  tokenHash: string,
): Promise<schema.McpAccessToken | null> {
  const db = createHttpDb();
  const [row] = await db
    .select()
    .from(schema.mcpAccessTokens)
    .where(
      and(
        eq(schema.mcpAccessTokens.tokenHash, tokenHash),
        isNull(schema.mcpAccessTokens.revokedAt),
        gt(schema.mcpAccessTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);
  return row ?? null;
}
