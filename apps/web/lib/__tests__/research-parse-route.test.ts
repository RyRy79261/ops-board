import { describe, it, expect, vi } from "vitest";

// Route-level guard test for /api/research/parse missionId validation. The 400
// path returns BEFORE the DB query and the AI vendors, so this needs no Postgres
// and no network — just auth + rate-limit mocked, and the vendors stubbed to
// crash if ever reached (they must not be, on the reject path).
vi.mock("@/lib/auth", () => ({
  getAuthenticatedUser: vi.fn(async () => ({
    id: "user_test_alpha",
    email: "a@b.test",
  })),
}));
vi.mock("@/lib/rate-limit", () => ({
  rateLimiter: { limit: vi.fn(async () => ({ ok: true })) },
  getClientIp: vi.fn(() => "test-ip"),
}));
vi.mock("@/lib/groq", () => ({
  transcribeAudio: vi.fn(async () => {
    throw new Error("transcribeAudio must not run on the reject path");
  }),
}));
vi.mock("@/lib/anthropic", () => ({
  callForcedToolStrict: vi.fn(async () => {
    throw new Error("anthropic must not run on the reject path");
  }),
}));
vi.mock("@/lib/ai-key-resolver", () => ({
  resolveAiKey: vi.fn(async () => {
    throw new Error("resolveAiKey must not run on the reject path");
  }),
}));

import { POST } from "@/app/api/research/parse/route";

function audioFile(): File {
  return new File([new Uint8Array([1, 2, 3])], "clip.webm", {
    type: "audio/webm",
  });
}

async function post(missionId?: string): Promise<Response> {
  const fd = new FormData();
  fd.set("audio", audioFile());
  if (missionId !== undefined) fd.set("missionId", missionId);
  return POST(
    new Request("http://localhost/api/research/parse", {
      method: "POST",
      body: fd,
    }),
  );
}

describe("/api/research/parse missionId validation", () => {
  it("rejects a non-UUID missionId with 400 (was a raw Postgres 500)", async () => {
    const res = await post("not-a-uuid");
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toMatch(/missionId/i);
  });

  it("rejects a missing missionId with 400", async () => {
    const res = await post(undefined);
    expect(res.status).toBe(400);
  });
});
