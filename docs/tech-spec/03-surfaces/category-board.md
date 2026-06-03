# Surface Spec — Category Board (desktop) (`D3JA0i`) · P0

*Source: `docs/design-extract/boards/D3JA0i__*.json` (screen authoritative). 3 scoped sections.*

# App Shell & Navigation Chrome — AppHeader, Sidebar + NavCard, ViewTabs, Layout Grid

*scope: App shell + navigation chrome (D3JA0i)*

## App Shell & Navigation Chrome

Scope source of truth: board **D3JA0i** (`OpsBoard — Category Board (desktop)`, frame 1320×1640, `fill: $background`). This section specs the persistent chrome that frames every desktop view: the **AppHeader**, the **280px Sidebar** with its mission **NavCard** (active/selected) + cliff-chip, the **ViewTabs** strip (3 views, active/inactive), and the **layout grid** (header / sidebar / fill main) including its borders and muted-surface tokens. Per the source-of-truth rule, the screen's flattened rendering is authoritative; canonical-library divergences are recorded as informational and reconciled toward this screen.

The main panel's inner content (MissionDetailHeader stats/progress, CategoryGroups, TaskCards, window-state matrix) is OUT OF SCOPE here and is specced separately; this section covers only the chrome and the layout shell that contains it.

### 1. Purpose

Provide the always-present desktop frame for the read-only mission planner: a global wordmark header, a left rail that lists missions and lets the operator select the active mission (NavCard selection drives the main panel), and a three-way view switcher (BY CATEGORY / TIMELINE / DEPENDENCIES) that swaps the main panel's body. The chrome itself carries no destructive or mutating affordances — the only interaction in the entire product is tapping a task's StatusCycleButton inside the main content (out of this scope). The shell is a status display.

### 2. Layout (exact px / tokens / structure, top → bottom)

Root `frame D3JA0i` (1320×1640, `fill $background`, `layout none`) contains a single `frame Screen` (`x4K9q`, 1320×1640, `fill $background`, `layout vertical`). The Screen is a 2-row vertical stack:

1. **Header** (`eP5PE`) — full-width top bar.
2. **Body** (`aGZhe`) — `width fill_container`, `height fill_container`, default (horizontal) layout, holding the **Sidebar** (fixed 280px) + **Main** (fill).

So the shell grid is: `[ Header (full width, hug height) ] / [ Sidebar 280px | Main fill ]`.

