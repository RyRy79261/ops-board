import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { z } from "zod";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Tool-level tests for the integration MCP tools (tools/integrations.ts):
// registration, context replacement, mission linking, and the confirm-token
// delete dance — services mocked, runTool + Zod boundary real.

vi.mock("@opsboard/db", () => ({
  createHttpDb: vi.fn(() => ({})),
}));
vi.mock("@opsboard/db/mcp", () => ({
  appendMcpAuditLog: vi.fn(async () => {}),
  findActiveAccessToken: vi.fn(async () => null),
  touchAccessToken: vi.fn(async () => {}),
}));
vi.mock("@opsboard/db/integrations", () => ({
  createIntegration: vi.fn(),
  updateIntegration: vi.fn(),
  getIntegration: vi.fn(),
  listIntegrations: vi.fn(async () => []),
  deleteIntegration: vi.fn(),
  linkIntegrationToMission: vi.fn(),
  unlinkIntegrationFromMission: vi.fn(),
  listIntegrationsForMission: vi.fn(async () => []),
  MAX_CONTEXT_CHARS: 4000,
}));
vi.mock("@opsboard/db/missions", () => ({
  getMission: vi.fn(),
}));
vi.mock("../confirm-token", () => ({
  issueConfirmToken: vi.fn(async () => "confirm-token-1"),
  consumeConfirmToken: vi.fn(async () => true),
}));

import {
  createIntegration,
  updateIntegration,
  getIntegration,
  deleteIntegration,
  linkIntegrationToMission,
} from "@opsboard/db/integrations";
import { issueConfirmToken, consumeConfirmToken } from "../confirm-token";
import { registerIntegrationTools } from "../tools/integrations";

const USER = "user_test_alpha";
const MISSION_ID = "22222222-2222-4222-8222-222222222222";
const INTEGRATION_ID = "66666666-6666-4666-8666-666666666666";

const INTEGRATION = {
  id: INTEGRATION_ID,
  userId: USER,
  name: "Van Build",
  slug: "van-build",
  description: null,
  context: "MWB Crafter, 24V / 300Ah.",
  createdAt: new Date("2026-07-07T10:00:00Z"),
  updatedAt: new Date("2026-07-07T10:00:00Z"),
};

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
  registerIntegrationTools(fakeServer);
});

const extra = {
  authInfo: {
    token: "test-token",
    clientId: "test-client",
    scopes: [],
    extra: { userId: USER },
  },
};

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

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(issueConfirmToken).mockResolvedValue("confirm-token-1");
  vi.mocked(consumeConfirmToken).mockResolvedValue(true);
});

describe("register_integration", () => {
  it("registers and returns the integration", async () => {
    vi.mocked(createIntegration).mockResolvedValue({
      ok: true,
      integration: INTEGRATION as never,
    });
    const res = await call("register_integration", {
      name: "Van Build",
      slug: "van-build",
      context: "MWB Crafter, 24V / 300Ah.",
    });
    expect(res.kind).toBe("ok");
    expect(createIntegration).toHaveBeenCalledWith(
      {
        name: "Van Build",
        slug: "van-build",
        description: null,
        context: "MWB Crafter, 24V / 300Ah.",
      },
      USER,
    );
  });

  it("rejects a bad slug and an over-cap context at the boundary", async () => {
    expect(
      await call("register_integration", { name: "X", slug: "Bad Slug!" }),
    ).toEqual({ kind: "schema-reject" });
    expect(
      await call("register_integration", {
        name: "X",
        slug: "x",
        context: "y".repeat(4001),
      }),
    ).toEqual({ kind: "schema-reject" });
    expect(createIntegration).not.toHaveBeenCalled();
  });

  it("surfaces a duplicate slug as a caller-visible error", async () => {
    vi.mocked(createIntegration).mockResolvedValue({
      ok: false,
      error: 'An integration "van-build" already exists.',
    });
    const res = await call("register_integration", {
      name: "Van Build",
      slug: "van-build",
    });
    expect(res).toEqual({
      kind: "error",
      message: 'An integration "van-build" already exists.',
    });
  });
});

describe("update_integration / link_integration", () => {
  it("replaces the context document", async () => {
    vi.mocked(updateIntegration).mockResolvedValue({
      ok: true,
      integration: { ...INTEGRATION, context: "48V now." } as never,
    });
    const res = await call("update_integration", {
      integrationId: INTEGRATION_ID,
      context: "48V now.",
    });
    expect(res.kind).toBe("ok");
    expect(updateIntegration).toHaveBeenCalledWith(
      INTEGRATION_ID,
      { name: undefined, description: undefined, context: "48V now." },
      USER,
    );
  });

  it("reads a foreign integration/mission pair as not-found on link", async () => {
    vi.mocked(linkIntegrationToMission).mockResolvedValue({
      ok: false,
      error: "Mission or integration not found.",
    });
    const res = await call("link_integration", {
      missionId: MISSION_ID,
      integrationId: INTEGRATION_ID,
    });
    expect(res).toEqual({
      kind: "error",
      message: "Mission or integration not found.",
    });
  });
});

describe("delete_integration (confirm-token dance)", () => {
  it("first call issues a token and does NOT delete", async () => {
    vi.mocked(getIntegration).mockResolvedValue(INTEGRATION as never);
    const res = await call("delete_integration", {
      integrationId: INTEGRATION_ID,
    });
    expect(res.kind).toBe("ok");
    const payload = (res as { payload: Record<string, unknown> }).payload;
    expect(payload.needsConfirmation).toBe(true);
    expect(payload.confirm).toBe("confirm-token-1");
    expect(deleteIntegration).not.toHaveBeenCalled();
  });

  it("second call with the token deletes; a bad token refuses", async () => {
    vi.mocked(getIntegration).mockResolvedValue(INTEGRATION as never);
    vi.mocked(deleteIntegration).mockResolvedValue({ ok: true });

    const res = await call("delete_integration", {
      integrationId: INTEGRATION_ID,
      confirm: "confirm-token-1",
    });
    expect(res.kind).toBe("ok");
    expect(deleteIntegration).toHaveBeenCalledWith(
      INTEGRATION_ID,
      USER,
      expect.anything(),
    );

    vi.mocked(consumeConfirmToken).mockResolvedValue(false);
    const bad = await call("delete_integration", {
      integrationId: INTEGRATION_ID,
      confirm: "stale-token",
    });
    expect(bad.kind).toBe("error");
    expect((bad as { message: string }).message).toMatch(/invalid|expired/i);
  });

  it("reads a foreign integration as not-found (no token issued)", async () => {
    vi.mocked(getIntegration).mockResolvedValue(null);
    const res = await call("delete_integration", {
      integrationId: INTEGRATION_ID,
    });
    expect(res).toEqual({
      kind: "error",
      message: "No integration with that id.",
    });
    expect(issueConfirmToken).not.toHaveBeenCalled();
  });
});
