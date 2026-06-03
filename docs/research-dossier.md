# OpsBoard — Research Dossier

*Output of a 9-agent research investigation (7 parallel investigators → synthesis → completeness critic) across `camp-404`, `intake-tracker`, the `ops-board.html` prototype, and current-stack best-practices. This is the evidence base behind `../design/design-brief.md` and `scaffolding-plan.md`.*

> Reference repos (local clones): **camp-404** `/home/ryan/repos/Personal/camp-404` · **intake-tracker** `/home/ryan/repos/Personal/intake-tracker`. `intake-tracker-gsd2` was explicitly excluded.

---

## 0. Headline conclusions

1. **The v3 brief is largely correct, with one structural gap.** Camp 404's voice + MCP + DB assets are real and high-quality and lift cleanly. The brief's only factual slips: `runTool` lives in `lib/mcp/tool-utils.ts`, **not** `server.ts`; and the MCP OAuth shell **hard-depends on DB tables** (`mcpOauthClients`, `mcpAuthCodes`, `mcpAccessTokens`, `mcp_audit_log`) that the brief's 4-table schema omits — they must be added in the DB stage or the OAuth shell can't compile.
2. **The aesthetic tension resolves cleanly.** Adopt Camp 404's token *architecture* + 19-step type-scale + `packages/ui` structure; keep OpsBoard's own **tactical-orange** palette (computed to OKLCH, independently verified accurate to 3 decimals). See the design brief.
3. **Camp 404 already has a working design→Pencil pipeline.** OpsBoard should clone its two-track structure (functional contract + visual/Pencil track) rather than invent one. The design brief follows that template.
4. **intake-tracker is the maturity source for exactly the pieces OpsBoard needs most:** the voice *intent→stage→review→commit* flow (Camp only dictates), the `useNowTick` live-recompute primitive, the window-closing reminder pattern, and the testing discipline (Stryker/fast-check/TZ-matrix/adversarial-JSON).

---

## 1. camp-404 — design system & tokens

- Tokens live in a Tailwind v4 `@theme {}` block in `packages/ui/src/styles/globals.css` — **no `tailwind.config.js`**. The file starts `@import "tailwindcss";` then the critical `@source "../components/**/*.{ts,tsx}";` — without it, Tailwind v4 won't scan the package's own components and CVA classes like `bg-primary` get purged.
- Full semantic role vocabulary: background/foreground/primary/secondary/accent/muted/card/popover/border/input/destructive/ring + P0 status (success/warning/info) + `--overlay` (background-derived scrim) + `--radius: 0.625rem`.
- **Type-scale is 19 distinct named `--text-*` steps** (not 24 — a count the synthesis got wrong and the critic corrected). Each fixes size + paired `--line-height`/`--letter-spacing`; weight/case/tracking stay per-call-site. Rule in-file: *"Do not add ad-hoc px sizes."*
- Component library = ~40 component `.tsx` files (≈45 incl. stories), each with a co-located `*.stories.tsx`: thin Radix wrappers (button, dialog, select, slider, checkbox, switch, popover, label, avatar, command), CVA presentational leaves (button, badge, icon-badge, alert, spinner), bespoke composites (control-panel, control-grid, quadrant-nav, toast, option-card-group, segmented-control, stepper, qcard, input-field, stat-tile, nav-card).
- Package: `@camp404/ui`, `type: module`, `sideEffects: ["**/*.css"]`, exports `./styles.css`, `./components/*` (raw `.tsx`, no build step), `./hooks/*`, `./lib/utils`. shadcn `"new-york"` style, `baseColor: neutral`, `iconLibrary: lucide`. `cn()` = `twMerge(clsx(...))`. Deps: CVA, clsx, tailwind-merge, cmdk, lucide-react, Radix, React 19; dev: Tailwind v4 + `@tailwindcss/vite`, Storybook ^10.4.1, Vitest.
- **Latent issues (verified):** the `./hooks/*` export points at a directory that **does not exist**; the design-system doc lists ~9 components vs ~40 actual (stale — generate from code).

## 2. camp-404 — the design→Pencil pipeline (template gold)

