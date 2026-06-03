import { TaskCard } from "@opsboard/ui/components/task-card";
import { cn } from "@opsboard/ui/lib/utils";
import type { ViewProps, TaskVM } from "@/lib/dashboard-types";

// The TIMELINE board view (board a3Dgz). Buckets the active mission's tasks by
// the ISO week of their `too_late_by` CLIFF (NOT a due date), ordered
// past-closed → this-week → future (ascending) → trailing NO CLIFF for tasks
// with no cliff. Each bucket is a TimelineWeekHeader (week range + a window-state
// DaysPill + a hairline rule) over a vertical stack of TaskCards.
// Per docs/tech-spec/03-surfaces/timeline.md §2–§4 + §8.
//
// Week math (bucket membership, the closed/this-week/future label) is computed
// from `too_late_by` against the user's `tz`/`now` from ViewProps — never the
// host clock. Empty weeks are OMITTED (not rendered empty): only weeks that
// contain ≥1 cliffed task render, plus the trailing NO CLIFF bucket if any task
// lacks a cliff. READ-ONLY; there is no "overdue" — past weeks read WINDOW CLOSED.
//
// TaskCard computes its OWN per-card window-state (closing / closed / not-yet /
// blocked) from `now` + `tz`, so this view only does the coarse week bucketing;
// it never recomputes per-card window-state or blocked/criticalPath.
//
// Container: vertical, gap 20 (spec §2). Bucket: vertical, gap 8 (header→cards).
// Cards stack: vertical, gap 6. Outer padding matches the Category view gutter.

const MS_PER_DAY = 86_400_000;
const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
] as const;

interface CalendarDate {
  year: number;
  month: number; // 1–12
  day: number; // 1–31
}

/** Parse an ISO `YYYY-MM-DD` cliff into numeric parts; null if malformed. */
function parseIsoDate(iso: string): CalendarDate | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
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

/** The user's LOCAL calendar date at instant `now` (epoch ms) in `tz`. */
function localCalendarDate(now: number, tz: string): CalendarDate {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(now));
  const field: Record<string, number> = {};
  for (const part of parts) {
    if (part.type !== "literal") field[part.type] = Number(part.value);
  }
  return {
    year: field.year ?? 1970,
    month: field.month ?? 1,
    day: field.day ?? 1,
  };
}

/**
 * A calendar date as a UTC-anchored "day number" (days since epoch). We treat
 * each calendar date as a tz-free integer for week math — the bucket grouping
 * compares CALENDAR weeks, so anchoring both `now`'s local date and each cliff
 * to the same UTC-noon midpoint keeps the arithmetic offset/DST-proof.
 */
function dayNumber(date: CalendarDate): number {
  // UTC noon avoids any sub-day rounding at day boundaries.
  return Math.floor(Date.UTC(date.year, date.month - 1, date.day, 12) / MS_PER_DAY);
}

/**
 * The ISO-week start (MONDAY) day-number for a given day-number. ISO weeks run
 * Mon→Sun. `getUTCDay()` is 0(Sun)..6(Sat); shift so Monday=0.
 */
function isoWeekStartDayNumber(dn: number): number {
  const date = new Date(dn * MS_PER_DAY);
  const dow = (date.getUTCDay() + 6) % 7; // Mon=0 … Sun=6
  return dn - dow;
}

