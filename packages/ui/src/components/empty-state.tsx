import * as React from "react";
import { CheckCheck, Mic, type LucideIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/utils";

/**
 * EmptyState — the signature voice-first placeholder (OpsBoard).
 *
 * A centered ⬡ hexagon motif (an outlined 6-sided polygon with an inner lucide
 * glyph — `mic` for missions, `check-check` for all-closed) over a mono UPPERCASE
 * message and a voice-first hint. Lives on a `$card` shell (canonical §8 signature)
 * or — for the runtime states gallery — on the bare `$background`.
 *
 * The CTA is a *voice instruction*, never a button → there is no interactive
 * control. Pure presentational leaf, server-safe (no "use client").
 *
 * - `surface`  : `card` ($card + 1px $border, the canon) vs `background`
 *                (the TvXzz states-gallery rendering, no border).
 * - `hintStyle`: `sentence` (a single DM Sans string) vs `tokens` (a mono
 *                `say` lead + a primary-coloured quoted command — the TvXzz row).
 *
 * A11y: `role="status"` announces the empty condition + voice instruction; the
 * hexagon + inner glyph are decorative (`aria-hidden`); the Msg/Hint text carries
 * the meaning. Window-state / status are not encoded here — copy directs the user
 * to the voice FAB.
 */

type EmptyStateVariant = "no-missions" | "no-tasks";

/** Per-variant defaults: inner hex glyph + the voice-first copy (UNION). */
const VARIANT_META: Record<
  EmptyStateVariant,
  { icon: LucideIcon; message: string; hint: string }
> = {
  // mic + the canonical no-missions copy.
  "no-missions": {
    icon: Mic,
    message: "NO MISSIONS YET",
    hint: 'Say "create a mission" to get started.',
  },
  // check-check + the showcase all-closed copy.
  "no-tasks": {
    icon: CheckCheck,
    message: "ALL TASKS CLOSED",
    hint: 'Say "add a task" to keep going.',
  },
};

const emptyStateVariants = cva(
  // Card shell recipe: sharp (radius-0), vertical, centered, padding [48,24],
  // gap 16. clip the motif. Surface is selected below.
  "relative flex flex-col items-center gap-4 overflow-hidden px-6 py-12 text-center",
  {
    variants: {
      surface: {
        // canon: $card fill + 1px $border + e1 elevation.
        card: "border border-border bg-card shadow-e1",
        // TvXzz gallery: bare $background, no border.
        background: "bg-background",
      },
    },
    defaultVariants: {
      surface: "card",
    },
  },
);

export interface EmptyStateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof emptyStateVariants> {
  /** Selects the default inner glyph + copy. */
  variant?: EmptyStateVariant;
  /** Override the UPPERCASE mono message (e.g. NO MISSIONS YET / ALL TASKS CLOSED). */
  message?: string;
  /** Voice-first hint copy (the spoken command to run). */
  hint?: string;
  /** Inner hex glyph override (defaults per variant: mic / check-check). */
  icon?: LucideIcon;
  /** `sentence` = single DM Sans string; `tokens` = mono `say` + primary quote. */
  hintStyle?: "sentence" | "tokens";
}

/**
 * Split a hint into a `say`-lead + quoted command for the `tokens` style.
 * Falls back to the whole string as the quoted token when no quotes are found.
 */
function splitHint(hint: string): { lead: string; quote: string } {
  const match = hint.match(/^(.*?)["“']([^"”']+)["”']/);
  if (match && match[2]) {
    return { lead: match[1]?.trim() || "say", quote: match[2] };
  }
  return { lead: "say", quote: hint };
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      className,
      variant = "no-missions",
      message,
      hint,
      icon,
      surface,
      hintStyle = "sentence",
      ...props
    },
    ref,
  ) => {
    const meta = VARIANT_META[variant];
    const Icon = icon ?? meta.icon;
    const msg = message ?? meta.message;
    const hintText = hint ?? meta.hint;

    return (
      <div
        ref={ref}
        role="status"
        className={cn(emptyStateVariants({ surface }), className)}
        {...props}
      >
        {/* ⬡ Hex motif (60×60): outlined 6-sided polygon + centered inner glyph. */}
        <span
          aria-hidden="true"
          className="relative flex size-[60px] shrink-0 items-center justify-center"
        >
          <svg
            viewBox="0 0 60 60"
            className="absolute inset-0 size-full text-muted-foreground-subtle"
            fill="none"
          >
            <polygon
              points="30,2 53.5,16 53.5,44 30,58 6.5,44 6.5,16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
          <Icon className="size-[22px] text-muted-foreground-subtle" />
        </span>

        {/* Text block: UPPERCASE mono message + voice-first hint. */}
        <div className="flex flex-col items-center gap-1.5">
          <p className="font-mono text-mono font-bold uppercase tracking-[1.5px] text-foreground">
            {msg}
          </p>
          {hintStyle === "tokens" ? (
            <p className="font-mono text-label text-muted-foreground-subtle">
              {(() => {
                const { lead, quote } = splitHint(hintText);
                return (
                  <>
                    {lead}{" "}
                    <span className="font-semibold text-primary">
                      &ldquo;{quote}&rdquo;
                    </span>
                  </>
                );
              })()}
            </p>
          ) : (
            <p className="text-label text-muted-foreground">{hintText}</p>
          )}
        </div>
      </div>
    );
  },
);
EmptyState.displayName = "EmptyState";

export { EmptyState, emptyStateVariants };
