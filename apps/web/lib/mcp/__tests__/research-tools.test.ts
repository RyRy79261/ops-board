import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { z } from "zod";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Tool-level tests for the research-delegate MCP tools (tools/research.ts).
// No Postgres, no network: the @opsboard/db services, key resolver, Inngest
// client, and rate limiter are all mocked; `runTool` + the Zod boundary run
// FOR REAL so these cover exactly what a remote MCP caller experiences —
// validation, ownership scoping (foreign id → not-found), idempotency (cue +
// keep), the fail-closed key check, and enqueue-failure handling.

vi.mock("@opsboard/db/mcp", () => ({
  appendMcpAuditLog: vi.fn(async () => {}),
  findActiveAccessToken: vi.fn(async () => null),
  touchAccessToken: vi.fn(async () => {}),
}));
vi.mock("@opsboard/db/research", () => ({
  createResearchJob: vi.fn(),
  getResearchJob: vi.fn(),
  getResearchJobsForTask: vi.fn(),
  updateResearchJob: vi.fn(),
  getResearchNotes: vi.fn(),
  getResearchNoteSummariesByMissionId: vi.fn(),
  appendResearchNote: vi.fn(),
}));
vi.mock("@opsboard/db/tasks", () => ({
  getTask: vi.fn(),
}));
vi.mock("@opsboard/db/missions", () => ({
  getMission: vi.fn(),
}));
vi.mock("@opsboard/db/integrations", () => ({
  getMergedContextForMission: vi.fn(async () => null),
}));
vi.mock("@/lib/ai-key-resolver", () => {
  class NoAiKeyError extends Error {
    provider: string;
    constructor(provider: string) {
      super(`No ${provider} key configured.`);
      this.name = "NoAiKeyError";
      this.provider = provider;
    }
  }
  return { NoAiKeyError, resolveAiKey: vi.fn(async () => "sk-test") };
});
vi.mock("@/lib/inngest/client", () => ({
  inngest: { send: vi.fn(async () => ({ ids: ["evt_1"] })) },
}));
vi.mock("@/lib/rate-limit", () => ({
  rateLimiter: {
    limit: vi.fn(async () => ({ ok: true, retryAfterSeconds: 0 })),
  },
  getClientIp: vi.fn(() => "test-ip"),
}));

import {
  createResearchJob,
  getResearchJob,
  getResearchJobsForTask,
  updateResearchJob,
  getResearchNotes,
  getResearchNoteSummariesByMissionId,
  appendResearchNote,
} from "@opsboard/db/research";
import { getTask } from "@opsboard/db/tasks";
import { getMission } from "@opsboard/db/missions";
import { getMergedContextForMission } from "@opsboard/db/integrations";
import { resolveAiKey, NoAiKeyError } from "@/lib/ai-key-resolver";
import { inngest } from "@/lib/inngest/client";
import { rateLimiter } from "@/lib/rate-limit";
import { registerResearchTools } from "../tools/research";

// --- Harness -----------------------------------------------------------------

const USER = "user_test_alpha";
const TASK_ID = "11111111-1111-4111-8111-111111111111";
const MISSION_ID = "22222222-2222-4222-8222-222222222222";
const JOB_ID = "33333333-3333-4333-8333-333333333333";
const NOTE_ID = "44444444-4444-4444-8444-444444444444";

type RegisteredTool = {
  inputSchema: Record<string, z.ZodTypeAny>;
  handler: (args: unknown, extra: unknown) => Promise<CallToolResult>;
};

const tools = new Map<string, RegisteredTool>();
const fakeServer = {
  registerTool: (
    name: string,
    cfg: { inputSchema: Record<string, z.ZodTypeAny> },
    handler: RegisteredTool["handler"],
  ) => {
    tools.set(name, { inputSchema: cfg.inputSchema, handler });
  },
} as unknown as McpServer;

beforeAll(() => {
  registerResearchTools(fakeServer);
});

const extra = {
  authInfo: {
    token: "test-token",
    clientId: "test-client",
    scopes: [],
    extra: { userId: USER },
  },
};

/**
 * Invoke a registered tool the way the SDK does: validate args against the
 * tool's Zod shape first (a schema reject never reaches the handler), then run
 * the handler. Returns the parsed JSON payload or the error text.
 */
async function call(
  name: string,
  args: Record<string, unknown>,
): Promise<
  | { kind: "schema-reject" }
  | { kind: "error"; message: string }
  | { kind: "ok"; payload: Record<string, unknown> }
