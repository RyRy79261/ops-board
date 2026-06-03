import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/utils";

// A single labelled metric: a big JetBrains Mono number (tone-coloured) over a
// tracked uppercase mono caption. Used in clusters of 4 (DONE · BLOCKED ·
// CLOSING · TOTAL) inside the mission detail header / summary card.
// Presentational leaf — read-only, no interactive states.

const statTileVariants = cva("flex flex-col", {
  variants: {
    size: {
      // Canonical def: Val 30/700, Lab 11/600 ls1.5, gap 4
      showcase: "gap-1",
      // Category detail header: Val 22/700, Lab 11/600 ls1.5, gap 3
      detail: "gap-[3px]",
      // Deps + summary card: Val 20/700, Lab 10/600 ls1, gap 2
      summary: "gap-0.5",
      // Mobile fused summary: Val 13/700, Lab 9/500, gap 5
      mobile: "gap-[5px]",
    },
  },
  defaultVariants: {
    size: "detail",
  },
});

const statValueVariants = cva("font-mono leading-none tabular-nums", {
  variants: {
    tone: {
      foreground: "text-foreground",
      success: "text-success",
      warning: "text-warning",
      destructive: "text-destructive",
      muted: "text-muted-foreground",
    },
    size: {
      showcase: "text-[30px] font-bold",
      detail: "text-[22px] font-bold",
      summary: "text-[20px] font-bold",
      mobile: "text-[13px] font-bold",
    },
  },
  defaultVariants: {
    tone: "foreground",
    size: "detail",
  },
});

const statLabelVariants = cva("font-mono uppercase leading-none", {
  variants: {
    size: {
      showcase:
        "text-[11px] font-semibold tracking-[1.5px] text-muted-foreground-subtle",
      detail:
        "text-[11px] font-semibold tracking-[1.5px] text-muted-foreground-subtle",
      summary:
        "text-[10px] font-semibold tracking-[1px] text-muted-foreground-subtle",
      mobile: "text-[9px] font-medium text-muted-foreground",
    },
  },
  defaultVariants: {
    size: "detail",
  },
});

export interface StatTileProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">,
    VariantProps<typeof statTileVariants> {
  /** The metric (e.g. 3, 11, '04'). */
  value: string | number;
  /** Uppercase caption (DONE / BLOCKED / CLOSING / TOTAL). */
  label: string;
  /** Colour of the value. DONE=success, CLOSING=warning, BLOCKED=destructive (mobile→muted), TOTAL=foreground. */
  tone?: VariantProps<typeof statValueVariants>["tone"];
}

const StatTile = React.forwardRef<HTMLDivElement, StatTileProps>(
  ({ value, label, tone, size, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="group"
        aria-label={`${label}: ${value}`}
        className={cn(statTileVariants({ size }), className)}
        {...props}
      >
        <span aria-hidden="true" className={statValueVariants({ tone, size })}>
          {value}
        </span>
        <span aria-hidden="true" className={statLabelVariants({ size })}>
          {label}
        </span>
      </div>
    );
  },
);
StatTile.displayName = "StatTile";

export { StatTile, statTileVariants, statValueVariants, statLabelVariants };
