# OpsBoard Tech Spec — 01 · Foundations

*Type scale, color tokens, radius, spacing, and foundational primitives. Source of truth: the Pencil **Design System screen** (`WCTkf`) + `docs/design-extract/00-variables.json`. Build target: a Tailwind v4 `@theme` block mirroring camp-404 `packages/ui/src/styles/globals.css` (scaffolding-plan S1).*

# Foundations — Type, Colour, Radius, Spacing & Primitives

> **Source of truth:** the Design System SCREEN board `WCTkf__design-system.json` → column **`COL — Foundations`** (authoritative), reconciled against the resolved variable file `00-variables.json`. Cross-references to `design-brief.md` §3/§5/§6/§7 are **informational** — where the screen diverges from the brief, the screen wins.
>
> **As-built target:** a single Tailwind v4 `@theme {}` block in `packages/ui/src/styles/globals.css`, mirroring camp-404 (scaffolding S1). Every value below is a `--color-*` / `--text-*` / `--radius` / `--font-*` custom property; components reference tokens, never raw hex. The hex mirror exists only for Pencil's non-OKLCH context.

The board's own framing (verbatim from the screen): *"This board documents only the foundations below — tokens, type, colour, elevation, spacing, tint. Instance components from the library rather than rebuilding them here."* The Foundations column is the only authoritative source for tokens/scale; components live in the Component Library board.

---

## 1. Type scale (AS SHOWN on the screen)

The screen's **Type Scale Block** renders **11 specimen rows** (a curated subset of the brief's 19-step `--text-*` scale). Each row = a `Specimen` (the live example in its real font/size/weight) + a `Caption` (`JetBrains Mono` 11 / 500 / +0.5 tracking, `$muted-foreground-subtle`) describing the role. The values below are the *flattened, authoritative* render — these are the exact px sizes the build must support.

| # | Specimen text | Size (px) | Font | Weight | Tracking | Fill | Screen caption (role) | Maps to brief `--text-*` |
|---|---|---|---|---|---|---|---|---|
| 1 | "Field Operations" | 32 | DM Sans | 700 | — | `$foreground` | `display · 32 · DM Sans 700` | `--text-display` (2rem = 32px) ✅ |
| 2 | "Mission Control" | 26 | DM Sans | 700 | — | `$foreground` | `title · 26 · DM Sans 700` | `--text-title` (1.625rem = 26px) ✅ |
| 3 | "Active Missions" | 20 | DM Sans | 600 | — | `$foreground` | `section · 20 · DM Sans 600` | `--text-section` (1.25rem = 20px) ✅ |
| 4 | "Passport Renewal" | 16 | DM Sans | 600 | — | `$foreground` | `subtitle · 16 · DM Sans 600 · mission name` | `--text-subtitle` (1rem = 16px) ✅ |
| 5 | "Book courier pickup before the 3pm window closes." | 14 | DM Sans | 400 (`normal`) | — | `$foreground` | `body · 14 · DM Sans 400 · tasks / notes` | `--text-body` (0.875rem = 14px) ✅ |
| 6 | "Assigned to" | 13 | DM Sans | 500 | — | `$foreground` | `label · 13 · DM Sans 500` | `--text-label` (0.8125rem = 13px) ✅ |
| 7 | "Updated 4m ago" | 12 | DM Sans | 400 (`normal`) | — | `$muted-foreground` | `caption · 12 · DM Sans 400` | `--text-caption` (0.75rem = 12px) ✅ |
| 8 | "URGENT" | 11 | DM Sans | 600 | — | `$foreground` | `micro · 11 · DM Sans 600 · pills` | `--text-micro` (0.6875rem = 11px) ✅ |
| 9 | "CATEGORY" | 11 | JetBrains Mono | 600 | **2** | `$foreground` | `eyebrow · 11 · JetBrains Mono 600 · 2px tracking` | `--text-eyebrow` (0.6875rem = 11px, +0.125em) ✅ |
| 10 | "T-02:14:33" | 13 | JetBrains Mono | 500 | — | `$foreground` | `mono · 13 · JetBrains Mono 500 · data / counts` | `--text-mono` (0.8125rem = 13px) ✅ |
| 11 | "#travel #docs" | 12 | JetBrains Mono | 500 | — | `$foreground` | `mono-caption · 12 · JetBrains Mono 500 · tags / hints` | `--text-mono-caption` (0.75rem = 12px) ✅ |

