import { NextResponse } from "next/server";
import type { AiProvider } from "@/lib/ai-key-resolver";

// Shared translation of Groq/Anthropic SDK errors into distinct HTTP responses,
// so a misconfigured key, a rate-limit, a timeout, and a real server fault are
// each DIAGNOSABLE — instead of all collapsing into one generic "couldn't
// understand that". Used by the voice-command route and the setup dictation-test
// route (which had its own copy). The raw key is NEVER echoed.

/** The HTTP status the Groq/Anthropic SDKs hang on a thrown error, if any. */
function vendorStatus(err: unknown): number | undefined {
  const status = (err as { status?: unknown })?.status;
  return typeof status === "number" ? status : undefined;
}

/**
 * A vendor 4xx that means "the KEY itself is wrong" (auth). ONLY 401/403 — a 429
 * (rate limit) or a 400 (our malformed request, not the user's key) must NOT be
 * mislabelled as a bad key, or we'd bounce the user to re-enter a good key.
 */
export function isVendorKeyRejection(err: unknown): boolean {
  const status = vendorStatus(err);
  return status === 401 || status === 403;
}

/** The SDKs name connection timeouts `APIConnectionTimeoutError` (status 408 on some paths). */
function isVendorTimeout(err: unknown): boolean {
  if (vendorStatus(err) === 408) return true;
  const name = (err as { name?: unknown })?.name;
  return typeof name === "string" && /timeout/i.test(name);
}

/** Best-effort Retry-After (seconds) from a vendor 429, if the SDK surfaced it. */
function retryAfterSeconds(err: unknown): string | null {
  const headers = (err as { headers?: unknown })?.headers;
  if (headers && typeof (headers as { get?: unknown }).get === "function") {
    const v = (headers as Headers).get("retry-after");
    if (v) return v;
  }
  if (headers && typeof headers === "object") {
    const v = (headers as Record<string, unknown>)["retry-after"];
    if (typeof v === "string") return v;
  }
  return null;
}

/** A bad/rejected provider key → a clear 400 telling the user to re-check THAT key. */
export function keyRejected(provider: AiProvider): NextResponse {
  return NextResponse.json(
    { error: `That ${provider} key was rejected — re-check it.`, provider },
    { status: 400 },
  );
}

/**
 * Map any thrown vendor error to its DISTINCT response:
 *   401/403 → 400 key-rejected · 429 → 429 + Retry-After · timeout → 504 · else → 502.
 * `fallbackMessage` is the user-facing text for the generic 502.
 */
export function vendorErrorResponse(
  err: unknown,
  opts: { provider: AiProvider; fallbackMessage: string },
): NextResponse {
  if (isVendorKeyRejection(err)) return keyRejected(opts.provider);

  if (vendorStatus(err) === 429) {
    const retryAfter = retryAfterSeconds(err);
    return NextResponse.json(
      { error: `The ${opts.provider} API is rate-limited — try again shortly.` },
      {
        status: 429,
        ...(retryAfter ? { headers: { "Retry-After": retryAfter } } : {}),
      },
    );
  }

  if (isVendorTimeout(err)) {
    return NextResponse.json(
      { error: `The ${opts.provider} request timed out — try again.` },
      { status: 504 },
    );
  }

  return NextResponse.json({ error: opts.fallbackMessage }, { status: 502 });
}
