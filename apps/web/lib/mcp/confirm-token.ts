import { and, eq, gt, lte } from "drizzle-orm";
import type { OpsboardDb } from "@opsboard/db";
import * as schema from "@opsboard/db/schema";
import { generateOpaqueToken, sha256 } from "./tokens";

// Confirmation-token scheme for the DESTRUCTIVE MCP tools (delete_task /
// delete_mission). project_brief.md §4 + research-dossier §8 require these to
// mirror the voice `needsConfirmation` flow over the MCP transport: a delete is
// NEVER executed on the first call. The first call issues a short-lived,
// single-use token bound to the exact target; only a second call presenting that
// token (for the same user + action + target) performs the delete.
//
// DURABLE (DB-backed): the issue call and the confirming call are SEPARATE HTTP
// requests that, under serverless (Vercel), can land on DIFFERENT function
// instances. The previous in-process Map therefore never found the token on the
// second call, so deletes could never complete. State lives in the
// `mcp_confirm_tokens` table instead: each row is TTL'd, single-use (consumed by
// an atomic DELETE … RETURNING — the DB guarantees only one concurrent consume
// wins, so a token can't delete twice across instances), and bound to the
// issuing user. Only the SHA-256 of the token is stored, so a DB dump can't
// replay a raw token.

/** How long an issued confirmation token stays valid. */
const CONFIRM_TTL_MS = 5 * 60_000; // 5 minutes

/**
 * Issue a fresh confirmation token for `userId` to perform `action` on
 * `targetId`. Returns the RAW token to hand back to the caller; only its hash is
 * persisted. Also sweeps expired rows (cheap — the index covers it).
 */
export async function issueConfirmToken(
  db: OpsboardDb,
  userId: string,
  action: string,
  targetId: string,
  now: number = Date.now(),
): Promise<string> {
  // Best-effort GC of expired rows so the table stays small.
  await db
    .delete(schema.mcpConfirmTokens)
    .where(lte(schema.mcpConfirmTokens.expiresAt, new Date(now)));

  const token = generateOpaqueToken(18);
  await db.insert(schema.mcpConfirmTokens).values({
    tokenHash: sha256(token),
    userId,
    action,
    targetId,
    expiresAt: new Date(now + CONFIRM_TTL_MS),
  });
  return token;
}

/**
 * Check + CONSUME a presented confirmation token. Returns true only when the
 * token is known, unexpired, and was issued for this exact `userId` + `action` +
 * `targetId` — deleting it (single-use) so it can never delete twice. Returns
 * false otherwise (a mismatch deletes nothing). The match + delete are ONE
 * atomic statement, so this is correct even when two requests race or run on
 * different serverless instances.
 */
export async function consumeConfirmToken(
  db: OpsboardDb,
  userId: string,
  action: string,
  targetId: string,
  token: string,
  now: number = Date.now(),
): Promise<boolean> {
  if (!token) return false;
  const consumed = await db
    .delete(schema.mcpConfirmTokens)
    .where(
      and(
        eq(schema.mcpConfirmTokens.tokenHash, sha256(token)),
        eq(schema.mcpConfirmTokens.userId, userId),
        eq(schema.mcpConfirmTokens.action, action),
        eq(schema.mcpConfirmTokens.targetId, targetId),
        gt(schema.mcpConfirmTokens.expiresAt, new Date(now)),
      ),
    )
    .returning({ tokenHash: schema.mcpConfirmTokens.tokenHash });
  return consumed.length > 0;
}
