import * as React from "react";
import { Info, Search, Sparkles } from "lucide-react";

import { cn } from "../lib/utils";

/**
 * ConfirmBar — the CUE RESEARCH consent gate (write-gate #1): the user reviews
 * the parsed intent, then explicitly cues the research job (never auto-fired).
 *
 * Two structurally distinct renderings (not a recolour):
 *  - `variant='bar'` (desktop B.2.4, `Zbq2s`): a horizontal `$muted` bar with a
 *    1px `$border`, space-between — left a `info` + Mono hint (~520px), right a
 *    `$card` CANCEL + the `$primary` CUE RESEARCH CTA (lucide `sparkles`).
 *  - `variant='stacked'` (mobile C.2.4, `Wc7Tp`): a vertical gap-8 stack — a
 *    full-width 50px `$primary` CUE RESEARCH (lucide `search`, NOT `sparkles`)
 *    over a 44px ghost CANCEL over a centered, subtler Mono hint.
 *
 * Controlled presentational leaf: both actions arrive as `on*` props; no state.
 * Server-safe (no "use client").
 */
export interface ConfirmBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Fired when the user cues the research job (the write-gate consent). */
  onConfirm: () => void;
  /** Fired when the user backs out without cueing. */
  onCancel: () => void;
  /** Primary CTA label. Default `CUE RESEARCH`. */
  confirmLabel?: string;
  /** Cancel button label. Default `CANCEL`. */
  cancelLabel?: string;
  /** Advisory hint (Mono). Omit to render no hint. */
  hint?: string;
  /** `bar` = desktop horizontal bar; `stacked` = mobile vertical CTA group. */
  variant?: "bar" | "stacked";
}

const ConfirmBar = React.forwardRef<HTMLDivElement, ConfirmBarProps>(
  (
    {
      onConfirm,
      onCancel,
      confirmLabel = "CUE RESEARCH",
      cancelLabel = "CANCEL",
      hint,
      variant = "bar",
      className,
      ...props
    },
    ref,
  ) => {
    if (variant === "stacked") {
      return (
        <div
          ref={ref}
          className={cn("flex flex-col gap-2", className)}
          {...props}
        >
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex h-[50px] w-full items-center justify-center gap-2 bg-primary px-4 font-mono text-[13px] font-bold uppercase tracking-[1px] text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Search aria-hidden="true" className="size-4" />
            {confirmLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-11 w-full items-center justify-center px-4 font-mono text-xs font-semibold uppercase tracking-[1px] text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            {cancelLabel}
          </button>
          {hint ? (
            <p className="text-center font-mono text-[10px] font-medium leading-[1.4] tracking-[0.5px] text-muted-foreground-subtle">
              {hint}
            </p>
          ) : null}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-between gap-4 border border-border bg-muted px-5 py-4",
          className,
        )}
        {...props}
      >
        {hint ? (
          <div className="flex max-w-[520px] items-center gap-[9px]">
            <Info
              aria-hidden="true"
              className="size-3.5 shrink-0 text-muted-foreground-subtle"
            />
            <span className="font-mono text-[11px] leading-[1.5] tracking-[0.5px] text-muted-foreground">
              {hint}
            </span>
          </div>
        ) : (
          <span />
        )}
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center border border-border bg-card px-5 py-3 font-mono text-xs font-bold uppercase tracking-[1.5px] text-muted-foreground outline-none transition-colors hover:border-border-hover focus-visible:ring-2 focus-visible:ring-ring"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-[9px] bg-primary px-[22px] py-3 font-mono text-xs font-bold uppercase tracking-[1.5px] text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Sparkles aria-hidden="true" className="size-[15px]" />
            {confirmLabel}
          </button>
        </div>
      </div>
    );
  },
);
ConfirmBar.displayName = "ConfirmBar";

export { ConfirmBar };
