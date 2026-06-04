"use client";

import * as React from "react";
import { Loader, Mic, Square, TriangleAlert } from "lucide-react";

import { cn } from "../lib/utils";

/**
 * VoiceFAB — the floating circular mic button (canonical `F36g7L`); the ONE
 * direct-input affordance on an otherwise read-only board. Fixed bottom-right on
 * BOTH desktop and mobile (brief §11.1), `z-150`, raised above the Toaster, with
 * a `padding-bottom: env(safe-area-inset-bottom)` safe-area inset on mobile.
 *
 * PRESENTATIONAL + CONTROLLED — it owns no recorder/permission state. The
 * `use-voice-recorder` hookup and the `/api/voice/command` POST happen in the
 * app (VOICE-INFRA); this component only renders a `state` and forwards pointer
 * events so the app can drive push-to-talk (pointerDown→record, pointerUp/
 * Leave/Cancel→stop) OR tap-to-toggle (`onPress`). It NEVER appends text to a
 * field (brief §11). Keep `@opsboard/ui` framework-agnostic.
 *
 * Canonical idle is a single tree; SCREENS WIN → widened to a 5-value `state`:
 *   idle        → $primary button, lucide `mic`, static $primary pulse ring,
 *                 `TAP TO RECORD` ($muted-foreground)
 *   requesting  → (brief §11, no board art) $primary button, spinning `loader`,
 *                 `ALLOW MICROPHONE…` ($muted-foreground)
 *   recording   → $destructive button, lucide `square`, animated $destructive
 *                 pulse ring (the "sharp" stroked ring, NOT a soft glow),
 *                 `● TAP TO STOP` ($destructive)
 *   processing  → $muted button + 1px $border, spinning `loader` ($primary),
 *                 ring hidden, `TRANSCRIBING…` ($muted-foreground)
 *   error       → $muted button + $destructive stroke, lucide `triangle-alert`,
 *                 a 64×2 $destructive underline bar, `TAP TO RETRY`
 *                 ($destructive); the failure is announced via an assertive
 *                 `role="alert"` text region (NOT on the button — a button may
 *                 not carry role="alert", axe `aria-allowed-role`).
 *
 * a11y: state-reflecting `aria-label` on the plain `button`; the error state
 * announces assertively through the hint/sr-only `role="alert"` live region;
 * ≥44px target (default 56px); pulse ring is decorative (`aria-hidden`). The
 * pulse + loader spin honour `prefers-reduced-motion` (frozen via `motion-reduce:*`).
 */

export type VoiceFabState =
  | "idle"
  | "requesting"
  | "recording"
  | "processing"
  | "error";

/** Per-state default hint copy (board-authoritative literals). */
const HINT: Record<VoiceFabState, string> = {
  idle: "TAP TO RECORD",
  requesting: "ALLOW MICROPHONE…",
  recording: "● TAP TO STOP",
  processing: "TRANSCRIBING…",
  error: "TAP TO RETRY",
};

/** Hint colour: recording/error carry $destructive, the rest are muted. */
const HINT_COLOR: Record<VoiceFabState, string> = {
  idle: "text-muted-foreground",
  requesting: "text-muted-foreground",
  recording: "text-destructive",
  processing: "text-muted-foreground",
  error: "text-destructive",
};

/** State-reflecting accessible name. */
const ARIA_LABEL: Record<VoiceFabState, string> = {
  idle: "Record voice command",
  requesting: "Allow microphone access",
  recording: "Stop recording",
  processing: "Transcribing",
  error: "Voice command failed — tap to retry",
};

export interface VoiceFabProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "aria-label" | "onPointerDown" | "onPointerUp"
  > {
  /** Drives glyph, button fill, ring, and hint. */
  state: VoiceFabState;
  /** Tap-to-toggle activation (also fired on Space/Enter via the native button). */
  onPress?: () => void;
  /** Push-to-talk start. */
  onPointerDown?: (e: React.PointerEvent<HTMLButtonElement>) => void;
  /** Push-to-talk stop. */
  onPointerUp?: (e: React.PointerEvent<HTMLButtonElement>) => void;
  /** Push-to-talk stop (pointer slid off the button mid-hold). */
  onPointerLeave?: (e: React.PointerEvent<HTMLButtonElement>) => void;
  /** Push-to-talk stop (gesture cancelled by the OS/browser). */
  onPointerCancel?: (e: React.PointerEvent<HTMLButtonElement>) => void;
  /**
   * Caption shown beneath the button (showcase / mobile). Defaults to the
   * per-state literal; pass `null` to suppress it in fixed-position product use.
   */
  hint?: string | null;
  /** Button diameter in px. 56 (mobile, default) · up to 64 desktop. ≥44 target. */
  size?: number;
  /** Override the state-derived `aria-label`. */
  "aria-label"?: string;
}

