import "server-only";

import type { OpsboardDb } from "@opsboard/db";
import { isDestructive, type VoiceIntent } from "@opsboard/types";
import {
  issueConfirmToken,
  consumeConfirmToken,
} from "@/lib/mcp/confirm-token";

// Confirm-token gate for the voice Shape-B re-issue (/api/voice/command JSON).
// handleReissue is the ONLY path that runs a destructive voice mutation
// (delete_task / delete_mission). It previously executed any intent on a bare
// client-supplied `confirmed: true`, so an authenticated user could POST a
// crafted delete and skip the confirm gate entirely (own data, but ungated).
// Now a destructive re-issue must present a short-lived, single-use token the
// SERVER issued when it gated (mustConfirm) or disambiguated the action —
// proving the FAB actually surfaced the confirm/disambiguation step. Reuses the
// durable mcp_confirm_tokens store (lib/mcp/confirm-token.ts): TTL'd, single-use
// (atomic consume), user-bound.
//
// BINDING: {userId, "voice:<action>"}. NOT the full intent — the disambiguation
// re-issue rebinds the resolving hint, so the intent changes between issue and
// consume; the action TYPE is the stable key. targetId is unused (""). The
// "voice:" prefix keeps the action namespace distinct from the MCP delete tokens
// that share this table but bind to a real target id.

function voiceConfirmAction(intent: VoiceIntent): string {
  return `voice:${intent.intent}`;
}

/**
 * Issue a confirm token for a destructive voice intent the server is gating or
 * disambiguating, to hand back to the FAB in the response. Returns the RAW token
 * (only its hash is persisted).
 */
export async function issueVoiceConfirmToken(
  db: OpsboardDb,
  userId: string,
  intent: VoiceIntent,
): Promise<string> {
  return issueConfirmToken(db, userId, voiceConfirmAction(intent), "");
}

/**
 * Whether a Shape-B re-issue may execute. Non-destructive intents always may (a
 * forged `confirmed:true` on a non-destructive op is harmless). A destructive
 * intent requires a valid, server-issued, single-use token — CONSUMED here, so
 * it can never authorise a second delete. Returns false (→ reject) when the
 * token is missing, expired, already used, or was issued for a different action.
 */
export async function reissueAuthorized(
  db: OpsboardDb,
  userId: string,
  intent: VoiceIntent,
  token: string | undefined,
): Promise<boolean> {
  if (!isDestructive(intent)) return true;
  return consumeConfirmToken(
    db,
    userId,
    voiceConfirmAction(intent),
    "",
    token ?? "",
  );
}
