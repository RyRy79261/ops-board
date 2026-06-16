import { describe, expect, it } from "vitest";
import { getClientIp } from "@/lib/rate-limit";

// getClientIp feeds the IP rate-limit bucket key, so it must NOT trust the
// client-controllable part of x-forwarded-for. Behind Vercel (one trusted
// proxy): the client can PREPEND values, Vercel APPENDS the real connection IP,
// and sets x-real-ip from the verified connection. So x-real-ip is preferred and
// the RIGHTMOST x-forwarded-for entry is the trustworthy fallback.

function h(map: Record<string, string>): Headers {
  return new Headers(map);
}

describe("getClientIp", () => {
  it("prefers x-real-ip (Vercel-verified, unforgeable)", () => {
    expect(
      getClientIp(
        h({ "x-real-ip": "203.0.113.7", "x-forwarded-for": "1.2.3.4" }),
      ),
    ).toBe("203.0.113.7");
  });

  it("uses the RIGHTMOST x-forwarded-for entry, not the spoofable leftmost", () => {
    // Client prepended a forged value; the trusted edge appended the real IP.
    expect(getClientIp(h({ "x-forwarded-for": "9.9.9.9, 203.0.113.7" }))).toBe(
      "203.0.113.7",
    );
  });

  it("can't be rotated into a fresh bucket via the leftmost value", () => {
    // Two requests with different forged leftmost values but the same real
    // appended IP must resolve to the SAME key (so the bucket isn't bypassable).
    const a = getClientIp(h({ "x-forwarded-for": "attacker-1, 203.0.113.7" }));
    const b = getClientIp(h({ "x-forwarded-for": "attacker-2, 203.0.113.7" }));
    expect(a).toBe(b);
    expect(a).toBe("203.0.113.7");
  });

  it("handles a single-entry x-forwarded-for and trims whitespace", () => {
    expect(getClientIp(h({ "x-forwarded-for": "  203.0.113.7  " }))).toBe(
      "203.0.113.7",
    );
  });

  it("falls back to 'unknown' when no IP headers are present", () => {
    expect(getClientIp(h({}))).toBe("unknown");
  });
});
