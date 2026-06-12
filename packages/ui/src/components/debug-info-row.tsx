import * as React from "react";

import { cn } from "../lib/utils";

/**
 * DebugInfoRow — a tiny 2-column mono key/value row for the Debug/About panel
 * (molecule, canonical). Fixed key column + fill value, on `$card-elevated`
 * (`07-asm-debug.md` §DebugInfoRow). A definition-list pair. Server-safe.
 */
export interface DebugInfoRowProps
  extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
}

const DebugInfoRow = React.forwardRef<HTMLDivElement, DebugInfoRowProps>(
  ({ label, value, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex gap-3 bg-card-elevated px-3.5 py-2.5 font-mono text-[12px]",
          className,
        )}
        {...props}
      >
        <span className="w-32 shrink-0 uppercase tracking-[1px] text-muted-foreground-subtle">
          {label}
        </span>
        <span className="min-w-0 flex-1 break-all text-foreground">{value}</span>
      </div>
    );
  },
);
DebugInfoRow.displayName = "DebugInfoRow";

export { DebugInfoRow };
