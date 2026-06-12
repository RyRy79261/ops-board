import { getUserPreferences } from "@opsboard/db/preferences";
import { getSessionUser } from "@/lib/session";
import { SettingsHub } from "./settings-hub";

// /settings — the settings hub. Seeds the user's resolved preferences (defaults
// applied) server-side so the first paint is correct, then the client hub owns
// the optimistic toggles. Uses getSessionUser (auth only, not
// requireOnboardedUser) so it's reachable mid-setup like /settings/keys.
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { userId } = await getSessionUser();
  const prefs = await getUserPreferences(userId);
  return <SettingsHub initialPrefs={prefs} />;
}
