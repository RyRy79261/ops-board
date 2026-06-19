import { z } from "zod";

// Shared Zod field validators for the board's write-side Server Actions
// (apps/web/app/actions.ts). Kept in a PURE module (zod only, no server-only
// imports) so the date/patch semantics below can be unit-tested directly.

/** A real "YYYY-MM-DD" calendar date (round-trips through UTC, so impossible
 *  dates like "2026-02-30" are rejected). */
export function isRealCalendarDate(v: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (!m) return false;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === mo - 1 &&
    dt.getUTCDate() === d
  );
}

export const NameField = z
  .string()
  .trim()
  .min(1, "A name is required.")
  .max(200);

/** CREATE semantics: absent / empty / null ALL mean "no date" → null. Used for
 *  create inputs, where an omitted date legitimately means the new row has none. */
export const DateField = z
  .union([z.string(), z.null()])
  .optional()
  .transform((v) => (v == null || v === "" ? null : v))
  .refine((v) => v == null || isRealCalendarDate(v), {
    message: "Enter a real date (YYYY-MM-DD).",
  });

/** PATCH semantics: an ABSENT key means "leave unchanged" (→ undefined, which the
 *  mutation drops from its SET), while an explicit "" or null means "clear it" (→
 *  null). `.optional()` is the OUTERMOST wrapper so the transform NEVER runs on an
 *  absent key — that ordering bug (transform outside optional, coercing
 *  undefined→null) is what made a name-only mission edit silently null out the
 *  target date. Calendar validity is still checked when a value IS present. */
export const PatchDateField = z
  .union([z.string(), z.null()])
  .transform((v) => (v === "" ? null : v))
  .refine((v) => v == null || isRealCalendarDate(v), {
    message: "Enter a real date (YYYY-MM-DD).",
  })
  .optional();

export const CategorySlugField = z.string().trim().min(1).optional();
