import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { sql } from "drizzle-orm";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import * as schema from "../schema";
import type { OpsboardDb } from "../index";
import { CATEGORY_SEEDS } from "../schema";

// Integration-test harness for @opsboard/db. Connects a real
// `drizzle-orm/node-postgres` client to the Postgres at the given connection
// string, runs the committed migrations against it, and exposes helpers to
// seed CATEGORY_SEEDS and to reset table state between test groups.
//
// The node-postgres drizzle client (`NodePgDatabase<typeof schema>`) is
// assignable to the broad `OpsboardDb` type the query services accept, so the
// SAME production service code runs against this client unchanged.

/** The migrations folder, resolved relative to THIS file so cwd never matters. */
const MIGRATIONS_FOLDER = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../migrations",
);

/**
 * Every table the committed migrations create: the four domain tables, the
 * four MCP tables, the `users` table (added in 0002) that the user-scoping FKs
 * target, plus `user_api_keys` (added in 0004) for the BYO key vault.
 */
export const EXPECTED_TABLES = [
  "categories",
  "mcp_access_tokens",
  "mcp_audit_log",
  "mcp_auth_codes",
  "mcp_oauth_clients",
  "missions",
  "task_dependencies",
  "tasks",
  "user_api_keys",
  "user_preferences",
  "users",
] as const;

/** Every table we truncate when resetting state between test groups. */
const ALL_TABLES = [...EXPECTED_TABLES];

/** A default test user id used across the integration suites. */
export const TEST_USER_ID = "user_test_alpha";

export interface TestDb {
  /** The node-postgres drizzle client, typed as the injectable service db. */
  db: OpsboardDb;
  /** The same client at its concrete node-postgres type (for raw helpers). */
  client: NodePgDatabase<typeof schema>;
  /** The underlying pg Pool — close it in afterAll. */
  pool: Pool;
  /** Run the committed migrations against the connected database. */
  migrate(): Promise<void>;
  /** Insert the five default categories (CATEGORY_SEEDS). */
  seedCategories(): Promise<void>;
  /**
   * Insert a user row (the FK target every mission/task scopes against) and
   * return its id. Defaults to TEST_USER_ID; pass an id to create a second
   * user for isolation tests.
   */
  seedUser(id?: string): Promise<string>;
  /** TRUNCATE every table (RESTART IDENTITY CASCADE) — full reset. */
  reset(): Promise<void>;
  /** Assert which of the expected tables exist (via information_schema). */
  listTables(): Promise<string[]>;
  /** Close the pool. */
  close(): Promise<void>;
}

/**
 * Build a test db bound to `connectionString`. Defaults to
 * `process.env.DATABASE_URL`; throws if neither is set (callers should guard
 * with `hasDb` before constructing).
 */
export function createTestDb(connectionString?: string): TestDb {
  const url = connectionString ?? process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "createTestDb requires a connection string or process.env.DATABASE_URL",
    );
  }

  const pool = new Pool({ connectionString: url });
  const client = drizzle(pool, { schema });
  // NodePgDatabase<typeof schema> is assignable to the broad OpsboardDb type.
  const db: OpsboardDb = client;

  return {
    db,
    client,
    pool,

    async migrate() {
      await migrate(client, { migrationsFolder: MIGRATIONS_FOLDER });
    },

    async seedCategories() {
      await client.insert(schema.categories).values(
        CATEGORY_SEEDS.map((c) => ({
          slug: c.slug,
          name: c.name,
          color: c.color,
          lucideIcon: c.lucideIcon,
          sortOrder: c.sortOrder,
          isDefault: c.isDefault,
        })),
      );
    },

    async seedUser(id = TEST_USER_ID) {
      await client
        .insert(schema.users)
        .values({ id, email: `${id}@example.test` });
      return id;
    },

    async reset() {
      // CASCADE handles FK order; RESTART IDENTITY is harmless (uuid PKs).
      await client.execute(
        sql.raw(
          `TRUNCATE TABLE ${ALL_TABLES.map((t) => `"${t}"`).join(
            ", ",
          )} RESTART IDENTITY CASCADE`,
        ),
      );
    },

    async listTables() {
      const rows = await client.execute<{ table_name: string }>(
        sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`,
      );
      // node-postgres returns a pg QueryResult with a `.rows` array.
      return rows.rows.map((r) => r.table_name);
    },

    async close() {
      await pool.end();
    },
  };
}