- **Two-track separation:** a *functional* track (`design/feature-set/00-overview.md` + ~30 unit docs, each a source-grounded contract, adversarially verified ~96.7% across 2097 claims) defining the **drop-no-functionality** contract a re-skin must preserve; and a *visual/Pencil* track (`brief.md` + per-screen `prompts/*.md` anchored to `reference/*.png` Playwright captures + the consolidated `pencil-master-prompt.md` assembled from `pencil-sections/*.md`).
- **`.pen` is a regenerable artifact, not source of truth** — durable inputs are the running app + reference PNGs + prompts + brief + tokens.
- Conflict rule (carry verbatim): *unit-doc wins on what-must-exist, brief wins on tone, designer wins on look.*
- Per-`###`-surface 7-field template: Purpose / Layout & elements / Every action (preserve all) / States to design / Options & exact values / Validation & rules / Do-not-drop.
- GLSL shaders (`crt-bg`, `crt-404`, `scanlines*`, `glitch-*`) are reusable optional flourish; `crt-bg.glsl` is the calmest. Scripts (`scripts/pencil/run.sh` singleton guard, `merge-pens.mjs`, `extract-boards.mjs`, Playwright capture) are generic and retargetable.
- **Pipeline gap to fix:** Camp only checks *visual* fidelity against the PNG; add a **behavioral gate** — confirm each `.pen` preserves the functional contract (every window-state, status, view).
- **Policy override for OpsBoard:** a research agent suggested reading/writing `.pen` via the Pencil MCP — **disregarded**; OpsBoard policy is Pencil **CLI only**, and the human operator drives Pencil.

## 3. camp-404 — architecture & "store structures"

- **Server-first, no client-state library.** State = RSC + Server Actions + local `useState`/`useOptimistic`/`useTransition`. The repeating idiom is a **page/action/client triad**: a server-component page (`createHttpDb`, derive view-state via `@camp404/core`, pass plain props) + a co-located `actions.ts` (`"use server"`, returns `{ok}` | `{ok:false,error}`, `revalidatePath`) + small `"use client"` leaves.
- **Pure logic** lives in `@camp404/core` (e.g. `access.ts` pure predicates, `family-tree.ts` cycle-guarded graph walk with an `isAncestor` seen-Set) — I/O-free, heavily unit-tested. This is the direct template for OpsBoard's `blocked` / `windowState` / `criticalPath` / `detectCycles`.
- **DB:** `packages/db/src/index.ts` exposes two drivers — `createHttpDb()` (stateless, no transactions, for routes/RSC) and `createPooledDb()` (WebSocket pool, transactions, for CLI/atomic work) — plus a `BUILD_PLACEHOLDER_URL` so builds don't need a live DB. `schema.ts` is the single hand-authored source; migrations are drizzle-kit-generated and append-only.
- **Camp-specific machinery to strip for OpsBoard:** rank/team/captain/consent/approval gating, POPIA pgcrypto column encryption, Neon-Auth multi-user, Telegram, mobile.

## 4. camp-404 — voice & MCP assets (verified file-by-file)

- **Voice engine lifts wholesale:** `use-voice-recorder.ts` (MediaRecorder state machine, **iOS-Safari `audio/mp4` MIME fallback**, `fftSize=1024`, 2-min auto-stop, before-`stop()` handler-nulling cleanup), `waveform.tsx`, `groq.ts` (pinned `whisper-large-v3-turbo`, `response_format: json`, `temperature: 0`), `rate-limit.ts` (token bucket), `lib/voice-prompts.ts` (domain Whisper bias, <224-token discipline).
- **transcribe route guard ladder** (lift, swap auth to single-user): auth → dual rate-limit → `formData` → `File` check → `audio/*` (415) → 10MB (413) → error scrub.
- **The intent→action layer is the only net-new work** and Camp has scaffolded its parts: `packages/types/src/voice-intent.ts` (`z.discriminatedUnion("intent", […])`), `packages/ai-prompts/src/voice-intent.ts` (`{system,user}` const + version pinning), `lib/anthropic.ts` (pins **Haiku 4.5** for classification, Opus for heavy). The closest existing call pattern to copy for the new command route is **`lib/feedback-ai.ts`** (pinned Haiku, temp 0, forced `tool_use`, Zod-validated input, 30s timeout, fail-safe null).
- **MCP** is a complete OAuth 2.0 + PKCE server: `app/api/mcp/[transport]/route.ts` (via `mcp-handler`), `oauth/{authorize,token,register}`, well-known metadata, HTML consent, redirect allow-list (claude.ai/anthropic.com + loopback), **meta-refresh `htmlRedirect` (never 302** — CSP `form-action 'self'` drops cross-origin 302s), origin from `MCP_PUBLIC_URL` (never `VERCEL_URL`), `runTool({toolName,extra,argsForAudit,handler})` audit wrapper **in `tool-utils.ts`**, one-file-per-domain `tools/*.ts` (e.g. `teams.ts`).
- **Strip to single-principal:** `scope.ts` / `consent.ts` / `access.ts` go; keep the OAuth shell, audit log, error masking. `runTool` imports `appendMcpAuditLog` from `@camp404/db/mcp` → OpsBoard must provide `@opsboard/db/mcp` + the MCP tables (hard prerequisite).
- **Toast** (`toast.tsx`) is provider-less (`useSyncExternalStore`, SSR-safe), supports `duration: Infinity`, bottom-center-mobile/bottom-right-desktop, `z-[100]` — but **`ToastRecord` has no `actions` field** (only a dismiss ✕). Adding `actions[]` is the single functional gap for the confirm/disambiguation UX.

