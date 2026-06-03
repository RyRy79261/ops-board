# Components — Chrome / Nav / Layout

*13 contracts. Screens authoritative; library reconciled toward screen usage.*

## SyncStatus

**Kind:** atom  ·  **maps_to (camp-404):** No direct camp-404 atom; REF the StatusDot idiom (StatusDot is the 8px category dot) and Label/Mono type token. Build as a tiny new atom in packages/ui; design-brief §11 calls it a 'liveness affordance'.  ·  **maps_to (shadcn):** No shadcn primitive — compose a div with a dot span + text. Uses the same mono Label primitive; not a Badge (no pill chrome).
  ·  **composes:** StatusDot (or inline ellipse), Label/Mono type token

**Anatomy:** frame SyncStatus (horizontal, gap 6, alignItems center) → [ ellipse Dot (6×6, fill $success) , text Label (mono, fontSize 10, fontWeight 500, letterSpacing 1.5, fill $muted-foreground, content 'SYNCED') ]

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `state` | 'synced' | 'syncing' | 'offline' |  | 'synced' | Drives dot color + default label |
| `label` | string |  | 'SYNCED' | Uppercase mono caps label; overrides state default |
| `leadingLabel` | string |  | undefined | Optional prefix label (e.g. 'SOLO OPERATOR') for the desktop operator block |
| `dateLabel` | string |  | undefined | Optional trailing date string (e.g. '03 JUN 2026') |
| `dotColor` | token |  | $success | Override dot fill ($success/$warning/$muted-foreground) |

**Variants:** `synced (green dot + SYNCED)`, `operator block (leading SOLO OPERATOR + dot + date)`, `syncing (model-derived)`, `offline (model-derived)`

**States:** `default/synced`, `syncing`, `offline`, `mobile (weight 500, ls 1.5)`, `desktop-operator (weight normal, ls 1)`

**Tokens:** `$success`, `$muted-foreground`, `$muted-foreground-subtle`

**A11y:** Decorative dot is aria-hidden; the textual label is the accessible signal (redundant channel — never color-only); If live-updating, wrap in aria-live=polite region so screen readers announce sync changes; Not focusable / not a control

## SyncStatus (atom)

Liveness/connection indicator: a tiny status dot + an uppercase mono caps label. Appears in the right cluster of `AppHeader`, in `MobileHeader`, and as the standalone operator/date block on the Dependencies desktop header.

**Anatomy** (canonical id `ht6vH`):
```
SyncStatus  (flex row, gap 6, items-center)
├─ Dot    ellipse 6×6  fill $success
└─ Label  text  mono 10/500 ls 1.5  fill $muted-foreground  "SYNCED"
```

**Exact values:** dot 6×6px; gap 6px; label JetBrains Mono 10px, weight 500, letter-spacing 1.5px, uppercase. Default dot fill `$success`, label fill `$muted-foreground`.

**Variants / states (UNION across screens):**
- `synced` (default): green dot `$success` + `SYNCED` (mobile board h9YSWg, showcase). Mobile label weight 500.
- `operator` overload (Dependencies desktop b1b079 `Header Right`): the same dot+label idiom widens to a 3-part block: leading `SOLO OPERATOR` mono 11/normal `$muted-foreground-subtle` ls 1 + green `$success` dot 6×6 + trailing date `03 JUN 2026` mono 11/normal `$muted-foreground` ls 1. The component must accept an optional `leadingLabel` and a `trailingLabel`/date slot so this header rendering is one component, not three.
- `offline`/`syncing` (model-derived, not drawn but required by the read-only sync contract): dot recolors to `$muted-foreground`/`$warning`; label `OFFLINE`/`SYNCING…`. Color is the redundant channel alongside the label text.

**Reconciliation:** canonical SyncStatus is the 2-node dot+label. The Dependencies board renders a richer operator/date block through the same role; widen the contract with optional `leadingLabel` (e.g. SOLO OPERATOR) and `dateLabel` props rather than spawning a separate HeaderStatus component. Mobile uses label weight 500 / ls 1.5; desktop operator uses weight normal / ls 1 — expose `labelWeight`/`letterSpacing` via the shared mono token, default to the showcase 10/500/1.5.

**Read-only note:** purely a status display; not interactive.

**Screen usages:** AppHeader Actions cluster (showcase E5VLtZ → ht6vH); MobileHeader right (showcase Na4yA, mobile board h9YSWg 'Sync'); Dependencies desktop header right block (b1b079 'Header Right' SOLO OPERATOR · dot · 03 JUN 2026)

**Reconciliation (screen ← library):** Widened from the 2-node canonical (dot+SYNCED) to absorb the Dependencies-board operator/date block (SOLO OPERATOR + live dot + date) via optional leadingLabel/dateLabel props — the triage flags this block as 'closest canonical match to the liveness indicator', so it is folded into SyncStatus rather than a new component. Label weight differs by surface (mobile 500, desktop-operator normal); standardize on the mono caption token and expose weight override.

---

## AppHeader

**Kind:** organism  ·  **maps_to (camp-404):** No single camp-404 header; compose from the lifted SectionHeader/DetailHeader idiom + lifted Button (icon size) for actions. Scaffolding S2 builds the shell. bg-muted/border-border are the lifted token surfaces.  ·  **maps_to (shadcn):** Plain <header> + flex; action buttons = shadcn Button variant='ghost' size='icon' with lucide icons (search, bell, ellipsis). Not a shadcn component itself.
  ·  **composes:** SyncStatus (ht6vH), IconButton (camp-404 Button size=icon), Wordmark (inline mono text pair)

**Anatomy:** frame AppHeader (fill_container, fill $muted, border-bottom 1 $border inner, padding [20,32], justify space_between, items-center) → [ frame Wordmark (row, items-center) → [ text OPS (mono 16/700 ls 4 $primary) , text BOARD (mono 16/700 ls 4 $muted-foreground) ] , frame Actions (row, gap 16, items-center) → [ ref SyncStatus (ht6vH) , ref IconButton Search (icon search) , ref IconButton Notifications (icon bell) , ref IconButton More ] ]

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `syncState` | SyncStatusProps |  | {state:'synced'} | Passed through to the SyncStatus instance |
| `actions` | ReactNode |  | Search+Notifications+More | Right-cluster slot; defaults to the full icon-button set |
| `showActions` | boolean |  | true | When false renders wordmark-only (matches Category/Timeline board drift) |
| `sticky` | boolean |  | true | Sticky top, z-100 per §11 |

**Variants:** `full (wordmark + SyncStatus + Search/Notifications/More)`, `wordmark-only`, `operator (wordmark + SyncStatus operator block)`

**States:** `default/sticky`, `wordmark-only`, `operator`

**Tokens:** `$muted`, `$border`, `$primary`, `$muted-foreground`

**A11y:** role=banner (header landmark); Wordmark as the app home label; icon buttons need aria-label (Search, Notifications, More); Sticky header must not trap focus; tab order: wordmark → actions → main; 44px min touch target for the action icon buttons on touch

## AppHeader (organism — desktop sticky chrome)

Persistent top chrome for the desktop 3-pane shell. Sticky, ~61px tall, `bg-muted`, hairline bottom border, z-100 (design-brief §11).

**Anatomy** (canonical id `E5VLtZ`):
```
AppHeader  fill_container  bg $muted  border-b 1 $border (inner)  padding [20,32]  justify-between  items-center
├─ Wordmark  (row, items-center)
│  ├─ OPS    text mono 16/700 ls 4  $primary
│  └─ BOARD  text mono 16/700 ls 4  $muted-foreground
└─ Actions   (row, gap 16, items-center)
   ├─ SyncStatus  → ref ht6vH (SYNCED)
   ├─ IconButton  search
   ├─ IconButton  bell (Notifications)
   └─ IconButton  More (⋯)
```

