import { describe, expect, it } from "vitest";
import {
  createMission,
  createTask,
  updateTask,
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

describe("mutation input guards (no DB)", () => {
  it("rejects non-UUID ids before touching SQL", async () => {
    await expect(createTask({ missionId: "not-a-uuid", name: "x" })).rejects.toThrow(
      /valid UUID/,
    );
    await expect(updateTask("nope", { name: "y" })).rejects.toThrow(/valid UUID/);
    await expect(deleteTask("nope")).rejects.toThrow(/valid UUID/);
    await expect(deleteMission("nope")).rejects.toThrow(/valid UUID/);
    await expect(addDependency("a", "b")).rejects.toThrow(/valid UUID/);
    await expect(removeDependency(UUID, "b")).rejects.toThrow(/valid UUID/);
    await expect(
      createTask({ missionId: UUID, name: "x", categoryId: "bad" }),
    ).rejects.toThrow(/valid UUID/);
  });

  it("rejects impossible calendar dates before touching SQL", async () => {
    await expect(
      createMission({ name: "M", targetDate: "2026-13-45" }),
    ).rejects.toThrow();
    await expect(
      createTask({ missionId: UUID, name: "x", tooLateBy: "2026-02-30" }),
    ).rejects.toThrow();
    await expect(
      updateTask(UUID, { notBefore: "2026-00-10" }),
    ).rejects.toThrow();
  });
});
