import type { Config } from "drizzle-kit";
import { BUILD_PLACEHOLDER_URL } from "./src/index";

export default {
  schema: "./src/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    // Migrations need a DIRECT (unpooled) connection — Neon's pooled endpoint
    // (PgBouncer, transaction mode) lacks the session features drizzle-kit
    // migrate uses. The Neon–Vercel integration injects DATABASE_URL_UNPOOLED;
    // prefer it, then fall back to DATABASE_URL, then the build placeholder.
    url:
      process.env.DATABASE_URL_UNPOOLED ??
      process.env.DATABASE_URL ??
      BUILD_PLACEHOLDER_URL,
  },
  strict: true,
  verbose: true,
} satisfies Config;
