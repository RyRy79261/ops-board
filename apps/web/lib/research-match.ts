// @opsboard/web research target-task matcher — the PURE name-relevance ranking
// behind the /research disambiguation. The parse model emits a fuzzy `taskHint`
// ("permit", "my permit task"); this ranks the locked mission's tasks against it
// so the surface can show a top match + ordered candidates with a display score.
//
// Carries NO "server-only" / DB / model imports so it unit-tests in plain vitest.
// The score is a DETERMINISTIC name-relevance heuristic for ORDERING + a plausible
// "% match" badge — it is not a semantic confidence; the user always confirms the
// pick. The route maps the score to matchPct (0–100).

/** The minimal task shape the matcher ranks (id + name + optional category slug). */
export interface MatchableTask {
  id: string;
  name: string;
  /** Category slug, or null for an uncategorised task. */
  category: string | null;
}

/** A task scored against the hint, score in (0,1]. */
export interface RankedTask extends MatchableTask {
  score: number;
}

/** Lowercase + collapse whitespace + trim, for forgiving matching. */
function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function tokenize(value: string): string[] {
  return normalize(value)
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 0);
}

/**
 * Name-relevance score in [0,1] between a normalized hint and a normalized name:
 *  - exact equality → 1
 *  - one fully contains the other → 0.55 + 0.4 × (shorter / longer) length ratio
 *    (a hint covering most of the name scores higher than one buried in a long name)
 *  - otherwise → 0.5 × (shared tokens / hint tokens) (partial keyword overlap)
 *  - no overlap → 0
 * Monotonic + deterministic; good enough to ORDER candidates and show a % badge.
 */
function matchScore(needle: string, hay: string): number {
  if (!needle || !hay) return 0;
  if (needle === hay) return 1;

  if (hay.includes(needle) || needle.includes(hay)) {
    const shorter = Math.min(needle.length, hay.length);
    const longer = Math.max(needle.length, hay.length);
    return 0.55 + 0.4 * (shorter / longer);
  }

  const needleTokens = tokenize(needle);
  if (needleTokens.length === 0) return 0;
  const hayTokens = new Set(tokenize(hay));
  const shared = needleTokens.filter((t) => hayTokens.has(t)).length;
  if (shared === 0) return 0;
  return 0.5 * (shared / needleTokens.length);
}

/**
 * Rank a mission's tasks against a fuzzy hint, best first. Tasks with no overlap
 * are dropped. Ties break by name (stable, deterministic — no clock/random).
 */
export function rankTaskMatches(
  hint: string,
  tasks: readonly MatchableTask[],
): RankedTask[] {
  const needle = normalize(hint);
  if (needle.length === 0) return [];
  return tasks
    .map((t) => ({ ...t, score: matchScore(needle, normalize(t.name)) }))
    .filter((t) => t.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}

/** Map a 0–1 score to a 0–100 integer percentage for the UI badge. */
export function toMatchPct(score: number): number {
  return Math.round(Math.max(0, Math.min(1, score)) * 100);
}
