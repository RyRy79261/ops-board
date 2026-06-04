# OpsBoard — Accessibility (axe-core) + Redundant-Channel Audit

*S8 polish (`docs/scaffolding-plan.md` S8: "axe-core a11y + redundant-channel audit"). Scope: `@opsboard/ui` (`packages/ui`) — the 30-component kit. This report records the automated gate, the structural fixes applied to component source, and the contrast pairs surfaced as **design-review items for the operator** (NOT changed here — the palette is LOCKED).*

> Sources: `docs/tech-spec/01-foundations.md` (tokens + redundant-channel rule §103/§293); design-brief §3 (OKLCH palette, LOCKED), §6 LOCKED #6 ("Color is never the sole carrier — every category/state is icon + label + color").

---

## 1. What runs in CI

Two suites under `packages/ui/src/__tests__/`, executed by the existing `pnpm --filter @opsboard/ui test` (vitest, jsdom + `@vitejs/plugin-react`):

| Suite | File | Asserts |
|---|---|---|
| **axe-core structural gate** | `a11y.test.tsx` | Renders the key components with `@testing-library/react` and asserts `axe(...)` reports no violations (`vitest-axe` `toHaveNoViolations`). |
| **redundant-channel audit** | `redundant-channel.test.tsx` | `WindowStatePill`, `CategoryTag`, `StatusBadge` each render a TEXT label + a decorative icon — state/category is never carried by color alone (LOCKED #6). |

New dev-deps: `jsdom`, `@testing-library/react`, `@testing-library/dom`, `vitest-axe`. Matchers + cleanup are registered in `src/__tests__/setup.ts` (wired via `vitest.config.ts` `setupFiles`).

### Gating scope — STRUCTURAL only, `color-contrast` DISABLED

The gate asserts **structural** rules: roles, accessible names, `aria-*` validity, label/control association, list + landmark semantics, and button-vs-div. It runs axe with:

```ts
const AXE_OPTIONS = { rules: { "color-contrast": { enabled: false } } };
```

**`color-contrast` is excluded on purpose.** The tactical-orange-on-near-black palette is LOCKED (design-brief §3) and operator/Pencil-owned — it is not this suite's to change. The pairs that would fail WCAG AA are itemized in §4 below as design-review items only. Gating on contrast here would either (a) fail the build on an intentional, owned design decision or (b) pressure an automated edit to LOCKED tokens. Both are wrong; we surface, we do not gate.

---

## 2. Components audited

All key interactive/stateful + chrome components, plus the presentational leaves they compose:

- **Atoms / pills:** Button (6 variants), IconButton, Badge, CategoryTag (5 tones × pill/inline/dimmed), WindowStatePill (open/closing/closed/not-yet/blocked × bordered/tinted/bare + countdown/date overloads), StatusBadge (3 statuses × bordered/tinted), StatusCycleButton (3 statuses, in Touch44), StatusDot, StatTile, ProgressBar (segmented + indeterminate), Spinner (loader/arc, labelled + sr-only).
- **Surfaces:** Card (+ Header/Title/Description/Content), NavCard, Alert (info/warning/destructive), EmptyState (no-missions/no-tasks), Toast (success/info/error/needsConfirmation/disambiguation via `ToastItem`), Dialog (Content/Header/Title/Description/Footer).
- **Chrome organisms:** AppHeader, Sidebar, MissionDetailHeader, CategoryGroupHeader, ViewTabs, TaskCard (fed dummy `tz`/`now`/`onCycle`), VoiceFAB (5 states), RecordingPanel (3 states).

Result: **58 tests passing.** The kit was already built with strong a11y (required `aria-label` on icon-only controls, `aria-hidden` decorative glyphs, `role="alert"`/`"status"` on advisory surfaces, proper `role="progressbar"`/`tablist`/`tab`, list semantics on Toast picks). The audit found and fixed the three genuine structural defects below.

---

## 3. Structural fixes applied (component source)

| # | Component | Violation (axe rule) | Fix |
|---|---|---|---|
| 1 | **VoiceFAB** (`voice-fab.tsx`) | `role="alert"` was set on the `<button>` in the error state — **`aria-allowed-role`**: a `button` element may not carry `role="alert"`. | Removed `role="alert"` from the button (it keeps its native `button` role + state-reflecting `aria-label`). The failure now announces ASSERTIVELY via a `role="alert"` + `aria-live="assertive"` **text region** (the visible hint, or an `sr-only` alert when the hint is suppressed in fixed-position product use). Same audible behaviour, valid ARIA. |

Two further axe findings were **test-fixture artifacts, not component defects** — the component ARIA is correct; the fix was in the test harness, and the source was left unchanged:

| # | Component | Finding | Resolution |
|---|---|---|---|
| 2 | **ViewTabs** (`view-tabs.tsx`) | `aria-valid-attr-value`: each `role="tab"` carries `aria-controls="view-panel-{value}"`, which dangled because the test rendered the tablist without its panels. | Correct ARIA for a reusable tablist — the consumer owns the `role="tabpanel"` elements. The a11y test now renders the matching `view-panel-*` panels so the reference resolves (mirrors real usage). |
| 3 | **AppHeader** (`app-header.tsx`) | `landmark-unique`: two `<header>` banner landmarks without distinguishing names. | Artifact of rendering two AppHeaders in one container; product renders exactly one app banner. Split into two single-banner test cases. |

> The kit's pre-existing good practices that the audit confirmed (no fix needed): IconButton requires `aria-label` (icon `aria-hidden`); StatusCycleButton has a stateful action-describing `aria-label` ("Task status: …, activate to mark …") and is a real `<button>` wrapped in a ≥44px `Touch44`; Dialog associates a `DialogTitle`/`DialogDescription` and a labelled close; Toast disambiguation picks are a `<ul>`/`<li>` of `<button>`s; ProgressBar exposes `role="progressbar"` + `aria-value*`; Alert/Spinner/RecordingPanel/EmptyState carry `role="alert"`/`"status"`; decorative dots/rings/waveform/icons are `aria-hidden`.

---

## 4. Contrast — DESIGN-REVIEW items for the operator (NOT changed)

The `color-contrast` rule is **excluded from the CI gate** (§1). The palette is LOCKED + Pencil-owned; the table below is surfaced so the operator can decide, NOT an action item for this package. Ratios computed from the hex mirror in `01-foundations.md` / `globals.css`. WCAG AA thresholds: **4.5:1** normal text · **3:1** large text (≥24px, or ≥18.66px bold) and non-text UI.

### Pairs that FAIL AA for normal text

| Token pair | Where it appears | Ratio | Normal text (4.5:1) | Large / UI (3:1) |
|---|---|---|---|---|
| `muted-foreground` on `card` | secondary text inside cards/rows | 4.12:1 | FAIL | PASS |
| `muted-foreground` on `muted` | header/sidebar secondary text | 4.41:1 | FAIL | PASS |
| **`muted-foreground-subtle` on `background`** | 3rd-tier dim labels (eyebrows, captions, `{done}/{total}`) | 2.29:1 | **FAIL** | **FAIL** |
| **`muted-foreground-subtle` on `card`** | StatTile labels, EmptyState hint, TaskCard blocked-by caption | 2.00:1 | **FAIL** | **FAIL** |
| `cat-medical` text on `cat-medical/12` fill (over card) | CategoryTag (pill, medical) | 4.35:1 | FAIL | PASS |
| `destructive` text on `destructive/12` fill (over card) | tinted destructive chips | 4.14:1 | FAIL | PASS |
| `destructive-foreground` (#fafafa) on `destructive` fill | destructive Button label | 3.48:1 | FAIL | PASS |

### Non-text / hairline borders (3:1 target) — below threshold by design

| Token pair | Ratio | Note |
|---|---|---|
| `border` on `background` | 1.40:1 | Hairline; decorative separation, paired with surface fill — not a sole UI-state signal. |
| `border` on `card` | 1.22:1 | As above. |
| `border-hover` on `background` | 1.77:1 | Hover lift only. |

### Pairs that PASS (for reference)

`foreground` on background/card (16.2/14.2:1); `primary` on background/card and `primary-foreground` on `primary` (~7:1); `success`/`warning`/`destructive` on background (5.4–11.7:1); all 5 category hues as text on background (4.7–11.9:1); `primary`/`warning`/`success`/`cat-travel` text on their own `/12` fills (5.2–8.0:1).

### Recommended operator review (no change made here)

1. **`muted-foreground-subtle` (#4a4a5e)** is the sharpest concern — it fails AA on every surface, including for large text, yet carries real labels (StatTile captions, eyebrows, the TaskCard blocked-by hint, EmptyState hint). The redundant-channel rule mitigates *meaning* loss (icon + word always present), but the operator may want to lift this token one step or reserve it for genuinely decorative text only.
2. **`muted-foreground` (#7a7a8e)** clears AA on `background` (4.71:1) but not on the `card`/`muted` chrome surfaces it most often sits on (4.12–4.41:1) — a borderline call.
3. **Tinted `/12` chips for `cat-medical` and `destructive`** land just under 4.5:1; the same recipe passes comfortably for the other hues.

These are intentionally left for the LOCKED-palette owner; this package changed no color tokens and no `globals.css`.
