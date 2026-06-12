import * as React from "react";
import { ChevronRight } from "lucide-react";

import { cn } from "../lib/utils";

/**
 * LegalIndexRow — a row in the Legal index list (molecule, canonical).
 *
 * Title + one-line description on the left; a mono updated-date + chevron on the
 * right (`07-asm-debug.md` §LegalIndexRow). Stacked into a carded list on the
 * Legal index; the consumer wraps it in a next/link. Presentational — server-safe.
 */
export interface LegalIndexRowProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Document title, e.g. `Privacy Policy`. */
  title: string;
  /** One-line description. */
  description?: string;
  /** Pre-formatted "updated" date (mono), e.g. `UPD 12 JUN 2026`. */
  updated?: string;
}

const LegalIndexRow = React.forwardRef<HTMLDivElement, LegalIndexRowProps>(
  ({ title, description, updated, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-between gap-5 bg-card px-5 py-[18px]",
          className,
        )}
        {...props}
      >
        <div className="flex min-w-0 flex-col gap-[5px]">
          <span className="font-sans text-[17px] font-semibold text-foreground">
            {title}
          </span>
          {description ? (
            <span className="font-sans text-[13px] leading-[1.4] text-muted-foreground">
              {description}
            </span>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {updated ? (
            <span className="font-mono text-eyebrow uppercase tracking-[1px] text-muted-foreground-subtle">
              {updated}
            </span>
          ) : null}
          <ChevronRight
            aria-hidden="true"
            className="size-4 text-muted-foreground-subtle"
          />
        </div>
      </div>
    );
  },
);
LegalIndexRow.displayName = "LegalIndexRow";

export { LegalIndexRow };
