import * as React from "react";

import { cn } from "../lib/utils";

/**
 * SectionNavChip — a pill scroll-nav chip (atom, canonical). The mobile sibling
 * of ManualTOCItem: a transparent, full-radius, 1px-bordered pill with a mono
 * label (`06-chrome-nav.md` §SectionNavChip). Active → primary tint. It's
 * scroll-nav, NOT a routed tab. Rendered as a real button. Server-safe.
 */
export interface SectionNavChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Chip label. */
  label: string;
  /** Active section → primary tint + border. */
  active?: boolean;
}

const SectionNavChip = React.forwardRef<HTMLButtonElement, SectionNavChipProps>(
  ({ label, active = false, className, type, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type ?? "button"}
        aria-current={active ? "true" : undefined}
        className={cn(
          "inline-flex shrink-0 items-center rounded-full border px-3 py-[5px] font-mono text-[11px] font-medium tracking-[0.5px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
          active
            ? "border-primary bg-primary/12 text-primary"
            : "border-border text-muted-foreground hover:text-foreground",
          className,
        )}
        {...props}
      >
        {label}
      </button>
    );
  },
);
SectionNavChip.displayName = "SectionNavChip";

export { SectionNavChip };
