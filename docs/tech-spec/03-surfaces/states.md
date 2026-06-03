# Surface Spec — Empty / Loading / Error (`TvXzz`) · P1

*Source: `docs/design-extract/boards/TvXzz__*.json` (screen authoritative). 1 scoped sections.*

# System States — Empty · Loading · Error (board TvXzz)

*scope: States kit spec (empty + loading + error)*

## System States — Empty · Loading · Error

> **Board:** `TvXzz` — "OpsBoard — Empty / Loading / Error (states)" · **Priority:** P1 · **Complexity:** low (44 nodes, ~19 KB)
> **Nature:** This board is a **specimen gallery, NOT a routable screen.** A single `1320×900` `StatesSheet` lays the three non-populated system states side-by-side under one header as a design-catalog reference. Each of the three panels is the **authoritative visual** for that state; the runtime renders each panel independently inside its host surface (board list, app shell, error boundary). Do not treat the sheet as a composed page — treat each panel as the canonical look-and-feel for empty / loading / error.

These states satisfy the brief's universal rule (design-brief §12): **every surface must be designed for empty · loading · populated · error**. This spec covers the three non-populated states (populated lives with each view's own spec). Per the READ-ONLY, voice-first product ethos, the empty and error states are *advisory and calm* — they tell the operator what to **say**, never alarm.

---

### 1. Purpose

| State | When shown | Host surface |
|---|---|---|
| **Empty** | No data to show (e.g. zero missions, or a mission with zero tasks) | Inside the board list / category view content area |
| **Loading** | Data is being fetched for first paint | Replaces the board list / app-shell content while pending |
| **Error** | A view/subtree fails to render or load | Outermost `ErrorBoundary` fallback (S4: "ErrorBoundary outermost") and per-view fallbacks |

A fourth, distinct loading idiom — the **Spinner** ("PROCESSING COMMAND…") — is **not drawn on this board** but belongs to the loading taxonomy: skeletons are for **board/list/first-paint** load; the Spinner is for **voice-command processing** (design-brief §10/VoiceFAB `processing` state). The two are intentionally different surfaces and must not be conflated.

---

### 2. Gallery container — `StatesSheet` (specimen layout, informational)

Top → bottom structure of the sheet (not part of the runtime states; documents how the specimens are arranged):

```
frame TvXzz "OpsBoard — Empty / Loading / Error (states)"  1320×900, fill $background, layout none
└ frame PXhZD "StatesSheet"  1320×900, fill $background, layout vertical
  ├ frame kVxDr "SheetHeader"  fill_container, fill $muted, border-bottom 1px $border (inner),
  │   gap 8, padding [22,40], alignItems center
  │   ├ text X93jN "H"  "SYSTEM STATES"     $primary, JetBrains Mono 13/700, letterSpacing 2
  │   └ text z2IBPL "S"  "— empty · loading · error"  $muted-foreground, JetBrains Mono 13/normal
  └ frame I1etD "Row"  fill_container × fill_container, gap 28, padding 40   (3 equal columns, horizontal default)
    ├ frame emfVQ "W EMPTY"    fill × fill, vertical, gap 12 → [Cap "EMPTY", EmptyState]
    ├ frame Kzkyg "W LOADING"  fill × fill, vertical, gap 12 → [Cap "LOADING", LoadingState]
    └ frame bvAQU "W ERROR"    fill × fill, vertical, gap 12 → [Cap "ERROR", ErrorState]
```

- **SheetHeader:** `$muted` bar, 1px `$border` bottom stroke (inner), padding `[22,40]`, gap 8. Two inline mono texts: brand-orange `SYSTEM STATES` (700, ls 2) + dim `— empty · loading · error` (normal). Eyebrow/Label idiom.
- **Row:** three equal-width columns (`fill_container` each), gap 28, padding 40. Each column is a vertical wrapper (`gap 12`) holding a 11px mono **column caption** (`$muted-foreground-subtle`, 700, ls 2) — `EMPTY` / `LOADING` / `ERROR` — above the live state panel. The captions are gallery scaffolding, not part of the runtime panels.

