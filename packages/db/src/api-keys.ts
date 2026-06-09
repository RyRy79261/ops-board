import { eq } from "drizzle-orm";
import { createHttpDb } from "./index";
import type { OpsboardDb } from "./index";
import * as schema from "./schema";
import type { User, UserApiKeyRow } from "./schema";

// @opsboard/db/api-keys — the crypto-FREE access layer for the per-user BYO
// API-key vault (the `user_api_keys` table). This package NEVER touches
// node:crypto: it only reads / writes the opaque encrypted blobs (and the
// display-only `last4`) that the apps/web key-vault module produces. The
// encryption secret + AES-256-GCM live entirely in apps/web (lib/key-vault.ts),
// upholding the @opsboard/db layering (no Node crypto in the db package).
//
// Every function mirrors the other read/mutation services: an optional injected
// `db: OpsboardDb = createHttpDb()` LAST param so the node-pg integration
// harness drives the real production code.

/** The two providers a key can be stored for. */
export type ApiKeyProvider = "anthropic" | "groq";

// Mirror mutations.ts: guard userId at the boundary so a write never inserts a
// row with an empty-string PK or surfaces a raw Postgres constraint error.
function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

/**
 * Read the user's single `user_api_keys` row (it's a PK-per-user table), or
 * null when they've never stored a key. Returns the raw row — including the
 * encrypted blobs — so the apps/web resolver can decrypt; callers must NEVER
 * expose the `*Encrypted` columns to a client.
 */
export async function getUserApiKeyRow(
  userId: string,
  db: OpsboardDb = createHttpDb(),
): Promise<UserApiKeyRow | null> {
  const [row] = await db
    .select()
    .from(schema.userApiKeys)
    .where(eq(schema.userApiKeys.userId, userId))
    .limit(1);
  return row ?? null;
}

/**
 * Upsert a single provider's encrypted blob + last4 for a user (insert the row
 * if absent, else update only that provider's two columns). The blob is the
 * opaque `v1:…` string produced by apps/web's key-vault; this package never
 * inspects or decrypts it. Bumps `updated_at`.
 */
export async function setUserApiKey(
  userId: string,
  provider: ApiKeyProvider,
  encryptedBlob: string,
  last4: string,
  db: OpsboardDb = createHttpDb(),
): Promise<void> {
  if (!isNonEmptyString(userId)) {
    throw new TypeError("setUserApiKey: `userId` must be a non-empty string.");
  }
  const now = new Date();
  if (provider === "anthropic") {
    await db
      .insert(schema.userApiKeys)
      .values({
        userId,
        anthropicKeyEncrypted: encryptedBlob,
        anthropicLast4: last4,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: schema.userApiKeys.userId,
        set: {
          anthropicKeyEncrypted: encryptedBlob,
          anthropicLast4: last4,
          updatedAt: now,
        },
      });
  } else {
    await db
      .insert(schema.userApiKeys)
      .values({
        userId,
        groqKeyEncrypted: encryptedBlob,
        groqLast4: last4,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: schema.userApiKeys.userId,
        set: {
          groqKeyEncrypted: encryptedBlob,
          groqLast4: last4,
          updatedAt: now,
        },
      });
  }
}

// --- Setup-wizard gate (model B BYO onboarding) ---------------------------
// The `users.setup_completed_at` flag is what the RSC gate
// (requireOnboardedUser, apps/web/lib/session.ts) reads to decide whether to
// redirect an authenticated-but-unconfigured user to /setup. These helpers are
// crypto-FREE like the rest of this module — they only flip / read the
// timestamp. The /api/setup/complete route is the only caller of the mark
// helper, and it ONLY calls it after asserting BOTH keys are stored, so the
// gate can never open without keys.

/**
 * Mark the user's setup wizard as complete by stamping `setup_completed_at`
 * with now(). Idempotent: a no-op (zero rows updated) when the user row is
 * absent, and re-stamping an already-complete user just refreshes the
 * timestamp — both harmless. `updated_at` is bumped too. Bumping a NON-existent
 * row is fine because the caller (an authenticated route) has already had its
 * user mirrored via ensureUserSynced.
 */
export async function markUserSetupComplete(
  userId: string,
  db: OpsboardDb = createHttpDb(),
): Promise<void> {
  if (!isNonEmptyString(userId)) {
    throw new TypeError(
      "markUserSetupComplete: `userId` must be a non-empty string.",
    );
  }
  const now = new Date();
  await db
    .update(schema.users)
    .set({ setupCompletedAt: now, updatedAt: now })
    .where(eq(schema.users.id, userId));
}

/**
 * Read the user's `setup_completed_at` so callers can check onboarding status.
 * Returns the timestamp (a `Date`) when set, `null` when the wizard hasn't been
 * completed, and `null` when there's no user row at all (treated as
 * not-onboarded). The RSC gate (requireOnboardedUser) calls this right after
 * resolving the verified session principal.
 */
export async function getUserSetupCompletedAt(
  userId: string,
  db: OpsboardDb = createHttpDb(),
): Promise<Date | null> {
  const [row] = await db
    .select({ setupCompletedAt: schema.users.setupCompletedAt })
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);
  return row?.setupCompletedAt ?? null;
}

/**
 * Read the full `users` row for `userId`, or null when absent. A small
 * convenience for callers that want more than just the setup flag (the gate
 * uses getUserSetupCompletedAt; this is here for completeness / future
 * read-side use).
 */
export async function getUserRow(
  userId: string,
  db: OpsboardDb = createHttpDb(),
): Promise<User | null> {
  const [row] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);
  return row ?? null;
}

/**
 * Clear a single provider's stored key — null BOTH that provider's columns
 * (blob + last4) and bump `updated_at`. Idempotent: a no-op when there's no
 * row. The other provider's columns are left untouched.
 */
export async function clearUserApiKey(
  userId: string,
  provider: ApiKeyProvider,
  db: OpsboardDb = createHttpDb(),
): Promise<void> {
  if (!isNonEmptyString(userId)) {
    throw new TypeError("clearUserApiKey: `userId` must be a non-empty string.");
  }
  const now = new Date();
  if (provider === "anthropic") {
    await db
      .update(schema.userApiKeys)
      .set({
        anthropicKeyEncrypted: null,
        anthropicLast4: null,
        updatedAt: now,
      })
      .where(eq(schema.userApiKeys.userId, userId));
  } else {
    await db
      .update(schema.userApiKeys)
      .set({
        groqKeyEncrypted: null,
        groqLast4: null,
        updatedAt: now,
      })
      .where(eq(schema.userApiKeys.userId, userId));
  }
}
