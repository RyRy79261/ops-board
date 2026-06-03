import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

const config: NextConfig = {
  reactStrictMode: true,
  // Pin the monorepo root (apps/web → two levels up) so Next doesn't infer it
  // from an unrelated lockfile elsewhere on the machine.
  turbopack: { root: path.join(here, "..", "..") },
  transpilePackages: [
    "@opsboard/ui",
    "@opsboard/types",
    "@opsboard/core",
    "@opsboard/ai-prompts",
    "@opsboard/db",
  ],
  typedRoutes: true,
  // S6 adds `/.well-known/*` rewrites for the MCP OAuth metadata routes
  // (Next's App Router won't serve `.`-prefixed folders directly).
};

export default config;
