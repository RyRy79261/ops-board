import { describe, expect, it } from "vitest";
import {
  createResearchJob,
  getResearchJob,
  getResearchJobsForTask,
  updateResearchJob,
  appendResearchNote,
  getResearchNotes,
} from "../research";
import type { ResearchResult } from "@opsboard/types";

// Input-guard unit tests — these do NOT need a database. Each function's default
// `db = createHttpDb()` builds a (never-connected) client; the guards reject
// malformed input BEFORE any SQL is issued, so a bad UUID / empty principal /
// malformed payload never reaches Postgres. Real-DB behavior lives in the
// integration suite.
const UUID = "11111111-1111-1111-1111-111111111111";
const USER = "user_guard";

const VALID_RESULT: ResearchResult = {
  summary: "A valid kept result.",
  steps: [{ index: 1, text: "Do the thing.", citations: [1] }],
  sources: [
    {
      index: 1,
      domain: "example.org",
      title: "Source",
      url: "https://example.org/a",
    },
  ],
};

describe("research input guards (no DB)", () => {
  it("rejects non-UUID ids before touching SQL", async () => {
    await expect(
      createResearchJob({ missionId: "bad", taskId: UUID, query: "q" }, USER),
    ).rejects.toThrow(/valid UUID/);
    await expect(
      createResearchJob({ missionId: UUID, taskId: "bad", query: "q" }, USER),
    ).rejects.toThrow(/valid UUID/);
    await expect(getResearchJob("nope", USER)).rejects.toThrow(/valid UUID/);
    await expect(getResearchJobsForTask("nope", USER)).rejects.toThrow(
      /valid UUID/,
    );
    await expect(updateResearchJob("nope", USER, {})).rejects.toThrow(
      /valid UUID/,
    );
    await expect(
      appendResearchNote({ taskId: "nope", content: VALID_RESULT }, USER),
    ).rejects.toThrow(/valid UUID/);
    await expect(
      appendResearchNote(
        { taskId: UUID, jobId: "bad", content: VALID_RESULT },
        USER,
      ),
    ).rejects.toThrow(/valid UUID/);
    await expect(getResearchNotes("nope", USER)).rejects.toThrow(/valid UUID/);
  });

  it("rejects a missing userId before touching SQL", async () => {
    await expect(
      createResearchJob({ missionId: UUID, taskId: UUID, query: "q" }, ""),
    ).rejects.toThrow(/userId/);
    await expect(getResearchJob(UUID, "")).rejects.toThrow(/userId/);
    await expect(getResearchJobsForTask(UUID, "")).rejects.toThrow(/userId/);
    await expect(updateResearchJob(UUID, "", {})).rejects.toThrow(/userId/);
    await expect(
      appendResearchNote({ taskId: UUID, content: VALID_RESULT }, ""),
    ).rejects.toThrow(/userId/);
    await expect(getResearchNotes(UUID, "")).rejects.toThrow(/userId/);
  });

  it("rejects an empty query before touching SQL", async () => {
    await expect(
      createResearchJob({ missionId: UUID, taskId: UUID, query: "  " }, USER),
    ).rejects.toThrow(/query/);
  });

  it("rejects a malformed job patch before touching SQL", async () => {
    await expect(
      updateResearchJob(UUID, USER, {
        state: "bogus" as never,
      }),
    ).rejects.toThrow(/state/);
    await expect(
      updateResearchJob(UUID, USER, {
        steps: [{ label: "x", state: "flying" } as never],
      }),
    ).rejects.toThrow(/steps/);
    await expect(
      updateResearchJob(UUID, USER, {
        result: { summary: "", steps: [], sources: [] } as never,
      }),
    ).rejects.toThrow(/result/);
  });

  it("rejects malformed note content before touching SQL", async () => {
    await expect(
      appendResearchNote(
        { taskId: UUID, content: { summary: "" } as never },
        USER,
      ),
    ).rejects.toThrow(/content/);
  });
});
