import { eq, inArray } from "drizzle-orm";
import { createHttpDb } from "./index";
import type { OpsboardDb } from "./index";
import * as schema from "./schema";
import { getUserPreferences, type UserPreferences } from "./preferences";

// @opsboard/db/account — account-level operations: a full data export and the
// cascade-delete. Mirrors the other services (optional injected
// `db: OpsboardDb = createHttpDb()` LAST param). Crypto-FREE: the export reports
// only WHICH providers have a key configured, NEVER the encrypted blobs or last4.

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

/** A user's full OpsBoard data, for the "export my data" download. No secrets. */
export interface UserAccountExport {
  user: {
    id: string;
    email: string;
    setupCompletedAt: string | null;
    createdAt: string;
  };
  preferences: UserPreferences;
  /** Which providers have a key stored — NEVER the key material itself. */
  configuredKeyProviders: ("anthropic" | "groq")[];
  /** The global category catalogue (referenced by tasks via slug). */
  categories: { slug: string; name: string }[];
  missions: {
    id: string;
    name: string;
    targetDate: string | null;
    createdAt: string;
    tasks: {
      id: string;
      name: string;
      status: string;
      categoryId: string | null;
      tooLateBy: string | null;
      notBefore: string | null;
      notes: string | null;
      createdAt: string;
    }[];
  }[];
  /** All dependency edges among the user's tasks. */
  dependencies: { taskId: string; dependsOnId: string }[];
}

/**
 * Gather a user's full OpsBoard data for export. Every read is scoped to
 * `userId`. Tasks carry a denormalized `userId`, so they (and their dependency
 * edges) are fetched directly without a per-mission fan-out. The encrypted key
 * blobs are NEVER read — only the set of configured providers is reported.
 */
export async function getUserAccountExport(
  userId: string,
  db: OpsboardDb = createHttpDb(),
): Promise<UserAccountExport> {
  const [userRow] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  const [
    preferences,
    keyRow,
    categoryRows,
    missionRows,
    taskRows,
  ] = await Promise.all([
    getUserPreferences(userId, db),
    db
      .select()
      .from(schema.userApiKeys)
      .where(eq(schema.userApiKeys.userId, userId))
      .limit(1)
      .then((r) => r[0] ?? null),
    db.select().from(schema.categories),
    db.select().from(schema.missions).where(eq(schema.missions.userId, userId)),
    db.select().from(schema.tasks).where(eq(schema.tasks.userId, userId)),
  ]);

  // Dependency edges among THIS user's tasks (deps carry no userId — filter by
  // the user's task ids; skip the query entirely when the user has no tasks).
  const taskIds = taskRows.map((t) => t.id);
  const depRows =
    taskIds.length > 0
      ? await db
          .select()
          .from(schema.taskDependencies)
          .where(inArray(schema.taskDependencies.taskId, taskIds))
      : [];

  const configuredKeyProviders: ("anthropic" | "groq")[] = [];
  if (keyRow?.anthropicKeyEncrypted) configuredKeyProviders.push("anthropic");
  if (keyRow?.groqKeyEncrypted) configuredKeyProviders.push("groq");

  const tasksByMission = new Map<string, UserAccountExport["missions"][number]["tasks"]>();
  for (const t of taskRows) {
    const list = tasksByMission.get(t.missionId) ?? [];
    list.push({
      id: t.id,
      name: t.name,
      status: t.status,
      categoryId: t.categoryId,
      tooLateBy: t.tooLateBy,
      notBefore: t.notBefore,
      notes: t.notes,
      createdAt: t.createdAt.toISOString(),
    });
    tasksByMission.set(t.missionId, list);
  }

  return {
    user: {
      id: userId,
      email: userRow?.email ?? "",
      setupCompletedAt: userRow?.setupCompletedAt?.toISOString() ?? null,
      createdAt: userRow?.createdAt?.toISOString() ?? "",
    },
    preferences,
    configuredKeyProviders,
    categories: categoryRows.map((c) => ({ slug: c.slug, name: c.name })),
    missions: missionRows.map((m) => ({
      id: m.id,
      name: m.name,
      targetDate: m.targetDate,
      createdAt: m.createdAt.toISOString(),
      tasks: tasksByMission.get(m.id) ?? [],
    })),
    dependencies: depRows.map((e) => ({
      taskId: e.taskId,
      dependsOnId: e.dependsOnId,
    })),
  };
}

/**
 * Permanently delete a user's OpsBoard row. The `ON DELETE CASCADE` FKs sweep
 * everything user-scoped — missions, tasks, dependency edges, the BYO key vault,
 * preferences, and outstanding MCP auth codes / access tokens. The MCP audit log
 * (nullable principal, no FK) is intentionally retained for forensic history.
 *
 * This deletes only OpsBoard's mirror + data. Removing the Neon Auth IDENTITY is
 * a separate, best-effort step the caller performs (see /api/account), since it
 * depends on the hosted Neon Auth "delete user" feature being enabled. Returns
 * the number of user rows removed (1 normally, 0 if already gone — idempotent).
 */
export async function deleteUserAccount(
  userId: string,
  db: OpsboardDb = createHttpDb(),
): Promise<number> {
  if (!isNonEmptyString(userId)) {
    throw new TypeError("deleteUserAccount: `userId` must be a non-empty string.");
  }
  const deleted = await db
    .delete(schema.users)
    .where(eq(schema.users.id, userId))
    .returning({ id: schema.users.id });
  return deleted.length;
}
