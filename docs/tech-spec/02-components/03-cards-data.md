# Components — Cards & Data Display

*10 contracts. Screens authoritative; library reconciled toward screen usage.*

## Cmp · Card

**Kind:** atom  ·  **maps_to (camp-404):** LIFT — camp-404 `packages/ui/src/components/card.tsx` (token-driven, re-skins automatically). Scaffolding S1.  ·  **maps_to (shadcn):** shadcn/ui `Card` (new-york). Sub-parts CardHeader/CardContent/CardFooter map to the canonical `Inner` frame.
  ·  **composes:** composed-into: TaskCard, composed-into: MissionSummaryCard, composed-into: NavCard, composed-into: RecordingPanel, composed-into: Alert, composed-into: EmptyState, composed-into: Skeleton

**Anatomy:** Card (frame, clip:true, fill $card, stroke $border 1px inner, width fill_container, radius 0)
└─ Inner (frame, width fill_container, padding 14, gap 12, horizontal)
   ├─ Status (frame 18×18, stroke $border 2px inner, center) — OPTIONAL slot; in the base def it is an empty 18px box (the StatusCycleButton seat)
   └─ Col (frame, width fill_container, vertical, gap 7)
      ├─ TaskName (text, $foreground, DM Sans 15/500)
      └─ MetaRow (frame, gap 10, center)
         ├─ Tag (CategoryTag pill, fill cat/12, radius 999, padding [3,8], gap 5: dot|icon + label)
         └─ Pill (text/frame, $muted-foreground, JetBrains Mono 11)

NOTE: the base `Cmp · Card` is the generic surface primitive (a sharp bordered $card box wrapping arbitrary content). The default authored content happens to be a task-row layout (Status + Col), which is why screens collapse TaskCard ONTO this tree. As a contract, Card = the shell; the task-row content is the TaskCard organism (see TaskCard).

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `variant` | 'default'|'closing'|'blocked'|'not-yet'|'closed' |  | 'default' | Selects the surface recipe (fill/left-accent stroke/opacity) above. Driven by computed window-state, never stored. |
| `children` | ReactNode | ✓ |  | Card body content (slot). |
| `asChild` | boolean |  | false | shadcn Slot passthrough. |
| `className` | string |  |  | Tailwind overrides. |

**Variants:** `default (uniform 1px $border, $card)`, `closing (left-2 $warning)`, `blocked (left-2 $muted-foreground-subtle, opacity .6)`, `not-yet (left-2 $muted-foreground-subtle, opacity .6)`, `closed (fill $muted, left-2 $muted-foreground, opacity .55)`

**States:** `resting`, `hover (border lifts $border → $border-hover per brief §5)`, `dimmed (.6 / .55 for blocked/not-yet/closed)`

**Tokens:** `$card`, `$muted`, `$border`, `$border-hover`, `$warning`, `$muted-foreground`, `$muted-foreground-subtle`

**A11y:** Decorative container; no role of its own; Window-state never carried by color alone (icon+label in the pill provide redundancy); clip:true to contain accent fills

## Cmp · Card (surface primitive)

The foundational elevated surface. A **sharp** (`--radius:0`), 1px `border` box on the `card` fill. Every card-like organism (`TaskCard`, `MissionSummaryCard`, `NavCard`, `RecordingPanel`, `Alert`, `EmptyState`, `Skeleton`, the AI panels) is composed on this shell or shares its recipe.

### Why this contract is widened
The canonical `Cmp · Card` (id `Aipy6`) ships with a baked-in task-row body (`Inner > Status + Col(TaskName, MetaRow(Tag, Pill))`). On every product board (Category `D3JA0i` ×11, Timeline `a3Dgz` ×10, Dependencies `b1b079` ×10, Mobile `h9YSWg` ×13) the task rows are flattened nodes literally **named `Card`** that follow this tree — they are *not* the canonical `TaskCard` tree (`Touch44 > Cycle`, `Body`). The triage flags this as the single largest reconciliation: the same 11 nodes resolve to both `Card` and `TaskCard`.

**Resolution (screens authoritative):** `Card` is the generic shell only. Its `content` is a `children` slot. The task-row content is owned by the `TaskCard` organism, which renders ONTO a `Card` shell but adds the 44px touch target and the window-state recipe. Codegen: `Card` = shadcn `Card`; `TaskCard` = `Card` + composed children.

### Anatomy (shell)
```
Card(fill $card · stroke $border 1px inner · radius 0 · clip · width fill)
  └ children (default padding 14, gap 12)
```

### State-driven surface recipes (the canonical card-level treatment, lifted from the Category board)
The board encodes window-state at the **card** level via fill + left-accent stroke + opacity. This is net-new vs the uniform 1px border of the base def and MUST be captured:

| Window/status | `fill` | `stroke` | `strokeWidth` | `opacity` |
|---|---|---|---|---|
| open / in-progress / not-started | `$card` | `$border` | `1` (all sides) | 1.0 |
| closing | `$card` | `$warning` | `{left:2}` | 1.0 |
| blocked (not-yet) | `$card` | `$muted-foreground-subtle` | `{left:2}` | 0.6 |
| not-yet (not_before) | `$card` | `$muted-foreground-subtle` | `{left:2}` | 0.6 |
| closed | `$muted` | `$muted-foreground` | `{left:2}` | 0.55 |

> Three distinct dim recipes coexist on the screens (0.6 blocked/not-yet vs 0.55 closed-on-`$muted`). Both are preserved; closed is the only one that swaps the surface fill to `$muted`.

### Tokens
`$card`, `$muted`, `$border`, `$warning`, `$muted-foreground`, `$muted-foreground-subtle`, `--radius:0`.

