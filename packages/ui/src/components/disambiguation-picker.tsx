import * as React from "react";
import {
  Backpack,
  ChevronRight,
  Cpu,
  FileText,
  GitFork,
  Mic,
  Plane,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

import { cn } from "../lib/utils";
import { confidenceTone, CONFIDENCE_TEXT } from "../lib/confidence";

/**
 * DisambiguationPicker — the multi-match "pick one" surface shown when a parse
 * resolves to >1 candidate task (`03-surfaces/ai-research.md`, desktop `heaiU`
 * / mobile `Fux3f`). A presentational, CONTROLLED leaf: every candidate row is a
 * real `<button>` that calls `onPick(id)`; the live state (which is selected,
 * each confidence %) arrives entirely as props.
 *
 * Two renderings share one prop shape via `variant`:
 *  - `panel` (desktop, AUTHORITATIVE) — a `$card` bordered panel: a `git-fork`
 *    `$warning` header + Mono title, then `$card-elevated` candidate rows where
 *    the SELECTED/top match gets a `$primary` border and the % is BANDED by the
 *    shared confidence→tone helper (success / warning / muted).
 *  - `screen` (mobile) — full-width tappable `$card` cards with a `chevron-right`
 *    affordance, a `$primary` `git-fork` + `WHICH TASK?` prompt, NEUTRAL muted
 *    `NN% MATCH` pills (no banding, no top-match border), and a `mic`
 *    `SAY IT AGAIN` retry row.
 *
 * Presentational leaf (no state) → server-safe, no "use client".
 */
type Category = "medical" | "bureaucratic" | "travel" | "gear" | "tech";

const CATEGORY_META: Record<Category, { icon: LucideIcon; label: string }> = {
  medical: { icon: Stethoscope, label: "MEDICAL" },
  bureaucratic: { icon: FileText, label: "BUREAUCRATIC" },
  travel: { icon: Plane, label: "TRAVEL" },
  gear: { icon: Backpack, label: "GEAR" },
  tech: { icon: Cpu, label: "TECH" },
};

const DOT_TONE: Record<Category, string> = {
  medical: "bg-cat-medical",
  bureaucratic: "bg-cat-bureaucratic",
  travel: "bg-cat-travel",
  gear: "bg-cat-gear",
  tech: "bg-cat-tech",
};

const CAT_TEXT: Record<Category, string> = {
  medical: "text-cat-medical",
  bureaucratic: "text-cat-bureaucratic",
  travel: "text-cat-travel",
  gear: "text-cat-gear",
  tech: "text-cat-tech",
};

const CAT_PILL: Record<Category, string> = {
  medical: "bg-cat-medical/12 text-cat-medical",
  bureaucratic: "bg-cat-bureaucratic/12 text-cat-bureaucratic",
  travel: "bg-cat-travel/12 text-cat-travel",
  gear: "bg-cat-gear/12 text-cat-gear",
  tech: "bg-cat-tech/12 text-cat-tech",
};

export interface DisambiguationCandidate {
  /** Stable id — passed to `onPick`. */
  id: string;
  /** The candidate task name (DM Sans). */
  name: string;
  /** Drives the dot hue, caption colour, and the mobile category pill. */
  category: Category;
  /** Mono caption under the name on desktop (e.g. `BUREAUCRATIC`). */
  caption?: string;
  /** Match confidence as a 0–100 percentage. */
  confidence: number;
  /** The selected/top-match row — desktop gets a `$primary` border. */
  selected?: boolean;
}

export interface DisambiguationPickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** The pick prompt — the Mono title (panel) / DM Sans body (screen). */
  prompt: string;
  /** The candidate tasks to choose from. Each renders a tappable button. */
  candidates: DisambiguationCandidate[];
  /** Fired with the candidate `id` when a row is chosen. */
  onPick: (id: string) => void;
  /** Mobile `SAY IT AGAIN` retry handler. Omit to hide the retry row. */
  onRetry?: () => void;
  /** `panel` = desktop (default, authoritative); `screen` = mobile. */
  variant?: "panel" | "screen";
}

const DisambiguationPicker = React.forwardRef<
  HTMLDivElement,
  DisambiguationPickerProps
