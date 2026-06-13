import * as React from "react";

import { cn } from "../lib/utils";

/**
 * IntentRow — one key/value row of the desktop ParsedIntentPanel definition list
 * (`04-voice-ai.md`, molecule `dO0U6`). A fixed 120px mono key column + a
 * fill-width value slot that holds whatever the parsed slot needs (a pill, a
 * text line, a TaskChip, an icon+label action). The value is a polymorphic
 * `children` slot so the panel composes each row's content directly.
 *
 * `divider` draws the bottom hairline that separates rows (every row except the
 * last — ACTION — in the desktop panel).
 *
 * Presentational leaf (no state) → server-safe, no "use client".
 */
export interface IntentRowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The mono key column label (e.g. `INTENT`, `QUERY`, `TARGET TASK`, `ACTION`). */
  label: string;
  /** Bottom hairline divider (all rows but the last). */
  divider?: boolean;
}

const IntentRow = React.forwardRef<HTMLDivElement, IntentRowProps>(
  ({ label, divider = false, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex gap-[18px] py-3.5",
          divider && "border-b border-border",
          className,
        )}
        {...props}
      >
        <span className="w-[120px] shrink-0 pt-0.5 font-mono text-[11px] uppercase tracking-[1.5px] text-muted-foreground">
          {label}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-2">{children}</div>
      </div>
    );
  },
);
IntentRow.displayName = "IntentRow";

export { IntentRow };
