// @opsboard/web voice hint RESOLVER — the PURE name→id matching at the heart of
// the intent executor. Extracted from voice-execute.ts so it carries NO
// "server-only" / DB imports and can be unit-tested in plain vitest (node env,
// no database). The executor imports `resolveHint` from here.

/** The minimal shape the resolver matches a hint against. */
export interface Resolvable {
  id: string;
  name: string;
  /** Optional context for the disambiguation short-code (category/mission). */
  code?: string;
}

export type ResolveResult =
  | { status: "one"; match: Resolvable }
  | { status: "none" }
  | { status: "many"; matches: Resolvable[] };

/**
 * Resolve a free-text hint to exactly one candidate by name.
 *
 * Strategy (deterministic, case/whitespace-insensitive):
 *  1. EXACT (normalized) name match — if exactly one, that wins outright even
 *     when other names contain it as a substring (an exact hit beats partials).
 *     If MULTIPLE names match exactly (true duplicates), that is `many`.
 *  2. Otherwise CONTAINS (normalized substring, either direction) — the hint is
 *     contained in a name, or a name is contained in the hint.
 *  3. 0 matches → none · exactly 1 → one · >1 → many (caller disambiguates).
 *
 * Pure: takes the candidate list in, returns a verdict. No I/O.
 */
export function resolveHint(
  hint: string,
  candidates: readonly Resolvable[],
): ResolveResult {
  const needle = normalize(hint);
  if (needle.length === 0) return { status: "none" };

  const exact = candidates.filter((c) => normalize(c.name) === needle);
  if (exact.length === 1) return { status: "one", match: exact[0]! };
  if (exact.length > 1) return { status: "many", matches: exact };

  const contains = candidates.filter((c) => {
    const hay = normalize(c.name);
    return hay.includes(needle) || needle.includes(hay);
  });
  if (contains.length === 1) return { status: "one", match: contains[0]! };
  if (contains.length === 0) return { status: "none" };
  return { status: "many", matches: contains };
}

/** Lowercase + collapse internal whitespace + trim, for forgiving name matching. */
function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}
