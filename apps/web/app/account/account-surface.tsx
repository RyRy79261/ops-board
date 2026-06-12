"use client";

import Link from "next/link";
import * as React from "react";
import { ArrowLeft, LogOut, Download } from "lucide-react";

import { AppHeader } from "@opsboard/ui/components/app-header";
import { Button } from "@opsboard/ui/components/button";
import { Eyebrow } from "@opsboard/ui/components/eyebrow";
import { Alert } from "@opsboard/ui/components/alert";
import { AccountProfileSummary } from "@opsboard/ui/components/account-profile-summary";
import {
  DangerZoneCard,
  DangerZoneRow,
} from "@opsboard/ui/components/danger-zone-card";
import { TypeToConfirmField } from "@opsboard/ui/components/type-to-confirm-field";
import { SettingsGroup } from "@opsboard/ui/components/settings-group";
import { SettingsRow } from "@opsboard/ui/components/settings-row";

import { authClient, signOut } from "@/lib/auth-client";

// /account client surface: read-only profile, a sign-out row, an export-my-data
// action, and the type-to-confirm DELETE ACCOUNT flow. Deletion is DATA-FIRST:
// the server wipes all OpsBoard data (cascade), then we BEST-EFFORT remove the
// Neon Auth identity (authClient.deleteUser — depends on the hosted "delete
// user" feature being enabled) and sign out. No failure mode orphans data.

// Narrow view of the auth client for the optional self-delete method (it isn't
// in the named re-exports; present only when the hosted feature is enabled).
type DeletableAuthClient = {
  deleteUser?: (opts?: { callbackURL?: string }) => Promise<unknown>;
};

export function AccountSurface({
  email,
  memberSince,
}: {
  email: string;
  memberSince?: string;
}) {
  const [confirming, setConfirming] = React.useState(false);
  const [confirmValue, setConfirmValue] = React.useState("");
  const [matched, setMatched] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  function exportData() {
    // Attachment response → browser downloads without navigating away.
    const a = document.createElement("a");
    a.href = "/api/account/export";
    a.download = "opsboard-export.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function confirmDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      // 1) Wipe OpsBoard data while the session is still valid (data-first).
      const res = await fetch("/api/account", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ confirm: "DELETE" }),
      });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);

      // 2) Best-effort: remove the Neon Auth identity. Only present when the
      //    hosted "delete user" feature is enabled; a failure leaves the login
      //    husk but the data is already gone (re-signup = empty account).
      const client = authClient as DeletableAuthClient;
      try {
        await client.deleteUser?.({ callbackURL: "/auth" });
      } catch {
        /* feature disabled / requires verification — data is already deleted */
      }

      // 3) Always sign out, then leave for the auth screen.
      try {
        await signOut();
      } catch {
        /* ignore — navigating away regardless */
      }
      window.location.assign("/auth");
    } catch {
      setDeleting(false);
      setDeleteError("Couldn’t delete your account. Try again.");
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AppHeader
        right={
          <Button asChild variant="ghost" size="sm">
            <Link href="/settings">
              <ArrowLeft aria-hidden="true" /> Settings
            </Link>
          </Button>
        }
      />
      <main className="flex flex-1 justify-center p-6">
        <div className="flex w-full max-w-md flex-col gap-6">
          <Eyebrow as="h1" tone="foreground" weight={700} tracking={2}>
            Account
          </Eyebrow>

          <AccountProfileSummary email={email} memberSince={memberSince} />

          <SettingsGroup title="Session">
            <SettingsRow
              label="Sign out"
              description="End your session on this device."
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  void signOut().finally(() => window.location.assign("/auth"));
                }}
              >
                <LogOut aria-hidden="true" /> Sign out
              </Button>
            </SettingsRow>
          </SettingsGroup>

          {deleteError ? (
            <Alert variant="destructive" title="Delete failed">
              {deleteError}
            </Alert>
          ) : null}

          <DangerZoneCard>
            <DangerZoneRow
              label="Export my data"
              description="Download all your missions, tasks, and preferences as JSON. Your keys are never exported."
            >
              <Button variant="outline" size="sm" onClick={exportData}>
                <Download aria-hidden="true" /> Export
              </Button>
            </DangerZoneRow>

            <DangerZoneRow
              label="Delete account"
              description="Permanently delete your account and all associated data. This cannot be undone."
            >
              {!confirming ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setConfirming(true)}
                >
                  Delete
                </Button>
              ) : null}
            </DangerZoneRow>

            {confirming ? (
              <div className="flex flex-col gap-3 border border-destructive bg-background p-[15px]">
                <TypeToConfirmField
                  value={confirmValue}
                  onValueChange={setConfirmValue}
                  onMatchChange={setMatched}
                  disabled={deleting}
                />
                <div className="flex items-center gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={!matched || deleting}
                    onClick={() => void confirmDelete()}
                  >
                    {deleting ? "Deleting…" : "Delete forever"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={deleting}
                    onClick={() => {
                      setConfirming(false);
                      setConfirmValue("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : null}
          </DangerZoneCard>
        </div>
      </main>
    </div>
  );
}