#### 2.1 Header (`eP5PE`)
- `width: fill_container`; height hugs content (vertical padding `20` + 16px line = ~56px tall).
- `fill: $muted` (#131318).
- `stroke: $border` (#2a2a38), `strokeWidth { bottom: 1 }`, `strokeAlignment: inner` — a 1px bottom rule separating header from body.
- `padding: [20, 32]` (20 vertical, 32 horizontal).
- `justifyContent: space_between`, `alignItems: center`.
- Single child today: **Wordmark** (`g3lFfu`, `alignItems center`, default horizontal, no explicit gap → tokens sit flush) with two text runs:
  - `OPS` (`DM3Qo`): `fill $primary` (#ff6b35), JetBrains Mono, `fontSize 16`, `fontWeight 700`, `letterSpacing 4`.
  - `BOARD` (`ROl5q`): `fill $muted-foreground` (#7a7a8e), JetBrains Mono, `fontSize 16`, `fontWeight 700`, `letterSpacing 4`.
- **Right side is intentionally empty.** `justifyContent: space_between` is present but there is no second child, so the wordmark sits left and the right cluster is omitted (see §6 Open items / decision note).

#### 2.2 Body (`aGZhe`)
- `width: fill_container`, `height: fill_container`, default horizontal layout, no padding/gap → Sidebar and Main are flush, separated only by the Sidebar's right border.

#### 2.3 Sidebar (`veqHp`)
- Fixed `width: 280`, `height: fill_container`, `clip: true`.
- `fill: $muted` (#131318) — matches header muted surface.
- `stroke: $border`, `strokeWidth { right: 1 }`, `strokeAlignment: inner` — 1px right rule dividing rail from main.
- `layout: vertical`, no explicit gap (SidebarHeader then MissionList stack directly).
- Children top→bottom:
  - **SidebarHeader** (`zcu5U`): `width fill_container`, `padding 18`. One text **Label** (`pDK4v`): `content "MISSIONS"`, `fill $muted-foreground-subtle` (#4a4a5e), JetBrains Mono, `fontSize 11`, `fontWeight 700`, `letterSpacing 2`.
  - **MissionList** (`y23uJ`): `width fill_container`, `layout vertical`, `gap 8`, `padding [0, 8]` (8px horizontal gutters, mission cards inset from rail edges; no vertical padding). Holds the NavCard(s).

#### 2.4 Main (`BcvHa`)
- `width: fill_container`, `height: fill_container`, `clip: true`, `layout vertical`.
- Vertical stack: **DetailHeader** (`C8Q90`, out of scope — content) / **Tabs** (`XncOx`, in scope) / **Content** (`oqMwf`, out of scope). Only the **Tabs** strip is part of this chrome scope.

#### 2.5 ViewTabs (`XncOx`)
- `width: fill_container`, `fill: $muted` (#131318) — muted bar, same surface family as header/sidebar.
- `stroke: $border`, `strokeWidth { bottom: 1 }`, `strokeAlignment: inner` — 1px bottom rule under the tab strip.
- `gap: 28`, `padding: [0, 32]` (no vertical padding on the strip; each tab supplies its own vertical padding), `alignItems: center`.
- Three tab frames, each default horizontal with `padding [14, 0]` (14px top/bottom, 0 horizontal → the 28px gap is the only horizontal spacing) and a single text child:
  - **BY CATEGORY** (`z43PH`, ACTIVE): frame `stroke $primary` + `strokeWidth { bottom: 2 }` + `strokeAlignment inner` → 2px primary underline. Text `L` (`ZcsAE`): `content "BY CATEGORY"`, `fill $primary` (#ff6b35), JetBrains Mono, `fontSize 12`, `fontWeight 700`, `letterSpacing 1.5`.
  - **TIMELINE** (`ohVWr`, INACTIVE): frame carries `stroke $primary` with **no strokeWidth** (no visible border — see drift). Text `L` (`ehATD`): `content "TIMELINE"`, `fill $muted-foreground` (#7a7a8e), JetBrains Mono, `fontSize 12`, `fontWeight 700`, `letterSpacing 1.5`.
  - **DEPENDENCIES** (`Qoh2k`, INACTIVE): frame carries `stroke $primary` with **no strokeWidth**. Text `L` (`ovjuv`): `content "DEPENDENCIES"`, same type spec as above, `fill $muted-foreground`.

### 3. Components used (as rendered)

#### AppHeader (rendered as Header `eP5PE`)
- **As rendered:** muted full-width bar, 1px bottom border, `[20,32]` padding, `space_between`/center, holding only the Wordmark (OPS in `$primary` + BOARD in `$muted-foreground`, both JetBrains Mono 16/700/ls4).
- **Tokens:** `$muted` (fill), `$border` (bottom stroke), `$primary` (OPS), `$muted-foreground` (BOARD).
- **States seen:** default (only state on this board).
- **Divergence from canonical:** Canonical AppHeader includes an **Actions cluster** (SyncStatus / Search / Notifications / More) on the right; the board **omits it entirely**, leaving the `space_between` right side empty. This is a screen decision to reconcile toward — desktop header on this board is wordmark-only. No VoiceFAB / SyncStatus / Search rendered.

#### Sidebar (rendered as `veqHp`)
- **As rendered:** 280px fixed rail, `$muted` fill, 1px right border, vertical, `SidebarHeader (padding 18, "MISSIONS" eyebrow)` + `MissionList (gap 8, padding [0,8])`.
- **Tokens:** `$muted` (fill), `$border` (right stroke), `$muted-foreground-subtle` (MISSIONS label).
- **States seen:** default; rail is `clip:true` (implies vertical scroll for overflow of the mission list).
- **Divergence from canonical:** Canonical Sidebar lists **3 NavCards**; this board renders only **1** (AfrikaBurn). No `count` value (e.g. "04") is shown in this board's SidebarHeader (other boards show a count next to MISSIONS — here the eyebrow is label-only).

#### NavCard — active/selected (rendered as `NavCard AfrikaBurn` `FqzB7`)
- **As rendered:** `width fill_container`, `clip true`, `layout vertical`, `gap 8`, `padding 14`.
  - `fill: #ff6b351f` — primary (#ff6b35) at ~12% alpha (the `1f` suffix), a primary-tinted selected surface.
  - `stroke: $primary` (#ff6b35), `strokeWidth 1`, `strokeAlignment inner` — full 1px primary border denotes the selected/active mission.
  - **Name** (`xxA8x`): `content "AfrikaBurn 2026"`, `fill $foreground` (#e8e8f0), DM Sans, `fontSize 16`, `fontWeight 600`.
  - **Meta** (`f0938`): horizontal, `gap 8`, `alignItems center`, holding the cliff **Chip** + a **Count** text.
    - **Count** (`ZatiN`): `content "3/11 tasks"`, `fill $muted-foreground`, JetBrains Mono, `fontSize 12`, `fontWeight normal`.
- **Cliff-chip (Chip `eUD9e`):** `fill #d9a73e1f` (warning #d9a73e at ~12% alpha), `cornerRadius 999` (full pill — note: kept rounded despite global `radius` token = 0), `gap 4`, `padding [2,7]`, `alignItems center`. Children:
  - icon `clock` (`iuId0`): lucide `timer`, 11×11, `fill $warning` (#d9a73e).
  - **ChipLabel** (`eCPU8`): `content "T-3d"`, `fill $warning`, JetBrains Mono, `fontSize 11`, `fontWeight 600`.
- **Tokens:** `$primary` (+ `#ff6b351f` tint), `$foreground`, `$muted-foreground`, `$warning` (+ `#d9a73e1f` tint).
- **States seen:** active/selected (the only NavCard variant present on this board). Inactive/default NavCard states are NOT rendered here (sourced from other boards).
- **Divergence from canonical:** Structurally a close match to the canonical NavCard tree (Name + Meta(Chip, Count)). Canonical sample uses a **bureaucratic** chip color for the cliff chip; this board uses **warning** (cliff-imminent T-3d, semantically the cliff window-state color). The cliff Chip behaves as a Badge/CategoryTag hybrid (rounded pill, icon+label). The chip retains `cornerRadius 999` while sibling content elsewhere on the board honors `radius 0` — radius usage is inconsistent across the board.

#### ViewTabs (rendered as Tabs `XncOx`)
- **As rendered:** muted bar with 1px bottom border, `gap 28`, `padding [0,32]`, three tab frames (each `padding [14,0]`, mono 12/700/ls1.5 label). Active tab = `$primary` text + 2px `$primary` bottom underline; inactive tabs = `$muted-foreground` text, no underline.
- **Tokens:** `$muted` (bar fill), `$border` (bar bottom stroke), `$primary` (active text + active underline), `$muted-foreground` (inactive text).
- **Variants/states seen:**
  - **active**: BY CATEGORY (primary text + bottom:2 primary underline).
  - **inactive**: TIMELINE, DEPENDENCIES (muted-foreground text, no underline).
- **The 3 views (fixed set):** `BY CATEGORY`, `TIMELINE`, `DEPENDENCIES`.
- **Divergence from canonical:** Inactive tabs carry a **stray `stroke: $primary` with no `strokeWidth`** (no visible border, dangling prop / extraction artifact). Canonical inactive `Tab` has no stroke. Active state is correctly the only one with a rendered (bottom:2) underline. Reconcile by dropping the strokeless `$primary` from inactive tabs.

### 4. States enumerated (this scope)

- **AppHeader**: default only (wordmark-left, empty right). No hover/scroll/sticky states rendered.
- **Sidebar**: default; `clip:true` implies an overflow-scroll state for long mission lists (not visually shown).
- **NavCard**: active/selected only (primary tint fill + 1px primary border). Inactive/hover/default NOT on this board.
- **NavCard cliff-chip**: warning/closing state (`T-3d`, timer icon, warning tint). Other cliff states (e.g. not-yet, healthy) NOT shown here.
- **ViewTabs tab**: `active` (BY CATEGORY) and `inactive` (TIMELINE, DEPENDENCIES). Hover/focus/disabled NOT rendered.

### 5. Interactions & data/logic contracts

- **Read-only chrome.** The header and tab strip expose no mutating controls. Per product model, the ONLY direct interaction is tapping a task's StatusCycleButton — which lives inside the main content (out of this scope).
- **NavCard selection (navigation):** tapping a NavCard selects that mission as the active detail context; the selected mission is rendered with the active/selected recipe (`#ff6b351f` fill + 1px `$primary` border) and drives the Main panel (DetailHeader title/stats + content). Exactly one NavCard is selected at a time. The board shows the selected state but no hover/press affordance.
- **ViewTabs switching (navigation):** tapping a tab switches the Main panel body between the three views (BY CATEGORY / TIMELINE / DEPENDENCIES). Exactly one tab active; active tab = `$primary` text + 2px `$primary` underline. View state is per-mission-or-global app state (board shows BY CATEGORY active).
- **Data — NavCard:** mission `name` (e.g. "AfrikaBurn 2026"); completion `count` rendered "{done}/{total} tasks" (board: "3/11 tasks"); cliff chip `T-{n}{unit}` countdown to the mission's nearest/aggregate cliff with a window-state-derived color (board: warning + "T-3d"). The cliff chip is a derived window-state summary (timer icon + countdown), NOT a stored due date.
- **Data — ViewTabs:** the three view labels are a fixed, static set; the active index is app/UI state, not mission data.
- **Data — AppHeader:** static wordmark; no live data bound on this board (the intended SyncStatus/operator/date affordances are omitted here).
- **Layout/derived:** Sidebar fixed 280px, Main fills remaining 1040px (1320 − 280); header and tab strip span their containers' full width; borders are inner-aligned 1px (`$border`) rules forming the grid lines (header-bottom, sidebar-right, tabs-bottom).

### 6. Tokens used (this scope)

`$background` (#0a0a0c, root), `$muted` (#131318, header / sidebar / tabs surfaces), `$border` (#2a2a38, all chrome rules), `$primary` (#ff6b35, wordmark OPS / active tab / NavCard selected border), `$muted-foreground` (#7a7a8e, wordmark BOARD / inactive tabs / NavCard count), `$muted-foreground-subtle` (#4a4a5e, MISSIONS eyebrow), `$foreground` (#e8e8f0, NavCard mission name), `$warning` (#d9a73e, cliff chip icon+label). Tint fills: `#ff6b351f` (primary @ ~12%, NavCard selected surface), `#d9a73e1f` (warning @ ~12%, cliff chip surface). Type: JetBrains Mono for all chrome labels/wordmark/chip/count; DM Sans only for the NavCard mission name. Global `radius` token = 0 (sharp corners) except the NavCard cliff chip which forces `cornerRadius 999`.

# Category Board (Desktop) — Mission Detail Header, Category Group Headers & Content List Layout

*scope: Agent B — MissionDetailHeader + CategoryGroupHeader + Content list layout*

## Category Board (Desktop) — Mission Detail Header, Category Group Headers & Content List Layout

> Board: `D3JA0i` — "OpsBoard — Category Board (desktop)" (1320×1640). Scope authoritative source: the screen as laid out. This section specs the three surfaces inside the `Main` column (`BcvHa`) below the `Tabs` row: the **MissionDetailHeader** (`DetailHeader` `C8Q90`), the per-group **CategoryGroupHeader** (`GroupHeader` ×5), and the **Content list layout** (`Content` `oqMwf` — group ordering, gaps, per-group counts). The TaskCard rows inside each group's `List` are owned by a separate agent; here they are treated only as opaque list children for layout/count purposes.

---

### 1. Purpose

- **MissionDetailHeader** is the at-a-glance status banner for the currently-selected mission (AfrikaBurn 2026). It states the mission title, the real-world **target/cliff date** (NOT a task due-date), a 4-up numeric summary of window/status counts (DONE / BLOCKED / CLOSING / TOTAL), and a 3-segment progress bar visualising the done/closing/blocked split. It is a read-only status display — no controls.
- **CategoryGroupHeader** is the section divider that opens each category group: an 8px category-colored dot, the category name (mono caps eyebrow, recolored per category), and a `{done}/{total}` completion count in dim text. One per category present in the mission.
- **Content list layout** is the vertical stack of category groups in the main scroll area: 5 groups, fixed ordering, each group = its CategoryGroupHeader + a stacked task `List`.

---

### 2. Layout (exact px / tokens / structure, top → bottom)

All three surfaces live inside `Main` (`BcvHa`, `layout: vertical`, fill width/height, `clip`). Order within `Main`: `DetailHeader` → `Tabs` → `Content`. (`Tabs` is out of scope.)

#### 2.1 MissionDetailHeader — `DetailHeader` (`C8Q90`)
- Frame: `width: fill_container`, `layout: vertical`, `gap: 16`, `padding: [24, 32]` (24 vertical / 32 horizontal).
- Bottom hairline only: `stroke: $border`, `strokeWidth: { bottom: 1 }`, `strokeAlignment: inner`. **No top/side border, no fill** (transparent over `$background`).
- Children top→bottom (4):
  1. **Title** (`m2zjIf`) — text "AfrikaBurn 2026", `fill: $foreground`, `DM Sans`, `fontSize: 26`, `fontWeight: 700`.
  2. **Target** (`B8rZbe`) — text "Target: 27 Apr 2026", `fill: $muted-foreground`, `JetBrains Mono`, `fontSize: 13`, `fontWeight: normal`. (No `letterSpacing` set.)
  3. **Stats** (`h0H6nB`) — horizontal frame, `gap: 32`, default left alignment, contains 4 StatTiles (see §3.1).
  4. **Progress** (`t9BKJ`) — segmented bar (see §3.2).

#### 2.2 Stats row — `Stats` (`h0H6nB`)
- Horizontal auto-layout, `gap: 32`, no padding. 4 tiles, fixed order: **DONE → BLOCKED → CLOSING → TOTAL**.
- Each tile (`aFnL2` DONE, `W7cAa` BLOCKED, `UAoqL` CLOSING, `Z9zT1U` TOTAL) is a `layout: vertical` frame with `gap: 3`, **value-over-label**:
  - **Val** text: `JetBrains Mono`, `fontSize: 22`, `fontWeight: 700`. Color is metric-semantic.
  - **Lab** text: `JetBrains Mono`, `fontSize: 11`, `fontWeight: 600`, `letterSpacing: 1.5`, `fill: $muted-foreground-subtle` (constant across all 4 tiles).

#### 2.3 Segmented ProgressBar — `Progress` (`t9BKJ`)
- Track frame: `width: fill_container`, `height: 4`, `fill: $card-elevated`, `clip: true`, default horizontal layout (segments laid left→right, no gap).
- 3 child segments, each `height: fill_container` (= 4px), fixed-px widths laid left→right:
  1. **Done** (`UYcRR`) — `width: 266`, `fill: $success`.
  2. **Closing** (`Q3WFQ`) — `width: 178`, `fill: $warning`.
  3. **Blocked** (`rFT3Y`) — `width: 266`, `fill: $destructive`.
- Segments are contiguous (no gap), then the remaining track to the right shows the bare `$card-elevated` fill (the "remaining/total" portion). The widths encode the done:closing:blocked ratio (266:178:266 ≈ 3:2:3), matching the stat counts 3/2/3; there is no explicit "remaining" segment frame — the empty track is the remainder.

#### 2.4 Content list — `Content` (`oqMwf`)
- Frame: `width: fill_container`, `layout: vertical`, `gap: 26` (vertical gap between category groups), `padding: [20, 32]` (20 vertical / 32 horizontal).
- 5 group children in this exact order: **Group medical → Group bureaucratic → Group travel → Group gear → Group tech** (matches the §3.3 category sort order).
- Each `Group` frame (`iflxH`, `i99jXN`, `tIkMl`, `nfuz0`, `o2Zaj`): `width: fill_container`, `layout: vertical`, `gap: 12` (between the group's `GroupHeader` and its `List`).
- Each group's `List` frame (`FYaXL`, `Gb3SM`, `AU318`, `UYWiu`, `mZC4k`): `width: fill_container`, `layout: vertical`, `gap: 10` (vertical gap between task cards within a group).
- **Gap hierarchy (load-bearing):** 26px between groups → 12px header-to-list within a group → 10px between cards.

---

### 3. Components used (as rendered — exact props / variants / states / tokens)

#### 3.1 StatTile (as rendered — 4× inside Stats)
Rendered as a bespoke `layout: vertical, gap: 3` frame with two text nodes (Val over Lab); **not** an instanced `Cmp·StatTile`.

| Tile | Frame id | Val content | Val fill (token) | Lab content |
|---|---|---|---|---|
| DONE | `aFnL2` | "3" | `$success` (#5ae07a) | "DONE" |
| BLOCKED | `W7cAa` | "3" | `$destructive` (#e05a5a) | "BLOCKED" |
| CLOSING | `UAoqL` | "2" | `$warning` (#d9a73e) | "CLOSING" |
| TOTAL | `Z9zT1U` | "11" | `$foreground` (#e8e8f0) | "TOTAL" |

- **Val type (all tiles):** JetBrains Mono, 22px, weight 700. Color is the only per-tile variant.
- **Lab type (all tiles):** JetBrains Mono, 11px, weight 600, letterSpacing 1.5, `$muted-foreground-subtle` (#4a4a5e).
- **Stat color semantics (fixed):** DONE→`$success`, BLOCKED→`$destructive`, CLOSING→`$warning`, TOTAL→`$foreground`.

#### 3.2 ProgressBar (as rendered)
- 3 fixed-px segments (Done 266 `$success` / Closing 178 `$warning` / Blocked 266 `$destructive`) over a `$card-elevated` 4px track, fill-container width, clipped. The remainder of the track to the right of the last segment is the empty `$card-elevated`, representing not-started/not-yet capacity. No rounded corners (radius 0).

#### 3.3 CategoryGroupHeader (as rendered — 5×) + group→color mapping
Rendered as a horizontal frame `gap: 8, alignItems: center` containing: **Dot** (ellipse) + **GLabel** (text) + **GCount** (text). (Note board node names are `GLabel`/`GCount`, not canonical `Label`/`Count`.)

| Group | GroupHeader id | Dot id (8×8 ellipse) | Color token | Dot+Label fill | GLabel content | GCount content |
|---|---|---|---|---|---|---|
| medical | `KbM4g` | `e7yh6z` | `$cat-medical` (#e05a9f) | `$cat-medical` | "MEDICAL" | "2/4" |
| bureaucratic | `z0Qj8` | `cuXtE` | `$cat-bureaucratic` (#5aa0e0) | `$cat-bureaucratic` | "BUREAUCRATIC" | "0/3" |
| travel | `H771Gt` | `x9d3Fc` | `$cat-travel` (#5ae0a0) | `$cat-travel` | "TRAVEL" | "1/2" |
| gear | `NfJYV` | `g5SEN` | `$cat-gear` (#e0c05a) | `$cat-gear` | "GEAR" | "0/1" |
| tech | `c5olJq` | `b8S5F` | `$cat-tech` (#a05ae0) | `$cat-tech` | "TECH" | "0/1" |

- **Dot:** ellipse, `width: 8`, `height: 8`, `fill: $cat-{category}` (full color, no alpha).
- **GLabel:** JetBrains Mono, 12px, weight 700, `letterSpacing: 1.5`, `fill: $cat-{category}` (same token as the dot).
- **GCount:** JetBrains Mono, 12px, weight `normal`, `fill: $muted-foreground-subtle` (#4a4a5e), constant across all groups. Format = `{done}/{total}`.
- **No Lucide category icon is rendered in the group header** (dot + label + color only). Per-category icons (stethoscope/file-text/plane/backpack/cpu) appear only on the task-card CategoryTag, not on the group header.

---

### 4. States covered in this scope

- **MissionDetailHeader — populated (the only state shown):** title set, human target date, all 4 stats non-trivial (3/3/2/11), all 3 progress segments present and non-zero. Canonical also defines all-done and zero-task variants — not rendered here.
- **StatTile — 4 fixed metric tones:** success / destructive / warning / foreground (one each). The label is always the dim subtle tone. No empty/zero StatTile is shown (CLOSING value is "2", BLOCKED "3" — none are 0), though counts can be 0 (see group counts 0/3, 0/1).
- **ProgressBar — partial/in-flight:** 3 colored segments + remaining empty track. No all-done (full success) or empty (0-width) state rendered.
- **CategoryGroupHeader — 5 category color variants** (medical/bureaucratic/travel/gear/tech), each at the same type/structure, differing only by color token + label string + count.
- **GroupCount states:** non-zero-progress (medical 2/4, travel 1/2) and zero-progress (bureaucratic 0/3, gear 0/1, tech 0/1). Color of the count is constant (`$muted-foreground-subtle`) regardless of progress.

---

### 5. Interactions

- **None within this scope.** The MissionDetailHeader, the StatTiles, the ProgressBar, and the CategoryGroupHeaders are all **read-only status display** (consistent with LOCKED decision #4: the board is read-only; the only direct interaction is tapping a task's StatusCycleButton to cycle status — which lives on the TaskCard, out of scope here).
- No hover/focus/press affordance is rendered on any header element; group headers are not collapsible/clickable in the screen.

---

### 6. Data / logic contracts

- **Title** ← `mission.name`.
- **Target** ← `mission.targetDate` (the real-world cliff/event date, NOT a per-task due date). Rendered string "Target: 27 Apr 2026" = sentence-case label + human-formatted `D MMM YYYY` date.
- **Stats** ← derived mission aggregates over its tasks:
  - DONE = count(status == done) → here 3.
  - BLOCKED = count(computed-blocked) → here 3. **`blocked` is computed from the dependency graph, not stored.**
  - CLOSING = count(windowState == closing) → here 2.
  - TOTAL = count(all tasks) → here 11.
  - Note the four metrics are not mutually exclusive partitions of TOTAL (DONE+BLOCKED+CLOSING = 8 ≠ 11; open/not-yet/closed tasks fill the rest). TOTAL is the full task count; DONE/BLOCKED/CLOSING are overlapping status/window slices.
- **ProgressBar** segment widths ← proportional to the done/closing/blocked counts (rendered 266:178:266 ≈ 3:2:3). The empty remainder of the track = TOTAL minus those slices (not-started/open/not-yet capacity). Track fill `$card-elevated` is the "remaining" visual.
- **CategoryGroupHeader.GCount** ← `{done}/{total}` for that category's task set (medical 2/4, bureaucratic 0/3, travel 1/2, gear 0/1, tech 0/1). Sum of group totals = 4+3+2+1+1 = **11 = TOTAL** (consistency check holds). Sum of group dones = 2+0+1+0+0 = **3 = DONE stat** (consistency check holds).
- **Group→color mapping** is a fixed lookup `categorySlug → $cat-*` token: medical→`$cat-medical`, bureaucratic→`$cat-bureaucratic`, travel→`$cat-travel`, gear→`$cat-gear`, tech→`$cat-tech`. The same token drives both the dot fill and the label fill.
- **Group ordering** is fixed/canonical: medical, bureaucratic, travel, gear, tech (matches the mobile board's documented sort order). Groups with zero tasks would presumably be omitted, but all 5 categories are present here.

---

### 7. Divergences from canonical component defs (informational)

1. **StatTile fontSize + nesting drift (HIGH).** Board Val = **22px**; canonical `Cmp·StatTile` Val = **30px**; and the separate `MissionSummaryCard` canonical renders the same stat block at **20px** — three sizes for one stat block across the system. Also, the board **inlines** the 4 tiles as bespoke `DONE/BLOCKED/CLOSING/TOTAL` frames rather than referencing `Cmp·StatTile` instances (canonical MissionDetailHeader refs `StatTile h2sG4m` ×4). Board Lab is 11px/600/ls1.5; canonical Lab is 11px/600/ls1.5 — consistent. Reconcile toward the screen (22px) per the source-of-truth rule.
2. **Target date format drift.** Board = "**Target: 27 Apr 2026**" (sentence-case label + human `D MMM YYYY`, JetBrains Mono **13px/normal**, no letterSpacing). Canonical MissionDetailHeader = "**TARGET: 2026-04-27**" (uppercase label + ISO date, mono 13px/**500**, tracking 1). Copy/format + weight/tracking drift. Screen wins: sentence-case + human date.
3. **MissionDetailHeader wrapper drift.** Board header has bottom border only, padding [24,32], **transparent fill**; canonical is described as `bg-background`, border-bottom 1, padding 24/32 — consistent on padding/border but the board has **no live status dot / no LOCATION line** that the Timeline/Dependencies renditions add (those add a leading live dot + richer target line w/ location). On THIS board the header is the lean variant (title + plain target line); note for cross-board reconciliation.
4. **CategoryGroupHeader naming drift (cosmetic).** Board node names `GLabel`/`GCount`; canonical uses `Label`/`Count`. Low risk; normalize for codegen consistency.
5. **CategoryGroupHeader missing category Lucide icon.** Board renders **dot + label + count only** (no per-category Lucide icon). Design-brief §6 mandates icon+label+color redundancy (CVD-safe). On the screen the icon channel is carried only by the task-card CategoryTag, not the group header. Note as informational drift vs the brief; the screen (dot+label+color) is authoritative.
6. **ProgressBar widths are hardcoded px** (266/178/266) rather than data-driven percentages; the canonical `Cmp·ProgressBar` takes done/closing/blocked/total props. There is no explicit "remaining" segment frame — the empty `$card-elevated` track is the remainder. Reconcile by computing widths from counts at build time.

---

### 8. Token inventory (this scope)
- Surfaces/text: `$background` (page under header), `$foreground` (title, TOTAL val), `$muted-foreground` (target line), `$muted-foreground-subtle` (all stat labels, all group counts), `$card-elevated` (progress track).
- Status/metric tones: `$success` (DONE val + Done segment), `$destructive` (BLOCKED val + Blocked segment), `$warning` (CLOSING val + Closing segment), `$border` (header bottom hairline).
- Category tones (dot+label per group): `$cat-medical` #e05a9f, `$cat-bureaucratic` #5aa0e0, `$cat-travel` #5ae0a0, `$cat-gear` #e0c05a, `$cat-tech` #a05ae0.
- Fonts: `JetBrains Mono` (target line, all stat val+lab, group labels+counts), `DM Sans` (title only). Radius: 0 everywhere except the 8px circular category dots (ellipse).

# Category-board TaskCard — as-rendered functional spec (status indicator · CategoryTag · WindowStatePill + BLOCKED overload · accent/opacity recipes)

*scope: TaskCard + state-matrix spec (Category board)*

## Category-board TaskCard — as-rendered spec (board D3JA0i)

> SOURCE-OF-TRUTH: this section documents the TaskCard **exactly as flattened on the Category board** (the screen is authoritative). The board's task rows are each named `Card` (not `TaskCard`) and follow a `Card > Inner > [Status + Col]` tree. Canonical divergences are documented per-component for the later consolidation phase and are **informational only**.

### 1. Purpose

The TaskCard is the atomic, **read-only status display row** for one task within a Category group. It encodes a task across two orthogonal axes through four redundant channels (color + icon + label + opacity/border):

- **STORED STATUS** (`not-started` / `in-progress` / `done`) — surfaced by the 18×18 left **Status** box, which is the tap-to-cycle target (the board's only direct interaction).
- **DERIVED WINDOW STATE** (`open` / `closing` / `closed` / `not-yet`) plus the **derived BLOCKED** overlay — surfaced by the meta-row `Pill` and by card-level border/fill/opacity recipes.

`blocked` is computed from the dependency graph (not stored) and is rendered through the same `Pill` slot as window-states, plus card dimming and an extra dependency caption.

### 2. Layout (exact px / tokens / structure, top→bottom)

Each card is a vertical-less `frame` named `Card` containing a single `Inner` frame:

```
Card (frame)                       width fill_container · clip · stroke recipe (see §6) · fill recipe (see §6)
└─ Inner (frame)                   width fill_container · layout=horizontal (default) · gap 12 · padding 14 (all sides)
   ├─ Status (frame)               18×18 · strokeWidth 2 (inner) · justify=center · align=center   [§4 StatusCycleButton]
   │  └─ [glyph text]              optional ✓ or ◼ depending on status; absent for not-started
   └─ Col (frame)                  width fill_container · layout=vertical · gap 7
      ├─ TaskName (text)           DM Sans · 15px · weight 500 · fill = $foreground OR $muted-foreground (see §4)
      ├─ MetaRow (frame)           layout=horizontal · gap 10 · align=center
      │  ├─ Tag (frame)            CategoryTag — icon 12×12 + label   [§5]
      │  └─ Pill (frame)           WindowStatePill / BLOCKED / plain-date  [§6]   (absent on the IN_PROGRESS gear card)
      └─ Dep (text)                OPTIONAL — only on BLOCKED cards; mono 12px caption  [§6.5]
```

- **Card padding:** none at Card level; all 14px padding lives on `Inner`.
- **Status↔Col gap:** 12px. **TaskName↔MetaRow gap:** 7px (and MetaRow↔Dep gap 7px when Dep present). **Tag↔Pill gap:** 10px. **Icon↔label gap inside Tag/Pill:** 5px.
- **List gap between cards:** 10px (parent `List` frame, vertical). **Group gap:** 26px (parent `Content`). Group header→list gap: 12px.
- **cornerRadius:** 0 everywhere (global `radius` token = 0). Cards, tags, pills, and the status box are all **sharp**.

### 3. The 11 instances enumerated → (status × window-state)

Cards are listed in render order, grouped by category. `id` = board node id.

| # | id | Group | Task name | STATUS (box) | WINDOW / overlay (pill) | Card recipe (fill / border / opacity) | TaskName fill |
|---|----|-------|-----------|--------------|--------------------------|----------------------------------------|---------------|
| 1 | `ykzP8` | MEDICAL | Book cardiology follow-up | **DONE** (✓ on $success) | **OPEN** → plain date "15 Mar" | $card / full 1px $border / 1.0 | $muted-foreground |
| 2 | `jehRx` | MEDICAL | Get fitness-to-travel cert (Dr. Ruf) | **NOT_STARTED** (empty box) | **CLOSING** · timer · "CLOSING · T-5d" | $card / left-2px $warning / 1.0 | $foreground |
| 3 | `mZpx4` | MEDICAL | Get GP cert (Dr. Schmickaly) | **DONE** (✓ on $success) | **OPEN** → plain date "1 Apr" | $card / full 1px $border / 1.0 | $muted-foreground |
| 4 | `diuMr` | MEDICAL | Brief AB medical team | **NOT_STARTED** (empty box) | **BLOCKED** · triangle-alert · "BLOCKED" + Dep line | $card / left-2px $muted-foreground-subtle / **0.6** | $foreground |
| 5 | `V9TW1` | BUREAUCRATIC | Submit Envivas documentation | **NOT_STARTED** (empty box) | **BLOCKED** · triangle-alert · "BLOCKED" + Dep line | $card / left-2px $muted-foreground-subtle / **0.6** | $foreground |
| 6 | `FzENH` | BUREAUCRATIC | Confirm TK §18 SGB V coverage | **NOT_STARTED** (empty box) | **CLOSED** · circle-x · "WINDOW CLOSED" + "5 Apr" | **$muted** / left-2px **$muted-foreground** / **0.55** | $muted-foreground |
| 7 | `W8jyx` | BUREAUCRATIC | Research VFS Global visa extension | **NOT_STARTED** (empty box) | **CLOSING** · timer · "CLOSING · T-3d" | $card / left-2px $warning / 1.0 | $foreground |
| 8 | `OUyWF` | TRAVEL | Book TKO044 IST→CPT | **DONE** (✓ on $success) | **OPEN** → plain date "20 Mar" | $card / full 1px $border / 1.0 | $muted-foreground |
| 9 | `S0sc3` | TRAVEL | Arrange Tankwa Town transfer | **NOT_STARTED** (empty box) | **BLOCKED** · triangle-alert · "BLOCKED" + Dep line | $card / left-2px $muted-foreground-subtle / **0.6** | $foreground |
| 10 | `SNXYk` | GEAR | Buy goggles & dust mask | **IN_PROGRESS** (◼ on #ff6b351f) | **(no pill at all)** | $card / full 1px $border / 1.0 | $foreground |
| 11 | `NV5Om` | TECH | Flash LED suit firmware | **NOT_STARTED** (empty box) | **NOT_YET** · lock · "NOT YET" + "starts 10 Jun" | $card / left-2px $muted-foreground-subtle / **0.6** | $foreground |

**Coverage of the matrix actually present on this board:**
- STATUS: DONE (×3: #1,#3,#8), IN_PROGRESS (×1: #10), NOT_STARTED (×7: #2,#4,#5,#6,#7,#9,#11).
- WINDOW: OPEN (×3, all DONE), CLOSING (×2: #2,#7), CLOSED (×1: #6), NOT_YET (×1: #11).
- BLOCKED overlay (×3: #4,#5,#9) — always over NOT_STARTED status.
- **Not present on this board (gaps):** any non-DONE OPEN card with a window pill; IN_PROGRESS paired with any window-state; DONE paired with closing/closed/not-yet; blocked paired with in-progress or done; the closing/closed/not-yet pills on a done task. The `line-through` decoration on DONE task names (per brief §10) is **not** rendered on the board — DONE names are only recolored to $muted-foreground, never struck.

### 4. Status indicator (the tap-to-cycle target) — as rendered

`Status` frame: **18×18**, `strokeWidth: 2` (inner alignment), `justifyContent: center`, `alignItems: center`, cornerRadius 0 (sharp square). Three rendered variants:

| Status | Box fill | Box stroke | Child glyph | Glyph fill / font |
|---|---|---|---|---|
| **NOT_STARTED** | none | `$border` | *(no child)* | — |
| **IN_PROGRESS** | `#ff6b351f` (primary @ ~12% / `$primary/12`) | `$primary` | `◼` (text) | `$primary` · JetBrains Mono · **9px** · weight normal |
| **DONE** | `$success` | `$success` | `✓` (text) | `$background` · JetBrains Mono · **11px** · weight 700 |

The glyphs are literal **text** nodes (`◼` U+25FC, `✓` U+2713), not shapes/icons. Only the IN_PROGRESS box carries a tinted fill; DONE is a solid success fill; NOT_STARTED is border-only.

### 5. CategoryTag — as rendered

`Tag` frame: `fill = <cat>/12` literal hex (12% alpha), `gap 5`, `padding [3, 8]`, `alignItems: center`, **cornerRadius 0** (sharp). Children: a 12×12 lucide `icon` (cat-colored) + a label text (JetBrains Mono · **11px** · weight 600 · letterSpacing 0.5 · cat-colored).

| Group | Tag fill (literal) | Token equiv | Icon (lucide) | Label |
|---|---|---|---|---|
| MEDICAL | `#e05a9f1f` | `$cat-medical`/12 | `stethoscope` | "MEDICAL" |
| BUREAUCRATIC | `#5aa0e01f` | `$cat-bureaucratic`/12 | `file-text` | "BUREAUCRATIC" |
| TRAVEL | `#5ae0a01f` | `$cat-travel`/12 | `plane` | "TRAVEL" |
| GEAR | `#e0c05a1f` | `$cat-gear`/12 | `backpack` | "GEAR" |
| TECH | `#a05ae01f` | `$cat-tech`/12 | `cpu` | "TECH" |

Icon `fill` and label `fill` both use the full-strength cat token (`$cat-medical` etc.). The tag fill is the **/12** tint. Identical across all 11 cards within a group; one tag per card.

### 6. WindowStatePill — semantics + the BLOCKED/plain-date overload

`Pill` frame: `gap 5`, `alignItems: center`, **no stroke, no border, no fill, no cornerRadius** — a bare inline icon+text group. It carries **five distinct rendered semantics** through this one slot:

| Semantic | Icon (lucide) | Icon fill | Text node(s) | Text fill | Notes |
|---|---|---|---|---|---|
| **OPEN** | *(none — no icon)* | — | date only, e.g. "15 Mar" / "1 Apr" / "20 Mar" | `$muted-foreground-subtle` (mono 11px normal) | Only appears on DONE cards here; no "OPEN" label rendered |
| **CLOSING** | `timer` | `$warning` | "CLOSING · T-5d" / "CLOSING · T-3d" (single text) | `$warning` (mono 11px **600**, ls 0.5) | Countdown `T-{n}d` baked into one string |
| **CLOSED** | `circle-x` | `$muted-foreground` | "WINDOW CLOSED" (mono 11px 600) **+** separate date "5 Apr" | label `$muted-foreground`, date `$muted-foreground-subtle` (11px normal) | Two text children inside the pill |
| **NOT_YET** | `lock` | `$muted-foreground-subtle` | "NOT YET" (mono 11px 600) **+** separate "starts 10 Jun" | both `$muted-foreground-subtle` (date 11px normal) | Two text children |
| **BLOCKED** (overload) | `triangle-alert` | `$muted-foreground` | "BLOCKED" (mono 11px 600, ls 0.5) | `$muted-foreground` | Plus card dimming + Dep caption (§6.5) |

Pill text is mono. The two-part pills (CLOSED, NOT_YET) put the label and the date in **separate text nodes** within the same pill; CLOSING bakes label+countdown into one string with a `·` separator. **No card on this board renders an explicit "OPEN" label** — open is expressed as a bare date or (for IN_PROGRESS #10) by the **complete absence of a pill**.

#### 6.5 The "blocked by" dependency caption

On the three BLOCKED cards (#4, #5, #9), the `Col` adds a third child after `MetaRow`: a `Dep` text node — JetBrains Mono · **12px** · weight normal · fill `$muted-foreground-subtle`, content = `⚠ blocked by: {prerequisite task name}`:
- #4 → `⚠ blocked by: Get fitness-to-travel cert (Dr. Ruf)`
- #5 → `⚠ blocked by: Get fitness-to-travel cert (Dr. Ruf)`
- #9 → `⚠ blocked by: Research VFS Global visa extension`

The `⚠` is a literal glyph in the text (not the lucide icon). This line names exactly one blocker per card here; the contract should allow `{names}` plural.

### 7. Left-accent border + opacity recipes (card-level state encoding)

The board encodes window/blocked state at the **Card** level via three coupled properties (border, fill, opacity):

| Recipe | Used by | `stroke` | `strokeWidth` | `fill` | `opacity` |
|---|---|---|---|---|---|
| **Neutral / healthy** (DONE-OPEN, IN_PROGRESS) | #1,#3,#8,#10 | `$border` | `1` (all sides, inner) | `$card` | 1.0 |
| **Closing accent** | #2,#7 | `$warning` | `{ left: 2 }` | `$card` | 1.0 |
| **Blocked / not-yet accent (dim)** | #4,#5,#9,#11 | `$muted-foreground-subtle` | `{ left: 2 }` | `$card` | **0.6** |
| **Closed (heaviest dim)** | #6 | `$muted-foreground` | `{ left: 2 }` | **`$muted`** | **0.55** |

Key recipe facts:
- The **left-accent** (`strokeWidth: { left: 2 }`) is a net-new encoding: only non-neutral states use a left-only 2px colored border; neutral cards use a full 1px box border.
- **Three distinct dim levels:** 1.0 (neutral/closing), 0.6 (blocked + not-yet), 0.55 (closed). Closing keeps full opacity — it is signaled by amber accent only, not dimming.
- The **closed** card is the only one that changes the **fill** (to `$muted`) and uses the brighter `$muted-foreground` border (vs `$muted-foreground-subtle` for blocked/not-yet).
- `clip: true` on every Card.

### 8. Interactions

- **StatusCycleButton (Status box) tap** — the only direct interaction. Cycles stored status `not-started → in-progress → done → not-started` (wrapping). Per brief §10 the control is **always enabled** (window-state/blocked are advisory, never gating).
- **No other interactions** on the card: no hover-edit, no menu, no link. Card is a read-only status display.
- DONE recolors TaskName to `$muted-foreground` (brief also calls for `line-through`, **not present on board** — see §9).
- On status change to `done`, the meta-row window pill behavior is **undefined by this board** (no DONE card here shows a window pill — all DONE cards are OPEN/plain-date). Consolidation must decide whether a DONE task suppresses its window pill.

### 9. Data / logic contracts (implied by the render)

- **status** ∈ {not-started, in-progress, done} — stored; drives Status box variant (§4).
- **window_state** ∈ {open, closing, closed, not-yet} — derived from `too_late_by` cliff, `not_before`, deps. Drives the `Pill` (§6) + card recipe (§7). `CLOSING_THRESHOLD_DAYS = 7` (brief §9; board shows T-5d and T-3d, both ≤7).
- **blocked** — derived from the dependency graph; not a stored status and (per product model) not a true window-state, yet rendered through the window `Pill` slot + 0.6 dim + Dep caption. Precedence per brief §9: `closed > not-yet(blocked) > not-yet(not_before) > closing > open`.
- **countdown** `T-{n}d` — computed from cliff vs "today"; baked into the CLOSING pill string.
- **date strings** — OPEN shows a human short date (e.g. "15 Mar"); CLOSED shows the cliff date "5 Apr"; NOT_YET shows `starts {date}` "10 Jun". Format is sentence-case human (`d MMM`), not ISO.
- **dependency names** — the Dep caption renders the literal prerequisite task name(s). Implies a lookup from blocker id → task name.
- **category** drives Tag fill/icon/label (§5) AND the group the card sorts into.
- **counts:** group headers show `{done}/{total}` (MEDICAL 2/4, BUREAUCRATIC 0/3, TRAVEL 1/2, GEAR 0/1, TECH 0/1) — must agree with per-card statuses; note DONE count (2/4 medical) counts only DONE, and mission TOTAL stat = 11 matches the 11 cards.

### 10. Divergence vs canonical TaskCard (for consolidation — informational)

1. **Node identity (PRIMARY DRIFT):** every task row is named `Card` and follows the `Cmp·Card` tree (`Card > Inner > [Status + Col(TaskName, MetaRow(Tag, Pill[, Dep]))]`), **not** the canonical `TaskCard` tree (`TaskCard > [Touch44(44×44) > Cycle(18×18 box), Body(Name, Meta(Tag, Win))]`). Names differ: Inner/Col vs Body, Status vs Touch44>Cycle, Pill vs Win.
2. **Missing 44px touch target:** the canonical TaskCard wraps the 18×18 cycle box in a 44×44 `Touch44` hit area; the board uses a raw 18×18 `Status` frame with **no 44px wrapper** — an accessibility/interaction gap, given this is the app's only interaction.
3. **Status glyph encoding:** board encodes status via **text glyphs** (`✓` 11px, `◼` 9px) and adds a DONE-fill variant ($success bg) + an IN_PROGRESS tint ($primary/12). Canonical StatusCycleButton uses a single `◼` glyph (8px) / a child 8×8 shape and has **no fill-state variants**. Reconcile glyph-vs-shape and the DONE solid-fill.
4. **CategoryTag sharp vs pill:** board tags have **cornerRadius 0**; canonical CategoryTag is cornerRadius 999. Global `radius=0` token likely overrides the canonical pill. (Inconsistent: the NavCard cliff chip elsewhere on the board keeps 999.)
5. **WindowStatePill rendered as a bare frame:** board `Pill` has **no stroke/border/fill/cornerRadius** — canonical WindowStatePill is a bordered pill (`stroke $border`, cornerRadius 999). The board also **overloads one Pill slot** to express window-state, blocked-status, AND plain target dates, whereas the canon separates `WindowStatePill` / `StatusBadge` / `CategoryTag`.
6. **OPEN has no pill/label:** canonical WindowStatePill default = circle icon + "OPEN". Board collapses OPEN into a bare date (DONE cards) or omits the pill entirely (IN_PROGRESS #10). Spec must define OPEN rendering.
7. **BLOCKED conflated into window pill + dim + Dep line:** BLOCKED is not a product window-state but is rendered via the `Pill` (triangle-alert + "BLOCKED"), card opacity 0.6, and a net-new `Dep` caption. No canonical component represents the inline dependency line — net-new (resembles a Dep/DependencyConnector caption). Note brief §9 colors blocked as `muted-foreground` (NOT red) — board matches (uses `$muted-foreground`).
8. **Three dim/fill recipes:** closed (fill $muted, border $muted-foreground, 0.55) vs blocked/not-yet (fill $card, border $muted-foreground-subtle, 0.6) vs neutral (full 1px $border, 1.0). Canonical TaskCard/Cmp·Card use a uniform 1px border with no left-accent concept — the **left-only 2px accent** is net-new board behavior.
9. **No `line-through` on DONE names:** brief §10 specifies DONE names go `line-through text-muted-foreground`; board renders only the recolor, no strikethrough.
10. **Closing color proximity:** gear-yellow `$cat-gear` (#e0c05a) and warning-amber `$warning` (#d9a73e) are close; on the board they never collide because GEAR always carries the backpack icon+label and amber only appears as the CLOSING pill with a timer icon (brief §3 watch-note holds true on this board).



## Open items (this board)

- AppHeader Actions cluster decision: the board deliberately omits SyncStatus/Search/Notifications/More (empty right side under space_between). Confirm whether the production desktop header stays wordmark-only or restores some/all actions; this section treats wordmark-only as authoritative per the screen.
- ViewTabs inactive tabs carry a stray 'stroke: $primary' with no strokeWidth (dangling prop / extraction noise). Recommend dropping it; inactive tabs should have no stroke. Confirm during component consolidation.
- NavCard inactive/default/hover variants are not present on this board (only active/selected). Source those states from the dedicated Sidebar/mission boards during consolidation.
- Voice command surface integration gap: VoiceFAB, RecordingPanel, and Toast (a P0 product surface) are ABSENT from this desktop board. The Category view in production must compose VoiceFAB + Toast; their contract must be sourced from the dedicated voice board, not here.
- Global radius token = 0 yet the NavCard cliff chip forces cornerRadius 999 — inconsistent rounding across the board (sharp chrome vs pill chip). Confirm intended radius policy for chips/badges.
- SidebarHeader on this board is label-only ('MISSIONS') with no mission count; other boards show a count (e.g. '04'). Decide whether the count belongs in the canonical SidebarHeader.
- NavCard cliff-chip color is warning here vs a bureaucratic-colored sample in the canonical def. Confirm the cliff chip color is window-state-derived (open/closing/closed/not-yet), not category-derived.
- StatTile size drift: screen renders Val at 22px but canonical Cmp·StatTile is 30px and MissionSummaryCard is 20px — verification must pick one canonical size (screen says 22px) and decide whether MissionDetailHeader inlines tiles or refs Cmp·StatTile
- Target date format: screen uses sentence-case + human date ('Target: 27 Apr 2026'); canonical uses uppercase ISO ('TARGET: 2026-04-27') — confirm which propagates to the shared MissionDetailHeader contract across all boards
- ProgressBar: no explicit 'remaining' segment frame on the board (empty track only) — decide whether the canonical component renders an explicit remaining/total segment or relies on the track fill
- CategoryGroupHeader has no Lucide category icon though design-brief §6 mandates icon+label+color redundancy — confirm the group header intentionally omits the icon (screen authoritative) vs adding it for CVD safety
- Empty/zero StatTile and all-done ProgressBar states are not exercised on this board — source those states from another board or define from canonical
- Cross-board: this header omits the live status dot + LOCATION line present on the Timeline/Dependencies renditions of MissionDetailHeader — reconcile whether those are state/variant additions of the same component
- Canonical identity unresolved: board task rows are named 'Card' (Cmp·Card tree) and collide with canonical TaskCard — consolidation must decide which component these resolve to and unify node names (Inner/Col vs Body, Status vs Touch44>Cycle, Pill vs Win).
- Missing 44px Touch44 hit area around the Status box — accessibility/interaction gap to add.
- OPEN window rendering undefined: board shows bare date (DONE) or no pill (IN_PROGRESS) and never an explicit 'OPEN' label/icon — spec must define the OPEN pill.
- DONE + window-pill combination not exercised on this board — does a DONE task suppress its window pill or show both?
- WindowStatePill is bare (no border/cornerRadius) on board vs canonical bordered pill (stroke $border, 999) — reconcile pill chrome and whether OPEN/CLOSING/CLOSED/NOT_YET share one component with BLOCKED/StatusBadge.
- CategoryTag sharp (cornerRadius 0) vs canonical 999 pill, while NavCard chip keeps 999 — pick one radius policy (global radius=0 token likely wins).
- DependencyCaption ('Dep' line) is net-new with no canonical component — define a contract (single vs plural blockers, ⚠ glyph vs lucide icon).
- Three card dim recipes (1.0 / 0.6 / 0.55) and the left-only 2px accent are net-new vs canonical uniform 1px border — formalize a single state->recipe mapping (note closed uniquely changes fill to $muted).
- Brief §10 DONE line-through not rendered on board — decide whether to add strikethrough or keep recolor-only.
- BLOCKED status color is $muted-foreground (not red) on the card, but the MissionDetailHeader BLOCKED stat tile is $destructive — note the two BLOCKED color treatments coexist on the same board.

## Coverage checklist (verification targets)

- [ ] AppHeader (eP5PE): muted fill, [20,32] padding, 1px $border bottom rule, space_between/center, Wordmark (OPS $primary + BOARD $muted-foreground, JetBrains Mono 16/700/ls4); right Actions cluster omitted (decision noted).
- [ ] Layout grid: root 1320x1640 $background; Screen vertical = Header (full width, hug) / Body (fill/fill horizontal) = Sidebar 280 | Main fill; Main vertical = DetailHeader / Tabs / Content; chrome rules = inner 1px $border (header-bottom, sidebar-right, tabs-bottom).
- [ ] Sidebar (veqHp): 280px fixed, $muted fill, 1px right border, clip, SidebarHeader (padding 18, 'MISSIONS' $muted-foreground-subtle mono 11/700/ls2), MissionList (gap 8, padding [0,8]).
- [ ] NavCard active/selected (FqzB7): #ff6b351f fill + 1px $primary border, padding 14, gap 8; Name 'AfrikaBurn 2026' ($foreground DM Sans 16/600); Count '3/11 tasks' ($muted-foreground mono 12); cliff Chip.
- [ ] NavCard cliff-chip (eUD9e): cornerRadius 999, #d9a73e1f fill, padding [2,7], timer icon 11x11 $warning + 'T-3d' $warning mono 11/600.
- [ ] ViewTabs (XncOx): muted bar, 1px $border bottom rule, gap 28, padding [0,32]; 3 tabs each padding [14,0], mono 12/700/ls1.5; active BY CATEGORY ($primary text + 2px $primary underline); inactive TIMELINE + DEPENDENCIES ($muted-foreground, no underline, stray $primary stroke noted).
- [ ] All states in scope: AppHeader default; Sidebar default+scroll-implied; NavCard active/selected + warning cliff-chip; ViewTabs active + inactive.
- [ ] Interactions: NavCard selection (navigation), ViewTabs switching (navigation), read-only chrome (no mutating controls).
- [ ] Data/logic: NavCard name/count/derived cliff chip; single-select mission drives Main; fixed 3-view tab set with single active; derived layout (280 sidebar + 1040 fill main).
- [ ] Tokens enumerated: $background, $muted, $border, $primary, $muted-foreground, $muted-foreground-subtle, $foreground, $warning, plus tints #ff6b351f and #d9a73e1f; type families DM Sans (mission name) vs JetBrains Mono (all chrome labels).
- [ ] Divergences from canonical recorded per component (AppHeader Actions omission, ViewTabs stray stroke, NavCard single instance + warning chip color + forced pill radius, Sidebar 1-vs-3 NavCards / no count).
- [ ] Open items: Actions-cluster decision, inactive-tab stray stroke, missing NavCard inactive states, absent VoiceFAB/Toast integration, radius inconsistency, SidebarHeader count, cliff-chip color semantics.
- [ ] MissionDetailHeader frame: width fill, layout vertical, gap 16, padding [24,32], bottom border $border 1px inner, transparent fill
- [ ] Title: 'AfrikaBurn 2026', DM Sans 26/700, $foreground
- [ ] Target line: 'Target: 27 Apr 2026', JetBrains Mono 13/normal, $muted-foreground (sentence-case + human date format documented)
- [ ] Stats row: horizontal gap 32, order DONE→BLOCKED→CLOSING→TOTAL
- [ ] StatTile Val: JetBrains Mono 22/700; per-tile color DONE=$success/BLOCKED=$destructive/CLOSING=$warning/TOTAL=$foreground; values 3/3/2/11
- [ ] StatTile Lab: JetBrains Mono 11/600 ls1.5 $muted-foreground-subtle (constant)
- [ ] StatTile nesting documented as bespoke vertical gap:3 frame (not Cmp·StatTile ref) — divergence captured
- [ ] ProgressBar: 4px track $card-elevated clip, 3 segments Done266 $success / Closing178 $warning / Blocked266 $destructive, remainder = empty track
- [ ] ProgressBar width=hardcoded-px divergence + 3:2:3 ratio mapping captured
- [ ] CategoryGroupHeader structure: gap 8, alignItems center, Dot(8×8 ellipse) + GLabel + GCount
- [ ] Group→color mapping all 5: medical/bureaucratic/travel/gear/tech → $cat-* tokens (hex values listed)
- [ ] GLabel: JetBrains Mono 12/700 ls1.5, $cat-* (same token as dot)
- [ ] GCount: JetBrains Mono 12/normal $muted-foreground-subtle; values 2/4, 0/3, 1/2, 0/1, 0/1
- [ ] Content list: width fill, vertical, gap 26, padding [20,32]
- [ ] Group ordering: medical, bureaucratic, travel, gear, tech
- [ ] Per-group internal gaps: Group gap 12 (header→list), List gap 10 (card→card)
- [ ] Per-group card counts (4,3,2,1,1 = 11) and done/total consistency vs stats documented
- [ ] All states in scope enumerated (4 StatTile tones, partial ProgressBar, 5 category headers, zero vs non-zero counts)
- [ ] Interactions = none (read-only) stated
- [ ] Divergences vs canonical StatTile/ProgressBar/CategoryGroupHeader/MissionDetailHeader documented
- [ ] Full token inventory for the scope listed
- [ ] All 11 TaskCard instances enumerated with id, group, task name, status, window-state/overlay, card recipe, and TaskName fill (§3 table).
- [ ] Status indicator (StatusCycleButton target) fully specced: 18x18, strokeWidth 2, all 3 variants (NOT_STARTED empty / IN_PROGRESS #ff6b351f+◼ 9px / DONE $success+✓ 11px) with exact tokens and glyph fonts (§4).
- [ ] CategoryTag fully specced across all 5 categories: fill /12 hex, padding [3,8], gap 5, icon 12x12, label 11px/600 ls0.5, lucide icon per category (§5).
- [ ] WindowStatePill semantics fully enumerated incl. the overload: OPEN (bare date), CLOSING (timer/$warning/T-Nd), CLOSED (circle-x + WINDOW CLOSED + date), NOT_YET (lock + NOT YET + starts date), BLOCKED (triangle-alert + BLOCKED), and pill-absent on IN_PROGRESS (§6).
- [ ] BLOCKED overload documented: rendered through Pill slot + opacity 0.6 + the '⚠ blocked by: {name}' Dep caption with exact contents for #4/#5/#9 (§6.5).
- [ ] Left-accent border + opacity recipes table: neutral (1px $border, 1.0), closing (left-2 $warning, 1.0), blocked/not-yet (left-2 $muted-foreground-subtle, 0.6), closed ($muted fill + left-2 $muted-foreground, 0.55) (§7).
- [ ] Layout structure top->bottom with exact px/gaps/padding/tokens (§2).
- [ ] Interactions: tap-to-cycle on Status box, always-enabled guard, no other interactions, no 44px wrapper (§8).
- [ ] Data/logic contracts: status/window_state/blocked derivation, precedence, countdown, date formats, dependency lookup, group counts reconciling to 11 (§9).
- [ ] Divergence-vs-canonical documented per component (node identity, missing Touch44, glyph-vs-shape, sharp-vs-pill tag, bare-vs-bordered pill, OPEN-no-pill, BLOCKED conflation, three dim recipes, no DONE line-through, gear/warning color proximity) (§10 + component_usages).
- [ ] State-matrix gaps explicitly listed (combinations NOT present on this board) for verification (§3).
- [ ] Exact literal strings captured: task names, 'CLOSING · T-5d'/'T-3d', 'WINDOW CLOSED', 'NOT YET'/'starts 10 Jun', dates '15 Mar'/'1 Apr'/'20 Mar'/'5 Apr', '⚠ blocked by: ...', glyphs ✓/◼/⚠.