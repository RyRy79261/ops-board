# Surface Spec — Dependencies view (desktop) (`b1b079`) · P0

*Source: `docs/design-extract/boards/b1b079__*.json` (screen authoritative). 3 scoped sections.*

# Dependencies View — Shared App Shell (Header, Sidebar, Mission Detail Header, View Tabs)

*scope: shell-nav (AppHeader / SyncStatus / Sidebar / NavCard / WindowStatePill-summary / StatTile / ProgressBar / ViewTabs)*

## Dependencies View — Shared App Shell

> Scope: the persistent, view-agnostic chrome of board `b1b079` (`OpsBoard — Dependencies view (desktop)`) **as rendered**. Covers the Top Header (wordmark + SyncStatus), the 280px Sidebar (MISSIONS list of NavCards + window-summary chips), the MissionDetailHeader (title, target line, 4 StatTiles, 3-segment ProgressBar) and the ViewTabs strip. The Dependencies tree/content body below the tabs is **out of scope** (separate agent). Screens are authoritative; canonical-component drift is noted INFORMATIONALLY per the source-of-truth rule.

### 0. Purpose

This shell is the read-only mission-planner frame shared by all three views (Category / Timeline / Dependencies). It establishes: (1) operator/session identity + live status (Top Header), (2) the mission selector and per-mission window-state summary (Sidebar), (3) the active mission's at-a-glance status block (MissionDetailHeader), and (4) view switching (ViewTabs). The only interactive affordances in this scope are **mission selection** (NavCard) and **view switching** (ViewTabs); everything else is a status display. The on-board active mission is **AfrikaBurn 2026** and the active view is **DEPENDENCIES**.

### 1. Frame & global layout (top → bottom)

