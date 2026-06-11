import Link from "next/link";
import { KeyRound } from "lucide-react";

import { Button } from "@opsboard/ui/components/button";

/**
 * The board header's link to /settings/keys (BYO AI-key management). A leaf
 * good for the AppHeader `right` slot — server-safe (next/link only, no state),
 * so it drops into both the RSC no-missions branch and the client DashboardShell
 * header. Keeps the keys surface discoverable rather than URL-only.
 */
export function SettingsLink() {
  return (
    <Button asChild variant="ghost" size="sm" aria-label="AI keys settings">
      <Link href="/settings/keys">
        <KeyRound aria-hidden="true" /> Keys
      </Link>
    </Button>
  );
}
