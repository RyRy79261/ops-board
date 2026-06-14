import { describe, expect, it } from "vitest";
import {
  isVendorKeyRejection,
  keyRejected,
  vendorErrorResponse,
} from "@/app/api/_shared/vendor-errors";

// The whole point of this helper is DIAGNOSABILITY: a misconfigured key, a
// rate-limit, a timeout, and a real fault must land on DISTINCT status codes
// instead of one generic 200. Lock that mapping.

/** A fake SDK error carrying an HTTP status (+ optional name/headers). */
function vendorErr(
  status?: number,
  extra: { name?: string; headers?: Record<string, string> } = {},
) {
  const e = new Error("vendor blew up") as Error & {
    status?: number;
    headers?: Record<string, string>;
  };
  if (status !== undefined) e.status = status;
  if (extra.name) e.name = extra.name;
  if (extra.headers) e.headers = extra.headers;
  return e;
}

describe("isVendorKeyRejection", () => {
  it("is true only for auth statuses (401/403)", () => {
    expect(isVendorKeyRejection(vendorErr(401))).toBe(true);
    expect(isVendorKeyRejection(vendorErr(403))).toBe(true);
  });
  it("is false for rate-limit / server / unknown", () => {
    expect(isVendorKeyRejection(vendorErr(429))).toBe(false);
    expect(isVendorKeyRejection(vendorErr(500))).toBe(false);
    expect(isVendorKeyRejection(vendorErr(undefined))).toBe(false);
    expect(isVendorKeyRejection(new Error("plain"))).toBe(false);
  });
});

describe("keyRejected", () => {
  it("returns a 400 naming the provider, never the key", async () => {
    const res = keyRejected("anthropic");
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.provider).toBe("anthropic");
    expect(body.error).toMatch(/anthropic key was rejected/i);
  });
});

describe("vendorErrorResponse maps each failure to a distinct status", () => {
  const opts = { provider: "anthropic" as const, fallbackMessage: "boom" };

  it("401/403 → 400 key-rejected", async () => {
    expect(vendorErrorResponse(vendorErr(401), opts).status).toBe(400);
    expect(vendorErrorResponse(vendorErr(403), opts).status).toBe(400);
  });

  it("429 → 429, passing through Retry-After when present", async () => {
    const res = vendorErrorResponse(
      vendorErr(429, { headers: { "retry-after": "12" } }),
      opts,
    );
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("12");
  });

  it("timeout → 504 (by name or status 408)", () => {
    expect(
      vendorErrorResponse(
        vendorErr(undefined, { name: "APIConnectionTimeoutError" }),
        opts,
      ).status,
    ).toBe(504);
    expect(vendorErrorResponse(vendorErr(408), opts).status).toBe(504);
  });

  it("anything else → 502 with the fallback message", async () => {
    const res = vendorErrorResponse(vendorErr(500), opts);
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toBe("boom");
  });
});
