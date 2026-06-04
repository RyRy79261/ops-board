import { generateOpaqueToken, sha256 } from "./tokens";

// Confirmation-token scheme for the DESTRUCTIVE MCP tools (delete_task /
// delete_mission). project_brief.md §4 + research-dossier §8 require these to
// mirror the voice `needsConfirmation` flow over the MCP transport: a delete is
// NEVER executed on the first call. The first call issues a short-lived,
// single-use token bound to the exact target id; only a second call presenting
// that same token (for that same id) performs the delete.
//
// Minimal by design: a tiny in-process Map keyed by the SHA-256 of the issued
// token, with a TTL and one-shot consume. No DB row, no env var — the worst a
// stale/forged token can do is fail the constant-time match and force the
// caller to start the confirm dance over. (A server restart simply invalidates
// outstanding tokens, which is the safe direction for a destructive action.)

/** How long an issued confirmation token stays valid. */
const CONFIRM_TTL_MS = 5 * 60_000; // 5 minutes

/** A pending confirmation: which action + target the token authorises, and when it expires. */
interface PendingConfirm {
  /** The destructive tool the token was minted for (delete_task | delete_mission). */
  action: string;
  /** The exact target id the token authorises deleting. */
  targetId: string;
  /** Epoch ms after which the token is no longer accepted. */
  expiresAt: number;
}

// Keyed by sha256(token) so a leaked process-memory dump can't replay a raw
// token. Module-scoped: one map per server instance, which is all a single-user
// tool needs.
const pending = new Map<string, PendingConfirm>();

/** Drop every expired entry. Cheap — called on each issue/consume. */
function sweep(now: number): void {
  for (const [key, entry] of pending) {
    if (entry.expiresAt <= now) pending.delete(key);
  }
}

/**
 * Issue a fresh confirmation token for `action` on `targetId`. Returns the
 * RAW token to hand back to the caller; only its hash is retained server-side.
 */
export function issueConfirmToken(
  action: string,
  targetId: string,
  now: number = Date.now(),
): string {
  sweep(now);
  const token = generateOpaqueToken(18);
  pending.set(sha256(token), {
    action,
    targetId,
    expiresAt: now + CONFIRM_TTL_MS,
  });
  return token;
}

/**
 * Check + CONSUME a presented confirmation token. Returns true only when the
 * token is known, unexpired, and was issued for this exact `action` + `targetId`
 * — and removes it (single-use) so the same token can never delete twice.
 * Returns false (without consuming a mismatched entry) otherwise.
 */
export function consumeConfirmToken(
  action: string,
  targetId: string,
  token: string,
  now: number = Date.now(),
): boolean {
  sweep(now);
  if (!token) return false;
  const key = sha256(token);
  const entry = pending.get(key);
  if (!entry) return false;
  if (entry.expiresAt <= now) {
    pending.delete(key);
    return false;
  }
  if (entry.action !== action || entry.targetId !== targetId) return false;
  pending.delete(key); // single-use
  return true;
}
