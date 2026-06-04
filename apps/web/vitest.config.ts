import { defineConfig } from "vitest/config";

// apps/web unit tests. Node env (the only suite today is the PURE voice hint
// resolver — no DOM, no DB, no network). Scoped to lib/**/__tests__ so it never
// tries to render RSC pages or import "server-only" modules.
export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/__tests__/**/*.test.ts"],
  },
});