/** Format a day-number back to `{MON} {DD}` (uppercase month, zero-padded day). */
function formatDayLabel(dn: number): string {
  const date = new Date(dn * MS_PER_DAY);
  const mon = MONTHS[date.getUTCMonth()];
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${mon} ${day}`;
}

type PillState = "closed" | "this-week" | "future" | "unscheduled";

interface TimelineBucket {
  /** Monday day-number of the bucket's ISO week; null for the NO CLIFF bucket. */
  weekStart: number | null;
  /** Literal range label, e.g. "MAY 25 – MAY 31", or "NO CLIFF". */
  rangeLabel: string;
  /** DaysPill literal + visual state. */
  pillLabel: string;
  pillState: PillState;
  tasks: TaskVM[];
}

/**
 * Inline TimelineWeekHeader — Range text + DaysPill + a flex hairline Rule
 * (spec §2 BucketHeader: row, gap 12, items-center). The DaysPill is a constant
 * shape ($muted fill, radius-full pill, 1px inner stroke, mono 10px ls1) whose
 * stroke + label colour encode state (spec §4): only THIS WEEK recolours to
 * primary; every other state shares the muted-subtle appearance and differs only
 * by literal text. NO `count` badge here (counts live in sidebar/category views).
 */
function TimelineWeekHeader({
  rangeLabel,
  pillLabel,
  pillState,
}: {
  rangeLabel: string;
  pillLabel: string;
  pillState: PillState;
}) {
  const isThisWeek = pillState === "this-week";
  return (
    <div className="flex items-center gap-3">
      {/* Range — mono 11px ls1.5, muted-foreground. */}
      <span className="font-mono text-micro uppercase tracking-[1.5px] text-muted-foreground">
        {rangeLabel}
      </span>
      {/* DaysPill — stroke + label encode state; only THIS WEEK is primary. */}
      <span
        className={cn(
          "inline-flex shrink-0 items-center rounded-full border bg-muted px-2 py-0.5",
          "font-mono text-micro-xs uppercase tracking-[1px]",
          isThisWeek
            ? "border-primary text-primary"
            : "border-border text-muted-foreground-subtle",
        )}
      >
        {pillLabel}
      </span>
      {/* Rule — 1px border-coloured line filling the remaining width. */}
      <span aria-hidden="true" className="h-px flex-1 bg-border" />
    </div>
  );
}

export function TimelineView({
  tasks,
  criticalPathIds,
  tz,
  now,
  onCycle,
}: ViewProps) {
  const criticalSet = new Set(criticalPathIds);

  // Today's local week start (Monday day-number) — the anchor for closed /
  // this-week / future labelling.
  const todayDn = dayNumber(localCalendarDate(now, tz));
  const currentWeekStart = isoWeekStartDayNumber(todayDn);

  // Bucket tasks by the ISO week of their cliff; collect cliff-less tasks aside.
  const byWeek = new Map<number, TaskVM[]>();
  const noCliff: TaskVM[] = [];
  for (const task of tasks) {
    const cliff = task.too_late_by != null ? parseIsoDate(task.too_late_by) : null;
    if (!cliff) {
      noCliff.push(task);
      continue;
    }
    const weekStart = isoWeekStartDayNumber(dayNumber(cliff));
    const list = byWeek.get(weekStart);
    if (list) list.push(task);
    else byWeek.set(weekStart, [task]);
  }

  // Build week buckets in ascending week-start order; empty weeks never exist in
  // the map, so they're naturally omitted (the JUN15 → JUL06 jump in the spec).
  const buckets: TimelineBucket[] = [...byWeek.keys()]
    .sort((a, b) => a - b)
    .map((weekStart): TimelineBucket => {
      const weekEnd = weekStart + 6; // Sunday day-number
      let pillState: PillState;
      let pillLabel: string;
      if (weekEnd < currentWeekStart) {
        // Whole week is before this week → the window has closed.
        pillState = "closed";
        pillLabel = "WINDOW CLOSED";
      } else if (weekStart === currentWeekStart) {
        pillState = "this-week";
        pillLabel = "THIS WEEK";
      } else {
        // Future week — whole days from today to the bucket's week start.
        pillState = "future";
        const days = Math.max(0, weekStart - todayDn);
        pillLabel = `IN ${days}D`;
      }
      return {
        weekStart,
        rangeLabel: `${formatDayLabel(weekStart)} – ${formatDayLabel(weekEnd)}`,
        pillLabel,
        pillState,
        tasks: byWeek.get(weekStart) ?? [],
      };
    });

  // Trailing NO CLIFF bucket — only when there are uncliffed tasks (spec §3).
  if (noCliff.length > 0) {
    buckets.push({
      weekStart: null,
      rangeLabel: "NO CLIFF",
      pillLabel: "UNSCHEDULED",
      pillState: "unscheduled",
      tasks: noCliff,
    });
  }

  return (
    <div className="flex flex-col gap-5 px-8 py-5">
      {buckets.map((bucket) => (
        <section
          key={bucket.weekStart ?? "no-cliff"}
          className="flex flex-col gap-2"
        >
          <TimelineWeekHeader
            rangeLabel={bucket.rangeLabel}
            pillLabel={bucket.pillLabel}
            pillState={bucket.pillState}
          />
          <div className="flex flex-col gap-1.5">
            {bucket.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                tz={tz}
                now={now}
                criticalPath={criticalSet.has(task.id)}
                onCycle={(next) => onCycle(task.id, next)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
