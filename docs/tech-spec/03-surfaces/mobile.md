# Surface Spec — Mobile screens (`h9YSWg`) · P1

*Source: `docs/design-extract/boards/h9YSWg__*.json` (screen authoritative). 2 scoped sections.*

# Mobile Category Board — Shell & Chrome (~390px)

*scope: Agent A — Mobile Category Board: shell + chrome (header, mission summary, group headers, Voice FAB)*

## Mobile Category Board — Shell & Chrome (~390px)

> Scope: the mobile **Category Board** page shell as rendered on board `h9YSWg` (frame `jtnig`, "Mobile — Category Board"). Covers the page frame, the flattened **Mobile Header** (Wordmark + SyncStatus), the **Mission Summary card** (name, TARGET line, 4 inline StatTiles, 3-segment ProgressBar), the 5 **CategoryGroupHeaders**, and the idle **Voice FAB**. The interior **TaskCard** organism and its sub-components (StatusCycleButton, CategoryTag, WindowStatePill, BlockedBy) are owned by a sibling spec and are referenced here only as the content the group sections wrap.
>
> **Authority note:** per the source-of-truth rule, this screen IS the intended mobile design. Where the flattened rendering diverges from `design-brief.md` canonical component defs, the screen wins and those divergences are recorded as `screen_divergence_from_canonical` (informational, to be reconciled in consolidation), not as defects.

### 1. Purpose

A single, vertically-scrolling, read-only mission status display sized for a ~390px mobile viewport. It presents, top→bottom: brand + live-sync chrome, an at-a-glance mission summary (counts + progress against a target event date), then the mission's tasks bucketed into 5 category sections. A fixed circular Voice FAB floats bottom-right as the entry point to the (read-only board's) one input affordance — voice command. The board is a status surface; the only direct task interaction lives inside the TaskCards (tap StatusCycleButton), which is out of this section's scope.

### 2. Layout (exact, top → bottom)

**Page frame** `jtnig` — "Mobile — Category Board"
- `width: 390` (fixed). Height is content-driven (board art-frame is 1620 tall but the screen frame itself has no fixed height; it grows with content).
- `fill: $background` (`#0a0a0c`).
- `layout: vertical`, `gap: 24`, `padding: [24, 20, 40, 20]` (top 24 / right 20 / bottom 40 / left 20).
- `clip: true`.
- Resulting content column width = **350px** (390 − 20 − 20).
- Direct children, in order: `Header` → `Mission Summary` → `Tasks` → `Voice FAB` (FAB is absolutely positioned, removed from the vertical flow).

The page uses an outer 24px vertical gap between the three flow blocks (Header, Mission Summary, Tasks). The `Tasks` block uses its own internal `gap: 22` between category groups.

**2.1 Header** `WMJky`
- `width: fill_container` (350px), horizontal row, `justifyContent: space_between`, `alignItems: center`. No explicit fill, padding, height, or border — it is a bare flex row sitting inside the page padding (height = tallest child ≈ 18px line box).
- Left: **Wordmark** frame `Dhlx0` (default horizontal layout, no gap declared → tokens render adjacent): two mono text runs `OPS` ($primary) + `BOARD` ($muted-foreground).
- Right: **Sync** frame `NaKAX` (`gap: 6`, `alignItems: center`): a 6px success ellipse + `SYNCED` mono label.

**2.2 Mission Summary** `MnIYH`
- `width: fill_container` (350px), `fill: $card` (`#1a1a22`), `layout: vertical`, `gap: 14`, `padding: 16` (all sides). Sharp corners (global `radius: 0`; no `cornerRadius` set). Inner content width = **318px** (350 − 16 − 16).
- Children top→bottom: Mission name → Target line → Stats row → Progress bar.
  - **Mission name** `G6U6O`: DM Sans 17 / 600, `$foreground`, `"AfrikaBurn 2026 · Tankwa Karoo"`.
  - **Target** `gDdMC`: JetBrains Mono 11 / 500, letterSpacing 1, `$muted-foreground`, `"TARGET: 2026-04-27"`.
  - **Stats** `vbDnI`: horizontal row, `width: fill_container`, `gap: 16`, 4 inline stat tiles (left-aligned, not space-between).
  - **Progress** `OzNZl`: horizontal row, `width: fill_container`, `height: 4`, `gap: 2`, 3 segment frames.

**2.3 Tasks** `y57qQ`
- `width: fill_container` (350px), `layout: vertical`, `gap: 22`. Contains the 5 category group frames in this fixed order: **MEDICAL → BUREAUCRATIC → TRAVEL → GEAR → TECH**.
- Each group frame (`width: fill_container`, `layout: vertical`, `gap: 8`) starts with a **GroupHead** row, then its TaskCards (out of scope here).

**2.4 Voice FAB** `e4KSI`
- `layoutPosition: absolute`, `x: 314`, `y: 1418`, `width: 56`, `height: 56`. Relative to the 390px page frame this lands the FAB at a **20px right inset** (314 + 56 = 370; 390 − 370 = 20) — i.e. flush with the page's 20px horizontal padding. It is pinned bottom-right.
- Removed from the vertical flow; overlays the Tasks block / bottom of the scroll.

### 3. Tokens used in this scope

