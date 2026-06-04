"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { updateTaskStatus } from "@opsboard/db/tasks";

// The board's ONLY mutation: cycle a task's stored status. Mirrors the camp-404
// page/action/client triad — co-located "use server" action, returns the
// {ok:true} | {ok:false,error} shape, revalidates the board path on success.
// No create / edit / delete here (read-only board; those happen via voice/MCP).

/** Discriminated result the client island branches on. */
export type UpdateTaskStatusActionResult =
  | { ok: true }
  | { ok: false; error: string };

// Boundary validation (AGENTS.md: validate external input with Zod). The id is
// an opaque non-empty string; status is the pinned tri-state — anything else is
// rejected before it reaches the DB CHECK.
const TaskId = z.string().min(1);
const Status = z.enum(["not-started", "in-progress", "done"]);

/**
 * Set `taskId`'s status to `next` (the wrapping cycle is decided client-side;
 * this just persists the chosen value). On success revalidates "/" so the RSC
 * re-reads the board (the client also keeps an optimistic value for snappiness).
 */
export async function updateTaskStatusAction(
  taskId: string,
  next: string,
): Promise<UpdateTaskStatusActionResult> {
  const id = TaskId.safeParse(taskId);
  if (!id.success) return { ok: false, error: "Invalid task." };

  const status = Status.safeParse(next);
  if (!status.success) return { ok: false, error: "Unknown status." };

  const result = await updateTaskStatus(id.data, status.data);
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/");
  return { ok: true };
}
