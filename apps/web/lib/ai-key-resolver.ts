import "server-only";

/**
 * Resolve which API key to use for an AI request (OpsBoard BYO model B).
 *
 * PURE BYO — every user (including the owner) brings their OWN keys via the
 * setup wizard. There is NO env-var key and NO email whitelist: the only source
 * is the caller's stored key. (The earlier ALLOWED_EMAILS / process.env
 * ANTHROPIC_API_KEY|GROQ_API_KEY fallback, adapted from intake-tracker, has been
 * DELETED — it is impossible to reach an env key here regardless of what's set
 * in the environment.) The resolution, per provider, is:
 *
 *   1. The caller's OWN stored key (user_api_keys row → decrypt with the
 *      user+provider AAD).
 *   2. Otherwise throw NoAiKeyError(provider) so the route FAILS CLOSED with
 *      HTTP 402 (see ./ai-error-response.ts) and the user is sent to /setup.
 *
 * SECURITY: `userId` is ALWAYS the verified session principal, never client
 * input. The decrypted plaintext key is returned only to the immediate caller
 * (the voice route / the setup dictation-test) for a single outbound vendor
 * request — it is never persisted, logged, or returned to the browser.
 */

import { createHttpDb } from "@opsboard/db";
import { getUserApiKeyRow } from "@opsboard/db/api-keys";
import { decryptKey } from "@/lib/key-vault";

export type AiProvider = "anthropic" | "groq";

export class NoAiKeyError extends Error {
  constructor(public provider: AiProvider) {
    super(`No ${provider} API key configured for user`);
    this.name = "NoAiKeyError";
  }
}

/**
 * Resolve the plaintext API key for `provider` for the SESSION user. Reads the
 * user's own stored key (decrypting with the user+provider AAD); if none is
 * stored, throws NoAiKeyError — there is no fallback. `db` is injectable so the
 * integration test can drive the real resolution against a node-pg client.
 */
export async function resolveAiKey(
  userId: string,
  provider: AiProvider,
  db = createHttpDb(),
): Promise<string> {
  const row = await getUserApiKeyRow(userId, db);
  const ownEncrypted =
    provider === "anthropic" ? row?.anthropicKeyEncrypted : row?.groqKeyEncrypted;
  if (row && ownEncrypted) {
    return decryptKey(ownEncrypted, { userId, provider });
  }

  // Pure BYO — nothing stored, fail closed.
  throw new NoAiKeyError(provider);
}
