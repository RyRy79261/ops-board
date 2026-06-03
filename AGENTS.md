# AGENTS.md

Guidance for AI agents (and humans) working in the OpsBoard repo. This file is the
standing set of guidelines and decisions **already made** for this project. For the
authoritative detail, follow the document map below — don't duplicate it here, link to it.

## Document map (canonical sources)

| Document | Role |
|---|---|
| `project_brief.md` | **Functional contract** — the v3 product vision. Wins on *what must exist*. |
| `docs/research-dossier.md` | Evidence base (9-agent investigation of the reference repos + prototype + stack). |
| `docs/scaffolding-plan.md` | The build plan: stages S0–S8 with file pointers + the asset reuse manifest. |
| `ops-board.html` | The v1 visual prototype — the three view algorithms to port ~1:1. |
| `design/design-brief.md` | A one-time handoff to the Pencil agent. **Design is owned downstream of here** (see Pencil section); don't treat it as a spec to maintain. |

**Design is out of scope for this repo's agents.** The visual system (tokens, palette,
components, screen layouts, states) is owned by the **Pencil agent** + the human operator.
Claude owns the *functional* and *engineering* concerns; the *designer wins on how it looks.*

## Project

OpsBoard is a **voice-first, read-only personal mission planner** with dependency-aware
task orchestration. Single user. It mirrors Camp 404's monorepo conventions in a fresh
repo and reuses Camp 404's voice + MCP + DB infrastructure, stripped from multi-user to
single-user. The one net-new piece is the voice **transcript → intent → execute** layer.

## Current state — greenfield, pre-scaffold

This repo currently holds only the brief, prototype, design brief, and planning docs.
**There is no code, no `package.json`, no `apps/`/`packages/` yet.** Pipeline status:

1. ✅ Research the reference repos + prototype.
2. ✅ Produce the Pencil design brief (`design/design-brief.md`).
3. ⏳ The **human operator** drives Pencil to produce a design (see Pencil section).
4. ⏳ Re-invoke Claude to write the **technical spec** from that design.
5. ⏳ Scaffold + build per `docs/scaffolding-plan.md`.

Treat the "Conventions" and "Workspace layout" sections below as the rules to **follow when
scaffolding** — not as descriptions of code that already exists.

## Reference repos (local clones — read, don't modify)

| Repo | Path | Source of truth for |
|---|---|---|
| **camp-404** | `/home/ryan/repos/Personal/camp-404` | Monorepo conventions, store/state structures, the token system, the design system, and the voice + MCP + DB assets to lift. Newer but incomplete. |
| **intake-tracker** | `/home/ryan/repos/Personal/intake-tracker` | Component & business-logic maturity, UX learnings, testing discipline. Older but more mature in the areas OpsBoard needs most. |

**Ignore `intake-tracker-gsd2` entirely** — it is out of scope as a reference.

## Pencil.dev — design is owned here, not by Claude

- **Design lives with the Pencil agent and the human operator.** Don't make or maintain
  visual-design decisions (tokens, palette, components, layouts) in this repo. The
  technical spec consumes the design Pencil produces; it does not author it.
- If you ever need to touch Pencil: **use the `pencil` CLI only** (installed at
  `~/.local/share/pnpm/pencil`); **never use the Pencil MCP tools** (`mcp__pencil__*`).
- `design/app.pen` is **encrypted/binary** — never `Read`/`Grep`/`cat` it. The `.pen` file
  is a regenerable artifact, not a source of truth.

## Workspace layout (to scaffold)

Turborepo + pnpm workspaces. **Node >= 22, pnpm 10.x.** Mirror Camp 404:

```
apps/
  web/        Next.js 16 (App Router, React 19, Tailwind v4)
  mobile/     Capacitor host — DEFERRED (see below)
  admin-cli/  optional
packages/
  ui/         shadcn/ui components + tokens   (@opsboard/ui)
  db/         Drizzle schema + migrations      (@opsboard/db)
  types/      Zod schemas + shared TS types    (@opsboard/types)
  ai-prompts/ Versioned prompt templates       (@opsboard/ai-prompts)
  core/       Pure business logic, no I/O      (@opsboard/core)
  eslint-config/  typescript-config/
```

Once scaffolded, all work runs through Turbo from the repo root:
`pnpm turbo run lint typecheck test build` is the full CI gate; per-package work uses
`--filter`, e.g. `pnpm --filter @opsboard/web dev`.

## Conventions (carry from Camp 404)

- **TypeScript throughout.** Shared types and Zod schemas live in `@opsboard/types`;
  validate external input at the boundary with Zod.
- **`@opsboard/core` is pure and I/O-free** — no db, no `next`, no `process.env`, and
  **no React.** The dependency-graph resolution, `blocked` derivation, window-state, and
  critical-path live here as pure functions with Vitest tests. The live clock (`useNowTick`)
  lives in `@opsboard/ui/hooks` and passes `now` *into* core's pure functions — never import
  React into core.
- **Env-var discipline:** when adding an env var, update **both** `.env.example` **and** the
  `globalEnv` array in `turbo.json`. Miss the latter and Turbo's cache won't invalidate on
  change, causing stale builds. (`globalEnv` = `DATABASE_URL, GROQ_API_KEY, ANTHROPIC_API_KEY,
  MCP_PUBLIC_URL, CRON_SECRET, NODE_ENV`.)
