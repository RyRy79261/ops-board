import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { eq, and } from "drizzle-orm";
import { createTestDb, TEST_USER_ID, type TestDb } from "@opsboard/db/testing";
import * as schema from "@opsboard/db/schema";
import { safeParseIntent } from "@opsboard/types";
import { executeIntent } from "@/lib/voice-execute";

// Voice-command PIPELINE integration suite. Drives REPRESENTATIVE classifier
// outputs (the raw `emit_intent` tool inputs — i.e. what a mocked Groq+Anthropic
// pair would produce) through the REAL post-vendor pipeline:
//     safeParseIntent → executeIntent → @opsboard/db mutations
// against a REAL Postgres (process.env.DATABASE_URL), for a seeded user. We test
// the PIPELINE + DB, NOT the vendors — there is no Groq/Anthropic network here;
// `vi.mock` stubs those SDK wrappers so an accidental import never reaches out.
//
// GUARDED: self-SKIPS unless a real DATABASE_URL is present (so `pnpm test`
// with no DB passes by skipping; CI's postgres service runs it).

// Belt-and-braces: ensure the external vendor wrappers are inert in this suite.
// The pipeline under test starts AFTER transcription + classification, so these
// must never be called — the mocks make that explicit and crash-safe.
vi.mock("@/lib/groq", () => ({
  transcribeAudio: vi.fn(async () => {
    throw new Error("transcribeAudio must not be called in the pipeline test");
  }),
}));
vi.mock("@/lib/anthropic", () => ({
  callForcedTool: vi.fn(async () => {
    throw new Error("callForcedTool must not be called in the pipeline test");
  }),
}));

const DB_URL = process.env.DATABASE_URL;
const hasDb =
  !!DB_URL &&
  !DB_URL.includes("placeholder") &&
  !DB_URL.includes("build:build");

/** Validate a raw classifier output the way the route does, then execute it. */
async function runIntent(raw: unknown, userId: string, db: TestDb["db"]) {
  const parsed = safeParseIntent(raw);
  expect(parsed.ok).toBe(true);
  if (!parsed.ok) throw new Error("intent failed to parse");
  return executeIntent(parsed.intent, userId, db);
}

