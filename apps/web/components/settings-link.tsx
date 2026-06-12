import Link from "next/link";
import { Settings } from "lucide-react";

import { Button } from "@opsboard/ui/components/button";

/**
 * The board header's link to the /settings hub (preferences + AI keys). A leaf
 * good for the AppHeader `right` slot — server-safe (next/link only, no state),
 * so it drops into both the RSC no-missions branch and the client DashboardShell
 * header. Keeps the settings surface discoverable rather than URL-only.
 */
export function SettingsLink() {
  return (
    <Button asChild variant="ghost" size="sm" aria-label="Settings">
      <Link href="/settings">
        <Settings aria-hidden="true" /> Settings
      </Link>
    </Button>
  );
}
