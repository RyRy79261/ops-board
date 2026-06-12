import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_PREFERENCES,
  getUserPreferences,
  setUserPreferences,
} from "../preferences";
import { createTestDb, TEST_USER_ID, type TestDb } from "./db-harness";

// Real-Postgres suite for the per-user preferences access module
// (../preferences.ts). GUARDED: skipped unless a real DATABASE_URL is present
// (CI's postgres service sets it). Proves the upsert mechanics + the
// default-application-on-read contract (no row ⇒ defaults; partial patch only
// touches the supplied column).
const DB_URL = process.env.DATABASE_URL;
const hasDb =
  !!DB_URL &&
  !DB_URL.includes("placeholder") &&
  !DB_URL.includes("build:build");

describe.skipIf(!hasDb)(
  "@opsboard/db preferences access module (real Postgres)",
  () => {
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

    it("getUserPreferences returns defaults when the user has no row", async () => {
      expect(await getUserPreferences(TEST_USER_ID, h.db)).toEqual(
        DEFAULT_PREFERENCES,
      );
    });

    it("setUserPreferences inserts a row, applying defaults for unset fields", async () => {
      const saved = await setUserPreferences(
        TEST_USER_ID,
        { notifyClosingWindows: true },
        h.db,
      );
      // The patched field changed; the unset field kept its default.
      expect(saved).toEqual({
        voiceConfirmDestructive: true,
        notifyClosingWindows: true,
      });
      expect(await getUserPreferences(TEST_USER_ID, h.db)).toEqual(saved);
    });

    it("a partial patch updates only the supplied column", async () => {
      // First write turns notify on (confirm stays default true).
      await setUserPreferences(TEST_USER_ID, { notifyClosingWindows: true }, h.db);
      // Second write flips confirm off — notify must be left as-is (true).
      const saved = await setUserPreferences(
        TEST_USER_ID,
        { voiceConfirmDestructive: false },
        h.db,
      );
      expect(saved).toEqual({
        voiceConfirmDestructive: false,
        notifyClosingWindows: true,
      });
    });
  },
);
