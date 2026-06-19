import { AppHeader } from "@opsboard/ui/components/app-header";
import { ProgressBar } from "@opsboard/ui/components/progress-bar";

// Route-transition fallback. Deliberately MINIMAL — the app header + a slim
// indeterminate top bar — NOT a full app-shell skeleton. Navigations here are
// frequent (switching missions, opening sub-pages), and a heavy fake-board
// skeleton flashing on every one reads as "constant loading". The real content
// streams in underneath; this is just an unobtrusive "working…" cue.

export default function Loading() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AppHeader />
      <ProgressBar indeterminate height={3} label="Loading" />
    </div>
  );
}
