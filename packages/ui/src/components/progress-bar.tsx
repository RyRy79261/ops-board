import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// ProgressBar — 3-segment window-state composition bar (design-brief §9).
// A sharp (radius-0) stacked bar over a `$card-elevated` track. Encodes mission
// composition as up to three coloured segments — done → closing → blocked — with
// the unfilled remainder showing the track. Data-driven widths (value/total).
//
// Pure presentational leaf: no state/effects/DOM-wired refs → server-compatible,
// NO "use client" (except CSS-only `indeterminate` animation, which is fine).
// ADAPTED from camp-404 `progress-bar.tsx` (single-value → stacked multi-segment).
// ─────────────────────────────────────────────────────────────────────────────

/** A single coloured run of the bar; width = `value / total` of the track. */
export interface ProgressSegment {
  tone: "success" | "warning" | "destructive" | "primary";
  value: number;
}

/** Per-tone segment fill — solid status/brand colours. */
const SEGMENT_FILL: Record<ProgressSegment["tone"], string> = {
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  primary: "bg-primary",
};

/** The track (background) surface, driven by `mode` + `remainderTone`. */
const trackVariants = cva("relative flex w-full overflow-hidden", {
  variants: {
    mode: {
      // §9 canonical — track is the deepest panel surface.
      window: "bg-card-elevated",
      // Dependencies board divergence — done/active over a $muted track.
      progress: "bg-muted",
    },
  },
  defaultVariants: {
    mode: "window",
  },
});

type RemainderTone = "track" | "border" | "muted";

/** How the unfilled remainder renders past the last segment. */
const REMAINDER_FILL: Record<RemainderTone, string> = {
  track: "", // bare track shows through ($card-elevated / $muted)
  border: "bg-border", // mobile + Deps remaining seg
  muted: "bg-muted", // Timeline detail header `Seg Rest`
};

export interface ProgressBarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">,
    VariantProps<typeof trackVariants> {
  /** Ordered segments; widths are `value / total` of the track. */
  segments?: ProgressSegment[];
  /** Denominator for segment widths (task count). */
  total?: number;
  /** How the unfilled remainder renders. */
  remainderTone?: RemainderTone;
  /** Gap between segments in px (0 desktop, 2 summary/mobile). */
  gap?: number;
  /** Bar height in px. 4 on most screens; Timeline detail header is 6. */
  height?: number;
  /**
   * Indeterminate AI-research sweep — a single $primary run animating L→R over
   * the track. When set, `segments` are ignored. (CSS-only; no JS state.)
   */
  indeterminate?: boolean;
  /** Accessible name summarising composition, e.g. "3 done, 2 closing of 11". */
  label?: string;
}

function ProgressBar({
  segments = [],
  total = 0,
  mode = "window",
  remainderTone = "track",
  gap = 0,
  height = 4,
  indeterminate = false,
  label,
  className,
  style,
  ...props
}: ProgressBarProps) {
  const safeTotal = total > 0 ? total : 1;
  const filled = segments.reduce((sum, s) => sum + Math.max(0, s.value), 0);
  const filledPct = Math.min(100, Math.round((filled / safeTotal) * 100));

  // The first segment carries the canonical aria-valuenow (the "done" portion);
  // the explicit `label` overrides for a full composition summary.
  const doneSeg = segments.find((s) => s.tone === "success");
  const doneNow = doneSeg
    ? Math.min(100, Math.round((doneSeg.value / safeTotal) * 100))
    : filledPct;

  const explicitRemainder =
    !indeterminate && remainderTone !== "track" && filled < safeTotal;
  const remainderPct = explicitRemainder
    ? Math.max(0, 100 - (filled / safeTotal) * 100)
    : 0;

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={indeterminate ? undefined : 100}
      aria-valuenow={indeterminate ? undefined : doneNow}
      aria-label={label}
      className={cn(trackVariants({ mode }), className)}
      style={{ height, columnGap: gap, ...style }}
      {...props}
    >
      {indeterminate ? (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-2/5 animate-[ob-progress-indeterminate_1.2s_ease-in-out_infinite] bg-primary"
        />
      ) : (
        <>
          {segments.map((seg, i) =>
            seg.value > 0 ? (
              <span
                key={i}
                aria-hidden="true"
                className={cn("h-full shrink-0", SEGMENT_FILL[seg.tone])}
                style={{ width: `${(seg.value / safeTotal) * 100}%` }}
              />
            ) : null,
          )}
          {explicitRemainder ? (
            <span
              aria-hidden="true"
              className={cn("h-full shrink-0", REMAINDER_FILL[remainderTone])}
              style={{ width: `${remainderPct}%` }}
            />
          ) : null}
        </>
      )}
      {/* CSS-only indeterminate keyframes (no JS, server-safe). */}
      <style>{`@keyframes ob-progress-indeterminate{0%{transform:translateX(-100%)}100%{transform:translateX(350%)}}`}</style>
    </div>
  );
}

export { ProgressBar, trackVariants as progressBarVariants };
