import * as React from "react";
import { Loader, type LucideIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/utils";

/**
 * Spinner — inline processing indicator (LIFT from camp-404 `spinner.tsx`,
 * re-skinned to OpsBoard tokens). A spinning lucide `loader` glyph (orange
 * `$primary` by default) beside an optional mono UPPERCASE label.
 *
 * Used for the voice **processing** state (`PROCESSING COMMAND…`) and
 * transient sync ops (`SYNCING MISSION…`) — deliberately separate from
 * `Skeleton`, which carries board/list load (design-brief §10 taxonomy).
 *
 * Variants the contract unions:
 * - `glyph: 'loader'` — lucide loader-circle (default); `'arc'` — the partial
 *   -ring ellipse reused across the AI Research job panels.
 * - `tone: 'primary' | 'muted'` — glyph colour.
 * - `size` — icon px (20 inline · ~30 in the voice FAB cell).
 * - `showLabel=false` + `icon` override — the icon-only 30px FAB processing cell.
 *
 * Presentational leaf — no React state. The spin is pure CSS (`animate-spin`),
 * and `motion-reduce:animate-none` honours `prefers-reduced-motion` (a11y:
 * static glyph fallback). `role="status"` + `aria-live="polite"` announce the
 * operation via the label; the glyph itself is decorative (`aria-hidden`).
 */
const spinnerGlyphVariants = cva("shrink-0 animate-spin motion-reduce:animate-none", {
  variants: {
    tone: {
      primary: "text-primary",
      muted: "text-muted-foreground",
    },
  },
  defaultVariants: {
    tone: "primary",
  },
});

const spinnerLabelVariants = cva(
  "font-mono text-caption uppercase leading-none tracking-[1px]",
  {
    variants: {
      tone: {
        primary: "text-muted-foreground",
        muted: "text-muted-foreground",
      },
    },
    defaultVariants: {
      tone: "primary",
    },
  },
);

/** The AI Research partial-ring "arc" spinner glyph (drift: GZ7xA boards). */
function ArcGlyph({
  size,
  className,
}: {
  size: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* faint full track */}
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeOpacity="0.2"
      />
      {/* bright leading arc (~90° sweep) */}
      <path
        d="M12 3a9 9 0 0 1 9 9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export interface SpinnerProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color">,
    VariantProps<typeof spinnerGlyphVariants> {
  /**
   * Mono UPPERCASE label (PROCESSING COMMAND… / SYNCING MISSION…). When
   * omitted, an `aria-label` should be provided for the screen-reader name.
   */
  label?: string;
  /** Hide the label for icon-only use (voice FAB cell). Default true. */
  showLabel?: boolean;
  /** Icon size in px. 20 inline (default) · ~30 in the voice FAB cell. */
  size?: number;
  /** 'loader' = lucide loader (default); 'arc' = AI Research partial-ring ellipse. */
  glyph?: "loader" | "arc";
  /** Override the lucide glyph (e.g. the voice FAB's `loader`). 'loader' glyph only. */
  icon?: LucideIcon;
}

function Spinner({
  label,
  showLabel = true,
  size = 20,
  glyph = "loader",
  icon: Icon = Loader,
  tone,
  className,
  ...props
}: SpinnerProps) {
  const glyphClass = spinnerGlyphVariants({ tone });
  const hasLabel = showLabel && Boolean(label);

  return (
    <span
      role="status"
      aria-live="polite"
      className={cn("inline-flex items-center gap-2.5", className)}
      {...props}
    >
      {glyph === "arc" ? (
        <ArcGlyph size={size} className={glyphClass} />
      ) : (
        <Icon size={size} aria-hidden="true" className={glyphClass} />
      )}
      {hasLabel ? (
        <span className={spinnerLabelVariants({ tone })}>{label}</span>
      ) : (
        <span className="sr-only">{label ?? "Loading"}</span>
      )}
    </span>
  );
}

export {
  Spinner,
  spinnerGlyphVariants,
  spinnerLabelVariants,
};
