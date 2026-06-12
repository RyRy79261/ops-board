import * as React from "react";
import { SearchX, Mic, type LucideIcon } from "lucide-react";

import { cn } from "../lib/utils";

/**
 * ErrorStateCard — the calm, advisory "no results" card (canonical `d2mdF`).
 *
 * Distinct from the destructive ErrorBoundary fallback: this is the muted,
 * left-3px-accent voice-retry card shown for search/voice *no-results* (NOT a
 * crash). Anatomy (`04-voice-ai.md` §ErrorStateCard, canonical): a `$card` card
 * with a 3px `$muted-foreground` LEFT accent → a top row (lucide `search-x` 15 +
 * `NO RESULTS FOUND` mono 11/700 ls1.5), a DM Sans 13 body, and an optional
 * transparent `mic` + `SAY IT AGAIN` retry button.
 *
 * (The AI Research surface later WIDENS this to a top-accent, 8-variant form —
 * out of scope here; this is the canonical advisory rendering.)
 *
 * A11y: `role="status"` announces the no-results condition + voice instruction;
 * the icon is decorative (`aria-hidden`). The retry button, when present, is a
 * real button with the label as its accessible name.
 */
export interface ErrorStateCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** UPPERCASE mono header. Default `NO RESULTS FOUND`. */
  header?: string;
  /** Advisory body sentence (DM Sans). */
  body: string;
  /** Leading icon. Default lucide `search-x`. */
  icon?: LucideIcon;
  /** Voice-retry action label (e.g. `SAY IT AGAIN`). Omit to render no button. */
  actionLabel?: string;
  /** Click handler for the retry button (only rendered when `actionLabel` is set). */
  onAction?: () => void;
}

const ErrorStateCard = React.forwardRef<HTMLDivElement, ErrorStateCardProps>(
  (
    {
      header = "NO RESULTS FOUND",
      body,
      icon,
      actionLabel,
      onAction,
      className,
      ...props
    },
    ref,
  ) => {
    const Icon = icon ?? SearchX;
    return (
      <div
        ref={ref}
        role="status"
        className={cn(
          "flex flex-col gap-2.5 border border-l-[3px] border-border border-l-muted-foreground bg-card p-3.5",
          className,
        )}
        {...props}
      >
        <div className="flex items-center gap-2">
          <Icon
            aria-hidden="true"
            className="size-[15px] text-muted-foreground"
          />
          <span className="font-mono text-[11px] font-bold uppercase tracking-[1.5px] text-muted-foreground">
            {header}
          </span>
        </div>
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          {body}
        </p>
        {actionLabel ? (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex h-10 items-center gap-2 self-start border border-border bg-transparent px-3 font-mono text-xs font-semibold uppercase tracking-[1px] text-foreground outline-none transition-colors hover:border-border-hover focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Mic aria-hidden="true" className="size-3.5" />
            {actionLabel}
          </button>
        ) : null}
      </div>
    );
  },
);
ErrorStateCard.displayName = "ErrorStateCard";

export { ErrorStateCard };
