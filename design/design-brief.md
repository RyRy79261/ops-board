# OpsBoard — Design Brief for Pencil.dev

> **What this is.** A single, self-contained design brief you hand to Pencil to design OpsBoard's screens. It carries the visual identity, the exact design tokens, the component kit, every screen + state, and the ground rules a design tool must follow. It is *transcribed from real code and the prototype, not invented* — the token values are computed from `ops-board.html`'s `:root` and the architecture mirrors `camp-404/packages/ui/src/styles/globals.css`. Once `@opsboard/ui` exists, keep this brief and that file in sync.
>
> **Provenance & scope.** OpsBoard is a *re-skin + evolution* of the `ops-board.html` prototype onto Camp 404's token architecture, re-pointed at OpsBoard's own product model (voice-first, read-only, "windows" not "deadlines"). The prototype is the **visual DNA**; the v3 product brief (`../project_brief.md`) is the **functional contract**. Where they disagree, the product brief wins on *what must exist*, this brief wins on *tone*, and the designer wins on *how it looks* — but **drop no functionality**.
>
> **Pencil workflow note.** `.pen` files are driven via the Pencil **CLI** only (per project policy), and the human operator runs Pencil — this document is the input.

---

## 1. Identity

OpsBoard is a **tactical terminal** for one person's missions. Near-black layered surfaces, a single hot **tactical-orange** brand (`#ff6b35`), **JetBrains Mono** for all chrome/data/labels and **DM Sans** for human text, five category hues, and **sharp zero-radius corners** everywhere except circular dots/avatars. The mood is calm and precise — it shows **information, not verdicts**. It never nags, never says "overdue"; it tells you a *window* is open, closing, closed, or not yet started.

Three personality bullets for Pencil:
- **Dark-only.** No light theme. The terminal identity is inherently dark.
- **Mobile-first dimension** ~430px wide; scales up to a 3-pane desktop (header / 280px sidebar / main).
- **Signature motif:** restrained CRT/scanline texture — used sparingly as accent (landing, empty state, voice-active), never on every screen, always decorative/`aria-hidden`.

### Implementation foundation (what Pencil should design *onto*)

OpsBoard's UI is **shadcn/ui (the "new-york" style) built on Tailwind v4** — Radix primitives + CVA variants + OKLCH design tokens declared in a Tailwind v4 `@theme {}` block (no `tailwind.config.js`), assembled as the `@opsboard/ui` package (mirroring `@camp404/ui`). Three consequences for the design:

- **Design to shadcn primitives.** The component kit in §14 maps 1:1 to shadcn/ui components (Button, Card, Badge, Dialog, Toast, Alert, Progress, Tabs/SegmentedControl, …). Compose screens from this kit rather than inventing bespoke widgets — point Pencil's shadcn awareness at it.
- **Tokens are Tailwind v4 CSS variables.** Every value in §3 (colour), §4 (category), §6 (type), and the radius/fonts is a `--color-*` / `--text-*` / `--radius` / `--font-*` custom property, consumed as `bg-[color:var(--color-…)]`, `text-…`, or through a component's CVA variants. Components reference tokens, never raw hex (the hex mirror exists only for Pencil's non-OKLCH contexts).
- **Tailwind v4 mechanics:** one `globals.css` = `@import "tailwindcss"` + the `@source "../components/**/*.{ts,tsx}"` directive + one `@theme {}` block. Colour, radius, spacing, and the type-scale all flow from that block; there is no `tailwind.config.js`.

---

## 2. LOCKED decisions (tie-breakers — override any conflicting signal)

1. **Palette is OpsBoard's own orange, not Camp 404's magenta.** We mirror Camp 404's token *architecture* and type-scale; we do not import its colors.
2. **`--radius: 0`.** Sharp corners are the identity. Exceptions: status dots, category dots, avatars, and pill badges (`rounded-full`).
3. **Never the word "overdue."** Past a cliff = **"window closed"** (muted grey, struck-through). Red is reserved for genuine danger only.
4. **The board is read-only.** No create/edit/delete forms or modals on the board. The **only** direct interaction is tapping a task to cycle status. Everything else happens by voice or MCP.
5. **Two type faces only:** JetBrains Mono (chrome, labels, data, counts, window-state) + DM Sans (mission/task names, notes).
6. **Color is never the sole carrier.** Every category and every window/status state is disambiguated by **icon + label + color** (CVD-safe redundant channels).
7. **Mobile voice FAB sits bottom-right, not bottom-center** (a deliberate deviation from product brief §3 — see §11.1 for the rationale).