## 5. intake-tracker — maturity to borrow (and cruft to avoid)

**Borrow (ranked):**
1. **Voice `intent→parse→STAGE→review→commit`** from `src/components/voice/voice-panel.tsx` — the mature reference for the confirm/disambiguation flow the brief calls the biggest net-new piece. Reuse the two-call transcribe-then-parse sequence, the `RowState{item, approved: true|false|null}` staging shape, approve/reject-all, and *keep-review-state-on-partial-failure* ("Saved N of M").
2. **`use-now-tick.ts`** (ref-counted 60s ticker, ~45 lines, no deps) — drive all live window-state recompute through it; pass `now` *into* the pure `@opsboard/core` derivations (do **not** import React into core).
3. **`medication-notification-service.ts`** — the model for window-closing reminders: days-until-threshold + a persisted dedupe-set keyed `${date}-${taskId}`; keep derivation pure, only the side-effect is I/O; gate `/api/cron/*` behind `CRON_SECRET`.
4. **Testing discipline** (`docs/TESTING_STRATEGY.md`, `stryker.conf.json`): Stryker mutation testing scoped to pure-logic + MCP OAuth/token modules (nightly, not per-PR); fast-check property tests (blocked invariant, critical-path, relative-time); an **adversarial-JSON table test** on the Claude intent boundary (truncated/null/out-of-range/prompt-echo → typed error, never a wrong mutation); axe-core a11y; **TZ-matrix** runs.
5. The 46-doc **functional-contract** design-system format + global **states matrix**; the `{hue, Lucide icon, short label}` triple + redundant-channel rule (but author as OKLCH tokens, not Tailwind class strings).
6. Pencil capture pipeline + pitfalls (singleton `run.sh` guard, drift-not-trace, hide fixed bars, `--no-verify`).
7. MCP read-only-safety details: generic client-facing errors (no SQL/field leakage), fire-and-forget audit, Zod range validation, per-file unit tests.
8. Cross-cutting patterns (re-styled to OKLCH): `service-result.ts` (ok/err/unwrap; reads-throw/mutations-return), `undo-toast.tsx` + `use-undo-delete-mutation.ts` for delete confirms, `error-boundary.tsx` (persist crash to log), declarative `nav-routes.ts`/`analytics-registry.ts` registry shape for views + the MCP/voice-query catalog.

**Do NOT borrow:** `card-themes.ts` (Tailwind class-string theming — use OKLCH tokens; keep only the triple concept); the Dexie/IndexedDB + sync-engine substrate (OpsBoard is server-side Neon/Drizzle); the Dexie-coupled medication/titration service bodies (adapt computation only, keep logic pure in core); any hand-editing of the Drizzle `_journal.json`.

## 6. Prototype (`ops-board.html`) → v3 transformation

- **Visual DNA to preserve:** the orange-on-near-black tactical look, the 3-tier surface ramp, mono-caps chrome + DM Sans body, the 5 category colors, the task-card / progress-bar / stat-block / view-tab / sidebar idioms, the `⬡` empty state, the 3 view algorithms (Category grouping, Timeline week-bucketing, Dependencies recursive chain), and the tri-state `cycleStatus`.
- **Remove:** all create/edit/delete **modals + buttons** (`+ MISSION`, `+ Task`, card edit/delete, mission-title edit) — the board is read-only; CRUD is voice/MCP. Strip the modal JS.
- **Add:** the 4 window-state treatments, the floating voice FAB + recorder, confirmation/disambiguation toasts, the voice-query result surface.
- **Relabel:** "overdue"/"deadline" → window state; Timeline buckets re-keyed on `too_late_by` (not `deadline`); past weeks → "WINDOW CLOSED"; the mission "Days overdue" stat → "Closing".
- **Data-drive:** iterate DB categories by `sort_order` rather than the hardcoded `CATEGORIES` array.

## 7. Execution best-practices (current stack)

- **Next.js 16 / React 19:** server-first read-only dashboard — RSC pages (`force-dynamic`, `createHttpDb`) + **Server Actions** for the status-cycle mutation (`useOptimistic` + `useTransition`, `revalidatePath`). No SWR/react-query.
- **Liveness:** `useNowTick(60_000)` recomputes window-state from already-fetched data (no network) + a light client-island `router.refresh()` every 30–60s re-fetches server data. (SSE is overkill for single-user.)
- **Tailwind v4 + shadcn in a workspace package:** the `@source` directive is mandatory (see §1); consume tokens as CSS vars; raw-`.tsx` export, no build step.
- **Dependency-graph view:** hand-rolled layered/indented tree at 10–30 nodes; React Flow + dagre is overkill. Topological order + critical-path from `@opsboard/core`.
- **Voice UX:** push-to-talk or tap-to-toggle; confirm destructive/low-confidence before executing; optimistic UI + toast.
- **Capacitor + Next 16:** `output: "export"` breaks on Server Actions / cookie-reading pages / rewrites (all used here) — defer mobile; if needed later, client-only screens hitting a separately deployed API.

