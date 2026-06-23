import { neon, neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle as drizzleHttp } from "drizzle-orm/neon-http";
import { drizzle as drizzleServerless } from "drizzle-orm/neon-serverless";
import { Pool as NodePgPool } from "pg";
import { drizzle as drizzleNodePg } from "drizzle-orm/node-postgres";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "./schema";

export * as schema from "./schema";

// The voice (S5) + MCP (S6) write layer. Re-exported from the root entry for
// discoverability; the primary import path is the `@opsboard/db/mutations`
// subpath (mirrors `@opsboard/db/tasks` / `/missions`).
export * from "./mutations";

/**
 * The drizzle Postgres database type the query services accept. Deliberately
 * broad: it is the base `PgDatabase` generic parameterised only by our schema,
 * so BOTH the production neon-http client (`createHttpDb`'s `NeonHttpDatabase`)
 * AND a `drizzle-orm/node-postgres` client (used by the integration tests) are
 * assignable to it — every driver's database class extends `PgDatabase`. The
 * services only touch `.select` / `.insert` / `.update` / `.query`, all of
 * which live on this base type, so the real service code runs unchanged
 * against an injected node-postgres client.
 */
export type OpsboardDb = PgDatabase<PgQueryResultHKT, typeof schema>;

// In Node.js (e.g. cron jobs, CLI), use the WebSocket-backed serverless driver.
// In edge / route handlers, prefer the HTTP driver — zero connection cost.

// Placeholder used during `next build`'s page-data collection step, when
// real secrets aren't available. Any actual query will fail loudly.
export const BUILD_PLACEHOLDER_URL =
  "postgres://build:build@localhost:5432/build?sslmode=disable";

function requireDatabaseUrl(): string {
  return process.env.DATABASE_URL ?? BUILD_PLACEHOLDER_URL;
}

// Memoised node-postgres client for the DB_DRIVER=node-postgres seam below.
// Created once per process so the long-running e2e/dev server reuses a single
// connection pool instead of leaking one per createHttpDb() call. The prod
// neon-http path stays stateless and never touches this.
let nodePgDb: OpsboardDb | undefined;

/**
 * HTTP driver — stateless, ideal for route handlers and server components.
 * No transactions.
 *
 * SEAM (e2e / local hermetic): when `DB_DRIVER=node-postgres` is set, return a
 * node-postgres-backed client instead, so the app can run against a throwaway
 * plain-Postgres container with NO Neon endpoint or proxy. This mirrors the
 * `NEON_LOCAL_PROXY` escape hatch in `createPooledDb`; it is purely a driver
 * choice (same `DATABASE_URL`, same parameterised queries) — no auth/data
 * behaviour changes. PRODUCTION never sets `DB_DRIVER`, so it always gets the
 * neon-http client, unchanged. A node-postgres client is assignable to the
 * broad `OpsboardDb` type, so every query service runs against it untouched.
 */
export function createHttpDb(): OpsboardDb {
  if (process.env.DB_DRIVER === "node-postgres") {
    if (!nodePgDb) {
      const pool = new NodePgPool({ connectionString: requireDatabaseUrl() });
      nodePgDb = drizzleNodePg(pool, { schema });
    }
    return nodePgDb;
  }
  const sql = neon(requireDatabaseUrl());
  return drizzleHttp(sql, { schema });
}

/**
 * Pooled WebSocket driver — use when transactions are required.
 * Caller is responsible for closing the pool on long-running processes.
 */
export function createPooledDb() {
  // Allow self-hosted Neon proxy in development environments.
  if (process.env.NEON_LOCAL_PROXY === "1") {
    neonConfig.useSecureWebSocket = false;
    neonConfig.wsProxy = (host) => `${host}:5433/v1`;
  }
  const pool = new Pool({ connectionString: requireDatabaseUrl() });
  const db = drizzleServerless(pool, { schema });
  return { db, pool };
}

export type Database = ReturnType<typeof createHttpDb>;
