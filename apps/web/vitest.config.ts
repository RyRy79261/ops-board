import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

// apps/web unit + integration tests. Node env. Two kinds of suite live here:
//   - PURE unit suites (voice hint resolver, MCP token crypto) — no DB/network.
//   - The voice-command PIPELINE integration suite (voice-pipeline.test.ts):
//     real safeParseIntent → executeIntent against a real Postgres
//     (process.env.DATABASE_URL), with the external Groq/Anthropic vendor calls
//     mocked. It self-SKIPS when no DATABASE_URL is set.
//
// Scoped to lib/**/__tests__. The `@` alias mirrors tsconfig `paths` so tests
// import via `@/lib/...`. `server-only` is aliased to an empty stub: the
// executor (lib/voice-execute.ts) guards itself with `import "server-only"`,
// which throws outside a React Server context (i.e. under vitest); the stub
// neutralises that marker so the pipeline suite can import the real executor.
export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/__tests__/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": here,
      "server-only": path.resolve(here, "test/stubs/server-only.ts"),
    },
  },
});
