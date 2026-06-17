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
import type { TaskStatus } from "@opsboard/types";
import type { CategoryVM, TaskVM } from "@/lib/dashboard-types";
import { createTaskAction, updateTaskAction } from "@/app/actions";

// Non-voice task create / edit form. One component, two modes: `task` present →
// edit (updateTaskAction), absent → create on `missionId` (createTaskAction).
// Category defaults to "general" (matching createTask) so a new task always
// lands in a visible bucket. Select + textarea are styled inline to the
// TextInput field recipe (the kit has no Select primitive yet).

// Field recipe shared with TextInput (sharp box on $muted, orange focus ring).
const FIELD =
  "w-full border border-input bg-muted px-3 py-2 font-mono text-[14px] text-foreground outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const LABEL =
  "font-mono text-eyebrow uppercase leading-none tracking-[1.5px] text-muted-foreground";

const STATUS_LABELS: Record<TaskStatus, string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  done: "Done",
};

export interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The mission a NEW task is created on (ignored in edit mode). */
  missionId: string;
  /** The category options (already includes "general"). */
  categories: CategoryVM[];
  /** Present → edit that task; absent → create a new one. */
  task?: TaskVM;
}

export function TaskFormDialog({
  open,
  onOpenChange,
  missionId,
  categories,
  task,
}: TaskFormDialogProps) {
  const router = useRouter();
  const isEdit = task != null;
  const [name, setName] = React.useState(task?.name ?? "");
  const [categorySlug, setCategorySlug] = React.useState(
    task?.categorySlug ?? "general",
  );
  const [tooLateBy, setTooLateBy] = React.useState(task?.too_late_by ?? "");
  const [notBefore, setNotBefore] = React.useState(task?.not_before ?? "");
  const [notes, setNotes] = React.useState(task?.notes ?? "");
  const [status, setStatus] = React.useState<TaskStatus>(
    task?.status ?? "not-started",
  );
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  React.useEffect(() => {
    if (!open) return;
    setName(task?.name ?? "");
    setCategorySlug(task?.categorySlug ?? "general");
    setTooLateBy(task?.too_late_by ?? "");
    setNotBefore(task?.not_before ?? "");
    setNotes(task?.notes ?? "");
    setStatus(task?.status ?? "not-started");
    setError(null);
  }, [open, task?.id]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length === 0) {
      setError("A task name is required.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = isEdit
        ? await updateTaskAction({
            taskId: task.id,
            name,
            categorySlug,
            status,
            tooLateBy,
            notBefore,
            notes,
          })
        : await createTaskAction({
            missionId,
            name,
            categorySlug,
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
  const statusId = React.useId();
  const notesId = React.useId();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit task" : "New task"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this task's details."
              : "Add a task to this mission. Pick a category, or leave it in General."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <TextInput
            label="Task name"
            required
            autoFocus
            maxLength={200}
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
              value={categorySlug ?? "general"}
              onChange={(e) => setCategorySlug(e.target.value)}
            >
              {categories.map((c) => (
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
              value={notBefore ?? ""}
              onChange={(e) => setNotBefore(e.target.value)}
            />
            <TextInput
              label="Too late by"
              type="date"
              value={tooLateBy ?? ""}
              onChange={(e) => setTooLateBy(e.target.value)}
            />
          </div>

          {isEdit ? (
            <>
              <div className="flex w-full flex-col gap-[7px]">
                <label htmlFor={statusId} className={LABEL}>
                  Status
                </label>
                <select
                  id={statusId}
                  className={FIELD}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                >
                  {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex w-full flex-col gap-[7px]">
                <label htmlFor={notesId} className={LABEL}>
                  Notes
                </label>
                <textarea
                  id={notesId}
                  className={FIELD}
                  rows={3}
                  maxLength={2000}
                  value={notes ?? ""}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </>
          ) : null}

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
              {pending ? "Saving…" : isEdit ? "Save changes" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
