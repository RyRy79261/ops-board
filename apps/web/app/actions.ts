"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { updateTaskStatus } from "@opsboard/db/tasks";
import {
  createMission,
  updateMission,
  createTask,
  updateTask,
} from "@opsboard/db/mutations";
import { auth } from "@/lib/neon-auth";
import { ensureUserSynced } from "@/lib/auth-middleware";

// The board's write-side Server Actions — the NON-VOICE create/edit path (the
// keyboard/pointer counterpart to the voice + MCP surfaces). Each mirrors the
// camp-404 page/action/client triad: co-located "use server", Zod boundary
// validation, the verified session principal resolved here (NEVER taken from
// args), the scoped @opsboard/db mutation, and a revalidatePath("/") so the RSC
// re-reads the board. All return the {ok:true,...} | {ok:false,error} shape the
// client islands branch on.

/** Resolve the verified session user (synced into our mirror), or null. userId
 *  is ALWAYS the session principal — never client input. */
async function sessionUserId(): Promise<string | null> {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) return null;
  const userId = session.user.id;
  await ensureUserSynced(userId, session.user.email?.toLowerCase() ?? null);
  return userId;
}

// --- Shared field validators ----------------------------------------------

const NameField = z.string().trim().min(1, "A name is required.").max(200);
/** A date input: "YYYY-MM-DD", or empty/null → cleared. */
const DateField = z
  .union([
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD."),
    z.literal(""),
    z.null(),
  ])
  .optional()
  .transform((v) => (v == null || v === "" ? null : v));
const CategorySlugField = z.string().trim().min(1).optional();
const StatusField = z.enum(["not-started", "in-progress", "done"]).optional();
const NotesField = z
  .union([z.string().max(2000), z.null()])
  .optional()
  .transform((v) => (v == null || v === "" ? null : v));

// --- Existing: cycle a task's status --------------------------------------

export type UpdateTaskStatusActionResult =
  | { ok: true }
  | { ok: false; error: string };

const TaskId = z.string().min(1);
const Status = z.enum(["not-started", "in-progress", "done"]);

/**
 * Set `taskId`'s status to `next` (the wrapping cycle is decided client-side).
 * On success revalidates "/" so the RSC re-reads the board.
 */
export async function updateTaskStatusAction(
  taskId: string,
  next: string,
): Promise<UpdateTaskStatusActionResult> {
  const id = TaskId.safeParse(taskId);
  if (!id.success) return { ok: false, error: "Invalid task." };
  const status = Status.safeParse(next);
  if (!status.success) return { ok: false, error: "Unknown status." };

  const userId = await sessionUserId();
  if (!userId) return { ok: false, error: "Not signed in." };

  const result = await updateTaskStatus(id.data, status.data, userId);
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/");
  return { ok: true };
}

// --- Missions --------------------------------------------------------------

export type CreateMissionActionResult =
  | { ok: true; missionId: string }
  | { ok: false; error: string };

const CreateMissionInput = z.object({
  name: NameField,
  targetDate: DateField,
});

/** Create a mission from the form. Returns the new id so the client can switch
 *  the board to it. */
export async function createMissionAction(
  input: z.input<typeof CreateMissionInput>,
): Promise<CreateMissionActionResult> {
  const parsed = CreateMissionInput.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid mission.",
    };
  }
  const userId = await sessionUserId();
  if (!userId) return { ok: false, error: "Not signed in." };

  const res = await createMission(
    { name: parsed.data.name, targetDate: parsed.data.targetDate },
    userId,
  );
  revalidatePath("/");
  return { ok: true, missionId: res.mission.id };
}

export type MutationActionResult = { ok: true } | { ok: false; error: string };

const UpdateMissionInput = z.object({
  missionId: z.string().uuid(),
  name: NameField.optional(),
  targetDate: DateField,
});

/** Edit a mission's name / target date. */
export async function updateMissionAction(
  input: z.input<typeof UpdateMissionInput>,
): Promise<MutationActionResult> {
  const parsed = UpdateMissionInput.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid mission.",
    };
  }
  const userId = await sessionUserId();
  if (!userId) return { ok: false, error: "Not signed in." };

  const { missionId, ...patch } = parsed.data;
  const res = await updateMission(missionId, patch, userId);
  if (!res.ok) return { ok: false, error: res.error };

  revalidatePath("/");
  return { ok: true };
}

// --- Tasks -----------------------------------------------------------------

export type CreateTaskActionResult =
  | { ok: true; taskId: string }
  | { ok: false; error: string };

const CreateTaskInput = z.object({
  missionId: z.string().uuid(),
  name: NameField,
  categorySlug: CategorySlugField,
  tooLateBy: DateField,
  notBefore: DateField,
});

/** Create a task on a mission (defaults to the "general" category when no slug
 *  is given — see createTask). */
export async function createTaskAction(
  input: z.input<typeof CreateTaskInput>,
): Promise<CreateTaskActionResult> {
  const parsed = CreateTaskInput.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid task.",
    };
  }
  const userId = await sessionUserId();
  if (!userId) return { ok: false, error: "Not signed in." };

  const res = await createTask(parsed.data, userId);
  if (!res.ok) return { ok: false, error: res.error };

  revalidatePath("/");
  return { ok: true, taskId: res.task.id };
}

const UpdateTaskInput = z.object({
  taskId: z.string().uuid(),
  name: NameField.optional(),
  notes: NotesField,
  categorySlug: CategorySlugField,
  status: StatusField,
  tooLateBy: DateField,
  notBefore: DateField,
});

/** Edit a task's fields (name, notes, category, status, dates). */
export async function updateTaskAction(
  input: z.input<typeof UpdateTaskInput>,
): Promise<MutationActionResult> {
  const parsed = UpdateTaskInput.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid task.",
    };
  }
  const userId = await sessionUserId();
  if (!userId) return { ok: false, error: "Not signed in." };

  const { taskId, ...patch } = parsed.data;
  const res = await updateTask(taskId, patch, userId);
  if (!res.ok) return { ok: false, error: res.error };

  revalidatePath("/");
  return { ok: true };
}
