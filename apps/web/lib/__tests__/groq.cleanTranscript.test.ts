import { beforeEach, describe, expect, it, vi } from "vitest";

// Unit test for lib/groq.ts#cleanTranscript — the fast Groq cleanup pass that
// runs in the voice-command hot path BEFORE the Opus classifier. Its
// load-bearing contract is FAIL-OPEN: any hiccup must return the raw transcript
// so cleanup never blocks the command. We mock groq-sdk so no network is hit and
// drive each branch (empty input, normal, empty response, throw, bounded opts).

const createMock = vi.fn();
vi.mock("groq-sdk", () => ({
  default: class {
    chat = { completions: { create: createMock } };
    // The real client takes { apiKey }; we ignore it in the mock.
    constructor(_opts: unknown) {}
  },
}));

import { cleanTranscript } from "@/lib/groq";

const ok = (content: string) => ({
  choices: [{ message: { content } }],
});

describe("cleanTranscript (fail-open)", () => {
  beforeEach(() => {
    createMock.mockReset();
    // Cleanup logs on the catch path; keep test output quiet.
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("returns empty/whitespace input without calling the model", async () => {
    expect(await cleanTranscript("   ", "key")).toBe("");
    expect(createMock).not.toHaveBeenCalled();
  });

  it("returns the trimmed cleaned text on a normal response", async () => {
    createMock.mockResolvedValueOnce(ok("  create a mission called X  "));
    expect(await cleanTranscript("create a mision called X", "key")).toBe(
      "create a mission called X",
    );
  });

  it("falls back to the raw trimmed transcript on an empty model response", async () => {
    createMock.mockResolvedValueOnce(ok("   "));
    expect(await cleanTranscript("  raw words  ", "key")).toBe("raw words");
  });

  it("fails open to the raw transcript when the client throws (e.g. timeout)", async () => {
    createMock.mockRejectedValueOnce(new Error("APIConnectionTimeoutError"));
    expect(await cleanTranscript("  raw words  ", "key")).toBe("raw words");
  });

  it("bounds the request with a timeout and disables retries", async () => {
    createMock.mockResolvedValueOnce(ok("clean"));
    await cleanTranscript("raw", "key");
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({ model: "llama-3.1-8b-instant" }),
      expect.objectContaining({ timeout: 8000, maxRetries: 0 }),
    );
  });
});
