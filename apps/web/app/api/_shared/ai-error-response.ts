import { NextResponse } from "next/server";
import { NoAiKeyError } from "@/lib/ai-key-resolver";

/**
 * Translate AI key-resolution errors into the ONE response shape the client UI
 * acts on, in ONE place (mirrors intake-tracker's
 * api/ai/_shared/ai-error-response.ts). Anything not recognised returns `null`
 * so the caller can surface its own generic error.
 *
 * The 402 ("Payment Required") is OpsBoard's fail-closed signal for "you have
 * not configured an AI key for this provider" — the BYO model means a missing
 * key is a user-action problem, not a server fault.
 *
 * Codes the client checks:
 *   NO_AI_KEY — the session user has not configured a key for this provider.
 */
export function aiKeyErrorResponse(error: unknown): NextResponse | null {
  if (error instanceof NoAiKeyError) {
    return NextResponse.json(
      {
        error: `No ${error.provider} API key configured. Add one in Settings.`,
        code: "NO_AI_KEY",
        provider: error.provider,
      },
      { status: 402 },
    );
  }
  return null;
}
