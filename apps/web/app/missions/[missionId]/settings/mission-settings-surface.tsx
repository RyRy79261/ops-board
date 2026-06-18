"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Save } from "lucide-react";

import { AppHeader } from "@opsboard/ui/components/app-header";
import { Button } from "@opsboard/ui/components/button";
import { Eyebrow } from "@opsboard/ui/components/eyebrow";
import { Alert } from "@opsboard/ui/components/alert";
import { TextInput } from "@opsboard/ui/components/text-input";
import {
  DangerZoneCard,
  DangerZoneRow,
} from "@opsboard/ui/components/danger-zone-card";
import { TypeToConfirmField } from "@opsboard/ui/components/type-to-confirm-field";

import { updateMissionAction, deleteMissionAction } from "@/app/actions";

// /missions/[id]/settings client surface — GitHub general-settings style. A
// "General" card edits the mission name / target date (updateMissionAction), and
// a Danger Zone deletes it (deleteMissionAction) behind a type-the-name confirm,
// then returns to the board. Mirrors the /account surface's danger-zone pattern.

export interface MissionSettingsSurfaceProps {
  mission: { id: string; name: string; targetDate: string | null };
}

export function MissionSettingsSurface({
  mission,
}: MissionSettingsSurfaceProps) {
  const router = useRouter();

  // General edit form.
  const [name, setName] = React.useState(mission.name);
  const [targetDate, setTargetDate] = React.useState(mission.targetDate ?? "");
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);
  const [saving, startSave] = React.useTransition();

  // Delete flow.
  const [confirming, setConfirming] = React.useState(false);
  const [confirmValue, setConfirmValue] = React.useState("");
  const [matched, setMatched] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);
  const [deleting, startDelete] = React.useTransition();

  const dirty =
    name !== mission.name || (targetDate || "") !== (mission.targetDate ?? "");

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length === 0) {
      setSaveError("A mission name is required.");
      return;
    }
    setSaveError(null);
    setSaved(false);
    startSave(async () => {
      const res = await updateMissionAction({
        missionId: mission.id,
        name,
        targetDate,
      });
      if (!res.ok) {
        setSaveError(res.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  function onDelete() {
    setDeleteError(null);
    startDelete(async () => {
      const res = await deleteMissionAction(mission.id);
      if (!res.ok) {
        setDeleteError(res.error);
        return;
      }
      // Mission gone → back to the board (it resolves the next mission, or the
      // no-missions state).
      router.push("/");
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
              Mission settings
            </Eyebrow>
            <p className="text-label text-muted-foreground">{mission.name}</p>
          </div>

          {/* General — edit name + target date. */}
          <section className="flex flex-col gap-4 border border-border bg-card p-5">
            <span className="font-mono text-xs font-bold uppercase tracking-[2px] text-muted-foreground">
              General
            </span>
            <form onSubmit={onSave} className="flex flex-col gap-4">
              <TextInput
                label="Mission name"
                required
                maxLength={200}
                disabled={saving}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSaved(false);
                }}
              />
              <TextInput
                label="Target date"
                type="date"
                disabled={saving}
                value={targetDate}
                onChange={(e) => {
                  setTargetDate(e.target.value);
                  setSaved(false);
                }}
                helper="Optional — the fixed real-world event date."
              />
              {saveError ? (
                <p role="alert" className="text-caption text-destructive">
                  {saveError}
                </p>
              ) : null}
              <div className="flex items-center gap-3">
                <Button type="submit" size="sm" disabled={saving || !dirty}>
                  <Save aria-hidden="true" /> {saving ? "Saving…" : "Save"}
                </Button>
                {saved && !dirty ? (
                  <span className="inline-flex items-center gap-1 font-mono text-eyebrow uppercase tracking-[1px] text-success">
                    <Check aria-hidden="true" className="size-3.5" /> Saved
                  </span>
                ) : null}
              </div>
            </form>
          </section>

          {deleteError ? (
            <Alert variant="destructive" title="Delete failed">
              {deleteError}
            </Alert>
          ) : null}

          <DangerZoneCard>
            <DangerZoneRow
              label="Delete this mission"
              description="Permanently delete this mission and all of its tasks and dependencies. This cannot be undone."
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
                  confirmWord={mission.name}
                  label="Type the mission name to confirm"
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
                    onClick={onDelete}
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