**Wordmark spec (rendered separately in the Type Scale block):**
- `OPS` + `BOARD`, both `JetBrains Mono` **22 / 700**, **4px tracking** (per caption).
- `OPS` fill = `$primary` (`#ff6b35`); `BOARD` fill = `$muted-foreground` (`#7a7a8e`).
- Caption: *"wordmark · JetBrains Mono 700 · 4px tracking · OPS primary / BOARD muted-foreground"*.
- ⚠ **Screen renders the wordmark at 22px**; the brief maps wordmark → `--text-brand-label` (0.6875rem = 11px). Screen wins — the wordmark in the design-system board is a 22px specimen. Treat `--text-brand-label` as the *small wide-caps* step and size the live header wordmark per the shell screen. (Informational divergence — see notes.)

### Coverage vs the brief's 19 steps
**Shown on screen (11):** display, title, section, subtitle, body, label, caption, micro, eyebrow, mono, mono-caption — plus the wordmark specimen. **NOT shown on the foundations screen (8 of 19):** `--text-brand-glyph`, `--text-title-wizard`, `--text-title-compact`, `--text-subtitle-hero`, `--text-subtitle-dense`, `--text-body-long`, `--text-micro-xs`, `--text-brand-label`. These steps still exist in the build's `@theme` (lifted verbatim from camp-404 per S1) but are not specimen-documented on this screen.

> **Line-heights:** the screen does **not** annotate line-height on any specimen (single-line specimens). The build must still carry the brief's paired `--text-*--line-height` sub-properties verbatim: display 1.1, title 1.2, section 1.3, subtitle 1.3, body 1.45, label 1.4, caption 1.4, micro 1.2, eyebrow (size-only + 0.125em tracking), mono 1.5, mono-caption 1.4.

---

## 2. Font families

Two faces, rendered in the **Font Families Block** with role captions and Aa/aa/0-9 specimens:

| Family | Role (verbatim from screen) | Build token |
|---|---|---|
| **DM Sans** | *"human text · titles · mission & task names · body · notes"* | `--font-dm-sans` |
| **JetBrains Mono** | *"chrome · labels · data · counts · countdowns · tags"* | `--font-jetbrains-mono` |

- Each family block shows: Name (24/600), Role caption (mono 11/500, `$muted-foreground-subtle`), uppercase alphabet (18/500), lowercase (18/400), numerals + symbols `0123456789 · $ % # @ & + —` (18/500), a divider, and a sample sentence (15/400, `$muted-foreground`).
- DM Sans sample: *"Pack courier docs and confirm the embassy appointment window."*
- JetBrains Mono sample: *"STATUS: ACTIVE · T-02:14:33 · 14 OPEN · #travel #urgent"* — demonstrates the mono/console motif (counts, countdowns, tags) the UI leans on.

---

## 3. Colour tokens (full table — confirmed against `00-variables.json`)

Every swatch on the **Colour Tokens Block** is grouped (SURFACES / TEXT / BRAND / BORDERS / STATUS / CATEGORIES). Each non-category swatch = a `Chip` filled with the token + `Tok` (token name, mono) + `Hex` (literal). **Every hex below was verified identical between the screen swatch and `00-variables.json`.** As-built values are OKLCH (brief §3); the hex is the Pencil/non-OKLCH mirror.

### SURFACES
| Token | Hex (screen = variables) | OKLCH (as-built) | Role |
|---|---|---|---|
| `background` | `#0a0a0c` | `oklch(0.146 0.004 286)` | page canvas (near-black) |
| `muted` | `#131318` | `oklch(0.189 0.010 285)` | subtle surface (header / sidebar) |
| `card` | `#1a1a22` | `oklch(0.221 0.016 285)` | cards · panels · rows · popover |
| `card-elevated` | `#22222e` | `oklch(0.257 0.022 285)` | deepest panel / progress-bar track |

