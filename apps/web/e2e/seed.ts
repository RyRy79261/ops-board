import { sql } from "drizzle-orm";
import { createTestDb, type TestDb } from "@opsboard/db/testing";
import { users } from "@opsboard/db/schema";

// E2E database seeding, built on the SAME @opsboard/db/testing harness the
// integration suites use (node-postgres against process.env.DATABASE_URL — a
// throwaway Postgres or a Neon branch). The running app reads the same DB via
// createHttpDb's DB_DRIVER=node-postgres seam.

/** The pre-onboarded principal the e2e auth seam authenticates as. */
export const E2E_USER = {
  userId: "user_e2e_alpha",
  email: "e2e@example.test",
} as const;

// Domain tables wiped between specs — deliberately NOT `users` (the auth seam
// needs the seeded row to persist). CASCADE handles FK order; categories are
// reseeded immediately after.
const DOMAIN_TABLES =
  "task_research_notes, research_jobs, task_dependencies, tasks, missions, categories";

async function withDb<T>(fn: (t: TestDb) => Promise<T>): Promise<T> {
  const t = createTestDb(process.env.DATABASE_URL);
  try {
    return await fn(t);
  } finally {
    await t.close();
  }
}

/** Migrate the schema, then seed a clean baseline. Run once in global setup. */
export async function migrateAndSeed(): Promise<void> {
  await withDb(async (t) => {
    await t.migrate();
    await seedBaseline(t);
  });
}

/** Wipe domain data + reseed categories + the onboarded e2e user. Per-spec. */
export async function resetData(): Promise<void> {
  await withDb(seedBaseline);
}

async function seedBaseline(t: TestDb): Promise<void> {
  await t.client.execute(
    sql.raw(`TRUNCATE TABLE ${DOMAIN_TABLES} RESTART IDENTITY CASCADE`),
  );
  await t.seedCategories();
  await t.client
    .insert(users)
    .values({
      id: E2E_USER.userId,
      email: E2E_USER.email,
      // Non-null setup_completed_at → requireOnboardedUser passes the /setup gate
      // without the BYO-keys wizard (CRUD flows never call the vendor APIs).
      setupCompletedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: users.id,
      set: { setupCompletedAt: new Date() },
    });
}