---

## 3. Colour tokens (OKLCH — exact)

Authored as a Tailwind v4 `@theme {}` block (no `tailwind.config.js`). Consumed as `bg-[color:var(--color-…)]` / `text-…` / CVA variants. Surfaces are a neutral-cool hue (~285°); the only chroma in the chrome is the orange brand and the status/category accents.

| Token | OKLCH | Role |
|---|---|---|
| `--color-background` | `oklch(0.146 0.004 286)` | page background (near-black) |
| `--color-foreground` | `oklch(0.933 0.011 286)` | primary text (warm white) |
| `--color-muted` | `oklch(0.189 0.010 285)` | subtle surface (header/sidebar) |
| `--color-muted-foreground` | `oklch(0.586 0.030 285)` | secondary text |
| `--color-muted-foreground-subtle` | `oklch(0.417 0.033 285)` | **3rd-tier** dim text (stat labels, dep hints, empty-state, "not yet" reasons) |
| `--color-card` | `oklch(0.221 0.016 285)` | elevated surface (cards, popovers) |
| `--color-card-foreground` | `oklch(0.933 0.011 286)` | text on card |
| `--color-card-elevated` | `oklch(0.257 0.022 285)` | deepest panel / progress-bar track |
| `--color-popover` | `oklch(0.221 0.016 285)` | popover (shares card) |
| `--color-popover-foreground` | `oklch(0.933 0.011 286)` | text on popover |
| `--color-border` | `oklch(0.291 0.025 285)` | hairline borders |
| `--color-border-hover` | `oklch(0.355 0.025 285)` | border on hover |
| `--color-input` | `oklch(0.291 0.025 285)` | input borders (same as border) |
| `--color-primary` | `oklch(0.705 0.193 39)` | **tactical orange** brand |
| `--color-primary-foreground` | `oklch(0.146 0.004 286)` | near-black text on orange |
| `--color-ring` | `oklch(0.705 0.193 39)` | focus ring (matches primary) |
| `--color-secondary` | `oklch(0.221 0.016 285)` | quiet interactive surface |
| `--color-secondary-foreground` | `oklch(0.933 0.011 286)` | text on secondary |
| `--color-accent` | `oklch(0.221 0.016 285)` | hover/active surface lift (= card; the *orange wash* is expressed as `bg-primary/12`, not a second brand hue) |
| `--color-accent-foreground` | `oklch(0.933 0.011 286)` | text on accent |
| `--color-destructive` | `oklch(0.641 0.168 23)` | danger red (genuine danger only) |
| `--color-destructive-foreground` | `oklch(0.98 0 0)` | text on destructive |
| `--color-success` | `oklch(0.809 0.184 149)` | done / healthy |
| `--color-success-foreground` | `oklch(0.18 0.03 149)` | text on success |
| `--color-warning` | `oklch(0.80 0.16 80)` | amber — "closing" advisory (**new**; prototype had no amber) |
| `--color-warning-foreground` | `oklch(0.20 0.04 80)` | text on warning |
| `--color-info` | `var(--color-primary)` | info aliases the orange brand |
| `--color-info-foreground` | `var(--color-primary-foreground)` | text on info |
| `--radius` | `0` | sharp corners (see LOCKED #2) |
| `--overlay` | `oklch(from var(--color-background) l c h / 0.7)` | modal/scrim dim |

> **Accent note:** the prototype's `--accent-dim` (orange at 12%) is a *wash*, not a second brand colour. So `--color-accent` resolves to the card surface (so Camp-lifted ghost/outline hovers stay legible), and anywhere the prototype used the orange wash you use `bg-primary/12` explicitly.

### Hex mirror (for Pencil / non-OKLCH contexts)

`orange #ff6b35` (hover `#ff8555`) · `near-black #0a0a0c` · surfaces `#131318` / `#1a1a22` / `#22222e` · borders `#2a2a38` / `#3a3a4a` · text `#e8e8f0` / `#7a7a8e` / `#4a4a5e` · `danger #e05a5a` · `success #5ae07a` · `amber/warning ≈ #d9a73e` (derived from the OKLCH token, not the prototype).

---

## 4. Category colours (OpsBoard-specific)

Five seeded categories, each a hue **+ Lucide icon + label** (redundant-channel rule — colour is never alone). Camp 404 has no per-entity hue table by design; this family is an **intentional, authorized divergence**. Tints are consumed at **12% alpha** (`bg-cat-x/12`) — see §7.

| Category | OKLCH | Hex | Lucide icon | Label |
|---|---|---|---|---|
| medical | `oklch(0.659 0.181 351)` | `#e05a9f` | `Stethoscope` | Medical |
| bureaucratic | `oklch(0.687 0.119 248)` | `#5aa0e0` | `FileText` | Bureaucratic |
| travel | `oklch(0.816 0.150 160)` | `#5ae0a0` | `Plane` | Travel |
| gear | `oklch(0.816 0.126 92)` | `#e0c05a` | `Backpack` | Gear |
| tech | `oklch(0.609 0.199 305)` | `#a05ae0` | `Cpu` | Tech |

> **Watch:** gear-yellow (`92°`) and the new warning-amber (`80°`) are close. They never collide in practice because gear always carries the `Backpack` icon + "Gear" label and amber only ever appears as the "CLOSING" window-state pill with a `Clock` icon. Keep both rules.

---

## 5. Elevation & radius

**Elevation ladder (3 tiers):** `background` → `muted` (header/sidebar) → `card` (task/mission cards, popovers) → `card-elevated` (progress-bar track, deepest panels). Borders are hairline `--color-border`, lifting to `--color-border-hover` on hover.

**Radius:** `--radius: 0` — everything is sharp. `rounded-full` exceptions: status dots (6px), category dots (8px), the `task-check`/StatusCycleButton is an **18px square** (not rounded), pill badges, the circular voice FAB, avatars (none in MVP).

---

## 6. Typography

Two faces. **JetBrains Mono** = all chrome: the wordmark, section/group/sidebar labels (uppercase, tracked), data rows, counts, countdowns, window-state pills, tags, captions. **DM Sans** = human text: mission names, task names, notes, body copy. OpsBoard leans on the mono/console motif *harder* than Camp 404 does — the mono carries most of the UI.

Adopt Camp 404's named type-scale **verbatim** (the 19 `--text-*` steps below — sizes/line-heights are font-agnostic). Each token fixes size + paired line-height (and sometimes letter-spacing); **weight, case, and tracking stay per-component**. Rule: *do not add ad-hoc px sizes.*

```css
/* ===== Type scale — 19 named steps (paired sub-properties REQUIRED) ===== */
--text-brand-glyph: clamp(7rem, 30vw, 14rem);
--text-brand-glyph--line-height: 0.9;
--text-brand-glyph--letter-spacing: -0.05em;   /* huge wordmark glyph — optional for OpsBoard */
--text-display: 2rem;            --text-display--line-height: 1.1;     /* hero */
--text-title: 1.625rem;          --text-title--line-height: 1.2;       /* page title */
--text-title-wizard: 1.5rem;                                          /* interstitial */
--text-title-compact: 1.375rem;                                      /* overlays / notifications */
--text-section: 1.25rem;         --text-section--line-height: 1.3;     /* sub-section headings */
--text-subtitle: 1rem;           --text-subtitle--line-height: 1.3;    /* DEFAULT card title / mission name */
--text-subtitle-hero: 1.125rem;                                      /* hero card header */
--text-subtitle-dense: 0.9375rem;                                    /* dense list rows */
--text-body: 0.875rem;           --text-body--line-height: 1.45;       /* DEFAULT body (task names, notes) */
--text-body-long: 0.9375rem;                                         /* long-read */
--text-label: 0.8125rem;         --text-label--line-height: 1.4;       /* labels / links / chips */
--text-caption: 0.75rem;         --text-caption--line-height: 1.4;     /* meta / counts */
--text-micro: 0.6875rem;         --text-micro--line-height: 1.2;       /* pills */
--text-micro-xs: 0.625rem;                                            /* annotations */
--text-brand-label: 0.6875rem;                                       /* mono — wordmark / wide caps */
--text-eyebrow: 0.6875rem;       --text-eyebrow--letter-spacing: 0.125em;  /* mono — uppercase 2px-tracked */
--text-mono: 0.8125rem;          --text-mono--line-height: 1.5;        /* mono — data/console rows, counts, countdown */
--text-mono-caption: 0.75rem;    --text-mono-caption--line-height: 1.4;/* mono — tags, dep hints, field captions */
```

**Role mapping (prototype → scale):** logo/wordmark → `--text-brand-label` (mono, 4px tracking, uppercase, orange + dim `BOARD`); section / task-group / sidebar labels → `--text-eyebrow` (mono, uppercase, 0.125em); data rows / counts / countdown / stat values → `--text-mono`; tags / dependency hints / captions → `--text-mono-caption`; mission name → `--text-subtitle`; task name / notes → `--text-body`; stat labels → `--text-caption` in `--color-muted-foreground-subtle`.

---

## 7. Tint / alpha convention

No raw hex tints — derive every tint from a token via alpha. **Canonical fill alpha = 12%** (matches the prototype's `-dim` family), e.g. `bg-cat-medical/12`, `bg-warning/12`, `bg-primary/12`. Hover-lift fills use **18%**. Left-accent borders and pill text use the **solid** token (full opacity). When lifting Camp 404's Badge/IconBadge (which default to `/15`), **normalize them to `/12`** so the new category/status tints don't visually mismatch.

---

## 8. Iconography

Lucide throughout. Category icons in §4. Window-state icons: `Clock` (closing), `XCircle` (closed, faint), `AlertTriangle` (blocked), `Lock` (not-yet / `not_before`). Voice: `Mic` (idle), `Square` (recording/stop), `Loader2` (processing). Status glyphs live on the StatusCycleButton (§10). Empty-state keeps the prototype's `⬡` hexagon motif.

---

## 9. Window-state model (the core concept)

OpsBoard replaces all "deadline/overdue" language with **window state**, derived live (it is *computed, never stored*) from a task's `too_late_by` cliff, its `not_before` date, and its dependencies. Four mutually-exclusive states; **`CLOSING_THRESHOLD_DAYS = 7`** (a task is "closing" when its cliff is ≤ 7 days away). The "closed" boundary is the **local end-of-day** of `too_late_by` in the user's timezone.

**Precedence when several could apply:** `closed` > `not-yet (blocked)` > `not-yet (not_before)` > `closing` > `open`.

Each state is carried by **four redundant channels** (color + icon + label + opacity/strikethrough):

| State | Color token | Icon | Label (mono caps) | Card treatment | Opacity |
|---|---|---|---|---|---|
| **open** | neutral (foreground/border); success only if a positive cue is wanted | none | *(none — absence = healthy)* | normal `bg-card border-border` | 1.0 |
| **closing** | `--color-warning` (amber) | `Clock` | `CLOSING · T-{n}d` | `border-l-2 border-warning`; days in mono amber | 1.0 |
| **closed** | `--color-muted-foreground` | `XCircle` (faint) | `WINDOW CLOSED` | `bg-muted`; task name `line-through text-muted-foreground` | 0.55 |
| **not-yet · blocked** | `--color-muted-foreground` (reason muted, **not red**) | `AlertTriangle` | `BLOCKED` + `⚠ blocked by: {names}` | `border-l-2 border-muted-foreground-subtle`, dim | 0.6 |
| **not-yet · not_before** | `--color-muted-foreground-subtle` | `Lock` | `NOT YET` + `starts {date}` | `border-l-2`, dim | 0.6 |

Mission **progress bar** gets a matching 3-segment treatment over the `card-elevated` track: `success` (done) + `warning` (closing) + `destructive` (blocked).

---

## 10. Status model & the one direct interaction

Three **stored** statuses: `not-started → in-progress → done` (cycled in that order, wrapping). `blocked` is *derived*, not stored — it folds into the not-yet window treatment. The **StatusCycleButton** is the only direct board interaction:

- **18px square, 2px border** (sharp, not a checkbox — it is a 3-state cycle, not binary).
- `not-started`: empty square, `border-border`; hover `border-success`.
- `in-progress`: `border-primary`, `bg-primary/12`, glyph `◼` (or `Square` filled) in orange.
- `done`: `border-success`, `bg-success`, glyph `✓` in near-black; the task **name** goes `line-through text-muted-foreground`.
- **Guard rule (decided):** the button is **always enabled**. Window-state and blocked are *advisory, never gating* — you may start a blocked task or mark a closed-window task done (real life allows it). The advisory treatment persists until the underlying facts change. This keeps the single direct interaction from ever being dead.

---

## 11. Screens & surfaces

Design these as **one cohesive system** sharing one primitive kit. For each surface: **Purpose · Layout (top→bottom) · Every action (preserve all) · States · Exact values · Do-not-drop.**

### App shell (header + sidebar + main)
- **Purpose:** persistent read-only frame.
- **Layout:** sticky **header** (~61px; padding `20px 32px`; `border-bottom`; `bg-muted`; z-100): left = wordmark `OPS` (orange) `BOARD` (dim), mono, 4px tracking. **No "+ Mission" button** (removed — creation is voice/MCP). Below: flex row, height `calc(100vh − 61px)`. Left = **280px sidebar** (`border-right`, `bg-muted`, flex-shrink-0). Right = **main** column: mission detail header → view tabs → view content. Voice **FAB** fixed bottom-right (z-150). **Toaster** bottom-center (mobile) / bottom-right (desktop), raise above FAB.
- **Actions:** select mission, switch view. *(No create/edit/delete UI anywhere.)*
- **States:** empty (no missions → EmptyState), loading (skeleton), populated.
- **Do-not-drop:** the three-pane structure; sticky header.

### Mission sidebar
- **Purpose:** mission list + per-mission window summary; selection drives the main view.
- **Layout:** sidebar header (mono uppercase "MISSIONS" eyebrow). Scrollable list, 8px padding. Each row (NavCard): mission **name** (DM Sans `--text-subtitle`, 600) + meta line (mono `--text-mono-caption`, muted): a **window-summary chip** (replaces the prototype's `T-{n}d` / "overdue" countdown — show the nearest-cliff window state, e.g. `T-12d` or `CLOSING` or `COMPLETE`) + `{done}/{total} tasks`.
- **States:** active (`bg-primary/12` + `border-primary`), hover (`bg-card` + visible border), empty.
- **Actions:** tap → select mission.

### Mission detail header
- **Purpose:** at-a-glance mission status.
- **Layout:** padding `24px 32px`. Title (DM Sans `--text-title`). Target line (mono muted): `Target: {date}` (keep — it's the real-world event date, not a task due date). Stats row (mono, gap 24px): **Done** (success) · **Blocked** (destructive) · **Closing** (amber — *replaces the prototype's "Days overdue"*) · **Total**. 3-segment **ProgressBar** (4px) over `card-elevated`.
- **States:** populated; all-done (progress full success, optional "COMPLETE" pill).
- **Actions:** none (read-only). *(Mission edit moves to voice/MCP — drop the hover "edit" affordance.)*

### Category view (default)
- **Purpose:** tasks grouped by the 5 categories, in seeded `sort_order`, empty groups skipped.
- **Layout:** padding `20px 32px`. Per group: header = 8px **category dot** + cat-colored label (mono eyebrow) + `{done}/{total}` count in dim. Then stacked **task cards**.
- **Task card:** StatusCycleButton (left) · task **name** (DM Sans) · meta row: category **tag** (Badge, `bg-cat-x/12` + icon + label) · window-state pill (§9) · dependency hint (mono caption). The card itself takes the window-state treatment (border/opacity/strikethrough).
- **States:** per task — 4 window states × 3 statuses × blocked.
- **Actions:** tap StatusCycleButton.

### Timeline view
- **Purpose:** tasks bucketed by the ISO week of their **`too_late_by` cliff** (ascending) — *not* by a due date.
- **Layout:** per week: header = `{date range}` + a days-until label. **Future** weeks: `In {n}d` / `This week`. **Past** weeks: `WINDOW CLOSED` (relabel from the prototype's "{n}d ago"). Trailing **"No cliff"** bucket for tasks without `too_late_by`.
- **States:** future / this-week / past-closed / empty.
- **Actions:** tap StatusCycleButton.

### Dependencies view
- **Purpose:** dependency chains — roots (no deps) → recursive children, indented, with connectors; unreachable tasks grouped as "Unlinked."
- **Layout:** roots first; children indented `depth × 36px` with a `↓` connector for depth > 0. Hand-rolled indented tree (not a heavy graph lib at this scale). Optionally highlight the **critical path** (longest chain to target) with an orange accent on the connectors.
- **States:** blocked propagation (folds into not-yet); cycle-safe rendering (a cycle must not loop forever — render each node once, mark the back-edge).
- **Actions:** tap StatusCycleButton.

### Voice command surface (FAB + recorder) — the biggest net-new piece
- **Purpose:** the one input affordance — mic → record → transcribe → intent → confirmation.
- **Layout:** fixed circular **FAB**, 56–64px, **bottom-right on both desktop and mobile** (§11.1), with `padding-bottom: env(safe-area-inset-bottom)` on mobile. On press: inline waveform + `mm:ss` timer (mono) + status label. A sharp glow/pulse ring on active (tactical idiom, not a soft glow).
- **States:** `idle` (`Mic`, orange on near-black, "Tap to record") · `requesting` ("Allow microphone…", spinner) · `recording` (button flips to **destructive** red, `Square` glyph, live **orange** waveform, mm:ss, "Recording", pulse ring) · `processing` (orange `Loader2`, "Transcribing…") · `error` (inline red line, `role="alert"`, "Tap to retry").
- **Actions:** push-to-talk (`onPointerDown/Up/Leave/Cancel`) or tap-to-toggle; on transcript → POST to the command endpoint (**never** append text to a field).

### Confirmation toast / disambiguation
- **Purpose:** surface the result of a voice/MCP command; gate destructive/low-confidence intents behind a tap-to-confirm.
- **Layout:** toast, `max-w-sm`, `bg-card`, hairline border, **mono caps header** + DM Sans body. Action row when needed.
- **States:**
  - **success** → success-tinted, auto-dismiss ~5s. E.g. `✓ MARKED DONE` / "Cardiology follow-up".
  - **needsConfirmation** (destructive or low-confidence) → **persistent** (no auto-dismiss), warning-tinted, header e.g. `CONFIRM DELETE`, body `Delete task "Cardiology follow-up"?`, buttons **Confirm** (destructive) + **Cancel**.
  - **disambiguation** (multiple matches) → 2–3 tap-to-pick action buttons inline (or a small Dialog picker for >3).
  - **error** → destructive-tinted, `role="alert"`.
- **Actions:** Confirm → re-issue intent with `confirmed:true` → execute → replace with success toast; Cancel → dismiss, no-op; Pick → re-issue the resolved intent.

### Voice **query** result (distinct from confirmation)
- **Purpose:** answer read-only questions ("What's blocking me on AfrikaBurn?", "What's closing this week?") from computed state. **Never mutates.**
- **Layout:** an **info-tinted** transient panel/toast (`role="status"`, longer dwell ~8s, no action buttons), visually distinct from the warning confirmation toast — header e.g. `CLOSING THIS WEEK`, body a short DM Sans answer with a mono task list. Offer an "expand" for longer answers.

### Empty / loading / error
- **EmptyState:** centered `⬡` hexagon + mono message. Copy is **voice-first**: no missions → `No missions yet — say "create a mission"`; mission with no tasks → `No tasks yet — say "add a task"`.
- **Loading:** skeletons for sidebar rows + cards.
- **Error:** an ErrorBoundary fallback (sharp card, mono header, "Something broke" + retry).

### §11.1 Mobile voice-FAB placement — deliberate deviation
Product brief §3 asks for the mic "thumb-reachable bottom-center" on mobile. We **override to bottom-right** because confirmation/disambiguation toasts anchor bottom-center and a persistent confirm toast directly under the mic is a collision/failure mode. Net: FAB bottom-right, toasts bottom-center, they never overlap. Flagging this so it's a chosen trade-off, not an oversight. *(If you prefer thumb-center, the alternative is to float the persistent confirm toast above the FAB with an explicit offset — call it in the open decisions.)*

---

## 12. Global states matrix

Every surface must be designed for: **empty · loading · populated · error**, plus the domain states — **window:** open / closing / closed / not-yet · **status:** not-started / in-progress / done · **blocked-by-dependency**.

**Anti-states (explicitly do NOT design):**
- ❌ The word **"overdue"** anywhere (relabel to "window closed").
- ❌ Offline / sync / conflict states (server-side app, not offline-first).
- ❌ Any create/edit/delete **form or modal** on the board.
- ❌ Multi-user / rank / approval / invite / consent UI (single user).
- ❌ Panic-red for time pressure — closing is **amber** (advisory), closed is **muted grey**. Red is danger only.

---

## 13. Ground rules for every Pencil prompt

1. **Anchor hard to a reference capture** of the corresponding prototype screen — *"reproduce, do not redesign"* — then apply these tokens.
2. **Pass exact tokens; never guess a hex.** Use the OKLCH (or hex-mirror) values above.
3. **State the theme: dark.** Always.
4. **Forbid invented device chrome** — no iOS status bar, no "9:41", no battery glyph, no browser frame, no bottom tab bar unless specified here.
5. **Mobile = single column** at ~430px; desktop = the 3-pane shell.
6. **Generation is an approximation** — always export and compare against the reference; iterate.
7. **Redundant channels + no "overdue":** every category/state shows icon + label + color; never render the word "overdue."

---

## 14. Component kit (atoms → organisms)

Every item here is a **shadcn/ui component** (Radix + CVA), most **lifted from `@camp404/ui`** and re-skinning automatically once the tokens above are in place; a few are **adapted** and two are **new**. Design them as a single shadcn-based kit.

**Lift verbatim (re-skins via tokens):** Button (6 variants × 5 sizes), Card, Alert, Spinner, Dialog (reserved for voice disambiguation only — *not* CRUD), SegmentedControl (view tabs), StatTile, EmptyState, SectionHeader, DetailHeader, Divider, Waveform.

**Adapt:** **Badge** → add window-state variants (open/closing/closed/not-yet) + status variants (not-started/in-progress/done); it's already an uppercase tracked pill matching the prototype tags. **IconBadge** → add the 5 category tones at `/12`. **ProgressBar** → add the amber "closing" segment (3 segments total). **NavCard** → orange active state + window-summary chip. **Toast** → add an optional `actions[]` (Confirm/Cancel) — today it only has a dismiss ✕. **Voice FAB** → extracted from Camp's push-to-talk centre button, made fixed-position.

**New:** **StatusCycleButton** (§10). **The three views** (Category / Timeline / Dependencies) as composed organisms.

**Do not bring over:** control-panel / quadrant-nav / captain-lock (Camp's multi-rank machinery), Avatar / google-button (single-user), Combobox / Command (no command palette in MVP).

---

## 15. Optional CRT / scanline flourish

If you want the signature motif: a **restrained** scanline + slow rolling-refresh band + vignette + barely-there flicker, re-tinted orange/near-black, applied only to landing / empty-state / voice-active accents, always `aria-hidden`. **Skip** aggressive per-row RGB-bleed glitch — OpsBoard is *precise*, not broken-on-purpose.

---

## 16. Open design decisions (please settle while briefing Pencil)

1. **Mobile FAB placement** — accept bottom-right (recommended, §11.1) or insist on thumb-center with an offset confirm toast?
2. **CRT motif** — in or out for MVP? If in, how prominent?
3. **Critical-path highlight** in the Dependencies view — show it in MVP or defer?
4. **Window "open" badge** — show a calm success cue, or show *nothing* (absence = healthy, recommended)?
5. **`--text-brand-glyph`** — OpsBoard's wordmark is small/mono; keep the giant glyph step for parity or drop it?

---

*Self-contained for Pencil. Functional contract: `../project_brief.md`. Token source of truth once built: `packages/ui/src/styles/globals.css`. Research behind these choices: `../docs/research-dossier.md`.*
