"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { updateTaskStatus } from "@opsboard/db/tasks";
import {
  createMission,
  updateMission,
  deleteMission,
  createTask,
} from "@opsboard/db/mutations";
import { auth } from "@/lib/neon-auth";
import { ensureUserSynced } from "@/lib/auth-middleware";
import {
  NameField,
  DateField,
  PatchDateField,
  CategorySlugField,
} from "@/lib/form-fields";

// The board's write-side Server Actions — the NON-VOICE create/edit path (the
// keyboard/pointer counterpart to the voice + MCP surfaces). Each mirrors the
// camp-404 page/action/client triad: co-located "use server", Zod boundary
// validation, the verified session principal resolved here (NEVER taken from
// args), the scoped @opsboard/db mutation, and a revalidatePath("/") so the RSC
// re-reads the board. All return the {ok:true,...} | {ok:false,error} shape the
// client islands branch on — including on unexpected DB throws (wrapped so an
// infra error surfaces inline, not as an unhandled Server Action exception).
//
// NOTE: task EDIT (updateTask) is intentionally NOT wired here yet — it lands in
// PR2 alongside the per-card edit affordance + the LOCKED-#4 TaskCard decision.

/** Resolve the verified session user (synced into our mirror), or null. userId
 *  is ALWAYS the session principal — never client input. */
async function sessionUserId(): Promise<string | null> {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) return null;
  const userId = session.user.id;
  await ensureUserSynced(userId, session.user.email?.toLowerCase() ?? null);
  return userId;
}

// Shared field validators (NameField / DateField / PatchDateField /
// CategorySlugField) live in @/lib/form-fields so their date/patch semantics are
// unit-testable without this server-only module.

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

  try {
    const result = await updateTaskStatus(id.data, status.data, userId);
    if (!result.ok) return { ok: false, error: result.error };
    revalidatePath("/");
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't update the task. Try again." };
  }
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

  try {
    const res = await createMission(
      { name: parsed.data.name, targetDate: parsed.data.targetDate },
      userId,
    );
    revalidatePath("/");
    return { ok: true, missionId: res.mission.id };
  } catch {
    return { ok: false, error: "Couldn't create the mission. Try again." };
  }
}

export type MutationActionResult = { ok: true } | { ok: false; error: string };

const UpdateMissionInput = z
  .object({
    missionId: z.string().uuid(),
    name: NameField.optional(),
    // PATCH semantics: an absent targetDate is left UNCHANGED (undefined → the
    // mutation drops it from SET). Only an explicit "" / null clears it. Using
    // DateField here was a data-loss bug — it coerced an absent key to null, so
    // a name-only edit silently wiped the target date.
    targetDate: PatchDateField,
  })
  .refine((d) => d.name !== undefined || d.targetDate !== undefined, {
    message: "Nothing to update.",
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
  try {
    const res = await updateMission(missionId, patch, userId);
    if (!res.ok) return { ok: false, error: res.error };
    revalidatePath("/");
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't update the mission. Try again." };
  }
}

const MissionId = z.string().uuid();

/** Delete a mission (cascades to its tasks + dependency edges). Owner-scoped +
 *  idempotent at the db layer. The settings surface gates this behind a
 *  type-the-name confirmation. */
export async function deleteMissionAction(
  missionId: string,
): Promise<MutationActionResult> {
  const id = MissionId.safeParse(missionId);
  if (!id.success) return { ok: false, error: "Invalid mission." };

  const userId = await sessionUserId();
  if (!userId) return { ok: false, error: "Not signed in." };

  try {
    const res = await deleteMission(id.data, userId);
    if (!res.ok) return { ok: false, error: res.error };
    revalidatePath("/");
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't delete the mission. Try again." };
  }
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

  try {
    const res = await createTask(parsed.data, userId);
    if (!res.ok) return { ok: false, error: res.error };
    revalidatePath("/");
    return { ok: true, taskId: res.task.id };
  } catch {
    return { ok: false, error: "Couldn't create the task. Try again." };
  }
}
