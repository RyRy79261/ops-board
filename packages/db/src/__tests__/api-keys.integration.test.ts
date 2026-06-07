import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import * as schema from "../schema";
import {
  clearUserApiKey,
  getUserApiKeyRow,
  setUserApiKey,
} from "../api-keys";
import { createTestDb, TEST_USER_ID, type TestDb } from "./db-harness";

// Real-Postgres suite for the crypto-FREE BYO key-vault access module
// (../api-keys.ts). GUARDED: skipped unless a real DATABASE_URL is present, so
// `pnpm test` with no DB passes by skipping (CI's postgres service sets it and
// the suite runs). These tests prove the upsert/clear/read mechanics — the
// AES-256-GCM crypto itself lives in apps/web and is exercised there. Blobs are
// treated as opaque strings; this layer never inspects them.
const DB_URL = process.env.DATABASE_URL;
const hasDb =
  !!DB_URL &&
  !DB_URL.includes("placeholder") &&
  !DB_URL.includes("build:build");

// Opaque stand-ins for the apps/web `v1:…` encrypted blobs.
const ANTHROPIC_BLOB = "v1:anthropic-iv:anthropic-tag:anthropic-ct";
const GROQ_BLOB = "v1:groq-iv:groq-tag:groq-ct";

describe.skipIf(!hasDb)("@opsboard/db api-keys access module (real Postgres)", () => {
  let h: TestDb;

  beforeAll(async () => {
    h = createTestDb(DB_URL);
    await h.migrate();
  });

  afterAll(async () => {
    if (h) await h.close();
  });

  beforeEach(async () => {
    await h.reset();
    await h.seedUser();
  });

  it("getUserApiKeyRow returns null when the user has stored no key", async () => {
    expect(await getUserApiKeyRow(TEST_USER_ID, h.db)).toBeNull();
  });

  it("setUserApiKey inserts a new row for the first provider stored", async () => {
    await setUserApiKey(TEST_USER_ID, "anthropic", ANTHROPIC_BLOB, "AB12", h.db);

    const row = await getUserApiKeyRow(TEST_USER_ID, h.db);
    expect(row).not.toBeNull();
    expect(row!.userId).toBe(TEST_USER_ID);
    expect(row!.anthropicKeyEncrypted).toBe(ANTHROPIC_BLOB);
    expect(row!.anthropicLast4).toBe("AB12");
    // The other provider stays untouched (null).
    expect(row!.groqKeyEncrypted).toBeNull();
    expect(row!.groqLast4).toBeNull();
    expect(row!.createdAt).toBeInstanceOf(Date);
    expect(row!.updatedAt).toBeInstanceOf(Date);
  });

  it("setUserApiKey upserts the SAME row for a second provider (no duplicate)", async () => {
    await setUserApiKey(TEST_USER_ID, "anthropic", ANTHROPIC_BLOB, "AB12", h.db);
    await setUserApiKey(TEST_USER_ID, "groq", GROQ_BLOB, "GQ99", h.db);

    const row = await getUserApiKeyRow(TEST_USER_ID, h.db);
    // Both providers now live on one row (userId is the PK).
    expect(row!.anthropicKeyEncrypted).toBe(ANTHROPIC_BLOB);
    expect(row!.anthropicLast4).toBe("AB12");
    expect(row!.groqKeyEncrypted).toBe(GROQ_BLOB);
    expect(row!.groqLast4).toBe("GQ99");

    // Exactly one row for the user — onConflictDoUpdate, not a second insert.
    const allRows = await h.client
      .select()
      .from(schema.userApiKeys)
      .where(eq(schema.userApiKeys.userId, TEST_USER_ID));
    expect(allRows).toHaveLength(1);
  });

  it("setUserApiKey re-storing a provider overwrites only that provider's columns", async () => {
    await setUserApiKey(TEST_USER_ID, "anthropic", ANTHROPIC_BLOB, "AB12", h.db);
    await setUserApiKey(TEST_USER_ID, "groq", GROQ_BLOB, "GQ99", h.db);

    const rotated = "v1:anthropic-iv2:anthropic-tag2:anthropic-ct2";
    await setUserApiKey(TEST_USER_ID, "anthropic", rotated, "CD34", h.db);

    const row = await getUserApiKeyRow(TEST_USER_ID, h.db);
    expect(row!.anthropicKeyEncrypted).toBe(rotated);
    expect(row!.anthropicLast4).toBe("CD34");
    // Groq is left intact by an anthropic upsert.
    expect(row!.groqKeyEncrypted).toBe(GROQ_BLOB);
    expect(row!.groqLast4).toBe("GQ99");
  });

  it("clearUserApiKey nulls only the targeted provider's two columns", async () => {
    await setUserApiKey(TEST_USER_ID, "anthropic", ANTHROPIC_BLOB, "AB12", h.db);
    await setUserApiKey(TEST_USER_ID, "groq", GROQ_BLOB, "GQ99", h.db);

    await clearUserApiKey(TEST_USER_ID, "anthropic", h.db);

    const row = await getUserApiKeyRow(TEST_USER_ID, h.db);
    expect(row).not.toBeNull();
    expect(row!.anthropicKeyEncrypted).toBeNull();
    expect(row!.anthropicLast4).toBeNull();
    // Groq survives clearing anthropic.
    expect(row!.groqKeyEncrypted).toBe(GROQ_BLOB);
    expect(row!.groqLast4).toBe("GQ99");
  });

  it("clearUserApiKey is a no-op when the user has no row", async () => {
    await expect(
      clearUserApiKey(TEST_USER_ID, "groq", h.db),
    ).resolves.toBeUndefined();
    expect(await getUserApiKeyRow(TEST_USER_ID, h.db)).toBeNull();
  });

  it("deleting the user cascades away their api-keys row", async () => {
    await setUserApiKey(TEST_USER_ID, "anthropic", ANTHROPIC_BLOB, "AB12", h.db);
    expect(await getUserApiKeyRow(TEST_USER_ID, h.db)).not.toBeNull();

    await h.client
      .delete(schema.users)
      .where(eq(schema.users.id, TEST_USER_ID));

    expect(await getUserApiKeyRow(TEST_USER_ID, h.db)).toBeNull();
  });

  // --- Cross-user isolation -------------------------------------------------
  it("a second user's keys are independent of the first user's", async () => {
    const USER_B = await h.seedUser("user_test_bravo");

    await setUserApiKey(TEST_USER_ID, "anthropic", ANTHROPIC_BLOB, "AB12", h.db);
    await setUserApiKey(USER_B, "groq", GROQ_BLOB, "GQ99", h.db);

    const rowA = await getUserApiKeyRow(TEST_USER_ID, h.db);
    const rowB = await getUserApiKeyRow(USER_B, h.db);

    expect(rowA!.anthropicKeyEncrypted).toBe(ANTHROPIC_BLOB);
    expect(rowA!.groqKeyEncrypted).toBeNull();
    expect(rowB!.groqKeyEncrypted).toBe(GROQ_BLOB);
    expect(rowB!.anthropicKeyEncrypted).toBeNull();
  });
});
