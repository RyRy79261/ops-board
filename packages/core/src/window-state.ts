import type { WindowState } from "@opsboard/types";

// Pure window-state derivation — the single source of truth for whether a task's
// action window is open / closing / closed / not-yet. I/O-FREE: the caller passes
// `now` (epoch milliseconds) and the user's IANA timezone IN; this module NEVER
// reads the wall clock, NEVER constructs an argless Date, and NEVER touches
// process.env (so tests pass under any process timezone). The "closed" boundary
// is the LOCAL END-OF-DAY (23:59:59.999) of `too_late_by` in the supplied tz,
// derived deterministically via Intl.DateTimeFormat's timeZone option.
//
// Precedence (design-brief §9): closed > not-yet(blocked) > not-yet(not_before)
//   > closing > open.

export type { WindowState };

/** A task is "closing" once its cliff is this many days (or fewer) away. */
export const CLOSING_THRESHOLD_DAYS = 7;

const MS_PER_DAY = 86_400_000;

/** Minimal shape windowState needs — a structural subset of a task row. */
export interface WindowStateTask {
  /** "after this date the task is moot" — the cliff. ISO date `YYYY-MM-DD`. */
  too_late_by?: string | null;
  /** "can't start until this date". ISO date `YYYY-MM-DD`. */
  not_before?: string | null;
  /** Derived upstream (see deriveBlocked) — folds into not-yet. */
  blocked?: boolean;
}

/**
 * The window state PLUS the precedence reason that produced it, so callers
 * (dashboard pills, MCP/voice queries) can distinguish the two not-yet causes
 * without re-deriving. `windowState()` returns the bare state; this returns the
 * full detail.
 */
export interface WindowStateDetail {
  state: WindowState;
  /**
   * Why this state was chosen. `not-yet` always carries a concrete reason so the
   * UI can show the right icon (Lock vs AlertTriangle) and copy.
   */
  reason: "open" | "closing" | "closed" | "blocked" | "not_before";
  /** Whole days from `now` (local) to the cliff's end-of-day; null if no cliff. */
  daysUntilClose: number | null;
}

/**
 * Parse a `YYYY-MM-DD` calendar date into its numeric parts. Returns null for
 * any malformed / non-calendar input — a bad string must never silently pass
 * through as a real boundary ("domain-impossible is not a defence").
 */
function parseIsoDate(
  iso: string,
): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  // Reject impossible calendar days (e.g. 2026-02-30) by round-tripping in UTC.
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() !== month - 1 ||
    probe.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

/**
 * The offset (in minutes, east-of-UTC positive) that `timeZone` had at the UTC
 * instant `utcMs`. Derived purely from Intl.DateTimeFormat — no process.env.TZ,
 * no host-timezone dependence. We render the instant AS IF in `timeZone`, read
 * the wall-clock fields back, and compare to the same instant rendered in UTC.
 */
function tzOffsetMinutes(utcMs: number, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(new Date(utcMs));
  const field: Record<string, number> = {};
  for (const part of parts) {
    if (part.type !== "literal") field[part.type] = Number(part.value);
  }
  // Intl reports midnight as hour 24 under h23 in some engines — normalize.
  const hour = field.hour === 24 ? 0 : (field.hour ?? 0);
  const asUtc = Date.UTC(
    field.year ?? 1970,
    (field.month ?? 1) - 1,
    field.day ?? 1,
    hour,
    field.minute ?? 0,
    field.second ?? 0,
  );
  return Math.round((asUtc - utcMs) / 60_000);
}

/**
 * The epoch-ms instant of LOCAL END-OF-DAY (23:59:59.999) on the calendar date
 * `{year, month, day}` in `timeZone`. Computed deterministically from the tz
 * PARAMETER. Handles the zone offset (incl. DST) by resolving the offset AT the
 * candidate instant and correcting once — enough for end-of-day, which never
 * lands inside a DST spring-forward gap (those gaps are in the small hours).
 */
