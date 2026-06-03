import type { Config } from "drizzle-kit";
import { BUILD_PLACEHOLDER_URL } from "./src/index";

export default {
  schema: "./src/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? BUILD_PLACEHOLDER_URL,
  },
  strict: true,
  verbose: true,
} satisfies Config;
