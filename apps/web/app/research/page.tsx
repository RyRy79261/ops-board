import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AppHeader } from "@opsboard/ui/components/app-header";
import { Button } from "@opsboard/ui/components/button";
import { EmptyState } from "@opsboard/ui/components/empty-state";
import { getMissions } from "@opsboard/db/missions";

import { requireOnboardedUser } from "@/lib/session";
import { ResearchSurface } from "./research-surface";

// /research — the AI Research (Task Agent) Capture & Parse surface. force-dynamic
// (it reads the live mission list per request). Resolves the verified, onboarded
// principal, picks the scoped mission from ?mission=ID (default: first), and
// hands the client surface the locked scope. The voice capture + parse + CUE
// RESEARCH enqueue all happen client-side against /api/research(/parse).

export const dynamic = "force-dynamic";
export const metadata = { title: "Task Agent · OpsBoard" };

export default async function ResearchPage({
  searchParams,
}: {
  // Next 16: searchParams is a Promise.
  searchParams: Promise<{ mission?: string | string[] }>;
}) {
  const { userId } = await requireOnboardedUser();
  const params = await searchParams;
  const missionParam = Array.isArray(params.mission)
    ? params.mission[0]
    : params.mission;

  const missions = await getMissions(userId);

  // Research is mission-scoped + attaches notes to a task — with no missions
  // there's nothing to scope to. Steer the user to create one first.
  if (missions.length === 0) {
    return (
      <div className="flex min-h-dvh flex-col bg-background">
        <AppHeader
          right={
            <Button asChild variant="ghost" size="sm">
              <Link href="/">
                <ArrowLeft aria-hidden="true" /> Board
              </Link>
            </Button>
          }
        />
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

  const active =
    missions.find((m) => m.id === missionParam) ?? missions[0]!;

  return (
    <ResearchSurface missionId={active.id} missionName={active.name} />
  );
}