### TEXT
| Token | Hex | OKLCH | Role |
|---|---|---|---|
| `foreground` | `#e8e8f0` | `oklch(0.933 0.011 286)` | primary text (warm white) |
| `muted-foreground` | `#7a7a8e` | `oklch(0.586 0.030 285)` | secondary text |
| `muted-foreground-subtle` | `#4a4a5e` | `oklch(0.417 0.033 285)` | 3rd-tier dim (stat labels, dep hints, captions, "not yet" reasons) |

### BRAND
| Token | Hex | OKLCH | Role |
|---|---|---|---|
| `primary` | `#ff6b35` | `oklch(0.705 0.193 39)` | tactical orange brand |
| `primary-hover` | `#ff8555` | (derived: lighter orange) | hover state of brand |
| `primary-foreground` | `#0a0a0c` | `oklch(0.146 0.004 286)` | near-black text on orange |
| `ring` | `#ff6b35` | `oklch(0.705 0.193 39)` | focus ring (= primary) |

### BORDERS
| Token | Hex | OKLCH | Role |
|---|---|---|---|
| `border` | `#2a2a38` | `oklch(0.291 0.025 285)` | hairline borders |
| `border-hover` | `#3a3a4a` | `oklch(0.355 0.025 285)` | border on hover |
| `input` | `#2a2a38` | `oklch(0.291 0.025 285)` | input borders (= border) |

### STATUS
| Token | Hex | OKLCH | Role |
|---|---|---|---|
| `success` | `#5ae07a` | `oklch(0.809 0.184 149)` | done / healthy |
| `warning` | `#d9a73e` | `oklch(0.80 0.16 80)` | amber — "closing" advisory (new; prototype had no amber) |
| `destructive` | `#e05a5a` | `oklch(0.641 0.168 23)` | genuine danger only |
| `info` | `#ff6b35` | `var(--color-primary)` | info aliases the orange brand |

### CATEGORIES (5 seeded — hue + Lucide icon + label, redundant-channel rule)
The category swatches render as a **tinted chip** (the hue at **12% alpha** = hex suffix `1f`) wrapping the Lucide icon at full-hue, plus a human Label and the Lucide icon name. The full-saturation hue is shown on the icon and matches `00-variables.json` exactly.

| Token | Solid hue | Chip fill (12% tint, as rendered) | Label | Lucide icon |
|---|---|---|---|---|
| `cat-medical` | `#e05a9f` | `#e05a9f1f` | Medical | `stethoscope` |
| `cat-bureaucratic` | `#5aa0e0` | `#5aa0e01f` | Bureaucratic | `file-text` |
| `cat-travel` | `#5ae0a0` | `#5ae0a01f` | Travel | `plane` |
| `cat-gear` | `#e0c05a` | `#e0c05a1f` | Gear | `backpack` |
| `cat-tech` | `#a05ae0` | `#a05ae01f` | Tech | `cpu` |

> **Watch (from brief §4, still holds):** gear-yellow (`#e0c05a`, 92°) and warning-amber (`#d9a73e`, 80°) are close — they never collide because gear always carries the Backpack icon + "Gear" label, and amber only appears as the "CLOSING" window-state pill with a Clock icon.

### Tokens in `00-variables.json` but NOT swatch-documented on the screen
Present in the resolved variable file (and the build `@theme`) but with **no swatch** on the foundations board: `card-foreground`, `popover`, `popover-foreground`, `secondary`, `secondary-foreground`, `accent`, `accent-foreground`, `destructive-foreground`, `success-foreground`, `warning-foreground`, `primary-foreground` (shown), `info-foreground`, plus the category `*-foreground` is not modeled (categories use `foreground`/icon, not a paired fg). These are real tokens — the screen just curates the swatch wall to the representative set per group.

### Token MISSING from `00-variables.json` (present in brief §3)
- **`--overlay`** — brief §3 defines `oklch(from var(--color-background) l c h / 0.7)` for modal/scrim dim. **Not present** in `00-variables.json` and **not** on the screen. The build must add it in `@theme` (or as a computed value) for dialog/recording-panel scrims; flag as an open item.

---

## 4. Radius & elevation

### Radius — `--radius: 0` (sharp everywhere)
Confirmed by `00-variables.json` (`radius: { type: number, value: 0 }`) and the **Radius Note** on the screen. The note text is authoritative:
- *"radius = 0 everywhere"*
- *"rounded-full (999) only for status/category dots, avatars, pill badges & the voice FAB"*