| Token | Hex | Used by |
|---|---|---|
| `$background` | `#0a0a0c` | page fill; FAB Mic glyph via `$primary-foreground`; FAB shadow base |
| `$foreground` | `#e8e8f0` | mission name; TOTAL stat value; group labels |
| `$muted-foreground` | `#7a7a8e` | `BOARD` wordmark; `SYNCED`; TARGET line; BLOCKED stat value; all stat labels; group counts |
| `$card` | `#1a1a22` | Mission Summary surface |
| `$border` | `#2a2a38` | progress "remaining" segment |
| `$primary` | `#ff6b35` | `OPS` wordmark; Voice FAB fill |
| `$primary-foreground` | `#0a0a0c` | Voice FAB Mic glyph |
| `$success` | `#5ae07a` | live sync dot; DONE stat value; progress "done" segment |
| `$warning` | `#d9a73e` | CLOSING stat value; progress "closing" segment |
| `$cat-medical` | `#e05a9f` | MEDICAL group dot |
| `$cat-bureaucratic` | `#5aa0e0` | BUREAUCRATIC group dot |
| `$cat-travel` | `#5ae0a0` | TRAVEL group dot |
| `$cat-gear` | `#e0c05a` | GEAR group dot |
| `$cat-tech` | `#a05ae0` | TECH group dot |

**Type roles in scope:** JetBrains Mono (all eyebrows/labels/values/counts) and DM Sans (mission name only, within this scope). Global `radius: 0` → every rectangular surface is sharp-cornered; only ellipse dots and the FAB (`cornerRadius: 28`) are round.

### 4. Components as rendered

#### 4.1 Mobile Header → maps to `MobileHeader` / `AppHeader`
A bare horizontal flex row, `space_between` / `center`, full content width. Left cluster = Wordmark; right cluster = SyncStatus. No `+ Mission` / Search / Notifications / More actions (correct for mobile + read-only product). No container chrome.

- **Wordmark** (`Dhlx0`): `OPS` — JetBrains Mono 18 / 700, letterSpacing 2, `$primary`; immediately followed by `BOARD` — JetBrains Mono 18 / 700, letterSpacing 2, `$muted-foreground`. Two-tone single wordmark, no gap between runs.

#### 4.2 SyncStatus → maps to `SyncStatus`
- Frame `NaKAX`: `gap: 6`, `alignItems: center`.
- **Live dot** (`UDpBo`): ellipse 6×6, `$success`.
- **Sync label** (`R5vYLO`): JetBrains Mono 10 / 500, letterSpacing 1.5, `$muted-foreground`, `"SYNCED"`.
- Only the **synced** state is rendered. (Other states — syncing/offline/error — are not on this board; flagged in open items.)

#### 4.3 Mission Summary card → maps to `MissionSummaryCard` (fuses MissionDetailHeader + StatTiles + ProgressBar)
One `$card` block, vertical, gap 14, padding 16. Content as enumerated in §2.2. Exact strings: name `"AfrikaBurn 2026 · Tankwa Karoo"`; target `"TARGET: 2026-04-27"` (ISO date, mono caps with `TARGET:` prefix).

#### 4.4 StatTile ×4 (inline) → maps to `Cmp · StatTile`
Each is a bare frame, `gap: 5`, `alignItems: center` (value then label, horizontally adjacent — value left of label), no surface/border/padding/icon. Order left→right with exact values:

| Tile | id | Value | Value color | Label | Label color |
|---|---|---|---|---|---|
| DONE | `vC1bb` | `04` | `$success` | `DONE` | `$muted-foreground` |
| BLOCKED | `jsUOP` | `02` | `$muted-foreground` | `BLOCKED` | `$muted-foreground` |
| CLOSING | `UMDLa` | `03` | `$warning` | `CLOSING` | `$muted-foreground` |
| TOTAL | `aTWoY` | `13` | `$foreground` | `TOTAL` | `$muted-foreground` |

- Value text: JetBrains Mono 13 / 700. Label text: JetBrains Mono 9 / 500, letterSpacing 1.
- Row gap between tiles = 16; row is left-packed (not justified). BLOCKED value is rendered in `$muted-foreground`, **not** destructive.

#### 4.5 ProgressBar (3-segment) → maps to `Cmp · ProgressBar`
- Track row `OzNZl`: full width (318px inner), 4px tall, `gap: 2`. No explicit track-background frame (the `$border` "remaining" segment visually serves as the track tail; there is no separate `card-elevated` track surface).
- Segments left→right:
  1. **done** `Rdm5i`: width 106 (fixed), height 4, `$success`.
  2. **closing** `DX81Y`: width 80 (fixed), height 4, `$warning`.
  3. **remaining** `iMVsw`: `width: fill_container`, height 4, `$border`. Computed visual width ≈ **128px** (318 − 106 − 2 − 80 − 2).
- Three semantic segments: done / closing(amber) / remaining. No "blocked" or "in-progress" segment is drawn.

#### 4.6 CategoryGroupHeader ×5 → maps to `CategoryGroupHeader`
Each GroupHead is a horizontal row, `width: fill_container`, `gap: 8`, `alignItems: center`, structured: **dot (8px) + label + spacer + count**.

- **dot**: ellipse 8×8, filled with the category token.
- **label**: JetBrains Mono 11 / 600, letterSpacing 1.5, `$foreground`.
- **spacer**: frame `width: fill_container`, `height: 1` (pushes count to the right edge — explicit spacer idiom, *not* `space_between`).
- **count**: JetBrains Mono 11 / 500, `$muted-foreground`, format `done/total`.