- **Prefer editing existing files; don't add abstractions a task doesn't need.** Bespoke
  domain tables over generic key-value/CMS stores.
- **Add/update tests with behavioural changes.** Scope Stryker mutation testing + fast-check
  property tests to `@opsboard/core` and the MCP OAuth/token modules (nightly, not per-PR).
  Add TZ-matrix runs for date logic (`Africa/Johannesburg` + `Europe/Berlin`).

## Database discipline

Neon Postgres + Drizzle ORM. **`packages/db/src/schema.ts` is the single hand-authored
source of truth.** Everything under `packages/db/migrations/` is generated by drizzle-kit —
**never hand-edit a migration or the journal.**

Workflow: edit `schema.ts` → `pnpm --filter @opsboard/db db:generate` → commit the generated
migration with the schema change → `db:migrate` applies it. Migrations are **append-only**;
`0000` is frozen once created. This is a fresh repo created after the 2026-05-29 Drizzle
journal-timestamp cutoff, so generated `when` values sort correctly on their own — **let
drizzle-kit own `when`; never hand-edit `meta/_journal.json`.**

**Two drivers:** `createHttpDb()` is stateless with **no transactions** (route handlers /
server components); `createPooledDb()` is a WebSocket pool **with transactions** (CLI /
multi-statement atomic work).

**MCP tables are a prerequisite, not optional.** The lifted MCP OAuth shell hard-depends on
`mcpOauthClients`, `mcpAuthCodes`, `mcpAccessTokens`, and `mcp_audit_log` (+ an
`@opsboard/db/mcp` `appendMcpAuditLog`). Add these in the **DB stage (S2)**, alongside
`missions`/`categories`/`tasks`/`task_dependencies` — the MCP stage can't compile otherwise.

## Product invariants (the model — never violate)

- Tasks carry a **`too_late_by` cliff**, NOT a due date. After the cliff a task is *moot*.
- The UI communicates **window state — open / closing / closed / not-yet — never "overdue."**
  `CLOSING_THRESHOLD_DAYS = 7`. The "closed" boundary is the **local end-of-day** of
  `too_late_by` in the user's timezone.
- **`blocked` is derived, not stored** — a task is blocked if any dependency isn't `done`.
- Stored statuses are exactly **`not-started | in-progress | done`** (3 values).
- The dashboard is a **read-only status display, not an input surface.** All create/edit/delete
  happens by **voice or MCP**. The one direct board interaction is tapping a task to cycle
  status; it is always enabled (window-state/blocked are advisory, never gating).

## AI providers

Model IDs and prompt templates are **pinned and versioned.** Do not swap a model or edit a
prompt in place — bump the version in `@opsboard/ai-prompts`.

- STT: **Groq Whisper Large v3 Turbo** (`whisper-large-v3-turbo`).
- Intent parse: **Claude Haiku 4.5** (cheap/fast classification). Heavier work: **Opus 4.8**.
- The Whisper domain-bias prompt must stay **< ~224 tokens** (Whisper truncates) — keep it
  short and dense with rare terms (mission names, AfrikaBurn, cardiology, Envivas, VFS,
  category words).
- Destructive/ambiguous/low-confidence intents must be **confirmed before execution, never
  assumed** — over voice *and* over the MCP transport.

## Build-time gotchas (verified during research)

- `runTool` lives in Camp 404's `lib/mcp/tool-utils.ts`, **not** `server.ts` (the brief is
  wrong on this).
- MCP redirects use **meta-refresh + JS, never a 302** (CSP `form-action 'self'` drops
  cross-origin 302s from POST handlers).
- Derive MCP origin from request headers / **`MCP_PUBLIC_URL`, never `VERCEL_URL`**.
- Keep the **iOS-Safari `audio/mp4` MIME fallback** in `use-voice-recorder.ts` — hardcoding
  `audio/webm` makes iOS silently fail.
- `/api/cron/*` routes require `Authorization: Bearer ${CRON_SECRET}`.

## Single-user posture (strip Camp 404's multi-user machinery)

OpsBoard is one person. **Strip** rank/team/captain/consent/approval gating and the MCP
scope/consent model down to a single principal — but **keep** the OAuth+PKCE shell, the
`claude.ai`/`anthropic.com` redirect allow-list, and `runTool` audit logging. App auth is a
thin shared-secret/session; the full OAuth+PKCE shell stays for the MCP connector.

**No POPIA encryption needed** — OpsBoard holds no passports/IDs/bank details. If that ever
changes, follow Camp 404's `pgcrypto` column-encryption pattern.

## Mobile — deferred

Capacitor `output: "export"` breaks on Server Actions / cookie-reading pages / rewrites —
all of which OpsBoard uses. Mobile is **not MVP**; if it's wanted later, plan client-only
screens calling a separately deployed API.

## Git & pull requests

- Work on feature branches; never force-push a shared branch.
- Commit subjects are imperative and explain *why*, not just *what*.
- One PR per feature. Keep the CI gate (`pnpm turbo run lint typecheck test build`) green
  before requesting review.