> {
  const tool = tools.get(name);
  if (!tool) throw new Error(`tool not registered: ${name}`);
  const parsed = z.object(tool.inputSchema).safeParse(args);
  if (!parsed.success) return { kind: "schema-reject" };
  const result = await tool.handler(parsed.data, extra);
  const text = result.content[0]?.type === "text" ? result.content[0].text : "";
  if (result.isError) return { kind: "error", message: text };
  return { kind: "ok", payload: JSON.parse(text) as Record<string, unknown> };
}

function task(overrides: Record<string, unknown> = {}) {
  return { id: TASK_ID, missionId: MISSION_ID, userId: USER, ...overrides };
}

function job(overrides: Record<string, unknown> = {}) {
  return {
    id: JOB_ID,
    userId: USER,
    missionId: MISSION_ID,
    taskId: TASK_ID,
    query: "gas vs induction",
    state: "running",
    steps: [],
    result: null,
    errorMessage: null,
    createdAt: new Date("2026-07-07T10:00:00Z"),
    updatedAt: new Date("2026-07-07T10:00:00Z"),
    completedAt: null,
    ...overrides,
  };
}

const RESULT = {
  summary: "Induction wins for a small van kitchen.",
  steps: [{ index: 1, text: "Size the inverter for surge load.", citations: [1] }],
  sources: [
    {
      index: 1,
      domain: "example.com",
      title: "Van kitchen power",
      url: "https://example.com/van-kitchen",
    },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(rateLimiter.limit).mockResolvedValue({
    ok: true,
    retryAfterSeconds: 0,
  });
  vi.mocked(resolveAiKey).mockResolvedValue("sk-test");
  vi.mocked(inngest.send).mockResolvedValue({ ids: ["evt_1"] } as never);
});

// --- cue_research --------------------------------------------------------------

