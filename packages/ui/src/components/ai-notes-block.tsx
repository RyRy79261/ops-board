import * as React from "react";
import {
  Check,
  ExternalLink,
  List,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { cn } from "../lib/utils";
import { Badge } from "./badge";
import { CitationChip } from "./citation-chip";
import { SourceRow } from "./source-row";

/**
 * AINotesBlock — the AI-authored research read-out + the KEEP NOTES write-gate
 * (`03-surfaces/ai-research.md` §2 B2 `L6TvtJ` desktop / §3 B2 `gfPA3` mobile).
 *
 * The bespoke completed-research payload: a `$card` card with a 2px `$primary`
 * LEFT stroke holding (1) an attribution row + optional NEW pill, (2) a summary,
 * (3) numbered steps with citations, (4) an embedded SOURCES list, and (5) the
 * affordances row. KEEP NOTES is the single explicit write-gate that appends the
 * proposed notes to `tasks.notes`; DISMISS discards them (no write); VIEW SOURCES
 * / OPEN ALL SOURCES open external links only.
 *
 * Two render modes per the board divergence:
 *  - `desktop` — citations are discrete `CitationChip` chips; affordances sit on
 *    one space-between row (KEEP NOTES + DISMISS left, VIEW SOURCES right).
 *  - `mobile` — citations are INLINE bracketed text appended to the step prose;
 *    affordances stack with a full-width OPEN ALL SOURCES.
 *
 * COMPOSES CitationChip / SourceRow / Badge. Presentational, CONTROLLED leaf:
 * actions arrive as `on*` handlers; nothing is computed → server-safe, no
 * "use client", no hooks.
 */

/** One numbered result step + its 1-based citation indices into `sources`. */
export interface AINotesStep {
  /** 1-based step number rendered in the Num badge. */
  index: number;
  /** Step prose (DM Sans 14, relaxed line-height). */
  text: string;
  /** 1-based indices into `sources[]` for this step's citations. */
  citations: number[];
}

/** One source in the embedded SOURCES list. */
export interface AINotesSource {
  /** 1-based source index (citations reference this). */
  index: number;
  /** Source hostname (e.g. `tankwatown.org`). */
  domain: string;
  /** Source title (DM Sans, fill). */
  title: string;
  /** Source URL — when set, the external-link icon opens it in a new tab. */
  url?: string;
  /** Tailwind background class for the favicon dot (e.g. `bg-cat-bureaucratic`). */
  faviconTone?: string;
}

export interface AINotesBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Note count embedded in the attribution string (`AI RESEARCH · {n} NOTES`). */
  noteCount: number;
  /** Pre-formatted timestamp (e.g. `2026-06-03 14:22`). The leaf never computes it. */
  timestamp: string;
  /** Renders the `NEW` accent pill in the attribution row. */
  isNew?: boolean;
  /** Summary sentence (DM Sans 14, relaxed). */
  summary: string;
  /** Numbered result steps with citations. */
  steps: AINotesStep[];
  /** Embedded SOURCES list (1-based, citation targets). */
  sources: AINotesSource[];
  /** KEEP NOTES — the explicit write-gate. Omit (with onDismiss) for READ-ONLY display of already-kept notes. */
  onKeep?: () => void;
  /** DISMISS — discards the proposed notes (no write). Omit (with onKeep) for read-only display. */
  onDismiss?: () => void;
  /** VIEW SOURCES / OPEN ALL SOURCES — opens external links only. */
  onViewSources?: () => void;
  /** Leading attribution glyph. Default lucide `sparkles`. */
  attributionIcon?: LucideIcon;
  /** `desktop` = chip citations + inline affordances; `mobile` = inline citations + stacked affordances. */
  variant?: "desktop" | "mobile";
}

