import { eq } from "drizzle-orm";
import { createHttpDb } from "./index";
import type { OpsboardDb } from "./index";
import * as schema from "./schema";

// @opsboard/db/preferences — read/write access for the per-user app preferences
// (`user_preferences`). Mirrors the other services: an optional injected
// `db: OpsboardDb = createHttpDb()` LAST param so the integration harness drives
// the real production code. Guards userId at the boundary like mutations.ts.

/** The resolved preference shape (always fully populated — defaults applied). */
export interface UserPreferences {
  voiceConfirmDestructive: boolean;
  notifyClosingWindows: boolean;
}

/** The single source of defaults — used when a user has no row yet. Mirrors
 *  the column defaults in schema.ts so "no row" and "default row" agree. */
export const DEFAULT_PREFERENCES: UserPreferences = {
  voiceConfirmDestructive: true,
  notifyClosingWindows: false,
};

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

/**
 * Read a user's preferences, applying defaults for any user without a row yet.
 * Always returns a fully-populated object — callers never branch on null.
 */
export async function getUserPreferences(
  userId: string,
  db: OpsboardDb = createHttpDb(),
): Promise<UserPreferences> {
  const [row] = await db
    .select()
    .from(schema.userPreferences)
    .where(eq(schema.userPreferences.userId, userId))
    .limit(1);
  if (!row) return { ...DEFAULT_PREFERENCES };
  return {
    voiceConfirmDestructive: row.voiceConfirmDestructive,
    notifyClosingWindows: row.notifyClosingWindows,
  };
}

/**
 * Upsert a partial preferences patch for a user (insert the row with defaults +
 * the patch if absent, else update only the supplied fields). Returns the full
 * resolved preferences after the write. Bumps `updated_at`.
 */
export async function setUserPreferences(
  userId: string,
  patch: Partial<UserPreferences>,
  db: OpsboardDb = createHttpDb(),
): Promise<UserPreferences> {
  if (!isNonEmptyString(userId)) {
    throw new TypeError(
      "setUserPreferences: `userId` must be a non-empty string.",
    );
  }
  const now = new Date();
  // Build the insert row from defaults + patch; the update set is the patch only.
  const merged: UserPreferences = { ...DEFAULT_PREFERENCES, ...patch };
  const updateSet: Record<string, unknown> = { updatedAt: now };
  if (patch.voiceConfirmDestructive !== undefined) {
    updateSet.voiceConfirmDestructive = patch.voiceConfirmDestructive;
  }
  if (patch.notifyClosingWindows !== undefined) {
    updateSet.notifyClosingWindows = patch.notifyClosingWindows;
  }

  await db
    .insert(schema.userPreferences)
    .values({
      userId,
      voiceConfirmDestructive: merged.voiceConfirmDestructive,
      notifyClosingWindows: merged.notifyClosingWindows,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: schema.userPreferences.userId,
      set: updateSet,
    });

  return getUserPreferences(userId, db);
}
