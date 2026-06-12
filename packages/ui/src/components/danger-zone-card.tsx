import * as React from "react";
import { OctagonAlert } from "lucide-react";

import { cn } from "../lib/utils";

/**
 * DangerZoneCard — destructive-action container (organism, canonical).
 *
 * A `$destructive`-tinted, `$destructive`-bordered card titled `DANGER ZONE`
 * (octagon-alert), wrapping a slot of destructive action rows (`07-asm-debug.md`
 * §DangerZoneCard). Each row is a `DangerZoneRow` (label/desc + a trailing
 * destructive action that opens a type-to-confirm step). Presentational shell.
 */
export interface DangerZoneCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Card title. Default `DANGER ZONE`. */
  title?: string;
  /** The destructive action rows (DangerZoneRow elements). */
  children: React.ReactNode;
}

const DangerZoneCard = React.forwardRef<HTMLDivElement, DangerZoneCardProps>(
  ({ title = "DANGER ZONE", children, className, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn(
          "flex flex-col gap-3.5 border border-destructive bg-destructive/[0.08] p-5",
          className,
        )}
        {...props}
      >
        <div className="flex items-center gap-2.5">
          <OctagonAlert aria-hidden="true" className="size-4 text-destructive" />
          <span className="font-mono text-xs font-bold uppercase tracking-[2px] text-destructive">
            {title}
          </span>
        </div>
        <div className="flex flex-col gap-2.5">{children}</div>
      </section>
    );
  },
);
DangerZoneCard.displayName = "DangerZoneCard";

/** One destructive action row inside a DangerZoneCard: label/desc + action slot. */
export interface DangerZoneRowProps
  extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  description?: string;
  /** The trailing action (a destructive/outline Button or a toggle to the confirm step). */
  children?: React.ReactNode;
}

const DangerZoneRow = React.forwardRef<HTMLDivElement, DangerZoneRowProps>(
  ({ label, description, children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-3 border border-border bg-card p-[15px] sm:flex-row sm:items-center sm:justify-between sm:gap-4",
          className,
        )}
        {...props}
      >
        <div className="flex min-w-0 flex-col gap-1">
          <span className="font-sans text-sm font-medium text-foreground">
            {label}
          </span>
          {description ? (
            <span className="font-sans text-xs leading-[1.4] text-muted-foreground">
              {description}
            </span>
          ) : null}
        </div>
        {children ? <div className="shrink-0">{children}</div> : null}
      </div>
    );
  },
);
DangerZoneRow.displayName = "DangerZoneRow";

export { DangerZoneCard, DangerZoneRow };
