import * as React from "react";

import { cn } from "../lib/utils";

/**
 * CategoryGroupHeader — the group divider that opens each category section in
 * the Category view (molecule, canonical `TIDIA`). An 8px category-coloured dot
 * + the category name in its colour (mono 12/700 ls1.5, uppercase) + a
 * `{done}/{total}` count in the subtle dim tone.
 *
 * The `color` is a free-form CSS colour string supplied by the caller
 * (CategoryVM.color — the per-category hue), so the dot fill and the label
 * colour are applied inline rather than via a fixed cat-* token map. The same
 * colour drives BOTH the dot and the label (redundant colour channel, LOCKED #6
 * — the label text carries the category name redundantly, never colour-only).
 *
 * Read-only section heading; renders as an <h3> so the grouped list is
 * navigable. Presentational leaf — server-safe, no "use client".
 */
export interface CategoryGroupHeaderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Per-category hue (CategoryVM.color) — drives the dot fill + label colour. */
  color: string;
  /** Category display label, e.g. "MEDICAL" (rendered uppercase). */
  label: string;
  /** Completed task count in the group. */
  doneCount: number;
  /** Total task count in the group; rendered as `{done}/{total}`. */
  totalCount: number;
}

const CategoryGroupHeader = React.forwardRef<
  HTMLDivElement,
  CategoryGroupHeaderProps
>(({ color, label, doneCount, totalCount, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      // row, gap 8, items-center.
      className={cn("flex items-center gap-2", className)}
      {...props}
    >
      {/* 8px category-coloured dot (decorative). */}
      <span
        aria-hidden="true"
        className="size-2 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      {/* Category label — mono 12/700 ls1.5 uppercase, cat-coloured. */}
      <h3
        className="font-mono text-caption font-bold uppercase leading-none tracking-[1.5px]"
        style={{ color }}
      >
        {label}
      </h3>
      {/* {done}/{total} count — mono 12/normal, subtle dim. */}
      <span
        className="font-mono text-caption text-muted-foreground-subtle tabular-nums"
        aria-label={`${doneCount} of ${totalCount} done`}
      >
        {doneCount}/{totalCount}
      </span>
    </div>
  );
});
CategoryGroupHeader.displayName = "CategoryGroupHeader";

export { CategoryGroupHeader };