describe("cue_research", () => {
  it("creates a job, enqueues the runner, and returns jobId + running", async () => {
    vi.mocked(getTask).mockResolvedValue(task() as never);
    vi.mocked(getResearchJobsForTask).mockResolvedValue([]);
    vi.mocked(createResearchJob).mockResolvedValue({
      ok: true,
      job: job() as never,
    });

    const res = await call("cue_research", {
      taskId: TASK_ID,
      query: "gas vs induction",
    });
    expect(res).toEqual({
      kind: "ok",
      payload: {
        jobId: JOB_ID,
        taskId: TASK_ID,
        state: "running",
        alreadyRunning: false,
      },
    });
    // missionId derived from the task, never caller-supplied.
    expect(createResearchJob).toHaveBeenCalledWith(
      {
        missionId: MISSION_ID,
        taskId: TASK_ID,
        query: "gas vs induction",
        context: null,
      },
      USER,
    );
    expect(inngest.send).toHaveBeenCalledWith({
      name: "research/job.requested",
      data: { jobId: JOB_ID, userId: USER },
    });
  });

  it("appends `focus` to the query the runner receives", async () => {
    vi.mocked(getTask).mockResolvedValue(task() as never);
    vi.mocked(getResearchJobsForTask).mockResolvedValue([]);
    vi.mocked(createResearchJob).mockResolvedValue({
      ok: true,
      job: job() as never,
    });

    await call("cue_research", {
      taskId: TASK_ID,
      query: "compare 24V inverters",
      focus: "specs, price, where to buy — as a comparison",
    });
    expect(createResearchJob).toHaveBeenCalledWith(
      {
        missionId: MISSION_ID,
        taskId: TASK_ID,
        query:
          "compare 24V inverters\nFocus: specs, price, where to buy — as a comparison",
        context: null,
      },
      USER,
    );
  });

  it("snapshots the mission's merged integration context onto the job", async () => {
    vi.mocked(getTask).mockResolvedValue(task() as never);
    vi.mocked(getResearchJobsForTask).mockResolvedValue([]);
    vi.mocked(getMergedContextForMission).mockResolvedValue(
      "[Van Build]\nMWB Crafter, 24V / 300Ah system.",
    );
    vi.mocked(createResearchJob).mockResolvedValue({
      ok: true,
      job: job() as never,
    });

    await call("cue_research", { taskId: TASK_ID, query: "gas vs induction" });
    expect(getMergedContextForMission).toHaveBeenCalledWith(MISSION_ID, USER);
    expect(createResearchJob).toHaveBeenCalledWith(
      {
        missionId: MISSION_ID,
        taskId: TASK_ID,
        query: "gas vs induction",
        context: "[Van Build]\nMWB Crafter, 24V / 300Ah system.",
      },
      USER,
    );
  });

  it("fails CLOSED for a keyless user — clear error, no job row created", async () => {
    vi.mocked(getTask).mockResolvedValue(task() as never);
    vi.mocked(getResearchJobsForTask).mockResolvedValue([]);
    vi.mocked(resolveAiKey).mockRejectedValue(new NoAiKeyError("anthropic"));

    const res = await call("cue_research", {
      taskId: TASK_ID,
      query: "gas vs induction",
    });
    expect(res.kind).toBe("error");
    expect((res as { message: string }).message).toMatch(/Anthropic key/i);
    expect(createResearchJob).not.toHaveBeenCalled();
    expect(inngest.send).not.toHaveBeenCalled();
  });

  it("re-attaches to an in-flight job even when the key is missing (no write, no key needed)", async () => {
    vi.mocked(getTask).mockResolvedValue(task() as never);
    vi.mocked(getResearchJobsForTask).mockResolvedValue([
      job({ state: "running" }) as never,
    ]);
    vi.mocked(resolveAiKey).mockRejectedValue(new NoAiKeyError("anthropic"));

    const res = await call("cue_research", {
      taskId: TASK_ID,
      query: "gas vs induction",
    });
    expect(res).toEqual({
      kind: "ok",
      payload: {
        jobId: JOB_ID,
        taskId: TASK_ID,
        state: "running",
        alreadyRunning: true,
      },
    });
    expect(resolveAiKey).not.toHaveBeenCalled();
  });

  it("masks a non-key resolveAiKey failure as a generic internal error", async () => {
    vi.mocked(getTask).mockResolvedValue(task() as never);
    vi.mocked(getResearchJobsForTask).mockResolvedValue([]);
    vi.mocked(resolveAiKey).mockRejectedValue(new Error("vault exploded: sql"));

    const res = await call("cue_research", {
      taskId: TASK_ID,
      query: "gas vs induction",
    });
    expect(res).toEqual({ kind: "error", message: "Internal error." });
    expect(createResearchJob).not.toHaveBeenCalled();
  });

  it("returns the in-flight job instead of cueing a duplicate", async () => {
    vi.mocked(getTask).mockResolvedValue(task() as never);
    vi.mocked(getResearchJobsForTask).mockResolvedValue([
      job({ state: "running" }) as never,
    ]);

    const res = await call("cue_research", {
      taskId: TASK_ID,
      query: "gas vs induction",
    });
    expect(res).toEqual({
      kind: "ok",
      payload: {
        jobId: JOB_ID,
        taskId: TASK_ID,
        state: "running",
        alreadyRunning: true,
      },
    });
    expect(createResearchJob).not.toHaveBeenCalled();
    expect(inngest.send).not.toHaveBeenCalled();
  });

  it("marks the job error and surfaces a clean message when the enqueue throws", async () => {
    vi.mocked(getTask).mockResolvedValue(task() as never);
    vi.mocked(getResearchJobsForTask).mockResolvedValue([]);
    vi.mocked(createResearchJob).mockResolvedValue({
      ok: true,
      job: job() as never,
    });
    vi.mocked(inngest.send).mockRejectedValue(new Error("inngest down"));
    vi.mocked(updateResearchJob).mockResolvedValue({
      ok: true,
      job: job({ state: "error" }) as never,
    });

    const res = await call("cue_research", {
      taskId: TASK_ID,
      query: "gas vs induction",
    });
    expect(res).toEqual({
      kind: "error",
      message: "Couldn't start the research runner. Try again.",
    });
    expect(updateResearchJob).toHaveBeenCalledWith(JOB_ID, USER, {
      state: "error",
      errorMessage: "Couldn't start the research runner. Try again.",
    });
  });

  it("still surfaces a clean error when the rollback itself also fails", async () => {
    vi.mocked(getTask).mockResolvedValue(task() as never);
    vi.mocked(getResearchJobsForTask).mockResolvedValue([]);
    vi.mocked(createResearchJob).mockResolvedValue({
      ok: true,
      job: job() as never,
    });
    vi.mocked(inngest.send).mockRejectedValue(new Error("inngest down"));
    vi.mocked(updateResearchJob).mockRejectedValue(new Error("db down too"));

    const res = await call("cue_research", {
      taskId: TASK_ID,
      query: "gas vs induction",
    });
    // The double-failure is logged (job stuck in running) but the caller
    // still gets the clean message — never an unhandled rejection.
    expect(res).toEqual({
      kind: "error",
      message: "Couldn't start the research runner. Try again.",
    });
  });

  it("reads a foreign/unknown task as not-found (owner scoping)", async () => {
    vi.mocked(getTask).mockResolvedValue(null);
    const res = await call("cue_research", {
      taskId: TASK_ID,
      query: "gas vs induction",
    });
    expect(res).toEqual({ kind: "error", message: "No task with that id." });
    expect(resolveAiKey).not.toHaveBeenCalled();
  });

  it("rejects an over-length query and a malformed taskId at the boundary", async () => {
    expect(
      await call("cue_research", { taskId: TASK_ID, query: "x".repeat(281) }),
    ).toEqual({ kind: "schema-reject" });
    expect(
      await call("cue_research", { taskId: "not-a-uuid", query: "ok" }),
    ).toEqual({ kind: "schema-reject" });
    expect(getTask).not.toHaveBeenCalled();
  });

  it("surfaces the principal rate limit as a caller-visible error", async () => {
    vi.mocked(rateLimiter.limit).mockResolvedValue({
      ok: false,
      retryAfterSeconds: 12,
    });
    const res = await call("cue_research", {
      taskId: TASK_ID,
      query: "gas vs induction",
    });
    expect(res.kind).toBe("error");
    expect((res as { message: string }).message).toMatch(/rate limit/i);
    expect(rateLimiter.limit).toHaveBeenCalledWith(`research-cue:${USER}`, {
      limit: 20,
    });
    expect(getTask).not.toHaveBeenCalled();
  });
});

