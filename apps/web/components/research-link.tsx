import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@opsboard/ui/components/button";

/**
 * The board header's link to the /research (Task Agent) surface — the voice-cued
 * research flow. A server-safe leaf (next/link only) for the AppHeader `right`
 * slot, mirroring SettingsLink so the surface is discoverable, not URL-only.
 */
export function ResearchLink() {
  return (
    <Button asChild variant="ghost" size="sm" aria-label="Task Agent">
      <Link href="/research">
        <Sparkles aria-hidden="true" /> Research
      </Link>
    </Button>
  );
}
