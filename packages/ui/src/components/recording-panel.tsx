import * as React from "react";
import { Mic } from "lucide-react";

import { cn } from "../lib/utils";

/**
 * RecordingPanel — the active voice-capture surface (canonical `R6D1f3`). A
 * tactical Card carrying a REC dot + `RECORDING` label + mono mm:ss timer + a
 * live Waveform area, widened (screens win, GZ7xA) to also host a transcript and
 * the `PARSING INTENT…` cue under a $primary 3px left accent.
 *
 * PRESENTATIONAL + driven by props. The real canvas Waveform lives in `apps/web`
 * (VOICE-INFRA, lifted from camp `waveform.tsx`); this panel supplies the chrome
 * + a slot. Pass the painter via `children` (preferred) OR feed `amplitudes`
 * to render the lightweight built-in bar fallback.
 *
 * State → status channel (colour carried by dot + label text, never colour
 * alone):
 *   recording   → $destructive dot + `RECORDING`        (active capture)
 *   transcribing→ $warning dot + `TRANSCRIBING`         (showcase variant)
 *   parsing     → recording chrome + a `PARSING INTENT…` chip ($muted, $primary
 *                 dot) — the GZ7xA post-capture cue
 *
 * a11y: `role="status"` + `aria-live="polite"` announces the state + timer;
 * waveform bars are decorative (`aria-hidden`); bar animation honours
 * `prefers-reduced-motion`.
 */

export type RecordingPanelState = "recording" | "transcribing" | "parsing";

/** Dot/label/accent tone per state. parsing keeps the recording (destructive) header. */
const STATUS: Record<
  RecordingPanelState,
  { dot: string; label: string; labelColor: string }
> = {
  recording: {
    dot: "bg-destructive",
    label: "RECORDING",
    labelColor: "text-destructive",
  },
  transcribing: {
    dot: "bg-warning",
    label: "TRANSCRIBING",
    labelColor: "text-warning",
  },
  parsing: {
    dot: "bg-destructive",
    label: "RECORDING",
    labelColor: "text-destructive",
  },
};

export interface RecordingPanelProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Drives the dot/label tone + (parsing) the trailing intent chip. */
  state?: RecordingPanelState;
  /** Mono mm:ss timer, e.g. '00:07'. */
  elapsedLabel: string;
  /**
   * Live bar heights (0–1 or raw px) for the built-in fallback Waveform, used
   * only when no `children` painter is supplied. Canonical 40 bars; the GZ7xA
   * inline cue uses ~8. Each value maps to a $primary bar height.
   */
  amplitudes?: number[];
  /**
   * The real canvas Waveform (camp `waveform.tsx`) painted by the app. When
   * present it replaces the `amplitudes` fallback inside the waveform slot.
   */
  children?: React.ReactNode;
  /** Show the GZ7xA transcript block (eyebrow + transcript + parsing chip). */
  showTranscript?: boolean;
  /** Live transcript text (JetBrains Mono), shown under a `TRANSCRIPT` eyebrow. */
  transcript?: string;
  /**
   * GZ7xA "Voice Capture" treatment: $card-elevated shell behind a $primary 3px
   * left accent + a `VOICE CAPTURE` header. Off → the bare canonical card.
   */
  withAccent?: boolean;
}

/** Lightweight built-in bar fallback when the app doesn't supply a canvas painter. */
function WaveformBars({ amplitudes }: { amplitudes: number[] }) {
  // Treat values ≤1 as normalized (× track height); larger as raw px, capped.
  const TRACK = 34;
  return (
    <div
      aria-hidden="true"
      className="flex h-[34px] flex-1 items-center justify-center gap-[3px] overflow-hidden"
    >
      {amplitudes.map((a, i) => {
        const h = a <= 1 ? Math.max(2, Math.round(a * TRACK)) : Math.min(a, TRACK);
        return (
          <span
            key={i}
            className="w-1 shrink-0 bg-primary motion-reduce:!h-2"
            style={{ height: h }}
          />
        );
      })}
    </div>
  );
}

const RecordingPanel = React.forwardRef<HTMLDivElement, RecordingPanelProps>(
  (
    {
      state = "recording",
      elapsedLabel,
      amplitudes,
      children,
      showTranscript = false,
      transcript,
      withAccent = false,
      className,
      ...props
    },
    ref,
  ) => {
    const status = STATUS[state];
    const waveform =
      children ??
      (amplitudes ? <WaveformBars amplitudes={amplitudes} /> : null);

    const card = (
      <div
        ref={withAccent ? undefined : ref}
        role="status"
        aria-live="polite"
        className={cn(
          "flex w-full flex-col gap-3.5 border border-border bg-card p-4",
          withAccent && "gap-3 bg-card-elevated p-[18px]",
          // When accented, className lands on the outer wrapper instead.
          !withAccent && className,
        )}
        {...(withAccent ? {} : props)}
      >
        {/* Top row — status (dot + label) | timer. */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-[7px]">
            {withAccent ? (
              <Mic
                aria-hidden="true"
                className="size-3.5 text-primary"
              />
            ) : null}
            <span
              aria-hidden="true"
              className={cn("size-2 shrink-0 rounded-full", status.dot)}
            />
            <span
              className={cn(
                "font-mono text-micro font-bold uppercase leading-none tracking-[1.5px]",
                status.labelColor,
              )}
            >
              {withAccent ? "VOICE CAPTURE" : status.label}
            </span>
          </div>
          <span className="font-mono text-mono font-semibold leading-none tracking-[1px] text-foreground">
            {elapsedLabel}
          </span>
        </div>

        {/* Waveform slot — app-painted canvas (children) or the bar fallback. */}
        {waveform}

        {/* GZ7xA transcript block: eyebrow + transcript + parsing chip. */}
        {showTranscript ? (
          <div className="flex flex-col gap-2">
            <span className="font-mono text-micro uppercase leading-none tracking-[1.5px] text-muted-foreground-subtle">
              TRANSCRIPT
            </span>
            {transcript ? (
              <p className="font-mono text-subtitle leading-[1.55] text-foreground">
                {transcript}
              </p>
            ) : null}
          </div>
        ) : null}

        {/* Parsing-intent chip — the post-capture cue. */}
        {state === "parsing" ? (
          <div className="flex w-fit items-center gap-2 bg-muted px-[11px] py-[7px]">
            <span
              aria-hidden="true"
              className="size-1.5 shrink-0 rounded-full bg-primary motion-safe:animate-pulse"
            />
            <span className="font-mono text-micro uppercase leading-none tracking-[1.5px] text-primary">
              PARSING INTENT…
            </span>
          </div>
        ) : null}
      </div>
    );

    // GZ7xA "Voice Capture": a $primary 3px left accent via a real border-l.
    if (withAccent) {
      return (
        <div
          ref={ref}
          className={cn("w-full border-l-[3px] border-primary", className)}
          {...props}
        >
          {card}
        </div>
      );
    }
    return card;
  },
);
RecordingPanel.displayName = "RecordingPanel";

export { RecordingPanel };