const VoiceFAB = React.forwardRef<HTMLButtonElement, VoiceFabProps>(
  (
    {
      state,
      onPress,
      onPointerDown,
      onPointerUp,
      onPointerLeave,
      onPointerCancel,
      hint,
      size = 56,
      className,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    const isRecording = state === "recording";
    const isError = state === "error";
    const isBusy = state === "requesting" || state === "processing";
    // Ring is visible at rest (idle, static) and while recording (animated).
    const ringVisible = state === "idle" || isRecording;
    const hintText = hint === null ? null : (hint ?? HINT[state]);
    // 96px canonical wrap around the button → a ~12px halo at the 72px ref size,
    // scaled to whatever `size` ships (ring = button × 96/72 ≈ 1.333).
    const ringSize = Math.round(size * (96 / 72));
    const glyphSize = Math.round(size * (28 / 72));

    return (
      <div
        className={cn(
          // Fixed positioning is opt-in via className; the default is a centred
          // showcase stack (caption beneath). z-150 + safe-area belong on the
          // consumer's fixed wrapper (see story `Fixed`).
          "relative inline-flex flex-col items-center gap-3.5",
          className,
        )}
      >
        <span
          className="relative inline-flex items-center justify-center"
          style={{ width: ringSize, height: ringSize }}
        >
          {/* Pulse Ring — decorative stroked ellipse. Static at idle; the sharp
              scale/opacity pulse runs while recording. Hidden when busy/error.
              `prefers-reduced-motion` freezes the pulse to a static ring. */}
          {ringVisible ? (
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-0 rounded-full border-2",
                isRecording
                  ? "border-destructive motion-safe:animate-[ob-fab-pulse_1.4s_ease-out_infinite]"
                  : "border-primary",
              )}
            />
          ) : null}

          <button
            ref={ref}
            type="button"
            {...props}
            aria-label={ariaLabel ?? ARIA_LABEL[state]}
            aria-busy={isBusy || undefined}
            onClick={onPress}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerLeave}
            onPointerCancel={onPointerCancel}
            style={{ width: size, height: size }}
            className={cn(
              "relative inline-flex items-center justify-center rounded-full transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              // Per-state button skin.
              state === "idle" &&
                "bg-primary text-primary-foreground hover:bg-primary-hover",
              state === "requesting" &&
                "bg-primary text-primary-foreground",
              isRecording &&
                "bg-destructive text-destructive-foreground",
              state === "processing" &&
                "border border-border bg-muted text-primary",
              isError &&
                "border border-destructive bg-muted text-destructive",
            )}
          >
            {state === "idle" ? (
              <Mic aria-hidden="true" size={glyphSize} />
            ) : null}
            {state === "requesting" || state === "processing" ? (
              <Loader
                aria-hidden="true"
                size={glyphSize}
                className="animate-spin motion-reduce:animate-none"
              />
            ) : null}
            {isRecording ? (
              <Square
                aria-hidden="true"
                size={Math.round(size * (24 / 72))}
                fill="currentColor"
              />
            ) : null}
            {isError ? (
              <TriangleAlert aria-hidden="true" size={glyphSize} />
            ) : null}
          </button>

          {/* Error underline — the bespoke 64×2 $destructive bar under the
              button (board `Red Line` motif). Width tracks the button. */}
          {isError ? (
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-full mt-1.5 h-0.5 -translate-x-1/2 bg-destructive"
              style={{ width: Math.round(size * (64 / 72)) }}
            />
          ) : null}
        </span>

        {/* Status hint + live region. The error state announces ASSERTIVELY via
            role="alert" on this text node (valid on a span — a button may not
            carry role="alert", aria-allowed-role); all other states announce
            politely. The button itself keeps its plain `button` role + label. */}
        {hintText ? (
          <span
            role={isError ? "alert" : undefined}
            aria-live={isError ? "assertive" : "polite"}
            className={cn(
              "font-mono text-micro uppercase leading-none tracking-[1px]",
              HINT_COLOR[state],
            )}
          >
            {hintText}
          </span>
        ) : isError ? (
          // hint suppressed (fixed-position product use) → keep an assertive
          // sr-only alert so the failure is still announced to AT users.
          <span role="alert" className="sr-only">
            {ARIA_LABEL.error}
          </span>
        ) : null}

        {/* Scoped keyframes for the recording pulse ring (no global token; mirrors
            the progress-bar inline-keyframe idiom). */}
        <style>{
          "@keyframes ob-fab-pulse{0%{transform:scale(1);opacity:.9}70%{transform:scale(1.12);opacity:0}100%{transform:scale(1.12);opacity:0}}"
        }</style>
      </div>
    );
  },
);
VoiceFAB.displayName = "VoiceFAB";

export { VoiceFAB };
