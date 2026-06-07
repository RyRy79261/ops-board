import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { eq, sql } from "drizzle-orm";
import * as schema from "../schema";
import { CATEGORY_SEEDS } from "../schema";
import {
  getMission,
  getMissions,
  getMissionWithTasks,
} from "../missions";
import {
  getCategories,
  getTask,
  getTaskDependencies,
  getTasks,
  updateTaskStatus,
} from "../tasks";
import {
  createTestDb,
  EXPECTED_TABLES,
  TEST_USER_ID,
  type TestDb,
} from "./db-harness";

// Real Postgres integration suite. GUARDED: skipped entirely unless a real
// DATABASE_URL is present (so `pnpm test` with no DB passes by skipping). In
// CI a postgres:16 service container sets DATABASE_URL and the suite runs; the
// `migrate()` in beforeAll provisions an empty database from the committed
// migrations, so it self-migrates with no extra step.
const DB_URL = process.env.DATABASE_URL;
const hasDb =
  !!DB_URL &&
  !DB_URL.includes("placeholder") &&
  !DB_URL.includes("build:build");

describe.skipIf(!hasDb)("@opsboard/db integration (real Postgres)", () => {
  let h: TestDb;

  beforeAll(async () => {
    h = createTestDb(DB_URL);
    await h.migrate();
  });

  afterAll(async () => {
    if (h) await h.close();
  });

  // --- Migration --------------------------------------------------------
  describe("migration", () => {
    it("applies cleanly and creates the 10 expected tables", async () => {
      const tables = await h.listTables();
      for (const expected of EXPECTED_TABLES) {
        expect(tables).toContain(expected);
      }
      // The four domain + four MCP tables + users + user_api_keys are present.
      const present = EXPECTED_TABLES.filter((t) => tables.includes(t));
      expect(present).toHaveLength(10);
    });
  });

  // --- Seed -------------------------------------------------------------
  describe("category seeds", () => {
    beforeEach(async () => {
      await h.reset();
      await h.seedCategories();
    });

    it("getCategories returns the 5 seeds in sort_order with color + icon", async () => {
      const cats = await getCategories(h.db);
      expect(cats).toHaveLength(CATEGORY_SEEDS.length);

      const expected = [...CATEGORY_SEEDS].sort(
        (a, b) => a.sortOrder - b.sortOrder,
      );
      cats.forEach((cat, i) => {
        const seed = expected[i]!;
        expect(cat.slug).toBe(seed.slug);
        expect(cat.name).toBe(seed.name);
        expect(cat.color).toBe(seed.color);
        expect(cat.lucideIcon).toBe(seed.lucideIcon);
        expect(cat.sortOrder).toBe(seed.sortOrder);
        expect(cat.isDefault).toBe(seed.isDefault);
      });
    });
  });

  // --- Constraints ------------------------------------------------------
  describe("constraints", () => {
    let missionId: string;

    beforeEach(async () => {
      await h.reset();
      await h.seedUser();
      const [m] = await h.client
        .insert(schema.missions)
        .values({ userId: TEST_USER_ID, name: "Constraint Mission" })
        .returning();
      missionId = m!.id;
    });

    it("tasks.status CHECK rejects an illegal status", async () => {
      await expect(
        h.client.execute(
          sql`INSERT INTO "tasks" ("mission_id", "user_id", "name", "status") VALUES (${missionId}, ${TEST_USER_ID}, ${"Bad"}, ${"bogus"})`,
        ),
      ).rejects.toThrow();
    });

    it("tasks.status CHECK accepts all 3 valid values", async () => {
      const statuses = ["not-started", "in-progress", "done"] as const;
      for (const status of statuses) {
        const [row] = await h.client
          .insert(schema.tasks)
          .values({ missionId, userId: TEST_USER_ID, name: `t-${status}`, status })
          .returning();
        expect(row!.status).toBe(status);
      }
    });

    it("task_dependencies CHECK rejects a self-dependency", async () => {
      const [task] = await h.client
        .insert(schema.tasks)
        .values({ missionId, userId: TEST_USER_ID, name: "Self" })
        .returning();
      await expect(
        h.client
          .insert(schema.taskDependencies)
          .values({ taskId: task!.id, dependsOnId: task!.id }),
      ).rejects.toThrow();
    });

    it("task_dependencies uniqueIndex rejects a duplicate edge", async () => {
      const [a] = await h.client
        .insert(schema.tasks)
        .values({ missionId, userId: TEST_USER_ID, name: "A" })
        .returning();
      const [b] = await h.client
        .insert(schema.tasks)
        .values({ missionId, userId: TEST_USER_ID, name: "B" })
        .returning();

      await h.client
        .insert(schema.taskDependencies)
        .values({ taskId: a!.id, dependsOnId: b!.id });

      await expect(
        h.client
          .insert(schema.taskDependencies)
          .values({ taskId: a!.id, dependsOnId: b!.id }),
      ).rejects.toThrow();
    });

    it("deleting a mission cascades to its tasks", async () => {
      await h.client
        .insert(schema.tasks)
        .values({ missionId, userId: TEST_USER_ID, name: "Doomed" });

      await h.client
        .delete(schema.missions)
        .where(eq(schema.missions.id, missionId));

      const remaining = await h.client
        .select()
        .from(schema.tasks)
        .where(eq(schema.tasks.missionId, missionId));
      expect(remaining).toHaveLength(0);
    });

    it("deleting a task cascades to its dependency edges", async () => {
      const [a] = await h.client
        .insert(schema.tasks)
        .values({ missionId, userId: TEST_USER_ID, name: "A" })
        .returning();
      const [b] = await h.client
        .insert(schema.tasks)
        .values({ missionId, userId: TEST_USER_ID, name: "B" })
        .returning();
      await h.client
        .insert(schema.taskDependencies)
        .values({ taskId: a!.id, dependsOnId: b!.id });

      await h.client
        .delete(schema.tasks)
        .where(eq(schema.tasks.id, a!.id));

      const edges = await h.client.select().from(schema.taskDependencies);
      expect(edges).toHaveLength(0);
    });

    it("deleting a category sets its tasks' category_id to null", async () => {
      const [cat] = await h.client
        .insert(schema.categories)
        .values({
          slug: "tmp",
          name: "Temp",
          color: "#ffffff",
          lucideIcon: "Circle",
        })
        .returning();
      const [task] = await h.client
        .insert(schema.tasks)
        .values({
          missionId,
          userId: TEST_USER_ID,
          name: "Categorised",
          categoryId: cat!.id,
        })
        .returning();

      await h.client
        .delete(schema.categories)
        .where(eq(schema.categories.id, cat!.id));

      const [after] = await h.client
        .select()
        .from(schema.tasks)
        .where(eq(schema.tasks.id, task!.id));
      expect(after!.categoryId).toBeNull();
    });
  });

  // --- Query services (run the REAL functions against the injected db) --
  describe("query services", () => {
    const USER_A = TEST_USER_ID;
    const USER_B = "user_test_bravo";
    let missionAId: string;
    let missionBId: string;
    let taskA1Id: string;
    let taskA2Id: string;

    beforeEach(async () => {
      await h.reset();
      await h.seedCategories();
      // Two real users. USER_A owns both seeded missions below; USER_B owns
      // nothing here (it exists so the cross-user isolation tests can scope
      // their reads against a valid-but-foreign principal).
      await h.seedUser(USER_A);
      await h.seedUser(USER_B);

      const [mA] = await h.client
        .insert(schema.missions)
        .values({
          userId: USER_A,
          name: "Alpha Mission",
          targetDate: "2026-01-15",
        })
        .returning();
      const [mB] = await h.client
        .insert(schema.missions)
        .values({ userId: USER_A, name: "Bravo Mission" })
        .returning();
      missionAId = mA!.id;
      missionBId = mB!.id;

      const [tA1] = await h.client
        .insert(schema.tasks)
        .values({
          missionId: missionAId,
          userId: USER_A,
          name: "A-1",
          sortOrder: 0,
        })
        .returning();
      const [tA2] = await h.client
        .insert(schema.tasks)
        .values({
          missionId: missionAId,
          userId: USER_A,
          name: "A-2",
          sortOrder: 1,
        })
        .returning();
      // A task on mission B — used to prove mission scoping.
      await h.client
        .insert(schema.tasks)
        .values({ missionId: missionBId, userId: USER_A, name: "B-1" });
      taskA1Id = tA1!.id;
      taskA2Id = tA2!.id;

      // A-1 depends on A-2 (edge scoped to mission A's tasks).
      await h.client
        .insert(schema.taskDependencies)
        .values({ taskId: taskA1Id, dependsOnId: taskA2Id });
    });

    it("getMissions returns the user's missions alphabetically, board-shaped", async () => {
      const missions = await getMissions(USER_A, h.db);
      expect(missions.map((m) => m.name)).toEqual([
        "Alpha Mission",
        "Bravo Mission",
      ]);
      const alpha = missions[0]!;
      expect(alpha.targetDate).toBe("2026-01-15");
      expect(alpha.createdAt).toBeInstanceOf(Date);
      expect(alpha.updatedAt).toBeInstanceOf(Date);
      // MissionView is a flat projection — no raw row internals leak.
      expect(Object.keys(alpha).sort()).toEqual(
        ["createdAt", "id", "name", "targetDate", "updatedAt"].sort(),
      );
    });

    it("getMission returns one of the user's missions or null", async () => {
      const found = await getMission(missionAId, USER_A, h.db);
      expect(found?.name).toBe("Alpha Mission");
      const missing = await getMission(
        "00000000-0000-0000-0000-000000000000",
        USER_A,
        h.db,
      );
      expect(missing).toBeNull();
    });

    it("getMissionWithTasks returns the mission plus its sorted tasks", async () => {
      const result = await getMissionWithTasks(missionAId, USER_A, h.db);
      expect(result).not.toBeNull();
      expect(result!.name).toBe("Alpha Mission");
      expect(result!.tasks.map((t) => t.name)).toEqual(["A-1", "A-2"]);
      // Scoped to mission A only.
      expect(result!.tasks.every((t) => t.missionId === missionAId)).toBe(true);

      const missing = await getMissionWithTasks(
        "00000000-0000-0000-0000-000000000000",
        USER_A,
        h.db,
      );
      expect(missing).toBeNull();
    });

    it("getTasks scopes to the mission and sorts by sort_order", async () => {
      const tasksA = await getTasks(missionAId, USER_A, h.db);
      expect(tasksA.map((t) => t.name)).toEqual(["A-1", "A-2"]);

      const tasksB = await getTasks(missionBId, USER_A, h.db);
      expect(tasksB.map((t) => t.name)).toEqual(["B-1"]);
    });

    it("getTask returns a single task or null", async () => {
      const t = await getTask(taskA1Id, USER_A, h.db);
      expect(t?.name).toBe("A-1");
      const none = await getTask(
        "00000000-0000-0000-0000-000000000000",
        USER_A,
        h.db,
      );
      expect(none).toBeNull();
    });

    it("getTaskDependencies returns only edges within the mission", async () => {
      const edges = await getTaskDependencies(missionAId, USER_A, h.db);
      expect(edges).toHaveLength(1);
      expect(edges[0]!.taskId).toBe(taskA1Id);
      expect(edges[0]!.dependsOnId).toBe(taskA2Id);

      // Mission B has no edges.
      const edgesB = await getTaskDependencies(missionBId, USER_A, h.db);
      expect(edgesB).toHaveLength(0);
    });

    it("updateTaskStatus transitions status and returns {ok:true,task}", async () => {
      const before = await getTask(taskA1Id, USER_A, h.db);
      expect(before?.status).toBe("not-started");

      const result = await updateTaskStatus(
        taskA1Id,
        "in-progress",
        USER_A,
        h.db,
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.task.id).toBe(taskA1Id);
        expect(result.task.status).toBe("in-progress");
      }

      const after = await getTask(taskA1Id, USER_A, h.db);
      expect(after?.status).toBe("in-progress");
    });

    it("updateTaskStatus returns {ok:false} for an unknown task", async () => {
      const result = await updateTaskStatus(
        "00000000-0000-0000-0000-000000000000",
        "done",
        USER_A,
        h.db,
      );
      expect(result.ok).toBe(false);
    });

    // --- Cross-user isolation (SECURITY-CRITICAL) -----------------------
    // USER_B is a real, valid principal that owns NONE of USER_A's data.
    // Every read scoped to USER_B must behave as if USER_A's rows don't
    // exist; every status mutation must refuse to touch them.
    describe("isolation: user B cannot read or mutate user A's data", () => {
      it("getMissions for user B returns none of user A's missions", async () => {
        const missions = await getMissions(USER_B, h.db);
        expect(missions).toHaveLength(0);
      });

      it("getMission returns null for a mission owned by another user", async () => {
        expect(await getMission(missionAId, USER_B, h.db)).toBeNull();
      });

      it("getMissionWithTasks returns null for another user's mission", async () => {
        expect(await getMissionWithTasks(missionAId, USER_B, h.db)).toBeNull();
      });

      it("getTasks returns nothing for another user's mission", async () => {
        expect(await getTasks(missionAId, USER_B, h.db)).toHaveLength(0);
      });

      it("getTask returns null for another user's task", async () => {
        expect(await getTask(taskA1Id, USER_B, h.db)).toBeNull();
      });

      it("getTaskDependencies returns nothing for another user's mission", async () => {
        expect(
          await getTaskDependencies(missionAId, USER_B, h.db),
        ).toHaveLength(0);
      });

      it("updateTaskStatus refuses to mutate another user's task", async () => {
        const result = await updateTaskStatus(
          taskA1Id,
          "done",
          USER_B,
          h.db,
        );
        expect(result.ok).toBe(false);
        // The real owner's task is untouched.
        const owner = await getTask(taskA1Id, USER_A, h.db);
        expect(owner?.status).toBe("not-started");
      });
    });
  });
});
