import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createMission, createTask } from "../mutations";
import { createResearchJob, getResearchJob } from "../research";
import {
  createIntegration,
  updateIntegration,
  getIntegration,
  listIntegrations,
  deleteIntegration,
  linkIntegrationToMission,
  unlinkIntegrationFromMission,
  listIntegrationsForMission,
  getMergedContextForMission,
  MAX_CONTEXT_CHARS,
  MAX_MERGED_CONTEXT_CHARS,
} from "../integrations";
import {
  createClientApiKey,
  listClientApiKeys,
  revokeClientApiKey,
  findActiveClientApiKeyByHash,
} from "../client-api-keys";
import { createTestDb, TEST_USER_ID, type TestDb } from "./db-harness";

// Real-Postgres integration suite for @opsboard/db/integrations +
// @opsboard/db/client-api-keys (the v2 research-delegate additions). GUARDED
// like the other integration suites: skipped wholesale without a real
// DATABASE_URL; CI's postgres service provides one and migrate() provisions
// the schema, so the SAME production functions run against a real database.
const DB_URL = process.env.DATABASE_URL;
const hasDb =
  !!DB_URL &&
  !DB_URL.includes("placeholder") &&
  !DB_URL.includes("build:build");

const USER_A = TEST_USER_ID;
const USER_B = "user_test_bravo";

describe.skipIf(!hasDb)("@opsboard/db integrations (real Postgres)", () => {
  let h: TestDb;

  beforeAll(async () => {
    h = createTestDb(DB_URL);
    await h.migrate();
  });

  afterAll(async () => {
    if (h) await h.close();
  });

  beforeEach(async () => {
    await h.reset();
    await h.seedUser(USER_A);
    await h.seedUser(USER_B);
  });

  async function seedMission(userId = USER_A, name = "Van build") {
    // createMission never fails a domain rule — its result is always ok:true.
    const res = await createMission({ name, targetDate: null }, userId, h.db);
    return res.mission;
  }

  async function seedIntegration(
    userId = USER_A,
    overrides: Partial<{ slug: string; context: string; name: string }> = {},
  ) {
    const res = await createIntegration(
      {
        name: overrides.name ?? "Van Build",
        slug: overrides.slug ?? "van-build",
        context: overrides.context ?? "MWB Crafter, 24V / 300Ah.",
      },
      userId,
      h.db,
    );
    if (!res.ok) throw new Error(res.error);
    return res.integration;
  }

  it("creates, lists, updates, and owner-scopes integrations", async () => {
    const integration = await seedIntegration();
    expect(integration.slug).toBe("van-build");

    // Slug is unique PER USER — another user can reuse it.
    const dupe = await createIntegration(
      { name: "Dupe", slug: "van-build" },
      USER_A,
      h.db,
    );
    expect(dupe.ok).toBe(false);
    const other = await createIntegration(
      { name: "Other user's", slug: "van-build" },
      USER_B,
      h.db,
    );
    expect(other.ok).toBe(true);

    // Update replaces the context document; foreign update reads as not found.
    const updated = await updateIntegration(
      integration.id,
      { context: "Now a 48V system." },
      USER_A,
      h.db,
    );
    expect(updated.ok && updated.integration.context).toBe("Now a 48V system.");
    const foreign = await updateIntegration(
      integration.id,
      { context: "hijack" },
      USER_B,
      h.db,
    );
    expect(foreign.ok).toBe(false);

    // Context cap enforced at the write boundary.
    const tooBig = await updateIntegration(
      integration.id,
      { context: "x".repeat(MAX_CONTEXT_CHARS + 1) },
      USER_A,
      h.db,
    );
    expect(tooBig.ok).toBe(false);

    const mine = await listIntegrations(USER_A, h.db);
    expect(mine).toHaveLength(1);
    expect(await getIntegration(integration.id, USER_B, h.db)).toBeNull();
  });

  it("links/unlinks idempotently and owner-scopes both endpoints", async () => {
    const mission = await seedMission();
    const integration = await seedIntegration();

    const link1 = await linkIntegrationToMission(
      mission.id,
      integration.id,
      USER_A,
      h.db,
    );
    expect(link1.ok).toBe(true);
    // Idempotent: second link succeeds and returns the same row.
    const link2 = await linkIntegrationToMission(
      mission.id,
      integration.id,
      USER_A,
      h.db,
    );
    expect(link2.ok && link1.ok && link2.link.id === link1.link.id).toBe(true);

    // A foreign caller can neither link nor see the link.
    const foreignLink = await linkIntegrationToMission(
      mission.id,
      integration.id,
      USER_B,
      h.db,
    );
    expect(foreignLink.ok).toBe(false);
    expect(await listIntegrationsForMission(mission.id, USER_B, h.db)).toEqual(
      [],
    );

    expect(
      (await listIntegrationsForMission(mission.id, USER_A, h.db)).map(
        (i) => i.slug,
      ),
    ).toEqual(["van-build"]);

    const unlink = await unlinkIntegrationFromMission(
      mission.id,
      integration.id,
      USER_A,
      h.db,
    );
    expect(unlink.ok).toBe(true);
    expect(await listIntegrationsForMission(mission.id, USER_A, h.db)).toEqual(
      [],
    );
  });

  it("merges linked contexts into a labelled, capped snapshot (null when empty)", async () => {
    const mission = await seedMission();
    expect(await getMergedContextForMission(mission.id, USER_A, h.db)).toBeNull();

    const van = await seedIntegration(USER_A, {
      slug: "van-build",
      name: "Van Build",
      context: "MWB Crafter, 24V / 300Ah.",
    });
    const blank = await seedIntegration(USER_A, {
      slug: "empty-app",
      name: "Empty",
      context: "   ",
    });
    await linkIntegrationToMission(mission.id, van.id, USER_A, h.db);
    await linkIntegrationToMission(mission.id, blank.id, USER_A, h.db);

    const merged = await getMergedContextForMission(mission.id, USER_A, h.db);
    expect(merged).toBe("[Van Build]\nMWB Crafter, 24V / 300Ah.");

    // The merged snapshot is capped.
    const big = await seedIntegration(USER_A, {
      slug: "big-app",
      name: "Big",
      context: "y".repeat(MAX_CONTEXT_CHARS),
    });
    const big2 = await seedIntegration(USER_A, {
      slug: "big-app-2",
      name: "Big 2",
      context: "z".repeat(MAX_CONTEXT_CHARS),
    });
    const big3 = await seedIntegration(USER_A, {
      slug: "big-app-3",
      name: "Big 3",
      context: "w".repeat(MAX_CONTEXT_CHARS),
    });
    for (const i of [big, big2, big3]) {
      await linkIntegrationToMission(mission.id, i.id, USER_A, h.db);
    }
    const capped = await getMergedContextForMission(mission.id, USER_A, h.db);
    expect(capped!.length).toBeLessThanOrEqual(MAX_MERGED_CONTEXT_CHARS);
  });

  it("snapshots the merged context onto a research job at cue time", async () => {
    const mission = await seedMission();
    const task = await createTask(
      { missionId: mission.id, name: "Gas vs induction" },
      USER_A,
      h.db,
    );
    if (!task.ok) throw new Error(task.error);
    const integration = await seedIntegration();
    await linkIntegrationToMission(mission.id, integration.id, USER_A, h.db);

    const context = await getMergedContextForMission(mission.id, USER_A, h.db);
    const job = await createResearchJob(
      {
        missionId: mission.id,
        taskId: task.task.id,
        query: "gas vs induction",
        context,
      },
      USER_A,
      h.db,
    );
    expect(job.ok).toBe(true);
    if (!job.ok) return;
    const loaded = await getResearchJob(job.job.id, USER_A, h.db);
    expect(loaded?.context).toBe("[Van Build]\nMWB Crafter, 24V / 300Ah.");
  });

  it("deleting an integration cascades its links but not the mission", async () => {
    const mission = await seedMission();
    const integration = await seedIntegration();
    await linkIntegrationToMission(mission.id, integration.id, USER_A, h.db);

    const del = await deleteIntegration(integration.id, USER_A, h.db);
    expect(del.ok).toBe(true);
    expect(await listIntegrationsForMission(mission.id, USER_A, h.db)).toEqual(
      [],
    );
    expect(await getMergedContextForMission(mission.id, USER_A, h.db)).toBeNull();
  });
});

