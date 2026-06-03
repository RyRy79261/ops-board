"use client";

import * as React from "react";
import { windowStateDetail, type WindowStateDetail } from "@opsboard/core";

import { cn } from "../lib/utils";
import { cardVariants } from "./card";
import {
  StatusCycleButton,
  Touch44,
  type StatusCycleStatus,
} from "./status-cycle-button";
import { CategoryTag } from "./category-tag";
import { WindowStatePill, type WindowState } from "./window-state-pill";

/**
 * TaskCard — the core repeated row (organism, canonical `QfQXv`). A read-only
 * task row whose ONLY interaction is tapping the StatusCycleButton (§10,
 * LOCKED #4). Composes: the Card shell recipe + StatusCycleButton (in a 44px
 * Touch44 hit area) + CategoryTag + a window-state pill + an optional
 * dependency caption.
 *
 * LIVE: the card computes its OWN window-state via `windowStateDetail(now,
 * task, tz)` on every render. The parent feeds a ticking `now` (useNowTick 60s)
 * so the state stays live without storing it. Window-state is NEVER stored.
 *
 * `useOptimistic` gives the StatusCycleButton a snappy local status while the
 * parent's `onCycle` round-trips the update_task_status mutation; if that
 * settles to a different status the optimistic value reconciles on re-render.
 *
 * Card-level treatment (border / fill / opacity / strikethrough) is driven by
 * the computed window-state, not the stored status — except DONE, which adds
 * the line-through name per §9/§10 (every board omits it; the contract restores
 * it). The status button is ALWAYS present + ALWAYS enabled on blocked/not-yet
 * rows (the contract forbids the board's button-swap).
 */

/** Stored task status (the StatusCycleButton's tri-state). */
export type TaskStatus = StatusCycleStatus;

/** §4 category slugs CategoryTag understands; any other slug renders no tag. */
type CategorySlug = "medical" | "bureaucratic" | "travel" | "gear" | "tech";
const CATEGORY_SLUGS: readonly CategorySlug[] = [
  "medical",
  "bureaucratic",
  "travel",
  "gear",
  "tech",
];
function isCategorySlug(slug: string | null): slug is CategorySlug {
  return slug != null && (CATEGORY_SLUGS as readonly string[]).includes(slug);
}

/**
 * The view-model the card renders (structural copy of the app's shared TaskVM —
 * see apps/web/lib/dashboard-types.ts). Kept local so @opsboard/ui carries no
 * app dependency.
 */
export interface TaskVM {
  id: string;
  name: string;
  status: TaskStatus;
  categorySlug: string | null;
  /** Cliff — "too late after this date" (ISO `YYYY-MM-DD`); drives closing/closed. */
  too_late_by: string | null;
  /** "can't start until this date" (ISO `YYYY-MM-DD`); drives not-yet. */
  not_before: string | null;
  /** Derived from the dependency graph (deriveBlocked) — folds into not-yet. */
  blocked: boolean;
  /** Upstream task names for the '⚠ blocked by: …' caption. */
  blockedByNames: string[];
  notes?: string | null;
}

export interface TaskCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onClick"> {
  /** The task view-model. */
  task: TaskVM;
  /** IANA timezone for the window-state derivation (e.g. browser tz). */
  tz: string;
  /** Current epoch ms (fed by useNowTick so the card stays live). */
  now: number;
  /** Marks this row as on the critical path (primary accent treatment). */
  criticalPath?: boolean;
  /** Tap handler → POST update_task_status with the next wrapping status. */
  onCycle: (next: TaskStatus) => void;
}

/** Next status in the wrapping cycle (mirrors StatusCycleButton). */
const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
  "not-started": "in-progress",
  "in-progress": "done",
  done: "not-started",
};

/** Maps the core detail → the UI pill state (adds the `blocked` overload). */
function pillState(detail: WindowStateDetail): WindowState {
  if (detail.reason === "blocked") return "blocked";
  return detail.state;
}

/** Maps the computed window-state → the Card surface-recipe variant. */
function cardVariant(
  detail: WindowStateDetail,
): "default" | "closing" | "blocked" | "not-yet" | "closed" {
  switch (detail.state) {
    case "closed":
      return "closed";
    case "closing":
      return "closing";
    case "not-yet":
      // blocked (dependency) vs not_before share the dim recipe; keep the
      // semantic name so the accent reads correctly.
      return detail.reason === "blocked" ? "blocked" : "not-yet";
    default:
      return "default";
  }
}

