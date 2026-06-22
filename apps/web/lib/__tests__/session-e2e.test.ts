import { describe, it, expect } from "vitest";
import { e2eSessionUserFromCookie } from "../session-e2e";

/** Encode a cookie value the way the e2e harness does (base64 JSON). */
function cookie(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString("base64");
}

const VALID = cookie({ userId: "user_e2e_alpha", email: "E2E@Example.test" });

describe("e2eSessionUserFromCookie — SECURITY: inert unless explicitly enabled", () => {
  it("returns null when E2E_TEST_AUTH is unset, even with a valid cookie", () => {
    expect(
      e2eSessionUserFromCookie({ NODE_ENV: "development" }, VALID),
    ).toBeNull();
  });

  it("returns null when E2E_TEST_AUTH is not exactly '1'", () => {
    expect(
      e2eSessionUserFromCookie(
        { NODE_ENV: "development", E2E_TEST_AUTH: "true" },
        VALID,
      ),
    ).toBeNull();
    expect(
      e2eSessionUserFromCookie(
        { NODE_ENV: "development", E2E_TEST_AUTH: "0" },
        VALID,
      ),
    ).toBeNull();
  });

  it("returns null in a production build, even with the flag AND a valid cookie", () => {
    expect(
      e2eSessionUserFromCookie(
        { NODE_ENV: "production", E2E_TEST_AUTH: "1" },
        VALID,
      ),
    ).toBeNull();
  });

  it("returns null when the cookie is absent", () => {
    expect(
      e2eSessionUserFromCookie(
        { NODE_ENV: "development", E2E_TEST_AUTH: "1" },
        undefined,
      ),
    ).toBeNull();
  });
});

describe("e2eSessionUserFromCookie — active path (flag set, non-production)", () => {
  const env = { NODE_ENV: "test", E2E_TEST_AUTH: "1" };

  it("resolves the principal and lowercases the email", () => {
    expect(e2eSessionUserFromCookie(env, VALID)).toEqual({
      userId: "user_e2e_alpha",
      email: "e2e@example.test",
    });
  });

  it("returns email: null when the cookie omits email", () => {
    expect(
      e2eSessionUserFromCookie(env, cookie({ userId: "user_x" })),
    ).toEqual({ userId: "user_x", email: null });
  });

  it("returns email: null when email is not a string", () => {
    expect(
      e2eSessionUserFromCookie(env, cookie({ userId: "user_x", email: 42 })),
    ).toEqual({ userId: "user_x", email: null });
  });

  it("returns null when userId is missing or empty", () => {
    expect(e2eSessionUserFromCookie(env, cookie({ email: "a@b.c" }))).toBeNull();
    expect(e2eSessionUserFromCookie(env, cookie({ userId: "" }))).toBeNull();
  });

  it("returns null for malformed base64 / non-JSON / non-object payloads", () => {
    expect(e2eSessionUserFromCookie(env, "%%%not-base64%%%")).toBeNull();
    expect(e2eSessionUserFromCookie(env, cookie("just-a-string"))).toBeNull();
    expect(e2eSessionUserFromCookie(env, cookie(123))).toBeNull();
    expect(e2eSessionUserFromCookie(env, cookie(null))).toBeNull();
  });
});
