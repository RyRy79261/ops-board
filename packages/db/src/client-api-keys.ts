import { and, desc, eq, gt, isNull, or, sql } from "drizzle-orm";
import { createHttpDb } from "./index";
import type { OpsboardDb } from "./index";
import * as schema from "./schema";
import type { ClientApiKey } from "./schema";

// @opsboard/db/client-api-keys — persistence for PROGRAMMATIC API keys (the
// /api/v1 REST surface's machine credentials). Mirrors ./mcp.ts discipline:
// only the SHA-256 of a key is ever stored (the caller hashes; this package
// stays crypto-free), lookups are hash-based, and housekeeping writes are
// best-effort. Mirrors ./mutations.ts style: input guards before SQL, an
// injected `db` LAST param, {ok}|{ok:false,error} results for domain failures.
//
// The PLAINTEXT key never enters this module — the web layer generates it,
// shows it once, and passes only { hash, prefix } down.

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(v: unknown): v is string {
  return typeof v === "string" && UUID_RE.test(v);
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export type CreateClientApiKeyResult =
  | { ok: true; key: ClientApiKey }
  | { ok: false; error: string };

export interface CreateClientApiKeyInput {
  /** Operator-facing label, e.g. "van-build console". */
  name: string;
  /** SHA-256 (hex) of the plaintext key — never the plaintext itself. */
  keyHash: string;
  /** Display prefix of the plaintext ("opsb_a1b2…") — for the settings list. */
  prefix: string;
}

/** Cap active (non-revoked) keys per user — a runaway creator is a bug. */
export const MAX_ACTIVE_KEYS_PER_USER = 20;

/** Mint a key row for `userId`. The caller has already hashed the secret. */
export async function createClientApiKey(
  input: CreateClientApiKeyInput,
  userId: string,
  db: OpsboardDb = createHttpDb(),
): Promise<CreateClientApiKeyResult> {
  if (!isNonEmptyString(input.name)) {
    throw new TypeError(
      "createClientApiKey: `name` must be a non-empty string.",
    );
  }
  if (!isNonEmptyString(input.keyHash) || !isNonEmptyString(input.prefix)) {
    throw new TypeError(
      "createClientApiKey: `keyHash` and `prefix` are required.",
    );
  }
  if (!isNonEmptyString(userId)) {
    throw new TypeError(
      "createClientApiKey: `userId` must be a non-empty string.",
    );
  }

  const [{ activeCount } = { activeCount: 0 }] = await db
    .select({ activeCount: sql<number>`count(*)::int` })
    .from(schema.clientApiKeys)
    .where(
      and(
        eq(schema.clientApiKeys.userId, userId),
        isNull(schema.clientApiKeys.revokedAt),
      ),
    );
  if (Number(activeCount) >= MAX_ACTIVE_KEYS_PER_USER) {
    return {
      ok: false,
      error: `You already have ${MAX_ACTIVE_KEYS_PER_USER} active API keys — revoke one first.`,
    };
  }

  const [key] = await db
    .insert(schema.clientApiKeys)
    .values({
      userId,
      name: input.name.trim(),
      keyHash: input.keyHash,
      prefix: input.prefix,
    })
    .returning();
  if (!key) return { ok: false, error: "Couldn't create the key — try again." };
  return { ok: true, key };
}

/** All of a user's keys, newest first (revoked included, flagged by revokedAt). */
export async function listClientApiKeys(
  userId: string,
  db: OpsboardDb = createHttpDb(),
): Promise<ClientApiKey[]> {
  if (!isNonEmptyString(userId)) {
    throw new TypeError(
      "listClientApiKeys: `userId` must be a non-empty string.",
    );
  }
  return db
    .select()
    .from(schema.clientApiKeys)
    .where(eq(schema.clientApiKeys.userId, userId))
    .orderBy(desc(schema.clientApiKeys.createdAt));
}

/**
 * Revoke a key, scoped to its owner. Idempotent — revoking an already-revoked
 * key succeeds (keeps the ORIGINAL revokedAt). Unknown/foreign id → {ok:false}.
 */
export async function revokeClientApiKey(
  id: string,
  userId: string,
  db: OpsboardDb = createHttpDb(),
): Promise<{ ok: true; key: ClientApiKey } | { ok: false; error: string }> {
  if (!isUuid(id)) {
    throw new TypeError("revokeClientApiKey: `id` must be a valid UUID.");
  }
  if (!isNonEmptyString(userId)) {
    throw new TypeError(
      "revokeClientApiKey: `userId` must be a non-empty string.",
    );
  }
  const [row] = await db
    .update(schema.clientApiKeys)
    .set({ revokedAt: sql`coalesce(${schema.clientApiKeys.revokedAt}, now())` })
    .where(
      and(
        eq(schema.clientApiKeys.id, id),
        eq(schema.clientApiKeys.userId, userId),
      ),
    )
    .returning();
  if (!row) return { ok: false, error: "Key not found." };
  return { ok: true, key: row };
}

/**
 * Find a non-revoked key by the SHA-256 of the presented secret. The /api/v1
 * bearer verifier's single lookup. Returns null for unknown/revoked hashes.
 * (Keys don't expire on a clock — revocation is the kill switch — but the
 * shape mirrors findActiveAccessToken so a TTL is one predicate away.)
 */
export async function findActiveClientApiKeyByHash(
  keyHash: string,
  db: OpsboardDb = createHttpDb(),
): Promise<ClientApiKey | null> {
  if (!isNonEmptyString(keyHash)) {
    throw new TypeError(
      "findActiveClientApiKeyByHash: `keyHash` must be a non-empty string.",
    );
  }
  const [row] = await db
    .select()
    .from(schema.clientApiKeys)
    .where(
      and(
        eq(schema.clientApiKeys.keyHash, keyHash),
        isNull(schema.clientApiKeys.revokedAt),
      ),
    )
    .limit(1);
  return row ?? null;
}

/** Best-effort `last_used_at` bump — never throws into the request path. */
export async function touchClientApiKey(
  id: string,
  db: OpsboardDb = createHttpDb(),
): Promise<void> {
  try {
    await db
      .update(schema.clientApiKeys)
      .set({ lastUsedAt: new Date() })
      .where(
        and(
          eq(schema.clientApiKeys.id, id),
          // A key revoked between verify and touch shouldn't look "used after
          // revocation" in the audit trail.
          or(
            isNull(schema.clientApiKeys.revokedAt),
            gt(schema.clientApiKeys.revokedAt, new Date()),
          ),
        ),
      );
  } catch {
    // Housekeeping only.
  }
}
