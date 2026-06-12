import * as React from "react";

import { cn } from "../lib/utils";
import { StatTile } from "./stat-tile";
import { ProgressBar, type ProgressSegment } from "./progress-bar";

/**
 * MissionDetailHeader — the at-a-glance mission status block at the top of the
 * main column (organism, canonical `uJ5hm`). Title (DM Sans 26/700), a
 * real-world target line (mono 13, `Target: <date>`), a 4-StatTile row
 * (DONE success / BLOCKED destructive / CLOSING warning / TOTAL foreground),
 * and a 3-segment window-state ProgressBar (done → closing → blocked).
 *
 * Read-only status display (LOCKED #4) — no interactive affordances. The
 * Category board renders it as a bottom-bordered, padded block over $background.
 * Composes the S1 StatTile + ProgressBar atoms. Presentational, server-safe.
 *
 * BLOCKED stat uses $destructive here (the documented header-stat exception to
 * §9's muted-blocked treatment, which applies to task cards, not header stats).
 */
export interface MissionStats {
  done: number;
  blocked: number;
  closing: number;
  total: number;
}

export interface MissionProgress {
  done: number;
  closing: number;
  blocked: number;
  total: number;
}

export interface MissionDetailHeaderProps
  extends React.HTMLAttributes<HTMLElement> {
  /** Mission name (DM Sans title). */
  title: string;
  /**
   * Real-world target/cliff date, already formatted to the human `DD MON YYYY`
   * form (e.g. `27 APR 2026`), or null when none set. Rendered uppercase after
   * the `TARGET:` label.
   */
  targetDate: string | null;
  /**
   * Live days-out countdown to the target date (whole days from `now`). When
   * supplied alongside a `targetDate`, the line reads
   * `TARGET: 27 APR 2026 · 328 DAYS OUT`. Omit/null to render the date alone.
   */
  daysOut?: number | null;
  /** The 4 stat-tile counts. */
  stats: MissionStats;
  /** 3-segment ProgressBar inputs (success / warning / destructive over total). */
  progress: MissionProgress;
}

const MissionDetailHeader = React.forwardRef<
  HTMLElement,
  MissionDetailHeaderProps
>(({ title, targetDate, daysOut, stats, progress, className, ...props }, ref) => {
  // 3-segment window-state bar: done → closing → blocked, remainder = bare track.
  const segments: ProgressSegment[] = [
    { tone: "success", value: progress.done },
    { tone: "warning", value: progress.closing },
    { tone: "destructive", value: progress.blocked },
  ];
  const progressLabel = `${progress.done} done, ${progress.closing} closing, ${progress.blocked} blocked of ${progress.total}`;

  return (
    <header
      ref={ref}
      // vertical, gap 16, padding [24,32], 1px $border bottom rule over $background.
      className={cn(
        "flex w-full flex-col gap-4 border-b border-border bg-background px-8 py-6",
        className,
      )}
      {...props}
    >
      {/* Title — DM Sans 26/700. */}
      <h1 className="font-sans text-title font-bold text-foreground">{title}</h1>
      {/* Target line — mono 13, muted, uppercase: `TARGET: 27 APR 2026 · 328 DAYS OUT`.
          The human date is supplied pre-formatted by the caller; the live days-out
          countdown is appended only when both a date and a (non-negative) count exist. */}
      <p className="font-mono text-[13px] uppercase tracking-[1px] text-muted-foreground">
        TARGET: {targetDate ?? "—"}
        {targetDate != null && daysOut != null
          ? ` · ${Math.max(0, daysOut)} DAYS OUT`
          : null}
      </p>
      {/* 4 StatTiles — DONE / BLOCKED / CLOSING / TOTAL, fixed order + tone. */}
      <div className="flex gap-8">
        <StatTile value={stats.done} label="DONE" tone="success" />
        <StatTile value={stats.blocked} label="BLOCKED" tone="destructive" />
        <StatTile value={stats.closing} label="CLOSING" tone="warning" />
        <StatTile value={stats.total} label="TOTAL" tone="foreground" />
      </div>
      {/* 3-segment composition bar over the $card-elevated track. */}
      <ProgressBar
        segments={segments}
        total={progress.total}
        label={progressLabel}
      />
    </header>
  );
});
MissionDetailHeader.displayName = "MissionDetailHeader";

export { MissionDetailHeader };
