import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import * as schema from "../schema";
import { createMission, createTask } from "../mutations";
import {
  appendResearchNote,
  createResearchJob,
  getResearchJob,
  getResearchJobsForTask,
  getResearchNotes,
  getResearchNoteSummariesByTaskIds,
  updateResearchJob,
} from "../research";
import { createTestDb, TEST_USER_ID, type TestDb } from "./db-harness";
import type { ResearchResult, ResearchStep } from "@opsboard/types";

// Real-Postgres integration suite for @opsboard/db/research. GUARDED like the
// other integration suites: skipped wholesale unless a real DATABASE_URL is
// present. In CI the postgres service sets DATABASE_URL and migrate() provisions
// the schema, so the SAME production functions run against a real database.
const DB_URL = process.env.DATABASE_URL;
const hasDb =
  !!DB_URL &&
  !DB_URL.includes("placeholder") &&
  !DB_URL.includes("build:build");

const STEPS: ResearchStep[] = [
  { label: "Parsed intent", state: "done" },
  { label: "Searched the web", state: "done", meta: "8 RESULTS" },
  { label: "Reading source 3 of 6", state: "active", source: "tankwatown.org" },
  { label: "Drafting notes", state: "pending" },
];

const RESULT: ResearchResult = {
  summary: "Submit the Tankwa land-use permit via CapeNature's regional office.",
  steps: [
    { index: 1, text: "Gather the site coordinates and dates.", citations: [1] },
    { index: 2, text: "Email the application to the office.", citations: [1, 2] },
  ],
  sources: [
    {
      index: 1,
      domain: "tankwatown.org",
      title: "Land-use permits",
      url: "https://tankwatown.org/permits",
    },
    {
      index: 2,
      domain: "capenature.co.za",
      title: "Regional offices",
      url: "https://capenature.co.za/offices",
    },
  ],
};

