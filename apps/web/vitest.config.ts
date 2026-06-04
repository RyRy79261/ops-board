import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

// apps/web unit tests. Node env (the only suites today are the PURE voice hint
// resolver and the MCP token crypto helpers — no DOM, no DB, no network).
// Scoped to lib/**/__tests__ so it never tries to render RSC pages or import
// "server-only" modules. The `@` alias mirrors tsconfig `paths` so lifted
// tests can import via `@/lib/...` (e.g. the camp-404 MCP tokens test).
export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/__tests__/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": here,
    },
  },
});
