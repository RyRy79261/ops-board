import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { createTestDb, TEST_USER_ID, type TestDb } from "@opsboard/db/testing";
import { issueConfirmToken, consumeConfirmToken } from "../confirm-token";

// Durable confirm-token store, against a REAL Postgres (process.env.DATABASE_URL).
// SELF-SKIPS without a DB so `pnpm test` (no DATABASE_URL) stays green; the CI
// web-integration job supplies one. These cover the destructive-MCP confirm dance
// the in-process Map silently broke under serverless.

const DB_URL = process.env.DATABASE_URL;
const hasDb =
  !!DB_URL &&
  !DB_URL.includes("placeholder") &&
  !DB_URL.includes("build:build");

describe.skipIf(!hasDb)("MCP confirm-token (durable, real Postgres)", () => {
  let h: TestDb;
  const USER_A = TEST_USER_ID;
  const USER_B = "user_test_bravo";
  // Fixed clock so TTL behaviour is deterministic (the helpers take `now`).
  const T0 = 1_750_000_000_000;
  const TTL = 5 * 60_000;

  beforeAll(async () => {
    h = createTestDb(DB_URL);
    await h.migrate();
  });

  afterAll(async () => {
    if (h) await h.close();
  });

  beforeEach(async () => {
    await h.reset();
    await h.seedUser(USER_A);
    await h.seedUser(USER_B);
  });

  it("consumes a matching token exactly once (single-use)", async () => {
    const token = await issueConfirmToken(
      h.db,
      USER_A,
      "delete_task",
      "task-1",
      T0,
    );
    expect(
      await consumeConfirmToken(
        h.db,
        USER_A,
        "delete_task",
        "task-1",
        token,
        T0 + 1000,
      ),
    ).toBe(true);
    // Second consume fails — the row is gone (a token can't delete twice).
    expect(
      await consumeConfirmToken(
        h.db,
        USER_A,
        "delete_task",
        "task-1",
        token,
        T0 + 1000,
      ),
    ).toBe(false);
  });

  it("rejects a mismatched action / target / user without consuming the row", async () => {
    const token = await issueConfirmToken(
      h.db,
      USER_A,
      "delete_task",
      "task-1",
      T0,
    );
    const at = T0 + 1;
    expect(
      await consumeConfirmToken(
        h.db,
        USER_A,
        "delete_mission",
        "task-1",
        token,
        at,
      ),
    ).toBe(false); // wrong action
    expect(
      await consumeConfirmToken(
        h.db,
        USER_A,
        "delete_task",
        "task-2",
        token,
        at,
      ),
    ).toBe(false); // wrong target
    expect(
      await consumeConfirmToken(
        h.db,
        USER_B,
        "delete_task",
        "task-1",
        token,
        at,
      ),
    ).toBe(false); // wrong user
    // None of the above consumed it — the correct call still succeeds.
    expect(
      await consumeConfirmToken(
        h.db,
        USER_A,
        "delete_task",
        "task-1",
        token,
        at,
      ),
    ).toBe(true);
  });

  it("rejects an expired token", async () => {
    const token = await issueConfirmToken(
      h.db,
      USER_A,
      "delete_task",
      "task-1",
      T0,
    );
    expect(
      await consumeConfirmToken(
        h.db,
        USER_A,
        "delete_task",
        "task-1",
        token,
        T0 + TTL + 1,
      ),
    ).toBe(false);
  });

  it("rejects an unknown or empty token", async () => {
    expect(
      await consumeConfirmToken(
        h.db,
        USER_A,
        "delete_task",
        "task-1",
        "nope",
        T0,
      ),
    ).toBe(false);
    expect(
      await consumeConfirmToken(h.db, USER_A, "delete_task", "task-1", "", T0),
    ).toBe(false);
  });

  it("issue and consume work across SEPARATE db connections (serverless parity)", async () => {
    // The whole point of the rewrite: the two calls need not share process
    // memory. Issue on one client, consume on a brand-new one.
    const token = await issueConfirmToken(
      h.db,
      USER_A,
      "delete_mission",
      "mission-9",
      T0,
    );
    const h2 = createTestDb(DB_URL!);
    try {
      expect(
        await consumeConfirmToken(
          h2.db,
          USER_A,
          "delete_mission",
          "mission-9",
          token,
          T0 + 1000,
        ),
      ).toBe(true);
    } finally {
      await h2.close();
    }
  });
});
