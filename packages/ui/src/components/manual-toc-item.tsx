import * as React from "react";

import { cn } from "../lib/utils";

/**
 * ManualTOCItem — a desktop table-of-contents entry for the Manual (molecule,
 * canonical). A 248px row with a left-accent rail (active → `border-l-2 $primary`
 * + `bg-primary/12`) and a DM Sans label (`07-asm-debug.md` §ManualTOCItem). On
 * mobile the same nav model is a SectionNavChip pill. The consumer wraps it in a
 * next/link (anchor to the section). Presentational — server-safe.
 */
export interface ManualTOCItemProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Entry label. */
  label: string;
  /** Active (current section) → primary rail + tint + label. */
  active?: boolean;
}

const ManualTOCItem = React.forwardRef<HTMLDivElement, ManualTOCItemProps>(
  ({ label, active = false, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        aria-current={active ? "true" : undefined}
        className={cn(
          "w-[248px] border-l-2 px-3 py-[9px] font-sans text-sm transition-colors",
          active
            ? "border-l-primary bg-primary/12 font-semibold text-primary"
            : "border-l-transparent text-muted-foreground hover:text-foreground",
          className,
        )}
        {...props}
      >
        {label}
      </div>
    );
  },
);
ManualTOCItem.displayName = "ManualTOCItem";

export { ManualTOCItem };