describe.skipIf(!hasDb)("@opsboard/db client-api-keys (real Postgres)", () => {
  let h: TestDb;

  beforeAll(async () => {
    h = createTestDb(DB_URL);
    await h.migrate();
  });

  afterAll(async () => {
    if (h) await h.close();
  });

  beforeEach(async () => {
    await h.reset();
    await h.seedUser(USER_A);
    await h.seedUser(USER_B);
  });

  const HASH = "a".repeat(64);

  it("creates, verifies by hash, and revokes (idempotently)", async () => {
    const created = await createClientApiKey(
      { name: "van-build console", keyHash: HASH, prefix: "opsb_abc12…" },
      USER_A,
      h.db,
    );
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const found = await findActiveClientApiKeyByHash(HASH, h.db);
    expect(found?.id).toBe(created.key.id);
    expect(found?.userId).toBe(USER_A);

    const revoked = await revokeClientApiKey(created.key.id, USER_A, h.db);
    expect(revoked.ok && revoked.key.revokedAt).toBeTruthy();
    // A revoked key no longer verifies.
    expect(await findActiveClientApiKeyByHash(HASH, h.db)).toBeNull();
    // Re-revoking succeeds and KEEPS the original revocation time.
    const again = await revokeClientApiKey(created.key.id, USER_A, h.db);
    expect(
      again.ok &&
        revoked.ok &&
        again.key.revokedAt?.getTime() === revoked.key.revokedAt?.getTime(),
    ).toBe(true);
  });

  it("owner-scopes revocation and listing", async () => {
    const created = await createClientApiKey(
      { name: "mine", keyHash: HASH, prefix: "opsb_abc12…" },
      USER_A,
      h.db,
    );
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const foreign = await revokeClientApiKey(created.key.id, USER_B, h.db);
    expect(foreign.ok).toBe(false);
    // Still active — the foreign revoke touched nothing.
    expect(await findActiveClientApiKeyByHash(HASH, h.db)).not.toBeNull();

    expect(await listClientApiKeys(USER_B, h.db)).toEqual([]);
    expect(await listClientApiKeys(USER_A, h.db)).toHaveLength(1);
  });
});