| Group | Head id | Dot token | Label | Count |
|---|---|---|---|---|
| MEDICAL | `n47cg` | `$cat-medical` `#e05a9f` | `MEDICAL` | `1/3` |
| BUREAUCRATIC | `RYC3C` | `$cat-bureaucratic` `#5aa0e0` | `BUREAUCRATIC` | `2/3` |
| TRAVEL | `zy5ie` | `$cat-travel` `#5ae0a0` | `TRAVEL` | `0/2` |
| GEAR | `wPxam` | `$cat-gear` `#e0c05a` | `GEAR` | `1/3` |
| TECH | `TzsDc` | `$cat-tech` `#a05ae0` | `TECH` | `0/2` |

Counts sum to 4/13, matching the DONE=04 / TOTAL=13 stat tiles.

#### 4.7 Voice FAB (idle) → maps to `VoiceFAB`
- Frame `e4KSI`: 56×56, `fill: $primary` (`#ff6b35`), `cornerRadius: 28` (perfect circle), `justifyContent: center`, `alignItems: center`, `layoutPosition: absolute` at x314/y1418.
- **Glow**: `effect` = outer shadow, `color: #ff6b3566` (primary at ~40% alpha), `offset: {x:0, y:4}`, `blur: 16`.
- **Mic glyph** `H7cOxn`: lucide `mic`, 24×24, `$primary-foreground` (`#0a0a0c`).
- Only the **idle** state is rendered here.

### 5. States enumerated (this scope)

- **SyncStatus:** `synced` only (success dot + `SYNCED`). Other states absent.
- **Mission Summary:** single `populated` state — DONE 04 / BLOCKED 02 / CLOSING 03 / TOTAL 13; progress done(106) + closing(80) + remaining(fill).
- **StatTile values & colors:** DONE=success, BLOCKED=muted, CLOSING=warning, TOTAL=foreground (all labels muted). No empty/zero-state variant shown (TRAVEL/TECH groups have 0 done but the summary tiles are non-zero).
- **CategoryGroupHeader:** 5 instances, each `populated` with its own dot color, label, and `done/total` count; includes a `0/n` count rendering (TRAVEL 0/2, TECH 0/2).
- **Voice FAB:** `idle` only.
- **Page:** single `populated`/scrolling layout; no empty-board, loading, or error variant present.

### 6. Interactions (this scope)

- **Page:** vertical scroll only. Read-only status surface.
- **Voice FAB (idle):** the only interactive chrome element in scope. Tap → enters the voice-command flow (recording → processing → confirmation/toast). The recording/processing/error FAB states and the toast/disambiguation flow live on the dedicated voice board, not here. Hit target is the 56px circle (≥44px min touch target satisfied).
- **Header / SyncStatus / Mission Summary / StatTiles / ProgressBar / CategoryGroupHeaders:** non-interactive (pure display). No tap, no navigation, no sort/filter affordance is rendered in this scope.

### 7. Data & logic contracts

- **Mission name** ← `mission.name` (free text; DM Sans 17/600).
- **TARGET line** ← `mission.too_late_by` / target event date, formatted ISO `YYYY-MM-DD`, prefixed `TARGET: `, mono caps. This is the real-world event date (the cliff), not a per-task due date.
- **Stat tiles** are aggregates over the mission's tasks:
  - **DONE** = count of `status === done` (here `04`).
  - **BLOCKED** = count of tasks computed as blocked from the dependency graph (here `02`; `blocked` is derived, never stored).
  - **CLOSING** = count of tasks whose window state is `closing` (here `03`).
  - **TOTAL** = total task count (here `13`).
  - Note: DONE + BLOCKED + CLOSING are non-partitioning, overlapping facets (a task can be neither, e.g. open/not-started); they do not sum to TOTAL.
- **ProgressBar** segments are proportions of TOTAL: done segment ∝ done count, closing segment ∝ closing count, remaining = the rest. (Board uses hardcoded px widths 106/80; the contract is done-share / closing-share / remainder. With 13 total, 106/80/128 over a 318px inner ≈ done 33% / closing 25% / remaining 40% — not a literal 4/3/6 task mapping, so widths are illustrative and must be derived from counts at build time.)
- **CategoryGroupHeader count** = `{done}/{total}` for tasks in that category. Group order is a fixed canonical sort: Medical, Bureaucratic, Travel, Gear, Tech. Per-group totals (3,3,2,3,2) sum to TOTAL=13; per-group done (1,2,0,1,0) sum to DONE=4. Groups with zero tasks would presumably be hidden (all 5 are populated here — cannot confirm empty-group behavior from this board).
- **SyncStatus** ← board sync/liveness state; `synced` ⇒ success dot + `SYNCED`.
- **Voice FAB** ← static idle entry point; no data binding beyond enablement.

### 8. Coverage checklist