**Exact values:** padding 20px (y) × 32px (x); border-bottom 1px `$border` inner; fill `$muted`; Actions gap 16px; wordmark letter-spacing 4px (showcase/canonical) — note the Category/Timeline/Dependencies *boards* render the wordmark at letter-spacing 1px (drift). Height resolves to ~61px per §11. **No '+ Mission' button** anywhere — creation is voice/MCP only (LOCKED).

**Variants / states (UNION across screens):**
- `full` (showcase E5VLtZ): wordmark + SyncStatus + Search + Notifications + More. This is the authoritative/intended chrome.
- `wordmark-only` (Category D3JA0i, Timeline a3Dgz boards): only the Wordmark; the right Actions cluster is omitted (space_between leaves the right side empty). Triage flags this as drift/scope-gap.
- `operator` (Dependencies b1b079): wordmark + the SyncStatus *operator block* (SOLO OPERATOR · live dot · 03 JUN 2026) — no Search/Notifications/More.

**Reconciliation:** screens are authoritative and they diverge in what the right cluster holds. Resolve by making the Actions cluster a **slot** with three documented compositions: (a) full action set (Search/Notifications/More + SyncStatus — showcase), (b) SyncStatus-only / operator block (Dependencies), (c) empty (Category/Timeline as drawn). Default the production shell to the showcase `full` set; treat the bare wordmark-only board renderings as in-progress chrome, not a removal of the actions contract. Wordmark tracking is 4px (token); the 1px on product boards is drift to normalize to 4px.

**Actions:** the only interactions are select-mission/switch-view (handled by Sidebar/ViewTabs, not here) and the optional Search/Notifications/More buttons. Read-only board — no create/edit.

**Screen usages:** Showcase RcvKu Spec·AppHeader (full set, authoritative); Category board D3JA0i (wordmark-only); Timeline board a3Dgz (wordmark-only); Dependencies board b1b079 (wordmark + operator SyncStatus); Legal/Manual desktop NMzE5 (bespoke reading TopBar variant — out of scope here, note as drift)

**Reconciliation (screen ← library):** Canonical AppHeader includes the Actions cluster (SyncStatus/Search/Notifications/More); two product boards omit it and one substitutes the operator block. Per source-of-truth rule the screens win locally, so the contract exposes `actions` as a slot + `showActions` toggle, with the showcase full set as the production default. The reading-mode 'TopBar' on the Legal/Manual board (Wordmark + Sep + Tag + Back + Close) is a bespoke doc header — explicitly NOT this component (note for codegen).

---

## MobileHeader

**Kind:** organism  ·  **maps_to (camp-404):** Same composition path as AppHeader but no actions; reuse the Wordmark + SyncStatus atoms. New thin organism in packages/ui.  ·  **maps_to (shadcn):** Plain <header> flex row; no shadcn primitive. SyncStatus is the only child component.
  ·  **composes:** SyncStatus (ht6vH), Wordmark (inline mono text pair)

**Anatomy:** frame MobileHeader (fill_container, justify space_between, items-center) → [ frame Wordmark (row) → [ text OPS (mono 18/700 ls 2 $primary) , text BOARD (mono 18/700 ls 2 $muted-foreground) ] , ref SyncStatus (ht6vH) ]

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `syncState` | SyncStatusProps |  | {state:'synced'} | Forwarded to the SyncStatus child |
| `chrome` | boolean |  | false | When true adds bg-muted + border-bottom + sticky; default false matches the bare-row screen rendering |

**Variants:** `default (bare transparent row)`, `chrome (bg-muted + border-bottom, optional)`

**States:** `default`, `syncing (via child)`, `offline (via child)`

**Tokens:** `$primary`, `$muted-foreground`

**A11y:** role=banner; SyncStatus label is the accessible sync signal; No action buttons to label on mobile (voice FAB is the input affordance, separate)

## MobileHeader (organism — mobile chrome)

Compact mobile rendition of the app header: wordmark + SyncStatus, no action icons, no '+ Mission'. On the mobile Category board it is a **bare flex row inside the page padding** (no sticky bar, no bg-muted, no bottom border) — a deliberate divergence from desktop chrome.

**Anatomy** (canonical id `Na4yA`):
```
MobileHeader  fill_container  justify-between  items-center
├─ Wordmark (row)
│  ├─ OPS    text mono 18/700 ls 2  $primary
│  └─ BOARD  text mono 18/700 ls 2  $muted-foreground
└─ SyncStatus  → ref ht6vH
```

