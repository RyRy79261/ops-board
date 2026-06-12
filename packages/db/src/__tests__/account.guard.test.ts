import { describe, expect, it } from "vitest";
import { deleteUserAccount } from "../account";

// Input-guard unit test — no database. deleteUserAccount's default
// `db = createHttpDb()` builds a (never-connected) client; the userId guard
// rejects an empty principal BEFORE any SQL. A destructive op must never run
// against an empty/missing principal. Cascade behavior lives in the integration
// suite.
describe("account input guards (no DB)", () => {
  it("rejects a missing userId before touching SQL", async () => {
    await expect(deleteUserAccount("")).rejects.toThrow(/userId/);
  });
});