function localEndOfDayMs(
  date: { year: number; month: number; day: number },
  timeZone: string,
): number {
  // Naive UTC for 23:59:59.999 on the wall clock, then shift by the zone offset.
  const wallUtc = Date.UTC(
    date.year,
    date.month - 1,
    date.day,
    23,
    59,
    59,
    999,
  );
  // First approximation using the offset at the naive instant.
  const offset1 = tzOffsetMinutes(wallUtc, timeZone);
  const candidate = wallUtc - offset1 * 60_000;
  // Re-resolve the offset at the candidate and correct if the zone changed
  // (DST boundary between the naive instant and the true instant).
  const offset2 = tzOffsetMinutes(candidate, timeZone);
  if (offset2 === offset1) return candidate;
  return wallUtc - offset2 * 60_000;
}

/** The same for LOCAL START-OF-DAY (00:00:00.000) — used for not_before. */
function localStartOfDayMs(
  date: { year: number; month: number; day: number },
  timeZone: string,
): number {
  const wallUtc = Date.UTC(date.year, date.month - 1, date.day, 0, 0, 0, 0);
  const offset1 = tzOffsetMinutes(wallUtc, timeZone);
  const candidate = wallUtc - offset1 * 60_000;
  const offset2 = tzOffsetMinutes(candidate, timeZone);
  if (offset2 === offset1) return candidate;
  return wallUtc - offset2 * 60_000;
}

/**
 * Full window-state detail for one task at instant `now` (epoch ms) in `tz`.
 *
 * Precedence (design-brief §9): closed > not-yet(blocked) > not-yet(not_before)
 *   > closing > open.
 *
 * - **closed**: `now` is strictly past the LOCAL END-OF-DAY of `too_late_by`.
 * - **not-yet (blocked)**: not closed, and `task.blocked` is true.
 * - **not-yet (not_before)**: not closed/blocked, and `now` is before the LOCAL
 *   START-OF-DAY of `not_before`.
 * - **closing**: not closed/blocked/not-yet, and the cliff is ≤
 *   CLOSING_THRESHOLD_DAYS whole days away.
 * - **open**: everything else (incl. tasks with no cliff).
 *
 * A malformed `too_late_by` / `not_before` is treated as absent (never as a
 * boundary) so corrupt data can't silently flip a task closed.
 */
export function windowStateDetail(
  now: number,
  task: WindowStateTask,
  tz: string,
): WindowStateDetail {
  const cliff =
    task.too_late_by != null ? parseIsoDate(task.too_late_by) : null;
  const cliffEndMs = cliff ? localEndOfDayMs(cliff, tz) : null;

  const daysUntilClose =
    cliffEndMs != null ? Math.floor((cliffEndMs - now) / MS_PER_DAY) : null;

  // 1. closed — past the cliff's local end-of-day (highest precedence).
  if (cliffEndMs != null && now > cliffEndMs) {
    return { state: "closed", reason: "closed", daysUntilClose };
  }

  // 2. not-yet (blocked) — a non-done dependency exists.
  if (task.blocked === true) {
    return { state: "not-yet", reason: "blocked", daysUntilClose };
  }

  // 3. not-yet (not_before) — can't start until a future local start-of-day.
  if (task.not_before != null) {
    const start = parseIsoDate(task.not_before);
    if (start != null) {
      const startMs = localStartOfDayMs(start, tz);
      if (now < startMs) {
        return { state: "not-yet", reason: "not_before", daysUntilClose };
      }
    }
  }

  // 4. closing — cliff is within the threshold (and not already past).
  if (
    cliffEndMs != null &&
    daysUntilClose != null &&
    daysUntilClose <= CLOSING_THRESHOLD_DAYS
  ) {
    return { state: "closing", reason: "closing", daysUntilClose };
  }

  // 5. open — actionable, cliff far or absent.
  return { state: "open", reason: "open", daysUntilClose };
}

/**
 * The bare window state for one task — the common case. Delegates to
 * `windowStateDetail`; use that when you also need the reason / days-until.
 */
export function windowState(
  now: number,
  task: WindowStateTask,
  tz: string,
): WindowState {
  return windowStateDetail(now, task, tz).state;
}
