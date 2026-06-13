import * as React from "react";

import { cn } from "../lib/utils";
import { confidenceTone, CONFIDENCE_TEXT } from "../lib/confidence";
import { CATEGORY_DOT, CATEGORY_TEXT, type Category } from "../lib/categories";

/**
 * TaskChip — the matched TARGET TASK chip in the desktop ParsedIntentPanel
 * (`04-voice-ai.md`, the `Task Chip` in IntentRow `TFXQ0`). A `$card-elevated`
 * bordered row: a category-toned dot + the task name (DM Sans 14/500) over a
 * mono caption, with an optional right-aligned confidence block (`92%` over
 * `CONFIDENCE`, banded by the shared confidence→tone helper).
 *
 * Presentational leaf (no state) → server-safe, no "use client".
 */
export interface TaskChipProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The matched task name (DM Sans 14/500). */
  name: string;
  /** Drives the dot hue + the caption colour. */
  category: Category;
  /** Mono caption under the name, e.g. `BUREAUCRATIC · MATCHED IN MISSION`. */
  caption?: string;
  /** Match confidence as a 0–100 percentage. Omit to hide the right block. */
  confidence?: number;
}

const TaskChip = React.forwardRef<HTMLDivElement, TaskChipProps>(
  ({ name, category, caption, confidence, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-between gap-3 border border-border bg-card-elevated px-3.5 py-3",
          className,
        )}
        {...props}
      >
        <div className="flex min-w-0 items-center gap-[11px]">
          <span
            aria-hidden="true"
            className={cn("size-[9px] shrink-0 rounded-full", CATEGORY_DOT[category])}
          />
          <div className="flex min-w-0 flex-col gap-[3px]">
            <span className="truncate text-[14px] font-medium text-foreground">
              {name}
            </span>
            {caption ? (
              <span
                className={cn(
                  "truncate font-mono text-[10px] uppercase tracking-[1px]",
                  CATEGORY_TEXT[category],
                )}
              >
                {caption}
              </span>
            ) : null}
          </div>
        </div>
        {confidence != null ? (
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span
              className={cn(
                "font-mono text-[16px] font-bold",
                CONFIDENCE_TEXT[confidenceTone(confidence)],
              )}
            >
              {confidence}%
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[1px] text-muted-foreground">
              Confidence
            </span>
          </div>
        ) : null}
      </div>
    );
  },
);
TaskChip.displayName = "TaskChip";

export { TaskChip };
