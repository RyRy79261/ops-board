import * as React from "react";
import { Box } from "lucide-react";

import { cn } from "../lib/utils";

/**
 * ManualLiveBlock — a "live canvas" in the in-app Manual (molecule, canonical).
 *
 * A bordered `$muted` card with a `$card-elevated` header bar (box icon + mono
 * label) over a children "stage" that INSTANCES real components (TaskCard,
 * StatusCycleButton, WindowStatePill…) so the docs show the live thing, not a
 * screenshot (`07-asm-debug.md` §ManualLiveBlock). Presentational — server-safe.
 */
export interface ManualLiveBlockProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Header-bar label (mono caps). */
  label: string;
  /** The live demo — real component instances. */
  children: React.ReactNode;
}

const ManualLiveBlock = React.forwardRef<HTMLDivElement, ManualLiveBlockProps>(
  ({ label, children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex max-w-[600px] flex-col border border-border bg-muted",
          className,
        )}
        {...props}
      >
        <div className="flex items-center gap-[7px] border-b border-border bg-card-elevated px-3.5 py-2.5">
          <Box aria-hidden="true" className="size-3.5 text-muted-foreground-subtle" />
          <span className="font-mono text-eyebrow font-semibold uppercase tracking-[1.5px] text-muted-foreground">
            {label}
          </span>
        </div>
        <div className="flex flex-col gap-3 p-4">{children}</div>
      </div>
    );
  },
);
ManualLiveBlock.displayName = "ManualLiveBlock";

export { ManualLiveBlock };
