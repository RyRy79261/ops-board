# OpsBoard — Scaffolding Plan

*Actionable, file-pointer-anchored plan to scaffold the OpsBoard monorepo by mirroring camp-404 conventions and lifting its voice/MCP/DB assets, stripped to single-user. Derived from `../project_brief.md` §7 + the research in `research-dossier.md`. This is the build plan; the visual design is settled separately via `../design/design-brief.md` → Pencil.*

> Paths: **camp-404** = `/home/ryan/repos/Personal/camp-404`, **intake-tracker** = `/home/ryan/repos/Personal/intake-tracker`, **OpsBoard** = repo root. Rename `@camp404/*` → `@opsboard/*` throughout.

---

## Build-order dependency graph (read first)

```
S0 root tooling
   └─ S1 @opsboard/ui ─┐
   └─ S2 @opsboard/db ─┼─ (MCP tables in S2 are a PREREQ for S6 OAuth)
   └─ S4 types/* ──────┤
S3 @opsboard/core ─────┤   (pure logic; depends on types)
                       └─ S4 apps/web dashboard ─ S5 voice ─ S6 MCP
                                                              S7 Pencil design (parallel, gated by design-brief)
                                                              S8 polish/deferred
```

Hard ordering constraints surfaced by research:
- **S2 must add the MCP OAuth/audit tables** (`mcpOauthClients`, `mcpAuthCodes`, `mcpAccessTokens`, `mcp_audit_log` + `appendMcpAuditLog`) — camp's `runTool`/`oauth.ts` hard-depend on them, so S6 can't compile without S2.
- `@opsboard/core` is **I/O-free** — never import React/db/`process.env`. The live ticker (`useNowTick`) lives in `@opsboard/ui/hooks` and passes `now` *into* core's pure `windowState(now, …)`.
- Package dependency direction: `types ← core ← ui ← apps`.

---

## S0 — Monorepo skeleton
**Goal:** Turborepo + pnpm shell mirroring camp-404, single-user, builds green.
**Sources:** camp-404 `turbo.json`, `package.json`, `.npmrc`, `.prettierrc.json`, `pnpm-workspace.yaml`, `AGENTS.md`, `packages/typescript-config/base.json`, `packages/eslint-config/index.js`, `next.config.ts`.
- Init Turborepo: `apps/{web}` + `packages/{ui,db,types,ai-prompts,core,eslint-config,typescript-config}`. Defer `apps/{mobile,admin-cli}`.
- Lift tooling configs verbatim with the scope rename; per-package `eslint.config.js` = one-line re-export.
- `turbo.json` `globalEnv` = `DATABASE_URL, GROQ_API_KEY, ANTHROPIC_API_KEY, MCP_PUBLIC_URL, CRON_SECRET, NODE_ENV`; create a matching `.env.example` (**env-var discipline: update both, every time**).
- Adapt `AGENTS.md`: keep DB-discipline / env-var / AI-pinning / conventions; drop POPIA / rank / team / Telegram / mobile sections.
- `next.config.ts`: `transpilePackages` all `@opsboard/*`, `typedRoutes: true`, `reactStrictMode: true`; defer mobile `output: "export"`; add `/.well-known` rewrites only when MCP lands (S6).
- Add commitlint + a fast pre-commit (lint + typecheck only); **defer** release-please.