This section fully specifies, against board `h9YSWg`:
- Page frame: 390px width, `$background`, vertical layout, gap 24, padding `[24,20,40,20]`, 350px content column.
- Mobile Header: bare `space_between` row; Wordmark two-tone (`OPS` primary 18/700 ls2 + `BOARD` muted 18/700 ls2); SyncStatus (6px success dot + `SYNCED` mono 10/500 ls1.5), synced state.
- Mission Summary card: `$card`, vertical gap 14, padding 16, 318px inner; mission name (`AfrikaBurn 2026 · Tankwa Karoo`, DM Sans 17/600); TARGET line (`TARGET: 2026-04-27`, mono 11/500 ls1).
- 4 inline StatTiles with exact values/colors/labels (DONE 04/success, BLOCKED 02/muted, CLOSING 03/warning, TOTAL 13/foreground; value 13/700, label 9/500 ls1; row gap 16, left-packed).
- 3-segment ProgressBar: track 4px gap 2; done 106/`$success`, closing 80/`$warning`, remaining fill/`$border` (≈128px); no explicit elevated track.
- 5 CategoryGroupHeaders with exact dot tokens, labels, and `done/total` counts, in canonical sort order; spacer-frame layout idiom.
- Voice FAB idle: 56px circle, `$primary`, cornerRadius 28, outer glow `#ff6b3566` y+4 blur16, lucide `mic` 24px `$primary-foreground`, absolute x314/y1418 (20px right inset, bottom-right).
- All tokens resolved to hex; all type roles (mono vs DM Sans, sizes, weights, letterSpacing) enumerated.
- Every state present in scope (sync:synced, summary:populated, 5 group headers incl. 0/n counts, FAB:idle).
- Interactions (scroll-only board; FAB as sole interactive chrome) and data/logic contracts for name, target, stat aggregates, progress proportions, group counts.
- Divergences from canonical defs recorded (see component_usages / open_items).

Explicitly **out of scope** (owned by the TaskCard spec): TaskCard rows, StatusCycleButton, CategoryTag, WindowStatePill, BlockedBy sub-row, the status×window state matrix, category icon set, and per-card opacity/strikethrough treatments.

# Mobile TaskCard organism + subcomponents (Category Board, 13 instances)

*scope: Agent B — Mobile TaskCard organism + subcomponents (StatusCycleButton, CategoryTag, WindowStatePill, BlockedBy, card-state)*

## Mobile TaskCard organism + subcomponents

**Board:** `h9YSWg` — OpsBoard — Mobile screens → frame `jtnig` "Mobile — Category Board" → frame `y57qQ` "Tasks". Source of truth: the flattened screen rendering on this board (authoritative); brief §9/§10/§14 references are INFORMATIONAL divergence notes only.

### Purpose
The TaskCard is the core repeated read-status row of the mobile Category Board. Across the 5 category groups it appears **13 times** (`name == "Task"`), exercising a near-complete window-state × status matrix. Each card is a horizontal `$card` surface composed of a left **StatusCycleButton** (the only interactive element) + a vertical **Content** column (task name → meta row → optional BlockedBy sub-row). The meta row carries the **CategoryTag** (bare dot+icon+label, NOT a tinted badge here) and the **WindowStatePill**. The card visually encodes status (via the status button glyph + name color) and window state (via the pill + card opacity) through redundant channels.

