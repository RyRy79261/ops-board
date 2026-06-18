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
import { createMissionAction } from "@/app/actions";

// Non-voice mission CREATE form (composes the existing Dialog + TextInput kit).
// On success it navigates to the new mission. Mission EDIT + DELETE live in the
// in-place MissionSettingsDialog (the board's ⚙ Settings), not a separate page.

export interface MissionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MissionFormDialog({
  open,
  onOpenChange,
}: MissionFormDialogProps) {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [targetDate, setTargetDate] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  // Reset to a blank form each time the dialog opens.
  React.useEffect(() => {
    if (!open) return;
    setName("");
    setTargetDate("");
    setError(null);
  }, [open]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length === 0) {
      setError("A mission name is required.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await createMissionAction({ name, targetDate });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onOpenChange(false);
      // Switch the board to the freshly-created mission (the action already
      // revalidated "/", so this navigation re-reads the new mission).
      router.push(`/?mission=${encodeURIComponent(res.missionId)}`);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New mission</DialogTitle>
          <DialogDescription>
            Name your mission, and optionally set the fixed event date.
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
            value={targetDate}
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
              {pending ? "Saving…" : "Create mission"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
