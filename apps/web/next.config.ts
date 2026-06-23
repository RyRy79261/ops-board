import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

// Content-Security-Policy. Everything this app loads is same-origin: scripts +
// fonts (next/font/local) + the next/og images are served from this origin, the
// auth client + voice/research APIs are same-origin /api/* fetches (the AI
// vendors are called server-side), and the waveform is a self-contained canvas.
// So the fetch directives are 'self' (+ data: images). 'unsafe-inline' is
// required for React's inline style attributes (the category pills set
// backgroundColor inline); 'unsafe-eval' is added ONLY in true development
// (Next's HMR / refresh runtime evals — production App-Router bundles don't, and
// `test`/other non-prod modes never serve the app, so they don't need it
// either). form-action is deliberately left UNRESTRICTED so a future OAuth POST
// flow can't be silently broken (the e2e harness authenticates via a seam, so it
// can't verify the real sign-in path). A nonce-based script-src is the next
// tightening step.
const cspDev = process.env.NODE_ENV === "development";
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${cspDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
].join("; ");

// Permissions-Policy: deny every powerful feature except the microphone, which
// the voice capture (getUserMedia({ audio })) needs — allowed same-origin only.
const permissionsPolicy = [
  "camera=()",
  "microphone=(self)",
  "geolocation=()",
  "payment=()",
  "usb=()",
  "browsing-topics=()",
].join(", ");

const config: NextConfig = {
  reactStrictMode: true,
  // Pin the monorepo root (apps/web → two levels up) so Next doesn't infer it
  // from an unrelated lockfile elsewhere on the machine.
  turbopack: { root: path.join(here, "..", "..") },
  // DEV-ONLY: allow the e2e harness (Playwright drives the app over
  // http://127.0.0.1) to load Next's dev resources (the HMR socket + React
  // refresh runtime), which Next 16 otherwise blocks as cross-origin — that
  // block stalls client hydration. Ignored entirely in production builds.
  allowedDevOrigins: ["127.0.0.1"],
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
  // Baseline security response headers on every route: clickjacking / MIME-
  // sniffing / referrer leakage / forced TLS, plus a Content-Security-Policy and
  // a Permissions-Policy (see the policy definitions above). The per-route MCP
  // CORS headers still apply on top.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "Permissions-Policy", value: permissionsPolicy },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
        ],
      },
    ];
  },
};

export default config;
