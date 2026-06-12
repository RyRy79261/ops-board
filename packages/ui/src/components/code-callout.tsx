import * as React from "react";
import { Info, TriangleAlert, OctagonAlert, type LucideIcon } from "lucide-react";

import { cn } from "../lib/utils";

/**
 * CodeCallout — left-accent callout block (molecule, canonical) with two forms
 * (`07-asm-debug.md` §CodeCallout):
 *  - **prose** (default): a tinted callout — icon + mono caps title + DM Sans
 *    body. Embedded in Legal sections in `info`/`warning` tones (and `danger`
 *    outside Legal). `$card-elevated` base, `border-left-2` by tone.
 *  - **code** (`mono`): a console form — monospace lines (comment / spoken
 *    command / result) for the Manual's voice demos.
 *
 * Presentational leaf — server-safe. The icon is decorative (`aria-hidden`).
 */
export type CodeCalloutTone = "info" | "warning" | "danger";

const TONE_ACCENT: Record<CodeCalloutTone, string> = {
  info: "border-l-primary bg-primary/[0.06]",
  warning: "border-l-warning bg-warning/[0.06]",
  danger: "border-l-destructive bg-destructive/[0.06]",
};
const TONE_TEXT: Record<CodeCalloutTone, string> = {
  info: "text-primary",
  warning: "text-warning",
  danger: "text-destructive",
};
const TONE_ICON: Record<CodeCalloutTone, LucideIcon> = {
  info: Info,
  warning: TriangleAlert,
  danger: OctagonAlert,
};

export interface CodeCalloutProps
  extends React.HTMLAttributes<HTMLDivElement> {
  tone?: CodeCalloutTone;
  /** Mono caps title (prose form). Omit for an untitled callout / code form. */
  title?: string;
  /** Override the leading icon (prose form). */
  icon?: LucideIcon;
  /** `code`/console form — render children as monospace lines. */
  mono?: boolean;
  children: React.ReactNode;
}

const CodeCallout = React.forwardRef<HTMLDivElement, CodeCalloutProps>(
  ({ tone = "info", title, icon, mono = false, children, className, ...props }, ref) => {
    const Icon = icon ?? TONE_ICON[tone];
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-1.5 border-l-2 bg-card-elevated p-4",
          TONE_ACCENT[tone],
          className,
        )}
        {...props}
      >
        {mono ? (
          <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-foreground">
            {children}
          </pre>
        ) : (
          <>
            {title ? (
              <div className="flex items-center gap-2">
                <Icon aria-hidden="true" className={cn("size-4", TONE_TEXT[tone])} />
                <span
                  className={cn(
                    "font-mono text-[11px] font-bold uppercase tracking-[1.5px]",
                    TONE_TEXT[tone],
                  )}
                >
                  {title}
                </span>
              </div>
            ) : null}
            <div className="text-[13px] leading-relaxed text-muted-foreground">
              {children}
            </div>
          </>
        )}
      </div>
    );
  },
);
CodeCallout.displayName = "CodeCallout";

export { CodeCallout };
