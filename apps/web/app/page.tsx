import { EmptyState } from "@opsboard/ui/components/empty-state";
import { AppHeader } from "@opsboard/ui/components/app-header";
import { getDashboardData } from "@/lib/dashboard-data";
import { DashboardShell } from "@/components/dashboard-shell";

// The read-only board entry point. force-dynamic: the board is live (status
// cycling + window-state ticking), never statically cached. Reads the active
// mission from ?mission=ID, assembles the payload server-side (blocked +
// critical-path derived there; window-state stays client-side), and hands it to
// the client shell. EmptyState (voice-first copy) covers the no-data branches.

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  // Next 16: searchParams is a Promise.
  searchParams: Promise<{ mission?: string | string[] }>;
}) {
  const params = await searchParams;
  const missionParam = Array.isArray(params.mission)
    ? params.mission[0]
    : params.mission;

  const data = await getDashboardData(missionParam);

  // No missions at all → the no-missions empty state, framed by the header so
  // the chrome stays consistent. Voice-first: tells the operator what to say.
  if (!data) {
    return (
      <div className="flex min-h-dvh flex-col bg-background">
        <AppHeader />
        <main className="flex flex-1 items-center justify-center p-6">
          <EmptyState
            variant="no-missions"
            hintStyle="tokens"
            className="w-full max-w-md"
          />
        </main>
      </div>
    );
  }

  return <DashboardShell data={data} />;
}
