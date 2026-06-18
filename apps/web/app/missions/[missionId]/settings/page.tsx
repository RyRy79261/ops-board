import { notFound } from "next/navigation";
import { requireOnboardedUser } from "@/lib/session";
import { getMission } from "@opsboard/db/missions";
import { MissionSettingsSurface } from "./mission-settings-surface";

// Per-mission settings (GitHub general-settings style): a General section to
// edit the name / target date, and a Danger Zone to delete the mission. Reached
// from the board's ⚙ Settings action. force-dynamic + owner-scoped: the mission
// is loaded for the verified principal; an unknown / unowned id is a 404.

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function MissionSettingsPage({
  params,
}: {
  // Next 16: params is a Promise.
  params: Promise<{ missionId: string }>;
}) {
  const { missionId } = await params;
  // Pre-validate the id shape so getMission never sees a malformed UUID.
  if (!UUID_RE.test(missionId)) notFound();

  const { userId } = await requireOnboardedUser();
  const mission = await getMission(missionId, userId);
  if (!mission) notFound();

  return (
    <MissionSettingsSurface
      mission={{
        id: mission.id,
        name: mission.name,
        targetDate: mission.targetDate,
      }}
    />
  );
}