---

### 3. EMPTY state — `EmptyState` (node `Vpw7Y`)

**Purpose:** Voice-first placeholder shown when there are no missions (or, per the missing variant in §6, no tasks). Tells the operator what to *say*.

**Layout (top → bottom), exact values:**

```
frame Vpw7Y "EmptyState"  fill_container × fill_container
  fill $background, stroke $border 1px (inner), layout vertical, gap 18, padding 24,
  justifyContent center, alignItems center
  ├ icon  H8vWbF "hex"   60×60  lucide "hexagon"  fill $muted-foreground-subtle
  ├ text  wpJhv  "Msg"   "NO MISSIONS YET"   $muted-foreground, JetBrains Mono 14/700, letterSpacing 1.5
  └ frame xtuNf "Say"    horizontal, gap 5, alignItems center
     ├ text L3Xdr "a"  "say"               $muted-foreground-subtle, JetBrains Mono 13/normal
     └ text DlxAY "b"  "“create a mission”" $primary, JetBrains Mono 13/600   (typographic curly quotes)
```

- **Container:** `$background` fill (not `$card`), 1px `$border` inner stroke, fully centered, gap 18, padding 24, radius 0 (global `--radius: 0`, sharp corners).
- **Hexagon motif:** a single **60×60 lucide `hexagon`** glyph, `$muted-foreground-subtle`. This is the prototype's `⬡` tactical motif (design-brief §"Iconography" — "Empty-state keeps the prototype's ⬡ hexagon motif").
- **Message:** `NO MISSIONS YET`, mono 14/700, `$muted-foreground`, letterSpacing 1.5.
- **Voice prompt ("Say" line):** two-node horizontal row, gap 5 — dim `say` + brand-orange quoted command `“create a mission”` (600). The command is the only chroma in the panel, drawing the eye to the spoken action.

**Interactions:** none. Read-only display; voice capture happens at the VoiceFAB, not here.