Rendered radius samples on the screen:
| Sample | Type | cornerRadius | Size | Fill |
|---|---|---|---|---|
| Sharp | rectangle | `0` (none) | 40×40 | `$card-elevated` |
| Dot | ellipse | (circular) | 14×14 | `$primary` |
| Pill | frame | `999` | auto | `$primary` |
| Avatar | frame | `999` | 34×34 | `$cat-tech` |

> **Build rule:** `--radius: 0`. The only `rounded-full` (999px) exceptions are status dots, category dots, pill badges, avatars, and the circular voice FAB. (Brief §5 additionally notes the StatusCycleButton is an 18px **square** — i.e. NOT rounded; consistent with radius-0.)

### Elevation ladder (3 tiers — from the **Elevation & Radius Block**)
Tiers are distinguished by **surface fill + hairline `$border` stroke (1px)** — no drop shadows. Each tier row carries `stroke: $border, strokeWidth: 1`.

| Tier | Token | Surface fill | Role (verbatim) |
|---|---|---|---|
| **E0 · BASE** | `background` | `$background` | "Page canvas" |
| **E1 · RAISED** | `card` | `$card` | "Cards · panels · rows" |
| **E2 · ELEVATED** | `card-elevated` | `$card-elevated` | "Popovers · menus · dialogs" |

> Divergence (informational): brief §5 describes a **4-tier** ladder (`background → muted → card → card-elevated`). The screen's elevation ladder collapses this to **3 tiers** (drops `muted`), since `muted` is the header/sidebar chrome surface rather than an elevation step. The build keeps all four surface tokens; the *elevation semantics* are the 3 shown.

---

## 5. Tint / alpha convention (from the **Tint Convention Block**)

Intro (verbatim): *"Status & category fills use the hue at low alpha over the surface — never a flat saturated block."*

Two canonical alpha steps, demonstrated for Primary, Warning, and Category·Travel:

| Step | Caption | Alpha | Hex encoding (8-digit) | As-built |
|---|---|---|---|---|
| **fill** | `12% · fill` | ~12% (`1f` = 31/255) | `#ff6b351f`, `#d9a73e1f`, `#5ae0a01f` | `bg-{token}/12` |
| **hover-lift** | `18% · hover-lift` | ~18% (`2e` = 46/255) | `#ff6b352e`, `#d9a73e2e`, `#5ae0a02e` | `bg-{token}/18` |

> **Build rule:** never author raw hex tints — derive from a token via alpha. Canonical fill = **12%** (`bg-cat-*/12`, `bg-warning/12`, `bg-primary/12`); hover-lift = **18%**. Left-accent borders and pill text use the **solid** token (full opacity). When lifting camp-404's Badge/IconBadge (which default to `/15`), normalize to `/12`. The CrossRef callout primitive on this board uses a fainter `primary` wash (`#ff6b350f` ≈ 6%) with a 2px solid `$primary` left border — a one-off chrome accent, not part of the 12/18 fill convention.

---

## 6. Spacing scale (from the **Spacing Block**)

Header (verbatim): label *"SPACING SCALE"*, description *"4px base grid — gaps and padding step in multiples of 4."*

The screen renders a **4px base grid** with these 8 documented steps (each = numeric label + a `$primary` bar whose width equals the step + a px caption):

| Step | px | Bar width |
|---|---|---|
| S4 | `4px` | 4 |
| S8 | `8px` | 8 |
| S12 | `12px` | 12 |
| S16 | `16px` | 16 |
| S20 | `20px` | 20 |
| S24 | `24px` | 24 |
| S32 | `32px` | 32 |
| S48 | `48px` | 48 |

> **Build rule:** all gaps and padding step in multiples of 4. The 8 documented values (4/8/12/16/20/24/32/48) map directly to Tailwind's default scale (`1/2/3/4/5/6/8/12`) since Tailwind's spacing unit is 0.25rem = 4px — no custom spacing tokens required. Note `40px` (Tailwind `10`) is skipped on the screen between 32 and 48 (informational).

---

## 7. Foundational primitives the board showcases