### A11y
- Decorative surface only; semantics come from its contents.
- `clip:true` clips the progress bar / accent fills.
- Left-accent state borders must never be the *sole* state signal (they pair with the pill icon+label per LOCKED #6).

**Screen usages:** Category board D3JA0i: 11 task-row `Card` nodes (all 5 state recipes present); Timeline a3Dgz / Dependencies b1b079 / Mobile h9YSWg: task rows reuse this shell; Empty/Loading/Error TvXzz: EmptyState & Skeleton panels are Card shells; Library RcvKu: `Spec · TaskCard`, `Spec · MissionSummaryCard`

**Reconciliation (screen ← library):** Widened from a fixed task-row layout to a generic shell + a state-driven surface variant prop. The baked-in `Status + Col` body is reassigned to the `TaskCard` organism. Added the 5-row card-level state recipe (left-accent strokes, $muted closed fill, 0.6/0.55 opacity) that exists ONLY on the screens, not in the base def. The base def's `Status` 18px box (no 44px wrapper) is corrected at the TaskCard level (Touch44) for a11y.

---

## Cmp · StatTile

**Kind:** molecule  ·  **maps_to (camp-404):** LIFT — camp-404 `packages/ui/src/components/stat-tile.tsx` (token-driven). Scaffolding S1 / design-brief §14 'Lift verbatim'.  ·  **maps_to (shadcn):** No direct shadcn primitive — a small custom composite (two stacked `<span>`s). Pattern only.
  ·  **composes:** composed-into: MissionSummaryCard, composed-into: MissionDetailHeader (out-of-group organism)

**Anatomy:** StatTile (frame, vertical, gap 4)
├─ Val (text, $foreground, JetBrains Mono 30/700) — the number
└─ Lab (text, $muted-foreground-subtle, JetBrains Mono 11/600, letterSpacing 1.5) — the uppercase label

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `value` | string|number | ✓ |  | The metric (e.g. 3, 11, '04'). |
| `label` | string | ✓ |  | Uppercase caption (DONE/BLOCKED/CLOSING/TOTAL). |
| `tone` | 'foreground'|'success'|'warning'|'destructive'|'muted' |  | 'foreground' | Colour of the value. DONE=success, CLOSING=warning, BLOCKED=destructive (mobile→muted), TOTAL=foreground. |
| `size` | 'showcase'|'detail'|'summary'|'mobile' |  | 'detail' | Selects the Val/Lab type sizes per the scale table. |

**Variants:** `DONE (success)`, `BLOCKED (destructive | muted on mobile)`, `CLOSING (warning)`, `TOTAL (foreground)`, `size: showcase/detail/summary/mobile`

**States:** `static (read-only; no interactive states)`

**Tokens:** `$foreground`, `$success`, `$warning`, `$destructive`, `$muted-foreground`, `$muted-foreground-subtle`

**A11y:** Pair value+label as a group; expose label as the accessible name (e.g. aria-label='Done: 3'); Number alone is meaningless without its label — never drop the Lab

## Cmp · StatTile

A single labelled metric: a big mono number over a tracked uppercase caption. Used in clusters of 4 (DONE · BLOCKED · CLOSING · TOTAL) inside the mission detail header / summary card.

### Anatomy
```
StatTile (vertical, gap 4)
  ├ Val  JetBrains Mono · 700 · color = tone
  └ Lab  JetBrains Mono · 600 · ls 1.5 · $muted-foreground-subtle · UPPERCASE
```

### Tone (the colour of `Val`) — by metric
| Metric | `Val` color | Canonical content |
|---|---|---|
| DONE | `$success` | `3` |
| BLOCKED | `$destructive` (desktop) / `$muted-foreground` (mobile — see drift) | `3` |
| CLOSING | `$warning` | `2` |
| TOTAL | `$foreground` | `11` |

### Size scale — multiple sizes exist for the same stat block; the contract makes it a `size` prop
The screens render this metric at several different `Val` font sizes (30 canon, 22 Category, 21 Timeline, 20 Deps/summary, 13 mobile). Rather than a component per size, parametrise:

| Source | `Val` size | `Lab` size | `Lab` ls | gap | `Lab` color |
|---|---|---|---|---|---|
| Canonical def `Cmp · StatTile` | **30** / 700 | 11 / 600 | 1.5 | 4 | `$muted-foreground-subtle` |
| Category **detail header** `D3JA0i` (aFnL2 etc.) | **22** / 700 | 11 / 600 | 1.5 | 3 | `$muted-foreground-subtle` |
| Timeline **detail header** `a3Dgz` (RcNqQ etc.) | **21** / 600 | 10 / normal | 1.5 | 3 | `$muted-foreground-subtle` |
| Dependencies **detail header** `b1b079` (lLKcH etc.) | **20** / 700 | 10 / normal | 1.2 | 4 | `$muted-foreground` |
| `MissionSummaryCard` def / library | **20** / 700 | 10 / 600 | 1 | 2 | `$muted-foreground-subtle` |
| Mobile fused summary `h9YSWg` | **13** / 700 | 9 / 500 | — | 5 | `$muted-foreground` |

> The three desktop detail headers are NOT one size: Category renders Val **22**, Timeline **21** (Val weight 600, not 700), Dependencies **20** (Lab `$muted-foreground` / ls 1.2). The `detail` size pins to Category's 22; Timeline/Deps fall on `detail`/`summary` respectively. `size`: `'showcase'(30) | 'detail'(22, Category) | 'summary'(20, Deps + summary card) | 'mobile'(13)`. Timeline's 21 is a 1px drift normalised to `detail`.

### Drift to honour
- Desktop detail-header BLOCKED `Val` is `$destructive`; mobile fused summary renders BLOCKED `Val` in `$muted-foreground` (a no-panic-red softening). Both are valid per tone+`size`; default BLOCKED tone = `$destructive`, mobile overrides to muted via the `tone` prop.
- On the screens these tiles are **bespoke frames named DONE/BLOCKED/CLOSING/TOTAL**, not `StatTile` refs — codegen should still emit a single `StatTile` and feed `tone`+`label`+`value`.

**Screen usages:** Category D3JA0i: 4 tiles in DetailHeader (Val 22, aFnL2/W7cAa/UAoqL/Z9zT1U); Timeline a3Dgz: 4 tiles in mission detail block (Val **21**/600, RcNqQ/N2F82H/OZv4Q/UFJ4x); Dependencies b1b079: 4 tiles (Val **20**, lLKcH/p31a7B/XESZE/TQKqp); Mobile h9YSWg: 4 fused tiles (Val 13); Library RcvKu: 4 tiles inside MissionSummaryCard (Val 20)

**Reconciliation (screen ← library):** Canonical def is a single 30px tile; the screens never use 30 — the three desktop detail headers render 22 (Category), 21 (Timeline), 20 (Deps), the summary card 20, and mobile 13. Contract adds a `size` enum (`detail`=22 ← Category, `summary`=20 ← Deps; Timeline's 21 normalised to `detail`) to cover the spread. Added a `tone` prop because the 4 metrics each colour the value differently and mobile softens BLOCKED off red. The screens inline these as named frames, not refs; the contract canonicalises them to one component.

---

## Cmp · ProgressBar

**Kind:** atom  ·  **maps_to (camp-404):** ADAPT — camp-404 `packages/ui/src/components/progress-bar.tsx`; add the amber 'closing' segment (3 segments total). Scaffolding S1 / design-brief §14 'Adapt'.  ·  **maps_to (shadcn):** shadcn/ui `Progress` (Radix Progress) — extended to a stacked multi-segment indicator rather than a single value.
  ·  **composes:** composed-into: MissionSummaryCard, composed-into: MissionDetailHeader (out-of-group)

**Anatomy:** ProgressBar (frame, clip:true, width fill_container, height 4, fill $card-elevated — the track)
├─ Done    (frame, width = done%,    height fill, fill $success)
├─ Closing (frame, width = closing%, height fill, fill $warning)
└─ Blocked (frame, width = blocked%, height fill, fill $destructive)

(segments laid horizontally; remaining track shows through as $card-elevated)

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `segments` | { tone: 'success'|'warning'|'destructive'|'primary'; value: number }[] | ✓ |  | Ordered segments; widths are value/total of the track. |
| `total` | number | ✓ |  | Denominator for segment widths (task count). |
| `mode` | 'window'|'progress' |  | 'window' | 'window' = success/warning/destructive over a $card-elevated track (§9, canonical). 'progress' = success/primary over a **$muted** track + $border remainder (Dependencies board `xLPwD`). |
| `remainderTone` | 'track'|'border'|'muted' |  | 'track' | How the unfilled remainder renders. 'track'=$card-elevated (default); 'border'=$border (mobile, Deps remaining seg); 'muted'=$muted (Timeline detail `bMFeK` Seg Rest). |
| `gap` | number |  | 0 | Gap between segments in px (0 desktop, 2 summary/mobile). |
| `height` | number |  | 4 | Bar height; 4 on most screens, but the Timeline detail-header bar (a3Dgz `bMFeK`) is **6**. |

**Variants:** `window mode (success/warning/destructive over $card-elevated track — default)`, `progress mode (success/primary over $muted track + $border remainder — Dependencies board)`, `remainder: track ($card-elevated) | border ($border, mobile + Deps) | muted ($muted, Timeline detail bMFeK)`, `gap 0 | gap 2`

**States:** `static (read-only)`, `all-done (single full success segment; optional COMPLETE pill at organism level)`, `empty (no segments → bare track)`

**Tokens:** `$card-elevated`, `$success`, `$warning`, `$destructive`, `$primary`, `$border`

**A11y:** role=progressbar with aria-valuenow/min/max on the done portion, or aria-label summarising composition (e.g. '3 done, 2 closing, 3 blocked of 11'); Segment colours are redundant with the StatTile counts above it; bar is supplementary, not sole carrier

## Cmp · ProgressBar (3-segment window-state bar)

A **4px** stacked bar over a `$card-elevated` track. Encodes mission composition as up to three coloured segments: **done → closing → blocked**, with the unfilled remainder showing the track.

### Anatomy
```
ProgressBar (h 4 · fill $card-elevated · clip · radius 0)
  ├ Done    fill $success    width = done/total
  ├ Closing fill $warning    width = closing/total
  └ Blocked fill $destructive width = blocked/total
```

### Segment model (design-brief §9 + Category/Timeline boards)
Canonical order = `success` (done) + `warning` (closing) + `destructive` (blocked); the remainder is the bare `$card-elevated` track. Widths are data-driven (px on the boards; `%`/`flex` in code). Canonical def widths: Done 140 / Closing 70 / Blocked 40. Detail-header widths: Done 266 / Closing 178 / Blocked 266. Mobile: Done 106 / Closing 80 / **remaining = explicit `$border` fill, width fill_container**.

### Drift to honour (reconciled variants)
- **Mobile** renders the remainder as an explicit `$border` segment (not the bare track) — accept as `remainderTone='border'`.
- **Timeline detail header** (`a3Dgz` `bMFeK`): bar is **height 6** (not 4), the track frame itself has NO fill, and the remainder is an explicit `Seg Rest` `$muted` segment (`l0T7z`) — a THIRD remainder tone. Accept via `height=6` + `remainderTone='muted'`. Segments Seg Done(`$success`,180) / Seg Attn(`$warning`,180) / Seg Rest(`$muted`,fill).
- **Dependencies board** (`b1b079` `xLPwD`) renders `success(done,376) + primary(active,118) + border(remaining,fill)` — i.e. a 2-segment *progress* semantic (done + in-progress) rather than the window-state semantic — AND its **track fill is `$muted`** (not `$card-elevated`), with the explicit remainder being `$border`. The contract supports both via a `mode` prop: `mode='window'` (success/warning/destructive — DEFAULT, the §9 mandate) vs `mode='progress'` (success/primary + `$muted` track / `$border` remainder — the Deps-board rendering). The §9 window-state mode is canonical; the progress mode is a documented divergence kept because the Dependencies screen uses it.
- `gap` between segments: 0 (canonical def, Category detail header) or 2 (Timeline detail header, MissionSummaryCard def + mobile). Expose `gap`.

**Screen usages:** Category D3JA0i: DetailHeader Progress `t9BKJ` (266/178/266 over $card-elevated, h4); Timeline a3Dgz: mission detail progress `bMFeK` (180/180 + `$muted` Seg Rest, **h6**, gap 2, track fill=none); Dependencies b1b079: mission detail progress `xLPwD` (success 376/primary 118/border remainder — progress mode, track fill **$muted** NOT $card-elevated); Mobile h9YSWg: fused summary progress (106/80 + $border remainder, gap 2); Library RcvKu / MissionSummaryCard def: 120/70/90, gap 2

**Reconciliation (screen ← library):** Canonical def has the §9 window-state 3-segment model. Added `mode='progress'` to cover the Dependencies board's success/primary rendering over a **$muted** track (NOT $card-elevated) with a $border remainder (§9 divergence, flagged informational). Added `remainderTone` covering the mobile/Deps `$border` remainder AND the Timeline detail `$muted` Seg Rest (a third tone). Added a non-4 `height` (Timeline detail `bMFeK` is 6). Made widths data-driven via segments[]/total + a `gap` prop (0 vs 2 across screens).

---

## Cmp · NavCard

**Kind:** molecule  ·  **maps_to (camp-404):** ADAPT — camp-404 `packages/ui/src/components/nav-card.tsx`; add orange active state + window-summary chip. Scaffolding S1 / design-brief §14 'Adapt' + §11 Mission sidebar.  ·  **maps_to (shadcn):** No single shadcn primitive — a custom selectable list item built on the `Card` recipe (acts like a `RadioGroup` item / `Button` variant='ghost' selected state).
  ·  **composes:** composes: Cmp · Card (recipe), composed-into: Sidebar (out-of-group organism)

**Anatomy:** NavCard (frame, clip:true, fill $card, stroke $border 1px inner, vertical, gap 8, padding 14, width fill_container)
├─ Name (text, $foreground, DM Sans 16/600) — mission name
└─ Meta (frame, gap 8, center)
   ├─ Chip (frame, fill <tone>/12, radius 999, padding [2,7], gap 4: icon + label) — window-summary chip
   │  ├─ icon (lucide, 11×11)
   │  └─ ChipLabel (text, JetBrains Mono 11/600)
   └─ Count (text, $muted-foreground, JetBrains Mono 12/normal) — '{done}/{total} tasks'

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `name` | string | ✓ |  | Mission name. |
| `done` | number | ✓ |  | Completed task count for the count line. |
| `total` | number | ✓ |  | Total task count. |
| `chip` | { label: string; tone: 'warning'|'success'|'cat-bureaucratic'|'muted'; icon?: string } |  |  | Window-summary chip (nearest-cliff state). Omit if no cliff/all-done-without-cue. |
| `active` | boolean |  | false | Selected mission → primary/12 fill + primary border. |

**Variants:** `active (primary/12 + $primary border)`, `resting ($card + $border)`, `hover ($card + $border-hover)`, `chip tones: warning (T-Nd / CLOSING) · success (COMPLETE) · cat-bureaucratic (canonical default)`

**States:** `resting`, `hover`, `active/selected`, `focus-visible (ring $primary)`

**Tokens:** `$card`, `$border`, `$border-hover`, `$primary`, `#ff6b351f (primary/12)`, `$foreground`, `$muted-foreground`, `$warning`, `$cat-bureaucratic`, `$success`

**A11y:** Rendered as a button/link with aria-current='true' when active; Min 44px tap height (74px on Timeline mobile — satisfies it); Chip colour paired with its label + icon (redundant channels); Keyboard: arrow-navigable list, Enter/Space selects

## Cmp · NavCard (mission sidebar row)

A selectable mission row in the 280px sidebar. Mission **name** (DM Sans 16/600) over a meta line: a **window-summary chip** + a `{done}/{total} tasks` count. Selection drives the main view (the only sidebar interaction).

### Anatomy
```
NavCard (fill $card · stroke $border 1px · radius 0 · padding 14 · gap 8)
  ├ Name  DM Sans 16/600 $foreground
  └ Meta (gap 8)
     ├ Chip  <tone>/12 pill (radius 999) · 11px lucide icon + JetBrains Mono 11/600 label
     └ Count JetBrains Mono 12 $muted-foreground  '3/11 tasks'
```

### States
| State | Card `fill` | Card `stroke` | strokeWidth |
|---|---|---|---|
| **active/selected** | `#ff6b351f` (`$primary`/12) | `$primary` | 1 |
| resting | `$card` | `$border` | 1 |
| hover | `$card` | `$border-hover` | 1 |

(Category board's `NavCard AfrikaBurn` is the **active** specimen: primary-tinted fill + primary border.)

### Window-summary chip (the §9 'aggregate' overload)
The chip is NOT a per-task `WindowStatePill`; it summarises the mission's nearest-cliff window. Tones/copy seen across screens:

| Chip copy | `tone` | icon | example board |
|---|---|---|---|
| `T-3d` / `T-12d` / `T-21d` | `$warning` (Category) or `$cat-bureaucratic` (canonical def) | `timer` | Category/Timeline sidebars |
| `CLOSING` / `1 CLOSING` | `$warning` (+ warning dot) | `timer`/dot | Timeline active mission |
| `COMPLETE` | `$success` | (none / check) | brief §11 |

Default chip uses `timer` (lucide) — note this diverges from brief §8's `Clock`; screens consistently use `timer`, so `timer` is authoritative for the cliff chip.

### Drift to honour
- Canonical def chip is `$cat-bureaucratic`-toned; Category board recolours it `$warning`. Chip `tone` is a prop, defaulting to the nearest-cliff window-state colour.
- Timeline sidebar adds a **left accent rectangle** + a mission count `04` in the header + 74px fixed-height rows — these are sidebar-organism concerns, not NavCard; the NavCard itself stays as specified.

**Screen usages:** Category D3JA0i: 1 active NavCard (AfrikaBurn, primary/12); Timeline a3Dgz: 4 mission rows (active 'CLOSING' chip + inactive 'T-Nd' chips, left accent bar); Dependencies b1b079: sidebar NavCards with aggregate summary chips; Library RcvKu: Shell & Navigation group

**Reconciliation (screen ← library):** Canonical def chip is bureaucratic-toned and static; screens drive the chip tone off the mission's nearest-cliff window-state (warning for closing, success for complete) and use the `timer` icon (not brief §8 Clock). Added the `active` primary/12 state from the Category board specimen. The Timeline sidebar's left-accent rectangle + header count are reassigned to the Sidebar organism, keeping NavCard clean. Chip is explicitly an aggregate/summary chip, distinct from per-task WindowStatePill.

---

## TaskCard

**Kind:** organism  ·  **maps_to (camp-404):** NEW organism composed of LIFT/ADAPT atoms — built on camp-404 `card.tsx` (LIFT) + adapted `badge.tsx` (CategoryTag/WindowStatePill) + the NEW `StatusCycleButton`. Scaffolding S4 'port the 3 views 1:1' + design-brief §11 task card.  ·  **maps_to (shadcn):** shadcn `Card` shell + `Badge` (×2, category + window) + the custom `StatusCycleButton`. The card itself is the read-only row; the only interactive child is the status button.
  ·  **composes:** composes: Cmp · Card (shell + state recipe), composes: StatusCycleButton, composes: CategoryTag, composes: WindowStatePill (window pill slot), composed-into: Category/Timeline/Dependencies views

**Anatomy:** TaskCard (frame, clip:true, fill $card, stroke $border 1px inner, gap 12, padding 14, width fill_container)
├─ Touch44 (frame 44×44, center) — the tap-to-cycle HIT AREA (a11y) — REQUIRED
│  └─ Cycle == StatusCycleButton (frame 18×18, stroke 2px inner, center)
│     └─ Fill/glyph (status-dependent: empty | ◼ orange | ✓ near-black on success)
└─ Body (frame, width fill_container, vertical, gap 8)
   ├─ Name (text, $foreground, DM Sans 15/500) — line-through+muted when done/closed
   ├─ Meta (frame, gap 8, center)
   │  ├─ Tag == CategoryTag (pill, cat/12, icon+label)
   │  └─ Win == window pill (icon + LABEL [+ trailing date]) — single slot, window-state driven
   └─ Dep (text, $muted-foreground-subtle, JetBrains Mono ~11) — OPTIONAL '⚠ blocked by: {names}' (only when blocked)

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `name` | string | ✓ |  | Task name (DM Sans 15/500). |
| `status` | 'not-started'|'in-progress'|'done' | ✓ |  | Stored status → StatusCycleButton appearance + (done) name strikethrough. |
| `category` | { key:'medical'|'bureaucratic'|'travel'|'gear'|'tech'; label:string } | ✓ |  | Drives the CategoryTag (cat colour + lucide icon + label). |
| `windowState` | 'open'|'closing'|'closed'|'not-yet' | ✓ |  | Computed (never stored). Drives the window pill + the card-level surface recipe. |
| `blocked` | boolean |  | false | Derived. When true on a not-yet task → pill shows BLOCKED (triangle-alert) + renders the Dep line. |
| `blockedBy` | string[] |  |  | Upstream task names for the '⚠ blocked by: …' Dep line. |
| `cliffLabel` | string |  |  | Pill text/date: e.g. 'CLOSING · T-5d', 'WINDOW CLOSED', 'NOT YET', or a bare date '15 Mar'. |
| `notBeforeLabel` | string |  |  | 'starts {date}' trailing text for not_before. |
| `layout` | 'stacked'|'inline' |  | 'stacked' | 'stacked'=Category/Mobile vertical; 'inline'=Timeline horizontal row. |
| `onCycle` | () => void | ✓ |  | Tap handler → POST update_task_status. Always enabled. |

**Variants:** `status: not-started · in-progress · done`, `windowState: open · closing · closed · not-yet`, `overload: blocked (not-yet + AlertTriangle + Dep line)`, `overload: not_before (lock + 'starts {date}')`, `open-as-bare-date (no pill label, just date)`, `layout: stacked (Category/Mobile) · inline (Timeline) · tree (Dependencies, with Left/Right + Name Group)`, `category: medical · bureaucratic · travel · gear · tech`, `dimmed CategoryTag (Dependencies blocked rows)`

**States:** `not-started / in-progress / done (status)`, `open / closing / closed / not-yet (window)`, `blocked (derived overlay: dim .6 + Dep line)`, `done (line-through name + success button)`, `closed (line-through name + $muted card + .55 opacity)`, `hover (card border lift; button border → $success preview on not-started)`, `focus-visible on the StatusCycleButton (ring $primary)`, `tap/active (cycles status)`

**Tokens:** `$card`, `$muted`, `$border`, `$border-hover`, `$primary`, `#ff6b351f`, `$primary-foreground`, `$background`, `$success`, `$warning`, `$muted-foreground`, `$muted-foreground-subtle`, `$cat-medical`, `$cat-bureaucratic`, `$cat-travel`, `$cat-gear`, `$cat-tech`

**A11y:** 44×44 Touch44 wrapper around the 18px button — the minimum tap target, RESTORED from canonical (screens drop it); StatusCycleButton is a <button> with aria-label reflecting current+next status (e.g. 'Mark in-progress; currently not started'); always enabled; Window-state carried by icon + label + colour + opacity (4 redundant channels, never colour alone); Done/closed name uses line-through (visual) AND status conveyed to AT (not strikethrough-only); Dep line announced as the blocking reason; card itself is not a button (only the status control is interactive)

## TaskCard (the core repeated row)

The single most-used organism (44 instances across boards). A read-only task row whose **only** interaction is tapping the `StatusCycleButton`. Composes: `Card` shell + `StatusCycleButton` (in a 44px hit area) + `CategoryTag` + a window-state pill + an optional dependency caption. The **card-level** treatment (border/fill/opacity/strikethrough) is driven by computed window-state.

### Canonical anatomy (library `QfQXv` — vertical layout)
```
TaskCard (fill $card · stroke $border 1px · radius 0 · padding 14 · gap 12)
  ├ Touch44 (44×44, center)            ← REQUIRED hit area
  │   └ StatusCycleButton (18×18 sq · stroke 2px)
  └ Body (vertical, gap 8)
      ├ Name   DM Sans 15/500
      ├ Meta (gap 8): CategoryTag · WindowPill
      └ Dep    JetBrains Mono ~11 $muted-foreground-subtle  (optional)
```

### FULL state matrix (UNION across all screens — authoritative)

**Status (StatusCycleButton seat) — 3 stored states:**
| status | box `fill` | box `stroke` | glyph | Name treatment |
|---|---|---|---|---|
| not-started | none | `$border` | — (empty) | normal |
| in-progress | `#ff6b351f` | `$primary` | `◼` orange (JetBrains Mono 8–9) OR 8×8 primary square | normal |
| done | `$success` | `$success` | `✓` near-black (`$background`/`$primary-foreground`) OR 12px lucide `check` | **line-through + $muted-foreground** |

> Screens encode the glyph two ways (text `◼`/`✓` on the Category board; a child `rectangle Fill` / lucide `check` in the library def). Contract: render via the StatusCycleButton component (shape-based), text glyph is a fallback. DONE-fill variant is canonical.

**Window-state (the `Win` pill) — 4 states + 2 overloads, ALL through one slot:**
| window-state | icon (lucide) | tone | label | trailing |
|---|---|---|---|---|
| **open** | none | `$muted-foreground-subtle` | *(no label)* | bare date e.g. `15 Mar` |
| **closing** | `timer` | `$warning` | `CLOSING · T-{n}d` (or `CLOSES FRI`) | — |
| **closed** | `circle-x` | `$muted-foreground` | `WINDOW CLOSED` | faint date e.g. `5 Apr` |
| **not-yet (blocked)** | `triangle-alert` | `$muted-foreground` | `BLOCKED` | — (+ Dep line) |
| **not-yet (not_before)** | `lock` | `$muted-foreground-subtle` | `NOT YET` | `starts {date}` |
| *(plain date overload — done/open)* | none | `$muted-foreground-subtle` | — | `DONE` or date string |

**Card-level recipe per window-state** (see Cmp·Card table): open=$card/1px; closing=left-2 $warning; blocked/not-yet=left-2 $muted-foreground-subtle + opacity .6; closed=$muted/left-2 $muted-foreground/opacity .55.

**Optional Dep line:** only on blocked cards — `⚠ blocked by: {upstream task name(s)}`, JetBrains Mono ~10–11, `$muted-foreground-subtle`. Net-new field, not in the base meta; formalised here.

### Layout-axis reconciliation
- Category/Mobile: **vertical** body (Name above Meta), padding 14, gap 12, name 15px.
- Timeline: **horizontal** row `[Status | NameBlock | Tag | Pill]`, padding [11,14], gap 14, name 14px.
- Dependencies: vertical with `Left{Status+Name}` / `Right{Tag+Pill}` + a `Name Group` wrapper hosting the optional blocked-by line.

Contract: one `TaskCard` with a `layout: 'stacked'|'inline'` prop (default `stacked`). All variants keep the 44px Touch44 and the same slots.

### CRITICAL reconciliations (screens authoritative)
1. **Keep Touch44.** Every screen drops the 44px wrapper to a bare 18px box — the contract RESTORES it (a11y, design-brief §10/§11; it is the app's only interaction).
2. **Status button always present + always enabled.** Dependencies/Mobile boards REPLACE the button with a `triangle-alert`/`lock`/`ban` icon on blocked/not-yet rows — the contract forbids this (brief §10: blocked is advisory, never gating). Blocked/not-yet are shown via the pill + card treatment, the button stays.
3. **One window pill, not two.** Screens overload a single `Win`/`Pill` slot for window-state AND status (DONE/BLOCKED) AND bare dates. Canonical kit separated `WindowStatePill` / `StatusBadge`. Contract: TaskCard hosts ONE window-driven pill (props below); status is shown by the button + name strikethrough, not a second pill.
4. **Done/closed names MUST be line-through.** Every board omits the strikethrough (only mutes the colour). Contract restores `line-through text-muted-foreground` per §9/§10.
5. **CategoryTag stays cat-coloured.** Timeline/Mobile render it bare (no /12 fill) and Dependencies greys it on blocked rows — contract keeps the `/12` tinted pill with cat-coloured label; a `dimmed` flag may grey it on blocked rows (Deps behaviour) but the default is full colour.
6. **Icons:** `timer` (closing), `circle-x` (closed), `triangle-alert` (blocked), `lock` (not-yet) are the on-screen set. Brief §8 prefers `Clock`/`XCircle`/`AlertTriangle`/`Lock`; screens win → use the screen icons, documented as a divergence.

**Screen usages:** Category D3JA0i: 11 cards — full status×window matrix incl. blocked + Dep line + not_before; Timeline a3Dgz: 10 inline cards across 6 buckets (closing/closed/no-cliff/blocked); Dependencies b1b079: 8 tree rows + 2 unlinked (Left/Right + Name Group, critical-path); Mobile h9YSWg: 13 cards across 5 groups (no in-progress specimen — add it); AI Research GZ7xA: 4 task-like rows (target/context cards); Account/Manual NMzE5: 2 live demo TaskCards; Library RcvKu: open/closing/done/blocked variants

**Reconciliation (screen ← library):** Heaviest reconciliation in the kit. (1) Restores the 44px Touch44 that every screen drops. (2) Forbids the Dependencies/Mobile button-swap on blocked/not-yet rows (button always present+enabled per §10). (3) Collapses the screens' overloaded single Pill into ONE window-state-driven pill + status-via-button (canon had separate WindowStatePill/StatusBadge; screens proved one slot, so the contract keeps one pill but drives it by windowState, not status). (4) Adds the net-new optional Dep '⚠ blocked by:' line. (5) Restores line-through on done/closed names (screens only mute colour). (6) Adds `layout` prop for the Timeline horizontal vs Category vertical trees. (7) Adopts the screen icon set (timer/circle-x/triangle-alert/lock) over brief §8, and the per-window card recipe (left-accent + opacity + $muted closed fill).

---

## MissionSummaryCard

**Kind:** organism  ·  **maps_to (camp-404):** ADAPT — built on camp-404 `card.tsx` (LIFT) + `stat-tile.tsx` (LIFT) + adapted `progress-bar.tsx`. Overlaps the lifted DetailHeader. Scaffolding S1/S4 + design-brief §11 mission detail header.  ·  **maps_to (shadcn):** shadcn `Card` + 4× StatTile composite + `Progress` (3-segment). On mobile it fuses the role of MissionDetailHeader.
  ·  **composes:** composes: Cmp · Card, composes: Cmp · StatTile (×4), composes: Cmp · ProgressBar

**Anatomy:** MissionSummaryCard (frame, fill $card, stroke $border 1px inner, vertical, gap 14, padding 16, width fill_container)
├─ Name (text, $foreground, DM Sans 17/600)
├─ Target (text, $muted-foreground, JetBrains Mono 11/500, ls 1, content 'TARGET: 2026-04-27')
├─ Stats (frame, gap 20, width fill_container)
│  ├─ DONE (StatTile, val $success 20/700, lab 'DONE' 10/600 ls1)
│  ├─ BLOCKED (StatTile, val $destructive)
│  ├─ CLOSING (StatTile, val $warning)
│  └─ TOTAL (StatTile, val $foreground)
└─ Progress (ProgressBar, h4, fill $card-elevated, gap 2: Done $success | Closing $warning | Blocked $destructive)

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `name` | string | ✓ |  | Mission name (DM Sans 17/600 card; up to 26/700 detail-header). |
| `target` | string | ✓ |  | Real-world event date. Format ISO-uppercase 'TARGET: 2026-04-27' (authoritative). |
| `stats` | { done:number; blocked:number; closing:number; total:number } | ✓ |  | The 4 metric values. |
| `segments` | ProgressSegment[] | ✓ |  | Passed to the 3-segment ProgressBar (done/closing/blocked). |
| `variant` | 'card'|'detail-header' |  | 'card' | 'card'=$card surface, padding 16 (mobile/summary). 'detail-header'=borderless, border-bottom, padding [24,32] (desktop). |
| `size` | 'detail'|'summary'|'mobile' |  | 'summary' | Drives StatTile sizing (22/20/13). |
| `liveDot` | boolean |  | false | Live indicator dot before the title (Timeline detail header). |
| `location` | string |  |  | Optional LOCATION on the target line (Timeline). |
| `blockedTone` | 'destructive'|'muted' |  | 'destructive' | BLOCKED stat colour; mobile softens to 'muted'. |
| `complete` | boolean |  | false | All-done → full success bar + optional COMPLETE pill. |

**Variants:** `card (mobile/summary, $card surface)`, `detail-header (desktop, borderless + border-bottom)`, `size: detail(22) / summary(20) / mobile(13)`, `blockedTone: destructive / muted`, `liveDot + location (Timeline)`, `complete (all-done)`

**States:** `populated`, `all-done (COMPLETE)`, `BLOCKED stat: destructive (desktop) | muted (mobile)`

**Tokens:** `$card`, `$border`, `$card-elevated`, `$foreground`, `$muted-foreground`, `$success`, `$warning`, `$destructive`, `$border`

**A11y:** Region with an accessible name = mission name; Each stat is a labelled group (StatTile a11y); Progress bar has aria-label summarising composition; Target date is informational text, never an interactive control (read-only board)

## MissionSummaryCard

At-a-glance mission status as a self-contained card: name, target date, the 4-stat row, and the 3-segment progress bar. On desktop the mission detail **header** plays this role (bordered, padding [24,32], title 26/700, no card surface); on **mobile** a single `$card` fuses MissionDetailHeader + MissionSummaryCard + StatTiles + ProgressBar into one block.

### Anatomy (library `Dc4bO`)
```
MissionSummaryCard (fill $card · stroke $border 1px · padding 16 · gap 14)
  ├ Name    DM Sans 17/600
  ├ Target  JetBrains Mono 11/500 ls1  'TARGET: 2026-04-27'
  ├ Stats (gap 20): DONE · BLOCKED · CLOSING · TOTAL  (StatTile size='summary', val 20)
  └ Progress  3-seg bar (gap 2) over $card-elevated
```

### Variants & the desktop/mobile reconciliation
| Render | surface | Title | StatTile size | Target format | progress remainder |
|---|---|---|---|---|---|
| **MissionSummaryCard def / library** | `$card` card, padding 16 | DM Sans 17/600 | `summary` (20) | `TARGET: 2026-04-27` (ISO) | $card-elevated track |
| **Desktop detail header** (Category/Timeline/Deps) | borderless, `border-bottom`, padding [24,32] | 25–26/600–700 (+optional live dot, +LOCATION on Timeline) | per-board: Category **22**, Timeline **21**, Deps **20** (NOT a single size) | `Target: 27 Apr 2026` (sentence — drift) | Category $card-elevated; Timeline `$muted` (h6); Deps `$muted` track + $border |
| **Mobile fused** `h9YSWg` | `$card`, padding 16 | 17/600 | `mobile` (13) | `TARGET: 2026-04-27` | **$border** remainder |

Contract: one component with `variant: 'card'|'detail-header'` and the StatTile `size`/ProgressBar `remainderTone` flowing from it.

### Drift to honour
- **BLOCKED stat tone:** desktop = `$destructive`; mobile = `$muted-foreground`. Default `$destructive`; mobile softens to muted (no-panic-red). Library def for the medevac variant sets BLOCKED `1`, CLOSING `0` (all-tones still present).
- **Target date format diverges** (ISO uppercase `TARGET: 2026-04-27` vs sentence `Target: 27 Apr 2026`). Canon/showcase/mobile use ISO-uppercase → that is authoritative; the Category desktop sentence-case is the outlier.
- Timeline detail header adds a **live dot** before the title and a **LOCATION** segment on the target line — expose as optional `liveDot` + `location` (detail-header variant only).
- All-done state: progress fills success; optional `COMPLETE` pill.

**Screen usages:** Timeline a3Dgz: mission detail block (overlaps MissionDetailHeader + this card; StatTile val **21**); Mobile h9YSWg: 1 fused summary card (val 13, $border remainder, BLOCKED muted); Category D3JA0i: detail-header variant (val **22**); Dependencies b1b079: detail-header variant (val **20**); Library RcvKu: MissionSummaryCard + medevac variant (val 20)

**Reconciliation (screen ← library):** Unifies MissionSummaryCard with the desktop MissionDetailHeader via a `variant` prop (they are the same content at different sizes/surfaces — StatTile renders 22 Category / 21 Timeline / 20 Deps+summary / 13 mobile across the system; the three desktop detail headers are NOT one size). Picks ISO-uppercase target format (canon+mobile+showcase) over the Category desktop sentence-case outlier. Adds optional liveDot + location for the Timeline header. Adds blockedTone to cover mobile's no-red softening. Composes the reconciled StatTile (size prop) and ProgressBar (remainderTone) rather than the inlined bespoke frames the screens use.

---

## Alert

**Kind:** molecule  ·  **maps_to (camp-404):** LIFT — camp-404 `packages/ui/src/components/alert.tsx` (token-driven, re-skins). Scaffolding S1 / design-brief §14 'Lift verbatim'.  ·  **maps_to (shadcn):** shadcn/ui `Alert` + `AlertTitle` + `AlertDescription` (inline, non-toast).
  ·  **composes:** composes: (none — leaf molecule, optional lucide icon)

**Anatomy:** Alert (frame, fill <tone>/12, stroke {left:2} <tone> inner, gap 12, padding 14, width fill_container)
├─ Icon (lucide, 18×18, fill <tone>)
└─ Col (frame, vertical, gap 5, width fill_container)
   ├─ Title (text, <tone>, JetBrains Mono 12/700, ls 1, UPPERCASE)
   └─ Body (text, $foreground, DM Sans 13/normal, lineHeight 1.4)

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `variant` | 'info'|'warning'|'destructive' |  | 'info' | Tone → fill/border/icon/title colour. |
| `title` | string | ✓ |  | Uppercase mono title (e.g. HEADS UP / WINDOW CLOSING / BLOCKED). |
| `children` | ReactNode | ✓ |  | Body copy (DM Sans, $foreground). |
| `icon` | LucideIcon |  |  | Override icon; defaults per variant (info/triangle-alert/octagon-alert). |

**Variants:** `info (orange/info — default, lucide info)`, `warning (amber, triangle-alert)`, `destructive (red, octagon-alert)`

**States:** `static (persistent inline; no auto-dismiss, no dismiss control in canon)`

**Tokens:** `$info`, `$primary`, `#ff6b351f`, `$warning`, `$destructive`, `$foreground`

**A11y:** role='alert' for destructive/urgent; role='status' for info/warning advisories; Icon is decorative (aria-hidden) — title text carries the meaning; Tone never sole carrier: icon + uppercase title + colour are redundant

## Alert (inline, non-toast)

A persistent inline advisory banner with a **2px left-accent border**, a tinted /12 fill, a lucide icon, an uppercase mono title, and a DM Sans body. Distinct from `Toast` (transient, top-accent bar).

### Anatomy
```
Alert (fill <tone>/12 · border-left-2 <tone> · padding 14 · gap 12)
  ├ Icon  18×18 lucide · <tone>
  └ Col (gap 5)
     ├ Title JetBrains Mono 12/700 ls1 · <tone> · UPPERCASE
     └ Body  DM Sans 13 · $foreground · lh 1.4
```

### Variants (full set from library `K4DDI7` + refs)
| variant | `tone` token | fill | icon (lucide) | example title |
|---|---|---|---|---|
| **info** (default) | `$info` (= `$primary` orange) | `#ff6b351f` | `info` | `HEADS UP` |
| **warning** | `$warning` | `$warning`/12 | `triangle-alert` | `WINDOW CLOSING` |
| **destructive** | `$destructive` | `$destructive`/12 | `octagon-alert` | `BLOCKED` |

> Note: the canonical default `Alert` strokes the left border with `$info` while filling with the orange-`#ff6b351f` wash — info aliases the orange brand (per tokens `info` = `#ff6b35`). The warning/destructive refs recolor icon+title+fill+border consistently to their tone.

### Tokens & rules
- Fill = tone at **12%** (design-brief §7 canonical alpha). Left accent + icon + title text = solid tone.
- Body always `$foreground` regardless of tone.
- Warning conveys 'closing' advisories; destructive reserved for genuine danger/blocked-by-upstream (LOCKED #3 — no panic-red for time pressure).

**Screen usages:** Library RcvKu: Spec · Alert — info (HEADS UP), warning (WINDOW CLOSING), destructive (BLOCKED); Usage map: composed into Voice & Toasts surface alongside Toast/Spinner

**Reconciliation (screen ← library):** Matches the canonical def closely — main reconciliation is enumerating the 3 tone variants from the showcase refs (info default + warning + destructive) and pinning their icon set (info / triangle-alert / octagon-alert). Confirmed fill is tone/12 per §7 and the left-2 accent border idiom (shared with Toast top-accent but Alert is left-accent). Distinguished from Toast (transient) and from ErrorStateCard (different left-3 muted border).

---

## EmptyState

**Kind:** molecule  ·  **maps_to (camp-404):** LIFT — camp-404 `packages/ui/src/components/empty-state.tsx` on a `card.tsx` shell. Scaffolding S1/S4 (voice-first copy) + design-brief §11/§14.  ·  **maps_to (shadcn):** Custom composite on shadcn `Card` shell (no dedicated shadcn EmptyState primitive).
  ·  **composes:** composes: Cmp · Card (shell)

**Anatomy:** EmptyState (frame, fill $card, stroke $border 1px inner, vertical, gap 16, padding [48,24], center)
├─ Hex (frame 60×60, layout none) — the ⬡ motif
│  ├─ Hexagon (polygon, 6-sided, stroke 2px $muted-foreground-subtle)
│  └─ Mic (icon, lucide 22×22, centered at 19,19, $muted-foreground-subtle)
└─ Text (frame, vertical, gap 6, center)
   ├─ Msg (text, $foreground, JetBrains Mono 13/700, ls 1.5, UPPERCASE)
   └─ Hint (text, $muted-foreground, DM Sans 13/normal)

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `variant` | 'no-missions'|'no-tasks' |  | 'no-missions' | Selects default icon + copy. |
| `message` | string |  |  | Override the uppercase mono Msg (e.g. NO MISSIONS YET / ALL TASKS CLOSED). |
| `hint` | string |  |  | Voice-first hint copy ('Say “create a mission” to get started.'). |
| `icon` | LucideIcon |  | mic | Inner hex glyph (mic for missions, check-check for all-closed). |
| `surface` | 'card'|'background' |  | 'card' | $card (canon) vs $background (TvXzz gallery rendering). |
| `hintStyle` | 'sentence'|'tokens' |  | 'sentence' | DM Sans single string vs the mono 'say' + primary-quote 2-token row (TvXzz). |

**Variants:** `no-missions (mic + 'NO MISSIONS YET')`, `no-tasks (check-check + 'ALL TASKS CLOSED' / 'No tasks yet')`, `surface: card | background`, `hintStyle: sentence (DM Sans) | tokens (mono + primary quote)`, `hex: outlined polygon + mic (canon) | single lucide hexagon glyph (TvXzz)`

**States:** `static (no interactive states; the CTA is a voice instruction, not a button)`

**Tokens:** `$card`, `$background`, `$border`, `$muted-foreground-subtle`, `$foreground`, `$muted-foreground`, `$primary`

**A11y:** role='status' announcing the empty condition + voice instruction; Hexagon + mic are decorative (aria-hidden); the Msg/Hint text carries meaning; No interactive control — copy directs the user to the voice FAB

## EmptyState

A centered placeholder: the signature **⬡ hexagon** motif over a mono uppercase message + a voice-first hint. Lives on a `$card` shell.

### Canonical anatomy (library `Ie7mv`)
```
EmptyState (fill $card · stroke $border 1px · padding [48,24] · gap 16 · center)
  ├ Hex (60×60): outlined 6-sided polygon (2px $muted-foreground-subtle) + inner lucide 'mic' (22×22)
  └ Text (gap 6, center)
     ├ Msg  JetBrains Mono 13/700 ls1.5 $foreground  UPPERCASE
     └ Hint DM Sans 13 $muted-foreground  'Say “create a mission” to get started.'
```

### Variants (voice-first copy — UNION)
| variant | hex inner icon | Msg | Hint |
|---|---|---|---|
| **no-missions** (default) | `mic` | `NO MISSIONS YET` | `Say “create a mission” to get started.` |
| **no-tasks** | `check-check` | `ALL TASKS CLOSED` | `Say “add a task” to keep going.` |
| brief §11 alt no-tasks | — | (`No tasks yet`) | `say "add a task"` |

> The showcase `EmptyState · no tasks` ref swaps the hex icon to `check-check` and recolours copy to an all-closed message. Brief §11 also names a `No tasks yet — say "add a task"` variant. Both no-tasks readings are kept as copy props.

### Drift to honour (the TvXzz states board diverges)
The Empty/Loading/Error board (`TvXzz`) renders a SIMPLER EmptyState:
- single 60×60 lucide `hexagon` glyph (NOT the outlined polygon + inner mic),
- surface `$background` (not `$card`), gap 18, padding 24,
- `Msg` = `$muted-foreground` 14 (vs `$foreground` 13),
- hint as a 2-token mono row: `say` ($muted-foreground-subtle) + `“create a mission”` ($primary 600), JetBrains Mono — NOT a single DM Sans string.

**Reconciliation (screen authoritative for the runtime gallery, but canon is richer):** the contract keeps the canonical **outlined-polygon-hex + inner mic** motif (it is the §8 signature) and exposes `surface: 'card'|'background'`, `hintStyle: 'sentence'(DM Sans single string)|'tokens'(mono say + primary quote)` to cover the TvXzz rendering. The `hexagon`-glyph fallback is allowed when the polygon motif is unavailable.

**Screen usages:** Empty/Loading/Error TvXzz: W EMPTY panel (hexagon glyph, $background, mono token hint); Library RcvKu: EmptyState (canonical mic-in-polygon) + 'no tasks' ref; design-brief §11: no-missions + no-tasks copy

**Reconciliation (screen ← library):** Canonical def = outlined hex polygon + inner mic + DM Sans hint on $card. The TvXzz gallery flattens this to a single lucide hexagon on $background with a mono 2-token hint. Contract keeps the canonical signature motif (§8 ⬡) but adds `surface`, `hintStyle`, and `icon` props to render the TvXzz variant. Enumerates both copy variants (no-missions default, no-tasks via showcase 'ALL TASKS CLOSED' + brief 'No tasks yet'). The second empty copy ('No tasks yet — add a task') is specced even though only the no-missions specimen is drawn on TvXzz.

---

## Skeleton

**Kind:** molecule  ·  **maps_to (camp-404):** LIFT — camp-404 has no skeleton in the manifest; treat as shadcn `Skeleton` placeholder on a `card.tsx` shell. Scaffolding S4 'Loading: skeletons for sidebar rows + cards' + design-brief §11.  ·  **maps_to (shadcn):** shadcn/ui `Skeleton` (animated placeholder rectangles), composed into a task-card-shaped placeholder.
  ·  **composes:** composes: Cmp · Card (shell), composed-into: LoadingScreen (out-of-group organism)

**Anatomy:** Skeleton (frame, fill $card, stroke $border 1px inner, gap 12, padding 14, width fill_container) — mirrors a TaskCard shell
├─ Box (rectangle 18×18, fill $card-elevated) — the status-button placeholder
└─ Col (frame, vertical, gap 9, width fill_container)
   ├─ Bar (rectangle, width fill_container, height 14, fill $card-elevated) — the name placeholder
   └─ Tags (frame, gap 8, center) — the meta-row placeholder
      ├─ Bar (rectangle 70×12, $card-elevated)
      └─ Bar (rectangle 90×12, $card-elevated)

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `variant` | 'default'|'wide' |  | 'default' | 'default'=box+name+2 tag bars; 'wide'=box+name only (Tags disabled). |
| `showStatusBox` | boolean |  | true | Render the 18px status-seat box. |
| `lineWidths` | { name?: number|'fill'; tags?: number[] } |  |  | Override bar widths (TvXzz uses name 240, tags [—]; canon uses fill + [70,90]). |
| `count` | number |  | 1 | Convenience: render N stacked rows (boards show 3). |
| `animate` | boolean |  | true | Shimmer/pulse animation. |

**Variants:** `default (box + name + 2 tag bars)`, `wide (box + name only, Tags disabled)`, `with header bars (TvXzz skTitle/skSub)`, `fixed-width lines (TvXzz 240/130) vs fill_container (canon)`

**States:** `loading (the only state — shimmer/pulse)`, `static (animate=false fallback)`

**Tokens:** `$card`, `$card-elevated`, `$border`

**A11y:** aria-hidden / aria-busy='true' on the loading container; announce loading via a live region elsewhere, not per-skeleton; Decorative placeholder — no text, no interactive role; Respects prefers-reduced-motion (disable shimmer)

## Skeleton (loading placeholder)

A shimmer placeholder shaped like a `TaskCard`: an 18px box (status seat) + a full-width name bar + a meta row of two short bars. All blocks are `$card-elevated` rectangles on the `$card` card shell. Stacked ×3 to fill a list while loading.

### Canonical anatomy (library `HLa60`)
```
Skeleton (fill $card · stroke $border 1px · padding 14 · gap 12)  ← TaskCard-shaped
  ├ Box  18×18 rectangle $card-elevated
  └ Col (gap 9)
     ├ Bar  fill_container × 14  $card-elevated   (name)
     └ Tags (gap 8): Bar 70×12 · Bar 90×12         (meta)
```

### Variants
| variant | renders |
|---|---|
| **default** | box + name bar + 2-bar Tags row |
| **wide** (showcase `Skeleton · wide`) | Tags row disabled (`N3dYQ.enabled=false`) → box + single name bar only |

### Drift to honour (TvXzz LoadingState)
The states board rebuilds 3 skeleton rows inline as **frames** (`skCard1/2/3`) instead of `Skeleton` refs, plus two loose header bars `skTitle` (190×18 `$card-elevated`) + `skSub` (120×12 `$card`):
- inline blocks are `frame` not `rectangle` (cosmetic — both render as solid blocks),
- inner lines use fixed widths `l1 240×12` + `l2 130×10` (vs canon `fill_container` Bar + 70/90 Tags),
- the TvXzz loading variant is **list-only** (no sidebar skeleton), whereas a full `LoadingScreen` would add a sidebar of nav-bar placeholders.

**Reconciliation:** the contract canonicalises the `Skeleton` row (box + name Bar + optional Tags) and adds a `headerBars` option for the loose `skTitle/skSub` lines and a `lineWidths` override for the TvXzz fixed widths. A separate `LoadingScreen` organism (out of this group) composes N×Skeleton (+ optional sidebar). Animation: shimmer (shadcn `animate-pulse`).

**Screen usages:** Empty/Loading/Error TvXzz: LoadingState — 3 inline skeleton rows (skCard1/2/3) + skTitle/skSub header bars; AI Research GZ7xA: 'Notes Skeleton' (3 blocks w/ dot+lines) + mobile 5-line skeleton; Library RcvKu: Skeleton (default) + 'wide' ref

**Reconciliation (screen ← library):** Canonical def is a single TaskCard-shaped row using `rectangle` primitives with fill_container name + 70/90 Tags. The TvXzz board hand-builds it with `frame` blocks, fixed line widths (240/130), and adds loose header bars (skTitle/skSub) — and is list-only (no sidebar). Contract keeps the canonical row, adds `lineWidths` (fixed-width override), a `headerBars`/`count` convenience, and `showStatusBox`. The frame-vs-rectangle difference is cosmetic. A separate LoadingScreen organism (not in this group) owns the multi-row + sidebar composition.

---

## Spinner

**Kind:** atom  ·  **maps_to (camp-404):** LIFT — camp-404 `packages/ui/src/components/spinner.tsx` (token-driven). Scaffolding S1 / design-brief §14 'Lift verbatim'; voice 'processing' state §11.  ·  **maps_to (shadcn):** shadcn pattern: lucide `Loader2` / `loader-circle` with `animate-spin` + an optional label (no dedicated shadcn Spinner component).
  ·  **composes:** composes: (none — leaf atom, lucide icon)

**Anatomy:** Spinner (frame, gap 10, center, horizontal)
├─ Loader (icon, lucide 'loader-circle', 20×20, fill $primary, animate-spin)
└─ L (text, $muted-foreground, JetBrains Mono 12/normal, ls 1) — optional label

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `label` | string |  |  | Mono uppercase label (PROCESSING COMMAND… / SYNCING MISSION…). Omit for icon-only. |
| `showLabel` | boolean |  | true | Hide the label for icon-only use (voice FAB cell). |
| `size` | number |  | 20 | Icon size; 20 inline, ~30 in the voice FAB cell. |
| `glyph` | 'loader'|'arc' |  | 'loader' | 'loader'=lucide loader-circle (default); 'arc'=partial-ring ellipse used on AI Research panels. |
| `tone` | 'primary'|'muted' |  | 'primary' | Spinner colour; $primary by default. |

**Variants:** `processing (PROCESSING COMMAND…)`, `syncing (SYNCING MISSION…)`, `label-less (icon only)`, `glyph: loader (lucide) | arc (AI Research ellipse)`, `size: 20 (inline) | 30 (FAB cell)`

**States:** `spinning (animate-spin — the only active state)`, `reduced-motion fallback (static glyph)`

**Tokens:** `$primary`, `$muted-foreground`

**A11y:** role='status' with aria-live='polite'; label (or aria-label) announces the operation; Spinner glyph is decorative; the label carries meaning; Respects prefers-reduced-motion (stop spin)

## Spinner

An inline processing indicator: a spinning orange `loader-circle` (20px) + an optional mono uppercase label. Used for the voice **processing** state and sync/transient operations — distinct from `Skeleton` (board/list load).

### Canonical anatomy (library `db8Tm`)
```
Spinner (horizontal · gap 10 · center)
  ├ Loader  lucide 'loader-circle' 20×20 $primary  animate-spin
  └ L       JetBrains Mono 12 ls1 $muted-foreground  'PROCESSING COMMAND…'  (optional)
```

### Variants (UNION across boards)
| variant | label | source |
|---|---|---|
| **processing** (default) | `PROCESSING COMMAND…` | library def |
| **syncing** | `SYNCING MISSION…` | showcase `Spinner · syncing` ref |
| **label-less** | — (icon only) | voice FAB processing cell |

### Drift to honour
- **Voice/Toasts board (`T2BChB`):** the processing FAB cell uses a **30px lucide `loader` icon inside the button** — icon name (`loader` vs `loader-circle`) and composition (icon-only, no label, larger) differ. Accept via `size` + `showLabel=false` + an `icon` override.
- **AI Research board (`GZ7xA`):** uses **arc-spinner ellipses** (`innerRadius`/`startAngle`/`sweepAngle` partial-ring) instead of the lucide loader — a distinct spinner glyph reused across job panels, the active step-log row, the target card, and the minimized pill. The contract supports `glyph: 'loader'|'arc'` to cover this.
- design-brief §10 confirms loading taxonomy: **Skeleton** for board/list load vs **Spinner** for voice-command processing — keep them as intentionally separate surfaces.

**Screen usages:** Voice & Toasts T2BChB: processing FAB cell (30px lucide 'loader', icon-only); AI Research GZ7xA: arc-spinner ×7 (job panels, active step row, target card, minimized pill); Library RcvKu: Spinner (processing) + 'syncing' ref; Empty/Loading/Error TvXzz: NOT shown (loading there is skeleton-only — confirms the taxonomy split)

**Reconciliation (screen ← library):** Canonical def is a 20px lucide loader-circle + mono label. Screens diverge two ways: the voice board uses a 30px `loader` (icon, larger, label-less) and the AI Research board uses a custom arc-ellipse spinner. Contract adds `glyph` (loader|arc), `size`, and `showLabel` to cover both, and `label` to cover processing/syncing copy. Confirmed against §10 that Spinner (processing) and Skeleton (board load) are deliberately separate loading surfaces.

---
