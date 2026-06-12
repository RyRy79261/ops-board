import { describe, expect, it } from "vitest";
import { setUserPreferences, DEFAULT_PREFERENCES } from "../preferences";

// Input-guard unit tests — no database. setUserPreferences' default
// `db = createHttpDb()` builds a (never-connected) client; the userId guard
// rejects an empty principal BEFORE any SQL is issued. Real-DB behavior (upsert
// + default-application on read) lives in the integration suite.

describe("preferences input guards (no DB)", () => {
  it("rejects a missing userId before touching SQL", async () => {
    await expect(
      setUserPreferences("", { notifyClosingWindows: true }),
    ).rejects.toThrow(/userId/);
  });

  it("exposes safe defaults (confirm-on, notify-off)", () => {
    expect(DEFAULT_PREFERENCES).toEqual({
      voiceConfirmDestructive: true,
      notifyClosingWindows: false,
    });
  });
});
