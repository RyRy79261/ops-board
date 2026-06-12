"use client";

import Link from "next/link";
import * as React from "react";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";

import { AppHeader } from "@opsboard/ui/components/app-header";
import { Button } from "@opsboard/ui/components/button";
import { Eyebrow } from "@opsboard/ui/components/eyebrow";
import { Alert } from "@opsboard/ui/components/alert";
import { SettingsGroup } from "@opsboard/ui/components/settings-group";
import { SettingsRow } from "@opsboard/ui/components/settings-row";
import { Switch } from "@opsboard/ui/components/switch";

// /settings hub client surface. Renders the grouped-preferences model: a Voice
// & Microphone group whose toggles persist to /api/user/preferences (optimistic
// — flip locally, PATCH, revert on failure), and a Manage group of nav rows to
// the existing /settings/keys + /account surfaces. The board header links here.

/** The preferences shape the server resolves (defaults applied). */
const PreferencesSchema = z.object({
  voiceConfirmDestructive: z.boolean(),
  notifyClosingWindows: z.boolean(),
});
type Preferences = z.infer<typeof PreferencesSchema>;

async function patchPreferences(
  patch: Partial<Preferences>,
): Promise<Preferences> {
  const res = await fetch("/api/user/preferences", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`Save failed (${res.status})`);
  const parsed = PreferencesSchema.safeParse(await res.json().catch(() => null));
  if (!parsed.success) throw new Error("Unexpected response");
  return parsed.data;
}

export function SettingsHub({
  initialPrefs,
}: {
  initialPrefs: Preferences;
}) {
  const [prefs, setPrefs] = React.useState<Preferences>(initialPrefs);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  function toggle(key: keyof Preferences, next: boolean) {
    const prev = prefs;
    // Optimistic: flip locally, then persist; revert + surface on failure.
    setPrefs({ ...prev, [key]: next });
    setSaveError(null);
    startTransition(async () => {
      try {
        const saved = await patchPreferences({ [key]: next });
        setPrefs(saved);
      } catch {
        setPrefs(prev);
        setSaveError("Couldn’t save that change. Try again.");
      }
    });
  }

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
      <main className="flex flex-1 justify-center p-6">
        <div className="flex w-full max-w-md flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <Eyebrow as="h1" tone="foreground" weight={700} tracking={2}>
              Settings
            </Eyebrow>
            <p className="text-label text-muted-foreground">
              Preferences are saved to your account.
            </p>
          </div>

          {saveError ? (
            <Alert variant="destructive" title="Save failed">
              {saveError}
            </Alert>
          ) : null}

          <SettingsGroup title="Voice & Microphone">
            <SettingsRow
              label="Confirm destructive commands"
              description="Ask before a voice command deletes a task or mission."
            >
              <Switch
                checked={prefs.voiceConfirmDestructive}
                onCheckedChange={(v) => toggle("voiceConfirmDestructive", v)}
                disabled={pending}
                aria-label="Confirm destructive commands"
              />
            </SettingsRow>
            <SettingsRow
              label="Notify on closing windows"
              description="Remind me when a task’s window is about to close. (No notification channel yet — saved for when it ships.)"
            >
              <Switch
                checked={prefs.notifyClosingWindows}
                onCheckedChange={(v) => toggle("notifyClosingWindows", v)}
                disabled={pending}
                aria-label="Notify on closing windows"
              />
            </SettingsRow>
          </SettingsGroup>

          <SettingsGroup title="Manage">
            <Link
              href="/settings/keys"
              className="outline-none focus-visible:bg-card-elevated"
            >
              <SettingsRow
                label="AI keys"
                description="Your Anthropic + Groq keys."
                chevron
              />
            </Link>
            <Link
              href="/account"
              className="outline-none focus-visible:bg-card-elevated"
            >
              <SettingsRow
                label="Account"
                description="Profile, sign-out, export, and account deletion."
                chevron
              />
            </Link>
          </SettingsGroup>
        </div>
      </main>
    </div>
  );
}