These are the non-component **layout/documentation atoms** the Foundations column itself is built from — they establish the chrome grammar reused across every screen (they are NOT in the 82/55-component library; they're foundational primitives):

1. **SectionHead** — every foundation block opens with this. An 8×8 `$primary` square **Tick** + a mono uppercase **Label** (`JetBrains Mono` 13 / 700 / +2px tracking, `$foreground`) + a 1px `$border` horizontal **Rule** (`fill_container` width). This is the canonical "tactical section header" motif.
2. **CrossRef callout** — an inline note primitive: faint `primary` wash fill (`#ff6b350f`), **2px solid `$primary` left border** only, 14px padding, 11px gap, a `$primary` Lucide icon + two stacked text lines (title `DM Sans` 14/600 `$foreground`; body `DM Sans` 13/400 `$muted-foreground`). The orange-left-border advisory used for cross-references and "note" surfaces.
3. **Eyebrow / GroupLabel** — mono uppercase micro-label (`JetBrains Mono`, 11–13, 600–700, wide tracking, `$muted-foreground` or `$foreground`) used as group/section titles throughout (the `--text-eyebrow` role).
4. **Swatch / Chip** — a square color chip (token fill, radius 0) + mono `Tok` name + mono `Hex` value; the unit the colour wall is built from. Category variant wraps a Lucide icon inside a 12%-tinted chip.
5. **Specimen row** — a live type specimen (DM Sans / JetBrains Mono in its real size/weight) paired with a mono `$muted-foreground-subtle` caption — the type-scale documentation unit.
6. **Divider / Rule** — 1px `$border` line (horizontal `fill_container`), used in SectionHead and between font specimens.
7. **Status / category Dot** — small circle (`rounded-full`): status dots 6–10px, category dots 8px (per radius note); the only-circular-things rule.
8. **Pill** — `rounded-full` (999) frame with mono micro label; the pill-badge radius exception.

---

## Coverage checklist (what this section fully covers)

- ✅ **Type scale (11 rows)** — every specimen's exact text, px size, font (DM Sans vs JetBrains Mono), weight, tracking, fill, and the screen's role caption; mapped to all 11 corresponding brief `--text-*` names with the 8 missing/non-shown steps enumerated.
- ✅ **Wordmark spec** — OPS/BOARD, 22px mono 700, 4px tracking, primary/muted-foreground fills + caption.
- ✅ **Font families** — DM Sans + JetBrains Mono roles, specimen weights, sample sentences, build `--font-*` tokens.
- ✅ **Colour tokens** — all 6 swatch groups (SURFACES/TEXT/BRAND/BORDERS/STATUS/CATEGORIES) with name + hex + role, every hex verified against `00-variables.json`, OKLCH as-built values, the 5 category hues+tints+icons+labels, undocumented-but-present tokens enumerated, and the missing `--overlay` flagged.
- ✅ **Radius** — `--radius: 0` confirmed in variables + screen; rounded-full(999) exceptions enumerated; the 4 rendered radius samples.
- ✅ **Elevation** — 3-tier ladder (E0/E1/E2) with surface fills + roles; hairline-border (no shadow) convention; 4-vs-3-tier divergence vs brief noted.
- ✅ **Tint/alpha convention** — 12% fill / 18% hover-lift with exact 8-digit-hex encodings (`1f`/`2e`) across primary/warning/category; solid-token rule; camp-404 `/15`→`/12` normalization.
- ✅ **Spacing scale** — 4px base grid, all 8 documented steps (4–48), Tailwind mapping, skipped-40 note.
- ✅ **Foundational primitives** — 8 documentation/chrome atoms the board is built from (SectionHead, CrossRef, Eyebrow, Swatch, Specimen, Divider, Dot, Pill).
- ✅ **As-built target** — Tailwind v4 `@theme` block in `packages/ui/src/styles/globals.css` (scaffolding S1), OKLCH palette + 19-step scale + `--font-*` + `--radius:0`.


## Type scale (as rendered)

| Step | Size | Line-height | Letter-spacing | Font | Weight | Usage |
|---|---|---|---|---|---|---|
| `display` | 32px (2rem) | 1.1 | none | DM Sans | 700 | hero — specimen 'Field Operations'; maps to --text-display |
| `title` | 26px (1.625rem) | 1.2 | none | DM Sans | 700 | page title — specimen 'Mission Control'; maps to --text-title |
| `section` | 20px (1.25rem) | 1.3 | none | DM Sans | 600 | sub-section heading — 'Active Missions'; maps to --text-section |
| `subtitle` | 16px (1rem) | 1.3 | none | DM Sans | 600 | card title / mission name — 'Passport Renewal'; maps to --text-subtitle |
| `body` | 14px (0.875rem) | 1.45 | none | DM Sans | 400 (normal) | task names / notes / body — maps to --text-body |
| `label` | 13px (0.8125rem) | 1.4 | none | DM Sans | 500 | labels / links / chips — 'Assigned to'; maps to --text-label |
| `caption` | 12px (0.75rem) | 1.4 | none | DM Sans | 400 (normal) | meta / counts (muted-foreground) — 'Updated 4m ago'; maps to --text-caption |
| `micro` | 11px (0.6875rem) | 1.2 | none | DM Sans | 600 | pills — 'URGENT'; maps to --text-micro |
| `eyebrow` | 11px (0.6875rem) | size-only | 2px (0.125em) | JetBrains Mono | 600 | uppercase section/group/sidebar labels — 'CATEGORY'; maps to --text-eyebrow |
| `mono` | 13px (0.8125rem) | 1.5 | none | JetBrains Mono | 500 | data / counts / countdowns — 'T-02:14:33'; maps to --text-mono |
| `mono-caption` | 12px (0.75rem) | 1.4 | none | JetBrains Mono | 500 | tags / dep hints / field captions — '#travel #docs'; maps to --text-mono-caption |
| `wordmark (OPS/BOARD specimen)` | 22px | n/a | 4px | JetBrains Mono | 700 | wordmark specimen — OPS in $primary, BOARD in $muted-foreground; brief role token is --text-brand-label (11px) — screen renders the specimen at 22px (divergence) |

## Color tokens

| Token | Value | Role |
|---|---|---|
| `background` | `#0a0a0c / oklch(0.146 0.004 286)` | page canvas (near-black) — SURFACES |
| `foreground` | `#e8e8f0 / oklch(0.933 0.011 286)` | primary text (warm white) — TEXT |
| `muted` | `#131318 / oklch(0.189 0.010 285)` | subtle surface (header/sidebar) — SURFACES |
| `muted-foreground` | `#7a7a8e / oklch(0.586 0.030 285)` | secondary text — TEXT |
| `muted-foreground-subtle` | `#4a4a5e / oklch(0.417 0.033 285)` | 3rd-tier dim text (stat labels, dep hints, captions) — TEXT |
| `card` | `#1a1a22 / oklch(0.221 0.016 285)` | cards/panels/rows/popover surface — SURFACES (E1) |
| `card-foreground` | `#e8e8f0` | text on card (in variables; not swatch-documented) |
| `card-elevated` | `#22222e / oklch(0.257 0.022 285)` | deepest panel / progress-bar track — SURFACES (E2) |
| `popover` | `#1a1a22` | popover surface (= card; in variables, not swatch-documented) |
| `popover-foreground` | `#e8e8f0` | text on popover (in variables, not swatch-documented) |
| `border` | `#2a2a38 / oklch(0.291 0.025 285)` | hairline borders — BORDERS |
| `border-hover` | `#3a3a4a / oklch(0.355 0.025 285)` | border on hover — BORDERS |
| `input` | `#2a2a38 / oklch(0.291 0.025 285)` | input borders (= border) — BORDERS |
| `primary` | `#ff6b35 / oklch(0.705 0.193 39)` | tactical orange brand — BRAND |
| `primary-hover` | `#ff8555` | brand hover (lighter orange) — BRAND |
| `primary-foreground` | `#0a0a0c / oklch(0.146 0.004 286)` | near-black text on orange — BRAND |
| `ring` | `#ff6b35 / oklch(0.705 0.193 39)` | focus ring (= primary) — BRAND |
| `secondary` | `#1a1a22` | quiet interactive surface (= card; in variables, not swatch-documented) |
| `secondary-foreground` | `#e8e8f0` | text on secondary (in variables, not swatch-documented) |
| `accent` | `#1a1a22` | hover/active surface lift (= card; orange wash is bg-primary/12, in variables, not swatch-documented) |
| `accent-foreground` | `#e8e8f0` | text on accent (in variables, not swatch-documented) |
| `destructive` | `#e05a5a / oklch(0.641 0.168 23)` | genuine danger only — STATUS |
| `destructive-foreground` | `#fafafa / oklch(0.98 0 0)` | text on destructive (in variables, not swatch-documented) |
| `success` | `#5ae07a / oklch(0.809 0.184 149)` | done / healthy — STATUS |
| `success-foreground` | `#0a1f12 / oklch(0.18 0.03 149)` | text on success (in variables, not swatch-documented) |
| `warning` | `#d9a73e / oklch(0.80 0.16 80)` | amber 'closing' advisory (new; no amber in prototype) — STATUS |
| `warning-foreground` | `#251a05 / oklch(0.20 0.04 80)` | text on warning (in variables, not swatch-documented) |
| `info` | `#ff6b35 / var(--color-primary)` | info aliases the orange brand — STATUS |
| `info-foreground` | `#0a0a0c` | text on info (in variables, not swatch-documented) |
| `cat-medical` | `#e05a9f / oklch(0.659 0.181 351); tint #e05a9f1f` | category Medical (Stethoscope) — CATEGORIES, consumed at /12 |
| `cat-bureaucratic` | `#5aa0e0 / oklch(0.687 0.119 248); tint #5aa0e01f` | category Bureaucratic (FileText) — CATEGORIES, /12 |
| `cat-travel` | `#5ae0a0 / oklch(0.816 0.150 160); tint #5ae0a01f` | category Travel (Plane) — CATEGORIES, /12 |
| `cat-gear` | `#e0c05a / oklch(0.816 0.126 92); tint #e0c05a1f` | category Gear (Backpack) — CATEGORIES, /12 |
| `cat-tech` | `#a05ae0 / oklch(0.609 0.199 305); tint #a05ae01f` | category Tech (Cpu) — CATEGORIES, /12 |
| `radius` | `0` | global corner radius — sharp everywhere (LOCKED) |
| `overlay` | `oklch(from var(--color-background) l c h / 0.7) — IN BRIEF ONLY` | modal/scrim dim — MISSING from 00-variables.json and the screen; build must add |

**Radius:** --radius: 0 (confirmed in 00-variables.json and the Radius Note). Sharp corners everywhere. rounded-full (999px) is the ONLY exception, reserved for: status dots, category dots (8px), pill badges, avatars (34px), and the circular voice FAB. (Brief §5 adds: StatusCycleButton is an 18px SQUARE, not rounded — consistent with radius-0.) Rendered samples on screen: Sharp 40x40 rect (radius 0), Dot 14x14 ellipse, Pill frame (999), Avatar 34x34 frame (999).

**Spacing:** 4px base grid — all gaps and padding step in multiples of 4 (screen label 'SPACING SCALE', desc '4px base grid — gaps and padding step in multiples of 4.'). 8 documented steps: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 48 px (40px / Tailwind-10 is skipped between 32 and 48). Maps 1:1 to Tailwind default scale (1/2/3/4/5/6/8/12) since 1 unit = 0.25rem = 4px — no custom spacing tokens needed.

**Foundational primitives:** SectionHead — 8x8 $primary square Tick + mono uppercase Label (JetBrains Mono 13/700/+2px tracking, $foreground) + 1px $border full-width Rule; canonical tactical section header, CrossRef callout — faint primary wash fill (#ff6b350f) + 2px solid $primary LEFT border only, 14px pad, 11px gap, $primary Lucide icon + 2 stacked text lines (DM Sans 14/600 title, 13/400 muted body), Eyebrow / GroupLabel — mono uppercase micro-label (JetBrains Mono 11-13, 600-700, wide tracking); the --text-eyebrow role, Swatch / Chip — square color chip (token fill, radius 0) + mono Tok name + mono Hex value; category variant wraps a Lucide icon in a 12%-tinted chip, Specimen row — live type specimen (real font/size/weight) + mono $muted-foreground-subtle caption; type-scale documentation unit, Divider / Rule — 1px $border horizontal line (fill_container width), Status/Category Dot — small circle (rounded-full): status 6-10px, category 8px; only-circular-things rule, Pill — rounded-full (999) frame with mono micro label; pill-badge radius exception

## Screen vs design-brief (informational — screens are authoritative)

- Type scale: screen shows 11 of the brief's 19 --text-* steps as specimens. NOT shown (8): --text-brand-glyph, --text-title-wizard, --text-title-compact, --text-subtitle-hero, --text-subtitle-dense, --text-body-long, --text-micro-xs, --text-brand-label. They still ship in the build @theme (camp-404 verbatim, S1) but are not specimen-documented here.
- Wordmark divergence: the screen renders the OPS/BOARD wordmark specimen at JetBrains Mono 22px/700/4px tracking, whereas the brief maps the wordmark role to --text-brand-label (0.6875rem = 11px). Screen is authoritative for the specimen size; --text-brand-label remains the small wide-caps step.
- Line-heights: the screen does NOT annotate line-height on any specimen (single-line examples). The build must still carry the brief's paired --text-*--line-height sub-props verbatim (display 1.1, title 1.2, section 1.3, subtitle 1.3, body 1.45, label 1.4, caption 1.4, micro 1.2, mono 1.5, mono-caption 1.4).
- Missing --overlay token: brief §3 defines --overlay (oklch(from background ... / 0.7)) for modal/scrim dim, but it is absent from 00-variables.json AND not on the screen. Build must add it for dialog/recording-panel scrims (open item).
- Elevation ladder: brief §5 describes 4 tiers (background → muted → card → card-elevated); the screen's Elevation block collapses to 3 tiers (E0 background, E1 card, E2 card-elevated) — it treats `muted` as chrome surface, not an elevation step. All four surface tokens still ship; elevation SEMANTICS are the 3 shown.
- Tokens not swatch-documented on the screen (but present in 00-variables.json and the build): card-foreground, popover, popover-foreground, secondary, secondary-foreground, accent, accent-foreground, destructive-foreground, success-foreground, warning-foreground, info-foreground. The board curates one representative swatch wall per group rather than every token.
- Category model: the screen swatches the 5 cat-* hues as 12%-tinted chips (hex suffix 1f) wrapping the full-hue Lucide icon + label — confirming the redundant-channel rule (colour never alone). No paired cat-*-foreground tokens exist; categories use $foreground/icon.
- Tint convention encoded as 8-digit-hex alpha: 12% fill = suffix `1f` (31/255), 18% hover-lift = suffix `2e` (46/255), demonstrated for primary/warning/cat-travel. CrossRef uses a fainter ~6% wash (`0f`) — a one-off chrome accent outside the 12/18 fill convention. Camp-404 Badge/IconBadge default /15 must be normalized to /12.
- Spacing: screen documents 8 steps (4–48) and skips 40px (Tailwind 10) between 32 and 48 — informational, the full Tailwind scale is still available.
- Hex/OKLCH parity verified: every swatch hex on the screen is identical to 00-variables.json; OKLCH as-built values come from brief §3 (hex is the Pencil/non-OKLCH mirror only). warning #d9a73e and primary-hover #ff8555 are derived from OKLCH, not from the original prototype.

## Open items

- Add the --overlay token (brief §3: oklch(from var(--color-background) l c h / 0.7)) to the build @theme / globals.css — it is missing from 00-variables.json and not on the foundations screen, yet dialogs/recording panel scrims need it.
- Resolve wordmark sizing: the foundations screen renders the OPS/BOARD specimen at 22px while the brief role token --text-brand-label is 11px. Confirm the live header wordmark size against the app-shell screen (screen is authoritative for the specimen).
- Decide whether to keep --text-brand-glyph (clamp 7-14rem) — brief §16 open decision #5 flags it as optional for OpsBoard's small mono wordmark; not shown on this screen.
- Confirm the missing 8 type steps and the non-swatched foreground/secondary/accent tokens are still emitted in globals.css even though the foundations screen does not document them (they are referenced by other component screens).
- Note the 40px (Tailwind 10) spacing step is skipped on the screen — confirm whether any screen uses 40px gaps/padding; if so it's still valid (4px grid), just undocumented here.