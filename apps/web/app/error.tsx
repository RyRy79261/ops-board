"use client";

import { useEffect } from "react";
import { ErrorBoundaryFallback } from "@opsboard/ui/components/error-boundary-fallback";

// Route-level error boundary fallback — the outermost recovery surface for the
// board segment. Renders the shared RETRY-only ErrorBoundaryFallback
// (docs/tech-spec/03-surfaces/states.md §5) wired to Next's reset().

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
      <ErrorBoundaryFallback variant="retry" onRetry={() => reset()} />
    </div>
  );
}
