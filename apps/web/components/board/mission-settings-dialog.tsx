"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Save, Settings, Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@opsboard/ui/components/dialog";
import { Button } from "@opsboard/ui/components/button";
import { TextInput } from "@opsboard/ui/components/text-input";
import { TypeToConfirmField } from "@opsboard/ui/components/type-to-confirm-field";

import { updateMissionAction, deleteMissionAction } from "@/app/actions";

// Mission settings as an in-place DIALOG (not a route) — opened from the board's
// ⚙ button so there's no page navigation / loading flash. A "General" section
// edits name + target date (updateMissionAction), and a Danger Zone deletes the
// mission behind a type-the-name confirm (deleteMissionAction). Both reconcile
// via router.refresh() (a soft re-render — no loading skeleton), never a nav.

type Mission = { id: string; name: string; targetDate: string | null };

/** ⚙ Settings button that opens the in-place mission-settings dialog. */
export function MissionSettingsLauncher({ mission }: { mission: Mission }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Settings aria-hidden="true" /> Settings
      </Button>
      <MissionSettingsDialog
        open={open}
        onOpenChange={setOpen}
        mission={mission}
      />
    </>
  );
}

function MissionSettingsDialog({
  open,
  onOpenChange,
  mission,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mission: Mission;
}) {
  const router = useRouter();

  const [name, setName] = React.useState(mission.name);
  const [targetDate, setTargetDate] = React.useState(mission.targetDate ?? "");
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);
  const [saving, startSave] = React.useTransition();

  const [confirming, setConfirming] = React.useState(false);
  const [confirmValue, setConfirmValue] = React.useState("");
  const [matched, setMatched] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);
  const [deleting, startDelete] = React.useTransition();

  // Re-seed to the mission's values whenever the dialog (re)opens.
  React.useEffect(() => {
    if (!open) return;
    setName(mission.name);
    setTargetDate(mission.targetDate ?? "");
    setSaveError(null);
    setSaved(false);
    setConfirming(false);
    setConfirmValue("");
    setDeleteError(null);
  }, [open, mission.id, mission.name, mission.targetDate]);

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
      onOpenChange(false);
      // Soft re-render: the board re-resolves to another mission (or the
      // no-missions state) — no navigation, no loading skeleton.
      router.refresh();
    });
  }

  const busy = saving || deleting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mission settings</DialogTitle>
          <DialogDescription>{mission.name}</DialogDescription>
        </DialogHeader>

        {/* General — edit name + target date. */}
        <form onSubmit={onSave} className="flex flex-col gap-4">
          <TextInput
            label="Mission name"
            required
            maxLength={200}
            disabled={busy}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
          />
          <TextInput
            label="Target date"
            type="date"
            disabled={busy}
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
            <Button type="submit" size="sm" disabled={busy || !dirty}>
              <Save aria-hidden="true" /> {saving ? "Saving…" : "Save"}
            </Button>
            {saved && !dirty ? (
              <span className="inline-flex items-center gap-1 font-mono text-eyebrow uppercase tracking-[1px] text-success">
                <Check aria-hidden="true" className="size-3.5" /> Saved
              </span>
            ) : null}
          </div>
        </form>

        {/* Danger zone — delete the mission (cascades to its tasks). */}
        <div className="mt-2 flex flex-col gap-3 border border-destructive bg-destructive/[0.08] p-4">
          <span className="font-mono text-eyebrow uppercase leading-none tracking-[1.5px] text-destructive">
            Danger zone
          </span>
          {!confirming ? (
            <div className="flex items-center justify-between gap-3">
              <span className="text-caption text-muted-foreground">
                Permanently delete this mission and all its tasks.
              </span>
              <Button
                variant="destructive"
                size="sm"
                disabled={busy}
                onClick={() => setConfirming(true)}
              >
                <Trash2 aria-hidden="true" /> Delete
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <TypeToConfirmField
                confirmWord={mission.name}
                label="Type the mission name to confirm"
                value={confirmValue}
                onValueChange={setConfirmValue}
                onMatchChange={setMatched}
                disabled={deleting}
              />
              {deleteError ? (
                <p role="alert" className="text-caption text-destructive">
                  {deleteError}
                </p>
              ) : null}
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
