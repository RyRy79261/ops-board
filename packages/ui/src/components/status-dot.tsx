import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/utils";

/**
 * StatusDot / CategoryDot — a small token-driven rounded-full indicator
 * (6–8px). Serves both the status/live role (accent/success/warning/muted)
 * and the category role (cat-* hues). Purely presentational and decorative:
 * it is always paired with an adjacent visible label (LOCKED #6 — color is
 * never the sole carrier), so the dot itself is `aria-hidden`.
 *
 * Sizes (per contract): 6px (SyncStatus live dot + in-card task meta) ·
 * 7px (Dependencies inline CategoryTag leading dot) · 8px (category
 * group-header dots — the canonical base).
 *
 * The `rounded-full` here is one of the explicit --radius:0 exceptions (§5).
 */
const statusDotVariants = cva("inline-block shrink-0 rounded-full", {
  variants: {
    tone: {
      accent: "bg-primary",
      "cat-medical": "bg-cat-medical",
      "cat-bureaucratic": "bg-cat-bureaucratic",
      "cat-travel": "bg-cat-travel",
      "cat-gear": "bg-cat-gear",
      "cat-tech": "bg-cat-tech",
      success: "bg-success",
      warning: "bg-warning",
      muted: "bg-muted-foreground",
    },
  },
  defaultVariants: {
    tone: "accent",
  },
});

export interface StatusDotProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color">,
    VariantProps<typeof statusDotVariants> {
  /** Box size in px. 6 (sync/meta) · 7 (inline CategoryTag dot) · 8 (group headers). */
  size?: 6 | 7 | 8;
}

function StatusDot({
  tone,
  size = 8,
  className,
  style,
  ...props
}: StatusDotProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(statusDotVariants({ tone }), className)}
      style={{ width: size, height: size, ...style }}
      {...props}
    />
  );
}

export { StatusDot, statusDotVariants };