**Exact values:** wordmark JetBrains Mono 18px / 700 / letter-spacing 2px (larger glyph, tighter tracking than desktop's 16/4). SyncStatus = green dot + `SYNCED` mono 10/500 ls 1.5. The showcase wraps it in a 390px frame with padding [16,20] to demonstrate the mobile page gutter; on the live mobile board (h9YSWg) the header sits inside the page's 24/20 padding with no own chrome.

**Variants / states:**
- `default` (mobile board + showcase): wordmark + SyncStatus, transparent, no border.
- (Model) `syncing`/`offline` propagate through the SyncStatus child.

**Reconciliation:** triage notes the mobile header 'has NO container padding/border-bottom/bg-muted — it is a bare flex row inside page padding', diverging from the §11 sticky chrome. Honor the screen: MobileHeader renders transparent/borderless by default; expose an optional `chrome` flag (bg-muted + border-bottom + sticky) for parity if a sticky mobile bar is later wanted. Wordmark is the only mobile size at 18/2 — distinct token from desktop 16/4.

**Screen usages:** Mobile Category board h9YSWg ('Header': Wordmark OPS/BOARD + Sync SYNCED); Showcase RcvKu Spec·MobileHeader (390px frame, padding [16,20])

**Reconciliation (screen ← library):** Canonical AppHeader and MobileHeader both plausibly map to the mobile header; MobileHeader is the truer match (no actions). Per triage, the live mobile rendering has no sticky chrome, so the contract defaults to transparent/borderless and gates the sticky bar behind an opt-in `chrome` prop. Wordmark sizing is mobile-specific (18/700/ls2).

---

## CategoryGroupHeader

**Kind:** molecule  ·  **maps_to (camp-404):** ADAPT camp-404 SectionHeader / the Eyebrow type token; the dot reuses the StatusDot atom recolored. Category tones come from the new $cat-* tokens (scaffolding: globals.css adds cat tokens).  ·  **maps_to (shadcn):** No shadcn component; a labeled heading row. Dot = span; Label = mono text; Count = muted mono. Pairs with CategoryTag (Badge) which uses the same tokens.
  ·  **composes:** StatusDot (recolored ellipse), Eyebrow/Label type token

**Anatomy:** frame CategoryGroupHeader (row, gap 8, items-center) → [ ellipse Dot (8×8, fill $cat-{x}) , text Label (mono 12/700 ls 1.5, fill $cat-{x}, e.g. 'MEDICAL') , text Count (mono 12/normal, fill $muted-foreground-subtle, e.g. '2/4') ]

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `category` | 'medical'|'bureaucratic'|'travel'|'gear'|'tech' | ✓ | — | Selects the dot+label color token and the label text |
| `label` | string |  | category.toUpperCase() | Override display label; defaults to uppercase category name |
| `done` | number | ✓ | — | Completed task count in the group |
| `total` | number | ✓ | — | Total task count in the group; rendered as done/total |

**Variants:** `medical`, `bureaucratic`, `travel`, `gear`, `tech`

**States:** `default (per category)`

**Tokens:** `$cat-medical`, `$cat-bureaucratic`, `$cat-travel`, `$cat-gear`, `$cat-tech`, `$muted-foreground-subtle`

**A11y:** Render as a section heading (role=heading or <h2>) so the grouped task list is navigable; Dot is decorative/aria-hidden; the colored label text carries the category name redundantly (not color-only); Count is meta, can be aria-label'd as 'N of M done'

## CategoryGroupHeader (molecule)

Group divider for the Category view (and mobile Category): an 8px category-colored dot + the category name in its color + a `{done}/{total}` count in dim. Five category color tokens.

**Anatomy** (canonical id `TIDIA`):
```
CategoryGroupHeader  (row, gap 8, items-center)
├─ Dot    ellipse 8×8  fill $cat-{x}
├─ Label  text mono 12/700 ls 1.5  fill $cat-{x}   "MEDICAL"
└─ Count  text mono 12/normal       fill $muted-foreground-subtle   "2/4"
```

**Exact values:** dot 8×8px; gap 8px; Label JetBrains Mono 12px / 700 / ls 1.5 / uppercase, colored with the category token; Count mono 12px / normal, `$muted-foreground-subtle`. Dot fill and Label fill use the SAME category token (redundant color channel).

**Category color set (the 5 variants — §4):**
- MEDICAL → `$cat-medical` (#e05a9f)
- BUREAUCRATIC → `$cat-bureaucratic` (#5aa0e0)
- TRAVEL → `$cat-travel` (#5ae0a0)
- GEAR → `$cat-gear` (#e0c05a)
- TECH → `$cat-tech` (#a05ae0)

**Sort order:** Medical · Bureaucratic · Travel · Gear · Tech (seeded sort_order; empty groups skipped — §11 Category view). Count is `{done}/{total}` for that group.

**Variants / states:** one per category (5). No interactive states (read-only divider). Naming drift: Category board D3JA0i uses child names GLabel/GCount vs canonical Label/Count — cosmetic, normalize to Label/Count for codegen.

**Screen usages:** Category board D3JA0i (5 group headers, GLabel/GCount drift); Mobile Category h9YSWg (5 headers, sort Medical→Tech); Dependencies b1b079 (category labels reused in CategoryTag context); Showcase RcvKu Spec·CategoryGroupHeader (MEDICAL 2/4 reference)

**Reconciliation (screen ← library):** Canonical and screens agree on structure; only the child-node naming drifts (GLabel/GCount vs Label/Count) — adopt canonical names. The 5-color matrix is fixed by §4 tokens; the dot and label must always share the same category token. Empty groups are skipped by the consuming list, not the component.

---

## ViewTabs

**Kind:** molecule  ·  **maps_to (camp-404):** LIFT camp-404 segmented-control.tsx (design-brief §14 maps ViewTabs → SegmentedControl). Re-skin to underline style via tokens; this is the OpsBoard view switch.  ·  **maps_to (shadcn):** shadcn Tabs (TabsList/TabsTrigger) styled as underline tabs, or the camp-404 SegmentedControl. §1 of brief: 'Tabs/SegmentedControl' maps 1:1.
  ·  **composes:** SegmentedControl (camp-404), Label/Eyebrow mono token

**Anatomy:** frame ViewTabs (fill_container, fill $muted, border-bottom 1 $border inner, gap 28, padding [0,32], items-center) → [ frame Tab Active (border-bottom 2 $primary inner, padding [14,0]) → text L (mono 12/700 ls 1.5 $primary 'BY CATEGORY') , frame Tab (padding [14,0]) → text L (mono 12/700 ls 1.5 $muted-foreground 'TIMELINE') , frame Tab (padding [14,0]) → text L (mono 12/700 ls 1.5 $muted-foreground 'DEPENDENCIES') ]

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `value` | 'category'|'timeline'|'dependencies' | ✓ | 'category' | Active view |
| `onValueChange` | (v)=>void | ✓ | — | Switch view callback |
| `tabs` | {value,label}[] |  | [BY CATEGORY, TIMELINE, DEPENDENCIES] | Fixed 3-tab set |

**Variants:** `active=category`, `active=timeline`, `active=dependencies`

**States:** `tab:active`, `tab:inactive`, `tab:hover`, `tab:focus-visible`

**Tokens:** `$muted`, `$border`, `$primary`, `$muted-foreground`

**A11y:** role=tablist with role=tab children; aria-selected on the active tab; arrow-key navigation between tabs; Active state must be conveyed beyond color — the underline + aria-selected provide redundant non-color cues; focus-visible ring (ring token = $primary) on keyboard focus; Each tab labels the view region it controls (aria-controls)

## ViewTabs (molecule — segmented view switch)

The view switcher between the three core views: `BY CATEGORY · TIMELINE · DEPENDENCIES`. Underline-style segmented control; bottom-bordered bar.

**Anatomy** (canonical id `bPiGP`):
```
ViewTabs  fill_container  bg $muted  border-b 1 $border (inner)  gap 28  padding [0,32]  items-center
├─ Tab Active  border-b 2 $primary (inner)  padding [14,0]
│  └─ L  text mono 12/700 ls 1.5  $primary        "BY CATEGORY"
├─ Tab         padding [14,0]
│  └─ L  text mono 12/700 ls 1.5  $muted-foreground "TIMELINE"
└─ Tab         padding [14,0]
   └─ L  text mono 12/700 ls 1.5  $muted-foreground "DEPENDENCIES"
```

**Exact values:** bar fill `$muted`, border-bottom 1px `$border`; inter-tab gap 28px; bar padding 0×32px; each tab padding 14px(y)×0; label JetBrains Mono 12px / 700 / ls 1.5 / uppercase. Active tab: label `$primary` + 2px `$primary` bottom border. Inactive tab: label `$muted-foreground`, no border.

**The three tabs (fixed):** `BY CATEGORY`, `TIMELINE`, `DEPENDENCIES`. One is active at a time (matches the active board).

**Variants / states:**
- per-tab: `active` (primary label + 2px primary underline), `inactive` (muted label, no underline), `hover` (label → foreground/primary, optional underline preview).
- which-active: BY CATEGORY (Category board), TIMELINE (Timeline board), DEPENDENCIES (Dependencies board) — all three observed.

**Drift to resolve (P0):** on the Category and Dependencies boards the *inactive* tabs carry a stray `stroke:$primary` with **no strokeWidth/side** (only the active tab has bottom:2). This is a leftover artifact — inactive tabs must have **no primary stroke**. Canonical showcase `bPiGP` is correct (inactive tabs have no stroke); build to the showcase, drop the stray stroke.

**Screen usages:** Category board D3JA0i (BY CATEGORY active; stray inactive stroke drift); Timeline board a3Dgz (TIMELINE active); Dependencies board b1b079 (DEPENDENCIES active; stray inactive stroke drift); Showcase RcvKu Spec·ViewTabs (BY CATEGORY active, canonical)

**Reconciliation (screen ← library):** Canonical/showcase is clean; the two product boards leak a stray inactive `stroke:$primary` (no width/side). Per the source-of-truth rule the screen wins where intentional, but this is an artifact (no visible effect, no strokeWidth) flagged in triage — build to the showcase (inactive = no stroke). Underline-tab style is the agreed reconciliation of SegmentedControl into ViewTabs.

---

## MissionDetailHeader

**Kind:** organism  ·  **maps_to (camp-404):** LIFT camp-404 detail-header.tsx + stat-tile.tsx; ADAPT progress-bar.tsx (amber 'closing' segment → 3 segments). design-brief §14 lists DetailHeader/StatTile as lift-verbatim and ProgressBar as adapt.  ·  **maps_to (shadcn):** Composition of shadcn-ish primitives: heading + Progress (shadcn Progress, extended to 3 segments) + a StatTile cluster (camp-404). Not a single shadcn component.
  ·  **composes:** StatTile (camp-404 h2sG4m), ProgressBar (camp-404 fehXu, 3-segment), StatusDot (optional live dot)

**Anatomy:** frame MissionDetailHeader (fill_container, fill $background, border-bottom 1 $border inner, vertical, gap 16, padding [24,32]) → [ text Title (DM Sans 26/700 $foreground 'AfrikaBurn 2026') , text Target (mono 13/500 ls 1 $muted-foreground 'TARGET: 2026-04-27') , frame Stats (row, gap 32) → 4× ref StatTile (h2sG4m): DONE($success), BLOCKED($destructive), CLOSING($warning), TOTAL(default) , ref ProgressBar (fehXu, fill_container) ]

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `title` | string | ✓ | — | Mission name (DM Sans 26/700) |
| `targetLabel` | string | ✓ | — | Target line; default 'TARGET: {ISO}', accepts human+location form |
| `liveDot` | boolean |  | false | Leading success dot before title (Dependencies/Timeline boards) |
| `stats` | {done,blocked,closing,total} | ✓ | — | The 4 stat-tile counts |
| `progress` | {done,closing,blocked,total} | ✓ | — | 3-segment ProgressBar inputs (success/warning/destructive) |
| `density` | 'comfortable'|'fused-card'|'bare' |  | 'comfortable' | Desktop bordered vs mobile fused card vs bare inline block |
| `complete` | boolean |  | false | All-done: full success progress + optional COMPLETE pill |

**Variants:** `populated`, `all-done (COMPLETE)`, `mobile fused-card`, `desktop bare (live dot + location target)`

**States:** `populated`, `all-done`

**Tokens:** `$background`, `$border`, `$foreground`, `$muted-foreground`, `$success`, `$destructive`, `$warning`, `$card-elevated`, `$muted-foreground-subtle`

**A11y:** Title as the page/section heading (h1/h2); Stat values must pair with their text labels (DONE/BLOCKED/CLOSING/TOTAL) — color is redundant, never the only signal; ProgressBar exposes role=progressbar with aria-valuenow/max and a text summary; Read-only: no interactive affordances (no edit)

## MissionDetailHeader (organism)

At-a-glance mission status block at the top of the main column: title, real-world target date, a 4-stat row, and a 3-segment progress bar. Read-only (mission edit moved to voice/MCP).

**Anatomy** (canonical id `uJ5hm`):
```
MissionDetailHeader  fill_container  bg $background  border-b 1 $border (inner)  vertical  gap 16  padding [24,32]
├─ Title    text DM Sans 26/700  $foreground   "AfrikaBurn 2026"
├─ Target   text mono 13/500 ls 1  $muted-foreground  "TARGET: 2026-04-27"
├─ Stats    (row, gap 32)
│  ├─ StatTile DONE     value $success      label "DONE"
│  ├─ StatTile BLOCKED  value $destructive   label "BLOCKED"
│  ├─ StatTile CLOSING  value $warning       label "CLOSING"
│  └─ StatTile TOTAL    value (default)       label "TOTAL"
└─ Progress  → ref ProgressBar (fehXu)  fill_container  (3-segment: success/warning/destructive over $card-elevated)
```

**Exact values:** padding 24×32px; gap 16px; bottom border 1px `$border`; fill `$background`. Title DM Sans 26px/700 (= `--text-title`). Target mono 13px/500/ls1 — canonical format `TARGET: 2026-04-27` (uppercase ISO). Stats row gap 32px; StatTile value font 30px (canonical StatTile `omxBe`), label `--text-caption` in muted-subtle. ProgressBar 4px, 3 segments over `$card-elevated`.

**The 4 stat tiles (fixed):** DONE (value `$success`) · BLOCKED (value `$destructive`) · CLOSING (value `$warning`) · TOTAL (value default `$foreground`). These map to §11's Done/Blocked/Closing/Total stats row — note 'Closing' replaces the prototype's 'Days overdue'.

**Variants / states:**
- `populated` (default).
- `all-done`: progress full `$success`, optional `COMPLETE` pill.
- Mobile-fused variant (h9YSWg): MissionDetailHeader + MissionSummaryCard + StatTiles + ProgressBar collapse into ONE `$card` block — name (DM Sans 17/600), `TARGET: 2026-04-27` mono 11/500, 4 inline bare stat tiles, hardcoded-width 3-segment progress. The mobile rendering uses no tile surface and packed widths.
- Dependencies/Timeline desktop variant: adds a leading **live dot** before the title, a richer target LINE with a LOCATION suffix, title 25/600 (vs 26/700), and drops the bordered/padded wrapper. Stat values render at 22px (board) vs 30px (canonical StatTile) — three sizes for the same block exist across the system.

**Reconciliation:** screens are authoritative; widen the contract: (1) optional `liveDot` before the title; (2) `target` accepts both the canonical `TARGET: 2026-04-27` and a human/location-augmented form (`Target: 27 Apr 2026 · Tankwa Karoo`) — expose `targetLabel` as free string, default to ISO; (3) `density` prop (`comfortable` desktop with border/padding, `fused-card` mobile, `bare` for the Dependencies/Timeline inline block); (4) StatTile value size normalizes to the StatTile token (30px) — flag the board 22px as drift; (5) the BLOCKED stat value uses `$destructive` per canonical, even though §9 keeps blocked muted-not-red elsewhere — note this header-stat exception. The 4 stat tiles are fixed (DONE/BLOCKED/CLOSING/TOTAL).

**Screen usages:** Category board D3JA0i (Mission Detail Header; stat values 22px drift); Timeline board a3Dgz (live dot + target line with location, bare wrapper); Dependencies board b1b079 (title + 4 StatTiles incl. destructive BLOCKED + 3-seg progress); Mobile Category h9YSWg (fused $card: name 17/600, TARGET, 4 inline stats, hardcoded progress widths); Showcase RcvKu Spec·MissionDetailHeader (canonical: AfrikaBurn 2026, ISO target, 4 StatTiles, ProgressBar ref)

**Reconciliation (screen ← library):** Heavy multi-board drift: this block overlaps MissionSummaryCard AND MissionDetailHeader. Reconciled into one component with a `density` prop (comfortable/fused-card/bare), an optional `liveDot`, and a free-form `targetLabel` (ISO default, human+location accepted). StatTile value size unified to the 30px StatTile token (board 22px/20px flagged as drift). BLOCKED stat keeps $destructive here (a documented exception to §9's muted-blocked treatment, which applies to task cards not header stats). The 4 stat tiles are a fixed DONE/BLOCKED/CLOSING/TOTAL set.

---

## Sidebar

**Kind:** organism  ·  **maps_to (camp-404):** ADAPT camp-404 nav-card.tsx (orange active + window-summary chip per scaffolding manifest). Sidebar container is a new thin organism; MISSIONS label uses the Eyebrow token. StatusDot for the chip dot.  ·  **maps_to (shadcn):** No single shadcn primitive; <nav> + a list of NavCard (Card-like) rows. The window-summary chip is a Badge variant (aggregate). Selection is button/link semantics.
  ·  **composes:** NavCard (camp-404 zDpJJ), StatusDot (chip dot), WindowStatePill (aggregate/summary mode for the meta chip), Eyebrow token, EmptyState (empty), Skeleton (loading)

**Anatomy:** frame Sidebar (clip, width 280, fill $muted, border-right 1 $border inner, vertical) → [ frame SidebarHeader (fill_container, padding 18) → text Label (mono 11/700 ls 2 $muted-foreground-subtle 'MISSIONS') , frame MissionList (fill_container, vertical, gap 8, padding [0,8]) → N× ref NavCard (zDpJJ): active (fill #ff6b351f / $primary border) + inactive ] 

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `missions` | Mission[] | ✓ | — | List of missions to render as NavCards |
| `activeMissionId` | string | ✓ | — | Currently selected mission |
| `onSelect` | (id)=>void | ✓ | — | Select-mission callback |
| `headerCount` | number|string |  | undefined | Optional trailing count in SidebarHeader (e.g. 04) |
| `width` | number |  | 280 | Rail width px |
| `activeStyle` | 'full-border'|'left-accent' |  | 'left-accent' | NavCard active treatment; left-accent matches the boards |

**Variants:** `canonical (full primary-border active, 'tasks' suffix)`, `board (left-accent active, header count, no 'tasks' word, 4 missions)`

**States:** `NavCard active`, `NavCard inactive`, `NavCard hover`, `empty (no missions → EmptyState)`, `loading (skeleton rows)`

**Tokens:** `$muted`, `$border`, `$primary`, `$card-elevated`, `$card`, `$foreground`, `$muted-foreground`, `$muted-foreground-subtle`, `$warning`, `$success`

**A11y:** role=navigation (mission list); NavCards are links/buttons with aria-current on the active mission; Active mission conveyed by aria-current + the accent border (non-color redundancy); Window-summary chip text (e.g. '1 CLOSED · 2 CLOSING') is readable meta, not color-only; Scrollable list keeps keyboard focus order top→bottom; 44px min row touch target

## Sidebar (organism — 280px mission rail)

Fixed-width left rail listing missions; selection drives the main view. `bg-muted`, right hairline border, 280px wide (flex-shrink-0). Composes NavCard rows.

**Anatomy** (canonical id `thUh3`):
```
Sidebar  width 280  bg $muted  border-r 1 $border (inner)  vertical  clip
├─ SidebarHeader  fill_container  padding 18
│  └─ Label  text mono 11/700 ls 2  $muted-foreground-subtle  "MISSIONS"
└─ MissionList  fill_container  vertical  gap 8  padding [0,8]
   ├─ NavCard (active)    fill #ff6b351f  border $primary   name + meta '{done}/{total} tasks'
   ├─ NavCard (inactive)  name + meta
   └─ NavCard (inactive)  …
```

**Exact values:** width 280px; fill `$muted`; right border 1px `$border`; header padding 18px; MISSIONS label mono 11px/700/ls2 `$muted-foreground-subtle`; list gap 8px, padding 0×8px. Each NavCard: mission name DM Sans `--text-subtitle`/600, meta line = a window-summary chip + `{done}/{total} tasks` (mono caption, muted).

**NavCard states (per §11 sidebar):**
- `active`: `bg-primary/12` (#ff6b351f) + `border-primary` (canonical uses full border; Dependencies board uses a 3px LEFT accent border + `$card-elevated` fill).
- `inactive/hover`: `bg-card` (or `$muted`) + visible `$border`.

**Window-summary chip (NavCard meta — aggregate, NOT a per-task pill):** observed strings: `1 CLOSED · 2 CLOSING` (warning dot+text), `ON TRACK`, `COMPLETE`, `3 OPEN`, and the brief's `T-12d`. These are aggregate mission summaries with a leading colored dot — distinct from the per-task WindowStatePill set (open/closing/closed/not-yet).

**Variants / states:**
- Canonical Sidebar (showcase/batch3): fill $muted, MISSIONS 700/ls2, 3 NavCards, meta `{n}/{m} tasks`.
- Dependencies/Timeline board variant: gap 16 + padding 16 container; header is a space_between row with a COUNT (e.g. `04`); MISSIONS rendered weight normal; each mission row uses a **left accent rectangle/border** (active = 3px $primary on $card-elevated), a window-summary chip (dot + aggregate string), and a `{done}/{total}` count with no 'tasks' word; 4 missions (AfrikaBurn active, Patagonia, Schengen, Kilimanjaro).

**Reconciliation:** screens are authoritative — widen Sidebar/NavCard: (1) NavCard active state supports BOTH a full primary border (canonical) and a left-accent 3px border + card-elevated fill (boards) — expose `activeStyle`; (2) SidebarHeader gains an optional trailing `count` (e.g. `04`); (3) the meta line accepts both `{done}/{total} tasks` and `{done}/{total}` (no word) — keep the brief's 'tasks' suffix as default; (4) NavCard window-summary chip is an aggregate-mode chip (dot + free string), separate from the per-task WindowStatePill — document as `NavCard.windowSummary`. Use `bg-primary/12` (#ff6b351f) for active tint per the /12 alpha convention.

**Screen usages:** Category board D3JA0i (280px rail, MISSIONS, 1 active NavCard shown); Timeline board a3Dgz (MISSIONS + 04 count, 4 NavCards, left accent bar, window chips '1 CLOSING'/'T-12d'); Dependencies board b1b079 (4 NavCards: AfrikaBurn active 4/10 + '1 CLOSED · 2 CLOSING' warning chip; Patagonia/Schengen/Kilimanjaro with ON TRACK/COMPLETE/3 OPEN chips); Showcase RcvKu Spec·Sidebar (canonical container + NavCard composition)

**Reconciliation (screen ← library):** Canonical Sidebar (fill $muted, NavCard refs, 'tasks' suffix, 3 missions) diverges from the boards (left-accent active border, $background/$muted mix, header COUNT, 4 missions, '{n}/{m}' without 'tasks'). Per source-of-truth the board renderings win — contract adds `headerCount`, `activeStyle='left-accent'` default, and an aggregate `windowSummary` chip on NavCard. The aggregate chip strings (1 CLOSED·2 CLOSING / ON TRACK / COMPLETE / 3 OPEN) are explicitly a NavCard summary-mode chip, NOT the per-task WindowStatePill taxonomy — keep them as distinct components.

---

## TimelineWeekHeader

**Kind:** molecule  ·  **maps_to (camp-404):** New molecule (scaffolding flags TimelineWeekHeader as a NEW registered component). DaysPill = a Badge variant; Range/Rule use Eyebrow + Divider primitives (Divider is lift-verbatim).  ·  **maps_to (shadcn):** No shadcn primitive; compose mono text + a Badge (pill) + an <hr>/Separator. DaysPill maps to shadcn Badge styled as a full-radius pill.
  ·  **composes:** Badge (DaysPill), Divider/Separator (Rule), Eyebrow token (Range)

**Anatomy:** frame TimelineWeekHeader (fill_container, row, gap 12, items-center) → [ text Range (mono 11/normal ls 1.5 $muted-foreground 'JUN 01 – JUN 07') , frame DaysPill (fill $muted, radius 100, border 1, padding [2,8], items-center) → text DaysLbl (mono 10/normal ls 1, e.g. 'THIS WEEK') , rectangle Rule (fill $border, fill_container ×1) ]

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `rangeLabel` | string | ✓ | — | ISO-week range, e.g. 'JUN 01 – JUN 07' or 'NO CLIFF' |
| `state` | 'this-week'|'closing'|'future'|'closed'|'no-cliff' | ✓ | — | Drives pill+range color and default label |
| `daysLabel` | string |  | derived | Pill text e.g. 'THIS WEEK'|'IN 5D'|'WINDOW CLOSED'|'UNSCHEDULED' |

**Variants:** `this-week (primary)`, `closing IN {n}D (primary)`, `future IN {n}D (muted)`, `closed WINDOW CLOSED (subtle)`, `no-cliff / UNSCHEDULED (subtle)`

**States:** `this-week`, `closing`, `future`, `closed`, `no-cliff`

**Tokens:** `$muted`, `$border`, `$primary`, `$muted-foreground`, `$muted-foreground-subtle`

**A11y:** Render as a section heading for its bucket so the timeline is navigable by week; DaysPill text (THIS WEEK / IN 5D / WINDOW CLOSED) is the accessible state — color is redundant, not the only cue; Decorative rule is aria-hidden

## TimelineWeekHeader (molecule)

Week-section header for the Timeline view: an ISO-week date range + a days-until/state pill + a trailing horizontal rule. Recurs ~6× per timeline.

**Anatomy** (canonical id `n4lLE`):
```
TimelineWeekHeader  fill_container  (row, gap 12, items-center)
├─ Range    text mono 11/normal ls 1.5  $muted-foreground   "JUN 01 – JUN 07"
├─ DaysPill frame  fill $muted  radius 100  border 1 (inner)  padding [2,8]
│  └─ DaysLbl  text mono 10/normal ls 1   "THIS WEEK"
└─ Rule     rectangle  fill $border  fill_container × 1px
```

**Exact values:** row gap 12px; Range mono 11px/normal/ls1.5/uppercase; DaysPill radius 100 (full), padding 2×8px, border 1px; DaysLbl mono 10px/normal/ls1; Rule 1px `$border` filling remaining width.

**DaysPill state matrix (UNION across the Timeline board + showcase — this is the window-state taxonomy projected onto weeks):**
- `this-week`: pill border `$primary`, label `$primary`, Range `$primary`, text `THIS WEEK` (the highlighted current week).
- `future-closing` (≤7d / closing): border `$primary`, label `$primary`, Range `$primary`, text `IN {n}D` (showcase 'IN 3D'; board 'IN 5D').
- `future`: border `$border`, label `$muted-foreground`, text `IN {n}D` (board 'IN 12D', 'IN 33D'). (Future weeks beyond the closing threshold use muted, not primary.)
- `closed/expired`: border `$border`, label `$muted-foreground-subtle`, Range `$muted-foreground-subtle`, text `WINDOW CLOSED` (past weeks — relabels the prototype's '{n}d ago').
- `no-cliff / unscheduled`: border `$border`, label `$muted-foreground-subtle`, Range `$muted-foreground` text `NO CLIFF`, pill text `UNSCHEDULED` (the trailing No-Cliff bucket).

**Reconciliation:** the showcase shows 3 named variants (default·THIS WEEK, closing·IN 3D primary, expired·WINDOW CLOSED muted). The live Timeline board adds `IN 5D` (closing, primary), `IN 12D`/`IN 33D` (future, muted) and the `NO CLIFF`/`UNSCHEDULED` pair. Unify into one `state` prop: `this-week | closing | future | closed | no-cliff`, where this-week+closing share the primary treatment and future+closed+no-cliff share muted (subtle). DaysPill recolors border+label+range together (redundant channels). Range text and pill label are both required.

**Screen usages:** Timeline board a3Dgz (6 buckets: WINDOW CLOSED / THIS WEEK / IN 5D / IN 12D / IN 33D / UNSCHEDULED-NO CLIFF); Showcase RcvKu Spec·TimelineWeekHeader (default THIS WEEK, closing IN 3D, expired WINDOW CLOSED); TimelineBucket composes it as the Header ref (BcutX)

**Reconciliation (screen ← library):** Canonical n4lLE is the single-state default; widened to a 5-state matrix to cover every Timeline-board rendering (added future-muted IN {n}D, the closing-primary IN {n}D, and the no-cliff/UNSCHEDULED pair). The showcase confirms the primary-vs-muted split. NoCliffBucket is NOT a separate component — it is this header in its no-cliff/UNSCHEDULED state (per showcase 'FOLDED' note).

---

## DependencyConnector

**Kind:** atom  ·  **maps_to (camp-404):** No camp-404 atom; new tiny icon-cell using the lucide corner-down-right icon. design-brief §8/§11 specify the connector. Critical-path coloring uses $primary token.  ·  **maps_to (shadcn):** No shadcn primitive; a fixed-size flex cell wrapping a lucide icon. Not a Badge.
  ·  **composes:** lucide corner-down-right icon

**Anatomy:** frame DependencyConnector (width 36, height 38, justify center, items-center) → icon Glyph (18×18, lucide corner-down-right, fill $muted-foreground-subtle)

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `variant` | 'default'|'critical' |  | 'default' | default=muted-subtle glyph; critical=$primary glyph (critical path) |

**Variants:** `default (muted-subtle)`, `critical ($primary)`

**States:** `default`, `critical`

**Tokens:** `$muted-foreground-subtle`, `$primary`

**A11y:** Glyph is decorative (aria-hidden); dependency relationship is conveyed structurally by tree nesting + the blocked-by reason line, not by the connector color alone; Critical-path emphasis must be paired with the legend chip text so it is not color-only

## DependencyConnector (atom)

The `↳` connector glyph that prefixes a dependent (depth > 0) node in the Dependencies tree. A fixed 36×38 cell holding an 18px `corner-down-right` lucide icon.

**Anatomy** (canonical id `P5mv8T`):
```
DependencyConnector  width 36  height 38  justify-center  items-center
└─ Glyph  icon 18×18  lucide corner-down-right  fill $muted-foreground-subtle
```

**Exact values:** cell 36×38px (the 36px width = one indent unit, matching `depth × 36px` indentation); glyph 18×18px lucide `corner-down-right`. Default fill `$muted-foreground-subtle`.

**Variants / states:**
- `default`: glyph `$muted-foreground-subtle` (neutral connector).
- `critical` (= the folded CriticalPathAccent): glyph `$primary` — marks a node on the critical path (longest chain to target). Shown on the Dependencies board for 'Submit visa application' + 'Collect passport' rows, with a legend chip `↳ CRITICAL PATH` (primary corner-down-right 14px + primary mono 10/normal ls1 label).

**Depth/indent encoding:** depth is rendered as repeated 36px-wide empty `Indent` spacer frames (height 1) prepended before the connector — depth 2 = 1 Indent + Connector; deeper = N indents. (Triage flags the repeated-spacer idiom vs a `depth × 36` padding approach — the screen uses spacers; the component contract should expose `depth` and let DependencyTreeNode render `depth-1` spacers + 1 connector, equivalent to the screen's 36px-multiple indentation.)

**Reconciliation:** canonical is the single neutral glyph cell. Widen with a `variant: 'default' | 'critical'` (critical = fill `$primary`) per the showcase 2-variant matrix (DEFAULT / CRITICAL·$primary). CriticalPathAccent is NOT a separate component — it is this connector recolored (showcase 'FOLDED' note). The CRITICAL PATH legend chip is a sibling label, not part of the connector.

**Screen usages:** Dependencies board b1b079 (6 connectors: 3 muted-subtle normal + 3 primary critical-path; depth-2 rows prefix a 36px Indent spacer; CRITICAL PATH legend chip); Showcase RcvKu Spec·DependencyConnector (DEFAULT + CRITICAL·$primary variants); DependencyTreeNode composes it (Pjd8i ref)

**Reconciliation (screen ← library):** Canonical single-glyph widened to default/critical per showcase. Depth indentation on the board uses repeated 36px Indent spacer frames before the connector; the contract models depth via DependencyTreeNode rendering (depth-1) spacers + connector, equivalent to §11's depth×36px. CriticalPathAccent is folded into this atom's critical variant, not a new component.

---

## UnlinkedGroupHeader

**Kind:** molecule  ·  **maps_to (camp-404):** New molecule (scaffolding: UnlinkedGroupHeader is a NEW registered component, also called UnlinkedGroup in the usage map). Reuses the Eyebrow mono token + a lucide unlink icon.  ·  **maps_to (shadcn):** No shadcn primitive; a heading row = lucide icon + two mono text spans.
  ·  **composes:** Eyebrow/Label mono token, lucide unlink icon

**Anatomy:** frame UnlinkedGroupHeader (fill_container, row, gap 8, items-center) → [ icon Icon (13×13, lucide unlink, fill $muted-foreground-subtle) , text Label (mono 11/normal ls 1.5 $muted-foreground 'UNLINKED') , text Count (mono 11/normal ls 1 $muted-foreground-subtle '· 2 TASKS · NO DEPENDENCIES') ]

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `count` | number | ✓ | — | Number of unlinked tasks; rendered into the '· {n} TASKS · NO DEPENDENCIES' suffix |
| `label` | string |  | 'UNLINKED' | Group label text |

**Variants:** `default`

**States:** `default`

**Tokens:** `$muted-foreground-subtle`, `$muted-foreground`

**A11y:** Render as a section heading so the unlinked group is reachable; unlink icon is decorative/aria-hidden; the UNLINKED label + count carry the meaning textually; Count suffix readable as 'N tasks, no dependencies'

## UnlinkedGroupHeader (molecule)

Section break in the Dependencies tree for tasks with no dependency edges. `unlink` icon + `UNLINKED` mono label + a count/qualifier suffix. Distinct from the `DEPENDENCY TREE` label; it is the tree's terminal group header.

**Anatomy** (canonical id `x00J9`):
```
UnlinkedGroupHeader  fill_container  (row, gap 8, items-center)
├─ Icon   icon 13×13  lucide unlink  $muted-foreground-subtle
├─ Label  text mono 11/normal ls 1.5  $muted-foreground  "UNLINKED"
└─ Count  text mono 11/normal ls 1  $muted-foreground-subtle  "· 2 TASKS · NO DEPENDENCIES"
```

**Exact values:** gap 8px; icon 13×13 lucide `unlink` `$muted-foreground-subtle`; Label mono 11px/normal/ls1.5/uppercase `$muted-foreground`; Count mono 11px/normal/ls1 `$muted-foreground-subtle`, format `· {n} TASKS · NO DEPENDENCIES`. On the Dependencies board the header carries a top padding of 10px to separate it from the tree above.

**Variants / states:** single visual (always muted/subtle). Count text parametrized by the unlinked-task count (`· 2 TASKS · NO DEPENDENCIES`). No interactive state (read-only divider).

**Screen usages:** Dependencies board b1b079 ('Unlinked Head': unlink + UNLINKED + '· 2 TASKS · NO DEPENDENCIES', top-padding 10); Showcase RcvKu Spec·UnlinkedGroupHeader (canonical reference)

**Reconciliation (screen ← library):** Canonical and board are identical in structure/values; the board adds a 10px top padding for spacing (layout concern, not a variant). Usage map calls it 'UnlinkedGroup'; canonical name is UnlinkedGroupHeader — adopt the canonical name.

---

## TimelineBucket

**Kind:** organism  ·  **maps_to (camp-404):** New organism (scaffolding: TimelineBucket NEW component). Pure composition over TimelineWeekHeader + the adapted TaskCard. ops-board.html renderTimelineView ports the bucketing algorithm.  ·  **maps_to (shadcn):** No shadcn primitive; a <section> stacking a header molecule + a list of TaskCard. Not itself a shadcn component.
  ·  **composes:** TimelineWeekHeader (n4lLE), TaskCard (QfQXv)

**Anatomy:** frame TimelineBucket (fill_container, vertical, gap 8) → [ ref TimelineWeekHeader (n4lLE, Header, fill_container) , frame Cards (fill_container, vertical, gap 6) → N× ref TaskCard (QfQXv, fill_container) ]

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `header` | TimelineWeekHeaderProps | ✓ | — | Range + state for the bucket's week header |
| `tasks` | Task[] | ✓ | — | Tasks in this week, rendered as TaskCard stack |

**Variants:** `populated week`, `no-cliff (UNSCHEDULED) bucket`

**States:** `populated`, `no-cliff`, `empty (omitted)`

**Tokens:** `(inherits TimelineWeekHeader + TaskCard tokens)`

**A11y:** Bucket is a section labelled by its TimelineWeekHeader heading; Card list keeps logical reading/tab order top→bottom; Each TaskCard's StatusCycleButton remains the only interactive element

## TimelineBucket (organism)

A week-section container for the Timeline view: a `TimelineWeekHeader` followed by a vertical stack of `TaskCard` instances. Recurs once per ISO week (~6×). The trailing No-Cliff bucket is this same component with the header in its no-cliff/UNSCHEDULED state — NOT a separate component.

**Anatomy** (canonical id `Y1tT9d`):
```
TimelineBucket  fill_container  vertical  gap 8
├─ Header  → ref TimelineWeekHeader (n4lLE)  fill_container
└─ Cards   fill_container  vertical  gap 6
   ├─ TaskCard  → ref QfQXv  fill_container
   └─ TaskCard  → ref QfQXv  fill_container
```

**Exact values:** outer gap 8px (header→cards); Cards inner gap 6px between task cards. Width fill_container. Card count is data-driven (Timeline board buckets hold 1–3 cards each).

**Bucket ordering (Timeline view algorithm, §11):** buckets ordered by ISO week of `too_late_by` cliff, ascending: past-closed weeks → this-week → future weeks → trailing NO-CLIFF/UNSCHEDULED bucket. Board sequence observed: MAY 25–31 (WINDOW CLOSED) → JUN 01–07 (THIS WEEK) → JUN 08–14 (IN 5D) → JUN 15–21 (IN 12D) → JUL 06–12 (IN 33D) → NO CLIFF (UNSCHEDULED).

**Variants / states:**
- `populated` (default): header + ≥1 TaskCard.
- `no-cliff` (folded): header state `no-cliff`, label `UNSCHEDULED`, holds tasks without `too_late_by`.
- `empty`: a week with no tasks is omitted entirely (not rendered as an empty bucket).

**Reconciliation:** the live Timeline board inlines a bespoke `BucketHeader` + bespoke card frames rather than ref'ing TimelineWeekHeader/TaskCard (6 instances of structural drift, same intent). Build to the canonical composition (Header ref + Cards{TaskCard refs}); the bespoke board trees are pre-component ad-hoc renderings to migrate. NoCliffBucket = TimelineBucket with the header's no-cliff state (no `NoCliffBucket` component).

**Screen usages:** Timeline board a3Dgz (6 buckets, bespoke inlined headers/cards — drift); Showcase RcvKu Spec·TimelineBucket (canonical: TimelineWeekHeader ref + 2 TaskCard refs)

**Reconciliation (screen ← library):** Canonical composition (header ref + TaskCard refs) is authoritative for build; the board's 6 bespoke inlined buckets are the same intent flattened (migrate to instances). NoCliffBucket is folded into this component via the header's no-cliff state per the showcase note; empty weeks are skipped, not rendered.

---

## DependencyTreeNode

**Kind:** organism  ·  **maps_to (camp-404):** ADAPT camp-404 family-tree.ts (cycle-guarded graph template) for the tree/cycle logic; the row UI is a new organism over DependencyConnector + the adapted TaskCard. critical-path uses packages/core/critical-path.ts (scaffolding manifest).  ·  **maps_to (shadcn):** No shadcn primitive; a tree-row composition. Indentation + connector are layout; TaskCard is the content. Tree semantics via ARIA, not a shadcn Tree.
  ·  **composes:** DependencyConnector (P5mv8T), TaskCard (QfQXv), StatusCycleButton (inside TaskCard), WindowStatePill (BLOCKED/window states inside TaskCard)

**Anatomy:** frame DependencyTreeNode (fill_container, row, items-center) → [ (0..depth-1)× Indent spacer (36×1) , ref DependencyConnector (P5mv8T, Connector — omitted at depth 0) , ref TaskCard (QfQXv, Task, fill_container) ]

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `task` | Task | ✓ | — | The task rendered as the row's TaskCard |
| `depth` | number | ✓ | 0 | 0=root (no connector); >0 renders depth-1 indent spacers + 1 connector |
| `critical` | boolean |  | false | Marks node on the critical path → connector fill $primary |
| `isBackEdge` | boolean |  | false | Cycle-safety: this occurrence is a back-edge repeat, render once + mark |

**Variants:** `root (depth 0, no connector)`, `child-normal (connector muted)`, `child-critical (connector primary)`, `depth-2+ (indent spacers)`

**States:** `root`, `child`, `critical-path`, `back-edge (cycle)`, `+ inherited TaskCard status×window states`

**Tokens:** `$muted-foreground-subtle`, `$primary`, `(+ TaskCard tokens: $card, $border, $warning, $muted-foreground, $cat-*)`

**A11y:** Use role=treeitem within a role=tree, with aria-level=depth and aria-expanded where applicable, so nesting is conveyed non-visually; The blocked-by reason line ('⚠ blocked by: {names}' / 'BLOCKED BY: {name}') is the accessible dependency explanation — never rely on connector color alone; StatusCycleButton inside remains the single keyboard-focusable control per row; critical-path emphasis paired with the legend text

## DependencyTreeNode (organism)

One indented row in the Dependencies tree: optional indent spacers + a `DependencyConnector` (↳) + a `TaskCard`. Root nodes (depth 0) drop the connector; deeper nodes prepend 36px indent spacers; critical-path nodes recolor the connector to `$primary`.

**Anatomy** (canonical id `OR7jY`):
```
DependencyTreeNode  fill_container  (row, items-center)
├─ [Indent × (depth-1)]  frame 36×1   (depth>1 only)
├─ Connector  → ref DependencyConnector (P5mv8T)   (depth>0 only; default OR critical $primary)
└─ Task       → ref TaskCard (QfQXv)  fill_container
```

**Exact values:** Indent spacer 36px wide × 1px high (one indent unit); Connector cell 36×38; row items-center; tree outer gap 10px (board `Tree` frame gap). Depth 0 = TaskCard only (root). Depth 1 = Connector + TaskCard. Depth 2 = 1 Indent + Connector + TaskCard (board pattern). Indentation therefore equals `depth × 36px` (§11).

**State matrix (the 8 row combinations on the Dependencies board — UNION):** each node's TaskCard carries a status × window-state combination; the node adds tree-position state:
- `root` (depth 0, no connector)
- `child-normal` (depth>0, connector muted-subtle)
- `child-critical` (depth>0, connector `$primary`)
- `depth-2+` (extra 36px indent spacers)
- The TaskCard within shows: status (not-started / in-progress / done / blocked-substitution) and window pill (CLOSING·9D, CLOSING·4D, WINDOW CLOSED, BLOCKED, OPEN). Blocked rows substitute a triangle-alert for the status glyph (a drift vs §10's always-present StatusCycleButton — reconcile: button stays present/enabled, blocked is advisory).
- `back-edge` (cycle-safety): in a dependency cycle, each node renders once and the repeat is marked as a back-edge rather than looping (§11 cycle-safe rendering).

**Reconciliation:** screens are authoritative for the tree organism. The board renders 8 bespoke `Row · {task}` frames with a nested Left/Right structure rather than the canonical Connector+TaskCard pair, and encodes depth as literal Indent spacers. Build to the canonical composition with a `depth` prop (renders depth-1 spacers + 1 connector for depth>0, none for depth 0) and a `critical` flag forwarded to the connector. Keep the StatusCycleButton inside the TaskCard always present/enabled (blocked is advisory, not gating); the triangle-alert blocked substitution seen on the board is reconciled toward the window-state BLOCKED pill + advisory treatment, not a replacement of the cycle button.

**Screen usages:** Dependencies board b1b079 (8 tree rows incl. depth-2 with Indent spacer; 3 normal + 3 critical connectors; blocked-glyph substitution; CRITICAL PATH legend); Showcase RcvKu Spec·DependencyTreeNode (canonical: Connector ref + TaskCard ref)

**Reconciliation (screen ← library):** Canonical (Connector + TaskCard) widened with `depth` (controls spacer count + connector presence), `critical` (forwarded to connector $primary), and `isBackEdge` (cycle-safety). The board's literal Indent-spacer depth encoding is modeled by depth→(depth-1) spacers, equivalent to §11's depth×36px. The board's triangle-alert-replaces-status-button on blocked rows is reconciled toward §10 (button always present/enabled; blocked is advisory via the window-state treatment), per the LOCKED status guard rule.

---

## SectionNavChip

**Kind:** atom  ·  **maps_to (camp-404):** ADAPT camp-404 Badge (pill) into an interactive chip, or REF nav-card chip styling; design-brief §14 treats chips as Badge variants. New small atom registered for the mobile manual.  ·  **maps_to (shadcn):** shadcn Badge (variant='outline', full-radius) made clickable, or a Toggle/ToggleGroup item. Active = primary tint. Not a Tab (it's scroll-nav, not a routed tab).
  ·  **composes:** Badge (pill chrome), Label/Mono mono token

**Anatomy:** frame SectionNavChip (fill transparent, radius 999, border 1 $border inner, padding [5,12]) → text L (mono 11/500 ls 0.5 $muted-foreground 'Status')

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `label` | string | ✓ | — | Section label, sentence-case (e.g. 'Task cards') |
| `active` | boolean |  | false | Active section → primary/12 fill, $primary border, label $primary weight 700 |
| `onClick` | ()=>void |  | — | Scroll-to / activate section |

**Variants:** `default (transparent, muted label 500)`, `active (primary/12 fill, primary border, primary label 700)`

**States:** `default`, `active`, `hover (border-hover)`, `focus-visible (ring)`

**Tokens:** `$border`, `$muted-foreground`, `$primary`, `$border-hover (hover)`

**A11y:** Render as a button/link in a horizontal nav (role=navigation); aria-current='true' on the active chip; Active state conveyed by aria-current + border/weight change, not color alone; 44px min touch target on mobile (pad the hit area beyond the 5×12 visual padding); focus-visible ring uses the $primary ring token

## SectionNavChip (atom)

A pill-shaped in-page nav chip used on the **mobile Manual** screen (replaces the desktop TOC sidebar). Tapping scrolls to / activates a doc section. Mono label, full-radius border pill.

**Anatomy** (canonical id `HgKT6`):
```
SectionNavChip  fill transparent  radius 999  border 1 $border (inner)  padding [5,12]
└─ L  text mono 11/500 ls 0.5  $muted-foreground  "Status"
```

**Exact values (default):** transparent fill, full radius (999), 1px `$border`, padding 5×12px; label JetBrains Mono 11px / 500 / ls 0.5 `$muted-foreground` (NOTE: label is sentence-case 'Task cards'/'Status'/'Windows'/'Voice', NOT uppercase). On the live mobile Manual board the chips sit in a sticky `SectionNav` bar (fill `$muted`, border-bottom 1 `$border`, gap 8, padding [10,16]) and use padding [5,11] (1px tighter than canonical [5,12]).

**Variants / states (UNION — canonical + showcase active/default matrix + manual board):**
- `default`: transparent fill, `$border` border, `$muted-foreground` label weight 500.
- `active`: fill `#ff6b351f` (primary/12), border `$primary`, label `$primary` weight **700** (showcase 'Task cards' active; manual board 'Task cards' active).
- `hover`: border lifts to `$border-hover` (model-derived).
- `focus-visible`: ring `$primary`.

**Observed labels:** `Task cards` (active), `Status`, `Windows`, `Voice` (showcase); `Task cards` (active) + `Status` + `Windows` (manual board) — these mirror the manual's live-demo sections (TaskCard, StatusCycleButton, WindowState pills).

**Reconciliation:** canonical default label is uppercase-ish 'Status' but the screens use sentence-case ('Task cards', 'Windows', 'Voice') — adopt sentence-case labels (the chip is a doc-section label, not a system eyebrow). Active state is the primary/12 + primary-border + 700-weight treatment from the showcase. Canonical padding [5,12]; the manual board uses [5,11] — keep [5,12] (cosmetic 1px drift). It is the mobile counterpart of the desktop ManualTOCItem (left-border active indicator) — two patterns for the same TOC; keep both (SectionNavChip = mobile chip, ManualTOCItem = desktop row).

**Screen usages:** Mobile Manual board NMzE5 (sticky SectionNav bar: 'Task cards' active + 'Status'/'Windows'/… chips); Showcase RcvKu Spec·SectionNavChip — active + default instances ('Task cards' active, Status/Windows/Voice default); Component usage map (Account·Settings·Legal·Manual board → SectionNavChip new component)

**Reconciliation (screen ← library):** Canonical HgKT6 default ('Status', uppercase-ish, [5,12]) widened with the showcase active variant (primary/12 + $primary border + 700 label) and sentence-case labels from the screens. Manual board padding [5,11] is treated as 1px drift (keep [5,12]). It coexists with the desktop ManualTOCItem (left-border active row) — both are kept as the mobile-chip vs desktop-row patterns for the same TOC, not merged.

---
