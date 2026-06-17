"use client";

import * as React from "react";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@opsboard/ui/components/button";
import type { CategoryVM } from "@/lib/dashboard-types";
import { MissionFormDialog } from "./mission-form-dialog";
import { TaskFormDialog } from "./task-form-dialog";

// Self-contained launcher buttons that own their dialog's open state, so they
// can be dropped anywhere (the no-missions empty state, the sidebar, the board
// toolbar) without the parent threading state. Each composes one of the CRUD
// form dialogs.

/** "+ New mission" — opens the create-mission form. */
export function MissionCreateLauncher({
  variant = "outline",
  className,
}: {
  variant?: React.ComponentProps<typeof Button>["variant"];
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button
        variant={variant}
        size="sm"
        className={className}
        onClick={() => setOpen(true)}
      >
        <Plus aria-hidden="true" /> New mission
      </Button>
      <MissionFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

/** "Edit" — opens the edit-mission form for the active mission. */
export function MissionEditLauncher({
  mission,
}: {
  mission: { id: string; name: string; targetDate: string | null };
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Pencil aria-hidden="true" /> Edit mission
      </Button>
      <MissionFormDialog open={open} onOpenChange={setOpen} mission={mission} />
    </>
  );
}

/** "+ Add task" — opens the create-task form for the given mission. */
export function TaskCreateLauncher({
  missionId,
  categories,
  variant = "primary",
}: {
  missionId: string;
  categories: CategoryVM[];
  variant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant={variant} size="sm" onClick={() => setOpen(true)}>
        <Plus aria-hidden="true" /> Add task
      </Button>
      <TaskFormDialog
        open={open}
        onOpenChange={setOpen}
        missionId={missionId}
        categories={categories}
      />
    </>
  );
}
