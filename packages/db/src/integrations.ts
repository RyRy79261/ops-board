import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { createHttpDb } from "./index";
import type { OpsboardDb } from "./index";
import * as schema from "./schema";
import type { Integration, MissionIntegration } from "./schema";

// @opsboard/db/integrations — external apps registered as RESEARCH CONTEXT
// SOURCES. An integration carries a standing `context` document; linking it to
// a mission makes cue-time research jobs snapshot the merged linked context
// (research_jobs.context) into the synthesis prompt. Mirrors ./mutations.ts
// style: input guards before SQL, injected `db` LAST param, {ok}|{ok:false}
// results for domain failures, EVERYTHING owner-scoped by userId.

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(v: unknown): v is string {
  return typeof v === "string" && UUID_RE.test(v);
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

/**
 * Hard cap on ONE integration's context document — it enters a prompt, so an
 * unbounded blob is token spend and injection surface. Enforced here (the
 * write boundary), re-checked by the Zod schemas upstream.
 */
export const MAX_CONTEXT_CHARS = 4000;

/** Cap on the MERGED per-mission snapshot written to research_jobs.context. */
export const MAX_MERGED_CONTEXT_CHARS = 8000;

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,62}[a-z0-9]?$/;

export type IntegrationResult =
  | { ok: true; integration: Integration }
  | { ok: false; error: string };

export interface CreateIntegrationInput {
  name: string;
  /** Stable machine identifier, unique per user (e.g. "van-build"). */
  slug: string;
  description?: string | null;
  context?: string;
}

export interface UpdateIntegrationPatch {
  name?: string;
  description?: string | null;
  /** Replaces the whole context document (it's a document, not a log). */
  context?: string;
}

export async function createIntegration(
  input: CreateIntegrationInput,
  userId: string,
  db: OpsboardDb = createHttpDb(),
): Promise<IntegrationResult> {
  if (!isNonEmptyString(input.name)) {
    throw new TypeError("createIntegration: `name` must be a non-empty string.");
  }
  if (!isNonEmptyString(userId)) {
    throw new TypeError("createIntegration: `userId` must be a non-empty string.");
  }
  if (typeof input.slug !== "string" || !SLUG_RE.test(input.slug)) {
    return {
      ok: false,
      error: "Slug must be lowercase letters, digits, and hyphens (max 64).",
    };
  }
  if ((input.context ?? "").length > MAX_CONTEXT_CHARS) {
    return {
      ok: false,
      error: `Context is limited to ${MAX_CONTEXT_CHARS} characters.`,
    };
  }

  // Read-then-write on (userId, slug); the unique index backstops the race.
  const [existing] = await db
    .select({ id: schema.integrations.id })
    .from(schema.integrations)
    .where(
      and(
        eq(schema.integrations.userId, userId),
        eq(schema.integrations.slug, input.slug),
      ),
    )
    .limit(1);
  if (existing) {
    return { ok: false, error: `An integration "${input.slug}" already exists.` };
  }

  const [integration] = await db
    .insert(schema.integrations)
    .values({
      userId,
      name: input.name.trim(),
      slug: input.slug,
      description: input.description ?? null,
      context: input.context ?? "",
    })
    .onConflictDoNothing()
    .returning();
  if (!integration) {
    return { ok: false, error: `An integration "${input.slug}" already exists.` };
  }
  return { ok: true, integration };
}

export async function updateIntegration(
  id: string,
  patch: UpdateIntegrationPatch,
  userId: string,
  db: OpsboardDb = createHttpDb(),
): Promise<IntegrationResult> {
  if (!isUuid(id)) {
    throw new TypeError("updateIntegration: `id` must be a valid UUID.");
  }
  if (!isNonEmptyString(userId)) {
    throw new TypeError("updateIntegration: `userId` must be a non-empty string.");
  }
  if (patch.name !== undefined && !isNonEmptyString(patch.name)) {
    return { ok: false, error: "Name can't be empty." };
  }
  if (
    patch.context !== undefined &&
    (typeof patch.context !== "string" ||
      patch.context.length > MAX_CONTEXT_CHARS)
  ) {
    return {
      ok: false,
      error: `Context is limited to ${MAX_CONTEXT_CHARS} characters.`,
    };
  }
  if (
    patch.name === undefined &&
    patch.description === undefined &&
    patch.context === undefined
  ) {
    return { ok: false, error: "Provide at least one field to update." };
  }

  const set: Partial<typeof schema.integrations.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (patch.name !== undefined) set.name = patch.name.trim();
  if (patch.description !== undefined) set.description = patch.description;
  if (patch.context !== undefined) set.context = patch.context;

  const [row] = await db
    .update(schema.integrations)
    .set(set)
    .where(
      and(eq(schema.integrations.id, id), eq(schema.integrations.userId, userId)),
    )
    .returning();
  if (!row) return { ok: false, error: "Integration not found." };
  return { ok: true, integration: row };
}