// --- get_research_job -----------------------------------------------------------

describe("get_research_job", () => {
  it("returns the same serialized view the web UI polls", async () => {
    vi.mocked(getResearchJob).mockResolvedValue(
      job({
        state: "complete",
        result: RESULT,
        completedAt: new Date("2026-07-07T10:01:30Z"),
      }) as never,
    );

    const res = await call("get_research_job", { jobId: JOB_ID });
    if (res.kind !== "ok") throw new Error(`expected ok, got ${res.kind}`);
    const view = res.payload.job;
    expect(view).toMatchObject({
      id: JOB_ID,
      taskId: TASK_ID,
      state: "complete",
      query: "gas vs induction",
      result: RESULT,
      errorMessage: null,
      createdAt: "2026-07-07T10:00:00.000Z",
      completedAt: "2026-07-07T10:01:30.000Z",
    });
    expect(getResearchJob).toHaveBeenCalledWith(JOB_ID, USER);
  });

  it("reads a foreign/unknown job as not-found", async () => {
    vi.mocked(getResearchJob).mockResolvedValue(null);
    const res = await call("get_research_job", { jobId: JOB_ID });
    expect(res).toEqual({
      kind: "error",
      message: "No research job with that id.",
    });
  });
});

// --- list_research_jobs ----------------------------------------------------------

describe("list_research_jobs", () => {
  it("returns summaries only (no steps/result), newest first as stored", async () => {
    vi.mocked(getTask).mockResolvedValue(task() as never);
    vi.mocked(getResearchJobsForTask).mockResolvedValue([
      job({ state: "complete", result: RESULT }) as never,
    ]);

    const res = await call("list_research_jobs", { taskId: TASK_ID });
    expect(res).toEqual({
      kind: "ok",
      payload: {
        taskId: TASK_ID,
        jobs: [
          {
            jobId: JOB_ID,
            state: "complete",
            query: "gas vs induction",
            createdAt: "2026-07-07T10:00:00.000Z",
            completedAt: null,
          },
        ],
        count: 1,
      },
    });
    if (res.kind !== "ok") throw new Error(`expected ok, got ${res.kind}`);
    const summary = (res.payload.jobs as object[])[0]!;
    expect(summary).not.toHaveProperty("steps");
    expect(summary).not.toHaveProperty("result");
  });

  it("reads a foreign/unknown task as not-found", async () => {
    vi.mocked(getTask).mockResolvedValue(null);
    const res = await call("list_research_jobs", { taskId: TASK_ID });
    expect(res).toEqual({ kind: "error", message: "No task with that id." });
    expect(getResearchJobsForTask).not.toHaveBeenCalled();
  });
});

// --- keep_research_notes ----------------------------------------------------------

