import { describe, it, expect, vi, beforeEach } from "vitest";
import { createHash } from "node:crypto";

// Transport-mapping tests for POST /api/v1/research: the principal seam
// (session OR opsb_ API key — @/lib/api-principal runs FOR REAL against
// mocked db/auth), body validation, and the outcome-code → HTTP-status
// mapping over a mocked @/lib/research-ops flow.

vi.mock("@/lib/research-ops", () => ({
  cueResearchForTask: vi.fn(),
}));
vi.mock("@/lib/auth", () => ({
  getAuthenticatedUser: vi.fn(async () => null),
}));
vi.mock("@opsboard/db/client-api-keys", () => ({
  findActiveClientApiKeyByHash: vi.fn(async () => null),
  touchClientApiKey: vi.fn(async () => {}),
}));
vi.mock("@opsboard/db/mcp", () => ({
  appendMcpAuditLog: vi.fn(async () => {}),
}));
vi.mock("@/lib/rate-limit", () => ({
  rateLimiter: {
    limit: vi.fn(async () => ({ ok: true, retryAfterSeconds: 0 })),
  },
  getClientIp: vi.fn(() => "test-ip"),
}));

import { cueResearchForTask } from "@/lib/research-ops";
import { getAuthenticatedUser } from "@/lib/auth";
import { findActiveClientApiKeyByHash } from "@opsboard/db/client-api-keys";
import { appendMcpAuditLog } from "@opsboard/db/mcp";
import { POST } from "@/app/api/v1/research/route";

const USER = "user_test_alpha";
const TASK_ID = "11111111-1111-4111-8111-111111111111";
const JOB_ID = "33333333-3333-4333-8333-333333333333";
const KEY_ID = "55555555-5555-4555-8555-555555555555";
const PLAINTEXT_KEY = "opsb_test-secret-value";

function post(
  body: unknown,
  headers: Record<string, string> = {},
): Promise<Response> {
  return POST(
    new Request("http://localhost/api/v1/research", {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body),
    }),
  );
}

const CUE_OK = {
  ok: true as const,
  jobId: JOB_ID,
  taskId: TASK_ID,
  missionId: "22222222-2222-4222-8222-222222222222",
  alreadyRunning: false,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getAuthenticatedUser).mockResolvedValue(null);
  vi.mocked(findActiveClientApiKeyByHash).mockResolvedValue(null);
});

describe("POST /api/v1/research auth (principal seam)", () => {
  it("rejects an unauthenticated request with 401", async () => {
    const res = await post({ taskId: TASK_ID, query: "gas vs induction" });
    expect(res.status).toBe(401);
    expect(cueResearchForTask).not.toHaveBeenCalled();
  });

  it("rejects an unknown/revoked opsb_ key with 401 and never falls back to the session", async () => {
    // Even with a live browser session, a presented-but-invalid key must fail.
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: USER,
      email: "a@b.test",
    });
    const res = await post(
      { taskId: TASK_ID, query: "gas vs induction" },
      { authorization: `Bearer ${PLAINTEXT_KEY}` },
    );
    expect(res.status).toBe(401);
    expect(getAuthenticatedUser).not.toHaveBeenCalled();
    expect(cueResearchForTask).not.toHaveBeenCalled();
  });

  it("authenticates a valid opsb_ key: hash lookup, principal = key owner", async () => {
    vi.mocked(findActiveClientApiKeyByHash).mockResolvedValue({
      id: KEY_ID,
      userId: USER,
      name: "van-build console",
    } as never);
    vi.mocked(cueResearchForTask).mockResolvedValue(CUE_OK);

    const res = await post(
      { taskId: TASK_ID, query: "gas vs induction" },
      { authorization: `Bearer ${PLAINTEXT_KEY}` },
    );
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({
      jobId: JOB_ID,
      taskId: TASK_ID,
      state: "running",
      alreadyRunning: false,
    });
    // Only the SHA-256 of the presented key is ever looked up.
    expect(findActiveClientApiKeyByHash).toHaveBeenCalledWith(
      createHash("sha256").update(PLAINTEXT_KEY).digest("hex"),
    );
    expect(cueResearchForTask).toHaveBeenCalledWith(
      { taskId: TASK_ID, query: "gas vs induction" },
      USER,
    );
    // The audit row attributes the call to the key, not just the user.
    expect(appendMcpAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        principalId: USER,
        clientId: `v1-key:${KEY_ID}`,
        tool: "v1.cue_research",
        outcome: "success",
      }),
    );
  });

  it("authenticates the cookie session when no bearer is presented", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: USER,
      email: "a@b.test",
    });
    vi.mocked(cueResearchForTask).mockResolvedValue(CUE_OK);

    const res = await post({ taskId: TASK_ID, query: "gas vs induction" });
    expect(res.status).toBe(201);
    expect(appendMcpAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ clientId: "v1-session" }),
    );
  });
});

describe("POST /api/v1/research outcome mapping", () => {
  beforeEach(() => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: USER,
      email: "a@b.test",
    });
  });

  it("maps no-key to 402 with code NO_AI_KEY", async () => {
    vi.mocked(cueResearchForTask).mockResolvedValue({
      ok: false,
      code: "no-key",
      error: "No Anthropic key configured.",
    });
    const res = await post({ taskId: TASK_ID, query: "q" });
    expect(res.status).toBe(402);
    expect(await res.json()).toMatchObject({ code: "NO_AI_KEY" });
  });

  it("maps not-found to 404 and enqueue-failed to 502", async () => {
    vi.mocked(cueResearchForTask).mockResolvedValue({
      ok: false,
      code: "not-found",
      error: "No task with that id.",
    });
    expect((await post({ taskId: TASK_ID, query: "q" })).status).toBe(404);

    vi.mocked(cueResearchForTask).mockResolvedValue({
      ok: false,
      code: "enqueue-failed",
      error: "Couldn't start the research runner. Try again.",
    });
    expect((await post({ taskId: TASK_ID, query: "q" })).status).toBe(502);
  });

  it("rejects an invalid body with 400 before any auth or flow work", async () => {
    const res = await post({ taskId: TASK_ID, query: "x".repeat(281) });
    expect(res.status).toBe(400);
    expect(cueResearchForTask).not.toHaveBeenCalled();
  });
});
