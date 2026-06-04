"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";

// Route-level error boundary fallback — the outermost recovery surface for the
// board. Built per docs/tech-spec/03-surfaces/states.md §5 (the RETRY-only
// variant): $background card, sharp (radius-0) 1px $border, centered, a 48px
// destructive triangle-alert, a mono caps headline, a calm DM Sans body, and a
// single $primary RETRY action wired to Next's reset(). role="alert" so the
// failure is announced.

export default function BoardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the boundary crash to the console for diagnosis (no PII on the board).
    console.error("Board render error:", error);
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-6">
      <div
        role="alert"
        className="flex w-full max-w-md flex-col items-center gap-4 border border-border bg-background p-8 text-center"
      >
        <AlertTriangle
          aria-hidden
          className="size-12 text-[color:var(--color-destructive)]"
        />
        <p className="font-mono text-[15px] font-bold uppercase tracking-[0.1em] text-foreground">
          Something broke
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          An unexpected error occurred while loading the board.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 bg-primary px-[18px] py-2.5 font-mono text-xs font-bold uppercase tracking-[0.08em] text-primary-foreground outline-none transition-colors hover:bg-[color:var(--color-primary-hover)] focus-visible:ring-2 focus-visible:ring-ring"
        >
          <RotateCw aria-hidden className="size-3.5" />
          Retry
        </button>
      </div>
    </div>
  );
}