const AINotesBlock = React.forwardRef<HTMLDivElement, AINotesBlockProps>(
  (
    {
      noteCount,
      timestamp,
      isNew = false,
      summary,
      steps,
      sources,
      onKeep,
      onDismiss,
      onViewSources,
      attributionIcon,
      variant = "desktop",
      className,
      ...props
    },
    ref,
  ) => {
    const isMobile = variant === "mobile";
    const AttribIcon = attributionIcon ?? Sparkles;
    // Desktop inlines the timestamp into the attribution string; mobile splits it
    // onto its own muted Date row.
    const attribution = isMobile
      ? `AI RESEARCH · ${noteCount} NOTES`
      : `AI RESEARCH · ${noteCount} NOTES · ${timestamp}`;

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col border-l-2 border-l-primary bg-card",
          isMobile ? "gap-[13px] p-4" : "gap-[18px] p-[18px_22px]",
          className,
        )}
        {...props}
      >
        {/* 1. Attribution row */}
        <div className="flex items-center justify-between gap-2">
          <div
            className={cn(
              "flex min-w-0 items-center",
              isMobile ? "gap-[7px]" : "gap-[9px]",
            )}
          >
            <AttribIcon
              aria-hidden="true"
              className={cn(
                "shrink-0 text-primary",
                isMobile ? "size-3.5" : "size-4",
              )}
            />
            <span
              className={cn(
                "truncate font-mono font-bold text-primary",
                isMobile
                  ? "text-[10px] tracking-[1.5px]"
                  : "text-[12px] tracking-[1px]",
              )}
            >
              {attribution}
            </span>
          </div>
          {isNew ? <Badge variant="accent">NEW</Badge> : null}
        </div>

        {/* Mobile: timestamp split onto its own Date row. */}
        {isMobile ? (
          <span className="font-mono text-[10px] font-medium text-muted-foreground-subtle">
            Added {timestamp}
          </span>
        ) : null}

        {/* 2. Summary */}
        <p className="text-[14px] leading-relaxed text-foreground">{summary}</p>

        {/* 3. Numbered steps. `role="list"` is REQUIRED: Safari/VoiceOver strips
            the implicit list role when `list-style: none` is applied, so without
            it the steps lose their "list, N items" announcement. The numeric badge
            is aria-hidden, so each step also carries an sr-only ordinal below. */}
        <ol
          role="list"
          className={cn(
            "flex list-none flex-col",
            isMobile ? "gap-[11px]" : "gap-[14px]",
          )}
        >
          {steps.map((step) => (
            <li
              key={step.index}
              className={cn("flex items-start", isMobile ? "gap-2.5" : "gap-3")}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "flex shrink-0 items-center justify-center font-mono font-bold text-primary",
                  isMobile
                    ? "size-5 bg-primary/12 text-[11px]"
                    : "size-6 border border-border bg-card-elevated text-[12px]",
                )}
              >
                {step.index}
              </span>
              <div
                className={cn(
                  "flex min-w-0 flex-col",
                  isMobile ? "gap-0" : "gap-1.5",
                )}
              >
                <p
                  className={cn(
                    "text-[14px] text-foreground",
                    isMobile ? "leading-[1.45]" : "leading-relaxed",
                  )}
                >
                  <span className="sr-only">{`Step ${step.index}: `}</span>
                  {step.text}
                  {/* Mobile appends citations as inline bracket text. */}
                  {isMobile
                    ? step.citations.map((index) => (
                        <React.Fragment key={index}>
                          {" "}
                          <CitationChip index={index} renderMode="inline" />
                        </React.Fragment>
                      ))
                    : null}
                </p>
                {/* Desktop renders citations as discrete bordered chips. */}
                {!isMobile && step.citations.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {step.citations.map((index) => (
                      <CitationChip
                        key={index}
                        index={index}
                        renderMode="chip"
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ol>

        {/* 4. Sources */}
        <div
          className={cn(
            "flex flex-col",
            isMobile
              ? "gap-[11px] border-t border-border pt-[13px]"
              : "gap-1 border-t border-border pt-4",
          )}
        >
          <span
            className={cn(
              "font-mono font-bold uppercase text-muted-foreground-subtle",
              isMobile
                ? "text-[9px] font-semibold tracking-[1.5px]"
                : "text-[11px] tracking-[2px]",
            )}
          >
            Sources
          </span>
          <div className="flex flex-col">
            {sources.map((source, i) => (
              <SourceRow
                key={source.index}
                domain={source.domain}
                title={source.title}
                href={source.url}
                faviconTone={source.faviconTone}
                divider={!isMobile && i > 0}
              />
            ))}
          </div>
        </div>

        {/* 5. Affordances — omitted in READ-ONLY mode (no onKeep/onDismiss). */}
        {onKeep && onDismiss ? (
          isMobile ? (
            <div className="flex flex-col gap-2 border-t border-border pt-[13px]">
              {/* Guard the sources button on its own handler: a button that does
                  nothing on activation is an a11y smell. */}
              {onViewSources ? (
                <button
                  type="button"
                  onClick={onViewSources}
                  className="inline-flex h-[46px] w-full items-center justify-center gap-2 border border-border bg-secondary font-mono text-[12px] font-semibold uppercase tracking-[1px] text-foreground outline-none transition-colors hover:border-border-hover focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <List aria-hidden="true" className="size-[15px]" />
                  Open all sources
                </button>
              ) : null}
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={onDismiss}
                  className="inline-flex h-12 flex-1 items-center justify-center border border-border bg-transparent font-mono text-[12px] font-semibold uppercase tracking-[1px] text-muted-foreground outline-none transition-colors hover:border-border-hover focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  onClick={onKeep}
                  className="inline-flex h-12 flex-1 items-center justify-center gap-2 bg-primary font-mono text-[12px] font-bold uppercase tracking-[1px] text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Check aria-hidden="true" className="size-4" />
                  Keep notes
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onKeep}
                  className="inline-flex items-center gap-[7px] bg-primary px-[18px] py-2.5 font-mono text-[12px] font-bold uppercase tracking-[1px] text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Check aria-hidden="true" className="size-3.5" />
                  Keep notes
                </button>
                <button
                  type="button"
                  onClick={onDismiss}
                  className="inline-flex items-center gap-[7px] bg-transparent px-4 py-2.5 font-mono text-[12px] font-bold uppercase tracking-[1px] text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Dismiss
                </button>
              </div>
              {onViewSources ? (
                <button
                  type="button"
                  onClick={onViewSources}
                  className="inline-flex shrink-0 items-center gap-[7px] border border-border bg-secondary px-4 py-2.5 font-mono text-[12px] font-bold uppercase tracking-[1px] text-foreground outline-none transition-colors hover:border-border-hover focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <ExternalLink aria-hidden="true" className="size-3.5" />
                  View sources
                </button>
              ) : null}
            </div>
          )
        ) : null}
      </div>
    );
  },
);
AINotesBlock.displayName = "AINotesBlock";

export { AINotesBlock };
