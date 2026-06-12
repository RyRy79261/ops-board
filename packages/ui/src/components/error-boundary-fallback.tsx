import * as React from "react";
import { AlertTriangle, RotateCw, Bug } from "lucide-react";

import { cn } from "../lib/utils";

/**
 * ErrorBoundaryFallback — the crash recovery surface (canonical `d4KRE9`).
 *
 * Two variants per `states.md` §5/§7 (screens authoritative):
 *  - **retry** (board `H2083`, the lean route fallback): `$background` card, 1px
 *    `$border`, no accent bar, a 48px `$destructive` triangle, a mono caps
 *    headline (`SOMETHING BROKE`), a short DM Sans body, and a single `$primary`
 *    RETRY action.
 *  - **full** (canonical fatal fallback): adds a 2px `$destructive` TOP accent
 *    bar + `$destructive` container stroke, an `ERR · …` code line, an optional
 *    monospace `trace` line, a sentence-case headline, and a two-action footer
 *    (Reload primary + optional Report outline).
 *
 * `role="alert"` so assistive tech announces the failure; the icon + accent bar
 * are decorative (`aria-hidden`). Presentational — the host (a React
 * ErrorBoundary, a Next `error.tsx`/`global-error.tsx`) owns the reset wiring.
 */
export type ErrorBoundaryVariant = "retry" | "full";

type ErrorBoundaryFallbackBaseProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Headline. Defaults per variant (`SOMETHING BROKE` / `Something broke`). */
  title?: string;
  /** Body sentence. Defaults per variant. */
  description?: string;
  /** `full` only — the `ERR · …` code line. */
  errorCode?: string;
  /** `full` only — a monospace trace/build line. */
  trace?: string;
};

/** retry variant — the primary RETRY handler is REQUIRED (no dead-end button). */
type RetryVariantProps = {
  variant?: "retry";
  /** Primary action; resets the boundary / re-fetches. */
  onRetry: () => void;
  onReload?: never;
  onReport?: never;
};

/** full variant — the primary Reload handler is REQUIRED; Report is optional. */
type FullVariantProps = {
  variant: "full";
  /** Primary action; reloads the app. */
  onReload: () => void;
  /** Optional secondary outline action; opens the report flow. */
  onReport?: () => void;
  onRetry?: never;
};

// Discriminated union: every RENDERED recovery button has a required handler, so
// no variant can produce a no-op dead-end button.
export type ErrorBoundaryFallbackProps = ErrorBoundaryFallbackBaseProps &
  (RetryVariantProps | FullVariantProps);

const RETRY_TITLE = "SOMETHING BROKE";
const RETRY_BODY = "An unexpected error occurred while loading the board.";
const FULL_TITLE = "Something broke";
const FULL_BODY =
  "An unexpected error stopped this view from rendering. Reload to recover, or report the issue with the trace below.";

const ErrorBoundaryFallback = React.forwardRef<
  HTMLDivElement,
  ErrorBoundaryFallbackProps
>(
  (
    {
      variant = "retry",
      title,
      description,
      errorCode,
      trace,
      onRetry,
      onReload,
      onReport,
      className,
      ...props
    },
    ref,
  ) => {
    if (variant === "full") {
      return (
        <div
          ref={ref}
          role="alert"
          className={cn(
            // $destructive top accent bar + stroke, centered fatal fallback.
            "relative flex w-full max-w-md flex-col items-center gap-4 border border-destructive bg-background p-8 text-center",
            "before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-destructive before:content-['']",
            className,
          )}
          {...props}
        >
          <AlertTriangle
            aria-hidden="true"
            className="size-12 text-destructive"
          />
          {errorCode ? (
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-destructive">
              {errorCode}
            </p>
          ) : null}
          <p className="font-sans text-[20px] font-bold text-foreground">
            {title ?? FULL_TITLE}
          </p>
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            {description ?? FULL_BODY}
          </p>
          {trace ? (
            <p className="break-all font-mono text-[10px] text-muted-foreground-subtle">
              {trace}
            </p>
          ) : null}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onReload}
              className="inline-flex items-center gap-2 bg-primary px-[18px] py-2.5 font-mono text-xs font-bold uppercase tracking-[0.08em] text-primary-foreground outline-none transition-colors hover:bg-[color:var(--color-primary-hover)] focus-visible:ring-2 focus-visible:ring-ring"
            >
              <RotateCw aria-hidden="true" className="size-3.5" />
              Reload
            </button>
            {onReport ? (
              <button
                type="button"
                onClick={onReport}
                className="inline-flex items-center gap-2 border border-border bg-transparent px-[18px] py-2.5 font-mono text-xs font-bold uppercase tracking-[0.08em] text-foreground outline-none transition-colors hover:border-border-hover focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Bug aria-hidden="true" className="size-3.5" />
                Report
              </button>
            ) : null}
          </div>
        </div>
      );
    }

    // retry variant — the lean route fallback.
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "flex w-full max-w-md flex-col items-center gap-4 border border-border bg-background p-8 text-center",
          className,
        )}
        {...props}
      >
        <AlertTriangle aria-hidden="true" className="size-12 text-destructive" />
        <p className="font-mono text-[15px] font-bold uppercase tracking-[0.1em] text-foreground">
          {title ?? RETRY_TITLE}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description ?? RETRY_BODY}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 bg-primary px-[18px] py-2.5 font-mono text-xs font-bold uppercase tracking-[0.08em] text-primary-foreground outline-none transition-colors hover:bg-[color:var(--color-primary-hover)] focus-visible:ring-2 focus-visible:ring-ring"
        >
          <RotateCw aria-hidden="true" className="size-3.5" />
          Retry
        </button>
      </div>
    );
  },
);
ErrorBoundaryFallback.displayName = "ErrorBoundaryFallback";

export { ErrorBoundaryFallback };
