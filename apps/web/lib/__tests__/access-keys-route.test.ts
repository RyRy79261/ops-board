import { describe, it, expect, vi, beforeEach } from "vitest";
import { createHash } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";

// /api/user/access-keys — key minting. The critical property: the PLAINTEXT
// is returned exactly once and only its SHA-256 + display prefix are stored.

vi.mock("@/lib/auth-middleware", () => ({
  withAuth:
    (
      handler: (
        req: NextRequest,
        ctx: { userId: string; email: string | null },
      ) => Promise<NextResponse>,
    ) =>
    (req: NextRequest) =>
      handler(req, { userId: "user_test_alpha", email: "a@b.test" }),
}));
vi.mock("@opsboard/db/client-api-keys", () => ({
  createClientApiKey: vi.fn(),
  listClientApiKeys: vi.fn(async () => []),
}));
vi.mock("@/lib/rate-limit", () => ({
  rateLimiter: {
    limit: vi.fn(async () => ({ ok: true, retryAfterSeconds: 0 })),
  },
  getClientIp: vi.fn(() => "test-ip"),
}));

import {
  createClientApiKey,
  listClientApiKeys,
} from "@opsboard/db/client-api-keys";
import { GET, POST } from "@/app/api/user/access-keys/route";

const USER = "user_test_alpha";
const KEY_ID = "55555555-5555-4555-8555-555555555555";

function post(body: unknown): Promise<Response> {
  return POST(
    new Request("http://localhost/api/user/access-keys", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }) as never,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/user/access-keys", () => {
  it("mints an opsb_ key, stores ONLY its hash + prefix, returns the plaintext once", async () => {
    vi.mocked(createClientApiKey).mockImplementation(async (input) => ({
      ok: true,
      key: {
        id: KEY_ID,
        userId: USER,
        name: input.name,
        keyHash: input.keyHash,
        prefix: input.prefix,
        scope: "",
        createdAt: new Date("2026-07-07T12:00:00Z"),
        lastUsedAt: null,
        revokedAt: null,
      },
    }));

    const res = await post({ name: "van-build console" });
    expect(res.status).toBe(201);
    const body = (await res.json()) as {
      key: { id: string; prefix: string };
      plaintext: string;
    };

    // The plaintext is a fresh opsb_ secret…
    expect(body.plaintext).toMatch(/^opsb_[A-Za-z0-9_-]{40,}$/);
    // …whose SHA-256 (and nothing else) went to storage.
    const stored = vi.mocked(createClientApiKey).mock.calls[0]![0];
    expect(stored.keyHash).toBe(
      createHash("sha256").update(body.plaintext).digest("hex"),
    );
    expect(stored.keyHash).not.toBe(body.plaintext);
    // The stored prefix is display-only — far too short to reconstruct.
    expect(body.key.prefix.length).toBeLessThan(15);
    expect(body.plaintext.startsWith(body.key.prefix.replace("…", ""))).toBe(
      true,
    );
  });

  it("rejects a missing name with 400", async () => {
    const res = await post({});
    expect(res.status).toBe(400);
    expect(createClientApiKey).not.toHaveBeenCalled();
  });
});

describe("GET /api/user/access-keys", () => {
  it("returns metadata only — never a hash, never a plaintext", async () => {
    vi.mocked(listClientApiKeys).mockResolvedValue([
      {
        id: KEY_ID,
        userId: USER,
        name: "van-build console",
        keyHash: "f".repeat(64),
        prefix: "opsb_abc12…",
        scope: "",
        createdAt: new Date("2026-07-07T12:00:00Z"),
        lastUsedAt: null,
        revokedAt: null,
      },
    ]);

    const res = await GET(
      new Request("http://localhost/api/user/access-keys") as never,
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { keys: Record<string, unknown>[] };
    expect(body.keys).toHaveLength(1);
    expect(body.keys[0]).not.toHaveProperty("keyHash");
    expect(JSON.stringify(body)).not.toContain("f".repeat(64));
  });
});
