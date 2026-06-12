import {
  pgTable,
  pgEnum,
  text,
  uuid,
  date,
  timestamp,
  boolean,
  integer,
  jsonb,
  index,
  uniqueIndex,
  check,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import type { ResearchStep, ResearchResult } from "@opsboard/types";

// OpsBoard schema — a voice-first, READ-ONLY single-user mission planner.
// `packages/db/src/schema.ts` is the single hand-authored source of truth;
// everything under `packages/db/migrations/` is drizzle-kit-generated and
// append-only (never hand-edit a migration). See docs/scaffolding-plan.md S2
// and project_brief.md §2.
//
// Four domain tables — missions / categories / tasks / task_dependencies —
// plus the MCP OAuth/audit tables the S6 OAuth shell hard-depends on. The
// camp-404 multi-user substrate (rank/team/consent, Telegram, POPIA crypto)
// is NOT carried over; this app holds no PII worth encrypting.

// --- Auth -----------------------------------------------------------------

// The authenticated-user mirror. Neon Auth (Better Auth) is the source of
// truth for credentials/sessions; this `users` row is OpsBoard's own copy of
// the principal, upserted lazily by `ensureUserSynced` on the first
// authenticated request (apps/web/lib/auth-middleware.ts). `id` is the Neon
// Auth user id verbatim (text, not a uuid) so it can be the FK target every
// data table gains a `user_id` against in the NEXT PR — DELIBERATELY no FKs
// added here yet. Open signup: there is no whitelist; any signed-in identity
// gets a row. Kept minimal on purpose.
export const users = pgTable("users", {
  // The Neon Auth user id (Better Auth subject). NOT generated here — the
  // auth server owns it; we mirror it verbatim.
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  // The BYO-keys setup-wizard gate (model B). NULL until the user finishes the
  // wizard with BOTH their Anthropic + Groq keys stored; set to now() by
  // markUserSetupComplete (./api-keys.ts) when /api/setup/complete confirms
  // both keys exist. requireOnboardedUser (apps/web/lib/session.ts) reads this
  // at the RSC layer and redirects an un-onboarded user to /setup. This is the
  // ONLY flag that opens the gate, so setup can't be bypassed without keys.
  setupCompletedAt: timestamp("setup_completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// --- Domain ---------------------------------------------------------------

// A mission is one real-world objective with a fixed event date (e.g. an
// AfrikaBurn departure). `target_date` is the anchor real-world event date —
// nullable for open-ended missions. Tasks hang off it.
export const missions = pgTable(
  "missions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    // The owning user. Missions are user-scoped: every query/mutation filters
    // by this. ON DELETE CASCADE so removing a user removes their missions
    // (and, transitively, their tasks + dependency edges).
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    // The fixed real-world event date this mission is built around. Nullable
    // for missions without a hard date. Date-only (no time / tz) — stored and
    // read as a "YYYY-MM-DD" string; the user-tz window-state derivation lives
    // in @opsboard/core.
    targetDate: date("target_date"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (m) => ({
    userIdx: index("missions_user_idx").on(m.userId),
  }),
);

// Seed-able task categories. Five are shipped as defaults (see CATEGORY_SEEDS
// below); a `slug` is the stable identifier, `color` is a hex mirror of the
// @opsboard/ui `--color-cat-*` token, `lucide_icon` names the Lucide glyph the
// board renders alongside the label (colour is never the sole channel).
export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    // Hex mirror of the matching @opsboard/ui `--color-cat-*` OKLCH token,
    // consumed at 12% alpha on the board (design-brief §4).
    color: text("color").notNull(),
    // Lucide icon name (e.g. "Stethoscope") — the redundant icon channel.
    lucideIcon: text("lucide_icon").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (c) => ({
    slugIdx: uniqueIndex("categories_slug_idx").on(c.slug),
    sortOrderIdx: index("categories_sort_order_idx").on(c.sortOrder),
  }),
);

// A task within a mission. Tasks carry a `too_late_by` CLIFF ("after this
// date the task is moot" — NOT a due date) and an optional `not_before`
// ("can't start until this date"); both are date-only. `status` is one of
// three stored values — `blocked` is NEVER stored, it is computed from the
// dependency graph at read time in @opsboard/core.
export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    missionId: uuid("mission_id")
      .notNull()
      .references(() => missions.id, { onDelete: "cascade" }),
    // The owning user — DENORMALIZED from the parent mission so a task can be
    // scoped directly without a join. INVARIANT: a task's userId always equals
    // its mission's userId (enforced in createTask, which verifies the mission
    // belongs to the user before inserting). ON DELETE CASCADE mirrors the
    // mission FK so a user delete removes their tasks.
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Nullable: an uncategorised task. ON DELETE SET NULL so deleting a
    // category never deletes its tasks.
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    notes: text("notes"),
    // Stored status is ONLY not-started | in-progress | done. The CHECK below
    // pins those three values at the DB boundary.
    status: text("status").notNull().default("not-started"),
    // The cliff: after this date the task is moot (window closed). NOT a due
    // date — the board never says "overdue". Date-only.
    tooLateBy: date("too_late_by"),
    // Earliest date the task can be started. Date-only.
    notBefore: date("not_before"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => ({
    missionIdx: index("tasks_mission_idx").on(t.missionId),
    userIdx: index("tasks_user_idx").on(t.userId),
    categoryIdx: index("tasks_category_idx").on(t.categoryId),
    statusIdx: index("tasks_status_idx").on(t.status),
    statusCheck: check(
      "tasks_status_check",
      sql`${t.status} IN ('not-started', 'in-progress', 'done')`,
    ),
  }),
);

// A directed dependency edge: `task_id` depends on `depends_on_id`. Both
// columns FK back into `tasks.id` (self-referential → typed via the
// `(): AnyPgColumn => tasks.id` thunk). A uniqueIndex stops duplicate edges
// and a CHECK forbids a task depending on itself; cycle detection across
// multiple edges is handled in @opsboard/core (domain-impossible is not a
// defence — guard it).
export const taskDependencies = pgTable(
  "task_dependencies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    taskId: uuid("task_id")
      .notNull()
      .references((): AnyPgColumn => tasks.id, { onDelete: "cascade" }),
    dependsOnId: uuid("depends_on_id")
      .notNull()
      .references((): AnyPgColumn => tasks.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (d) => ({
    edgeIdx: uniqueIndex("task_dependencies_edge_idx").on(
      d.taskId,
      d.dependsOnId,
    ),
    taskIdx: index("task_dependencies_task_idx").on(d.taskId),
    dependsOnIdx: index("task_dependencies_depends_on_idx").on(d.dependsOnId),
    noSelfDep: check(
      "task_dependencies_no_self_dep_check",
      sql`${d.taskId} <> ${d.dependsOnId}`,
    ),
  }),
);

// The five seeded default categories (slug + display name + hex mirror of the
// matching @opsboard/ui `--color-cat-*` token + Lucide icon). Hex values and
// icons are lifted from design-brief §4. The 0000 migration / a seed script
// inserts these; iterate categories by `sort_order` on the board, never a
// hardcoded array.
export const CATEGORY_SEEDS: ReadonlyArray<{
  slug: string;
  name: string;
  color: string;
  lucideIcon: string;
  sortOrder: number;
  isDefault: boolean;
}> = [
  {
    slug: "medical",
    name: "Medical",
    color: "#e05a9f",
    lucideIcon: "Stethoscope",
    sortOrder: 0,
    isDefault: true,
  },
  {
    slug: "bureaucratic",
    name: "Bureaucratic",
    color: "#5aa0e0",
    lucideIcon: "FileText",
    sortOrder: 1,
    isDefault: true,
  },
  {
    slug: "travel",
    name: "Travel",
    color: "#5ae0a0",
    lucideIcon: "Plane",
    sortOrder: 2,
    isDefault: true,
  },
  {
    slug: "gear",
    name: "Gear",
    color: "#e0c05a",
    lucideIcon: "Backpack",
    sortOrder: 3,
    isDefault: true,
  },
  {
    slug: "tech",
    name: "Tech",
    color: "#a05ae0",
    lucideIcon: "Cpu",
    sortOrder: 4,
    isDefault: true,
  },
];

// --- BYO API keys (server-only) ------------------------------------------
// Per-user, bring-your-own AI provider keys. One row per user (the userId PK
// FKs into `users` ON DELETE CASCADE, so deleting a user sweeps their keys).
// Each provider column stores a versioned encrypted blob authored by the
// crypto module in apps/web/lib/key-vault.ts (AES-256-GCM, `v1:` prefix); the
// `*_last4` columns hold only the last 4 plaintext characters for UI display —
// NEVER the whole key. The encryption secret (API_KEY_ENCRYPTION_SECRET) lives
// in apps/web, never the DB; this package stays crypto-FREE and only stores /
// reads the opaque blobs (see ./api-keys.ts). Rotating the secret invalidates
// every stored key (users re-enter); a future KMS migration adds a "v2:" blob
// in the same column.
export const userApiKeys = pgTable("user_api_keys", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  anthropicKeyEncrypted: text("anthropic_key_encrypted"),
  anthropicLast4: text("anthropic_last4"),
  groqKeyEncrypted: text("groq_key_encrypted"),
  groqLast4: text("groq_last4"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// --- User preferences (server-only) --------------------------------------
// Per-user app preferences (one row per user; the userId PK FKs into `users`
// ON DELETE CASCADE, so deleting a user sweeps their prefs). Defaults live BOTH
// here (column defaults) and in the read service (so a user with no row yet
// resolves to the same defaults). Kept deliberately small — add a column per
// real preference, never a free-form blob.
export const userPreferences = pgTable("user_preferences", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  // Voice & Microphone: ask before a voice command deletes a task/mission. The
  // voice pipeline's needsConfirmation gate can consult this (default ON = safe).
  voiceConfirmDestructive: boolean("voice_confirm_destructive")
    .notNull()
    .default(true),
  // Notifications: opt in to "a task's window is closing" reminders. Forward-
  // looking — no notification channel ships yet (the reminder runtime is
  // deferred), but the preference persists so it's ready when it does.
  notifyClosingWindows: boolean("notify_closing_windows")
    .notNull()
    .default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// --- AI Research (Task Agent) --------------------------------------------
// The research flow is the ONE place voice WRITES. A `research_jobs` row tracks
// one async, mission+task-bound web-research job run by the durable runner
// (Inngest): `steps` is the streaming LIVE STEP LOG, `result` is the finished
// AINotesBlock payload (NULL until `state` = 'complete'). NOTHING here is written
// to a task automatically — the job only proposes; the user reviews and keeps.
//
// `task_research_notes` is the PERSISTED append target: one row per KEEP NOTES
// confirmation, holding the structured ResearchResult (summary + numbered steps
// + citations + sources) the plain `tasks.notes` text column can't represent.
// Both FK to users ON DELETE CASCADE (a user delete sweeps their research).

export const researchJobStateEnum = pgEnum("research_job_state", [
  "running",
  "complete",
  "error",
]);

export const researchJobs = pgTable(
  "research_jobs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    // The owning user — every read/write is scoped to it. ON DELETE CASCADE.
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // The mission the research is scoped to (the locked ScopeChip taxonomy).
    missionId: uuid("mission_id")
      .notNull()
      .references(() => missions.id, { onDelete: "cascade" }),
    // The task the findings are bound to and will be appended to on KEEP NOTES.
    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    // The research question the user confirmed via CUE RESEARCH.
    query: text("query").notNull(),
    state: researchJobStateEnum("state").notNull().default("running"),
    // The streaming LIVE STEP LOG the runner advances. Defaults to an empty log.
    steps: jsonb("steps")
      .$type<ResearchStep[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    // The finished AINotesBlock payload. NULL until `state` = 'complete'.
    result: jsonb("result").$type<ResearchResult>(),
    // A client-safe failure reason when `state` = 'error'. NULL otherwise.
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
    // Set when the job reaches a terminal state (complete or error).
    completedAt: timestamp("completed_at", { mode: "date" }),
  },
  (j) => ({
    userIdx: index("research_jobs_user_idx").on(j.userId),
    taskIdx: index("research_jobs_task_idx").on(j.taskId),
    stateIdx: index("research_jobs_state_idx").on(j.state),
    // Lifecycle invariants enforced at the DB boundary (defense-in-depth behind
    // the service guards): a `complete` job must carry a `result`, an `error`
    // job must carry an `error_message`, and any terminal state must have a
    // `completed_at`. A `running` job may have all three NULL.
    completeHasResult: check(
      "research_jobs_complete_has_result_check",
      sql`${j.state} <> 'complete' OR ${j.result} IS NOT NULL`,
    ),
    errorHasMessage: check(
      "research_jobs_error_has_message_check",
      sql`${j.state} <> 'error' OR ${j.errorMessage} IS NOT NULL`,
    ),
    terminalHasCompletedAt: check(
      "research_jobs_terminal_completed_at_check",
      sql`${j.state} = 'running' OR ${j.completedAt} IS NOT NULL`,
    ),
  }),
);

export const taskResearchNotes = pgTable(
  "task_research_notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    // The owning user — DENORMALIZED from the task (mirrors tasks.userId) so a
    // note can be scoped/swept directly. ON DELETE CASCADE on the user.
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // The job that produced these notes. ON DELETE SET NULL so pruning an old
    // job never deletes the notes the user chose to keep.
    jobId: uuid("job_id").references(() => researchJobs.id, {
      onDelete: "set null",
    }),
    // The kept ResearchResult (summary + numbered steps + citations + sources).
    content: jsonb("content").$type<ResearchResult>().notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (n) => ({
    taskIdx: index("task_research_notes_task_idx").on(n.taskId),
    userIdx: index("task_research_notes_user_idx").on(n.userId),
  }),
);

// --- MCP OAuth (server-only) --------------------------------------------
// Pure auth-server state for Claude.ai (and other MCP clients) connecting
// over OAuth 2.1 + Dynamic Client Registration. Nothing here is rendered or
// surfaced to the board — these tables back the routes under
// /api/mcp/oauth/* and the bearer-token check on /api/mcp/mcp (lifted from
// camp-404, S6). OpsBoard is single-user, so where camp scoped these rows to
// a `users.id` FK we instead keep a NULLABLE `principal_id` text column
// (DDL decision in research-dossier §9): there is no users table to FK to,
// the audit stays useful, and a constant principal (see ./mcp.ts) is written.

export const mcpClientAuthMethodEnum = pgEnum("mcp_client_auth_method", [
  "none",
  "client_secret_basic",
  "client_secret_post",
]);

export const mcpCodeChallengeMethodEnum = pgEnum("mcp_code_challenge_method", [
  "S256",
  "plain",
]);

export const mcpAuditOutcomeEnum = pgEnum("mcp_audit_outcome", [
  "success",
  "error",
]);

// One row per DCR-registered MCP client (typically one row per Claude
// install). Public clients (`token_endpoint_auth_method = 'none'`) leave
// `client_secret_hash` NULL; confidential clients store the SHA-256.
export const mcpOauthClients = pgTable("mcp_oauth_clients", {
  clientId: text("client_id").primaryKey(),
  clientSecretHash: text("client_secret_hash"),
  clientName: text("client_name").notNull(),
  // RFC 7591 — every URI the client is allowed to redirect to.
  redirectUris: text("redirect_uris").array().notNull(),
  tokenEndpointAuthMethod: mcpClientAuthMethodEnum(
    "token_endpoint_auth_method",
  ).notNull(),
  scope: text("scope"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  lastUsedAt: timestamp("last_used_at", { mode: "date" }),
});

// Single-use authorization codes (RFC 6749 §4.1). PKCE-required per OAuth
// 2.1: code_challenge + code_challenge_method are non-null. Codes are
// short-lived (~5min) and stored plaintext — they're consumed once via the
// `consumed_at` flip in a transaction. `principal_id` is the single-user
// principal this code was minted for (nullable — no users table to FK to).
export const mcpAuthCodes = pgTable(
  "mcp_auth_codes",
  {
    code: text("code").primaryKey(),
    clientId: text("client_id")
      .notNull()
      .references(() => mcpOauthClients.clientId, { onDelete: "cascade" }),
    principalId: text("principal_id"),
    // The authorizing human's user id. A code is always minted for a known,
    // signed-in user, so this is NOT NULL. ON DELETE CASCADE so a user delete
    // sweeps their outstanding codes.
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    redirectUri: text("redirect_uri").notNull(),
    codeChallenge: text("code_challenge").notNull(),
    codeChallengeMethod: mcpCodeChallengeMethodEnum(
      "code_challenge_method",
    ).notNull(),
    scope: text("scope").notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    consumedAt: timestamp("consumed_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => ({
    clientIdx: index("mcp_auth_codes_client_idx").on(t.clientId),
    expiresIdx: index("mcp_auth_codes_expires_idx").on(t.expiresAt),
  }),
);

// Issued access + refresh tokens, stored as SHA-256 hashes. Plaintext tokens
// never hit the DB. Refresh rotates transactionally (atomic revoke-old +
// insert-new). `principal_id` is the single-user principal (nullable).
export const mcpAccessTokens = pgTable(
  "mcp_access_tokens",
  {
    tokenHash: text("token_hash").primaryKey(),
    refreshTokenHash: text("refresh_token_hash").unique(),
    clientId: text("client_id")
      .notNull()
      .references(() => mcpOauthClients.clientId, { onDelete: "cascade" }),
    principalId: text("principal_id"),
    // The authorizing human's user id. A token is always minted for a known,
    // signed-in user, so this is NOT NULL. ON DELETE CASCADE so a user delete
    // sweeps their issued tokens.
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    scope: text("scope").notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    refreshExpiresAt: timestamp("refresh_expires_at", { mode: "date" }),
    revokedAt: timestamp("revoked_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    lastUsedAt: timestamp("last_used_at", { mode: "date" }),
  },
  (t) => ({
    principalIdx: index("mcp_access_tokens_principal_idx").on(t.principalId),
    expiresIdx: index("mcp_access_tokens_expires_idx").on(t.expiresAt),
  }),
);

// One row per MCP tool invocation. Captures the call regardless of outcome.
// `principal_id` is nullable (single-user — no users FK); `client_id` is NOT
// an FK so the audit row survives a client being deleted (forensic
// visibility after the fact). Written via appendMcpAuditLog in ./mcp.ts.
export const mcpAuditLog = pgTable(
  "mcp_audit_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    principalId: text("principal_id"),
    clientId: text("client_id").notNull(),
    tool: text("tool").notNull(),
    // Redacted arg snapshot — secrets / plaintext stripped at the boundary
    // before write.
    argsJson: jsonb("args_json"),
    outcome: mcpAuditOutcomeEnum("outcome").notNull(),
    errorMessage: text("error_message"),
    durationMs: integer("duration_ms"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => ({
    principalCreatedIdx: index("mcp_audit_log_principal_created_idx").on(
      t.principalId,
      t.createdAt,
    ),
  }),
);

// --- Inferred row types ---------------------------------------------------
// Drizzle's $inferSelect / $inferInsert are the domain row types — import
// these from @opsboard/db/schema rather than re-declaring shapes elsewhere.

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Mission = typeof missions.$inferSelect;
export type NewMission = typeof missions.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

// Stored task status (the three CHECK'd values). `blocked` is NOT here — it's
// derived in @opsboard/core.
export type TaskStatus = "not-started" | "in-progress" | "done";

export type TaskDependency = typeof taskDependencies.$inferSelect;
export type NewTaskDependency = typeof taskDependencies.$inferInsert;

export type UserApiKeyRow = typeof userApiKeys.$inferSelect;
export type NewUserApiKeyRow = typeof userApiKeys.$inferInsert;

export type UserPreferencesRow = typeof userPreferences.$inferSelect;
export type NewUserPreferencesRow = typeof userPreferences.$inferInsert;

export type ResearchJob = typeof researchJobs.$inferSelect;
export type NewResearchJob = typeof researchJobs.$inferInsert;

export type TaskResearchNote = typeof taskResearchNotes.$inferSelect;
export type NewTaskResearchNote = typeof taskResearchNotes.$inferInsert;

export type McpOauthClient = typeof mcpOauthClients.$inferSelect;
export type NewMcpOauthClient = typeof mcpOauthClients.$inferInsert;

export type McpAuthCode = typeof mcpAuthCodes.$inferSelect;
export type NewMcpAuthCode = typeof mcpAuthCodes.$inferInsert;

export type McpAccessToken = typeof mcpAccessTokens.$inferSelect;
export type NewMcpAccessToken = typeof mcpAccessTokens.$inferInsert;

export type McpAuditLogRow = typeof mcpAuditLog.$inferSelect;
export type NewMcpAuditLogRow = typeof mcpAuditLog.$inferInsert;
