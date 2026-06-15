import * as React from "react";
import { SearchX, Mic, type LucideIcon } from "lucide-react";

import { cn } from "../lib/utils";

/**
 * ErrorStateCard — the advisory recovery/edge-state card for the voice-first
 * Task Agent (canonical `d2mdF`; AI Research "Errors & Edge States" catalog).
 *
 * Distinct from the destructive ErrorBoundary fallback: this is the calm card
 * shown when a research job fails, is uncertain, throttled, slow, partial, or
 * can't capture voice — the one place the agent surfaces recoverable actions.
 *
 * Two layouts (per the spec's two source frames):
 *  - `stripe` (default; canonical + mobile) — a 3px LEFT accent carries severity.
 *  - `top-accent` (desktop gallery) — a 2px TOP bar carries severity instead.
 * Severity `tone` drives the accent + the icon + header color together
 * (neutral / warning / destructive / primary). The one documented anomaly: a
 * `neutral` + `top-accent` card draws its top bar in `$border-hover` (a near-
 * invisible neutral) while icon/header stay `$muted-foreground`.
 *
 * Actions: pass `actions` (filled `primary` + `outline`, each with an optional
 * leading icon) for the catalog's recovery buttons. The legacy single
 * `actionLabel`/`onAction` (a Mic voice-retry button) is kept for back-compat.
 * `meta` renders the mono status line (e.g. "OFFLINE · LAST SYNC 2M AGO"); any
 * `children` (e.g. failed SourceRows, a keyboard fallback) render before actions.
 *
 * A11y: announces the condition — assertively (`role="alert"`) for the
 * `destructive` tone (a hard failure the user just hit, matching the Alert
 * convention), politely (`role="status"`) otherwise; overridable via `role`.
 * Icons are decorative (`aria-hidden`); each action is a real button with its
 * label as accessible name.
 */

export type ErrorStateTone = "neutral" | "warning" | "destructive" | "primary";

export interface ErrorStateAction {
  label: string;
  onClick?: () => void;
  /** `primary` = filled; `outline` = bordered/transparent (default). */
  variant?: "primary" | "outline";
  icon?: LucideIcon;
  disabled?: boolean;
}

export interface ErrorStateCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** UPPERCASE mono header. Default `NO RESULTS FOUND`. */
  header?: string;
  /** Advisory body sentence (DM Sans). */
  body: string;
  /** Leading icon. Default lucide `search-x`. */
  icon?: LucideIcon;
  /** Severity — drives the accent + icon + header color. Default `neutral`. */
  tone?: ErrorStateTone;
  /** Accent placement. Default `stripe` (left 3px); `top-accent` = desktop 2px top bar. */
  layout?: "stripe" | "top-accent";
  /** Mono status line under the body (e.g. countdown / offline / last-sync). */
  meta?: string;
  /** Recovery actions (preferred over the legacy single button). */
  actions?: ErrorStateAction[];
  /** Legacy single voice-retry action label (e.g. `SAY IT AGAIN`). */
  actionLabel?: string;
  /** Legacy retry click handler (only with `actionLabel`, and no `actions`). */
  onAction?: () => void;
}

// Full literal class strings per tone (Tailwind JIT can't see interpolated names).
const TONE: Record<
  ErrorStateTone,
  { text: string; stripe: string; top: string }
> = {
  neutral: {
    text: "text-muted-foreground",
    stripe: "border-l-muted-foreground",
    // D01 desktop anomaly: a neutral top accent reads as a near-invisible border.
    top: "border-t-border-hover",
  },
  warning: {
    text: "text-warning",
    stripe: "border-l-warning",
    top: "border-t-warning",
  },
  destructive: {
    text: "text-destructive",
    stripe: "border-l-destructive",
    top: "border-t-destructive",
  },
  primary: {
    text: "text-primary",
    stripe: "border-l-primary",
    top: "border-t-primary",
  },
};

function ActionButton({ action }: { action: ErrorStateAction }) {
  const Icon = action.icon;
  const filled = action.variant === "primary";
  return (
    <button
      type="button"
      onClick={action.onClick}
      disabled={action.disabled}
      className={cn(
        "inline-flex h-10 items-center gap-2 px-3 font-mono text-xs font-semibold uppercase tracking-[1px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60",
        filled
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "border border-border bg-transparent text-foreground hover:border-border-hover",
      )}
    >
      {Icon ? <Icon aria-hidden="true" className="size-3.5" /> : null}
      {action.label}
    </button>
  );
}

const ErrorStateCard = React.forwardRef<HTMLDivElement, ErrorStateCardProps>(
  (
    {
      header = "NO RESULTS FOUND",
      body,
      icon,
      tone = "neutral",
      layout = "stripe",
      meta,
      actions,
      actionLabel,
      onAction,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const Icon = icon ?? SearchX;
    const t = TONE[tone];
    return (
      <div
        ref={ref}
        // Destructive = a hard failure → announce assertively; otherwise polite.
        // Set before {...props} so a caller can still override the role.
        role={tone === "destructive" ? "alert" : "status"}
        className={cn(
          "flex flex-col gap-2.5 border border-border bg-card p-3.5",
          layout === "top-accent"
            ? cn("border-t-2", t.top)
            : cn("border-l-[3px]", t.stripe),
          className,
        )}
        {...props}
      >
        <div className="flex items-center gap-2">
          <Icon aria-hidden="true" className={cn("size-[15px]", t.text)} />
          <span
            className={cn(
              "font-mono text-[11px] font-bold uppercase tracking-[1.5px]",
              t.text,
            )}
          >
            {header}
          </span>
        </div>
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          {body}
        </p>
        {meta ? (
          <span className="font-mono text-[10px] uppercase tracking-[1px] text-muted-foreground-subtle">
            {meta}
          </span>
        ) : null}
        {children}
        {actions && actions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {actions.map((action, i) => (
              <ActionButton key={`${action.label}-${i}`} action={action} />
            ))}
          </div>
        ) : actionLabel ? (
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
