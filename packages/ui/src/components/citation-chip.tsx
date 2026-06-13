import * as React from "react";

import { cn } from "../lib/utils";

/**
 * CitationChip — a 1-based citation marker rendered after an AINotesBlock step
 * (`04-voice-ai.md`, atom `G35WX`). The index points into the result's
 * `sources[]`.
 *
 * Two render modes, per the desktop/mobile board divergence:
 *  - `chip` (desktop) — a discrete bordered chip `[1]` on `$card-elevated`
 *    (Mono 10/600, `$primary`), padding `[1,6]`.
 *  - `inline` (mobile) — the bracketed index appended inline to the step text
 *    (`"…land-use application. [1]"`), no chrome.
 *
 * Presentational leaf (no state) → server-safe, no "use client".
 */
export interface CitationChipProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  /** 1-based index into the result's `sources[]`. */
  index: number;
  /** `chip` = discrete bordered chip (desktop); `inline` = bracketed text (mobile). */
  renderMode?: "chip" | "inline";
}

const CitationChip = React.forwardRef<HTMLSpanElement, CitationChipProps>(
  ({ index, renderMode = "chip", className, ...props }, ref) => {
    if (renderMode === "inline") {
      return (
        <span
          ref={ref}
          className={cn("font-mono text-[12px] text-primary", className)}
          {...props}
        >
          [{index}]
        </span>
      );
    }
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center border border-border bg-card-elevated px-1.5 py-px font-mono text-[10px] font-semibold text-primary",
          className,
        )}
        {...props}
      >
        [{index}]
      </span>
    );
  },
);
CitationChip.displayName = "CitationChip";

export { CitationChip };