/** One integration, owner-scoped. Null when absent/foreign. */
export async function getIntegration(
  id: string,
  userId: string,
  db: OpsboardDb = createHttpDb(),
): Promise<Integration | null> {
  if (!isUuid(id)) {
    throw new TypeError("getIntegration: `id` must be a valid UUID.");
  }
  if (!isNonEmptyString(userId)) {
    throw new TypeError("getIntegration: `userId` must be a non-empty string.");
  }
  const [row] = await db
    .select()
    .from(schema.integrations)
    .where(
      and(eq(schema.integrations.id, id), eq(schema.integrations.userId, userId)),
    )
    .limit(1);
  return row ?? null;
}

/** A user's integrations, newest first. */
export async function listIntegrations(
  userId: string,
  db: OpsboardDb = createHttpDb(),
): Promise<Integration[]> {
  if (!isNonEmptyString(userId)) {
    throw new TypeError("listIntegrations: `userId` must be a non-empty string.");
  }
  return db
    .select()
    .from(schema.integrations)
    .where(eq(schema.integrations.userId, userId))
    .orderBy(desc(schema.integrations.createdAt));
}

/** Delete an integration (links cascade). Owner-scoped; foreign → {ok:false}. */
export async function deleteIntegration(
  id: string,
  userId: string,
  db: OpsboardDb = createHttpDb(),
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isUuid(id)) {
    throw new TypeError("deleteIntegration: `id` must be a valid UUID.");
  }
  if (!isNonEmptyString(userId)) {
    throw new TypeError("deleteIntegration: `userId` must be a non-empty string.");
  }
  const [row] = await db
    .delete(schema.integrations)
    .where(
      and(eq(schema.integrations.id, id), eq(schema.integrations.userId, userId)),
    )
    .returning({ id: schema.integrations.id });
  if (!row) return { ok: false, error: "Integration not found." };
  return { ok: true };
}

/**
 * Link an integration to a mission. BOTH endpoints must belong to `userId`
 * (verified before the insert — the FKs only enforce existence). Idempotent:
 * linking an already-linked pair succeeds.
 */
export async function linkIntegrationToMission(
  missionId: string,
  integrationId: string,
  userId: string,
  db: OpsboardDb = createHttpDb(),
): Promise<{ ok: true; link: MissionIntegration } | { ok: false; error: string }> {
  if (!isUuid(missionId) || !isUuid(integrationId)) {
    throw new TypeError(
      "linkIntegrationToMission: `missionId` and `integrationId` must be valid UUIDs.",
    );
  }
  if (!isNonEmptyString(userId)) {
    throw new TypeError(
      "linkIntegrationToMission: `userId` must be a non-empty string.",
    );
  }

  const [mission] = await db
    .select({ id: schema.missions.id })
    .from(schema.missions)
    .where(
      and(eq(schema.missions.id, missionId), eq(schema.missions.userId, userId)),
    )
    .limit(1);
  const [integration] = await db
    .select({ id: schema.integrations.id })
    .from(schema.integrations)
    .where(
      and(
        eq(schema.integrations.id, integrationId),
        eq(schema.integrations.userId, userId),
      ),
    )
    .limit(1);
  if (!mission || !integration) {
    return { ok: false, error: "Mission or integration not found." };
  }

  const [link] = await db
    .insert(schema.missionIntegrations)
    .values({ missionId, integrationId })
    .onConflictDoNothing({
      target: [
        schema.missionIntegrations.missionId,
        schema.missionIntegrations.integrationId,
      ],
    })
    .returning();
  if (link) return { ok: true, link };

  // Already linked — return the existing row (idempotent).
  const [existing] = await db
    .select()
    .from(schema.missionIntegrations)
    .where(
      and(
        eq(schema.missionIntegrations.missionId, missionId),
        eq(schema.missionIntegrations.integrationId, integrationId),
      ),
    )
    .limit(1);
  if (existing) return { ok: true, link: existing };
  return { ok: false, error: "Couldn't link — try again." };
}

