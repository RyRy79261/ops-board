"use client";

import * as React from "react";
import { ErrorBoundaryFallback } from "@opsboard/ui/components/error-boundary-fallback";

// A React class ErrorBoundary for the client view subtree (ADAPT of
// intake-tracker's error-boundary). Next's route `error.tsx` catches errors for
// the whole segment (and unmounts the chrome); this finer-grained boundary wraps
// just the active view so a single view crash shows the calm RETRY fallback
// WHILE the header / sidebar / tabs stay mounted. Key it by the active view so a
// tab switch remounts it and clears a stuck error.

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error) {
    // Surface the crash for diagnosis (no PII rendered on the board).
    console.error("View render error:", error);
  }

  private reset = () => this.setState({ error: null });

  override render() {
    if (this.state.error) {
      return (
        <div className="flex flex-1 items-center justify-center p-6">
          <ErrorBoundaryFallback variant="retry" onRetry={this.reset} />
        </div>
      );
    }
    return this.props.children;
  }
}
