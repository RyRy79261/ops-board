import * as React from "react";

import { cn } from "../lib/utils";
import { Eyebrow } from "./eyebrow";

/**
 * SettingsGroup — a labelled group of SettingsRows (canonical "Group" + the
 * mono-caps SettingsGroupHeader eyebrow). A `$card` box with a 1px `$border` and
 * hairline `$border` dividers between rows, beneath an uppercase mono eyebrow
 * (`07-asm-debug.md` §SettingsRow). Presentational shell — server-safe.
 */
export interface SettingsGroupProps
  extends React.HTMLAttributes<HTMLElement> {
  /** Mono-caps group header (e.g. `VOICE & MICROPHONE`). */
  title: string;
  /** The rows — SettingsRow elements (or next/link-wrapped rows). */
  children: React.ReactNode;
}

const SettingsGroup = React.forwardRef<HTMLElement, SettingsGroupProps>(
  ({ title, children, className, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn("flex flex-col gap-2", className)}
        {...props}
      >
        <Eyebrow as="h2" tone="subtle" weight={700} tracking={2}>
          {title}
        </Eyebrow>
        <div className="flex flex-col divide-y divide-border border border-border bg-card">
          {children}
        </div>
      </section>
    );
  },
);
SettingsGroup.displayName = "SettingsGroup";

export { SettingsGroup };
