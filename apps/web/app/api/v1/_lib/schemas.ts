import { z } from "zod";
import { notFoundV1 } from "./v1";

// Shared /api/v1 boundary validation — the same conventions as the MCP tool
// surface (lib/mcp/tools): strict UUIDs, real calendar dates, the three stored
// task statuses, free-form category slugs (the mutation layer gates unknowns).

export const uuid = z.uuid("Expected a UUID.");

/** A real "YYYY-MM-DD" calendar date (rejects 2026-13-45 etc.). */
export const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected a YYYY-MM-DD date.")
  .refine((v) => {
    const [y, m, d] = v.split("-").map(Number) as [number, number, number];
    const dt = new Date(Date.UTC(y, m - 1, d));
    return (
      dt.getUTCFullYear() === y &&
      dt.getUTCMonth() === m - 1 &&
      dt.getUTCDate() === d
    );
  }, "Not a real calendar date.");

export const taskStatus = z.enum(["not-started", "in-progress", "done"]);

export const categorySlug = z.string().trim().min(1);

/** Same bound as the MCP tool + voice route. */
export const researchQuery = z.string().trim().min(1).max(280);
export const researchFocus = z.string().trim().min(1).max(500);

/**
 * Validate a path/query id. A malformed id reads as NOT FOUND (not 400) so
 * probing with junk ids is indistinguishable from probing with foreign ones.
 */
export function requireUuid(value: string | undefined | null): string {
  const parsed = uuid.safeParse(value);
  if (!parsed.success) notFoundV1();
  return parsed.data;
}