/** Short human date `D MMM` from an ISO `YYYY-MM-DD` (UTC parts, locale-stable). */
function formatShortDate(iso: string | null): string | undefined {
  if (!iso) return undefined;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return undefined;
  const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}

const TaskCard = React.forwardRef<HTMLDivElement, TaskCardProps>(
  ({ task, tz, now, criticalPath = false, onCycle, className, ...props }, ref) => {
    // Optimistic status — snappy local flip while onCycle round-trips. The
    // setter must run inside a transition/action; wrapping in startTransition
    // keeps it valid whether or not onCycle is itself a server action.
    const [optimisticStatus, setOptimisticStatus] = React.useOptimistic(
      task.status,
    );

    const handleCycle = React.useCallback(() => {
      const next = NEXT_STATUS[optimisticStatus];
      React.startTransition(() => {
        setOptimisticStatus(next);
        onCycle(next);
      });
    }, [optimisticStatus, onCycle, setOptimisticStatus]);

    // LIVE window-state derivation — recomputed every render off the ticking now.
    const detail = windowStateDetail(
      now,
      {
        too_late_by: task.too_late_by,
        not_before: task.not_before,
        blocked: task.blocked,
      },
      tz,
    );
    const wState = pillState(detail);
    const variant = cardVariant(detail);

    const isDone = optimisticStatus === "done";
    const isClosed = detail.state === "closed";
    // Done/closed names get the line-through + muted treatment (§9/§10).
    const struck = isDone || isClosed;

    // Pill inputs by state.
    const daysUntil =
      wState === "closing" && detail.daysUntilClose != null
        ? detail.daysUntilClose
        : undefined;
    const cliffDate = formatShortDate(task.too_late_by);
    const startDate = formatShortDate(task.not_before);
    // OPEN renders a bare target date (plain-date overload) when a cliff exists;
    // closed appends the cliff date; not-yet appends the start date.
    const pillDate =
      wState === "open"
        ? cliffDate
        : wState === "closed"
          ? cliffDate
          : wState === "not-yet"
            ? startDate
            : undefined;

    const slug = isCategorySlug(task.categorySlug) ? task.categorySlug : null;
    const showBlockedHint =
      wState === "blocked" && task.blockedByNames.length > 0;

    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({ variant }),
          // critical-path emphasis — primary left accent (paired with the
          // status pill + blocked-by hint, never colour-alone per LOCKED #6).
          criticalPath && "border-l-2 border-l-primary",
          "flex w-full items-start gap-3 p-3.5",
          className,
        )}
        {...props}
      >
        {/* 44px hit area around the 18px status square (a11y; the only control). */}
        <Touch44 className="-m-3.5 self-start">
          <StatusCycleButton status={optimisticStatus} onCycle={handleCycle} />
        </Touch44>

        {/* Body — name + meta + optional blocked-by caption. */}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {/* Task name — DM Sans 15/500; line-through + muted when done/closed. */}
          <span
            className={cn(
              "font-sans text-subtitle-dense font-medium",
              struck
                ? "text-muted-foreground line-through"
                : "text-foreground",
            )}
          >
            {task.name}
          </span>

          {/* Meta row — CategoryTag + window pill. */}
          <div className="flex flex-wrap items-center gap-2">
            {slug ? (
              <CategoryTag
                category={slug}
                variant="inline"
                dimmed={wState === "blocked" || wState === "not-yet"}
              />
            ) : null}
            <WindowStatePill
              state={wState}
              variant="bare"
              daysUntil={daysUntil}
              date={pillDate}
            />
          </div>

          {/* Blocked-by caption — only on blocked rows. */}
          {showBlockedHint ? (
            <span className="font-mono text-mono-caption text-muted-foreground-subtle">
              {"⚠"} blocked by: {task.blockedByNames.join(", ")}
            </span>
          ) : null}
        </div>
      </div>
    );
  },
);
TaskCard.displayName = "TaskCard";

export { TaskCard };
