import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { getUserAccountExport, deleteUserAccount } from "../account";
import { createMission, createTask } from "../mutations";
import { setUserPreferences } from "../preferences";
import { setUserApiKey } from "../api-keys";
import { createTestDb, TEST_USER_ID, type TestDb } from "./db-harness";

// Real-Postgres suite for the account export + cascade-delete service
// (../account.ts). GUARDED: skipped unless a real DATABASE_URL is present (CI's
// postgres service sets it). Proves the export gathers the user's data (no key
// material) and that deleteUserAccount cascades everything user-scoped.
const DB_URL = process.env.DATABASE_URL;
const hasDb =
  !!DB_URL &&
  !DB_URL.includes("placeholder") &&
  !DB_URL.includes("build:build");

describe.skipIf(!hasDb)(
  "@opsboard/db account export + delete (real Postgres)",
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

    it("export gathers the user's data and reports configured providers (no key material)", async () => {
      await setUserPreferences(TEST_USER_ID, { notifyClosingWindows: true }, h.db);
      await setUserApiKey(TEST_USER_ID, "anthropic", "v1:blob:tag:ct", "AB12", h.db);
      const mission = await createMission(
        { name: "M1", targetDate: "2026-04-27" },
        TEST_USER_ID,
        h.db,
      );
      await createTask(
        { missionId: mission.mission.id, name: "T1" },
        TEST_USER_ID,
        h.db,
      );

      const exp = await getUserAccountExport(TEST_USER_ID, h.db);

      expect(exp.user.id).toBe(TEST_USER_ID);
      expect(exp.preferences.notifyClosingWindows).toBe(true);
      expect(exp.configuredKeyProviders).toContain("anthropic");
      expect(exp.missions).toHaveLength(1);
      expect(exp.missions[0]!.tasks).toHaveLength(1);
      // The export must NEVER carry key material — only the provider list.
      expect(JSON.stringify(exp)).not.toContain("v1:blob");
    });

    it("deleteUserAccount cascades — missions/tasks/keys/prefs all go", async () => {
      await setUserApiKey(TEST_USER_ID, "groq", "v1:g:tag:ct", "GQ99", h.db);
      const mission = await createMission({ name: "M1" }, TEST_USER_ID, h.db);
      await createTask(
        { missionId: mission.mission.id, name: "T1" },
        TEST_USER_ID,
        h.db,
      );

      const removed = await deleteUserAccount(TEST_USER_ID, h.db);
      expect(removed).toBe(1);

      // Re-seed the user row only (no data) and confirm everything else is gone:
      // a fresh export has no missions, no configured providers, default prefs.
      await h.seedUser();
      const exp = await getUserAccountExport(TEST_USER_ID, h.db);
      expect(exp.missions).toHaveLength(0);
      expect(exp.configuredKeyProviders).toHaveLength(0);
      expect(exp.preferences.notifyClosingWindows).toBe(false);
    });

    it("deleteUserAccount is idempotent (0 rows when already gone)", async () => {
      expect(await deleteUserAccount(TEST_USER_ID, h.db)).toBe(1);
      expect(await deleteUserAccount(TEST_USER_ID, h.db)).toBe(0);
    });
  },
);