describe.skipIf(!hasDb)("voice command pipeline (real Postgres)", () => {
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
    await h.reset();
    await h.seedCategories();
    await h.seedUser(USER_A);
    await h.seedUser(USER_B);
  });

  it("create_mission → create_task pipeline inserts user-scoped rows", async () => {
    // 1. Create a mission.
    const missionOutcome = await runIntent(
      {
        intent: "create_mission",
        confidence: 0.95,
        name: "AfrikaBurn 2026",
        targetDateHint: "2026-04-27",
      },
      USER_A,
      h.db,
    );
    expect("result" in missionOutcome).toBe(true);
    if (!("result" in missionOutcome)) throw new Error("no result");
    expect(missionOutcome.result.kind).toBe("mission_created");

    const missions = await h.client
      .select()
      .from(schema.missions)
      .where(eq(schema.missions.userId, USER_A));
    expect(missions).toHaveLength(1);
    expect(missions[0]!.name).toBe("AfrikaBurn 2026");
    expect(missions[0]!.targetDate).toBe("2026-04-27");

    // 2. Create a task on it. With exactly one mission, no missionHint is
    //    needed — the executor defaults to the sole mission.
    const taskOutcome = await runIntent(
      {
        intent: "create_task",
        confidence: 0.9,
        name: "Renew passport",
      },
      USER_A,
      h.db,
    );
    expect("result" in taskOutcome).toBe(true);
    if (!("result" in taskOutcome)) throw new Error("no result");
    expect(taskOutcome.result.kind).toBe("task_created");

    const tasks = await h.client
      .select()
      .from(schema.tasks)
      .where(eq(schema.tasks.userId, USER_A));
    expect(tasks).toHaveLength(1);
    expect(tasks[0]!.name).toBe("Renew passport");
    // The task lands on the user's sole mission and is scoped to the user.
    expect(tasks[0]!.missionId).toBe(missions[0]!.id);
    expect(tasks[0]!.userId).toBe(USER_A);
  });

  it("update_task_status pipeline transitions a task by fuzzy hint", async () => {
    const [mission] = await h.client
      .insert(schema.missions)
      .values({ userId: USER_A, name: "Trek" })
      .returning();
    await h.client
      .insert(schema.tasks)
      .values({ missionId: mission!.id, userId: USER_A, name: "Book flights" });

    const outcome = await runIntent(
      {
        intent: "update_task_status",
        confidence: 0.92,
        taskHint: "book flights",
        status: "done",
      },
      USER_A,
      h.db,
    );
    expect("result" in outcome).toBe(true);
    if (!("result" in outcome)) throw new Error("no result");
    expect(outcome.result.kind).toBe("task_status_updated");

    const [task] = await h.client
      .select()
      .from(schema.tasks)
      .where(eq(schema.tasks.userId, USER_A));
    expect(task!.status).toBe("done");
  });

  it("delete_task pipeline removes the resolved task", async () => {
    const [mission] = await h.client
      .insert(schema.missions)
      .values({ userId: USER_A, name: "Expedition" })
      .returning();
    await h.client
      .insert(schema.tasks)
      .values({ missionId: mission!.id, userId: USER_A, name: "Buy tent" });

    const outcome = await runIntent(
      { intent: "delete_task", confidence: 0.97, taskHint: "buy tent" },
      USER_A,
      h.db,
    );
    expect("result" in outcome).toBe(true);
    if (!("result" in outcome)) throw new Error("no result");
    expect(outcome.result.kind).toBe("task_deleted");

    const remaining = await h.client
      .select()
      .from(schema.tasks)
      .where(eq(schema.tasks.userId, USER_A));
    expect(remaining).toHaveLength(0);
  });

  it("add_dependency pipeline wires an edge between two of the user's tasks", async () => {
    const [mission] = await h.client
      .insert(schema.missions)
      .values({ userId: USER_A, name: "Launch" })
      .returning();
    const [t1] = await h.client
      .insert(schema.tasks)
      .values({ missionId: mission!.id, userId: USER_A, name: "Get visa" })
      .returning();
    const [t2] = await h.client
      .insert(schema.tasks)
      .values({ missionId: mission!.id, userId: USER_A, name: "Book flights" })
      .returning();

    const outcome = await runIntent(
      {
        intent: "add_dependency",
        confidence: 0.9,
        taskHint: "book flights",
        dependsOnHint: "get visa",
      },
      USER_A,
      h.db,
    );
    expect("result" in outcome).toBe(true);
    if (!("result" in outcome)) throw new Error("no result");
    expect(outcome.result.kind).toBe("dependency_added");

    const edges = await h.client.select().from(schema.taskDependencies);
    expect(edges).toHaveLength(1);
    expect(edges[0]!.taskId).toBe(t2!.id);
    expect(edges[0]!.dependsOnId).toBe(t1!.id);
  });

  it("query pipeline answers read-only and mutates NOTHING", async () => {
    const [mission] = await h.client
      .insert(schema.missions)
      .values({ userId: USER_A, name: "Trip" })
      .returning();
    await h.client
      .insert(schema.tasks)
      .values({ missionId: mission!.id, userId: USER_A, name: "Plan route" });

    const outcome = await runIntent(
      { intent: "query", confidence: 0.85, question: "what is blocked?" },
      USER_A,
      h.db,
    );
    expect("result" in outcome).toBe(true);
    if (!("result" in outcome)) throw new Error("no result");
    expect(outcome.result.kind).toBe("query_answer");

    // Read-only: the single task is untouched.
    const tasks = await h.client
      .select()
      .from(schema.tasks)
      .where(eq(schema.tasks.userId, USER_A));
    expect(tasks).toHaveLength(1);
    expect(tasks[0]!.status).toBe("not-started");
  });

  // --- Cross-user scoping (SECURITY-CRITICAL) -------------------------------
  it("the pipeline stays user-scoped: USER_B cannot touch USER_A's task", async () => {
    const [mission] = await h.client
      .insert(schema.missions)
      .values({ userId: USER_A, name: "Private mission" })
      .returning();
    await h.client.insert(schema.tasks).values({
      missionId: mission!.id,
      userId: USER_A,
      name: "Secret task",
    });

    // USER_B issues the same status command. The hint resolves against B's
    // (empty) task set, so it must NOT find — and never mutate — A's task.
    const outcome = await runIntent(
      {
        intent: "update_task_status",
        confidence: 0.95,
        taskHint: "secret task",
        status: "done",
      },
      USER_B,
      h.db,
    );
    // No task for B → a soft "couldn't find" clarify, not a mutation.
    expect("needsConfirmation" in outcome).toBe(true);

    // A's task is untouched.
    const [aTask] = await h.client
      .select()
      .from(schema.tasks)
      .where(
        and(
          eq(schema.tasks.userId, USER_A),
          eq(schema.tasks.name, "Secret task"),
        ),
      );
    expect(aTask!.status).toBe("not-started");

    // And B created/owns nothing.
    const bTasks = await h.client
      .select()
      .from(schema.tasks)
      .where(eq(schema.tasks.userId, USER_B));
    expect(bTasks).toHaveLength(0);
  });
});
