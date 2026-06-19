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
import type { CategoryVM } from "@/lib/dashboard-types";
import { createTaskAction } from "@/app/actions";

// Non-voice task CREATE form. Category defaults to "general" (matching
// createTask) so a new task always lands in a visible bucket. The category
// <select> is styled inline to the TextInput field recipe (the kit has no Select
// primitive yet). Task EDIT (name/notes/status/dates) lands in PR2 with the
// per-card edit affordance + the LOCKED-#4 TaskCard decision.

// Field recipe shared with TextInput (sharp box on $muted, orange focus ring).
const FIELD =
  "w-full border border-input bg-muted px-3 py-2 font-mono text-[14px] text-foreground outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-45";
const LABEL =
  "font-mono text-eyebrow uppercase leading-none tracking-[1.5px] text-muted-foreground";

export interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The mission a new task is created on. */
  missionId: string;
  /** The category options (already includes "general"). */
  categories: CategoryVM[];
}

export function TaskFormDialog({
  open,
  onOpenChange,
  missionId,
  categories,
}: TaskFormDialogProps) {
  const router = useRouter();
  const [name, setName] = React.useState("");
  // "" = "General" (the server's best-effort default); a real slug is sent only
  // when the user picks a specific category. Never force "general" — that would
  // bypass createTask's no-category fallback.
  const [categorySlug, setCategorySlug] = React.useState("");
  const [tooLateBy, setTooLateBy] = React.useState("");
  const [notBefore, setNotBefore] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  // Reset to a blank form each time the dialog opens.
  React.useEffect(() => {
    if (!open) return;
    setName("");
    setCategorySlug("");
    setTooLateBy("");
    setNotBefore("");
    setError(null);
  }, [open]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length === 0) {
      setError("A task name is required.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await createTaskAction({
        missionId,
        name,
        // Omit when "General" so createTask applies its own best-effort default.
        categorySlug: categorySlug === "" ? undefined : categorySlug,
        tooLateBy,
        notBefore,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onOpenChange(false);
      router.refresh();
    });
  };

  const selectId = React.useId();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New task</DialogTitle>
          <DialogDescription>
            Add a task to this mission. Pick a category, or leave it in General.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <TextInput
            label="Task name"
            required
            maxLength={200}
            disabled={pending}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Submit land-use permit"
          />

          <div className="flex w-full flex-col gap-[7px]">
            <label htmlFor={selectId} className={LABEL}>
              Category
            </label>
            <select
              id={selectId}
              className={FIELD}
              disabled={pending}
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
            >
              {/* Empty value = "General" (the server-default catch-all); the
                  real domain categories follow. */}
              <option value="">General</option>
              {categories
                .filter((c) => c.slug !== "general")
                .map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex gap-3">
            <TextInput
              label="Not before"
              type="date"
              disabled={pending}
              value={notBefore}
              onChange={(e) => setNotBefore(e.target.value)}
            />
            <TextInput
              label="Too late by"
              type="date"
              disabled={pending}
              value={tooLateBy}
              onChange={(e) => setTooLateBy(e.target.value)}
            />
          </div>

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
              {pending ? "Saving…" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