### Card layout (exact, top→bottom / left→right)
TaskCard frame (`name: "Task"`):
- **Container:** `layout: horizontal` (default — no `layout` key set, children laid left→right), `width: fill_container`, `fill: $card` (#1a1a22), `gap: 12`, `padding: 12` (all sides), `cornerRadius: 0` (sharp, board radius=0). **No** `border-l-2`, **no** stroke, **no** `bg-muted` on any card. Card-level `opacity` is set ONLY on the closed card (`vatyq`, opacity `0.55`); all other cards have full opacity (blocked cards are NOT dimmed at the card level).
- **Child 1 — `Status` frame** (StatusCycleButton): `width 18 × height 18`, sharp square. See StatusCycleButton variants below.
- **Child 2 — `Content` frame:** `layout: vertical`, `width: fill_container`, `gap: 8`. Children:
  1. **`Name` text** — `fontFamily: "DM Sans"`, `fontSize: 14`, `fontWeight: "500"`, `width: fill_container`, `textGrowth: "fixed-width"`. Fill is `$foreground` (#e8e8f0) for not-started/blocked cards, `$muted-foreground` (#7a7a8e) for done and closed cards. **No `line-through` / strikethrough decoration on any card** (see divergence).
  2. **`Meta` frame** — `layout: horizontal`, `gap: 10`, `alignItems: center`. Children: `Cat` (CategoryTag) then `Pill` (WindowStatePill).
  3. **`BlockedBy` frame** (present only on the 2 blocked cards) — `layout: horizontal`, `gap: 5`, `alignItems: center`. See BlockedBy sub-row.

### The 13 instances (render order, exact)
| # | node id | Group | Status button variant | Name color | WindowStatePill | BlockedBy |
|---|---|---|---|---|---|---|
| 1 | `oAkJr` | MEDICAL | not-started (empty, border-hover 1.5) | foreground | CLOSING · T-3d (warning + timer) | — |
| 2 | `hswxL` | MEDICAL | not-started | foreground | OPEN · T-18d (muted + timer) | — |
| 3 | `viMXQ` | MEDICAL | done (success fill + check) | muted | DONE (success + check) | — |
| 4 | `D58oy` | BUREAUCRATIC | done | muted | DONE | — |
| 5 | `g4T2E` | BUREAUCRATIC | done | muted | DONE | — |
| 6 | `qSBE7` | BUREAUCRATIC | blocked (muted fill + border + lock) | foreground | BLOCKED (muted + ban) | "ticket confirmation email" |
| 7 | `qAnB6` | TRAVEL | not-started | foreground | CLOSING · T-2d (warning + timer) | — |
| 8 | `vatyq` | TRAVEL | closed (border + x); **card opacity 0.55** | muted | WINDOW CLOSED (subtle + x) | — |
| 9 | `ea6lM` | GEAR | not-started | foreground | CLOSING · T-5d (warning + timer) | — |
| 10 | `m5nTI` | GEAR | not-started | foreground | OPEN · T-15d (muted + timer) | — |
| 11 | `wy535` | GEAR | done | muted | DONE | — |
| 12 | `u66Uq` | TECH | not-started | foreground | OPEN · T-9d (muted + timer) | — |
| 13 | `mq67C` | TECH | blocked (muted fill + border + lock) | foreground | BLOCKED (muted + ban) | "firmware from build lead" |

Status-variant counts: **not-started ×6** (cards 1,2,7,9,10,12), **done ×4** (3,4,5,11), **blocked ×2** (6,13), **closed ×1** (8). **in-progress: 0 (absent everywhere — FLAG).**
WindowStatePill-variant counts: **CLOSING ×3** (T-3d, T-2d, T-5d), **OPEN ×3** (T-18d, T-15d, T-9d), **DONE ×4**, **BLOCKED ×2**, **WINDOW CLOSED ×1**.

---

### Component: StatusCycleButton (the `Status` 18×18 frame) — 13 instances, 4 rendered variants
Sharp 18×18 square, leftmost in each card. Maps to canonical **StatusCycleButton** (§10). Four DISTINCT rendered treatments; the in-progress treatment is MISSING.

1. **not-started** (cards 1,2,7,9,10,12): empty frame, `stroke: $border-hover` (#3a3a4a), `strokeWidth: 1.5`, no fill, no glyph. Node example `wfTSy`.
2. **done** (cards 3,4,5,11): `fill: $success` (#5ae07a), `justifyContent: center`, `alignItems: center`; child `icon` lucide **`check`** 12×12, `fill: $background` (#0a0a0c near-black). Node example `Ef9ur` → `OOTpi`.
3. **blocked / not-yet** (cards 6,13): `fill: $muted` (#131318), `stroke: $border` (#2a2a38), `strokeWidth: 1`, centered; child `icon` lucide **`lock`** 10×10, `fill: $muted-foreground` (#7a7a8e). Node example `OtFci` → `lKHH6`.
4. **closed** (card 8 only): `stroke: $border` (#2a2a38), `strokeWidth: 1`, no fill, centered; child `icon` lucide **`x`** 10×10, `fill: $muted-foreground-subtle` (#4a4a5e). Node `Cn0aM` → `J2XCb1`. (This card's parent also carries `opacity: 0.55`.)

**Divergence from canonical StatusCycleButton:** (a) **in-progress variant entirely ABSENT** — brief §10 specifies `border-primary` + `bg-primary/12` + filled `◼`/`Square` glyph in orange; never rendered on this board, so the stored 3-state cycle is visually under-documented. (b) The button conflates **derived window states onto the status glyph**: brief models status as 3 stored states (not-started/in-progress/done) with `blocked`/`closed` as DERIVED window treatments — but here the lock (blocked) and x (closed) glyphs ride on the status button itself. (c) not-started uses `$border-hover` 1.5px here vs brief's `border-border` (resting). (d) done button is rendered, but the brief-required `line-through` on the task name is NOT applied.

---

### Component: CategoryTag (the `Cat` frame) — 13 instances
Bare inline cluster, NOT a pill/badge. `Cat` frame: `layout: horizontal`, `gap: 5`, `alignItems: center`, **no fill, no padding, no cornerRadius**. Children, left→right:
1. **dot** — `ellipse` 6×6, `fill: $cat-{category}` (solid category token).
2. **ci (category icon)** — `icon` lucide, 12×12, `fill: $cat-{category}` (matches dot color).
3. **cl (label)** — `text`, `fontFamily: "JetBrains Mono"`, `fontSize: 10`, `fontWeight: "500"`, `letterSpacing: 1`, `fill: $muted-foreground` (#7a7a8e — label is muted, NOT the category color), uppercase category name.

**Category icon set as rendered (authoritative) + token:**
| Category | dot/icon token | hex | lucide icon (rendered) | label |
|---|---|---|---|---|
| MEDICAL | `$cat-medical` | #e05a9f | **`pill`** | MEDICAL |
| BUREAUCRATIC | `$cat-bureaucratic` | #5aa0e0 | **`file-text`** | BUREAUCRATIC |
| TRAVEL | `$cat-travel` | #5ae0a0 | **`route`** | TRAVEL |
| GEAR | `$cat-gear` | #e0c05a | **`package`** | GEAR |
| TECH | `$cat-tech` | #a05ae0 | **`cpu`** | TECH |

**Divergence from canonical CategoryTag (brief §6/§7/§14):** (a) **Not a tinted Badge** — brief specifies CategoryTag as a `bg-cat-x/12`-tinted pill (IconBadge normalized to /12). Here it is a bare dot+icon+label with NO background fill, NO padding, sharp. (b) **Icon set mismatch:** brief §4 specifies `Stethoscope`/`FileText`/`Plane`/`Backpack`/`Cpu`. Only **file-text→FileText** and **cpu→Cpu** match; **pill ≠ Stethoscope, route ≠ Plane, package ≠ Backpack**. (c) **Label is `$muted-foreground`, not the category color** (the category color appears only on the dot+icon). (d) **Redundant double-encoding** — the category is already shown by the group header (`gdot` 8px + label); the per-card CategoryTag repeats it within a single-category group.

---

### Component: WindowStatePill (the `Pill` frame) — 13 instances, 5 rendered variants
Rounded pill carrying window/derived state. `Pill` frame (every instance): `cornerRadius: 100` (rounded-full — a sharp-radius-board exception, consistent with brief §5 pill exception), `fill: $card-elevated` (#22222e — **same surface fill for ALL variants; no per-state tint**), `gap: 4`, `padding: [3, 8]` (3 vertical, 8 horizontal), `alignItems: center`. Children: `pi` (icon 11×11) + `pl` (label text). Label text: `fontFamily: "JetBrains Mono"`, `fontSize: 9.5`, `fontWeight: "600"`, `letterSpacing: 0.5`. Icon + label share one color token per variant.

| Variant | icon (lucide, 11×11) | label literal | color token (icon + label) | hex | instances |
|---|---|---|---|---|---|
| **CLOSING** | `timer` | `CLOSING · T-{n}d` (T-3d / T-2d / T-5d) | `$warning` | #d9a73e | 3 |
| **OPEN** | `timer` | `OPEN · T-{n}d` (T-18d / T-15d / T-9d) | `$muted-foreground` | #7a7a8e | 3 |
| **DONE** | `check` | `DONE` | `$success` | #5ae07a | 4 |
| **BLOCKED** | `ban` | `BLOCKED` | `$muted-foreground` | #7a7a8e | 2 |
| **WINDOW CLOSED** | `x` | `WINDOW CLOSED` | `$muted-foreground-subtle` | #4a4a5e | 1 |

**OPEN-pill decision (FLAG):** This board renders an EXPLICIT `OPEN · T-{n}d` pill on 3 cards (`hswxL`, `m5nTI`, `u66Uq`), muted timer styling. Brief §9 + open-decision #4 lean toward **absence = healthy** (open windows show NO pill). The screen is authoritative, so the OPEN pill IS the intended design here and the WindowStatePill canonical contract must be WIDENED to include an `open` variant (muted-foreground + timer + `OPEN · T-{n}d`). Downstream must reconcile this against the desktop boards.

**Icon-set divergence from brief §8/§9:** Board uses `timer` (both CLOSING and OPEN), `x` (closed), `ban` (blocked), `check` (done). Brief specifies `Clock` (closing), `XCircle` (closed, faint), `AlertTriangle` (blocked). **timer ≠ Clock, x ≠ XCircle, ban ≠ AlertTriangle.** The DONE check pill has no brief §9 equivalent (done is a status, not a window state) — here the pill doubles as a status/window badge. Resolve the icon set toward the screen.

**StatusBadge mapping:** there is no separate StatusBadge node — the WindowStatePill IS the status/window badge (it covers DONE/BLOCKED which are status/derived, plus the window states). Canonical StatusBadge and WindowStatePill collapse into this single `Pill` rendering on mobile.

---

### Component: BlockedBy sub-row (the `BlockedBy` frame) — 2 instances
Appended as the 3rd child of `Content` ONLY on the 2 blocked cards (`qSBE7` → `XAAfy`, `mq67C` → `xha2r`). `layout: horizontal`, `gap: 5`, `alignItems: center`. Children:
1. **`k` (key)** — `text` literal `"BLOCKED BY:"`, `fontFamily: "JetBrains Mono"`, `fontSize: 9.5`, `fontWeight: "600"`, `letterSpacing: 0.5`, `fill: $muted-foreground-subtle` (#4a4a5e).
2. **`v` (value)** — `text`, dependency name, `fontFamily: "DM Sans"`, `fontSize: 11`, `fontWeight: "normal"`, `fill: $muted-foreground` (#7a7a8e). Values: `"ticket confirmation email"` and `"firmware from build lead"`.

**Divergence:** Brief §9 phrasing is `⚠ blocked by: {names}` with an `AlertTriangle` glyph; the board OMITS the warning glyph from the sub-row (the `ban` glyph lives in the pill instead) and uppercases the key `BLOCKED BY:`. No canonical component is named exactly this (closest: dependency hint / DependencyConnector). Multiple blockers would presumably be a comma-joined name string (single string shown in both instances).

---

### Card-level state treatments (exact, as rendered)
- **not-started** (6 cards): full opacity, `fill: $card`, foreground name, empty status square. No border, no decoration.
- **done** (4 cards): full opacity, `fill: $card`, **`$muted-foreground` name (NO line-through)**, success status square + DONE pill.
- **blocked** (2 cards): **full opacity** (card NOT dimmed), `fill: $card`, `$foreground` name, lock status square + BLOCKED pill + BlockedBy row. **No `border-l-2`.**
- **closed** (1 card, `vatyq`): **card `opacity: 0.55`**, `fill: $card`, `$muted-foreground` name (**NO line-through**), x status square + WINDOW CLOSED pill. **No `bg-muted` on the card** (the closed treatment is carried by opacity + subtle pill only).

**Divergences from brief §9/§10 card treatments (informational):**
- **Missing `border-l-2`:** brief gives closing `border-l-2 border-warning` and blocked/not-yet `border-l-2 border-muted-foreground-subtle`. The board applies NO left accent border to ANY card; state is carried by the pill + opacity instead.
- **Missing `line-through`:** brief §10 done state and §9 closed state both require `line-through text-muted-foreground` on the task name. The board mutes the name color but applies NO strikethrough on any done or closed card — a consistent omission to flag.
- **Closed card opacity 0.55 matches** brief (0.55) but **`bg-muted` is NOT applied**.
- **Blocked card opacity:** brief §9 suggests blocked/not-yet at opacity 0.6 + dim; board leaves blocked cards at FULL opacity (only the closed card is dimmed).

---

### Interactions
- **Single interaction:** tapping the **StatusCycleButton** (the 18×18 `Status` frame) cycles the stored status `not-started → in-progress → done` (wrapping), per the read-only board model. The button is **always enabled** (brief §10 guard rule): window-state and blocked are advisory, never gating — a blocked or closed-window task can still be started/marked done.
- **No other tappable element** on the card. CategoryTag, WindowStatePill, BlockedBy, and the task name are display-only.
- The board does not render hover/pressed/focus states (mobile, flattened static screen). The not-started square's hover (`border-success` per brief) and the in-progress intermediate state are not depicted.

### Data / logic contracts
- **status** (stored): drives the StatusCycleButton glyph (empty / `◼` orange / `check`) and the name color (foreground vs muted on done). In-progress not rendered here.
- **window state** (computed, never stored from `too_late_by` / `not_before` / dependency graph): drives the WindowStatePill icon+label+color and (for closed) the card opacity. CLOSING shows `T-{n}d` countdown (n = days to cliff, `CLOSING_THRESHOLD_DAYS = 7`); OPEN also shows `T-{n}d` (>7d here: 18/15/9). Precedence brief §9: `closed > blocked > not_before > closing > open`.
- **blocked** (derived from dependency graph, not stored): when true, status button → lock glyph, pill → `ban`/`BLOCKED`, and the BlockedBy sub-row renders the unmet dependency name(s). On this board, blocked cards keep their underlying category and stored status hidden behind the lock treatment.
- **category** (stored enum): drives CategoryTag dot/icon color (`$cat-{x}`), the icon glyph, and the uppercase label, plus the parent group placement.
- **DONE pill vs status:** the pill shows `DONE` whenever status === done (success check), so the done state is double-encoded (status button + pill + muted name).
- Per-card values are literal in the screen (task name, T-{n}d, blocker name); these bind to task fields in the real data model.

### Notes for canonical reconciliation (do not author contracts here)
- WindowStatePill canonical def must gain an **OPEN variant** (screen wins over absence=healthy) and reconcile icon set (`timer`/`x`/`ban` vs `Clock`/`XCircle`/`AlertTriangle`).
- StatusCycleButton canonical def must keep the in-progress variant (absent here) and decide whether blocked/closed glyphs (lock/x) ride on the button (screen) or stay as separate window treatments (brief).
- CategoryTag canonical def: screen renders bare (no /12 badge bg) — widen or note as mobile-compact rendering; reconcile icon set (pill/route/package vs Stethoscope/Plane/Backpack).
- Card-level: screen omits `border-l-2` and `line-through` everywhere; decide whether these are mobile-intentional or to be added.


## Open items (this board)

- MissionSummary fuses MissionSummaryCard + MissionDetailHeader + StatTile + ProgressBar into one card — consolidation must decide whether to keep it fused on mobile or compose canonical sub-components.
- StatTile is flattened to a bare value+label pair with no tile surface; value fontSize is 13 here vs 30 (canonical) / 22 / 20 (other boards) — pick a canonical scale + a mobile-compact variant.
- BLOCKED stat value uses $muted-foreground, not destructive (brief §11 says destructive) — resolve stat color rule.
- ProgressBar uses hardcoded 106/80 px segment widths and has no explicit card-elevated track frame — confirm count-derived widths + whether a track surface is required.
- Mobile header has no sticky bar / bg-muted / border-bottom / fixed height — confirm whether the production mobile header should gain app-shell chrome or stay a bare row.
- Layout idiom inconsistency on the same board: group headers use an explicit fill_container spacer frame; Mission Summary header uses justifyContent space_between — normalize to one idiom.
- Voice FAB position is hardcoded absolute (x314/y1418) with no env(safe-area-inset-bottom) modeling; glow is raw hex #ff6b3566 not a token-derived primary alpha; mic glyph 24px diverges from canonical 28px — reconcile.
- SyncStatus shows only the 'synced' state; syncing/offline/error states are undefined on this board.
- Empty-group behavior unverifiable (all 5 groups populated); confirm whether zero-task categories render a header or are hidden.
- Mobile MissionSummary has no live-dot beside the title (desktop boards include one) — confirm intended mobile treatment.
- IN-PROGRESS status variant is absent from all 13 cards — canonical StatusCycleButton (border-primary + bg-primary/12 + ◼ orange) and any in-progress window/name treatment must be added; verification cannot confirm it from this board
- OPEN WindowStatePill is rendered (3 cards) but brief open-decision #4 prefers no pill — screen is authoritative; downstream must confirm OPEN pill is canonical and reconcile against desktop boards
- Category icon set (pill/route/package) diverges from brief §4 (Stethoscope/Plane/Backpack) — must be reconciled across boards into one canonical icon table
- WindowStatePill icon set (timer/x/ban) diverges from brief §8/§9 (Clock/XCircle/AlertTriangle) — reconcile
- CategoryTag rendered bare (no /12 badge bg) — decide whether mobile-compact bare rendering is canonical or a flatten artifact
- Card-level treatments: NO border-l-2 (closing/blocked) and NO line-through (done/closed) and NO bg-muted (closed) on any card — decide if mobile intentionally drops these channels vs the brief
- Blocked cards remain at full opacity (brief suggests 0.6 + dim); only closed card is dimmed (0.55) — confirm intended
- StatusBadge has no standalone node — it is merged into the WindowStatePill; consolidation must decide separate vs merged
- DONE check pill has no brief §9 window-state equivalent (done is status not window) — confirm the pill is meant to double as status badge

## Coverage checklist (verification targets)

- [ ] Page frame: width 390, content col 350, fill $background #0a0a0c, layout vertical, gap 24, padding [24,20,40,20], Tasks internal gap 22, clip true, sharp corners (radius 0)
- [ ] Mobile Header: bare space_between row, full width, no container chrome; maps MobileHeader/AppHeader
- [ ] Wordmark: 'OPS' (JetBrains Mono 18/700 ls2 $primary) + 'BOARD' (18/700 ls2 $muted-foreground), no gap
- [ ] SyncStatus: gap 6, 6px $success dot + 'SYNCED' (JetBrains Mono 10/500 ls1.5 $muted-foreground); synced state
- [ ] Mission Summary card: $card #1a1a22, vertical gap 14, padding 16, inner 318px, sharp corners
- [ ] Mission name: 'AfrikaBurn 2026 · Tankwa Karoo' DM Sans 17/600 $foreground
- [ ] TARGET line: 'TARGET: 2026-04-27' JetBrains Mono 11/500 ls1 $muted-foreground
- [ ] 4 StatTiles: DONE 04/$success, BLOCKED 02/$muted-foreground, CLOSING 03/$warning, TOTAL 13/$foreground; value 13/700, label 9/500 ls1; row gap 16, left-packed; gap 5 per tile
- [ ] 3-segment ProgressBar: 4px row gap 2; done 106/$success, closing 80/$warning, remaining fill/$border (~128px); no explicit elevated track
- [ ] 5 CategoryGroupHeaders: dot 8px + label (11/600 ls1.5 $foreground) + fill spacer + count (11/500 $muted-foreground); MEDICAL 1/3, BUREAUCRATIC 2/3, TRAVEL 0/2, GEAR 1/3, TECH 0/2; sort Medical/Bureaucratic/Travel/Gear/Tech; category dot tokens enumerated
- [ ] Voice FAB idle: 56px circle, $primary #ff6b35, cornerRadius 28, outer glow #ff6b3566 offset 0,4 blur 16, lucide 'mic' 24px $primary-foreground #0a0a0c, absolute x314/y1418, 20px right inset bottom-right
- [ ] All tokens resolved to hex; all type roles enumerated (mono vs DM Sans, size/weight/letterSpacing)
- [ ] All in-scope states enumerated (sync:synced, summary:populated, 5 group headers incl. 0/n, FAB:idle)
- [ ] Interactions: scroll-only board, FAB sole interactive chrome element, all other chrome non-interactive
- [ ] Data/logic: name, ISO target, stat aggregates (DONE/BLOCKED/CLOSING/TOTAL), progress proportions, group counts cross-check (4/13)
- [ ] Divergences recorded per component (fused summary, bare StatTiles, header chrome absence, spacer idiom, FAB hardcoded position/glow/icon size, OPEN-pill/icon-set deferred to TaskCard spec)
- [ ] Out-of-scope explicitly delineated: TaskCard, StatusCycleButton, CategoryTag, WindowStatePill, BlockedBy, status×window matrix, category icon set
- [ ] TaskCard container layout: horizontal, fill $card #1a1a22, gap 12, padding 12, cornerRadius 0, width fill_container — covered
- [ ] All 13 TaskCard instances enumerated with node id, group, status variant, name color, window pill, BlockedBy — covered
- [ ] StatusCycleButton 4 rendered variants (not-started/done/blocked-lock/closed-x) with exact tokens, stroke widths, icon names/sizes — covered
- [ ] StatusCycleButton in-progress variant flagged as ABSENT — covered
- [ ] CategoryTag bare dot(6px)+icon(12px)+label(mono 10) structure with no pill bg — covered
- [ ] Category icon set as rendered: pill/file-text/route/package/cpu + tokens + labels — covered
- [ ] Category icon divergence vs brief Stethoscope/Plane/Backpack — covered
- [ ] WindowStatePill 5 variants (CLOSING/OPEN/DONE/BLOCKED/WINDOW CLOSED) with icons (timer/timer/check/ban/x), labels, color tokens, counts — covered
- [ ] WindowStatePill shared $card-elevated fill, cornerRadius 100, padding [3,8], gap 4, label 9.5/600/ls0.5 — covered
- [ ] OPEN-pill presence decision flagged (screen authoritative vs absence=healthy) — covered
- [ ] WindowStatePill icon divergence vs brief Clock/XCircle/AlertTriangle — covered
- [ ] BlockedBy sub-row: key 'BLOCKED BY:' (subtle mono) + value (DM Sans 11 muted), 2 instances with literal values — covered
- [ ] Card-level state treatments: opacity 0.55 (closed only), name muted (done+closed), NO line-through, NO border-l-2, NO bg-muted, blocked at full opacity — covered
- [ ] Component mapping: TaskCard / StatusCycleButton / CategoryTag / WindowStatePill / StatusBadge (merged) / StatusDot — covered
- [ ] Interactions: single tap on StatusCycleButton, always enabled, all else display-only — covered
- [ ] Data/logic contracts: status stored, window computed, blocked derived, category enum, thresholds, double-encoding — covered
- [ ] screen_divergence_from_canonical documented per component — covered