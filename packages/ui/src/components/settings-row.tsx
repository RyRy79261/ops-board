import * as React from "react";
import { ChevronRight } from "lucide-react";

import { cn } from "../lib/utils";

/**
 * SettingsRow — the unit of the Settings/Account screens (molecule, canonical).
 *
 * A label (+ optional description) on the left and a trailing control slot on
 * the right (`07-asm-debug.md` §SettingsRow): Row [horizontal, gap 16, padding
 * 15/16, items-center] → L [vertical, gap 3]{ Label DM Sans 14/500 $foreground +
 * Desc DM Sans 12 $muted-foreground } + Trailing. Rows live inside a
 * `SettingsGroup` Card, separated by 1px `$border` dividers.
 *
 * Trailing kinds: a control (Switch/Select — passed as `children`) OR a nav
 * chevron (`chevron`) when the row is a link/button (the consumer wraps it in a
 * next/link or onClick host — keeping this leaf framework-agnostic + server-safe).
 */
export interface SettingsRowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Left-column label (DM Sans 14/500). */
  label: string;
  /** Optional secondary description line (DM Sans 12, muted). */
  description?: string;
  /** Trailing control (e.g. a Switch). Omit for a pure nav/chevron row. */
  children?: React.ReactNode;
  /** Render a trailing `chevron-right` (nav row). Ignored when `children` is set. */
  chevron?: boolean;
}

const SettingsRow = React.forwardRef<HTMLDivElement, SettingsRowProps>(
  ({ label, description, children, chevron, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-4 px-4 py-[15px] text-left",
          className,
        )}
        {...props}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
          <span className="font-sans text-sm font-medium text-foreground">
            {label}
          </span>
          {description ? (
            <span className="font-sans text-xs leading-[1.4] text-muted-foreground">
              {description}
            </span>
          ) : null}
        </div>
        {children ? (
          <div className="shrink-0">{children}</div>
        ) : chevron ? (
          <ChevronRight
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground-subtle"
          />
        ) : null}
      </div>
    );
  },
);
SettingsRow.displayName = "SettingsRow";

export { SettingsRow };
