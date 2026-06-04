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
  // The brand cards (opengraph-image / twitter-image / apple-icon / PWA icon
  // PNGs) read bundled TTFs off disk via fs.readFile for next/og. On Vercel each
  // route is a separate serverless function, so the font dir must be traced into
  // every one of their bundles — otherwise satori silently falls back to its
  // default font and the wordmark loses JetBrains Mono. (load.ts already tolerates
  // a missing font, so this only upgrades fidelity; it can't break the build.)
  outputFileTracingIncludes: {
    "/opengraph-image": ["./app/_fonts/**"],
    "/twitter-image": ["./app/_fonts/**"],
    "/apple-icon": ["./app/_fonts/**"],
    "/icon-192.png": ["./app/_fonts/**"],
    "/icon-512.png": ["./app/_fonts/**"],
    "/icon-512-maskable.png": ["./app/_fonts/**"],
  },
  // Next's App Router refuses to route `.`-prefixed folders, so the canonical
  // `/.well-known/*` OAuth-discovery paths Claude.ai fetches are rewritten into
  // normal app routes under /api/mcp/well-known/* (scaffolding-plan.md S6).
  async rewrites() {
    return [
      {
        source: "/.well-known/oauth-authorization-server",
        destination: "/api/mcp/well-known/oauth-authorization-server",
      },
      {
        source: "/.well-known/oauth-protected-resource",
        destination: "/api/mcp/well-known/oauth-protected-resource",
      },
    ];
  },
};

export default config;
