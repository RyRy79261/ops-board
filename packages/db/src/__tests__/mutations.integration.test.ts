import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import * as schema from "../schema";
import { getMission } from "../missions";
import { getTask, getTaskDependencies, getTasks } from "../tasks";
import {
  addDependency,
  createMission,
  createTask,
  deleteMission,
  deleteTask,
  removeDependency,
  updateMission,
  updateTask,
} from "../mutations";
import { createTestDb, TEST_USER_ID, type TestDb } from "./db-harness";

// Real-Postgres integration suite for the WRITE side (@opsboard/db/mutations).
// GUARDED identically to integration.test.ts: skipped wholesale unless a real
// DATABASE_URL is present, so `pnpm test` with no DB passes by skipping. In CI
// the postgres service container sets DATABASE_URL and `migrate()` provisions
// the schema. The SAME node-pg harness drives the real production functions.
const DB_URL = process.env.DATABASE_URL;
const hasDb =
  !!DB_URL &&
  !DB_URL.includes("placeholder") &&
  !DB_URL.includes("build:build");

describe.skipIf(!hasDb)("@opsboard/db mutations (real Postgres)", () => {
  let h: TestDb;
  // The owning principal for every mutation in this suite. USER_B is a
  // second, valid user used by the isolation block to prove cross-user
  // mutations are refused.
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

  // --- createMission ----------------------------------------------------
  describe("createMission", () => {
    it("creates a mission with a target date", async () => {
      const result = await createMission(
        { name: "AfrikaBurn", targetDate: "2026-04-27" },
        USER_A,
        h.db,
      );
      expect(result.ok).toBe(true);
      expect(result.mission.name).toBe("AfrikaBurn");
      expect(result.mission.targetDate).toBe("2026-04-27");
      expect(result.mission.userId).toBe(USER_A);

      const fetched = await getMission(result.mission.id, USER_A, h.db);
      expect(fetched?.name).toBe("AfrikaBurn");
    });

    it("creates an open-ended mission (no target date)", async () => {
      const result = await createMission({ name: "Someday" }, USER_A, h.db);
      expect(result.ok).toBe(true);
      expect(result.mission.targetDate).toBeNull();
    });

    it("trims the name and rejects an empty one", async () => {
      const result = await createMission({ name: "  Trimmed  " }, USER_A, h.db);
      expect(result.mission.name).toBe("Trimmed");
      await expect(
        createMission({ name: "   " }, USER_A, h.db),
      ).rejects.toThrow();
    });
  });

  // --- updateMission ----------------------------------------------------
  describe("updateMission", () => {
    it("patches name + target date (only provided fields)", async () => {
      const created = await createMission(
        { name: "AfrikaBurn", targetDate: "2026-04-27" },
        USER_A,
        h.db,
      );
      // Rename only — the date is left untouched.
      const renamed = await updateMission(
        created.mission.id,
        { name: "AfrikaBurn 2027" },
        USER_A,
        h.db,
      );
      expect(renamed.ok).toBe(true);
      if (renamed.ok) {
        expect(renamed.mission.name).toBe("AfrikaBurn 2027");
        expect(renamed.mission.targetDate).toBe("2026-04-27");
      }
      // Clear the date with an explicit null.
      const cleared = await updateMission(
        created.mission.id,
        { targetDate: null },
        USER_A,
        h.db,
      );
      expect(cleared.ok && cleared.mission.targetDate).toBeNull();
    });

    it("refuses another user's mission (no write)", async () => {
      const created = await createMission({ name: "Mine" }, USER_A, h.db);
      const res = await updateMission(
        created.mission.id,
        { name: "Hijacked" },
        USER_B,
        h.db,
      );
      expect(res.ok).toBe(false);
      // Untouched for the real owner.
      const still = await getMission(created.mission.id, USER_A, h.db);
      expect(still?.name).toBe("Mine");
    });

    it("returns {ok:false} for an unknown mission", async () => {
      const res = await updateMission(
        "99999999-9999-9999-9999-999999999999",
        { name: "Ghost" },
        USER_A,
        h.db,
      );
      expect(res.ok).toBe(false);
    });
  });

  // --- createTask -------------------------------------------------------
  describe("createTask", () => {
    let missionId: string;

    beforeEach(async () => {
      const m = await createMission({ name: "M" }, USER_A, h.db);
      missionId = m.mission.id;
    });

    it("creates a bare task defaulting to the general category", async () => {
      const result = await createTask(
        { missionId, name: "Pack" },
        USER_A,
        h.db,
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.task.name).toBe("Pack");
        expect(result.task.status).toBe("not-started");
        // No category given → defaults to the "general" catch-all (never null),
        // so the task is always visible on the category board.
        const general = (await h.client.select().from(schema.categories)).find(
          (c) => c.slug === "general",
        );
        expect(result.task.categoryId).toBe(general!.id);
        // The invariant: the task's userId equals its mission's userId.
        expect(result.task.userId).toBe(USER_A);
      }
    });

    it("resolves a category by slug", async () => {
      const result = await createTask(
        { missionId, name: "Vaccinations", categorySlug: "medical" },
        USER_A,
        h.db,
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        const [cat] = await h.client.select().from(schema.categories);
        expect(result.task.categoryId).toBeTruthy();
        // The resolved id belongs to the medical category.
        const medical = (await h.client.select().from(schema.categories)).find(
          (c) => c.slug === "medical",
        );
        expect(result.task.categoryId).toBe(medical!.id);
        expect(cat).toBeTruthy();
      }
    });

    it("accepts cliff/start dates and an explicit status", async () => {
      const result = await createTask(
        {
          missionId,
          name: "Visa",
          tooLateBy: "2026-04-01",
          notBefore: "2026-02-01",
          status: "in-progress",
        },
        USER_A,
        h.db,
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.task.tooLateBy).toBe("2026-04-01");
        expect(result.task.notBefore).toBe("2026-02-01");
        expect(result.task.status).toBe("in-progress");
      }
    });

    it("returns a typed error (no throw) for an unknown category slug", async () => {
      const result = await createTask(
        { missionId, name: "X", categorySlug: "nope" },
        USER_A,
        h.db,
      );
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toContain("nope");
    });

    it("returns a typed error (no throw) for a bad mission FK", async () => {
      const result = await createTask(
        { missionId: "00000000-0000-0000-0000-000000000000", name: "Orphan" },
        USER_A,
        h.db,
      );
      expect(result.ok).toBe(false);
    });

    it("refuses to create a task on another user's mission (no insert)", async () => {
      // missionId belongs to USER_A; USER_B must NOT be able to plant a task.
      const result = await createTask(
        { missionId, name: "Intruder" },
        USER_B,
        h.db,
      );
      expect(result.ok).toBe(false);
      // Nothing was inserted for either user.
      expect(await getTasks(missionId, USER_B, h.db)).toHaveLength(0);
      expect(await getTasks(missionId, USER_A, h.db)).toHaveLength(0);
    });
  });

  // --- updateTask -------------------------------------------------------
  describe("updateTask", () => {
    let missionId: string;
    let taskId: string;

    beforeEach(async () => {
      const m = await createMission({ name: "M" }, USER_A, h.db);
      missionId = m.mission.id;
      const t = await createTask({ missionId, name: "Original" }, USER_A, h.db);
      if (!t.ok) throw new Error("setup failed");
      taskId = t.task.id;
    });

    it("patches only supplied fields and bumps updated_at", async () => {
      const before = await getTask(taskId, USER_A, h.db);
      const result = await updateTask(
        taskId,
        { name: "Renamed", status: "done", notes: "did it" },
        USER_A,
        h.db,
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.task.name).toBe("Renamed");
        expect(result.task.status).toBe("done");
        expect(result.task.notes).toBe("did it");
        expect(result.task.updatedAt.getTime()).toBeGreaterThanOrEqual(
          before!.updatedAt.getTime(),
        );
      }
    });

    it("moves a category by slug and clears it with slug:null", async () => {
      const moved = await updateTask(
        taskId,
        { categorySlug: "travel" },
        USER_A,
        h.db,
      );
      expect(moved.ok).toBe(true);
      const travel = (await h.client.select().from(schema.categories)).find(
        (c) => c.slug === "travel",
      );
      if (moved.ok) expect(moved.task.categoryId).toBe(travel!.id);

      const cleared = await updateTask(
        taskId,
        { categorySlug: null },
        USER_A,
        h.db,
      );
      if (cleared.ok) expect(cleared.task.categoryId).toBeNull();
    });

    it("clears a cliff date with null", async () => {
      await updateTask(taskId, { tooLateBy: "2026-04-01" }, USER_A, h.db);
      const cleared = await updateTask(
        taskId,
        { tooLateBy: null },
        USER_A,
        h.db,
      );
      if (cleared.ok) expect(cleared.task.tooLateBy).toBeNull();
    });

    it("returns {ok:false} (no throw) for an unknown task", async () => {
      const result = await updateTask(
        "00000000-0000-0000-0000-000000000000",
        { name: "Ghost" },
        USER_A,
        h.db,
      );
      expect(result.ok).toBe(false);
    });

    it("returns {ok:false} (no throw) for an unknown category slug", async () => {
      const result = await updateTask(
        taskId,
        { categorySlug: "nope" },
        USER_A,
        h.db,
      );
      expect(result.ok).toBe(false);
    });

    it("refuses to update another user's task (no mutation)", async () => {
      const result = await updateTask(
        taskId,
        { name: "Hijacked" },
        USER_B,
        h.db,
      );
      expect(result.ok).toBe(false);
      // The owner's task is untouched.
      const owner = await getTask(taskId, USER_A, h.db);
      expect(owner?.name).toBe("Original");
    });
  });

  // --- deleteTask + cascade ---------------------------------------------
  describe("deleteTask", () => {
    it("deletes a task and cascades its dependency edges", async () => {
      const m = await createMission({ name: "M" }, USER_A, h.db);
      const a = await createTask(
        { missionId: m.mission.id, name: "A" },
        USER_A,
        h.db,
      );
      const b = await createTask(
        { missionId: m.mission.id, name: "B" },
        USER_A,
        h.db,
      );
      if (!a.ok || !b.ok) throw new Error("setup failed");

      await addDependency(a.task.id, b.task.id, USER_A, h.db);
      expect(
        await getTaskDependencies(m.mission.id, USER_A, h.db),
      ).toHaveLength(1);

      const del = await deleteTask(a.task.id, USER_A, h.db);
      expect(del.ok).toBe(true);
      expect(await getTask(a.task.id, USER_A, h.db)).toBeNull();
      // Edge gone via cascade.
      expect(
        await getTaskDependencies(m.mission.id, USER_A, h.db),
      ).toHaveLength(0);
    });

    it("is idempotent for a missing task", async () => {
      const del = await deleteTask(
        "00000000-0000-0000-0000-000000000000",
        USER_A,
        h.db,
      );
      expect(del.ok).toBe(true);
    });

    it("refuses to delete another user's task (no deletion)", async () => {
      const m = await createMission({ name: "M" }, USER_A, h.db);
      const t = await createTask(
        { missionId: m.mission.id, name: "Protected" },
        USER_A,
        h.db,
      );
      if (!t.ok) throw new Error("setup failed");

      // USER_B's scoped delete must be a no-op against USER_A's task.
      const del = await deleteTask(t.task.id, USER_B, h.db);
      expect(del.ok).toBe(true);
      // Still there for the real owner.
      expect(await getTask(t.task.id, USER_A, h.db)).not.toBeNull();
    });
  });

  // --- deleteMission + cascade ------------------------------------------
  describe("deleteMission", () => {
    it("deletes a mission and cascades its tasks", async () => {
      const m = await createMission({ name: "Doomed" }, USER_A, h.db);
      await createTask({ missionId: m.mission.id, name: "T1" }, USER_A, h.db);
      await createTask({ missionId: m.mission.id, name: "T2" }, USER_A, h.db);
      expect(await getTasks(m.mission.id, USER_A, h.db)).toHaveLength(2);

      const del = await deleteMission(m.mission.id, USER_A, h.db);
      expect(del.ok).toBe(true);
      expect(await getMission(m.mission.id, USER_A, h.db)).toBeNull();
      expect(await getTasks(m.mission.id, USER_A, h.db)).toHaveLength(0);
    });

    it("refuses to delete another user's mission (no deletion)", async () => {
      const m = await createMission({ name: "Theirs" }, USER_A, h.db);
      const del = await deleteMission(m.mission.id, USER_B, h.db);
      expect(del.ok).toBe(true);
      // The mission survives — USER_B's scoped delete matched nothing.
      expect(await getMission(m.mission.id, USER_A, h.db)).not.toBeNull();
    });
  });

  // --- addDependency / removeDependency ---------------------------------
  describe("dependency edges", () => {
    let aId: string;
    let bId: string;
    let missionId: string;

    beforeEach(async () => {
      const m = await createMission({ name: "M" }, USER_A, h.db);
      missionId = m.mission.id;
      const a = await createTask({ missionId, name: "A" }, USER_A, h.db);
      const b = await createTask({ missionId, name: "B" }, USER_A, h.db);
      if (!a.ok || !b.ok) throw new Error("setup failed");
      aId = a.task.id;
      bId = b.task.id;
    });

    it("adds an edge", async () => {
      const result = await addDependency(aId, bId, USER_A, h.db);
      expect(result.ok).toBe(true);
      const edges = await getTaskDependencies(missionId, USER_A, h.db);
      expect(edges).toHaveLength(1);
      expect(edges[0]!.taskId).toBe(aId);
      expect(edges[0]!.dependsOnId).toBe(bId);
    });

    it("rejects a self-dependency with a typed error (no throw)", async () => {
      const result = await addDependency(aId, aId, USER_A, h.db);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toMatch(/itself/i);
      // Nothing was inserted.
      expect(await getTaskDependencies(missionId, USER_A, h.db)).toHaveLength(
        0,
      );
    });

    it("rejects a duplicate edge with a typed error (no throw)", async () => {
      const first = await addDependency(aId, bId, USER_A, h.db);
      expect(first.ok).toBe(true);
      const dup = await addDependency(aId, bId, USER_A, h.db);
      expect(dup.ok).toBe(false);
      if (!dup.ok) expect(dup.error).toMatch(/already exists/i);
      // Still exactly one edge.
      expect(await getTaskDependencies(missionId, USER_A, h.db)).toHaveLength(
        1,
      );
    });

    it("rejects an edge to a non-existent task with a typed error (no throw)", async () => {
      const result = await addDependency(
        aId,
        "00000000-0000-0000-0000-000000000000",
        USER_A,
        h.db,
      );
      expect(result.ok).toBe(false);
    });

    it("removes an edge and is idempotent", async () => {
      await addDependency(aId, bId, USER_A, h.db);
      const removed = await removeDependency(aId, bId, USER_A, h.db);
      expect(removed.ok).toBe(true);
      expect(await getTaskDependencies(missionId, USER_A, h.db)).toHaveLength(
        0,
      );

      // Removing again is a no-op {ok:true}.
      const again = await removeDependency(aId, bId, USER_A, h.db);
      expect(again.ok).toBe(true);
    });

    it("refuses to add an edge between another user's tasks (no insert)", async () => {
      // aId/bId belong to USER_A; USER_B must not wire an edge.
      const result = await addDependency(aId, bId, USER_B, h.db);
      expect(result.ok).toBe(false);
      // No edge exists for the real owner.
      expect(await getTaskDependencies(missionId, USER_A, h.db)).toHaveLength(
        0,
      );
    });

    it("removeDependency scoped to user B leaves user A's edge intact", async () => {
      await addDependency(aId, bId, USER_A, h.db);
      const removed = await removeDependency(aId, bId, USER_B, h.db);
      // Idempotent shape, but USER_A's edge must survive.
      expect(removed.ok).toBe(true);
      expect(await getTaskDependencies(missionId, USER_A, h.db)).toHaveLength(
        1,
      );
    });
  });
});
