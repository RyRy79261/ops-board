# Surface Spec — Timeline view (desktop) (`a3Dgz`) · P0

*Source: `docs/design-extract/boards/a3Dgz__*.json` (screen authoritative). 2 scoped sections.*

# Timeline Page Shell — AppHeader, Mission Sidebar, Mission Detail Header, View Tabs (desktop, board a3Dgz)

*scope: timeline-desktop-shell*

## Timeline Page Shell (board a3Dgz — desktop, 1320×1160)

> Scope: the persistent chrome + active-mission summary region of the desktop Timeline page, documented **as rendered** on board `a3Dgz`. Covers the root frame, the 52px AppHeader, the 280px Mission Sidebar (4 NavCards), the Mission Detail header (live dot + title + target line + 4 StatTiles + 3-segment ProgressBar), and the ViewTabs strip (active = Timeline). The Timeline bucket list (`rmHK9` and below) and the Voice FAB / Toaster are **out of scope** here (separate sections). Screens are authoritative; divergences from `design-brief.md` are noted as INFORMATIONAL.

### 1. Purpose
A read-only status frame. The header asserts product identity; the sidebar lists the four missions and lets one be selected as the active detail context (selection is the only navigation); the Mission Detail header summarizes the active mission's health at a glance; the ViewTabs switch the main column between the three core views. No create/edit/delete affordances render anywhere in this region. The only direct interaction surfaced inside this scope is mission selection (NavCard) and view switching (ViewTabs) — the StatusCycleButton lives on task cards, below this scope.

