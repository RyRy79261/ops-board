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
  /** Real-world target/cliff date (already formatted), or null when none set. */
  targetDate: string | null;
  /** The 4 stat-tile counts. */
  stats: MissionStats;
  /** 3-segment ProgressBar inputs (success / warning / destructive over total). */
  progress: MissionProgress;
}

const MissionDetailHeader = React.forwardRef<
  HTMLElement,
  MissionDetailHeaderProps
>(({ title, targetDate, stats, progress, className, ...props }, ref) => {
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
      {/* Target line — mono 13, muted. ISO/human form supplied by the caller. */}
      <p className="font-mono text-[13px] tracking-[1px] text-muted-foreground">
        Target: {targetDate ?? "—"}
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
