"use client";

import { useEffect } from "react";
import { ErrorBoundaryFallback } from "@opsboard/ui/components/error-boundary-fallback";

// Root-layout error boundary — catches errors thrown in the root layout itself
// (where the segment `error.tsx` can't reach). It REPLACES <html>/<body>, so it
// renders the full fatal ErrorBoundaryFallback variant (accent bar + ERR code +
// trace) wired to Next's reset(). The Report action is deferred until the report
// flow exists (roadmap rank 12), so it's omitted here.

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Fatal app error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased">
        <div className="flex min-h-dvh items-center justify-center p-6">
          <ErrorBoundaryFallback
            variant="full"
            errorCode="ERR · APPLICATION CRASHED"
            trace={error.digest ? `DIGEST ${error.digest}` : undefined}
            onReload={() => reset()}
          />
        </div>
      </body>
    </html>
  );
}