Root frame `b1b079`: `1320 × 1160`, `fill $background` (#0a0a0c), `layout vertical`, `clip true`. Two vertical children:

1. **Top Header** (`N2vuPn`) — `fill_container × 52`, fixed height.
2. **Body Row** (`evC0A`) — `fill_container × fill_container` (fills remaining 1108px), horizontal, two children: **Sidebar** (`T1DKYO`, 280px) + **Main Column** (`IOmEw`, fill).

The Main Column is itself `layout vertical` and stacks: **Detail Header** (`Wh3QA`) → **View Tabs** (`TeBTH`, 46px) → **Dependencies Content** (`L0KTW`, out of scope). So the shell forms the canonical 3-zone grid: full-width 52px header band / 280px left rail / fill main, with the main divided into detail-header + tab-strip + scroll body. All horizontal dividers are inner-aligned `$border` (#2a2a38) hairlines on the bottom/right edge of the owning frame (not separate divider nodes).

Global radius token = `0`; all rectangular surfaces are sharp-cornered. The only rounded shapes in scope are status/category/live dots (`ellipse`) and pill chips (`cornerRadius 999`).

### 2. Top Header (AppHeader as rendered) — `N2vuPn`

- Frame: `width fill_container`, `height 52`, `fill $background`, `stroke $border` `strokeWidth { bottom: 1 }` inner, `padding [0, 24]` (0 vertical / 24 horizontal), `justifyContent space_between`, `alignItems center`. Two children pinned left/right.
- **Wordmark** (`TJpbr`, left, `alignItems center`, no gap → glyphs abut):
  - `OPS` (`hAx2W`): `fill $primary` (#ff6b35), `JetBrains Mono 16 / 700`, `letterSpacing 1`.
  - `BOARD` (`KrJtV`): `fill $muted-foreground` (#7a7a8e), `JetBrains Mono 16 / 700`, `letterSpacing 1`.
- **Header Right / SyncStatus cluster** (`trEcu`, `gap 10`, `alignItems center`), three inline atoms left→right:
  - **Operator label** (`AFovT`): `"SOLO OPERATOR"`, `fill $muted-foreground-subtle` (#4a4a5e), `JetBrains Mono 11 / normal`, `letterSpacing 1`.
  - **Live Dot** (`zbHJW`): `ellipse 6×6`, `fill $success` (#5ae07a). This is the "connected / live" indicator.
  - **Date** (`xXCWs`): `"03 JUN 2026"`, `fill $muted-foreground` (#7a7a8e), `JetBrains Mono 11 / normal`, `letterSpacing 1`. Matches `currentDate` 2026-06-03, rendered `DD MON YYYY` uppercase.

### 3. Sidebar (Sidebar + NavCard ×4 + WindowStatePill summary chips) — `T1DKYO`

- Frame: `width 280` (fixed, flex-shrink-0), `height fill_container`, `fill $muted` (#131318), `stroke $border` `strokeWidth { right: 1 }` inner, `layout vertical`, `gap 16`, `padding 16`, `clip true`.
- **Missions Head** (`l15rrt`): `width fill_container`, `justifyContent space_between`, `alignItems center`.
  - Label (`cPO6M`): `"MISSIONS"`, `$muted-foreground`, `JetBrains Mono 11 / normal`, `letterSpacing 1.5`.
  - Count (`DlA6i`): `"04"`, `$muted-foreground-subtle`, `JetBrains Mono 11 / normal`, `letterSpacing 1` — zero-padded total mission count.
- **Mission List** (`hmI4C`): `width fill_container`, `layout vertical`, `gap 8`. Four NavCards.

**NavCard shared anatomy** (each is a `frame width fill_container`, `layout vertical`, `gap 8`, `padding [12, 14]`, `strokeAlignment inner`): a **Top** row (`justifyContent space_between`, `gap 8`, `alignItems center`) = mission **Name** (DM Sans 14 / 600, `textGrowth fixed-width`, `width fill_container`) + **Count** (`{done}/{total}`, `JetBrains Mono 12 / normal`, `letterSpacing 0.5`), then a **Window Chip** (the per-mission window-summary pill).

**Window Chip shared anatomy** (`fill $muted`, `cornerRadius 999`, `stroke {color} 1` inner, `gap 6`, `padding [3, 8]`, `alignItems center`): a `6×6` ellipse **Dot** + a mono caps **Chip Label** (`JetBrains Mono 10 / normal`, `letterSpacing 0.8`); Dot fill and Label fill share the chip's semantic color.

The four NavCards enumerate every distinguishing state:

| # | id | Name | State (selection) | Card fill | Card stroke | Name fill | Count | Count fill | Chip dot+text color | Chip label |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `IQz8F` | AfrikaBurn 2026 | **ACTIVE/SELECTED** | `$card-elevated` (#22222e) | `$primary` `strokeWidth { left: 3 }` (left accent bar) | `$foreground` | `4/10` | `$foreground` | `$warning` (#d9a73e) | `1 CLOSED · 2 CLOSING` |
| 2 | `cWhAR` | Patagonia Trek | inactive | `$muted` | `$border` (full hairline) | `$card-foreground` (#e8e8f0) | `8/12` | `$muted-foreground` | `$muted-foreground` | `ON TRACK` |
| 3 | `SQtWe` | Tokyo Marathon | inactive (complete) | `$muted` | `$border` | `$card-foreground` | `12/12` | `$muted-foreground` | `$success` (#5ae07a) | `COMPLETE` |
| 4 | `Pi9AX` | Passport Renewal | inactive (open) | `$muted` | `$border` | `$card-foreground` | `2/5` | `$muted-foreground` | `$cat-bureaucratic` (#5aa0e0) | `3 OPEN` |

This board surfaces **four distinct window-summary chip variants**: warning-mixed (`1 CLOSED · 2 CLOSING`), neutral on-track (`ON TRACK`), success-complete (`COMPLETE`), and a category-tinted open-count (`3 OPEN`). The active card is differentiated by three simultaneous cues: elevated fill `$card-elevated`, a 3px left `$primary` accent stroke (replacing the inactive full `$border` hairline), and a brighter `$foreground` count (vs `$muted-foreground` on inactive cards). Active-card chip text/border is NOT primary — it carries the mission's own window state (`$warning`).

### 4. Mission Detail Header (MissionDetailHeader) — `Wh3QA`

- Frame: `width fill_container`, `fill $background`, `stroke $border` `strokeWidth { bottom: 1 }` inner, `layout vertical`, `gap 18`, `padding 24` (all sides). Three stacked children.

**4a. Title Row** (`W3wCDA`, vertical, `gap 6`):
- **Title** (`K2mivY`): `"AfrikaBurn 2026"`, `$foreground`, `DM Sans 24 / 700`. (Mirrors the active NavCard name — title tracks selected mission.)
- **Target** (`UIq3l`, horizontal, `gap 8`, `alignItems center`):
  - Flag icon (`rIJnP`): lucide `flag`, `13×13`, `fill $muted-foreground`.
  - Target Date (`v3BA3`): `"TARGET: 27 APR 2026 · 328 DAYS OUT"`, `$muted-foreground`, `JetBrains Mono 12 / normal`, `letterSpacing 0.8`. Format = `TARGET: {DD MON YYYY} · {N} DAYS OUT`, uppercase. This is the real-world event date (the mission target), NOT a task cliff.

**4b. Stats Row** (`Z2ZYE`, horizontal, `gap 36`) — four StatTiles, each a vertical frame `gap 4` with a Label + Value:

| Tile id | Label | Label fill | Value | Value fill | Value semantics |
|---|---|---|---|---|---|
| `lLKcH` | `DONE` | `$muted-foreground` | `4` | `$success` (#5ae07a) | completed task count |
| `p31a7B` | `BLOCKED` | `$muted-foreground` | `2` | `$destructive` (#e05a5a) | dependency-blocked count (computed) |
| `XESZE` | `CLOSING` | `$muted-foreground` | `2` | `$warning` (#d9a73e) | windows ≤7d from cliff |
| `TQKqp` | `TOTAL` | `$muted-foreground` | `10` | `$foreground` (#e8e8f0) | total tasks in mission |

All labels: `JetBrains Mono 10 / normal`, `letterSpacing 1.2`. All values: `JetBrains Mono 20 / 700`. The four tiles are color-coded by role: success/destructive/warning/neutral. Note `DONE 4` + `TOTAL 10` corresponds to the active NavCard count `4/10`.

**4c. Progress Bar (ProgressBar)** — `xLPwD`:
- Track frame: `width fill_container`, `height 4`, `fill $muted` (#131318), `gap 2` (the gap creates 2px seam gaps between segments). Three child segments, left→right:
  - **Done Seg** (`Y0WZK`): `width 376`, `height fill_container`, `fill $success`.
  - **Active Seg** (`J1xSN`): `width 118`, `height fill_container`, `fill $primary` (#ff6b35).
  - **Remaining Seg** (`A9PI0`): `width fill_container` (absorbs remainder), `height fill_container`, `fill $border` (#2a2a38).
- As rendered the three segments encode done (success) / in-progress-or-active (primary) / remaining (border-grey). Widths are absolute px (376 / 118 / fill) — a flattened snapshot, not computed in the data; a build must derive segment fractions from counts.

### 5. View Tabs (ViewTabs) — `TeBTH`

- Frame: `width fill_container`, `height 46`, `fill $background`, `stroke $border` `strokeWidth { bottom: 1 }` inner, `gap 28`, `padding [0, 24]`, `alignItems center`. Three tab items, horizontal.
- Each tab is a frame `height fill_container`, `padding [0, 2]`, `alignItems center`, containing one mono Tab Label (`JetBrains Mono 12 / normal`, `letterSpacing 1`).

| Tab id | Label | State | Tab-label fill | stroke on tab frame |
|---|---|---|---|---|
| `mshPj` | `BY CATEGORY` | inactive | `$muted-foreground` | `stroke $primary` (no strokeWidth — see drift) |
| `KzOCQ` | `TIMELINE` | inactive | `$muted-foreground` | `stroke $primary` (no strokeWidth — see drift) |
| `goJMt` | `DEPENDENCIES` | **ACTIVE** | `$foreground` | `stroke $primary` `strokeWidth { bottom: 2 }` inner (underline) |

The active tab is signalled by two cues: a 2px bottom `$primary` underline and a brighter `$foreground` label (vs `$muted-foreground` inactive). On THIS board DEPENDENCIES is active (consistent with the board's purpose).

### 6. States enumerated (this scope)

- **SyncStatus:** one state rendered — live/connected (`$success` dot + `SOLO OPERATOR` + date). No offline/syncing variant on this board.
- **NavCard:** 2 selection states rendered — active (`IQz8F`) and inactive (×3). Hover/focus not capturable from a static board (see open items).
- **Window-summary chip:** 4 color variants rendered — warning-mixed, neutral on-track, success-complete, category-open. The chip semantic color is independent of NavCard selection.
- **StatTile:** 4 role variants — success / destructive / warning / neutral.
- **ProgressBar:** 3 segments (done/active/remaining); single populated configuration shown (no all-done or empty variant on this board).
- **ViewTabs:** 2 states — active (1) and inactive (2).

### 7. Interactions (this scope)

- **NavCard tap** → select that mission as the active detail context; updates the Title Row, Target line, StatTiles, ProgressBar and view content. Active card adopts `$card-elevated` fill + 3px `$primary` left accent + `$foreground` count. (Read-only otherwise — no create/edit/delete.)
- **ViewTabs tap** → switch the main content view among BY CATEGORY / TIMELINE / DEPENDENCIES; moves the 2px `$primary` underline + brightens the active label to `$foreground`. Does not change the selected mission.
- **Top Header, StatTiles, ProgressBar, summary chips:** non-interactive status displays.

### 8. Data / logic contracts (this scope)

- **Operator label / Live dot:** session identity (`SOLO OPERATOR`) + live-connection indicator. Dot color implies connection health; only `$success` (live) shown.
- **Header date:** current local date, `DD MON YYYY` uppercase.
- **MISSIONS count `04`:** total mission count, zero-padded width-2.
- **NavCard count `{done}/{total}`:** completed vs total tasks per mission (e.g. AfrikaBurn `4/10`, Tokyo `12/12` = complete).
- **Window-summary chip:** a per-mission aggregate of child-task window states. Observed encodings: a mixed roll-up (`1 CLOSED · 2 CLOSING`, colored to the most-urgent member → warning), a healthy roll-up (`ON TRACK`, neutral), a fully-complete roll-up (`COMPLETE`, success, when `done == total`), and an open-count (`3 OPEN`, category-tinted). The chip color tracks the most-urgent contained window state; full mission completion overrides to success `COMPLETE`.
- **Title / Target:** title = selected mission name; target = the mission's real-world event date + a live `{N} DAYS OUT` countdown derived from current date (327→328 days for 2026-06-03 → 2026-04-27 next-year window).
- **StatTiles:** DONE = count(status done); TOTAL = count(all tasks); CLOSING = count(window-state closing, cliff ≤ `CLOSING_THRESHOLD_DAYS = 7`); BLOCKED = count(tasks computed blocked from the dependency graph — `blocked` is derived, never stored). The board's `BLOCKED 2` is consistent with the Dependencies-tree body showing two blocked rows.
- **ProgressBar:** three measures over the `$muted` track — done (success) / active (primary, in-progress) / remaining (border). Segment widths must be computed from counts at build time (the board's 376/118/fill px are a flattened render).
- **ViewTabs:** exactly one active view; selection is client navigation state, not persisted task data.

### 9. As-rendered divergence from canonical / design-brief (INFORMATIONAL)

- **AppHeader Actions cluster:** canonical AppHeader carries an Actions cluster (SyncStatus + Search + Notifications + More). This board's Top Header renders ONLY the wordmark (left) + the SyncStatus triad (operator / live dot / date) on the right; Search / Notifications / More are absent. The screen is authoritative → the desktop AppHeader's right side is the SyncStatus triad alone.
- **Header height/padding:** rendered `52px` height, `padding [0, 24]`. Design-brief §11 specifies ~61px / `20px 32px` / `bg-muted`. Board uses `fill $background` (not `$muted`) and tighter metrics. Screen wins.
- **Sidebar fill:** rendered `$muted` (#131318) — matches the brief's "header/sidebar muted surface". Sidebar header `MISSIONS` is `normal` weight (brief implies eyebrow 700). Sidebar carries a **Count `04`** in the header (not in the brief). 4 NavCards rendered (canonical samples showed 1–3).
- **NavCard active accent:** rendered as a **3px solid `$primary` left stroke** + `$card-elevated` fill (not `bg-primary/12 + border-primary` as the brief's "active" state suggests). The accent is a left bar, not a full tinted card. Screen authoritative.
- **NavCard meta = chip + raw `{done}/{total}` (no "tasks" word):** brief specifies a window-summary chip + `{done}/{total} tasks`. Board drops the word "tasks" and places the count in the Top row (not beside the chip). The window-summary chip taxonomy on-board (`1 CLOSED · 2 CLOSING`, `ON TRACK`, `COMPLETE`, `3 OPEN`) is richer/different than the brief's example (`T-12d`).
- **WindowStatePill (summary form):** the NavCard chips are bordered pills (`cornerRadius 999`, `stroke {semantic} 1`, `fill $muted`, dot + caps label) — consistent with a canonical bordered WindowStatePill, UNLIKE the bare un-bordered task-row pills in the content body (out of scope here). So the *summary* chip and the *task-row* pill diverge from each other within the same board.
- **StatTile:** rendered as bespoke vertical frames named DONE/BLOCKED/CLOSING/TOTAL with **value fontSize 20 / 700** and `gap 4`; they are NOT `StatTile` refs. Triage notes the canonical StatTile value is 30px (and a MissionSummaryCard variant uses 20) — three sizes exist across the system; THIS board's render is 20px. Stats row `gap 36` (brief says 24px). Screen authoritative → MissionDetailHeader StatTile value = 20/700, gap 36.
- **Target format:** rendered `TARGET: 27 APR 2026 · 328 DAYS OUT` (uppercase, human `DD MON YYYY`, with a live days-out countdown). Triage notes canonical used ISO `TARGET: 2026-04-27`; brief used sentence-case `Target: {date}`. Board adds the `· {N} DAYS OUT` countdown segment. Screen authoritative.
- **ProgressBar track:** rendered over `$muted` (#131318) with a `$border` remaining segment; brief specifies a `card-elevated` track and a 3-segment success/warning/destructive (closing/blocked) treatment. Board's three segments are success(done)/primary(active)/border(remaining) — i.e. an "active/in-progress" middle segment, NOT the brief's amber-closing+destructive-blocked composition. Significant semantic divergence; screen authoritative for the rendered Dependencies header.
- **ViewTabs stray stroke:** the two INACTIVE tabs (`mshPj`, `KzOCQ`) carry a `stroke: $primary` with **no strokeWidth** — likely an extraction artifact / stray prop (canonical inactive tabs have no stroke). Only the active tab (`goJMt`) has a real `strokeWidth { bottom: 2 }`. Treat inactive tabs as un-underlined; the stray `$primary` stroke should not render. Tab `gap 28`, `padding [0, 24]`; brief implies a SegmentedControl — board renders a plain underline tab strip.

### 10. Token reference (resolved, this scope)

`$background` #0a0a0c · `$muted` #131318 · `$card-elevated` #22222e · `$border` #2a2a38 · `$primary` #ff6b35 · `$foreground` #e8e8f0 · `$card-foreground` #e8e8f0 · `$muted-foreground` #7a7a8e · `$muted-foreground-subtle` #4a4a5e · `$success` #5ae07a · `$warning` #d9a73e · `$destructive` #e05a5a · `$cat-bureaucratic` #5aa0e0 · `radius` 0. Fonts: JetBrains Mono (all chrome/labels/counts/chips/tabs/stats), DM Sans (mission title + NavCard names only).

# Dependencies View — Dependency Tree Organism (DependencyTreeNode, DependencyConnector, StatusCycleButton)

*scope: Dependencies organism — DependencyTreeNode / DependencyConnector / StatusCycleButton*

## Dependencies View — Dependency Tree Organism

**Board:** `b1b079` — "OpsBoard — Dependencies view (desktop)" (1320 × 1160, `$background`).
**Scope:** the `Tree` organism (`E3MHw`) and its `Unlinked List` (`KwWIo`) inside `Dependencies Content` (`L0KTW`). Covers DependencyTreeNode row anatomy, depth/indent encoding, DependencyConnector (normal vs critical-path) + the CRITICAL PATH legend, the StatusCycleButton tri-state + blocked treatment, the done/blocked glyph behavior, and cycle-safe + depth rendering. The persistent shell (header, sidebar, detail header, view tabs) is specced elsewhere; only the content head, the tree, and the unlinked section are authoritative here.

> SOURCE-OF-TRUTH: the screen is authoritative. Where the rendered nodes diverge from the canonical DependencyTreeNode / DependencyConnector / StatusCycleButton / WindowStatePill / CategoryTag defs (and from `design-brief.md` §9/§10/§14), the screen wins and the canonical contract must widen toward it. Divergences are documented per-component, not reconciled here.

---

### Purpose

The Dependencies view renders the mission's tasks as a hand-rolled indented dependency tree (NOT a graph library): roots first, then recursive children indented by depth, joined by `corner-down-right` connector glyphs. The critical path (the longest chain to the mission target) is highlighted by recoloring its connectors to `$primary` (orange). Tasks with no dependency edges are pulled out below into an `UNLINKED` section as flat cards. Like the rest of the board this surface is READ-ONLY; the only direct interaction is tapping a row's StatusCycleButton (the 18×18 `Status` box) to cycle status. `blocked` is NOT a stored status — it is derived from the dependency graph and rendered as a `triangle-alert` glyph + a `blocked by: {name}` reason line + a `BLOCKED` pill.

---

### Layout (top → bottom, exact px / tokens / structure)

**`Dependencies Content` (`L0KTW`)** — the scroll region under the view tabs.
- `fill $background`, `clip: true`, `width fill_container`, `height fill_container`, `layout vertical`, `gap 14`, `padding 24`.
- Children in order: `Content Head` → `Tree` → `Unlinked Head` → `Unlinked List`.

**1. `Content Head` (`WQ7Ou`)** — row, `width fill_container`, `justifyContent space_between`, `alignItems center`.
- Left eyebrow `Label` (`JG33a`): text `"DEPENDENCY TREE"`, JetBrains Mono 11 / weight normal / letterSpacing 1.5, fill `$muted-foreground`.
- Right **`Legend` (`PUTGY`)** — the CRITICAL PATH key: row, `gap 8`, `alignItems center`:
  - `icon` `Conn` (`azaWQ`): lucide `corner-down-right`, 14×14, fill `$primary`.
  - `text` `Legend Label` (`fouO9`): `"CRITICAL PATH"`, JetBrains Mono 10 / normal / letterSpacing 1, fill `$primary`.

**2. `Tree` (`E3MHw`)** — `width fill_container`, `layout vertical`, `gap 10`. Holds 8 `Row · {task}` frames (the DependencyTreeNodes), in this exact order:
1. `Row · Pass fitness assessment` (`x8lUd7`) — depth 0 (root)
2. `Row · Complete medical-team brief` (`GwoxO`) — depth 1, non-critical
3. `Row · Lock vaccination certificate` (`r4roRc`) — depth 2, non-critical
4. `Row · Research visa requirements` (`h3Zqy`) — depth 0 (root)
5. `Row · Submit visa application` (`MbSmE`) — depth 1, critical-path
6. `Row · Collect passport with visa` (`PRkvq`) — depth 2, critical-path, BLOCKED
7. `Row · Book flights to Cape Town` (`X1Om0X`) — depth 0 (root)
8. `Row · Confirm desert convoy slot` (`jWYJQ`) — depth 1, non-critical, BLOCKED

**Row outer frame** (every `Row · …`): `width fill_container`, `alignItems center`, default horizontal layout (no explicit gap; the indent/connector children sit flush before the Card). Children, left→right: `[Indent?] [Connector?] Card`.

**Depth / indent encoding (exact):**
- **Depth 0 (root):** outer row = `[Card]` only. No `Indent`, no `Connector`.
- **Depth 1:** outer row = `[Connector(36×38)] [Card]`. One connector, no spacer.
- **Depth 2:** outer row = `[Indent(36×1)] [Connector(36×38)] [Card]`. One 36px-wide spacer frame precedes the connector.
- Indentation is therefore `depth × 36px`: each depth level adds one fixed **36px** lead block (an `Indent` spacer `36×1` for ancestor levels, then the `Connector` `36×38` at the node's own edge). The 38px connector height roughly matches the Card row height so the glyph centers vertically against the card.

**`Indent` spacer** (`jKi6W`, `GBSVr`): empty `frame`, `width 36`, `height 1`, no fill/stroke — pure horizontal spacer.

**`Connector` (`gtvCL`, `t3RLGv`, `SE8nt`, `annQn`, `OhnIh`)** — DependencyConnector: `frame` `width 36`, `height 38`, `justifyContent center`, `alignItems center`, holding one `icon` `Glyph` (18×18, lucide `corner-down-right`). Fill encodes critical-path (see DependencyConnector below).

**`Card` (the row body, e.g. `QBr0n`, `bMg0j`)** — `width fill_container`, `gap 16`, `padding [12,14]`, `alignItems center`, `stroke $border` / `strokeWidth 1` / `strokeAlignment inner`, `cornerRadius 0` (sharp — global `radius=0`). `fill` is `$card` for normal rows and **`$muted` for blocked rows** (`wKWqv`, `Xk9EU`). Children: `Left` (fill_container) + `Right`.
- **`Left`** (`tBKTF` etc.): `width fill_container`, `gap 12`, `alignItems center`. Children: `Status` (the 18×18 StatusCycleButton box, or a bare `triangle-alert` icon when blocked) + **`Name Group`**.
- **`Name Group`** (`U77zvN`, `IEZ7R`, …): `layout vertical`, `gap 3`, `width fill_container`. Hosts the `Name` text and, when blocked, an extra `Blocked By` row beneath it. This vertical Name Group nesting is the structural slot that makes the optional reason line possible.
  - **`Name`** text: DM Sans 14 / weight **500**, `textGrowth fixed-width`, `width fill_container`. Fill = `$foreground` for active rows; **`$muted-foreground` for DONE rows AND for blocked rows** (dimmed).
  - **`Blocked By`** (`X1ZdA`, `S1EaE`) — only on blocked rows: row, `gap 6`, `alignItems center`, two mono texts both fill `$muted-foreground-subtle`:
    - `NotYet`: `"NOT YET ·"`, JetBrains Mono 10 / normal / letterSpacing 0.8.
    - `Blocker`: `"blocked by: {name}"` (e.g. `"blocked by: Submit visa application"`, `"blocked by: Book flights to Cape Town"`), JetBrains Mono 10 / normal / letterSpacing 0.5.
- **`Right`** (`K1xOme` etc.): `gap 10`, `alignItems center`. Children: `Cat Tag` (always) + optional `Pill`.
  - **`Cat Tag`**: `gap 6`, `alignItems center` = `Dot` (ellipse 7×7) + `Icon` (lucide 13×13) + `Label` (JetBrains Mono 11 / normal / letterSpacing 0.8). Colors per category token (see CategoryTag below). On blocked rows the entire tag is recolored to `$muted-foreground` (greyed).
  - **`Pill`** (WindowStatePill, optional): `fill $muted`, `cornerRadius 999`, `strokeWidth 1` / inner, `gap 5`, `padding [3,8]`, `alignItems center` = `Icon` (lucide 11×11, except OPEN uses `circle` 9×9) + `Label` (JetBrains Mono 10 / normal / letterSpacing 0.8). Stroke + icon + label recolor by state.

**3. `Unlinked Head` (`NxFse`)** — section divider after the tree: row, `gap 8`, `padding [10,0,0,0]` (10px top), `alignItems center`:
- `icon` `Nbioj`: lucide `unlink`, 13×13, fill `$muted-foreground-subtle`.
- `text` `Label` (`s0Zeb`): `"UNLINKED"`, JetBrains Mono 11 / normal / letterSpacing 1.5, fill `$muted-foreground`.
- `text` `Count` (`DeP20`): `"· 2 TASKS · NO DEPENDENCIES"`, JetBrains Mono 11 / normal / letterSpacing 1, fill `$muted-foreground-subtle`.

**4. `Unlinked List` (`KwWIo`)** — `width fill_container`, `layout vertical`, `gap 10`. Two FLAT cards (no Indent, no Connector, NO Name Group wrapper — `Name` is a direct child of `Left`):
- `Card · Pack dust-proof gear kit` (`L7dhk`): NOT_STARTED status box; GEAR cat tag (`$cat-gear`, `backpack`); Pill `OPEN`.
- `Card · Charge solar power station` (`Q60nTN`): DONE status box (check); name `$muted-foreground`; TECH cat tag (`$cat-tech`, `zap`); **no Pill**.

---

### DependencyConnector — normal vs critical-path

The connector is the `corner-down-right` (↳) lucide glyph in a `36×38` frame, present on every depth ≥ 1 node. The ONLY visual difference between normal and critical-path is the glyph `fill`:

| Variant | Glyph fill token | Glyph hex | Rows (ids) |
|---|---|---|---|
| **Normal** | `$muted-foreground-subtle` | `#4a4a5e` | Complete medical-team brief (`PlSBk`), Lock vaccination certificate (`VYqED`), Confirm desert convoy slot (`j8JOJT`) |
| **Critical-path** | `$primary` | `#ff6b35` | Submit visa application (`ZRR9o`), Collect passport with visa (`dEMly`) |

Glyph is always lucide `corner-down-right`, 18×18, in a center-justified 36×38 frame. The **CRITICAL PATH legend** (`PUTGY`) in the Content Head is the orange key for this encoding: same `corner-down-right` icon at 14×14 in `$primary` + the `"CRITICAL PATH"` label in `$primary`. The critical chain on this board is the visa thread: `Research visa requirements (root, DONE)` → `Submit visa application (critical, in-progress)` → `Collect passport with visa (critical, BLOCKED)` — all critical edges are orange; the medical and travel chains use the subtle-grey normal connector.

---

### StatusCycleButton — tri-state + blocked treatment

The `Status` element (first child of `Left`) is the tap-to-cycle control. It renders in four distinct appearances across this board — three stored statuses plus the derived blocked substitution:

| Status | Element | Box | Inner glyph | Tokens | Rows |
|---|---|---|---|---|---|
| **done** | `frame` 18×18 | `stroke $success` / `strokeWidth 1.5` / inner, centered | `icon` lucide `check` 12×12, fill `$success` | success border + success check | Pass fitness assessment (`ARDFc`), Research visa requirements (`dZPrA`), Charge solar power station (`F4cjwZ`) |
| **in-progress** | `frame` 18×18 | `stroke $primary` / `1.5` / inner, centered | `rectangle` `Fill` 8×8, fill `$primary` | primary border + primary square | Complete medical-team brief (`Q54TVw`), Submit visa application (`BxWq8`), Book flights to Cape Town (`k6X0wH`) |
| **not-started** | `frame` 18×18 | `stroke $border-hover` / `1.5` / inner | none (empty) | border-hover stroke only | Lock vaccination certificate (`IMPTU`), Pack dust-proof gear kit (`jfjYy`) |
| **blocked** (derived) | `icon` 18×18 | — (no box frame) | lucide `triangle-alert`, fill `$warning` | warning glyph replaces the box entirely | Collect passport with visa (`v16xZG`), Confirm desert convoy slot (`JTgEm`) |

- All status boxes are sharp 18×18 squares (`cornerRadius 0`), `strokeWidth 1.5`, inner alignment.
- **done glyph behavior:** DONE rows pair a `$success` check box with the `Name` dimmed to `$muted-foreground`. NOTE: the screen does NOT apply CSS `line-through` to the name — the design-brief calls for `line-through` on done names (§10) but the rendered node uses color-dim only. (Divergence — screen authoritative: no strikethrough present.)
- **blocked substitution:** on blocked rows the 18×18 box is replaced by a bare `triangle-alert` warning icon (no border box, no fill). `blocked` is derived from the dependency graph (not a stored status), so it pre-empts the status-box rendering.
- The brief's guard rule (button always enabled; window-state/blocked are advisory, never gating) is not visually expressible in a static node tree but governs the interaction (see Interactions).

---

### Row state combinations enumerated (all 10 rows)

| # | Task | Depth | Indent | Connector | Status | Name fill | Card fill | Blocked-by line | Cat Tag | Pill |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Pass fitness assessment | 0 root | — | — | done (check/`$success`) | `$muted-foreground` | `$card` | — | MEDICAL (`$cat-medical`, `heart-pulse`) | none |
| 2 | Complete medical-team brief | 1 | — | normal (subtle) | in-progress (primary sq) | `$foreground` | `$card` | — | MEDICAL | CLOSING · 9D (warning, `timer`) |
| 3 | Lock vaccination certificate | 2 | 36×1 | normal (subtle) | not-started (empty/border-hover) | `$foreground` | `$card` | — | MEDICAL | none |
| 4 | Research visa requirements | 0 root | — | — | done (check) | `$muted-foreground` | `$card` | — | BUREAUCRATIC (`$cat-bureaucratic`, `file-text`) | none |
| 5 | Submit visa application | 1 | — | **critical** (primary) | in-progress (primary sq) | `$foreground` | `$card` | — | BUREAUCRATIC | CLOSING · 4D (warning, `timer`) |
| 6 | Collect passport with visa | 2 | 36×1 | **critical** (primary) | **blocked** (triangle-alert/warning) | `$muted-foreground` | **`$muted`** | NOT YET · blocked by: Submit visa application | BUREAUCRATIC **dimmed** (`$muted-foreground`) | BLOCKED (muted, `lock`) |
| 7 | Book flights to Cape Town | 0 root | — | — | in-progress (primary sq) | `$foreground` | `$card` | — | TRAVEL (`$cat-travel`, `plane`) | WINDOW CLOSED (**destructive**, `lock`) |
| 8 | Confirm desert convoy slot | 1 | — | normal (subtle) | **blocked** (triangle-alert/warning) | `$muted-foreground` | **`$muted`** | NOT YET · blocked by: Book flights to Cape Town | TRAVEL **dimmed** (`$muted-foreground`) | BLOCKED (muted, `lock`) |
| 9 | Pack dust-proof gear kit (UNLINKED) | flat | — | — | not-started (empty/border-hover) | `$foreground` | `$card` | — | GEAR (`$cat-gear`, `backpack`) | OPEN (success, `circle` 9×9) |
| 10 | Charge solar power station (UNLINKED) | flat | — | — | done (check) | `$muted-foreground` | `$card` | — | TECH (`$cat-tech`, `zap`) | none |

**Pill (WindowStatePill) variants on this board** (`fill $muted`, `cornerRadius 999`, `strokeWidth 1`, `padding [3,8]`, `gap 5`):
- **CLOSING · 9D / CLOSING · 4D** — stroke + icon + label `$warning`; icon lucide `timer` 11×11; label JetBrains Mono 10.
- **WINDOW CLOSED** — stroke + icon + label `$destructive`; icon lucide `lock` 11×11.
- **BLOCKED** — stroke + icon + label `$muted-foreground`; icon lucide `lock` 11×11.
- **OPEN** — stroke + icon + label `$success`; icon lucide `circle` 9×9 (note: 9×9, not 11×11).

**CategoryTag variants** (`Dot` 7×7 + `Icon` 13×13 + `Label` mono 11): MEDICAL `$cat-medical`/`heart-pulse`; BUREAUCRATIC `$cat-bureaucratic`/`file-text`; TRAVEL `$cat-travel`/`plane`; GEAR `$cat-gear`/`backpack`; TECH `$cat-tech`/`zap`. Blocked rows render dot+icon+label all in `$muted-foreground`.

---

### Cycle-safe + depth rendering behavior (data/logic contract)

- **Tree build:** roots = tasks with no incoming dependency edge within the mission; render roots first, then DFS children. Each child row carries a `corner-down-right` connector; the lead block width = `depth × 36px` (composed of `Indent` 36×1 spacers for ancestor depths + the node's own `Connector` 36×38). Observed max depth = 2.
- **Cycle-safe rendering (brief §9 states):** a dependency cycle must not loop forever — render each node ONCE and mark the back-edge (do not recurse into an already-visited node). This board contains no cycle, so no back-edge marker is exercised here; the renderer must still guard against it (visited-set).
- **Critical path:** the longest chain to the mission target; its connectors recolor to `$primary` and are keyed by the CRITICAL PATH legend. Optional feature per brief §15 (open question: ship vs defer) — present here, so treat as in-scope.
- **blocked derivation:** `blocked` is computed from the graph (a task is blocked when an upstream dependency it requires is not done), NOT stored. It substitutes the StatusCycleButton box with `triangle-alert`, dims the card (`fill $muted`, name + cat tag to muted), adds the `NOT YET · blocked by: {blocker name}` reason line, and shows a `BLOCKED` pill. Window-state precedence (brief §9): `closed > not-yet(blocked) > not-yet(not_before) > closing > open`.
- **Unlinked partition:** tasks with no dependency edges (neither parent nor child) are removed from the tree and listed flat under `UNLINKED`; the header count (`2 TASKS`) is derived from that set.
- **Stat coupling (context):** the detail header tiles (DONE 4 / BLOCKED 2 / CLOSING 2 / TOTAL 10) summarize the mission; on this board BLOCKED=2 matches the two `triangle-alert` rows, CLOSING=2 matches the two CLOSING pills.

---

### Interactions

- **Tap StatusCycleButton** (the 18×18 `Status` box) → cycle `not-started → in-progress → done → not-started` (wrapping). The ONLY direct interaction on this surface.
- **Always-enabled guard:** the button is always tappable — blocked/closed/closing are advisory, never gating; a blocked task's `triangle-alert` glyph is still a live cycle target (cycling resolves once upstream facts change). The brief mandates a **44px touch target** around the 18×18 box — NOT present in the node tree (see open items).
- **No hover/expand/collapse, no drag, no edit** affordances on rows; the tree is static and read-only. Mission/dependency edits happen via voice/MCP, not here.
- Connectors, indents, legend, and the unlinked header are non-interactive display elements.

---

This section fully covers: the Dependencies content head + CRITICAL PATH legend, the 8-node DependencyTree + 2-node Unlinked list anatomy, depth/36px-indent encoding, DependencyConnector normal vs critical, the StatusCycleButton tri-state + blocked substitution, done glyph behavior, the blocked reason line, WindowStatePill + CategoryTag as used on rows, and the cycle-safe/depth/blocked-derivation logic contracts.

# Per-Task Content — TaskCard, CategoryTag, WindowStatePill, Blocked-By Line & Unlinked Group (Dependencies / desktop, b1b079)

*scope: Task card content: window-state, category, blocked-by + unlinked group*

## Per-Task Content — TaskCard, CategoryTag, WindowStatePill, Blocked-By Line & Unlinked Group

**Board:** `b1b079` — OpsBoard — Dependencies view (desktop). **Scope:** the per-task content that is rendered identically inside both the dependency **tree rows** and the **unlinked cards** at the bottom of the Dependencies content pane. This section owns the inner anatomy of a task (TaskCard body, CategoryTag, WindowStatePill, the "NOT YET · blocked by:{name}" reason line) plus the `UnlinkedGroupHeader` and the two unlinked card variants. The StatusCycleButton/tri-state square, the tree connectors/indents, the critical-path legend, and the app shell/sidebar/detail-header are spec'd by the sibling agents — referenced here only where they share the card frame.

> **Authority rule applied:** the screen is authoritative. Where the rendering diverges from design-brief §9 (window-state model) / §10 (status model), the divergence is documented as informational drift and the canonical component contract is to be widened toward the screen in the later consolidation phase — it is NOT corrected here.

---

### 1. Purpose

A single reusable **task content block** that states, in one horizontal strip, *what the task is, what kind of work it is, and the live window state* — read-only. It is the repeating unit of every list/tree view. On this board it appears 10 times: 8 as the `Card` child of a tree `Row` and 2 as flat `Card`s under the Unlinked group. The same block must serve four window states and a blocked/not-yet reason line, so it carries an **optional Name-Group wrapper** (present only when a reason line is needed) and an **optional WindowStatePill** (absent when the window is OPEN-and-uninteresting, present otherwise).

---

### 2. TaskCard — layout (exact, top-level → leaves)

All 10 cards share the same outer `Card` frame and the same `Left` / `Right` split:

- **Card frame** (`type:frame`, name `Card`): `width: fill_container`, `fill: $card` (`#1a1a22`) for normal cards / `fill: $muted` (`#131318`) for blocked cards (see §6), `stroke: $border` (`#2a2a38`), `strokeWidth: 1`, `strokeAlignment: inner`, `cornerRadius: 0` (global `--radius: 0`, sharp), horizontal layout, `gap: 16`, `padding: [12, 14]` (12 vertical / 14 horizontal), `alignItems: center`. In tree rows the Card is the trailing, `fill_container` sibling of the Connector/Indent (see tree-organism spec); in unlinked cards the Card *is* the row.
- **`Left` frame**: `width: fill_container`, horizontal, `gap: 12`, `alignItems: center`. Holds the StatusCycleButton/status glyph (18×18, owned by status spec) followed by the task name.
  - **Tree rows:** name is wrapped in a **`Name Group`** frame — `width: fill_container`, vertical layout, `gap: 3` — whose first child is the **Name** text and whose optional second child is the **Blocked By** line (§5). The vertical group + 3px gap exist solely to stack the reason line under the name.
  - **Unlinked cards:** there is **no `Name Group`** wrapper — the **Name** text is a *direct child* of `Left` (unlinked tasks have no dependencies, therefore never a blocked-by line). This is a genuine structural divergence between the two card shapes that must reconcile to one component with an optional reason slot (§9 drift D1).
- **Name** text: `fontFamily: DM Sans`, `fontSize: 14`, `fontWeight: 500`, `textGrowth: fixed-width`, `width: fill_container`. Fill is state-dependent: `$foreground` (`#e8e8f0`) for in-progress / not-started; `$muted-foreground` (`#7a7a8e`) for done **and** for blocked/not-yet rows. No `line-through` is applied on any row (drift D5).
- **`Right` frame**: horizontal, `gap: 10`, `alignItems: center`. Holds the `Cat Tag` (CategoryTag, §4) always, followed by the `Pill` (WindowStatePill, §3) when present. The pill is omitted on done tree rows and on done unlinked cards (§3.5).

**Two TaskCard archetypes on one board** (both must collapse to one contract):
| | Tree-row Card | Unlinked Card |
|---|---|---|
| Outer frame | `Card` inside `Row` (after Connector/Indent) | `Card` direct in `Unlinked List` |
| Name nesting | `Left › Name Group(vertical,gap 3) › Name [+ Blocked By]` | `Left › Name` (flat) |
| Reason line | optional (blocked rows) | never |
| Examples | `bMg0j`, `wKWqv`, `Xk9EU` | `L7dhk`, `Q60nTN` |

---

### 3. WindowStatePill (the `Pill` frame) — full rendered set

A pill badge in the `Right` frame communicating the live, computed window state. **Shared chrome:** `fill: $muted` (`#131318`), `cornerRadius: 999` (pill), `strokeWidth: 1`, `strokeAlignment: inner`, `gap: 5`, `padding: [3, 8]`, `alignItems: center`; an icon (Lucide) + a mono label. Label text is always `fontFamily: JetBrains Mono`, `fontSize: 10`, `fontWeight: normal`, `letterSpacing: 0.8`. The **stroke color, icon, icon size, icon name, and label color all track one shared state token** (single source — never split color across channels). Four distinct states render on this board:

**3.1 CLOSING · {n}D** — window closing (cliff ≤ 7d, §9 `closing`)
- Token: `$warning` (`#d9a73e`). Stroke `$warning`, icon fill `$warning`, label fill `$warning`.
- Icon: Lucide **`timer`**, `11×11`. Label content: literal `CLOSING · 9D` (node `MpkW7`, on *Complete medical-team brief*) and `CLOSING · 4D` (node `hKzZP`, on *Submit visa application*).
- Label encodes the cliff distance as `CLOSING · {n}D` where `{n}` = whole days until the `too_late_by` cliff. Two instances prove the `{n}` is data-driven (9 vs 4).

**3.2 WINDOW CLOSED** — window closed (past cliff, §9 `closed`)
- Token: `$destructive` (`#e05a5a`). Stroke `$destructive`, icon fill `$destructive`, label fill `$destructive`.
- Icon: Lucide **`lock`**, `11×11`. Label content: literal `WINDOW CLOSED` (node `oRFbh`, on *Book flights to Cape Town*).

**3.3 BLOCKED** — derived blocked / not-yet (§9 `not-yet · blocked`)
- Token: `$muted-foreground` (`#7a7a8e`). Stroke `$muted-foreground`, icon fill `$muted-foreground`, label fill `$muted-foreground`.
- Icon: Lucide **`lock`**, `11×11`. Label content: literal `BLOCKED` (nodes `oir88` on *Collect passport with visa*, `eENXX` on *Confirm desert convoy slot*).
- This pill co-occurs with the §5 reason line, the greyed CategoryTag (§4.4), the `$muted` card fill, and the `triangle-alert` status glyph (status spec). It is the muted/no-panic-red treatment.

**3.4 OPEN** — window open & healthy (§9 `open`)
- Token: `$success` (`#5ae07a`). Stroke `$success`, icon fill `$success`, label fill `$success`.
- Icon: Lucide **`circle`**, `9×9` (note: 9px here, not 11px — the only pill with an undersized icon). Label content: literal `OPEN` (node `z00Xfb`, on the unlinked *Pack dust-proof gear kit*).
- Appears **only once** on this board, on a not-started unlinked card. It is rendered as an explicit positive cue (success-green) rather than the brief's "absence = healthy" default.

**3.5 No pill (absent)** — the implicit fifth state
- Done tasks render **no `Pill`** at all: tree rows *Pass fitness assessment* (`x8lUd7`), *Research visa requirements* (`h3Zqy`); unlinked card *Charge solar power station* (`Q60nTN`). The `Right` frame then contains only the `Cat Tag`.
- This is an inconsistency to flag: a not-started unlinked task gets an explicit `OPEN` pill (3.4) while done tasks get nothing — the "OPEN/healthy" cue is shown in one place and omitted in another (§9 drift D6). The contract must define exactly when the pill is suppressed (proposal: suppress for `done`; show `OPEN` optionally).

**WindowStatePill matrix (as rendered on b1b079):**
| State | Stroke/Icon/Label token | Icon (Lucide) | Icon px | Label literal | Node(s) |
|---|---|---|---|---|---|
| closing | `$warning` | `timer` | 11 | `CLOSING · 9D` | `MpkW7` |
| closing | `$warning` | `timer` | 11 | `CLOSING · 4D` | `hKzZP` |
| closed | `$destructive` | `lock` | 11 | `WINDOW CLOSED` | `oRFbh` |
| blocked | `$muted-foreground` | `lock` | 11 | `BLOCKED` | `oir88`, `eENXX` |
| open | `$success` | `circle` | 9 | `OPEN` | `z00Xfb` |
| (none) | — | — | — | — | done rows/cards |

---

### 4. CategoryTag (the `Cat Tag` frame) — 5 hues + greyed-when-blocked

A horizontal `Cat Tag` frame, always the first child of `Right`: `gap: 6`, `alignItems: center`. Three children, all sharing one color token:
1. **Dot** — `type: ellipse`, `7×7`, `fill: $cat-{x}`.
2. **Icon** — Lucide, `13×13`, `fill: $cat-{x}`.
3. **Label** — `fontFamily: JetBrains Mono`, `fontSize: 11`, `fontWeight: normal`, `letterSpacing: 0.8`, `fill: $cat-{x}`, uppercase literal.

**The five seeded category hues as rendered on this board:**
| Category | Token | Hex | Lucide icon | Label literal | Example node |
|---|---|---|---|---|---|
| medical | `$cat-medical` | `#e05a9f` | `heart-pulse` | `MEDICAL` | `O6nxh`, `FmCyh`, `gemgO` |
| bureaucratic | `$cat-bureaucratic` | `#5aa0e0` | `file-text` | `BUREAUCRATIC` | `YTQoj`, `C65AYk` |
| travel | `$cat-travel` | `#5ae0a0` | `plane` | `TRAVEL` | `pFX5A` |
| gear | `$cat-gear` | `#e0c05a` | `backpack` | `GEAR` | `mNQRh` |
| tech | `$cat-tech` | `#a05ae0` | `zap` | `TECH` | `X6VNX0` |

**Icon-name divergence vs design-brief §4 (informational):** the brief names `Stethoscope` for medical, but the board renders **`heart-pulse`**; the brief names `Cpu` for tech, the board renders **`zap`**. The brief's `FileText`→`file-text`, `Plane`→`plane`, `Backpack`→`backpack` all match. Screen is authoritative: medical = `heart-pulse`, tech = `zap` (§9 drift D7). The tag is fill-only — there is no background tint chip on this board (the brief's `bg-cat-x/12` fill is not present in the tree/unlinked rendering; the tag sits directly on the card).

**4.4 Greyed-when-blocked variant.** On blocked/not-yet rows the CategoryTag drops its hue entirely and renders in `$muted-foreground` (`#7a7a8e`) across all three children — dot, icon, *and* label — while keeping the same category icon glyph:
- *Collect passport with visa* (`dht51`): `file-text` glyph kept, but dot/icon/label all `$muted-foreground` (BUREAUCRATIC, greyed).
- *Confirm desert convoy slot* (`VZVZp`): `plane` glyph kept, dot/icon/label all `$muted-foreground` (TRAVEL, greyed).
This is the same dimming logic as the `$muted` card fill and muted Name — the entire blocked row is desaturated to muted, color reserved for live/actionable tasks. The category *identity* is preserved (icon + label text), only the *hue* is suppressed. The CategoryTag contract therefore needs a `muted`/`dimmed` boolean (or to consume an `isBlocked` prop) that overrides the hue token.

---

### 5. The "NOT YET · blocked by:{name}" reason line

A `Blocked By` frame, the **optional second child of `Name Group`** (tree rows only), stacked 3px under the Name. Frame: `gap: 6`, `alignItems: center`. Two text children, both `fontFamily: JetBrains Mono`, `fontSize: 10`, `fontWeight: normal`, `fill: $muted-foreground-subtle` (`#4a4a5e`):
1. **NotYet** — literal `NOT YET ·`, `letterSpacing: 0.8`.
2. **Blocker** — literal `blocked by: {name}`, `letterSpacing: 0.5` (note: the prefix tracks at 0.8, the blocker name at 0.5 — tighter for the variable name).

Rendered instances:
- `X1ZdA`: `NOT YET ·` + `blocked by: Submit visa application` (on *Collect passport with visa*).
- `S1EaE`: `NOT YET ·` + `blocked by: Book flights to Cape Town` (on *Confirm desert convoy slot*).

**Contract:** the `{name}` is the name of the **first/nearest unsatisfied upstream dependency** (the immediate parent in the dependency tree whose status ≠ done). The line is rendered iff the task is in the derived `not-yet · blocked` state. It is purely informational text (read-only), `$muted-foreground-subtle` (the most-dimmed text token) so it never competes with the live Name. The brief §9 specifies the reason format as `⚠ blocked by: {names}` (plural, with a leading warning glyph) — the board uses a split `NOT YET ·` + `blocked by: {single name}` with **no inline ⚠ glyph** (the AlertTriangle lives on the status square instead) and a **single** blocker name (§9 drift D3). Screen is authoritative: two-span line, no glyph, single nearest blocker.

---

### 6. Blocked/not-yet card treatment (whole-card, summarised)

When a task is blocked the whole card shifts to the muted register — these properties travel together and define the not-yet treatment as rendered:
- Card `fill: $muted` (`#131318`) instead of `$card`.
- Status glyph: bare Lucide `triangle-alert` (`18×18`, `$warning`) replacing the 18px square StatusCycleButton (owned by status spec; flagged there as drift D2 — button should remain, always-enabled).
- Name fill `$muted-foreground` (not foreground).
- `Blocked By` reason line present (§5).
- CategoryTag greyed to `$muted-foreground` (§4.4).
- WindowStatePill `BLOCKED` (muted, lock) (§3.3).
- No `line-through` on the name (§9 drift D5). No reduced opacity attribute on the frame (the brief's `opacity 0.6` for not-yet is achieved purely via muted token swaps here, not an alpha).

---

### 7. UnlinkedGroupHeader (`Unlinked Head`)

A section divider separating dependency-less tasks from the tree. Frame `NxFse`: `width: fill_container`, horizontal, `gap: 8`, `padding: [10, 0, 0, 0]` (10px top only), `alignItems: center`. Three children:
1. **Icon** (`Nbioj`): Lucide **`unlink`**, `13×13`, `fill: $muted-foreground-subtle` (`#4a4a5e`).
2. **Label** (`s0Zeb`): literal `UNLINKED`, mono, `fontSize: 11`, `letterSpacing: 1.5`, `fill: $muted-foreground` (`#7a7a8e`).
3. **Count** (`DeP20`): literal `· 2 TASKS · NO DEPENDENCIES`, mono, `fontSize: 11`, `letterSpacing: 1`, `fill: $muted-foreground-subtle` (`#4a4a5e`).

**Contract:** `{n} TASKS` count = number of tasks in the mission with no dependency edges (no parents and no children in the dependency graph). The trailing `· NO DEPENDENCIES` is a static descriptor. The header renders only when ≥1 unlinked task exists; it carries no count badge beyond the inline text. Distinct from a `CategoryGroupHeader` (which is absent on this view) — the dimming hierarchy is intentional: icon (most subtle) → label (muted) → count (most subtle).

---

### 8. The two unlinked card variants (`Unlinked List`)

`Unlinked List` (`KwWIo`): `width: fill_container`, vertical, `gap: 10`. Holds exactly 2 flat TaskCards (no Connector, no Indent, no Name Group — see §2).

**8.1 Variant A — not-started + OPEN** (`L7dhk`, *Pack dust-proof gear kit*)
- Card `fill: $card`.
- Status: 18px square, `stroke: $border-hover` (`#3a3a4a`), `strokeWidth: 1.5`, empty interior (not-started).
- Name `$foreground`, direct child of `Left` (no Name Group).
- CategoryTag: `$cat-gear`, `backpack`, `GEAR`.
- WindowStatePill: `OPEN` (success, `circle` 9×9) — §3.4.

**8.2 Variant B — done + no pill** (`Q60nTN`, *Charge solar power station*)
- Card `fill: $card`.
- Status: 18px square, `stroke: $success`, `strokeWidth: 1.5`, child Lucide `check` (`12×12`, `$success`) — done.
- Name `$muted-foreground` (done-dim), direct child of `Left`, **no** line-through.
- CategoryTag: `$cat-tech`, `zap`, `TECH`.
- **No** WindowStatePill.

The two variants establish the OPEN-pill-vs-no-pill inconsistency (§3.5 / drift D6) within a single 2-card list: same component, one shows an explicit window pill, the other shows none.

---

### 9. Data & logic contracts

- **Window state is computed, never stored** (§9). Inputs: `too_late_by` cliff, `not_before`, dependency-graph satisfaction. `CLOSING_THRESHOLD_DAYS = 7`. Precedence `closed > not-yet(blocked) > not-yet(not_before) > closing > open`. The `Pill` variant, the card fill, the reason line presence, and the CategoryTag muting are all derived from this single computed state.
- **`CLOSING · {n}D`** `{n}` = whole days remaining to the cliff (rendered 9, 4). **`WINDOW CLOSED`** = cliff is past local end-of-day. **`BLOCKED`** = derived from ≥1 upstream dependency with status ≠ done. **`OPEN`** = none of the above and the task is actionable.
- **`blocked by: {name}`** = name of the nearest unsatisfied upstream dependency; on this board each blocked task shows exactly one blocker name.
- **Category** is stored per task (one of the 5 seeded hues). CategoryTag hue is suppressed to `$muted-foreground` iff window state ∈ {blocked/not-yet} (and, by the dimming pattern, would also dim for closed) — icon glyph + label text are preserved regardless.
- **Pill suppression:** absent for `done`. (Open is shown explicitly in one observed case; the contract must decide whether OPEN is always shown for non-done-actionable tasks or only as a positive cue — flagged open item.)
- **Read-only.** None of the elements in this scope are interactive. The only interaction on the card is the StatusCycleButton (status spec). CategoryTag, WindowStatePill, the reason line, and the UnlinkedGroupHeader carry no click/hover affordance.

---

### 10. Interactions

- **CategoryTag / WindowStatePill / Blocked-By line / UnlinkedGroupHeader:** none — all are read-only display.
- **TaskCard as a whole:** no card-level click target; the sole affordance is the StatusCycleButton/status glyph at the left (owned by status spec). Note the blocked rows render a non-interactive `triangle-alert` glyph in the button's slot (drift D2: per §10 the cycle button should remain present and always-enabled even when blocked, since window/blocked are advisory-never-gating).

---

### 11. State inventory covered by this scope

- WindowStatePill: **closing** (×2: 9D, 4D), **closed** (×1), **blocked** (×2), **open** (×1), **absent/none** (×3 done).
- CategoryTag: 5 hues (medical, bureaucratic, travel, gear, tech) + **greyed-when-blocked** (×2).
- Blocked-By reason line: present (×2) / absent (all non-blocked).
- TaskCard structural shapes: Name-Group-wrapped (tree) / flat (unlinked).
- UnlinkedGroupHeader: with-count (×1).
- Unlinked cards: not-started+OPEN, done+no-pill.

(Status-square tri-state, connectors/indents/critical-path, and the app shell/sidebar/detail-header are intentionally out of scope — owned by sibling agents.)


## Open items (this board)

- AppHeader Actions cluster (Search/Notifications/More) is absent on the desktop board — confirm whether the desktop header intentionally drops these or the board is incomplete. Screen-as-authoritative implies wordmark + SyncStatus only.
- SyncStatus has only the live (success) state on this board — offline/syncing/error variants and any icon are undefined here.
- ViewTabs inactive tabs carry a stray 'stroke: $primary' with no strokeWidth (likely extraction artifact). Confirm inactive tabs render no underline.
- NavCard and ViewTabs hover/focus/active-press states are not capturable from a static board; define interaction states at build.
- ProgressBar rendered composition (success/primary-active/border) diverges from the brief's success/warning-closing/destructive-blocked. Decide whether the Dependencies-view ProgressBar uses the 'active/in-progress' middle segment (as rendered) or the brief's closing/blocked composition — reconcile in component consolidation.
- StatTile value size = 20px here but canonical=30px and MissionSummaryCard=20px (three sizes). Consolidation must pick one StatTile value scale.
- Target date format diverges three ways (board 'TARGET: 27 APR 2026 · 328 DAYS OUT' vs canonical ISO vs brief sentence-case). Decide canonical target format including whether the live DAYS OUT countdown is part of it.
- Window-summary chip taxonomy ('1 CLOSED · 2 CLOSING' / 'ON TRACK' / 'COMPLETE' / '3 OPEN') needs a defined generation rule and how it differs from per-task WindowStatePill semantics; reconcile against brief's 'T-12d' example.
- StatusCycleButton omits the canonical 44px Touch44 accessible touch target wrapper — the tap area is only the 18×18 box. Build must add the 44px hit area.
- done rows use color-dim only (Name → $muted-foreground); brief §10 mandates line-through on done task names. No strikethrough is present in the screen — confirm whether to add line-through in build or follow the screen.
- BLOCKED is rendered through the window-state pill with a 'lock' icon + $muted-foreground, conflating it with not_before/lock semantics; brief §9 assigns blocked a triangle-alert icon (used on the status box) and treats it as a not-yet window state. Reconcile blocked-as-status vs blocked-as-window and the lock-vs-triangle icon mapping.
- CLOSING · 9D exceeds the documented CLOSING_THRESHOLD_DAYS = 7; either the threshold or the sample data is inconsistent — flag for data review (not a layout decision).
- BLOCKED detail-tile color ($destructive) diverges from the row blocked treatment ($warning glyph + $muted pill) and from brief §9 ('blocked is muted, not red'). Pick one canonical color channel.
- CategoryTag renders as a flat dot+icon+label with no bg chip; brief §11 calls for a bg-cat-x/12 Badge. Decide flat-tag vs badge as canonical.
- The DependencyConnector glyph is 'corner-down-right' (↳); the brief writes the connector as '↓'. Confirm the canonical glyph.
- Inactive tabs carry stroke:$primary with no strokeWidth (dangling prop / likely extraction noise) — flag for cleanup in the shell spec (out of this scope, noted for completeness).
- Critical-path highlight is a brief §15 open question (ship in MVP vs defer); it is rendered on this board, so the build should treat it as in-scope unless the operator defers.
- TaskCard structural reconciliation: tree rows wrap Name in a 'Name Group' (vertical, gap 3) to host the optional Blocked-By line; unlinked cards put Name directly in 'Left'. Canonical component must unify to one shape with an optional reason slot + optional pill slot.
- Pill suppression rule for OPEN: an explicit OPEN pill ($success/circle) is rendered on a not-started unlinked task, while done tasks render no pill at all. Define exactly when the pill is shown vs suppressed (proposal: suppress for done; OPEN optional positive cue).
- Window-pill color/icon drift vs §9 must be resolved bidirectionally: closing uses 'timer' (not Clock) + 'CLOSING · {n}D' (not 'T-{n}d'); closed uses $destructive + 'lock' (brief: muted + XCircle, struck-through card); blocked uses 'lock' (brief: AlertTriangle). Screen is authoritative — widen the contract toward the screen.
- Done/closed name strikethrough: brief §9/§10 require line-through on done names; the board applies none. Decide whether the contract drops strikethrough or the screen adds it.
- CategoryTag icon names: board uses 'heart-pulse' (medical) and 'zap' (tech) vs brief's Stethoscope/Cpu. Screen authoritative — update canonical category icon table.
- CategoryTag has no bg-cat-x/12 tint chip on this board (fill-only tag); brief §7 mandates 12% tint. Decide whether the tag carries a tint background in the consolidated contract.
- Blocked-By reason line: single nearest blocker name with no leading ⚠ glyph (brief specifies '⚠ blocked by: {names}', plural). Confirm single-vs-multiple blocker rendering for the contract.
- StatusCycleButton blocked substitution (triangle-alert replacing the square) — coordinate with status-spec agent; per §10 the button must remain present and always-enabled.

## Coverage checklist (verification targets)

- [ ] Top Header / AppHeader: frame metrics (52px, padding [0,24], bottom border), wordmark OPS/BOARD exact type+tokens, full SyncStatus triad (operator/live dot/date) exact values
- [ ] SyncStatus: operator label, live dot ($success 6×6), date format/token — single live state documented + missing variants flagged
- [ ] Sidebar: 280px frame, fill $muted, right border, padding/gap, MISSIONS eyebrow + count 04
- [ ] NavCard: shared anatomy (Top row + Window Chip), active vs inactive differentiation (fill/left-accent/count color), all 4 instances tabulated with names/counts/states
- [ ] Window-summary chip (WindowStatePill summary form): bordered-pill anatomy + all 4 color variants enumerated with semantics
- [ ] MissionDetailHeader: frame (padding 24, gap 18, bottom border), Title type, Target line (flag icon + exact string/format)
- [ ] StatTile: all 4 tiles (DONE/BLOCKED/CLOSING/TOTAL) with labels, values, role colors, exact type sizes + row gap
- [ ] ProgressBar: track + 3 segments with exact widths/tokens and semantics
- [ ] ViewTabs: strip metrics, all 3 tabs with active/inactive states, exact type/tokens, active underline
- [ ] All states in scope enumerated (SyncStatus 1, NavCard 2 + 4 chip variants, StatTile 4, ProgressBar 3-seg, ViewTabs 2)
- [ ] Interactions: NavCard select + ViewTabs switch + non-interactive displays
- [ ] Data/logic contracts: counts, chip roll-up, target countdown, StatTile derivations (incl. computed BLOCKED), ProgressBar fractions
- [ ] Divergence-from-canonical/brief documented per component (AppHeader actions, header metrics, NavCard accent, StatTile size/nesting, target format, ProgressBar composition, ViewTabs stray stroke)
- [ ] Resolved token reference for the scope
- [ ] Out-of-scope boundary stated (Dependencies tree/content body excluded)
- [ ] Content head: 'DEPENDENCY TREE' eyebrow + CRITICAL PATH legend (corner-down-right 14x14 $primary + label) — exact tokens/sizes
- [ ] DependencyTreeNode row anatomy: outer row → [Indent?][Connector?]Card → Left(Status + Name Group) + Right(Cat Tag + Pill), with all gaps/padding/strokes
- [ ] Name Group nesting and the optional 'NOT YET · blocked by: {name}' reason line (both mono 10 $muted-foreground-subtle)
- [ ] Depth/indent encoding: depth × 36px via 36×1 Indent spacers + 36×38 Connector; depths 0/1/2 enumerated
- [ ] DependencyConnector normal ($muted-foreground-subtle) vs critical-path ($primary) — exact rows for each variant + the legend key
- [ ] StatusCycleButton tri-state: done (success box+check), in-progress (primary box+8px square), not-started (empty border-hover box) with tokens
- [ ] StatusCycleButton blocked substitution: triangle-alert $warning replacing the box on derived-blocked rows
- [ ] done glyph behavior: $success check + name dimmed to $muted-foreground; strikethrough divergence flagged
- [ ] WindowStatePill variants on rows: CLOSING·9D, CLOSING·4D, WINDOW CLOSED, BLOCKED, OPEN — colors/icons/sizes
- [ ] CategoryTag variants: MEDICAL/BUREAUCRATIC/TRAVEL/GEAR/TECH (dot+icon+label) + blocked-dimmed treatment
- [ ] All 10 row state combinations enumerated in a single matrix (8 tree + 2 unlinked)
- [ ] Unlinked Head + Unlinked List: flat cards (no Name Group wrapper) — Pack dust-proof gear kit (OPEN) + Charge solar power station (done, no pill)
- [ ] Cycle-safe rendering requirement (render-once + back-edge marker / visited-set)
- [ ] blocked derivation logic + window-state precedence + always-enabled guard rule
- [ ] Interactions: tap-to-cycle as the only direct interaction; everything else read-only
- [ ] Per-component screen_divergence_from_canonical for DependencyTreeNode, DependencyConnector, StatusCycleButton, WindowStatePill, CategoryTag, and the net-new CRITICAL PATH legend
- [ ] TaskCard outer frame: exact fill ($card normal / $muted blocked), stroke ($border 1px inner), radius 0, gap 16, padding [12,14], alignItems center
- [ ] TaskCard Left/Right split with exact gaps (Left 12, Right 10)
- [ ] Name Group present (tree, vertical gap 3) vs absent (unlinked, flat) — the two structural archetypes
- [ ] Name text spec: DM Sans 14/500 fixed-width, fill $foreground (active) / $muted-foreground (done+blocked), no line-through
- [ ] CategoryTag full spec: dot 7x7, icon 13x13, label mono 11/0.8; all 5 hues with exact tokens + Lucide glyphs + labels
- [ ] CategoryTag greyed-when-blocked variant ($muted-foreground across dot/icon/label, glyph kept) on 2 rows
- [ ] CategoryTag icon-name divergence from §4 (heart-pulse vs Stethoscope; zap vs Cpu) flagged
- [ ] WindowStatePill chrome: fill $muted, cornerRadius 999, stroke 1px inner, gap 5, padding [3,8]; label mono 10/0.8
- [ ] WindowStatePill CLOSING · 9D and CLOSING · 4D ($warning, timer 11x11) — both data-driven instances
- [ ] WindowStatePill WINDOW CLOSED ($destructive, lock 11x11)
- [ ] WindowStatePill BLOCKED ($muted-foreground, lock 11x11) x2
- [ ] WindowStatePill OPEN ($success, circle 9x9) — note the 9px icon
- [ ] WindowStatePill absent/none on done tasks (x3) + the OPEN-shown-vs-omitted inconsistency
- [ ] All four §9 window-state divergences enumerated (icon + color + label format vs brief)
- [ ] Blocked-By reason line: 'NOT YET ·' + 'blocked by: {name}', $muted-foreground-subtle, mono 10, differing letterSpacing 0.8/0.5, both rendered instances
- [ ] Blocked-By divergence from brief (no ⚠ glyph, single blocker, split spans)
- [ ] Whole-card blocked treatment summary ($muted fill, muted name, triangle-alert glyph, greyed tag, BLOCKED pill, no opacity attr, no strikethrough)
- [ ] UnlinkedGroupHeader: unlink icon 13x13, UNLINKED label (ls 1.5), '· 2 TASKS · NO DEPENDENCIES' count, padding-top 10, exact tokens
- [ ] Unlinked card Variant A (not-started + OPEN, GEAR, $card, flat name)
- [ ] Unlinked card Variant B (done + no pill, TECH, $card, muted name)
- [ ] Data/logic contracts: computed window state, precedence, {n}D days, nearest-blocker name, category hue suppression, pill suppression, unlinked count
- [ ] Read-only interaction model + blocked status-glyph substitution drift note