## S1 — `@opsboard/ui` token system + primitives
**Goal:** the orange tactical token set + the lifted component kit, with Storybook resolving tokens. **This is what `design-brief.md` feeds.**
**Sources:** camp-404 `packages/ui/src/styles/globals.css`, `lib/utils.ts`, `package.json`, `components.json`, `.storybook/*`, and `components/{button,badge,icon-badge,alert,spinner,dialog,card,stat-tile,empty-state,section-header,detail-header,nav-card,divider,segmented-control,progress-bar,toast}.tsx`; `ops-board.html` `:root`.
- Author `globals.css`: copy `@import` + `@source "../components/**"` + `@theme` + `@layer base` + the **19-step** type scale (with paired sub-props); swap to the OKLCH orange palette (design-brief §3), add `--color-cat-*` + `--color-warning` + `--color-card-elevated` + `--color-muted-foreground-subtle` + `--color-border-hover`, set `--radius: 0`, wire `--font-dm-sans` + `--font-jetbrains-mono`.
- Lift `cn()` + ~13 token-driven components verbatim; **adapt** Badge (window-state + status variants), ProgressBar (amber segment), NavCard (orange active), IconBadge (5 category tones at `/12`).
- Build the **new `StatusCycleButton`** CVA (18px square tri-state, always-enabled).
- Populate `packages/ui/src/hooks/`: `use-now-tick.ts` (lift from intake-tracker) + `useMediaQuery` — and **create the dir + fix the exports entry** (camp's `./hooks/*` export points at a missing dir).
- Extend `toast.tsx` `ToastRecord` with optional `actions[]` (Confirm/Cancel).
- Co-locate `*.stories.tsx`; wire Storybook 10 + `@tailwindcss/vite` + `globals.css` in preview. Generate `component-library.md` (with a `mapsTo` column) **from code**.

## S2 — `@opsboard/db` schema + drivers
**Goal:** 4 domain tables + MCP tables, two drivers, seeded categories, `0000` migration.
**Sources:** camp-404 `packages/db/src/{index,schema}.ts`, `drizzle.config.ts`; brief §2 schema.
- Lift `index.ts` two-driver pattern verbatim (`createHttpDb` / `createPooledDb` / `BUILD_PLACEHOLDER_URL`).
- Author `schema.ts`: `missions`, `categories` (seed medical/bureaucratic/travel/gear/tech with color + sort_order + is_default), `tasks` (`status` CHECK in 3 values, `too_late_by`/`not_before` as DATE), `task_dependencies` (self-ref `(): AnyPgColumn => tasks.id`, `uniqueIndex(task_id, depends_on_id)`, CHECK `task_id <> depends_on_id`). Replicate column idioms (uuid `defaultRandom` pk, timestamps); do **not** copy camp's tables.
- **ADD MCP tables:** `mcpOauthClients`, `mcpAuthCodes`, `mcpAccessTokens`, `mcp_audit_log` + an `@opsboard/db/mcp` export with `appendMcpAuditLog`. *(DDL decision: keep a nullable `userId`/principal column and write a constant — cheaper than removing it, audit stays useful.)*
- `drizzle.config.ts` verbatim (`strict: true`); `db:generate` → `0000` (never hand-edit the journal — fresh repo, let drizzle-kit own `when`).
- Per-domain query services `packages/db/src/{missions,tasks}.ts` (explicit return interface + `createHttpDb` + row map), exported via the exports map.

## S3 — `@opsboard/core` pure logic + tests
**Goal:** I/O-free derivations with Vitest — the single source of truth for blocked / window / critical-path / cycle.
**Sources:** camp-404 `packages/core/{package.json,vitest.config.ts}`, `src/{family-tree,access}.ts`, `src/__tests__/family-tree.test.ts`; intake-tracker `date-utils.ts`.
- Lift package/vitest/eslint config verbatim; `index.ts` header forbids db/next/`process.env` imports.
- `deriveBlocked(tasks, deps)` (blocked iff any dependency ≠ done); `windowState(task, now, tz)` → open/closing/closed/not-yet (pure-predicate shape from `access.ts`; **local end-of-day** closed boundary; `CLOSING_THRESHOLD_DAYS = 7`).
- `detectCycles(deps)` + `criticalPath(tasks, deps)` modeled on `family-tree.ts`'s `isAncestor` seen-Set walk (*domain-impossible is not a defence* — handle cycles/self-deps).
- `__tests__`: factory builder + explicit cycle/self-dependency/edge tests; fast-check property tests (blocked invariant, critical-path); **TZ-matrix** scripts (`test:tz:sa` = Africa/Johannesburg, `test:tz:de` = Europe/Berlin). Scope Stryker mutation testing here (nightly).

## S4 — REST + Server Actions + dashboard
**Goal:** read-only board (3 views + status-cycle), server-first, no client-state lib.
**Sources:** camp-404 `app/captains/camp-management/{page,actions,camp-management-roster}.tsx` (the page/action/client triad); `ops-board.html` view algorithms + `cycleStatus`; intake-tracker `use-now-tick`, `error-boundary`.
- Page/action/client triad: RSC pages (`force-dynamic`, `createHttpDb`, derive view-state via `@opsboard/core`, plain props) + co-located `actions.ts` (`"use server"`, `{ok}|{ok:false,error}`, `revalidatePath`) + small `"use client"` leaves.
- Port the 3 views 1:1 from the prototype: Category (data-driven by category `sort_order`), Timeline (re-bucket on `too_late_by`, past → closed), Dependencies (hand-rolled cycle-safe indented tree).
- Wire `StatusCycleButton` → Server Action `update_task_status` (`useOptimistic`/`useTransition`).
- Apply the `Record<WindowState, string>` className map at card level; **remove all CRUD UI** + every "overdue"/"deadline" string.
- Liveness: `useNowTick(60_000)` recompute + a light client-island `router.refresh()` 30–60s.
- ErrorBoundary outermost; EmptyState copy → voice-first.

## S5 — Voice command pipeline (the net-new layer)
**Goal:** transcript → intent → confirm → execute, + the floating FAB.
**Sources:** camp-404 `components/voice/{use-voice-recorder,waveform,dictate-button}.tsx`, `lib/{groq,rate-limit,anthropic,voice-prompts,feedback-ai}.ts`, `app/api/voice/transcribe/route.ts`, `control-panel` CentreButton; `packages/{types,ai-prompts}/voice-intent.ts`; intake-tracker `voice-panel.tsx`.
- Lift `use-voice-recorder.ts` (add a configurable endpoint/`onBlob` option — keep the iOS `audio/mp4` fallback, `fftSize=1024`, before-`stop()` cleanup, 2-min auto-stop), `waveform.tsx`, `groq.ts`, `rate-limit.ts`, `anthropic.ts` verbatim.
- Create `@opsboard/types/voice-intent.ts` (the 10-branch `discriminatedUnion`) + `@opsboard/ai-prompts/voice-intent.ts` (`{system,user}` + `PROMPT_VERSIONS`, confirm-destructive rule verbatim) + the OpsBoard Whisper bias prompt (<224 tokens: mission names, AfrikaBurn, cardiology, Envivas, VFS, category words).
- Build `app/api/voice/command/route.ts`: transcribe guard ladder (single-user gate + rate-limit + validation + scrub) → Claude **Haiku 4.5** (feedback-ai.ts structure, **server-built** state snapshot, temp 0, forced `tool_use`, Zod-validate) → execute via core+db **or** return `needsConfirmation`. `sanitizeForAI` + length-cap before the call.
- Build `voice-fab.tsx` (CentreButton-derived, fixed bottom-right, the 5 recording states); wire confirm/disambiguation toasts (intake-tracker stage→review→commit) + the distinct voice-`query` info surface.

## S6 — MCP tool module
**Goal:** Claude.ai connector exposing OpsBoard tools; OAuth shell stripped to single-principal.
**Sources:** camp-404 `app/api/mcp/[transport]/route.ts`, `oauth/{authorize,token,register}/route.ts`, `well-known/*`, `lib/mcp/{oauth,tokens,auth,origin,tool-utils,server}.ts`, `tools/teams.ts`; intake-tracker `mcp/tools.ts`.
- Lift the OAuth shell verbatim: `[transport]/route.ts`, `oauth/*`, `well-known/*`, `oauth.ts`/`tokens.ts`/`origin.ts`, the `next.config` `/.well-known` rewrites, `MCP_PUBLIC_URL` origin logic, meta-refresh `htmlRedirect` (**never 302**).
- `tool-utils.ts` (**`runTool` is here**, not `server.ts`): keep audit + error masking + helpers; drop scope/profile gate → single principal. `auth.ts`: `campUserId` → constant.
- **Strip** `scope.ts`/`consent.ts`/`access.ts`; reskin the consent screen orange + single-user copy.
- Build `lib/mcp/tools/opsboard.ts` (the 14 brief tools, `teams.ts` shape + intake-tracker read-only safety: generic errors, Zod range validation, fire-and-forget audit). `get_blocked_tasks`/`get_closing_windows`/`get_critical_path` call the **same `@opsboard/core` derivations** as the dashboard. **Destructive tools return a confirmation token** (mirror the voice flow over MCP).
- `registerOpsboardTools` in `server.ts`; test via the Claude.ai connector (`/api/mcp/mcp`).

## S7 — Design pipeline (Pencil)
**Goal:** the design-brief is authored (✅ done: `../design/design-brief.md`); optionally expand into camp's two-track pipeline. **The human operator drives Pencil via the CLI** (never the MCP).
**Sources:** camp-404 `design/{brief.md,pencil-master-prompt.md,pencil-sections/,prompts/,README.md,feature-set/00-overview.md}`, `spec/{design-tokens,component-library,README}.md`, `crt-bg.glsl`; `ops-board.html`; the existing `design/app.pen`.
- ✅ `design/design-brief.md` written per the template.
- Optional next: `design/feature-set/00-overview.md` (functional contract: cliff / window-state / read-only / tap-cycle invariants + states matrix); `pencil-master-prompt.md` (7-field per-surface blocks for the ~9 surfaces); port `scripts/pencil/{run.sh,merge-pens.mjs,extract-boards.mjs}` + the Playwright capture harness (430px, dark, seeded), inheriting the pitfalls (singleton guard, drift-not-trace, hide fixed bars, `--no-verify`).
- Add the **behavioral gate**: after eyeballing each `.pen` vs its reference, verify it preserves the functional contract (every window-state/status/view), not just visual fidelity.
- Optional `crt-bg.glsl` re-defaulted to orange/near-black as a restrained flourish.

## S8 — Polish + optional reminders
**Goal:** prompt tuning, edge cases, optional cron, deferred mobile.
**Sources:** camp-404 cron gating; intake-tracker `medication-notification-service.ts` (dedupe), `TESTING_STRATEGY.md`.
- Intent-prompt tuning + adversarial-JSON boundary tests (truncated/null/out-of-range/prompt-echo → typed error, never a wrong mutation).
- Optional `/api/cron/closing-windows` behind `Authorization: Bearer ${CRON_SECRET}`; days-until-threshold + a persisted dedupe-set (notified key `${date}-${taskId}`).
- axe-core a11y on the dashboard E2E; a redundant-channel audit (no color-only signals).
- **Defer mobile** (Capacitor `output: "export"` breaks on Server Actions/cookies/rewrites — all used here); plan client-only screens + a separate API as a later phase, not MVP.

---

## Asset reuse manifest

Legend: **LIFT** = copy verbatim (rename scope only) · **ADAPT** = copy + modify · **REF** = pattern reference / extract a piece · **SKIP** = do not bring over.

### camp-404
| Verdict | Source | → Target | Note |
|---|---|---|---|
| ADAPT | `packages/ui/src/styles/globals.css` | `packages/ui/src/styles/globals.css` | the file to mirror; swap palette to OKLCH orange, add cat/warning/card-elevated/subtle tokens, `--radius:0`, DM Sans, 19-step scale |
| LIFT | `packages/ui/src/lib/utils.ts` | same | `cn()` = `twMerge(clsx)` |
| ADAPT | `packages/ui/{package.json,components.json}` | same | rename scope; keep exports map + `sideEffects` + raw-tsx + new-york + lucide; **drop `@camp404/core` dep** (no control-panel) |
| LIFT | `packages/ui/src/components/button.tsx` | same | 6 variants × 5 sizes |
| ADAPT | `packages/ui/src/components/badge.tsx` | same | + window-state + status variants |
| ADAPT | `packages/ui/src/components/{icon-badge,progress-bar,nav-card}.tsx` | same | icon-badge: 5 cat tones `/12`; progress-bar: amber segment; nav-card: orange active + window chip |
| LIFT | `packages/ui/src/components/{alert,spinner,dialog,card,stat-tile,empty-state,section-header,detail-header,divider,segmented-control}.tsx` | same | token-driven; re-skin automatically |
| ADAPT | `packages/ui/src/components/toast.tsx` | same | extend `ToastRecord` with `actions[]` (currently dismiss-✕ only) |
| REF | `packages/ui/src/components/control-panel.tsx` | `packages/ui/src/components/voice-button.tsx` | extract **only** `CentreButton` (~L193–212); don't port the component (rank + core dep) |
| LIFT | `packages/ui/.storybook/{main,preview}.ts` | same | Storybook 10 + tailwind vite + globals in preview |
| LIFT | `apps/web/components/voice/use-voice-recorder.ts` | same | + configurable endpoint; keep iOS fallback / cleanup |
| LIFT | `apps/web/components/voice/waveform.tsx` | same | auto-themes orange; swap import |
| ADAPT | `apps/web/components/voice/dictate-button.tsx` | `…/voice-fab.tsx` | fixed-position FAB; route transcript to `/api/voice/command` |
| LIFT | `apps/web/lib/{groq,rate-limit,anthropic}.ts` | same | pinned whisper-large-v3-turbo; Haiku 4.5 |
| ADAPT | `apps/web/lib/voice-prompts.ts` | same | OpsBoard vocab (<224 tokens) |
| REF | `apps/web/lib/feedback-ai.ts` | `app/api/voice/command/route.ts` | Claude call structure (Haiku, temp 0, forced tool_use, Zod, 30s, fail-safe) |
| ADAPT | `apps/web/app/api/voice/transcribe/route.ts` | `…/command/route.ts` (+ keep transcribe if dictation kept) | lift guard ladder; strip auth to single-user; swap prompt |
| LIFT | `apps/web/app/api/mcp/[transport]/route.ts` | same | swap `registerCampMcpTools` → `registerOpsboardTools` |
| ADAPT | `apps/web/lib/mcp/tool-utils.ts` | same | **`runTool` lives here**; drop scope/profile gate → single-principal; keep audit + error masking |
| LIFT | `apps/web/lib/mcp/{oauth,tokens,origin}.ts` + `oauth/{authorize,token,register}/route.ts` + `well-known/*` | same | OAuth+PKCE shell, redirect allow-list, meta-refresh; depends on `@opsboard/db` MCP tables |
| ADAPT | `apps/web/lib/mcp/{auth.ts,server.ts}` + `tools/teams.ts` | `…/{auth,server}.ts` + `tools/opsboard.ts` | auth: principal→constant; server: register; teams: structural template |
| SKIP | `apps/web/lib/mcp/{scope,consent,access}.ts` + `lib/auth.ts` | — | camp multi-user rank/team/consent/POPIA/Neon-Auth → single-principal stubs |
| ADAPT | `packages/core/src/{family-tree,access}.ts` + `__tests__/family-tree.test.ts` | `packages/core/src/{cycle,critical-path,blocked,window-state}.ts` + tests | family-tree = cycle-guarded graph template; access = pure-predicate shape |
| LIFT | `packages/db/src/index.ts` | same | two-driver + placeholder URL |
| REF | `packages/db/src/schema.ts` + `drizzle.config.ts` | `packages/db/src/{schema,missions,tasks}.ts` + config | replicate column idioms; **don't** copy camp tables; **add** MCP tables; config verbatim |
| ADAPT | `packages/types/src/voice-intent.ts` + `ai-prompts/src/voice-intent.ts` | same | 10 OpsBoard intents; `{system,user}` + `PROMPT_VERSIONS` |
| ADAPT | `{turbo.json,package.json,.npmrc,.prettierrc.json,pnpm-workspace.yaml,AGENTS.md,next.config.ts}` + `packages/{typescript-config,eslint-config}/*` | repo root + packages | rename; set `globalEnv`; AGENTS keep DB/env/AI/conventions, drop POPIA/rank/Telegram/mobile |
| ADAPT | `design/{brief.md,pencil-master-prompt.md,pencil-sections/,prompts/,README.md,feature-set/00-overview.md}` + `spec/*` + `crt-bg.glsl` | `design/*` | Pencil-brief template source (section order, 7-field block, state-matrix, LOCKED-decisions device) |

### intake-tracker
| Verdict | Source | → Target | Note |
|---|---|---|---|
| LIFT | `src/hooks/use-now-tick.ts` | `packages/ui/src/hooks/use-now-tick.ts` | ref-counted 60s ticker; drives live window-state |
| ADAPT | `src/components/voice/voice-panel.tsx` | voice command/confirm UX reference | mature stage→review→commit; `RowState{approved}`, approve/reject-all, keep-state-on-partial-failure, "Saved N of M" |
| ADAPT | `src/lib/{service-result,medication-notification-service,date-utils}.ts` + `components/{medications/undo-toast,error-boundary}.tsx` + `hooks/use-undo-delete-mutation.ts` | `packages/core` + `apps/web/lib` + components | service-result (ok/err); notification-service = days-until + dedupe-set (model `get_closing_windows`/cron); date-utils = local-date-key TZ-safe; undo-toast = destructive confirm; error-boundary outermost |
| REF | `docs/TESTING_STRATEGY.md`, `stryker.conf.json`, `design/feature-set/00-overview.md`, `docs/design/camp-404-design-system-port-briefing.md`, `src/lib/{nav-routes,analytics-registry}.ts` | test plan + design docs + registries | Stryker/fast-check scope; TZ-matrix; functional-contract + states-matrix shape; Pencil pitfalls; declarative view/query catalog |
| SKIP | `src/lib/card-themes.ts` + Dexie/sync substrate + `medication-schedule-service.ts` | — | Tailwind class-string theming (use OKLCH); IndexedDB/sync irrelevant (server-side Neon); over-coupled service bodies |

### ops-board prototype
| Verdict | Source | → Target | Note |
|---|---|---|---|
| ADAPT | `ops-board.html` | design reference + view algorithms | visual DNA + `renderTaskView`/`renderTimelineView`/`renderDepsView`/`cycleStatus` ported ~1:1; **strip** all modal/CRUD JS; re-bucket timeline on `too_late_by`; relabel overdue→closed |

---

*Functional contract: `../project_brief.md`. Visual design: `../design/design-brief.md`. Evidence: `research-dossier.md`.*