**Copy variants (from design-brief §11 — board only renders #1; the rest must be supported by the component):**
| Context | Message | Spoken command |
|---|---|---|
| no missions (shown) | `NO MISSIONS YET` | `“create a mission”` |
| mission with no tasks (**MISSING from board** — coverage gap) | `NO TASKS YET` | `“add a task”` |
| no search/voice results | (handled by separate `ErrorStateCard`, muted advisory card — not this component) | — |
| empty timeline / empty category group | empty groups are *skipped* in Category view; Timeline can show its own empty bucket copy | — |

---

### 4. LOADING state — `LoadingState` (node `IsIcL`)

**Purpose:** First-paint skeleton for the **board list** (list-only variant — **no sidebar** on this board). Mirrors the shape of the populated TaskCard list so layout doesn't jump on load.

**Layout (top → bottom), exact values:**

```
frame IsIcL "LoadingState"  fill_container × fill_container
  fill $background, stroke $border 1px (inner), layout vertical, gap 14, padding 24
  ├ frame hbF1K "skTitle"  190×18  fill $card-elevated          ← header title skeleton bar
  ├ frame e3Dfv "skSub"    120×12  fill $card                   ← header subtitle skeleton bar
  ├ frame HNdjW "sp"       fill_container × 8  (no fill)         ← spacer
  ├ frame c5vPdF "skCard1" fill_container × 66  ← skeleton task-card row (see below)
  ├ frame HuxsZ  "skCard2" fill_container × 66  ← identical
  └ frame IqQBy  "skCard3" fill_container × 66  ← identical

skeleton task-card row (skCard1/2/3, each identical):
frame  fill_container × 66, fill $card, stroke $border 1px (inner), gap 12, padding 14, alignItems center
  ├ frame "box"   18×18  fill $card-elevated                    ← StatusCycleButton placeholder
  └ frame "lines" fill_container, vertical, gap 9
     ├ frame "l1"  240×12  fill $card-elevated                  ← title line
     └ frame "l2"  130×10  fill $card-elevated                  ← subtitle/meta line
```

- **Header skeleton bars:** `skTitle` 190×18 on `$card-elevated`, `skSub` 120×12 on `$card`, separated from the list by an 8px spacer (`sp`).
- **Card rows:** three identical 66px rows, each a bordered `$card` card (1px `$border` inner) with `gap 12`, `padding 14`, vertically centered. Each holds an 18×18 `$card-elevated` box (placeholder for the StatusCycleButton glyph) + a vertical `lines` group (`gap 9`) of two fixed-width bars: `l1` 240×12 and `l2` 130×10, both `$card-elevated`.
- **Shimmer:** the placeholder fills are static in the design tree; the runtime applies a shimmer animation (CSS concern — `shadcn` Skeleton's `animate-pulse`, optionally a barely-there `$primary` shimmer hint per the library-board summary). Animation is `aria-hidden`.

**Skeleton taxonomy (the three loading idioms — only the first is on this board):**
| Idiom | Used for | Composition |
|---|---|---|
| **List skeleton** (this board) | board list / category content, first paint | `skTitle`+`skSub`+3× skeleton card rows; **no sidebar** |
| **`LoadingScreen`** (canonical organism, NOT on this board) | full app-shell first paint | 220px `$muted` sidebar (skBrand/skSub + 5 skNav bars) + main column (skTitle/skLead + 3× Skeleton card rows) |
| **`Spinner`** (canonical utility, NOT on this board) | voice-command processing | inline row: spinning lucide `loader-circle` 20px `$primary` + mono `PROCESSING COMMAND…` `$muted-foreground` |

**Interactions:** none.

---

### 5. ERROR state — `ErrorState` (node `H2083`) — board's ErrorBoundaryFallback

**Purpose:** Error-boundary fallback shown when the board fails to render/load. This board renders a **simplified RETRY-only** fallback (no accent bar, no ERR code, no trace, no Report path) — see §7 for how it diverges from the richer canonical `ErrorBoundaryFallback`.

**Layout (top → bottom), exact values:**

```
frame H2083 "ErrorState"  fill_container × fill_container
  fill $background, stroke $border 1px (inner), layout vertical, gap 16, padding 32,
  justifyContent center, alignItems center
  ├ icon  mbaF8 "err"  48×48  lucide "triangle-alert"  fill $destructive
  ├ text  A3cQV "EH"   "SOMETHING BROKE"   $foreground, JetBrains Mono 15/700, letterSpacing 1.5
  ├ text  wXTcf "EB"   "An unexpected error occurred while loading the board."
  │        $muted-foreground, DM Sans 14/normal, lineHeight 1.45, textAlign center,
  │        width fill_container, textGrowth fixed-width
  └ frame oxIi3 "Retry"  fill $primary, horizontal, gap 8, padding [10,18], alignItems center
     ├ icon uILLT "ri"  14×14  lucide "rotate-cw"  fill $primary-foreground
     └ text NLsV7 "rt"  "RETRY"  $primary-foreground, JetBrains Mono 12/700, letterSpacing 1
```

- **Container:** `$background` fill, plain 1px `$border` inner stroke (no destructive accent bar), centered, gap 16, padding 32, radius 0.
- **Icon:** 48×48 lucide `triangle-alert`, `$destructive` (`#e05a5a`) — the only red in the panel.
- **Headline:** `SOMETHING BROKE`, mono 15/700 caps, `$foreground`, ls 1.5.
- **Body:** `An unexpected error occurred while loading the board.` — DM Sans 14, `$muted-foreground`, lineHeight 1.45, centered, `fill_container` width (`fixed-width` growth so wrapping is deterministic).
- **RETRY button:** an inline `$primary` filled frame (NOT a Button ref), `padding [10,18]`, gap 8 — lucide `rotate-cw` 14px `$primary-foreground` + `RETRY` mono 12/700 `$primary-foreground` ls 1. This is the single recovery affordance on this board.

**Interactions:**
- **RETRY (`oxIi3`)** → re-attempts the failed render/load (the host `ErrorBoundary`'s reset / re-fetch). Hover should track `$primary-hover` (`#ff8555`) per the Button spec, focus shows the `$ring` (orange) ring.
- **Accessibility:** the error container must carry **`role="alert"`** (matching the brief's error convention — §"VoiceFAB error" and §"Toast error" both use `role="alert"`) so assistive tech announces the failure. The decorative scanline motif (if applied) and the icon are `aria-hidden`; the alert's accessible name is the headline + body.

---

### 6. Missing / not-drawn states this scope must still support (coverage gaps)

These are required by the brief / canonical kit but are **absent from this specimen board**. The functional spec must carry them forward even though there is no drawn reference here:

1. **Empty — "no tasks yet" variant.** design-brief §11 specifies a second empty copy for *mission-with-no-tasks*: `NO TASKS YET` / `“add a task”`. Only the no-missions variant is drawn. EmptyState must parameterize message + spoken command.
2. **`LoadingScreen` (app-shell skeleton with sidebar).** The full-screen first-paint skeleton (220px sidebar + main column) is a canonical organism not drawn here; this board only shows the sidebar-less list variant.
3. **`Spinner` (voice-processing indicator).** "PROCESSING COMMAND…" inline spinner is part of the loading taxonomy but not on this board (it lives on the VoiceFAB surface).
4. **Full `ErrorBoundaryFallback`** (accent bar + ERR code + trace + Reload+Report two-action). The board shows the simplified RETRY-only variant; the richer outermost fallback variant is canonical (see §7).

---

### 7. Divergence from canonical components (screens are authoritative; this is the reconciliation ledger)

> **Source-of-truth rule:** where the screen diverges from the canonical component def, **the screen wins** and the canonical contract must be widened. Each row below records how the *as-rendered* panel diverges; the resolution column states the screen-led decision.

**EmptyState (board `Vpw7Y` vs canonical `Ie7mv`):**
| Aspect | Board (authoritative) | Canonical def | Resolution |
|---|---|---|---|
| Hex glyph | single 60×60 lucide `hexagon`, `$muted-foreground-subtle` | 60×60 `Hex` frame = 6-sided **polygon** (2px stroke) **+ inner 22×22 lucide `mic`** abs at (19,19) | Screen wins: hexagon is a single lucide `hexagon` glyph; the inner mic is dropped. Canonical icon slot becomes a swappable lucide icon, default `hexagon`. |
| Container fill | `$background` | `$card` | Screen wins: `$background`. |
| Padding / gap | padding 24, gap 18 | padding [48,24], gap 16 | Screen wins: padding 24, gap 18. |
| Message style | `$muted-foreground`, 14, ls 1.5 | `$foreground`, 13, ls 1.5 | Screen wins: `$muted-foreground` 14. |
| Prompt structure | two-node horizontal `Say` row: `say` + `“create a mission”` ($primary 600), **JetBrains Mono 13** | single `Hint` text `Say "create a mission" to get started.` in **DM Sans 13** `$muted-foreground`, no highlight | Screen wins: split mono row with an orange-highlighted spoken command. Widen contract to a `{say, command}` pair. |

**Skeleton (board `skCard1/2/3` vs canonical `HLa60`):**
| Aspect | Board (authoritative) | Canonical def | Resolution |
|---|---|---|---|
| Refs vs inline | three bespoke inline frames, **no refs** | three `ref HLa60` instances | Build target may use a single reusable Skeleton primitive; visual is the board's. |
| Bar primitive | `frame` nodes | `rectangle` primitives | Implementation detail; render identically. |
| Bar fields | fixed-width `l1` 240×12, `l2` 130×10, both `$card-elevated`; box 18×18 `$card-elevated` | `Bar` fill_container × 14 + a **`Tags` sub-row** (two bars 70×12 / 90×12) | Screen wins: two stacked fixed-width line bars, **no Tags sub-row**. |
| Header bars | loose `skTitle` 190×18 `$card-elevated` + `skSub` 120×12 `$card` above the list | header bars live inside `LoadingScreen` Main column | Screen wins: list variant carries its own header skeleton; no sidebar. |

**LoadingState vs canonical `LoadingScreen` (`lLfcN`):**
| Aspect | Board (authoritative) | Canonical def | Resolution |
|---|---|---|---|
| Sidebar | **none** — list-only | 220px `$muted` sidebar (skBrand/skSub + 5 skNav bars) | Screen wins: this is the **list/board** skeleton variant. `LoadingScreen` (sidebar+main) remains a separate canonical variant for app-shell first paint (not on this board). Widen `LoadingScreen` with `showSidebar` so the no-sidebar list skeleton is a first-class variant. |

**ErrorState (board `H2083`) vs canonical `ErrorBoundaryFallback` (`d4KRE9`):**
| Aspect | Board (authoritative) | Canonical def | Resolution |
|---|---|---|---|
| Accent bar | **none** | 2px `$destructive` top accent bar | Board renders the simplified variant; full fallback (with accent bar) is the `variant="full"`/fatal form. Both supported. |
| Container stroke | `$border` | `$destructive` | Screen wins for this variant: `$border`. |
| ERR code line | **omitted** | `ERR · COMPONENT TREE CRASHED` mono 11/700 `$destructive` | Optional (`errorCode?`); RETRY variant omits it. |
| Trace line | **omitted** | `TRACE 0x3F·… · build 2026.06.03 · render@TaskBoard` mono 10 `$muted-foreground-subtle` | Optional (`trace?`); RETRY variant omits it. |
| Headline | `SOMETHING BROKE` **JetBrains Mono 15/700 caps** | `Something broke` DM Sans 20/700 sentence-case | Screen wins: mono 15 caps. |
| Body | `An unexpected error occurred while loading the board.` DM Sans 14 | longer "…stopped this view from rendering. Reload to recover, or report the issue with the trace below." DM Sans 13 | Screen wins: short body, DM Sans 14. |
| Actions | single inline `$primary` **RETRY** frame (rotate-cw + RETRY), **no Button ref, no Report** | `Reload` (primary, **ref Button `AtbGz`**) + `Report` (outline, bug icon) | Screen wins for the **RETRY-only** variant: one primary action, `rotate-cw` icon, label `RETRY`. Reconcile to the canonical Button (variant=default, leading icon). Full fallback keeps Reload+Report. |
| `ErrorStateCard` confusion | this panel is the **ErrorBoundaryFallback**, NOT `ErrorStateCard` | `ErrorStateCard` (`d2mdF`) = the muted left-accent "NO RESULTS FOUND" / "SAY IT AGAIN" voice-retry card for search/voice no-results | Keep distinct: destructive boundary fallback ≠ advisory no-results card. |

**Button (RETRY) — reconcile inline frame to canonical `AtbGz`:** the RETRY affordance is an inline `$primary` frame, not a Button ref. Reconcile to `<Button variant="default">` with a leading `rotate-cw` icon and a mono `RETRY` label (`$primary-foreground`, JetBrains Mono 12/700, ls 1); hover `$primary-hover`, focus `$ring`.

**Eyebrow — captions are raw text:** `SYSTEM STATES`, `EMPTY`, `LOADING`, `ERROR` are raw mono text nodes (gallery scaffolding), purpose-matching the Eyebrow/Label idiom; not runtime components.

---

### 8. Data & logic contracts

- **EmptyState** is rendered when the data query returns an empty collection. The host decides the variant: zero missions → `NO MISSIONS YET` / `“create a mission”`; a selected mission with zero tasks → `NO TASKS YET` / `“add a task”`. Props: `{ icon? (lucide, default hexagon), message, say, command }`.
- **LoadingState / Skeleton** is rendered while the data query is pending (first paint). It is purely presentational — no data binding, no domain-state matrix (no window/status variants exist in any state panel on this board). The list variant defaults to 3 skeleton card rows; `cardCount` should be parameterizable to roughly match expected list length. `LoadingScreen` adds `showSidebar?` for app-shell first paint.
- **Spinner** is driven by the voice pipeline `processing` state, not by data fetching — keep its trigger separate from skeleton loading.
- **ErrorState / ErrorBoundaryFallback** is rendered by the surrounding React `ErrorBoundary` when a child subtree throws (S4: "ErrorBoundary outermost"; adapted from intake-tracker `error-boundary`). Props (RETRY variant): `{ title='SOMETHING BROKE', description, onRetry }`. Full variant adds `{ errorCode?, trace?, onReload, onReport? }`. `onRetry`/`onReload` resets the boundary and re-renders/re-fetches; `onReport` (full variant only) opens the report flow (ShakeReportSheet / ReportComposer). No domain data is read by the fallback beyond the caught error metadata.
- **No window-state or status logic** appears in any panel here; `blocked` and window state are computed elsewhere and are irrelevant to these chrome surfaces.

---

### 9. Tokens used (resolved)

`$background` `#0a0a0c` · `$muted` `#131318` · `$muted-foreground` `#7a7a8e` · `$muted-foreground-subtle` `#4a4a5e` · `$foreground` `#e8e8f0` · `$card` `#1a1a22` · `$card-elevated` `#22222e` · `$border` `#2a2a38` · `$primary` `#ff6b35` · `$primary-foreground` `#0a0a0c` · `$destructive` `#e05a5a`. Global `--radius: 0` → all corners sharp. Fonts: **JetBrains Mono** (eyebrows, messages, headlines, RETRY label, voice command) · **DM Sans** (error body sentence).

---

### 10. Notes

- The decorative scanline/CRT motif may be applied to the empty state (design-brief §1) but is **always `aria-hidden`** and decorative-only; it is not present in this board's node tree.
- Reuse mapping (scaffolding-plan): EmptyState/Spinner/Alert → **LIFT** from camp-404 `packages/ui` (re-skin via tokens); Skeleton → shadcn/ui Skeleton primitive styled with `$card-elevated` bars; ErrorBoundary → **ADAPT** intake-tracker `error-boundary` (outermost); EmptyState copy → voice-first per S4.



## Open items (this board)

- RECONCILIATION: hexagon treatment — board uses a single lucide 'hexagon' glyph; canonical EmptyState uses an outlined 6-sided polygon + inner lucide 'mic'. Screen wins (single hexagon glyph, no mic) but consolidation phase must confirm the inner mic is intentionally dropped vs. wanted for voice signalling.
- COVERAGE GAP: the 'no tasks yet — say "add a task"' empty copy variant (design-brief §11) is not drawn on this board; EmptyState must parameterize message + spoken command to support it.
- COVERAGE GAP: full ErrorBoundaryFallback variant (2px $destructive accent bar, ERR code line, trace line, Reload+Report two-action) is not drawn here — only the RETRY-only simplified variant. The full/fatal variant must still be specced as a canonical variant.
- COVERAGE GAP: LoadingScreen app-shell variant (220px sidebar + main column) is not drawn; only the sidebar-less list skeleton appears. Add a showSidebar variant so both are first-class.
- COVERAGE GAP: Spinner ('PROCESSING COMMAND…' loader-circle row) is absent from this board; confirm in consolidation that the loading taxonomy keeps skeleton (data first paint) and Spinner (voice processing) as distinct surfaces.
- RECONCILIATION: RETRY is an inline $primary frame, not a Button ref — reconcile to <Button variant=default> with leading rotate-cw icon while preserving the screen-authoritative mono 12/700 styling.
- DISTINCTION: ensure ErrorBoundaryFallback (destructive boundary fallback) is not conflated with ErrorStateCard (muted left-accent 'NO RESULTS FOUND' / 'SAY IT AGAIN' search/voice no-results card).
- MOTIF: decide whether the restrained scanline/CRT motif is applied to the empty state (design-brief §1 allows it); if so it must be aria-hidden and decorative-only — not present in this board's node tree.

## Coverage checklist (verification targets)

- [ ] StatesSheet gallery container: 1320x900 frame, vertical layout, SheetHeader ($muted, border-bottom 1px $border, padding [22,40], gap 8) with 'SYSTEM STATES' ($primary mono 13/700 ls2) + '— empty · loading · error' ($muted-foreground), and Row (gap 28, padding 40, 3 equal columns) — documented as specimen layout, not a runtime screen.
- [ ] Three column captions EMPTY/LOADING/ERROR ($muted-foreground-subtle mono 11/700 ls2) and their vertical gap-12 wrappers.
- [ ] EmptyState (Vpw7Y): container ($background fill, $border 1px inner stroke, gap 18, padding 24, centered), 60x60 lucide hexagon ($muted-foreground-subtle), 'NO MISSIONS YET' (mono 14/700 ls1.5 $muted-foreground), 'Say' row gap 5 with 'say' (subtle) + orange '“create a mission”' (600), all JetBrains Mono 13.
- [ ] EmptyState copy variants enumerated: no-missions (shown) + the required-but-missing no-tasks ('NO TASKS YET' / '“add a task”') + relation to ErrorStateCard for no-results.
- [ ] LoadingState (IsIcL): container (gap 14, padding 24), header bars skTitle 190x18 $card-elevated + skSub 120x12 $card + 8px spacer, three identical 66px skeleton card rows ($card, $border 1px inner, gap12 pad14) each with 18x18 $card-elevated box + lines(gap9) of l1 240x12 + l2 130x10.
- [ ] Skeleton loading taxonomy table: list skeleton (this board) vs LoadingScreen (app-shell, sidebar+main) vs Spinner (voice processing) — all three idioms enumerated with composition.
- [ ] ErrorState (H2083): container ($background, $border 1px inner, no accent bar, gap 16, padding 32, centered), 48x48 triangle-alert $destructive, 'SOMETHING BROKE' (mono 15/700 ls1.5 $foreground), DM Sans 14 body (lineHeight 1.45, centered, fill_container), inline $primary RETRY frame (padding [10,18], gap 8) with rotate-cw 14px + 'RETRY' (mono 12/700 ls1 $primary-foreground).
- [ ] RETRY interaction (reset boundary / re-fetch, hover $primary-hover, focus $ring) and role=alert accessibility semantics documented.
- [ ] Full divergence ledger vs canonical defs: EmptyState (Ie7mv), Skeleton (HLa60), LoadingScreen (lLfcN), ErrorBoundaryFallback (d4KRE9 — accent bar/ERR code/trace/Reload+Report), Button (AtbGz inline-vs-ref), Spinner (db8Tm), with screen-wins resolutions per row.
- [ ] Distinction between ErrorBoundaryFallback (this board) and ErrorStateCard (search/voice no-results card) called out.
- [ ] Data/logic contracts: render triggers (empty query / pending query / thrown subtree / voice processing), props per component, ErrorBoundary reset + onReport flow, role=alert, no window/status logic in scope.
- [ ] All tokens resolved to hex, fonts (JetBrains Mono vs DM Sans) and global radius 0 noted.
- [ ] Coverage gaps / open items enumerated: no-tasks empty variant, full ErrorBoundaryFallback variant, LoadingScreen sidebar variant, Spinner, RETRY->Button reconciliation, scanline motif decision.