import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/__tests__/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/__tests__/**", "src/index.ts"],
      // @opsboard/core is the pure, critical derivation layer — hold it high.
      // Floors sit just under current (lines 98 / stmts 95 / funcs 100 / branch 84):
      // high enough to catch real regressions, realistic for defensive guards
      // (branch coverage on impossible-state guards is testing theater above ~80).
      thresholds: {
        lines: 95,
        functions: 95,
        statements: 90,
        branches: 80,
      },
    },
  },
});