>(
  (
    { prompt, candidates, onPick, onRetry, variant = "panel", className, ...props },
    ref,
  ) => {
    if (variant === "screen") {
      return (
        <div
          ref={ref}
          className={cn(
            "flex flex-col gap-4 bg-background p-[18px]",
            className,
          )}
          {...props}
        >
          {/* Prompt: $primary git-fork + WHICH TASK? over the DM Sans body. */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-[7px]">
              <GitFork
                aria-hidden="true"
                className="size-3.5 shrink-0 text-primary"
              />
              <span className="font-mono text-[11px] font-bold uppercase tracking-[1.5px] text-primary">
                Which task?
              </span>
            </div>
            <p className="text-[14px] leading-[1.45] text-foreground">{prompt}</p>
          </div>

          {/* Picks: full-width tappable cards with a chevron-right affordance. */}
          <div className="flex flex-col gap-2.5">
            {candidates.map((c) => {
              const { icon: CatIcon, label } = CATEGORY_META[c.category];
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onPick(c.id)}
                  className="flex flex-col gap-[9px] border border-border bg-card p-3.5 text-left outline-none transition-colors hover:border-border-hover focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-foreground">
                      {c.name}
                    </span>
                    <ChevronRight
                      aria-hidden="true"
                      className="size-[18px] shrink-0 text-muted-foreground"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2 py-[3px] font-mono text-[10px] font-bold uppercase tracking-[0.5px]",
                        CAT_PILL[c.category],
                      )}
                    >
                      <CatIcon
                        aria-hidden="true"
                        className="size-[11px] shrink-0"
                      />
                      {c.caption ?? label}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-muted-foreground/12 px-2 py-[3px] font-mono text-[10px] font-bold uppercase tracking-[0.5px] text-muted-foreground">
                      {c.confidence}% Match
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Retry: full-width mic + SAY IT AGAIN. */}
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="flex h-[46px] items-center justify-center gap-2 border border-border bg-transparent font-mono text-xs font-semibold uppercase tracking-[1px] text-muted-foreground outline-none transition-colors hover:border-border-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Mic aria-hidden="true" className="size-[15px]" />
              Say it again
            </button>
          ) : null}
        </div>
      );
    }

    // Desktop `panel` (authoritative).
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-[14px] border border-border bg-card p-[18px]",
          className,
        )}
        {...props}
      >
        {/* DHead: $warning git-fork + DISAMBIGUATION. */}
        <div className="flex items-center gap-[9px]">
          <GitFork
            aria-hidden="true"
            className="size-[15px] shrink-0 text-warning"
          />
          <span className="font-mono text-[12px] uppercase tracking-[1.5px] text-warning">
            Disambiguation
          </span>
        </div>

        {/* DTitle: Mono 13/700 foreground. */}
        <p className="font-mono text-[13px] font-bold leading-[1.4] tracking-[0.5px] text-foreground">
          {prompt}
        </p>

        {/* Candidates: each a tappable $card-elevated row, banded confidence %. */}
        <div className="flex flex-col gap-2.5">
          {candidates.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onPick(c.id)}
              className={cn(
                "flex items-center justify-between gap-3 border bg-card-elevated px-3.5 py-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                c.selected
                  ? "border-primary"
                  : "border-border hover:border-border-hover",
              )}
            >
              <div className="flex min-w-0 items-center gap-[11px]">
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-[9px] shrink-0 rounded-full",
                    DOT_TONE[c.category],
                  )}
                />
                <div className="flex min-w-0 flex-col gap-[3px]">
                  <span className="truncate text-[14px] font-medium text-foreground">
                    {c.name}
                  </span>
                  <span
                    className={cn(
                      "truncate font-mono text-[10px] uppercase tracking-[1px]",
                      CAT_TEXT[c.category],
                    )}
                  >
                    {c.caption ?? CATEGORY_META[c.category].label}
                  </span>
                </div>
              </div>
              <span
                className={cn(
                  "shrink-0 font-mono text-[14px] font-bold",
                  CONFIDENCE_TEXT[confidenceTone(c.confidence)],
                )}
              >
                {c.confidence}%
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  },
);
DisambiguationPicker.displayName = "DisambiguationPicker";

export { DisambiguationPicker };
