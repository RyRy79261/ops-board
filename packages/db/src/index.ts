import { neon, neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle as drizzleHttp } from "drizzle-orm/neon-http";
import { drizzle as drizzleServerless } from "drizzle-orm/neon-serverless";
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

/**
 * HTTP driver — stateless, ideal for route handlers and server components.
 * No transactions.
 */
export function createHttpDb() {
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
