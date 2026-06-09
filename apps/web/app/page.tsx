import { EmptyState } from "@opsboard/ui/components/empty-state";
import { AppHeader } from "@opsboard/ui/components/app-header";
import { getDashboardData } from "@/lib/dashboard-data";
import { requireOnboardedUser } from "@/lib/session";
import { DashboardShell } from "@/components/dashboard-shell";
import { VoiceController } from "@/components/voice/voice-controller";
import { SettingsLink } from "@/components/settings-link";

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

  // Resolve the verified, FULLY-ONBOARDED principal — un-onboarded users are
  // redirected to /setup (requireOnboardedUser), unauthed ones to /auth. Then
  // scope the board read to it — never to anything from the request.
  const { userId } = await requireOnboardedUser();
  const data = await getDashboardData(missionParam, userId);

  // No missions at all → the no-missions empty state, framed by the header so
  // the chrome stays consistent. Voice-first: tells the operator what to say,
  // and the VoiceController FAB lets them actually say it — without this a
  // brand-new user has no way to create their first mission (the FAB otherwise
  // only mounts inside DashboardShell once a mission exists). The command route
  // handles create_mission globally + user-scoped, so no mission context is
  // needed here.
  if (!data) {
    return (
      <div className="flex min-h-dvh flex-col bg-background">
        <AppHeader right={<SettingsLink />} />
        <main className="flex flex-1 items-center justify-center p-6">
          <EmptyState
            variant="no-missions"
            hintStyle="tokens"
            className="w-full max-w-md"
          />
        </main>
        <VoiceController />
      </div>
    );
  }

  return <DashboardShell data={data} />;
}
