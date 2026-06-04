import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { ZodError } from "zod";

// Shared request-validation helpers for API route handlers (ported from
// intake-tracker src/app/api/_shared/validation.ts). Both keep schema shape
// from leaking to the client: the full error is logged server-side, the client
// only sees a generic "Invalid request".

/**
 * Build a 400 response for a Zod validation failure. Logs the flattened error
 * server-side for debugging; returns only a generic message to the client so a
 * probing attacker learns nothing about the schema shape.
 */
export function zodErrorResponse(
  context: string,
  error: ZodError<unknown>,
): NextResponse {
  console.error(`[VALIDATION] ${context}:`, JSON.stringify(error.flatten()));
  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}

/**
 * Parse the request body as JSON, returning a tagged union so the caller can
 * short-circuit with a 400 instead of letting a SyntaxError bubble to the outer
 * 500 handler.
 */
export async function parseJsonBody(
  request: NextRequest,
): Promise<
  { ok: true; body: unknown } | { ok: false; response: NextResponse }
> {
  try {
    return { ok: true, body: await request.json() };
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Invalid request" },
        { status: 400 },
      ),
    };
  }
}
