import * as React from "react";

import { cn } from "../lib/utils";

/**
 * ErrorLogRow — a log entry for the Debug "Recent Errors" list (molecule,
 * canonical): timestamp + severity pill + message (`07-asm-debug.md`
 * §ErrorLogRow). Server-safe presentational row.
 */
export type ErrorLogLevel = "error" | "warn" | "info";

const LEVEL_PILL: Record<ErrorLogLevel, string> = {
  error: "bg-destructive/12 text-destructive",
  warn: "bg-warning/12 text-warning",
  info: "bg-muted text-muted-foreground",
};

export interface ErrorLogRowProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Pre-formatted timestamp (mono). */
  time: string;
  level: ErrorLogLevel;
  message: string;
}

const ErrorLogRow = React.forwardRef<HTMLDivElement, ErrorLogRowProps>(
  ({ time, level, message, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col gap-1 px-3.5 py-2.5", className)}
        {...props}
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-eyebrow uppercase tracking-[1px] text-muted-foreground-subtle">
            {time}
          </span>
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 font-mono text-micro font-semibold uppercase leading-none",
              LEVEL_PILL[level],
            )}
          >
            {level}
          </span>
        </div>
        <span className="break-words font-mono text-[12px] leading-relaxed text-foreground">
          {message}
        </span>
      </div>
    );
  },
);
ErrorLogRow.displayName = "ErrorLogRow";

export { ErrorLogRow };
