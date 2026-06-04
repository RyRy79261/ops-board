import "server-only";

/**
 * Resolve which API key to use for an AI request (OpsBoard BYO model B).
 *
 * ADAPTED from intake-tracker (src/lib/ai-key-resolver.ts). intake-tracker's
 * key-SHARING tier (user_key_shares / `shared_from`) is DELIBERATELY dropped —
 * out of scope for OpsBoard. The remaining priority, per provider, is:
 *
 *   1. The caller's OWN stored key (user_api_keys row → decrypt with AAD).
 *   2. The server env-var key, but ONLY when the caller's email is on the
 *      ALLOWED_EMAILS whitelist (a comma-separated, lowercased list). If that
 *      list is EMPTY the env-var fallback is SKIPPED ENTIRELY — i.e. pure BYO,
 *      every user must supply their own key. This is the ONLY env-var path.
 *   3. Otherwise throw NoAiKeyError(provider) so the route can FAIL CLOSED
 *      with HTTP 402 (see ./ai-error-response.ts).
 *
 * SECURITY: `userId` + `email` are ALWAYS the verified session principal,
 * never client input. The decrypted plaintext key is returned only to the
 * immediate caller (the voice route) for a single outbound vendor request — it
 * is never persisted, logged, or returned to the browser.
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

function getAllowedEmails(): string[] {
  return (process.env.ALLOWED_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function envKeyFor(provider: AiProvider): string | undefined {
  return provider === "anthropic"
    ? process.env.ANTHROPIC_API_KEY
    : process.env.GROQ_API_KEY;
}

/**
 * Resolve the plaintext API key for `provider` for the SESSION user. Reads the
 * user's own stored key first (decrypting with the user+provider AAD), then the
 * whitelisted env-var fallback, else throws NoAiKeyError. `db` is injectable so
 * the integration test drives the real resolution against a node-pg client.
 */
export async function resolveAiKey(
  userId: string,
  email: string | null | undefined,
  provider: AiProvider,
  db = createHttpDb(),
): Promise<string> {
  // 1. The user's own stored key wins.
  const row = await getUserApiKeyRow(userId, db);
  const ownEncrypted =
    provider === "anthropic" ? row?.anthropicKeyEncrypted : row?.groqKeyEncrypted;
  if (row && ownEncrypted) {
    return decryptKey(ownEncrypted, { userId, provider });
  }

  // 2. Env-var fallback, ONLY for whitelisted emails. If ALLOWED_EMAILS is
  //    empty the whole branch is skipped → pure BYO.
  const envKey = envKeyFor(provider);
  if (envKey && email) {
    const allowed = getAllowedEmails();
    if (allowed.length > 0 && allowed.includes(email.toLowerCase())) {
      return envKey;
    }
  }

  // 3. Nothing configured — fail closed.
  throw new NoAiKeyError(provider);
}