### 2. Root layout (top → bottom)
Root frame `a3Dgz` "OpsBoard — Timeline view (desktop)": `width 1320`, `height 1160`, `fill $background` (#0a0a0c), `layout vertical`, `clip: true`. Two children stacked vertically:
1. **Top Header** `J6VoEb` — `height 52`, `width fill_container`.
2. **Body Row** `I1mhs2` — `width fill_container`, `height fill_container` (= 1108px: 1160 − 52), default horizontal layout. Children: **Sidebar** (`280` fixed) + **Main Column** (`fill_container`, fluid).

Global radius token `$radius = 0` (everything sharp); `rounded-full` only appears on dots and pills via explicit `cornerRadius: 100`.

### 3. AppHeader (`J6VoEb`)
- Frame: `width fill_container`, `height 52`, `fill $background` (#0a0a0c), `padding [0, 20]` (0 vertical, 20 horizontal), `alignItems center`. Bottom hairline only: `stroke $border` (#2a2a38), `strokeWidth { bottom: 1 }`, `strokeAlignment inner`.
- Single child **Wordmark** `Dmsrt` (`alignItems center`, default horizontal, gap 0) holding two adjacent mono text runs, no space between:
  - `X3tLM` content `"OPS"` — `fill $primary` (#ff6b35), `JetBrains Mono`, `fontSize 16`, `fontWeight 700`, `letterSpacing 1.5`.
  - `R6wbDy` content `"BOARD"` — `fill $muted-foreground` (#7a7a8e), `JetBrains Mono`, `fontSize 16`, `fontWeight 700`, `letterSpacing 1.5`.
- No "+ Mission" button, no voice control, no sync/status indicator, no nav links. Single static state.

### 4. Mission Sidebar (`i8iGMB`)
Frame: `width 280`, `height fill_container`, `fill $background` (#0a0a0c), right hairline `stroke $border` + `strokeWidth { right: 1 }` (`strokeAlignment inner`), `layout vertical`, gap 0. Children top→bottom: a "Missions Label" header row, then 4 mission NavCards stacked (no list padding — cards are full-bleed, each carries its own bottom divider).

#### 4.1 Missions Label header (`UI3Su`)
`width fill_container`, `padding [16, 16, 12, 16]` (T16 R16 B12 L16), `justifyContent space_between`, `alignItems center`.
- `OAIA3` eyebrow `"MISSIONS"` — `fill $muted-foreground-subtle` (#4a4a5e), `JetBrains Mono`, `fontSize 11`, `fontWeight normal`, `letterSpacing 1.5`.
- `I7Lw4` count `"04"` (zero-padded mission total) — `fill $muted-foreground` (#7a7a8e), `JetBrains Mono`, `fontSize 11`, `fontWeight normal`, `letterSpacing 0.5`.

#### 4.2 NavCard structure (shared)
Each mission row is a flattened NavCard: outer frame `width fill_container`, `height 74`, bottom hairline `stroke $border` + `strokeWidth { bottom: 1 }` (`strokeAlignment inner`), default horizontal layout, gap 0. First child is a 3px-wide full-height **Accent** rectangle; second child is **Content** `width fill_container`, `layout vertical`, `gap 9`, `padding [13, 15, 13, 14]` (T13 R15 B13 L14). Content holds the mission **Name** (DM Sans 14/500) over a **Meta** row (`width fill_container`, `justifyContent space_between`, `alignItems center`) = a window-summary **Chip** (left) + a **TaskCount** text (right, `JetBrains Mono`, `fontSize 11`, `letterSpacing 0.5`).

#### 4.3 NavCard — ACTIVE variant (AfrikaBurn 2026, `ZoHKp`)
- Card fill `$card-elevated` (#22222e); Accent `s1umbr` `fill $primary` (#ff6b35), `width 3`, `height fill_container`.
- Name `WlQV0` `"AfrikaBurn 2026"` — `fill $foreground` (#e8e8f0), `DM Sans`, `fontSize 14`, `fontWeight 500`.
- Chip `TYmdO` (CLOSING taxonomy): `fill $muted` (#131318), `cornerRadius 100`, `stroke $warning` (#d9a73e) `strokeWidth 1` inner, `gap 5`, `padding [3, 8]`, `alignItems center`. Children: `A7Go2` warning Dot (ellipse `fill $warning`, `6×6`) + `PeZxm` ChipLabel `"1 CLOSING"` (`fill $warning`, `JetBrains Mono`, `fontSize 10`, `letterSpacing 0.5`).
- TaskCount `hbBmP` `"2/11"` — `fill $primary` (orange when active).

#### 4.4 NavCard — INACTIVE / countdown variant (×3)
Inactive cards: card `fill $background` (#0a0a0c), Accent `fill $background` (invisible — zero-width-effect accent), Name `fill $card-foreground` (#e8e8f0). Chip is the neutral countdown taxonomy: `fill $muted`, `cornerRadius 100`, `stroke $border` (#2a2a38) `strokeWidth 1` inner, `padding [3, 8]`; **no dot** child; ChipLabel `fill $muted-foreground`, `JetBrains Mono`, `fontSize 10`, `letterSpacing 0.5`. TaskCount `fill $muted-foreground`.
- `HVIHO` "Patagonia O-Trek" — chip `"T-12d"`, count `"5/8"`.
- `RwSD1` "Schengen Visa Renewal" — chip `"T-21d"`, count `"3/6"`.
- `UeZH7` "Kilimanjaro Climb" — chip `"T-86d"`, count `"0/9"` (zero-progress mission; identical inactive styling — no special zero-progress treatment is rendered).

#### 4.5 Window-summary chip taxonomy (sidebar)
Two distinct chip renderings observed:
- **State chip (active/closing):** dot + label, `stroke $warning`, all-warning ink → `"{n} CLOSING"` (here `"1 CLOSING"`). The number is the count of closing-window tasks in that mission, NOT a countdown.
- **Countdown chip (inactive):** label only, `stroke $border`, muted ink → `"T-{n}d"` where n = days until the nearest cliff (`T-12d`/`T-21d`/`T-86d`).
TaskCount format is always `{done}/{total}` and is color-coupled to active state (primary when active, muted otherwise).

### 5. Main Column (`LJas4`)
Frame: `width fill_container`, `height fill_container`, `fill $background`, `layout vertical`, `gap 18`, `padding [22, 26]` (22 vertical, 26 horizontal), `clip: true`. Children top→bottom: **Mission Detail** (`L9E0u`), **View Tabs** (`Ikz34`), **Timeline** (`rmHK9`, out of scope). The 26px horizontal padding is the gutter for the whole main region.

### 6. Mission Detail header (`L9E0u`)
Frame: `width fill_container`, `layout vertical`, `gap 16`. Three blocks top→bottom: Title Block, Stats Row, Progress Bar.

#### 6.1 Title Block (`zxqZR`) — `layout vertical`, `gap 7`
- **Title Row** `GXK29` (`gap 11`, `alignItems center`):
  - `Q5u0nz` **Live Dot** — ellipse `fill $primary` (#ff6b35), `8×8`. (Static fill on the screen; "live" is a semantic label, no animation encoded.)
  - `KP4U1` **Mission Title** `"AfrikaBurn 2026"` — `fill $foreground`, `DM Sans`, `fontSize 25`, `fontWeight 600`.
- **Target Line** `ytHvB` (`gap 8`, `alignItems center`) — four mono runs:
  - `D63ju` `"TARGET:"` — `fill $muted-foreground-subtle` (#4a4a5e), `fontSize 12`, `letterSpacing 1`.
  - `Y4ZXx` `"2026-07-29"` (event date, ISO) — `fill $foreground`, `fontSize 12`, `letterSpacing 0.5`.
  - `juDJf` `"·"` separator — `fill $muted-foreground-subtle`, `fontSize 12`.
  - `ph1sw` `"TANKWA KAROO, ZA"` (location) — `fill $muted-foreground`, `fontSize 12`, `letterSpacing 0.5`.
  - All `JetBrains Mono`, `fontWeight normal`.

#### 6.2 Stats Row (`yjYYp`) — 4 StatTiles, `gap 34`, `alignItems end`
Each StatTile = vertical frame (`gap 3`) with a Value over a Label. Value `JetBrains Mono`, `fontSize 21`, `fontWeight 600`; Label `JetBrains Mono`, `fontSize 10`, `fontWeight normal`, `letterSpacing 1.5`, `fill $muted-foreground-subtle` (#4a4a5e) for ALL labels. Value color encodes the metric:
| Tile | id | Value | Value color | Label |
|---|---|---|---|---|
| DONE | `RcNqQ` | `2` | `$success` (#5ae07a) | `DONE` |
| BLOCKED | `N2F82H` | `1` | `$destructive` (#e05a5a) | `BLOCKED` |
| CLOSING | `OZv4Q` | `1` | `$warning` (#d9a73e) | `CLOSING` |
| TOTAL | `UFJ4x` | `11` | `$foreground` (#e8e8f0) | `TOTAL` |
Note: DONE=2 / TOTAL=11 reconciles with the active NavCard's `2/11`; CLOSING=1 reconciles with the `"1 CLOSING"` chip; BLOCKED=1 is derived from the dependency graph (1 blocked task in the Timeline view below). Tiles are baseline-aligned (`alignItems end`).

#### 6.3 Progress Bar (`bMFeK`) — 3 segments
Frame: `width fill_container`, `height 6`, default horizontal, `gap 2`. Three rectangle segments, each `height fill_container`:
- `iP9ZV` **Seg Done** — `fill $success` (#5ae07a), `width 180`.
- `oxTOI` **Seg Attn** — `fill $warning` (#d9a73e), `width 180`.
- `l0T7z` **Seg Rest** — `fill $muted` (#131318), `width fill_container` (consumes remainder).
Bar height is **6px** (brief says 4px → divergence). Track color is `$muted`, NOT `$card-elevated` (brief says card-elevated → divergence). The middle segment is amber "attention" (closing); there is NO separate destructive/blocked segment rendered despite BLOCKED=1 — only success + warning + muted-rest are drawn (divergence from brief's `success + warning + destructive` 3-segment spec).

### 7. View Tabs (`Ikz34`)
Frame: `width fill_container`, default horizontal layout, gap 0, bottom hairline `stroke $border` + `strokeWidth { bottom: 1 }` (`strokeAlignment inner`). Three tab frames, each `padding [9, 15, 11, 15]` (T9 R15 B11 L15), `alignItems center`, with a bottom border `strokeWidth { bottom: 2 }` (`strokeAlignment inner`) whose color encodes active state. Label is `JetBrains Mono`, `fontSize 12`, `fontWeight normal`, `letterSpacing 1`.
| Tab | id | Label | Underline stroke | Label fill | State |
|---|---|---|---|---|---|
| By Category | `oGCKJ` | `BY CATEGORY` | `$background` (invisible) | `$muted-foreground` | inactive |
| Timeline | `X6rBui` | `TIMELINE` | `$primary` (#ff6b35, 2px) | `$foreground` | **active** |
| Dependencies | `r6YKFu` | `DEPENDENCIES` | `$background` (invisible) | `$muted-foreground` | inactive |
Active state = 2px `$primary` bottom underline + `$foreground` label. Inactive = a 2px `$background`-colored underline (renders invisible against the bg, reserving layout height so active/inactive tabs share baseline) + `$muted-foreground` label.

### 8. States enumerated (within this scope)
- **AppHeader:** single static state.
- **Missions Label:** single state; count `"04"` zero-padded.
- **NavCard active:** card-elevated fill, primary accent bar, foreground name, warning state-chip with dot, primary TaskCount.
- **NavCard inactive (countdown):** background fill, invisible accent, card-foreground name, border countdown-chip (no dot), muted TaskCount. (Three instances: T-12d, T-21d, T-86d.)
- **NavCard inactive zero-progress:** Kilimanjaro `0/9` — visually identical to other inactive cards (no distinct empty/zero treatment).
- **Mission Detail:** single populated state; encodes sub-metrics via the 4 StatTiles (DONE success / BLOCKED destructive / CLOSING warning / TOTAL foreground).
- **Progress bar:** done(success) + attention(warning) + rest(muted) — no blocked segment rendered.
- **ViewTabs:** active (Timeline) vs inactive (By Category, Dependencies) — two visual states.
- Not rendered on this board (note for build, from brief §12): loading/skeleton, empty (no missions → EmptyState), all-done mission (full-success progress / optional COMPLETE pill).

### 9. Interactions
- **NavCard tap** → select that mission as the active detail context (drives Mission Detail header + view content). Read-only otherwise. Hover state not captured on board; brief §11 specifies inactive hover = `bg-card` + visible border.
- **ViewTab tap** → switch the main column view (By Category / Timeline / Dependencies). Timeline is the selected tab on this board.
- AppHeader, Missions Label, Mission Detail header (title/target/stats/progress) are **non-interactive** (no create/edit/delete; mission edit is voice/MCP only).

### 10. Data / logic contracts
- Sidebar count `"04"` = total mission count, zero-padded to 2 digits.
- Per-NavCard `TaskCount = {done}/{total}`; active mission `2/11` must equal Mission Detail DONE/TOTAL.
- Window-summary chip: when the mission's nearest cliff is within the closing threshold, render the **state chip** `"{n} CLOSING"` (n = count of closing tasks, with warning dot + warning stroke); otherwise render the **countdown chip** `"T-{days}d"` (days to nearest cliff, neutral border). Active mission here shows the closing variant; the brief also defines a `COMPLETE` token for fully-done missions (not exercised on this board).
- StatTiles: DONE = count(status==done); CLOSING = count(window==closing); BLOCKED = count(blocked) — `blocked` is **computed from the dependency graph, never stored**; TOTAL = task count.
- ProgressBar segment widths are proportional encodings (done / attention / rest). As rendered they are fixed px (180/180/fill) — the build should compute widths from done/closing/total ratios rather than hard-code 180.
- Target line: `2026-07-29` is the real-world **event date** (a calendar fact), NOT a task `too_late_by` cliff; location string is free text.
- "Live Dot" uses `$primary` and is purely a presence/identity cue (active mission); no liveness data binding is implied by the static render.

### 11. Divergences from canonical (design-brief.md) — INFORMATIONAL
- **AppHeader height/padding/fill:** brief §11 says ~61px, `padding 20px 32px`, `bg-muted`. Board renders **52px**, `padding [0,20]`, `fill $background`. Wordmark sizes are `fontSize 16` here vs brief's `--text-brand-label` (0.6875rem ≈ 11px). Screen wins.
- **Sidebar fill:** brief says `bg-muted`; board renders `$background` with active NavCard lifting to `$card-elevated`. Sidebar has no list padding (brief mentions 8px) — NavCards are full-bleed with per-row bottom dividers.
- **NavCard active treatment:** brief §11 says active = `bg-primary/12 + border-primary`. Board renders active = `$card-elevated` fill + 3px solid `$primary` left accent bar (no tinted fill, no full border). Inactive accent is a 3px `$background` rectangle (invisible) rather than absent. Screen wins.
- **Window-summary chip:** brief describes a single chip showing nearest window state. Board splits this into TWO renderings (warning state-chip `"{n} CLOSING"` with dot vs neutral countdown `"T-{n}d"`).
- **Mission title size:** brief `--text-title` (1.625rem ≈ 26px); board `fontSize 25` — close, slightly under.
- **Target label:** brief `Target: {date}`; board renders uppercase mono `"TARGET:"` + ISO date + `·` + location (richer than brief).
- **Stats row gap:** brief gap 24px; board `gap 34`. Stat-label color matches brief (`muted-foreground-subtle`).
- **ProgressBar:** brief = 4px, over `card-elevated`, segments success+warning+destructive. Board = **6px**, over `$muted`, segments success+warning+**muted-rest** (no destructive/blocked segment). Notable functional divergence — there IS a BLOCKED=1 metric but no blocked segment is drawn.
- **ViewTabs:** brief calls for SegmentedControl. Board renders a bottom-border underline tab strip (`strokeWidth bottom 2`), inactive underline uses `$background` to reserve height. Screen wins; consolidation should map this onto SegmentedControl or a Tabs-with-underline primitive.
- The "Days overdue" stat from the prototype is correctly absent (replaced by CLOSING amber) — consistent with anti-state "no overdue."

### 12. Token usage (this scope)
Colors: `$background` #0a0a0c, `$foreground` #e8e8f0, `$muted` #131318, `$muted-foreground` #7a7a8e, `$muted-foreground-subtle` #4a4a5e, `$card-foreground` #e8e8f0, `$card-elevated` #22222e, `$border` #2a2a38, `$primary` #ff6b35, `$success` #5ae07a, `$warning` #d9a73e, `$destructive` #e05a5a. Type: `JetBrains Mono` (all chrome/data/labels), `DM Sans` (mission names + title). Radius: `$radius`=0 globally; explicit `cornerRadius 100` on dots/pills only.

# Timeline Organism — ISO-Week Buckets & Horizontal TaskCard State Matrix

*scope: Agent B — Timeline buckets & task-row state matrix (the core view)*

## Timeline Organism — ISO-Week Buckets & Horizontal TaskCard State Matrix

> Board `a3Dgz` — "OpsBoard — Timeline view (desktop)". Source-of-truth: the screen as laid out is authoritative; canonical component defs are reconciled **toward** this rendering. Tokens resolved via `00-variables.json` (dark theme; `radius = 0`). This section specs the **Timeline** organism only (the bucket list + task rows). Page chrome / sidebar / mission-detail header / view-tabs are owned by Agent A.

### 1. Purpose

The Timeline view answers one question: **"in cliff-order, what is coming and what has already closed?"** Tasks are bucketed by the **ISO week of their `too_late_by` cliff** (not a due date), ordered **past-closed → this-week → future (ascending) → trailing NO CLIFF**. Each bucket is a `TimelineWeekHeader` (week range label + a window-state `DaysPill` + a horizontal rule) over a vertical stack of **horizontal** `TaskCard` rows. It is a **read-only status display**: the only direct interaction is tapping a card's status box (`StatusCycleButton`) to cycle `not-started → in-progress → done`. `blocked` and all window-states are **computed, never stored**, and are **advisory, never gating**.

### 2. Layout (exact px / tokens / structure, top → bottom)

Container `Timeline` (frame `rmHK9`): `width: fill_container`, `layout: vertical`, `gap: 20`. It is the third child of `Main Column` (`LJas4`, `padding: [22,26]`, `gap: 18`, `fill: $background`, `clip: true`) below the Mission Detail header and View Tabs. Renders **6 buckets** in this exact order:

| # | Bucket frame id | Range label (literal) | DaysPill state | DaysPill stroke | Cards |
|---|---|---|---|---|---|
| 1 | `X1loYA` | `MAY 25 – MAY 31` | `WINDOW CLOSED` | `$border` | 2 |
| 2 | `ahxAh` | `JUN 01 – JUN 07` | `THIS WEEK` | `$primary` | 3 |
| 3 | `J4uZ5L` | `JUN 08 – JUN 14` | `IN 5D` | `$border` | 2 |
| 4 | `U5aTB` | `JUN 15 – JUN 21` | `IN 12D` | `$border` | 2 |
| 5 | `XRahB` | `JUL 06 – JUL 12` | `IN 33D` | `$border` | 1 |
| 6 | `A7cnU` | `NO CLIFF` | `UNSCHEDULED` | `$border` | 1 |

Note the **gap** between bucket 5 (`JUL 06`) and bucket 4 (`JUN 15`): weeks with no cliffed tasks are **omitted**, not rendered empty (no `JUN 22`/`JUN 29` buckets). 11 cards total across 6 buckets.

**Bucket frame** (e.g. `X1loYA`): `width: fill_container`, `layout: vertical`, `gap: 8`. Two children: `BucketHeader` then `Cards`.

**BucketHeader** (e.g. `J5RlXK`): `width: fill_container`, horizontal (default), `gap: 12`, `alignItems: center`. Three children left→right:
1. **Range** text — `fill: $muted-foreground`, content = week range, `JetBrains Mono` `11px` weight `normal` `letterSpacing: 1.5`. (NO CLIFF bucket uses the same styling with content `NO CLIFF`.)
2. **DaysPill** frame — `fill: $muted`, `cornerRadius: 100`, `strokeWidth: 1` `strokeAlignment: inner`, `padding: [2,8]`, `alignItems: center`. Single text child `DaysLbl`: `JetBrains Mono` `10px` weight `normal` `letterSpacing: 1`. The stroke color and label fill encode state (see §4).
3. **Rule** rectangle — `fill: $border`, `width: fill_container`, `height: 1` (fills remaining horizontal space).

**Cards** frame (e.g. `mNx5n`): `width: fill_container`, `layout: vertical`, `gap: 6`. Children are the horizontal `TaskCard` rows.

**TaskCard** (horizontal row, e.g. `G6ij1`): `width: fill_container`, `fill: $card`, `stroke: $border`, `strokeWidth: 1` `strokeAlignment: inner` (zero corner radius), `gap: 14`, `padding: [11,14]`, `alignItems: center`. Four children left→right:
1. **Status** box (18×18) — the `StatusCycleButton` (§5.1).
2. **NameBlock** — `width: fill_container`, `layout: vertical`, `gap: 3`. Holds `TName` (`DM Sans` `14px` weight `500`) and, only when blocked, a `Hint` sub-line (§5.4).
3. **CatTag** — horizontal, `gap: 6`, `alignItems: center`: `CatDot` ellipse + `CatIcon` lucide + `CatLbl` text (§5.3).
4. **Pill** (merged window/status pill) — right-aligned (NameBlock flexes, pushing CatTag + Pill right), `fill: $muted`, `cornerRadius: 100`, `strokeWidth: 1` `strokeAlignment: inner`, `gap: 5`, `padding: [3,8]`, `alignItems: center` (§5.2).

### 3. Bucket ordering & ISO-week logic (data contract)

- Group all of the active mission's tasks by `isoWeek(too_late_by)` in the user's timezone. Tasks with no `too_late_by` go to the trailing **NO CLIFF** bucket.
- **Order:** ascending by week start date → NO CLIFF always last. Past weeks (week-end < today) sort first and carry the closed treatment; the current ISO week is `THIS WEEK`; future weeks follow ascending.
- **Empty weeks are skipped** — only weeks that contain ≥1 cliffed task render (confirmed by the JUN 15 → JUL 06 jump).
- **Range label** format: `{MON} {DD} – {MON} {DD}`, uppercase 3-letter month, zero-padded day, en-dash ` – ` separator (literal U+2013), `JetBrains Mono` `11px` `ls 1.5` `$muted-foreground`. NO CLIFF bucket substitutes the literal `NO CLIFF`.
- `CLOSING_THRESHOLD_DAYS = 7` (per brief §9) drives the per-card `CLOSING` state, independent of bucket grouping.

### 4. TimelineWeekHeader · DaysPill — every state

The `DaysPill` is a frame-level state machine. Shape is constant (`$muted` fill, `radius 100`, `padding [2,8]`, 1px inner stroke, `JetBrains Mono 10px normal ls1`); **stroke color + label fill** vary:

| State | Label (literal) | Stroke | Label fill | Derivation |
|---|---|---|---|---|
| **Window closed** | `WINDOW CLOSED` | `$border` | `$muted-foreground-subtle` | bucket week-end is before today |
| **This week** (primary, emphasized) | `THIS WEEK` | `$primary` | `$primary` | bucket == current ISO week |
| **Near/future** | `IN {n}D` (e.g. `IN 5D`, `IN 12D`, `IN 33D`) | `$border` | `$muted-foreground-subtle` | `{n}` = whole days from today to bucket week start |
| **Unscheduled** | `UNSCHEDULED` | `$border` | `$muted-foreground-subtle` | the NO CLIFF bucket |

Notes:
- Only the **THIS WEEK** state recolors both stroke and label to `$primary`; every other state shares the identical muted appearance and differs only in literal text.
- `IN {n}D` uses an uppercase trailing `D` with no space (`IN 5D`). The pill never shows "overdue" / "{n}d ago" — past weeks always read `WINDOW CLOSED`.
- The header has **no `count` badge** here (counts live in the sidebar/category views, not the timeline bucket header).

### 5. Components as rendered (props / variants / states / tokens)

#### 5.1 StatusCycleButton (the 18×18 "Status" box) — the ONLY interactive element
Always an 18×18 frame, first child of the card. Four bespoke appearances encode status (NOT a single canonical glyph):

| Appearance | Status meaning | Fill | Stroke | Inner child | Instances |
|---|---|---|---|---|---|
| **Empty + subtle stroke** | not-started, on a window-closed/dimmed card | `$background` | `$muted-foreground-subtle` `1.5` inner | none | 1 (Yellow fever) |
| **Empty + border-hover stroke** | not-started (active/openable) incl. blocked & not-yet | `$background` | `$border-hover` `1.5` inner | none | 7 |
| **Primary ring + inner square** | **in-progress** | `$background` | `$primary` `1.5` inner | 8×8 rectangle `fill: $primary` (`justify/align: center`) | 1 (Fill malaria) |
| **Success fill + check** | **done** | `$success` | none | lucide `check` 12×12 `fill: $success-foreground` (`justify/align: center`) | 2 (Renew passport, Confirm ticket) |

- **Interaction:** tap cycles `not-started → in-progress → done → not-started` (wrapping). The button is **always enabled** — you may cycle a `blocked`, `not-yet`, or `window-closed` card (advisory states never gate the cycle). `blocked`/`not-yet` are derived, not selectable statuses; they reuse the empty-box appearance.
- The visible hit area is bare **18×18** (see Open Items — no 44px touch wrapper rendered).

#### 5.2 Merged Window/Status Pill (right side of every card)
One pill carries **either** a window-state **or** a status verb. Shape constant (`$muted` fill, `radius 100`, `padding [3,8]`, `gap 5`, 1px inner stroke, optional leading 11×11 lucide icon, then `JetBrains Mono 10px normal ls0.5`). Variants observed:

| Pill variant | Icon (lucide 11×11) | Label (literal) | Stroke | Icon+label fill | On card status |
|---|---|---|---|---|---|
| **WINDOW CLOSED** | none | `WINDOW CLOSED` | `$border` | `$muted-foreground-subtle` | closed/not-started (dimmed) |
| **DONE** | `check` | `DONE` | `$border` | `$success` | done |
| **CLOSING · T-{n}D** | `alarm-clock` | `CLOSING · T-2D` | `$warning` | `$warning` | in-progress within 7d cliff |
| **BLOCKED** | `ban` | `BLOCKED` | `$border` | `$muted-foreground` | blocked |
| **STARTS {MON DD}** | `lock` | `STARTS JUN 09` / `JUN 10` / `JUN 15` / `JUN 16` / `JUL 01` | `$border` | `$muted-foreground` | not-yet (not_before) |
| **NO CLIFF** | none | `NO CLIFF` | `$border` | `$muted-foreground-subtle` | unscheduled |

- The pill **merges window state and status semantics into a single atom** (DONE/BLOCKED are status; CLOSING/STARTS/WINDOW CLOSED/NO CLIFF are window state). Only the **CLOSING** variant recolors the stroke (to `$warning`); all others use `$border`.
- `CLOSING · T-{n}D` combines the window-state word + countdown in one string, separated by ` · ` (U+00B7 middle dot, spaces around it), trailing day count uppercase `T-2D`.
- Icons used: `check` (done), `alarm-clock` (closing), `ban` (blocked), `lock` (not-yet/starts). WINDOW CLOSED and NO CLIFF carry **no icon**.

#### 5.3 CategoryTag (dot + icon + label variant)
Three-part horizontal group (`gap 6`, `alignItems center`): `CatDot` ellipse 6×6 (category color) + `CatIcon` lucide 13×13 (category color) + `CatLbl` text `JetBrains Mono 10px normal ls1`, **fill `$muted-foreground`** (muted, NOT category-colored). Five category variants on this board:

| Category | Token (dot+icon) | Hex | Icon | Label |
|---|---|---|---|---|
| Medical | `$cat-medical` | `#e05a9f` | `syringe` | `MEDICAL` |
| Bureaucratic | `$cat-bureaucratic` | `#5aa0e0` | `stamp` | `BUREAUCRATIC` |
| Gear | `$cat-gear` | `#e0c05a` | `package` | `GEAR` |
| Travel | `$cat-travel` | `#5ae0a0` | `plane` | `TRAVEL` |
| Tech | `$cat-tech` | `#a05ae0` | `cpu` | `TECH` |

#### 5.4 Blocked-by hint sub-line
Only present on the **blocked** card. Inside `NameBlock` as a second line below `TName`: text `Hint`, content `blocked by: Confirm ticket transfer`, `JetBrains Mono 10px normal letterSpacing 0.3`, `fill: $muted-foreground-subtle`. Lowercase prefix `blocked by:` then the literal blocker task name. No icon on this board's hint line (the `ban` icon lives on the pill).

#### 5.5 Dimmed / window-closed card treatment
The window-closed not-started card (`Yellow fever vaccination`) applies card-level **`opacity: 0.6`** AND swaps `fill: $card` → `fill: $muted`, with `TName` recolored to `$muted-foreground` (not `$foreground`). It does NOT use strikethrough on the screen (brief calls for strikethrough — see Open Items). The done cards (`Renew passport`, `Confirm ticket transfer`) keep `fill: $card` and full opacity but recolor `TName` to `$muted-foreground` to signal completion; the in-progress / not-yet / blocked / no-cliff cards keep `TName` at `$foreground`.

### 6. The ~11 card instances — each tied to (window-state × status)

| # | Card (id) | Bucket / window-state | Status box appearance → status | Category | Pill | TName fill |
|---|---|---|---|---|---|---|
| 1 | Yellow fever vaccination (`qvdkK`) | MAY25 / **window-closed**, dimmed `opacity 0.6` + `$muted` fill | empty, `$muted-foreground-subtle` → not-started | MEDICAL / syringe | `WINDOW CLOSED` (no icon, subtle) | `$muted-foreground` |
| 2 | Renew passport (6-month validity) (`G6ij1`) | MAY25 / closed week | `$success` fill + `check` → **done** | BUREAUCRATIC / stamp | `check` + `DONE` (success) | `$muted-foreground` |
| 3 | Fill malaria prophylaxis script (`dht4I`) | JUN01 / **this-week**, **closing** | `$primary` ring + inner 8px primary square → **in-progress** | MEDICAL / syringe | `alarm-clock` + `CLOSING · T-2D` (warning stroke+fill) | `$foreground` |
| 4 | Confirm ticket transfer (`FDxcl`) | JUN01 / this-week | `$success` fill + `check` → **done** | BUREAUCRATIC / stamp | `check` + `DONE` (success) | `$muted-foreground` |
| 5 | Pay camp + vehicle pass (`wiI4G`) | JUN01 / this-week, **blocked** | empty, `$border-hover` → not-started | BUREAUCRATIC / stamp | `ban` + `BLOCKED` (muted) | `$foreground`; **+ hint** `blocked by: Confirm ticket transfer` |
| 6 | Mount dust filters on rooftop tent (`GC29X`) | JUN08 / IN 5D, **not-yet** | empty, `$border-hover` → not-started | GEAR / package | `lock` + `STARTS JUN 09` (muted) | `$foreground` |
| 7 | Bench-test 12V inverter + solar (`eUjW1`) | JUN08 / IN 5D, **not-yet** | empty, `$border-hover` → not-started | TECH / cpu | `lock` + `STARTS JUN 10` (muted) | `$foreground` |
| 8 | Buy goggles + P2 respirators (`f57jFC`) | JUN15 / IN 12D, **not-yet** | empty, `$border-hover` → not-started | GEAR / package | `lock` + `STARTS JUN 15` (muted) | `$foreground` |
| 9 | Book Cape Town → Tankwa shuttle (`OGeea`) | JUN15 / IN 12D, **not-yet** | empty, `$border-hover` → not-started | TRAVEL / plane | `lock` + `STARTS JUN 16` (muted) | `$foreground` |
| 10 | Full service on Land Cruiser (`M9aM8`) | JUL06 / IN 33D, **not-yet** | empty, `$border-hover` → not-started | TECH / cpu | `lock` + `STARTS JUL 01` (muted) | `$foreground` |
| 11 | Download offline maps + playa map (`BdXA2`) | NO CLIFF / **unscheduled** | empty, `$border-hover` → not-started | TECH / cpu | `NO CLIFF` (no icon, subtle) | `$foreground` |

Matrix coverage achieved on-screen: window-states { closed, this-week(closing), this-week, not-yet×3-future-weeks, no-cliff }; statuses { not-started, in-progress, done, blocked(derived), not-yet(derived) }; all 5 categories. Note the `STARTS JUL 01` label on a card bucketed in `JUL 06 – JUL 12` indicates the pill shows the task's `not_before` start date while the bucket reflects its `too_late_by` cliff week — confirming the two dates are distinct fields.

### 7. Interactions

1. **Status cycle (only direct interaction):** tap the 18×18 Status box → cycle `not-started → in-progress → done → not-started`. Always enabled regardless of window-state/blocked/not-yet (advisory, never gating). Cycling updates the box appearance (§5.1) and may flip the merged Pill (e.g. completing a card → `DONE`); the card may re-bucket only if `too_late_by` changes (status does not move buckets).
2. **No other interactions on the timeline rows** — names, pills, category tags, hints, and the week header are non-interactive display. There are no row hover/expand, drag, or delete affordances on this board.
3. **Re-bucketing** is data-driven (cliff week changes), not user-initiated here.

### 8. Data / logic contracts

- **Bucket key:** `isoWeek(task.too_late_by)`; null → NO CLIFF bucket (rendered last).
- **Bucket order:** ascending week start; past weeks first (closed), then `THIS WEEK`, then future ascending; NO CLIFF trailing; **omit empty weeks**.
- **DaysPill state:** `week-end < today` → `WINDOW CLOSED`; `week == currentISOWeek` → `THIS WEEK` (primary); future → `IN {daysToWeekStart}D`; NO CLIFF → `UNSCHEDULED`.
- **Per-card window-state** (computed, precedence per brief §9: `closed > not-yet(blocked) > not-yet(not_before) > closing > open`):
  - `closed`: `too_late_by` past → dim card (`opacity 0.6` + `$muted` fill), `WINDOW CLOSED` pill, name `$muted-foreground`.
  - `closing`: cliff ≤ `CLOSING_THRESHOLD_DAYS` (7) away → `CLOSING · T-{n}D` pill, `$warning` stroke + fill, `alarm-clock` icon.
  - `not-yet (not_before)`: `not_before` in future → `STARTS {MON DD}` pill, `lock` icon, `$muted-foreground`.
  - `not-yet (blocked)`: any incomplete dependency → `BLOCKED` pill, `ban` icon, `$muted-foreground`, **+ `blocked by: {blocker names}` hint sub-line** (`$muted-foreground-subtle`, `ls 0.3`). `blocked` is derived from the dependency graph, never stored.
  - `open` / unscheduled: NO CLIFF → `NO CLIFF` pill, no icon.
- **Status** (stored, 3 values): drives the Status box glyph and, when `done`, the `DONE` pill (overrides window-state pill) + name `$muted-foreground`. `in-progress` shows the primary inner square. Status and the merged Pill can conflict in source priority — verification must resolve which wins when a task is both `done` and past-cliff (screen shows DONE winning).
- **Category** drives `CatDot`/`CatIcon` color token + icon + label; label color is forced to `$muted-foreground` on this board regardless of category.
- **Blocker hint** text = literal `blocked by: ` + comma-joined incomplete blocker task names.

### 9. Coverage

This section fully specifies: the Timeline container layout (gap/padding/order), all 6 bucket frames with exact ids and range labels, the TimelineWeekHeader/DaysPill state machine (all 4 states + stroke/label tokens), the horizontal TaskCard structure (4-part layout, exact padding/gap/fill/stroke), the StatusCycleButton's 4 status appearances, the merged window/status Pill's 6 variants with icons/strokes/literals, the CategoryTag dot+icon+label across all 5 categories, the blocked-by hint sub-line, the dimmed/done name treatments, all 11 card instances tied to (window-state × status × category), the status-cycle interaction, and the bucketing/window-state/status data contracts. Divergences from canonical components and the design-brief are recorded per component (see component_usages) and in open_items.


## Open items (this board)

- ProgressBar: board draws only success+warning+muted-rest (no blocked/destructive segment) though BLOCKED=1 — confirm whether the blocked segment should be added in consolidation or whether the 3-seg = done/closing/rest model is intended.
- AppHeader fill is $background on this board vs brief's bg-muted, and 52px vs ~61px — confirm canonical header height/fill for the consolidated shell.
- Window-summary chip is split into two renderings ('{n} CLOSING' state-chip vs 'T-{n}d' countdown); the brief's COMPLETE variant is not exercised here — needs a sample for the all-done mission case.
- ViewTabs render as an underline tab strip rather than a boxed SegmentedControl — decide which primitive the consolidated kit uses (underline variant recommended to match screen).
- NavCard inactive accent is an invisible 3px $background rectangle (layout placeholder) rather than no accent — confirm this is intended vs. a true absent accent.
- Hover/focus states for NavCards and ViewTabs are not on the board; need definition for keyboard/pointer affordances.
- Sidebar list is non-scrolling on this board with exactly 4 missions; scroll/overflow behavior (brief mentions scrollable 8px-padded list) is unverified at this count.
- StatusCycleButton renders a bare 18×18 box with NO 44×44 Touch44 wrapper — accessibility tap-target regression vs canonical; verification must decide whether to add the 44px hit area while keeping the screen's 18px visual.
- Merged window/status Pill overloads one atom with BOTH status (DONE, BLOCKED) and window-state (WINDOW CLOSED, NO CLIFF, STARTS DATE, CLOSING·T-2D). Reconciliation must decide: one combined pill (screen-authoritative) vs canonical separate StatusBadge + WindowStatePill.
- Brief §9 mandates 'window closed = muted grey + strikethrough'; the screen uses opacity 0.6 + $muted fill + muted name color but NO strikethrough on the name. Decide whether to add strikethrough (brief) or keep opacity-only (screen).
- Brief §9 specifies AlertTriangle + '⚠ blocked by: {names}' for blocked; screen uses lowercase 'blocked by:' text with the ban icon on the pill and no warning glyph on the hint line. Reconcile icon + casing.
- CategoryTag on this board is a dot+icon+muted-label (no tinted pill, label NOT category-colored, weight normal, 10px) vs canonical tinted pill with category-colored 600-weight 11px label. Decide which is source-of-truth (screen wins per operator rule, but confirm against Category board for consistency).
- 'CLOSING · T-2D' merges the window-state word and countdown into one string; brief treats them as distinct — confirm the combined format is intended across all closing cards.
- Whether the done-card name treatment should also strike-through (screen only recolors to $muted-foreground, no strike).
- Only the 'in-progress' status appears once on this board (Fill malaria) and it is simultaneously 'closing' — there is no screen sample of in-progress on a non-closing card; confirm the Status box (primary ring + inner square) is independent of the pill state.
- No standalone StatusBadge appears anywhere on this board (0 instances) — confirm the canonical StatusBadge atom is intentionally unused in the Timeline row.

## Coverage checklist (verification targets)

- [ ] AppHeader (J6VoEb): 52px height, [0,20] padding, $background fill, bottom hairline, OPS/BOARD wordmark exact tokens/sizes/letterSpacing.
- [ ] Sidebar frame (i8iGMB): 280px width, $background fill, right hairline, vertical layout.
- [ ] Missions Label (UI3Su): MISSIONS eyebrow + '04' count, exact tokens/padding/justify.
- [ ] NavCard active (ZoHKp / AfrikaBurn): card-elevated fill, 3px primary accent, foreground name, '1 CLOSING' warning chip with dot, primary 2/11 count.
- [ ] NavCard inactive x3 (Patagonia T-12d 5/8, Schengen T-21d 3/6, Kilimanjaro T-86d 0/9): background fill, invisible accent, border countdown chip no dot, muted name/count.
- [ ] Window-summary chip taxonomy: warning state-chip ('1 CLOSING') vs neutral countdown ('T-{n}d') enumerated.
- [ ] Main Column (LJas4): fill_container, gap 18, padding [22,26], children order.
- [ ] Mission Detail (L9E0u): gap 16; Title Block gap 7; Title Row live dot 8x8 + 'AfrikaBurn 2026' DM Sans 25/600.
- [ ] Target Line: TARGET: + 2026-07-29 + · + TANKWA KAROO, ZA, exact mono tokens/sizes.
- [ ] Stats Row: 4 StatTiles (DONE 2 success / BLOCKED 1 destructive / CLOSING 1 warning / TOTAL 11 foreground), gap 34, val 21/600, lbl 10 ls1.5 muted-foreground-subtle.
- [ ] ProgressBar (bMFeK): height 6, gap 2, 3 segments success(180)/warning(180)/muted-rest(fill).
- [ ] ViewTabs (Ikz34): bottom hairline, 3 tabs padding [9,15,11,15], 2px underline, active=Timeline ($primary underline + $foreground label), inactive ($background underline + $muted-foreground label).
- [ ] All token color values resolved against 00-variables.json.
- [ ] Every divergence from design-brief.md noted as INFORMATIONAL (header size/fill, NavCard active treatment, progress bar height/track/blocked-segment, ViewTabs primitive, stats gap, target line richness).
- [ ] Data/logic contracts: count reconciliation (2/11 NavCard = DONE/TOTAL tiles, 1 CLOSING = CLOSING tile), blocked computed not stored, target=event date.
- [ ] Interactions: NavCard select, ViewTab switch, read-only elsewhere.
- [ ] States enumerated: header static, NavCard active/inactive/zero-progress, mission detail populated, progress partial, tabs active/inactive; loading/empty/all-done noted as not-on-board.
- [ ] Timeline container layout: frame rmHK9, vertical, gap 20, inside Main Column padding [22,26]
- [ ] Bucket ordering rule: past-closed → this-week → future ascending → trailing NO CLIFF, empty weeks omitted (JUN15→JUL06 jump)
- [ ] All 6 buckets enumerated with frame ids + exact range labels + DaysPill states
- [ ] TimelineWeekHeader structure: Range + DaysPill + Rule, gap 12
- [ ] DaysPill all 4 states: WINDOW CLOSED / THIS WEEK (primary) / IN {n}D / UNSCHEDULED with stroke+label tokens
- [ ] Range label format & typography (JetBrains Mono 11px ls1.5 $muted-foreground)
- [ ] Horizontal TaskCard structure: 4-part [Status|NameBlock|CatTag|Pill], padding [11,14], gap 14, fill $card/$muted
- [ ] StatusCycleButton 4 status appearances: empty-subtle / empty-border-hover / primary-ring+inner-square (in-progress) / success-fill+check (done)
- [ ] Merged window/status Pill 6 variants with icons (check/alarm-clock/ban/lock/none), strokes, literals
- [ ] CLOSING · T-2D combined window-state+countdown string with warning stroke+fill
- [ ] CategoryTag dot+icon+label across all 5 categories with color tokens + lucide icons + muted label
- [ ] Blocked-by hint sub-line (literal 'blocked by: Confirm ticket transfer', 10px ls0.3 subtle)
- [ ] Dimmed window-closed treatment (opacity 0.6 + $muted fill) and done name-recolor treatment
- [ ] All 11 card instances tied to (window-state × status × category)
- [ ] Status-cycle interaction (always enabled, advisory-never-gating) + read-only of all other elements
- [ ] Data/logic contracts: ISO-week bucketing, window-state precedence, CLOSING_THRESHOLD_DAYS=7, blocked derived from dep graph
- [ ] STARTS shows not_before date while bucket reflects too_late_by cliff (two distinct fields)
- [ ] Drift vs canonical recorded per component (horizontal vs vertical TaskCard, missing 44px touch target, overloaded pill, dot+icon CategoryTag, no standalone StatusBadge)