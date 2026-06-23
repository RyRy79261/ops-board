import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createTestDb, TEST_USER_ID, type TestDb } from "@opsboard/db/testing";
import type { VoiceIntent } from "@opsboard/types";
import {
  issueVoiceConfirmToken,
  reissueAuthorized,
} from "@/lib/voice-confirm";

// Confirm-token gate for the voice Shape-B re-issue (lib/voice-confirm.ts), the
// security core of the destructive-bypass fix. Tested against a REAL Postgres
// (the token store is the mcp_confirm_tokens table) for a seeded user. The
// helpers only read intent.intent, so minimal cast intents suffice.
//
// GUARDED: self-SKIPS unless a real DATABASE_URL is present (so `pnpm test` with
// no DB passes by skipping; CI's web-integration postgres service runs it).

const DB_URL = process.env.DATABASE_URL;
const hasDb =
  !!DB_URL &&
  !DB_URL.includes("placeholder") &&
  !DB_URL.includes("build:build");

const deleteTask = {
  intent: "delete_task",
  taskHint: "x",
  confidence: 0.9,
} as unknown as VoiceIntent;
const deleteMission = {
  intent: "delete_mission",
  missionHint: "x",
  confidence: 0.9,
} as unknown as VoiceIntent;
const createMission = {
  intent: "create_mission",
  name: "x",
  confidence: 0.9,
} as unknown as VoiceIntent;

describe.skipIf(!hasDb)("voice confirm-token gate (real Postgres)", () => {
  let h: TestDb;
  const USER_A = TEST_USER_ID;
  const USER_B = "user_test_bravo";

  beforeAll(async () => {
    h = createTestDb(DB_URL);
    await h.migrate();
  });

  afterAll(async () => {
    if (h) await h.close();
  });

  beforeEach(async () => {
    // reset() TRUNCATEs users CASCADE, which clears mcp_confirm_tokens too.
    await h.reset();
    await h.seedUser(USER_A);
    await h.seedUser(USER_B);
  });

  it("non-destructive intents are always authorized (no token needed)", async () => {
    expect(
      await reissueAuthorized(h.db, USER_A, createMission, undefined),
    ).toBe(true);
  });

  it("a destructive re-issue WITHOUT a token is rejected (the bypass)", async () => {
    expect(await reissueAuthorized(h.db, USER_A, deleteTask, undefined)).toBe(
      false,
    );
    expect(await reissueAuthorized(h.db, USER_A, deleteTask, "")).toBe(false);
    expect(await reissueAuthorized(h.db, USER_A, deleteTask, "made-up")).toBe(
      false,
    );
  });

  it("a server-issued token authorizes once, then is single-use", async () => {
    const token = await issueVoiceConfirmToken(h.db, USER_A, deleteTask);
    expect(await reissueAuthorized(h.db, USER_A, deleteTask, token)).toBe(true);
    // Consumed → a replay is rejected.
    expect(await reissueAuthorized(h.db, USER_A, deleteTask, token)).toBe(
      false,
    );
  });

  it("a token is bound to its action — a delete_task token can't delete a mission", async () => {
    const token = await issueVoiceConfirmToken(h.db, USER_A, deleteTask);
    expect(await reissueAuthorized(h.db, USER_A, deleteMission, token)).toBe(
      false,
    );
    // The mismatch didn't consume it; the correct action still works.
    expect(await reissueAuthorized(h.db, USER_A, deleteTask, token)).toBe(true);
  });

  it("a token is bound to its user — another user's token is rejected", async () => {
    const token = await issueVoiceConfirmToken(h.db, USER_A, deleteTask);
    expect(await reissueAuthorized(h.db, USER_B, deleteTask, token)).toBe(
      false,
    );
  });
});
