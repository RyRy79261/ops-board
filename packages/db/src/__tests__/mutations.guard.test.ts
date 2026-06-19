import { describe, expect, it } from "vitest";
import {
  createMission,
  createTask,
  updateTask,
  updateMission,
  deleteTask,
  deleteMission,
  addDependency,
  removeDependency,
} from "../mutations";

// Input-guard unit tests — these do NOT need a database. Each mutation's
// default `db = createHttpDb()` builds a (never-connected) client, then the
// guards reject malformed input BEFORE any SQL is issued. This proves a bad
// UUID / impossible date never reaches Postgres as a raw error (the boundary
// the voice + MCP layers feed). Real-DB behavior lives in the integration suite.
const UUID = "11111111-1111-1111-1111-111111111111";
// A valid principal — these guard tests assert the id/date guards fire BEFORE
// any SQL, so the userId here is never actually used against a DB; it just
// satisfies the new required `userId` parameter the scoping work added.
const USER = "user_guard";

describe("mutation input guards (no DB)", () => {
  it("rejects non-UUID ids before touching SQL", async () => {
    await expect(
      createTask({ missionId: "not-a-uuid", name: "x" }, USER),
    ).rejects.toThrow(/valid UUID/);
    await expect(updateTask("nope", { name: "y" }, USER)).rejects.toThrow(
      /valid UUID/,
    );
    await expect(deleteTask("nope", USER)).rejects.toThrow(/valid UUID/);
    await expect(deleteMission("nope", USER)).rejects.toThrow(/valid UUID/);
    await expect(updateMission("nope", { name: "y" }, USER)).rejects.toThrow(
      /valid UUID/,
    );
    await expect(addDependency("a", "b", USER)).rejects.toThrow(/valid UUID/);
    await expect(removeDependency(UUID, "b", USER)).rejects.toThrow(
      /valid UUID/,
    );
    await expect(
      createTask({ missionId: UUID, name: "x", categoryId: "bad" }, USER),
    ).rejects.toThrow(/valid UUID/);
  });

  it("rejects impossible calendar dates before touching SQL", async () => {
    await expect(
      createMission({ name: "M", targetDate: "2026-13-45" }, USER),
    ).rejects.toThrow();
    await expect(
      createTask({ missionId: UUID, name: "x", tooLateBy: "2026-02-30" }, USER),
    ).rejects.toThrow();
    await expect(
      updateTask(UUID, { notBefore: "2026-00-10" }, USER),
    ).rejects.toThrow();
    await expect(
      updateMission(UUID, { targetDate: "2026-13-45" }, USER),
    ).rejects.toThrow();
  });

  it("rejects a missing userId before touching SQL", async () => {
    // With a valid id + date but an empty userId, the userId guard must fire.
    await expect(createMission({ name: "M" }, "")).rejects.toThrow(/userId/);
    await expect(
      createTask({ missionId: UUID, name: "x" }, ""),
    ).rejects.toThrow(/userId/);
    await expect(updateTask(UUID, { name: "y" }, "")).rejects.toThrow(/userId/);
    await expect(updateMission(UUID, { name: "y" }, "")).rejects.toThrow(
      /userId/,
    );
    await expect(deleteTask(UUID, "")).rejects.toThrow(/userId/);
    await expect(deleteMission(UUID, "")).rejects.toThrow(/userId/);
    await expect(addDependency(UUID, UUID, "")).rejects.toThrow(/userId/);
    await expect(removeDependency(UUID, UUID, "")).rejects.toThrow(/userId/);
  });
});
