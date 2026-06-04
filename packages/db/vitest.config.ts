import { defineConfig } from "vitest/config";

// @opsboard/db test config. The integration suite under src/**/__tests__/**
// talks to a REAL Postgres at process.env.DATABASE_URL and SKIPS itself when
// none is set, so `pnpm --filter @opsboard/db test` is safe with or without a
// database. Coverage is reported (text + lcov) but NOT gated — the value of
// these tests is the live schema/constraint assertions, not a coverage number.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/__tests__/**/*.test.ts"],
    // The integration suites all migrate + truncate the SAME real Postgres.
    // Run test FILES serially so two suites never race on the non-idempotent
    // `migrate()` bootstrap (drizzle's __drizzle_migrations schema/type
    // creation) or on each other's TRUNCATE-based reset(). In Vitest 4,
    // `fileParallelism: false` forces a single worker (maxWorkers = 1).
    fileParallelism: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
    },
  },
});
