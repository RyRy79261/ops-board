import { AppHeader } from "@opsboard/ui/components/app-header";
import { LoadingScreen } from "@opsboard/ui/components/loading-screen";

// Route-level first-paint fallback for the board. Mirrors the app shell —
// wordmark header + the LoadingScreen app-shell skeleton (220px sidebar + main
// column) — so the layout doesn't jump when the RSC payload resolves. The
// skeleton carries aria-busy; its shimmer is aria-hidden + reduced-motion-safe.

export default function Loading() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AppHeader />
      <LoadingScreen />
    </div>
  );
}