---

## 8. Decisions made (with rationale)

| Decision | Resolution |
|---|---|
| Theme | **Dark-only** for MVP (no light split). |
| Surface ramp | **3-tier** — add `--color-card-elevated` (`#22222e`). |
| Status cycle control | **New `StatusCycleButton` CVA** (18px square tri-state), not a checkbox/Badge. Always enabled (advisory states never gate it). |
| Window-state carrier | **Badge variants** + card-level className map + IconBadge icon; static amber for closing + amber progress segment; **no** per-task live countdown bar. |
| Category colors | **Separate `--color-cat-*` family**, `/12` alpha, always icon+label paired. |
| `--color-accent` | = card surface (opaque); orange wash via `bg-primary/12`. |
| Tint alpha | **Canonical 12%** fills (normalize lifted Badge/IconBadge from `/15`→`/12`); 18% hover. |
| `CLOSING_THRESHOLD_DAYS` | **Pinned = 7.** |
| "closed" boundary | **Local end-of-day** of `too_late_by` in user tz; tested under TZ matrix (Africa/Johannesburg + Europe/Berlin). |
| Liveness | `useNowTick(60s)` recompute + `router.refresh()` 30–60s. No client-state lib. |
| Auth | **Thin shared-secret/session** for the app + **keep full OAuth+PKCE** for MCP; per-action gates collapse to single-principal no-ops. |
| MCP tables | **Add** `mcpOauthClients/mcpAuthCodes/mcpAccessTokens/mcp_audit_log` + `appendMcpAuditLog` in the DB stage (hard prereq for the OAuth shell). |
| MCP write tools | Expose the brief's write tools, but **destructive tools return a confirmation token** (mirror the voice `needsConfirmation` flow over the MCP transport). |
| Mobile FAB | **Bottom-right** both desktop & mobile; toasts bottom-center (deliberate deviation from brief §3). |
| `hooks/` export | **Populate** it (`useNowTick`, `useMediaQuery`) rather than drop. |
| Eng discipline | commitlint + fast pre-commit + Stryker/fast-check on core + MCP oauth (nightly) + TZ-matrix scripts; **defer** release-please. |

---

## 9. Critic corrections & open contradictions (must hold during build)

**Corrections applied to the design brief:**
- Type-scale is **19** named `--text-*` steps, not 24. The full block (with paired `--line-height`/`--letter-spacing`) is reproduced in the brief — a `@theme` block missing those sub-props ships a UI with no type scale.
- Added the **3rd-tier muted text token** (`--color-muted-foreground-subtle` = `#4a4a5e`, used 13× in the prototype) — the synthesis referenced a nonexistent `text-dim` token.
- Pinned **one canonical tint alpha (12%)**; normalize lifted Badge/IconBadge from `/15`.
- Pinned **`CLOSING_THRESHOLD_DAYS = 7`** and the local-end-of-day closed boundary as tested core constants.
- Specified the **StatusCycleButton guard rule** (always enabled; states advisory).
- Specified the **voice `query` result surface** (info-tinted, never mutates) distinct from the confirmation toast.
- `--radius: 0` with an explicit `rounded-full` exception list.
- Mobile FAB framed as a **deliberate deviation**, not silent override.

**Contradictions to keep in view:**
- Brief §3 (thumb-center mobile mic) vs our bottom-right resolution — accepted trade-off, see brief §11.1.
- Brief §4 lists mutating MCP tools vs intake-tracker's read-only MCP — resolved by confirm-over-MCP (a net-new behavior; flagged for sign-off).
- Brief §0/§4 "single-user (or no) auth" — we chose a thin session + OAuth-for-MCP (narrows the "no auth" option).
- The single-principal MCP strip leaves a concrete DDL choice: **drop `userId`/`campUserId` columns** from the MCP tables vs **keep them nullable and write a constant**. Decide at schema time (recommend: keep nullable, write a constant — cheaper, audit stays useful).

**Verified solid (no action):** all proposed OKLCH values match the prototype hex to 3 decimals (only cat-travel 159 vs 160, negligible); `runTool` is in `tool-utils.ts`; the MCP OAuth tables exist at camp `schema.ts` L1289–1383; `CentreButton` (the FAB source) has no `@camp404/core` dep while the surrounding `control-panel` does; `ToastRecord` has no `actions` field.

---

*Raw agent transcripts: `…/subagents/workflows/wf_dd27ac64-413/`. Reuse manifest → `scaffolding-plan.md` §"Asset reuse manifest".*
