import type { FullConfig } from "@playwright/test";
import { migrateAndSeed } from "./seed";

// Runs once before the suite: migrate the schema + seed the baseline (categories
// + the onboarded e2e user) into the throwaway database.
export default async function globalSetup(_config: FullConfig): Promise<void> {
  // SAFETY: seeding TRUNCATEs tables, so refuse to touch any database unless the
  // explicit e2e flag is set — this can never wipe a real/dev DB by accident
  // (e.g. a stray DATABASE_URL). The e2e runner + CI job both set E2E_TEST_AUTH.
  if (process.env.E2E_TEST_AUTH !== "1") {
    throw new Error(
      "[e2e] refusing to seed: E2E_TEST_AUTH must be '1' (the destructive seed " +
        "only runs in an explicit e2e context). Use `pnpm --filter @opsboard/web e2e:local`.",
    );
  }
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "[e2e] DATABASE_URL must be set to a throwaway Postgres or a Neon branch. " +
        "Locally, run `pnpm --filter @opsboard/web e2e:local` (spins one in Docker). " +
        "See apps/web/e2e/README.md.",
    );
  }
  await migrateAndSeed();
}
