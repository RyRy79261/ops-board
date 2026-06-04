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
  updateTask,
} from "../mutations";
import { createTestDb, type TestDb } from "./db-harness";

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
  });

  // --- createMission ----------------------------------------------------
  describe("createMission", () => {
    it("creates a mission with a target date", async () => {
      const result = await createMission(
        { name: "AfrikaBurn", targetDate: "2026-04-27" },
        h.db,
      );
      expect(result.ok).toBe(true);
      expect(result.mission.name).toBe("AfrikaBurn");
      expect(result.mission.targetDate).toBe("2026-04-27");

      const fetched = await getMission(result.mission.id, h.db);
      expect(fetched?.name).toBe("AfrikaBurn");
    });

    it("creates an open-ended mission (no target date)", async () => {
      const result = await createMission({ name: "Someday" }, h.db);
      expect(result.ok).toBe(true);
      expect(result.mission.targetDate).toBeNull();
    });

    it("trims the name and rejects an empty one", async () => {
      const result = await createMission({ name: "  Trimmed  " }, h.db);
      expect(result.mission.name).toBe("Trimmed");
      await expect(createMission({ name: "   " }, h.db)).rejects.toThrow();
    });
  });

  // --- createTask -------------------------------------------------------
  describe("createTask", () => {
    let missionId: string;

    beforeEach(async () => {
      const m = await createMission({ name: "M" }, h.db);
      missionId = m.mission.id;
    });

    it("creates a bare task with defaults", async () => {
      const result = await createTask({ missionId, name: "Pack" }, h.db);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.task.name).toBe("Pack");
        expect(result.task.status).toBe("not-started");
        expect(result.task.categoryId).toBeNull();
      }
    });

    it("resolves a category by slug", async () => {
      const result = await createTask(
        { missionId, name: "Vaccinations", categorySlug: "medical" },
        h.db,
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        const [cat] = await h.client
          .select()
          .from(schema.categories);
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
        h.db,
      );
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toContain("nope");
    });

    it("returns a typed error (no throw) for a bad mission FK", async () => {
      const result = await createTask(
        { missionId: "00000000-0000-0000-0000-000000000000", name: "Orphan" },
        h.db,
      );
      expect(result.ok).toBe(false);
    });
  });

  // --- updateTask -------------------------------------------------------
  describe("updateTask", () => {
    let missionId: string;
    let taskId: string;

    beforeEach(async () => {
      const m = await createMission({ name: "M" }, h.db);
      missionId = m.mission.id;
      const t = await createTask({ missionId, name: "Original" }, h.db);
      if (!t.ok) throw new Error("setup failed");
      taskId = t.task.id;
    });

    it("patches only supplied fields and bumps updated_at", async () => {
      const before = await getTask(taskId, h.db);
      const result = await updateTask(
        taskId,
        { name: "Renamed", status: "done", notes: "did it" },
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
        h.db,
      );
      expect(moved.ok).toBe(true);
      const travel = (await h.client.select().from(schema.categories)).find(
        (c) => c.slug === "travel",
      );
      if (moved.ok) expect(moved.task.categoryId).toBe(travel!.id);

      const cleared = await updateTask(taskId, { categorySlug: null }, h.db);
      if (cleared.ok) expect(cleared.task.categoryId).toBeNull();
    });

    it("clears a cliff date with null", async () => {
      await updateTask(taskId, { tooLateBy: "2026-04-01" }, h.db);
      const cleared = await updateTask(taskId, { tooLateBy: null }, h.db);
      if (cleared.ok) expect(cleared.task.tooLateBy).toBeNull();
    });

    it("returns {ok:false} (no throw) for an unknown task", async () => {
      const result = await updateTask(
        "00000000-0000-0000-0000-000000000000",
        { name: "Ghost" },
        h.db,
      );
      expect(result.ok).toBe(false);
    });

    it("returns {ok:false} (no throw) for an unknown category slug", async () => {
      const result = await updateTask(taskId, { categorySlug: "nope" }, h.db);
      expect(result.ok).toBe(false);
    });
  });

  // --- deleteTask + cascade ---------------------------------------------
  describe("deleteTask", () => {
    it("deletes a task and cascades its dependency edges", async () => {
      const m = await createMission({ name: "M" }, h.db);
      const a = await createTask({ missionId: m.mission.id, name: "A" }, h.db);
      const b = await createTask({ missionId: m.mission.id, name: "B" }, h.db);
      if (!a.ok || !b.ok) throw new Error("setup failed");

      await addDependency(a.task.id, b.task.id, h.db);
      expect(await getTaskDependencies(m.mission.id, h.db)).toHaveLength(1);

      const del = await deleteTask(a.task.id, h.db);
      expect(del.ok).toBe(true);
      expect(await getTask(a.task.id, h.db)).toBeNull();
      // Edge gone via cascade.
      expect(await getTaskDependencies(m.mission.id, h.db)).toHaveLength(0);
    });

    it("is idempotent for a missing task", async () => {
      const del = await deleteTask(
        "00000000-0000-0000-0000-000000000000",
        h.db,
      );
      expect(del.ok).toBe(true);
    });
  });

  // --- deleteMission + cascade ------------------------------------------
  describe("deleteMission", () => {
    it("deletes a mission and cascades its tasks", async () => {
      const m = await createMission({ name: "Doomed" }, h.db);
      await createTask({ missionId: m.mission.id, name: "T1" }, h.db);
      await createTask({ missionId: m.mission.id, name: "T2" }, h.db);
      expect(await getTasks(m.mission.id, h.db)).toHaveLength(2);

      const del = await deleteMission(m.mission.id, h.db);
      expect(del.ok).toBe(true);
      expect(await getMission(m.mission.id, h.db)).toBeNull();
      expect(await getTasks(m.mission.id, h.db)).toHaveLength(0);
    });
  });

  // --- addDependency / removeDependency ---------------------------------
  describe("dependency edges", () => {
    let aId: string;
    let bId: string;
    let missionId: string;

    beforeEach(async () => {
      const m = await createMission({ name: "M" }, h.db);
      missionId = m.mission.id;
      const a = await createTask({ missionId, name: "A" }, h.db);
      const b = await createTask({ missionId, name: "B" }, h.db);
      if (!a.ok || !b.ok) throw new Error("setup failed");
      aId = a.task.id;
      bId = b.task.id;
    });

    it("adds an edge", async () => {
      const result = await addDependency(aId, bId, h.db);
      expect(result.ok).toBe(true);
      const edges = await getTaskDependencies(missionId, h.db);
      expect(edges).toHaveLength(1);
      expect(edges[0]!.taskId).toBe(aId);
      expect(edges[0]!.dependsOnId).toBe(bId);
    });

    it("rejects a self-dependency with a typed error (no throw)", async () => {
      const result = await addDependency(aId, aId, h.db);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toMatch(/itself/i);
      // Nothing was inserted.
      expect(await getTaskDependencies(missionId, h.db)).toHaveLength(0);
    });

    it("rejects a duplicate edge with a typed error (no throw)", async () => {
      const first = await addDependency(aId, bId, h.db);
      expect(first.ok).toBe(true);
      const dup = await addDependency(aId, bId, h.db);
      expect(dup.ok).toBe(false);
      if (!dup.ok) expect(dup.error).toMatch(/already exists/i);
      // Still exactly one edge.
      expect(await getTaskDependencies(missionId, h.db)).toHaveLength(1);
    });

    it("rejects an edge to a non-existent task with a typed error (no throw)", async () => {
      const result = await addDependency(
        aId,
        "00000000-0000-0000-0000-000000000000",
        h.db,
      );
      expect(result.ok).toBe(false);
    });

    it("removes an edge and is idempotent", async () => {
      await addDependency(aId, bId, h.db);
      const removed = await removeDependency(aId, bId, h.db);
      expect(removed.ok).toBe(true);
      expect(await getTaskDependencies(missionId, h.db)).toHaveLength(0);

      // Removing again is a no-op {ok:true}.
      const again = await removeDependency(aId, bId, h.db);
      expect(again.ok).toBe(true);
    });
  });
});