describe.skipIf(!hasDb)("@opsboard/db research (real Postgres)", () => {
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

  /** Create a mission + task owned by `user`, returning both ids. */
  async function seedTask(user: string) {
    const m = await createMission({ name: "AfrikaBurn 2026" }, user, h.db);
    expect(m.ok).toBe(true);
    const t = await createTask(
      { missionId: m.mission.id, name: "Submit Tankwa land-use permit" },
      user,
      h.db,
    );
    if (!t.ok) throw new Error(t.error);
    return { missionId: m.mission.id, taskId: t.task.id };
  }

  // --- createResearchJob ------------------------------------------------
  describe("createResearchJob", () => {
    it("starts a running job bound to the owner's task", async () => {
      const { missionId, taskId } = await seedTask(USER_A);
      const res = await createResearchJob(
        { missionId, taskId, query: "How to submit the permit" },
        USER_A,
        h.db,
      );
      expect(res.ok).toBe(true);
      if (!res.ok) return;
      expect(res.job.state).toBe("running");
      expect(res.job.userId).toBe(USER_A);
      expect(res.job.taskId).toBe(taskId);
      expect(res.job.query).toBe("How to submit the permit");
      expect(res.job.steps).toEqual([]);
      expect(res.job.result).toBeNull();
      expect(res.job.completedAt).toBeNull();
    });

    it("refuses a task owned by another user (no write)", async () => {
      const { missionId, taskId } = await seedTask(USER_A);
      const res = await createResearchJob(
        { missionId, taskId, query: "q" },
        USER_B,
        h.db,
      );
      expect(res.ok).toBe(false);
      expect(await getResearchJobsForTask(taskId, USER_A, h.db)).toHaveLength(0);
    });

    it("refuses a task that is not in the scoped mission", async () => {
      const { taskId } = await seedTask(USER_A);
      const other = await createMission({ name: "Other" }, USER_A, h.db);
      const res = await createResearchJob(
        { missionId: other.mission.id, taskId, query: "q" },
        USER_A,
        h.db,
      );
      expect(res.ok).toBe(false);
    });
  });

  // --- updateResearchJob ------------------------------------------------
  describe("updateResearchJob", () => {
    it("streams steps then completes with a result + completedAt", async () => {
      const { missionId, taskId } = await seedTask(USER_A);
      const created = await createResearchJob(
        { missionId, taskId, query: "q" },
        USER_A,
        h.db,
      );
      if (!created.ok) throw new Error(created.error);

      const streamed = await updateResearchJob(
        created.job.id,
        USER_A,
        { steps: STEPS },
        h.db,
      );
      expect(streamed.ok).toBe(true);
      if (streamed.ok) {
        expect(streamed.job.steps).toHaveLength(4);
        expect(streamed.job.state).toBe("running");
        expect(streamed.job.completedAt).toBeNull();
      }

      const done = await updateResearchJob(
        created.job.id,
        USER_A,
        { state: "complete", result: RESULT },
        h.db,
      );
      expect(done.ok).toBe(true);
      if (done.ok) {
        expect(done.job.state).toBe("complete");
        expect(done.job.result?.summary).toBe(RESULT.summary);
        expect(done.job.completedAt).toBeInstanceOf(Date);
      }
    });

    it("records a failure with a message", async () => {
      const { missionId, taskId } = await seedTask(USER_A);
      const created = await createResearchJob(
        { missionId, taskId, query: "q" },
        USER_A,
        h.db,
      );
      if (!created.ok) throw new Error(created.error);
      const failed = await updateResearchJob(
        created.job.id,
        USER_A,
        { state: "error", errorMessage: "Search provider unreachable." },
        h.db,
      );
      expect(failed.ok).toBe(true);
      if (failed.ok) {
        expect(failed.job.state).toBe("error");
        expect(failed.job.errorMessage).toBe("Search provider unreachable.");
        expect(failed.job.completedAt).toBeInstanceOf(Date);
      }
    });

    it("refuses to update another user's job", async () => {
      const { missionId, taskId } = await seedTask(USER_A);
      const created = await createResearchJob(
        { missionId, taskId, query: "q" },
        USER_A,
        h.db,
      );
      if (!created.ok) throw new Error(created.error);
      const res = await updateResearchJob(
        created.job.id,
        USER_B,
        { state: "complete", result: RESULT },
        h.db,
      );
      expect(res.ok).toBe(false);
      // The original job is untouched.
      const fetched = await getResearchJob(created.job.id, USER_A, h.db);
      expect(fetched?.state).toBe("running");
    });
  });

  // --- getResearchJob(sForTask) -----------------------------------------
  describe("reads are owner-scoped", () => {
    it("hides another user's job", async () => {
      const { missionId, taskId } = await seedTask(USER_A);
      const created = await createResearchJob(
        { missionId, taskId, query: "q" },
        USER_A,
        h.db,
      );
      if (!created.ok) throw new Error(created.error);
      expect(await getResearchJob(created.job.id, USER_B, h.db)).toBeNull();
      expect(await getResearchJobsForTask(taskId, USER_B, h.db)).toHaveLength(0);
    });
  });

  // --- appendResearchNote (KEEP NOTES write) ----------------------------
  describe("appendResearchNote", () => {
    it("persists kept notes on the owner's task and is append-only", async () => {
      const { missionId, taskId } = await seedTask(USER_A);
      const created = await createResearchJob(
        { missionId, taskId, query: "q" },
        USER_A,
        h.db,
      );
      if (!created.ok) throw new Error(created.error);

      const first = await appendResearchNote(
        { taskId, jobId: created.job.id, content: RESULT },
        USER_A,
        h.db,
      );
      expect(first.ok).toBe(true);
      if (first.ok) {
        expect(first.note.taskId).toBe(taskId);
        expect(first.note.userId).toBe(USER_A);
        expect(first.note.jobId).toBe(created.job.id);
        expect(first.note.content.steps).toHaveLength(2);
      }

      // Keeping again appends a second row (never overwrites).
      await appendResearchNote({ taskId, content: RESULT }, USER_A, h.db);
      expect(await getResearchNotes(taskId, USER_A, h.db)).toHaveLength(2);
    });

    it("refuses to attach notes to another user's task (no write)", async () => {
      const { taskId } = await seedTask(USER_A);
      const res = await appendResearchNote(
        { taskId, content: RESULT },
        USER_B,
        h.db,
      );
      expect(res.ok).toBe(false);
      expect(await getResearchNotes(taskId, USER_A, h.db)).toHaveLength(0);
    });

    it("refuses a jobId that belongs to a different task (provenance)", async () => {
      const { missionId, taskId: taskA } = await seedTask(USER_A);
      const taskB = await createTask(
        { missionId, name: "Vehicle Pass Permit" },
        USER_A,
        h.db,
      );
      if (!taskB.ok) throw new Error(taskB.error);
      const jobOnA = await createResearchJob(
        { missionId, taskId: taskA, query: "q" },
        USER_A,
        h.db,
      );
      if (!jobOnA.ok) throw new Error(jobOnA.error);

      // Citing task A's job while attaching to task B must be refused.
      const res = await appendResearchNote(
        { taskId: taskB.task.id, jobId: jobOnA.job.id, content: RESULT },
        USER_A,
        h.db,
      );
      expect(res.ok).toBe(false);
      expect(await getResearchNotes(taskB.task.id, USER_A, h.db)).toHaveLength(0);
    });

    it("survives a deleted job via ON DELETE SET NULL", async () => {
      const { missionId, taskId } = await seedTask(USER_A);
      const created = await createResearchJob(
        { missionId, taskId, query: "q" },
        USER_A,
        h.db,
      );
      if (!created.ok) throw new Error(created.error);
      await appendResearchNote(
        { taskId, jobId: created.job.id, content: RESULT },
        USER_A,
        h.db,
      );
      // Deleting the job nulls the note's jobId but keeps the kept note.
      await h.client
        .delete(schema.researchJobs)
        .where(eq(schema.researchJobs.id, created.job.id));
      const notes = await getResearchNotes(taskId, USER_A, h.db);
      expect(notes).toHaveLength(1);
      expect(notes[0]!.jobId).toBeNull();
    });
  });

  // --- cascade ----------------------------------------------------------
  it("deleting the user sweeps their jobs + kept notes", async () => {
    const { missionId, taskId } = await seedTask(USER_A);
    const created = await createResearchJob(
      { missionId, taskId, query: "q" },
      USER_A,
      h.db,
    );
    if (!created.ok) throw new Error(created.error);
    await appendResearchNote({ taskId, content: RESULT }, USER_A, h.db);

    await h.client.delete(schema.users).where(eq(schema.users.id, USER_A));

    const jobs = await h.client
      .select()
      .from(schema.researchJobs)
      .where(eq(schema.researchJobs.userId, USER_A));
    const notes = await h.client
      .select()
      .from(schema.taskResearchNotes)
      .where(eq(schema.taskResearchNotes.userId, USER_A));
    expect(jobs).toHaveLength(0);
    expect(notes).toHaveLength(0);
  });

  // --- getResearchNoteSummariesByTaskIds (the board "✦ N" rollup) -------
  describe("getResearchNoteSummariesByTaskIds", () => {
    it("rolls up count + latest non-null job per task", async () => {
      const { missionId, taskId } = await seedTask(USER_A);
      const job = await createResearchJob(
        { missionId, taskId, query: "q" },
        USER_A,
        h.db,
      );
      if (!job.ok) throw new Error(job.error);

      // Two kept notes: the first cites the job; the second (newer) has NO job.
      await appendResearchNote(
        { taskId, jobId: job.job.id, content: RESULT },
        USER_A,
        h.db,
      );
      await appendResearchNote({ taskId, content: RESULT }, USER_A, h.db);

      const [summary] = await getResearchNoteSummariesByTaskIds(
        [taskId],
        USER_A,
        h.db,
      );
      expect(summary?.count).toBe(2);
      // The newest note's job is null, but the link skips nulls → the id survives.
      expect(summary?.latestJobId).toBe(job.job.id);
    });

    it("excludes another user's notes + omits tasks with none", async () => {
      const { missionId, taskId } = await seedTask(USER_A);
      const empty = await createTask(
        { missionId, name: "A task with no research" },
        USER_A,
        h.db,
      );
      if (!empty.ok) throw new Error(empty.error);
      await appendResearchNote({ taskId, content: RESULT }, USER_A, h.db);

      // USER_B sees nothing for USER_A's task (the userId WHERE filter).
      expect(
        await getResearchNoteSummariesByTaskIds([taskId], USER_B, h.db),
      ).toEqual([]);

      // USER_A: only the task with notes appears; the empty one is omitted.
      const rollup = await getResearchNoteSummariesByTaskIds(
        [taskId, empty.task.id],
        USER_A,
        h.db,
      );
      expect(rollup).toHaveLength(1);
      expect(rollup[0]?.taskId).toBe(taskId);
      expect(rollup[0]?.count).toBe(1);
    });
  });
});
