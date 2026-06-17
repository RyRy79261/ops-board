"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@opsboard/ui/components/dialog";
import { Button } from "@opsboard/ui/components/button";
import { TextInput } from "@opsboard/ui/components/text-input";
import { createMissionAction, updateMissionAction } from "@/app/actions";

// Non-voice mission create / edit form. One component, two modes: `mission`
// present → edit (updateMissionAction), absent → create (createMissionAction,
// then navigate to the new mission). Composes the existing Dialog + TextInput
// kit (the read-only board's first form surface). Owner-scoping + validation
// live in the Server Action; this is the controlled client form.

export interface MissionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present → edit that mission; absent → create a new one. */
  mission?: { id: string; name: string; targetDate: string | null };
}

export function MissionFormDialog({
  open,
  onOpenChange,
  mission,
}: MissionFormDialogProps) {
  const router = useRouter();
  const isEdit = mission != null;
  const [name, setName] = React.useState(mission?.name ?? "");
  const [targetDate, setTargetDate] = React.useState(mission?.targetDate ?? "");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  // Reset the form to the target's values each time the dialog opens (or the
  // edited mission changes) so a re-open never shows stale input.
  React.useEffect(() => {
    if (!open) return;
    setName(mission?.name ?? "");
    setTargetDate(mission?.targetDate ?? "");
    setError(null);
  }, [open, mission?.id, mission?.name, mission?.targetDate]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length === 0) {
      setError("A mission name is required.");
      return;
    }
    setError(null);
    startTransition(async () => {
      if (isEdit) {
        const res = await updateMissionAction({
          missionId: mission.id,
          name,
          targetDate,
        });
        if (!res.ok) {
          setError(res.error);
          return;
        }
        onOpenChange(false);
        router.refresh();
      } else {
        const res = await createMissionAction({ name, targetDate });
        if (!res.ok) {
          setError(res.error);
          return;
        }
        onOpenChange(false);
        // Switch the board to the freshly-created mission (the action already
        // revalidated "/", so this navigation re-reads the new mission).
        router.push(`/?mission=${encodeURIComponent(res.missionId)}`);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit mission" : "New mission"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this mission's name or target date."
              : "Name your mission, and optionally set the fixed event date."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <TextInput
            label="Mission name"
            required
            maxLength={200}
            disabled={pending}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. AfrikaBurn 2026"
          />
          <TextInput
            label="Target date"
            type="date"
            disabled={pending}
            value={targetDate ?? ""}
            onChange={(e) => setTargetDate(e.target.value)}
            helper="Optional — the fixed real-world event date."
          />
          {error ? (
            <p role="alert" className="text-caption text-destructive">
              {error}
            </p>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pending || name.trim().length === 0}
            >
              {pending ? "Saving…" : isEdit ? "Save changes" : "Create mission"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