/** Remove a mission↔integration link. Idempotent; scoped via the mission. */
export async function unlinkIntegrationFromMission(
  missionId: string,
  integrationId: string,
  userId: string,
  db: OpsboardDb = createHttpDb(),
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isUuid(missionId) || !isUuid(integrationId)) {
    throw new TypeError(
      "unlinkIntegrationFromMission: `missionId` and `integrationId` must be valid UUIDs.",
    );
  }
  if (!isNonEmptyString(userId)) {
    throw new TypeError(
      "unlinkIntegrationFromMission: `userId` must be a non-empty string.",
    );
  }
  // Ownership gate: the mission must be the caller's (a foreign pair reads as
  // not-found, and an unowned link can never be removed).
  const [mission] = await db
    .select({ id: schema.missions.id })
    .from(schema.missions)
    .where(
      and(eq(schema.missions.id, missionId), eq(schema.missions.userId, userId)),
    )
    .limit(1);
  if (!mission) return { ok: false, error: "Mission or integration not found." };

  await db
    .delete(schema.missionIntegrations)
    .where(
      and(
        eq(schema.missionIntegrations.missionId, missionId),
        eq(schema.missionIntegrations.integrationId, integrationId),
      ),
    );
  return { ok: true };
}

/** A mission's linked integrations (owner-scoped via the mission), oldest link first. */
export async function listIntegrationsForMission(
  missionId: string,
  userId: string,
  db: OpsboardDb = createHttpDb(),
): Promise<Integration[]> {
  if (!isUuid(missionId)) {
    throw new TypeError(
      "listIntegrationsForMission: `missionId` must be a valid UUID.",
    );
  }
  if (!isNonEmptyString(userId)) {
    throw new TypeError(
      "listIntegrationsForMission: `userId` must be a non-empty string.",
    );
  }
  const rows = await db
    .select({
      integration: schema.integrations,
      linkedAt: schema.missionIntegrations.createdAt,
    })
    .from(schema.missionIntegrations)
    .innerJoin(
      schema.integrations,
      eq(schema.missionIntegrations.integrationId, schema.integrations.id),
    )
    .where(
      and(
        eq(schema.integrations.userId, userId),
        inArray(
          schema.missionIntegrations.missionId,
          db
            .select({ id: schema.missions.id })
            .from(schema.missions)
            .where(
              and(
                eq(schema.missions.id, missionId),
                eq(schema.missions.userId, userId),
              ),
            ),
        ),
      ),
    )
    .orderBy(asc(schema.missionIntegrations.createdAt));
  return rows.map((r) => r.integration);
}

/**
 * The merged context SNAPSHOT for a mission — what cue-time writes onto
 * research_jobs.context. Each linked integration contributes a labelled block
 * (oldest link first, so long-standing sources keep priority when the merged
 * cap truncates); empty contexts are skipped. Returns null when nothing is
 * linked / nothing has content, so the job row stays NULL rather than "".
 */
export async function getMergedContextForMission(
  missionId: string,
  userId: string,
  db: OpsboardDb = createHttpDb(),
): Promise<string | null> {
  const linked = await listIntegrationsForMission(missionId, userId, db);
  const blocks = linked
    .filter((i) => i.context.trim().length > 0)
    .map((i) => `[${i.name}]\n${i.context.trim()}`);
  if (blocks.length === 0) return null;
  let merged = blocks.join("\n\n");
  if (merged.length > MAX_MERGED_CONTEXT_CHARS) {
    merged = `${merged.slice(0, MAX_MERGED_CONTEXT_CHARS - 1)}…`;
  }
  return merged;
}