describe("keep_research_notes", () => {
  it("persists the job's OWN server-stored result to its task", async () => {
    vi.mocked(getResearchJob).mockResolvedValue(
      job({ state: "complete", result: RESULT }) as never,
    );
    vi.mocked(getResearchNotes).mockResolvedValue([]);
    vi.mocked(appendResearchNote).mockResolvedValue({
      ok: true,
      note: { id: NOTE_ID, taskId: TASK_ID, jobId: JOB_ID } as never,
    });

    const res = await call("keep_research_notes", { jobId: JOB_ID });
    expect(res).toEqual({
      kind: "ok",
      payload: {
        ok: true,
        taskId: TASK_ID,
        jobId: JOB_ID,
        noteId: NOTE_ID,
        alreadyKept: false,
      },
    });
    expect(appendResearchNote).toHaveBeenCalledWith(
      { taskId: TASK_ID, jobId: JOB_ID, content: RESULT },
      USER,
    );
    expect(rateLimiter.limit).toHaveBeenCalledWith(`research-keep:${USER}`, {
      limit: 30,
    });
  });

  it("is idempotent — keeping an already-kept job returns the existing note", async () => {
    vi.mocked(getResearchJob).mockResolvedValue(
      job({ state: "complete", result: RESULT }) as never,
    );
    vi.mocked(getResearchNotes).mockResolvedValue([
      { id: NOTE_ID, taskId: TASK_ID, jobId: JOB_ID } as never,
    ]);

    const res = await call("keep_research_notes", { jobId: JOB_ID });
    expect(res).toEqual({
      kind: "ok",
      payload: {
        ok: true,
        taskId: TASK_ID,
        jobId: JOB_ID,
        noteId: NOTE_ID,
        alreadyKept: true,
      },
    });
    expect(appendResearchNote).not.toHaveBeenCalled();
  });

  it("refuses a job that isn't complete yet", async () => {
    vi.mocked(getResearchJob).mockResolvedValue(
      job({ state: "running" }) as never,
    );
    const res = await call("keep_research_notes", { jobId: JOB_ID });
    expect(res).toEqual({
      kind: "error",
      message: "This research isn't ready to keep yet.",
    });
    expect(appendResearchNote).not.toHaveBeenCalled();
  });

  it("reads a foreign/unknown job as not-found", async () => {
    vi.mocked(getResearchJob).mockResolvedValue(null);
    const res = await call("keep_research_notes", { jobId: JOB_ID });
    expect(res).toEqual({
      kind: "error",
      message: "No research job with that id.",
    });
  });
});

// --- read_research_notes ----------------------------------------------------------

describe("read_research_notes", () => {
  it("requires exactly one of taskId | missionId", async () => {
    expect(await call("read_research_notes", {})).toEqual({
      kind: "error",
      message: "Provide exactly one of taskId or missionId.",
    });
    expect(
      await call("read_research_notes", {
        taskId: TASK_ID,
        missionId: MISSION_ID,
      }),
    ).toEqual({
      kind: "error",
      message: "Provide exactly one of taskId or missionId.",
    });
  });

  it("returns full note content by taskId", async () => {
    vi.mocked(getTask).mockResolvedValue(task() as never);
    vi.mocked(getResearchNotes).mockResolvedValue([
      {
        id: NOTE_ID,
        taskId: TASK_ID,
        userId: USER,
        jobId: JOB_ID,
        content: RESULT,
        createdAt: new Date("2026-07-07T10:02:00Z"),
      } as never,
    ]);

    const res = await call("read_research_notes", { taskId: TASK_ID });
    expect(res).toEqual({
      kind: "ok",
      payload: {
        taskId: TASK_ID,
        notes: [
          {
            noteId: NOTE_ID,
            jobId: JOB_ID,
            createdAt: "2026-07-07T10:02:00.000Z",
            content: RESULT,
          },
        ],
        count: 1,
      },
    });
  });

  it("returns per-task summaries by missionId", async () => {
    vi.mocked(getMission).mockResolvedValue({
      id: MISSION_ID,
      userId: USER,
      name: "Van build",
    } as never);
    vi.mocked(getResearchNoteSummariesByMissionId).mockResolvedValue([
      { taskId: TASK_ID, count: 2, latestJobId: JOB_ID },
    ]);

    const res = await call("read_research_notes", { missionId: MISSION_ID });
    expect(res).toEqual({
      kind: "ok",
      payload: {
        missionId: MISSION_ID,
        summaries: [{ taskId: TASK_ID, count: 2, latestJobId: JOB_ID }],
        count: 1,
      },
    });
  });

  it("reads a foreign/unknown task or mission as not-found", async () => {
    vi.mocked(getTask).mockResolvedValue(null);
    expect(await call("read_research_notes", { taskId: TASK_ID })).toEqual({
      kind: "error",
      message: "No task with that id.",
    });
    vi.mocked(getMission).mockResolvedValue(null as never);
    expect(
      await call("read_research_notes", { missionId: MISSION_ID }),
    ).toEqual({ kind: "error", message: "No mission with that id." });
  });
});
