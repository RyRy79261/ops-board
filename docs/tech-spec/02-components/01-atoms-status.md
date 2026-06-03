# Components — Status & Action Atoms

*10 contracts. Screens authoritative; library reconciled toward screen usage.*

## Button

**Kind:** atom  ·  **maps_to (camp-404):** LIFT packages/ui/src/components/button.tsx verbatim (6 variants × 5 sizes; rename scope only)  ·  **maps_to (shadcn):** shadcn/ui "new-york" Button (Radix Slot + CVA); design-brief §14 lift verbatim

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `variant` | 'primary'|'secondary'|'outline'|'ghost'|'destructive'|'link' |  | primary | CVA variant. primary=$primary; secondary=$secondary+stroke $border; outline=transparent+stroke $border; ghost=transparent; destructive=$destructive; link=transparent, padding [9,0]. |
| `size` | 'sm'|'base'|'lg'|'xl'|'icon' |  | base | 5 sizes from camp-404. base=padding [9,16], label 13px. size=icon exposed as IconButton. |
| `children` | ReactNode | ✓ |  | Label text (JetBrains Mono 13/600 +0.5) and/or leading/trailing Lucide icon (16×16). |
| `onClick` | () => void |  |  | Click handler. Used only on voice/toast/error/settings surfaces, never on the read-only board body. |
| `disabled` | boolean |  | false | Disabled (dimmed, non-interactive). |
| `asChild` | boolean |  | false | Radix Slot passthrough (shadcn new-york convention). |

**Variants:** `primary (fill $primary, label $primary-foreground) — base`, `secondary (fill $secondary, stroke $border 1px)`, `outline (transparent fill, stroke $border 1px)`, `ghost (transparent fill, no stroke)`, `destructive (fill $destructive, label $destructive-foreground)`, `link (transparent, padding [9,0], underline-on-hover)`, `sizes: sm | base | lg | xl | icon`

**States:** `default`, `hover (primary→$primary-hover; outline/ghost→bg-accent lift; border→$border-hover)`, `active/pressed`, `focus-visible (2px $ring)`, `disabled`

**Tokens:** `$primary`, `$primary-hover`, `$primary-foreground`, `$secondary`, `$secondary-foreground`, `$border`, `$border-hover`, `$destructive`, `$destructive-foreground`, `$foreground`, `$ring`, `$accent`, `--radius (0)`

**A11y:** Renders as <button> (or Slot via asChild); keyboard-focusable; 2px $ring focus-visible ring.; Icon-only usage must route through IconButton with aria-label.; $primary-foreground (near-black) on $primary (orange) passes AA.; Destructive (DELETE) action in the confirmation toast must be keyboard-reachable and announced within the toast region.

### Button

**Maps to:** shadcn/ui "new-york" `Button` (Radix Slot + CVA) · camp-404 `packages/ui/src/components/button.tsx` **LIFT verbatim** (6 variants × 5 sizes; rename scope only). Re-skins automatically via OKLCH tokens.

**Anatomy**
```
Button (frame, fill=$primary, gap=7, padding=[9,16], justify=center, align=center, sharp/--radius:0)
├─ [optional leading icon] (Lucide 16×16)
├─ Label (text, JetBrains Mono 13/600, letterSpacing 0.5, fill=$primary-foreground, e.g. "Save")
└─ [optional trailing icon] (Lucide 16×16)
```

**Variants (showcase RcvKu, exact fills):** `primary` (base — fill $primary, label $primary-foreground) · `secondary` (fill $secondary + stroke $border 1px) · `outline` (transparent fill + stroke $border 1px) · `ghost` (transparent, no stroke) · `destructive` (fill $destructive) · `link` (transparent, padding [9,**0**]). **Sizes:** sm · base · lg · xl · icon (icon size split into IconButton).

**States:** default · hover (primary→$primary-hover #ff8555; outline/ghost→bg-accent lift; border→$border-hover) · active · focus-visible (2px $ring) · disabled.

**Screen usage:** Voice & Toasts board (T2BChB) confirmation-toast action row = **DELETE** (`destructive`) + **CANCEL** (`outline`); empty/error CTAs. **Absent from the three read-only views** (Category/Timeline/Dependencies) and sidebar — confirms LOCKED #4 (board is read-only). Button is scoped to voice/toast/error/settings only.

**Reconciliation:** Canonical def is just the `primary · base` cell; the Voice board proves the full 6-variant CVA is required (destructive + outline pair). Those toast buttons are currently hand-built frames — the contract mandates they resolve to `Button` refs.

**Screen usages:** Voice & Toasts (T2BChB) confirmation-toast action row: DELETE (destructive) + CANCEL (outline), currently hand-built frames (drift).; Empty/Loading/Error (TvXzz): EmptyState + ErrorBoundaryFallback CTAs.; Library showcase (RcvKu) Spec — Button: the 6-variant demo row.; ABSENT from Category/Timeline/Dependencies views and sidebar (read-only board, LOCKED #4).

**Reconciliation (screen ← library):** Canonical def is only the primary·base cell. Widened toward screens: full 6-variant CVA required (toast DELETE/CANCEL); those frames must resolve to Button refs; no Button on the read-only views.

---

## IconButton

**Kind:** atom  ·  **maps_to (camp-404):** LIFT button.tsx with size=icon (no separate file); design-brief §14  ·  **maps_to (shadcn):** shadcn/ui "new-york" Button size=icon

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `icon` | LucideIcon | ✓ |  | Lucide glyph rendered at 16×16. |
| `variant` | 'ghost'|'primary'|'outline' |  | ghost | ghost=transparent (icon $muted-foreground); primary=$primary fill; outline=stroke $border 1px. |
| `aria-label` | string | ✓ |  | REQUIRED accessible name (icon-only control has no visible text). |
| `onClick` | () => void |  |  | Click handler. |
| `disabled` | boolean |  | false | Disabled state. |

**Variants:** `ghost · base (36×36, transparent, icon $muted-foreground)`, `primary (fill $primary, icon $primary-foreground)`, `outline (transparent fill, stroke $border 1px, icon $muted-foreground)`

**States:** `default`, `hover (icon→$foreground / bg-accent lift; outline border→$border-hover)`, `active/pressed`, `focus-visible (2px $ring)`, `disabled`

**Tokens:** `$muted-foreground`, `$foreground`, `$primary`, `$primary-foreground`, `$border`, `$border-hover`, `$ring`, `$accent`, `--radius (0)`

**A11y:** aria-label mandatory (icon-only).; 36×36 visible box; ensure ≥44px effective touch hit area.; 2px $ring focus-visible ring.; Lucide icon aria-hidden (label carried by aria-label).

### IconButton

**Maps to:** shadcn/ui "new-york" `Button` with `size="icon"` (showcase SpecCap literally: "IconButton · shadcn/ui Button (size=icon)"). camp-404 button.tsx **LIFT** (it is Button at the icon size; no separate file).

**Anatomy**
```
IconButton (frame, width=36, height=36, justify=center, align=center, sharp)
└─ icon (Lucide 16×16, fill=$muted-foreground; e.g. "ellipsis")
```

**Variants (showcase RcvKu):** `ghost · base` (36×36, transparent, icon $muted-foreground) · `primary` (fill $primary, icon $primary-foreground) · `outline` (transparent + stroke $border 1px).

**States:** default · hover (icon→$foreground / bg-accent lift; outline border→$border-hover) · active · focus-visible (2px $ring) · disabled.

**Screen usage:** Library showcase + the canonical AppHeader Actions cluster (SyncStatus/Search/Notifications/More). The desktop boards **omit** the actions cluster (space_between with empty right side) — so IconButton is a registered library atom whose mandated screen home (header actions) is currently dropped; otherwise used in voice/error chrome.

**Reconciliation:** Canonical def is one ghost cell; showcase confirms primary + outline. Distinct from StatusCycleButton (an 18px tri-state square, NOT a Button). The 36×36 frame is the visual box — pad to ≥44px hit area on touch.

**Screen usages:** Library showcase (RcvKu) Spec — IconButton: ghost·base / primary / outline (36×36, ellipsis).; Canonical AppHeader Actions cluster (SyncStatus/Search/Notifications/More) — OMITTED on the desktop boards (drift).; Voice/error chrome single-glyph tap targets.

**Reconciliation (screen ← library):** Canonical def is one ghost cell; showcase adds primary + outline. Its mandated screen home (header actions) is dropped on the boards — registered as a library atom. Not to be confused with StatusCycleButton.

---

## Badge

**Kind:** atom  ·  **maps_to (camp-404):** ADAPT badge.tsx — add window-state + status variants; normalize tints /15→/12 (§7). Shared substrate for CategoryTag/WindowStatePill/StatusBadge.  ·  **maps_to (shadcn):** shadcn/ui "new-york" Badge (CVA)

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `variant` | 'outline'|'muted'|'accent'|cat-*|window-*|status-* |  | outline | CVA variant. Base 3: outline (stroke $border, $muted-foreground), muted (fill $muted), accent (fill primary/12 #ff6b351f). cat-*/window/status surfaced via CategoryTag/WindowStatePill/StatusBadge wrappers. |
| `icon` | LucideIcon | 'dot' |  |  | Optional 12×12 Lucide glyph or 6px ellipse dot (LOCKED #6 redundant channel). |
| `children` | ReactNode | ✓ |  | Label — uppercase, JetBrains Mono 11/600 +0.5. |

**Variants:** `outline · base (stroke $border 1px, label $muted-foreground)`, `muted (fill $muted, strokeWidth 0)`, `accent tint (fill #ff6b351f = primary/12, strokeWidth 0)`, `category tints (5) at /12 — via CategoryTag`, `window-state (4: open/closing/closed/not-yet) — via WindowStatePill`, `status (3: not-started/in-progress/done) — via StatusBadge`

**States:** `default`, `hover (border→$border-hover or fill→/18 lift)`, `with-icon / with-dot / text-only`

**Tokens:** `$border`, `$border-hover`, `$muted`, `$muted-foreground`, `$primary (via /12 = #ff6b351f)`, `--radius (0; cornerRadius=999 override per LOCKED #2)`

**A11y:** Label (icon + word + color) carries meaning per LOCKED #6 — color never alone.; Lucide icon aria-hidden; uppercase label is the accessible text.; cornerRadius 999 is the explicit rounded-full exception to --radius:0 (LOCKED #2).

### Badge

**Maps to:** shadcn/ui "new-york" `Badge` (CVA) · camp-404 `badge.tsx` **ADAPT** (already an uppercase tracked pill). Per §14: ADD window-state + status variants; per §7 normalize camp tints **/15 → /12**. Badge is the **shared substrate** for CategoryTag, WindowStatePill, StatusBadge.

**Anatomy**
```
Badge (frame, cornerRadius=999 [rounded-full — LOCKED #2 exception], stroke=$border, strokeWidth=1, gap=5, padding=[4,10], align=center)
├─ [optional leading icon 12×12 OR ellipse dot 6px]   (redundant channel, LOCKED #6)
└─ Label (text, UPPERCASE, JetBrains Mono 11/600, letterSpacing 0.5, fill=$muted-foreground)
```

**Variants (showcase RcvKu base 3):** `outline · base` (stroke $border 1px, label $muted-foreground) · `muted` (fill $muted, strokeWidth 0) · `accent tint` (fill #ff6b351f = primary/12, strokeWidth 0). **§14 ADAPT additions** consumed via wrappers: 5 category tints (/12), 4 window-state, 3 status.

**States:** default · hover (border→$border-hover or fill→/18 hover-lift per §7) · with-icon / with-dot / text-only.

**Reconciliation:** Canonical = bordered outline pill. Screens frequently render tint variants **borderless** (strokeWidth 0, filled) — contract supports both bordered and borderless-filled modes. Tints normalized to /12 (hex `1f` ≈ 12% alpha) per §7. cornerRadius 999 is the explicit rounded-full exception to --radius:0.

**Screen usages:** Showcase (RcvKu) Spec — Badge/Pill: outline·base / muted / accent tint.; Category board NavCard cliff chip (timer + T-3d, warning) — Badge/chip hybrid.; Sidebar window-summary + mission cliff chips across all three views.; AI Research: ScopeChip/CitationChip/ResearchAttachedBadge.; Indirect substrate: CategoryTag, WindowStatePill, StatusBadge.

**Reconciliation (screen ← library):** Canonical = bordered outline pill; showcase adds muted + accent-tint. Screens prove Badge is the shared substrate for the 3 wrappers and often render tints borderless/filled — contract supports bordered + borderless-filled. Tints = /12 per §7.

---

## CategoryTag

**Kind:** atom  ·  **maps_to (camp-404):** ADAPT IconBadge → 5 category tones at /12 (§14), built as Badge cat-* CVA variants  ·  **maps_to (shadcn):** shadcn/ui Badge with category CVA variant (icon + label)
  ·  **composes:** Badge

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `category` | 'medical'|'bureaucratic'|'travel'|'gear'|'tech' | ✓ |  | Drives hue + Lucide icon + label per §4. |
| `variant` | 'pill'|'inline' |  | pill | pill = tinted rounded-full Badge (cornerRadius 999, fill cat/12). inline = sharp/borderless dot+icon+label on dense desktop/mobile cards (cornerRadius 0, padding [3,8]). |
| `showDot` | boolean |  | false | Leading 6px category-colored dot (timeline/deps/mobile cards do this in addition to the icon). |
| `dimmed` | boolean |  | false | Greys icon+label to $muted-foreground when the parent task is blocked/not-yet. |

**Variants:** `medical (#e05a9f1f / Stethoscope / MEDICAL) — base`, `bureaucratic (#5aa0e01f / FileText / BUREAUCRATIC)`, `travel (#5ae0a01f / Plane / TRAVEL)`, `gear (#e0c05a1f / Backpack / GEAR)`, `tech (#a05ae01f / Cpu / TECH)`, `render modes: pill vs inline`, `dimmed (cat → $muted-foreground on blocked/not-yet)`

**States:** `default (cat-colored)`, `dimmed/greyed (blocked/not-yet parent)`, `pill vs inline rendering`

**Tokens:** `$cat-medical`, `$cat-bureaucratic`, `$cat-travel`, `$cat-gear`, `$cat-tech`, `cat-{x}/12 fills (#e05a9f1f / #5aa0e01f / #5ae0a01f / #e0c05a1f / #a05ae01f)`, `$muted-foreground (dimmed)`, `--radius (0; 999 for pill mode per LOCKED #2)`

**A11y:** Three redundant channels per LOCKED #6: hue + Lucide icon + uppercase label — never color alone.; Lucide icon aria-hidden; the uppercase category word is the accessible text.; Authoritative icon set §4: Stethoscope/FileText/Plane/Backpack/Cpu; reject mobile drift (pill/route/package).

### CategoryTag

**Maps to:** shadcn/ui Badge (category CVA variant) · camp-404 **ADAPT** IconBadge → 5 category tones at /12 (§14). Showcase SpecCap: "CategoryTag · shadcn/ui Badge (icon + label, 12% tint)".

**Anatomy**
```
CategoryTag (frame, fill=cat-{x}/12 [#hex1f], cornerRadius=999 [pill] | 0 [inline], gap=5, padding=[4,10] pill / [3,8] card, align=center)
├─ [ellipse dot 6px, fill=$cat-{x}]   (showDot — timeline/deps/mobile cards)
├─ icon (Lucide cat glyph 12×12, fill=$cat-{x})
└─ Label (text, CATEGORY uppercase, JetBrains Mono 11 [10 dense] / 600 [normal on timeline/deps], letterSpacing 0.5–1, fill=$cat-{x} [muted when dimmed])
```

**Category matrix (§4 — authoritative):** medical `#e05a9f` Stethoscope MEDICAL · bureaucratic `#5aa0e0` FileText BUREAUCRATIC · travel `#5ae0a0` Plane TRAVEL · gear `#e0c05a` Backpack GEAR · tech `#a05ae0` Cpu TECH. Tints at /12: `#e05a9f1f` / `#5aa0e01f` / `#5ae0a01f` / `#e0c05a1f` / `#a05ae01f`.

**Render modes:** `pill` (showcase: rounded-full tinted, cornerRadius 999, padding [4,10]) · `inline` (dense Category/mobile cards: sharp cornerRadius 0, padding [3,8], sometimes borderless, +dot).

**States:** default (cat-colored) · **dimmed** (→$muted-foreground on blocked/not-yet rows — deps + timeline) · pill vs inline.

**Screen usage:** Category (11), Timeline (10, muted label drift), Dependencies (10, greyed-when-blocked), Mobile (13, bare dot+icon+label). Showcase shows all 5 hues as pills.

**Reconciliation:** Canonical/showcase = tinted rounded-full pill. Screens diverge in render mode (sharp/inline on cards, +leading dot, muted-weight label on timeline/deps) → contract registers `variant` (pill|inline) + `showDot` + `dimmed`. **Icon drift rejected:** mobile uses pill/route/package; the §4 table (Stethoscope/Plane/Backpack) wins.

**Screen usages:** Category (D3JA0i): 11 inline tags (sharp, borderless, icon+colored label, #cat/12 fill).; Timeline (a3Dgz): 10 dot+icon+MUTED-label (drift).; Dependencies (b1b079): 10, greyed to $muted-foreground on blocked/not-yet.; Mobile (h9YSWg): 13 bare dot+icon+label, no pill bg.; Showcase (RcvKu): all 5 hues as tinted pills.

**Reconciliation (screen ← library):** Showcase pill is canonical; cards diverge (sharp/inline, +dot, muted label) → variant+showDot+dimmed props. Icon drift reconciled to §4. Tint = /12; radius 0 vs 999 = LOCKED #2 pill exception.

---

## WindowStatePill

**Kind:** molecule  ·  **maps_to (camp-404):** ADAPT badge.tsx — add window-state variants (§14); driven by packages/core/window-state.ts  ·  **maps_to (shadcn):** shadcn/ui Badge with window-state CVA variant
  ·  **composes:** Badge

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `state` | 'open'|'closing'|'closed'|'not-yet'|'blocked' | ✓ |  | Computed window state (NEVER stored). Precedence (§9): closed > not-yet(blocked) > not-yet(not_before) > closing > open. 'blocked' is the dependency-derived overload screens fold into this pill. |
| `daysUntil` | number |  |  | closing → 'CLOSING · T-{n}d'; some boards also 'OPEN · T-{n}d'. |
| `date` | string |  |  | Plain real-world date. OPEN overload renders ONLY the date (no icon); closed appends a date; not-yet appends 'starts {date}'. |
| `variant` | 'bordered'|'tinted'|'bare' |  | tinted | bordered = showcase open (stroke $border 1px, transparent); tinted = filled (state/12 fill, no stroke); bare = no stroke/no radius inline (Category cards). |
| `showOpen` | boolean |  | false | Open-window decision (§16 #4, recommended absence=healthy): governs whether open shows a pill, a bare date, or nothing. |

**Variants:** `open (circle/$muted-foreground; OR bare date '15 Mar' no icon; OR circle/$success; OR 'OPEN · T-{n}d' timer)`, `closing (warning/12, Clock per §8 — drift timer/alarm-clock; $warning; 'CLOSING · T-{n}d')`, `closed (muted, XCircle per §8 — drift lock/$destructive REJECTED; mobile x; 'WINDOW CLOSED' + date)`, `not-yet · not_before (muted-subtle, Lock, 'NOT YET' + 'starts {date}')`, `blocked OVERLOAD (muted NOT red, AlertTriangle per §9 — drift ban/lock; 'BLOCKED')`, `done/status OVERLOAD (timeline/mobile fold DONE+check here)`, `plain-date OVERLOAD (bare date, no state)`, `aggregate-summary OVERLOAD (sidebar: 'ON TRACK'/'COMPLETE'/'N OPEN'/'N CLOSED · M CLOSING')`

**States:** `open`, `closing (T-{n}d)`, `closed (+date)`, `not-yet (+starts date)`, `blocked`, `bordered vs tinted vs bare render`, `aggregate-summary (sidebar)`

**Tokens:** `$border`, `$muted`, `$muted-foreground`, `$muted-foreground-subtle`, `$warning`, `warning/12 (#d9a73e1f)`, `$success`, `$destructive (drift — should be muted for closed per §9)`, `$card-elevated (mobile pill fill)`, `--radius (0; cornerRadius 999/100 pill exception)`

**A11y:** Four redundant channels (§9): color + icon + label + opacity/strikethrough — never color alone.; Never the word 'overdue' (LOCKED #3) — past-cliff is 'WINDOW CLOSED', muted grey.; Closed/blocked use muted grey NOT red (LOCKED #3 / §12 anti-state: no panic-red). Red is danger-only.; Lucide icon aria-hidden; uppercase phrase is the accessible text.; Live-updating (use-now-tick 60s) — passive status, do not over-announce (aria-live off).; Authoritative icon set §8: Clock/XCircle/AlertTriangle/Lock; reject board drifts.

### WindowStatePill — the core window-state carrier (§9)

**Maps to:** shadcn/ui Badge (window-state CVA) · camp-404 `badge.tsx` **ADAPT** (add open/closing/closed/not-yet). Driven by computed window state from `packages/core/window-state.ts`. Showcase SpecCap: "WindowStatePill · shadcn/ui Badge (window lifecycle)".

**Anatomy**
```
WindowStatePill (frame, cornerRadius=999 [pill] | 0 [bare inline], stroke=$border [open] | none [tinted], strokeWidth=1|0, gap=5, padding=[4,10], align=center)
├─ icon (Lucide window-state glyph 12×12 [11–12 on cards], fill=state-color)
├─ Label (text, UPPERCASE phrase, JetBrains Mono 11/600 [normal on date overload], letterSpacing 0.5, fill=state-color)
└─ [optional trailing date text (JetBrains Mono 11, $muted-foreground-subtle)]
```

**FULL state/overload union (screens authoritative):**
| State | Color | Icon (§8 canonical) | Label | Notes / board drift |
|---|---|---|---|---|
| **open** | neutral / $muted-foreground (or $success) | circle/circle-dot | `OPEN` | Category renders **bare date only** (`15 Mar`, no icon); deps shows circle/$success; mobile `OPEN · T-{n}d` w/ timer |
| **closing** | $warning, fill warning/12 #d9a73e1f | **Clock** (drift: timer/alarm-clock) | `CLOSING · T-{n}d` (e.g. T-5d, T-3d, ·9D) | left-l-2 border-warning on card |
| **closed** | $muted-foreground (NOT red) | **XCircle** (drift: circle-x/x/lock) | `WINDOW CLOSED` (+date) | deps drift→$destructive+lock (REJECT) |
| **not-yet·not_before** | $muted-foreground-subtle | **Lock** | `NOT YET` + `starts {date}` / `STARTS {DATE}` | dim 0.6 |
| **blocked** (overload) | $muted-foreground (NOT red, LOCKED #3) | **AlertTriangle** (drift: triangle-alert/ban/lock) | `BLOCKED` | pairs w/ `⚠ blocked by: {name}` caption |
| **done/status** (overload) | $success | check | `DONE` | timeline/mobile fold status here → recommend StatusBadge |
| **plain-date** (overload) | $muted-foreground-subtle | none | `15 Mar` | OPEN collapse |
| **aggregate-summary** (overload) | varies | dot | `ON TRACK` / `COMPLETE` / `N OPEN` / `N CLOSED · M CLOSING` | sidebar NavCard chips |

**Render modes:** `bordered` (showcase open) · `tinted` (filled, fill state/12 or $muted or $card-elevated, cornerRadius 100/999 — deps/timeline/mobile) · `bare` (no stroke/no radius inline — Category cards).

**Reconciliation:** Highest-drift, most-overloaded atom. Canonical = 5 clean Badge variants; the screens overload one slot with window-state **+ blocked status + DONE status + plain-date + aggregate-summary** across 3 render modes — contract widened to absorb all. **Icon** reconciled to §8 (Clock/XCircle/AlertTriangle/Lock, reject board glyphs). **Color** reconciled to §9/LOCKED #3 — closed/blocked are MUTED grey; the deps $destructive closed-pill is **rejected** (no panic-red). OPEN rendering is the unsettled §16 #4 decision; `showOpen` exposes all three observed renderings. Live-updates via use-now-tick 60s ticker.

**Screen usages:** Showcase (RcvKu): open·base (bordered, circle), closing (warning/12), closed, blocked (fill $muted), not-yet.; Category (D3JA0i): 8 bare inline pills — OPEN bare date, CLOSING·T-Nd timer/$warning, WINDOW CLOSED circle-x/$muted+date, BLOCKED triangle-alert/$muted, NOT YET lock/$muted-subtle+'starts 10 Jun'.; Dependencies (b1b079): 5 filled pills (CLOSING·9D/4D, WINDOW CLOSED lock/$destructive drift, BLOCKED lock drift, OPEN circle/$success) + sidebar aggregate chips.; Timeline (a3Dgz): 11 filled pills (DONE/BLOCKED ban/CLOSING·T-2D alarm-clock/STARTS DATE lock/NO CLIFF/WINDOW CLOSED).; Mobile (h9YSWg): 13 filled pills ($card-elevated) OPEN·T-Nd/CLOSING·T-Nd timer/DONE/BLOCKED ban/WINDOW CLOSED x.

**Reconciliation (screen ← library):** Highest-drift atom. Widened to 3 render modes (bordered/tinted/bare) + plain-date overload + blocked overload (muted, not red) + DONE/status overload (recommend StatusBadge) + aggregate-summary overload. Icon→§8 canonical; color→§9/LOCKED#3 (closed/blocked muted, $destructive closed-pill rejected). OPEN rendering = §16#4 open decision (showOpen).

---

## StatusBadge

**Kind:** atom  ·  **maps_to (camp-404):** ADAPT badge.tsx — add status variants (§14)  ·  **maps_to (shadcn):** shadcn/ui Badge with status CVA variant
  ·  **composes:** Badge

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `status` | 'not-started'|'in-progress'|'done' | ✓ |  | The stored task status (§10). NOT 'blocked' — blocked is derived and folds into the window/not-yet treatment. |
| `variant` | 'bordered'|'tinted' |  | bordered | not-started=bordered ($border, $muted-foreground); in-progress=tinted primary/12; done=tinted success/12. |

**Variants:** `not-started (bordered, circle-dot, 'NOT STARTED', $muted-foreground) — base`, `in-progress (fill #ff6b351f = primary/12, no stroke, 'IN PROGRESS', $primary)`, `done (fill #5ae07a1f = success/12, no stroke, 'DONE', $success)`

**States:** `not-started`, `in-progress`, `done`

**Tokens:** `$border`, `$muted-foreground`, `$primary`, `primary/12 (#ff6b351f)`, `$success`, `success/12 (#5ae07a1f)`, `--radius (0; cornerRadius 999 pill exception)`

**A11y:** Redundant channels: icon (circle-dot) + uppercase label + color.; Lucide icon aria-hidden; uppercase status word is the accessible text.; Reflects stored status only; 'blocked' is never a StatusBadge value (derived → window treatment).

### StatusBadge

**Maps to:** shadcn/ui Badge (status CVA) · camp-404 `badge.tsx` **ADAPT** (add not-started/in-progress/done per §14). Showcase SpecCap: "StatusBadge · shadcn/ui Badge (task progress)".

**Anatomy**
```
StatusBadge (frame, cornerRadius=999, stroke=$border [not-started] | none [tinted], strokeWidth=1|0, gap=5, padding=[4,10], align=center)
├─ icon (Lucide 12×12; circle-dot for not-started; fill=state-color)
└─ Label (text, UPPERCASE, JetBrains Mono 11/600, letterSpacing 0.5, fill=state-color)
```

**Variants (showcase RcvKu):** `not-started · base` (bordered, circle-dot, $muted-foreground, `NOT STARTED`) · `in-progress` (fill #ff6b351f = primary/12, no stroke, $primary, `IN PROGRESS`) · `done` (fill #5ae07a1f = success/12, no stroke, $success, `DONE`).

**Screen usage:** Showcase + the DisambiguationPicker (voice / AI Research) per-candidate. **Zero standalone instances on the three read-only views** — triage confirms StatusBadge instances=0 on Timeline ("status is folded into the StatusCycleButton box + the merged pill") and is folded into WindowStatePill on Dependencies/Mobile.

**Reconciliation (screens win, with caveat):** On the board, task status is encoded by (1) StatusCycleButton glyph/fill (✓/◼/empty) and (2) the merged WindowStatePill (DONE). StatusBadge therefore stays a registered library atom for NON-board contexts (DisambiguationPicker, voice-query read-outs) but is documented as **replaced** on the board. `blocked` is intentionally NOT a StatusBadge variant (stored statuses are only the 3; blocked is derived → window treatment).

**Screen usages:** Showcase (RcvKu) Spec — StatusBadge: not-started·base / in-progress / done.; DisambiguationPicker (AI Research / voice) per-candidate status read-out.; ZERO standalone instances on Category/Timeline/Dependencies — status folded into StatusCycleButton + merged WindowStatePill.

**Reconciliation (screen ← library):** Showcase = 3 clean variants. On the read-only board it has 0 standalone instances (replaced by StatusCycleButton + folded WindowStatePill); kept as a library atom for the DisambiguationPicker/voice surfaces. 'blocked' is not a variant.

---

## StatusCycleButton

**Kind:** atom  ·  **maps_to (camp-404):** NEW component (§14 + §10; scaffolding S1 CVA 18px square tri-state always-enabled; S4 wires to update_task_status)  ·  **maps_to (shadcn):** Custom (not a shadcn primitive); showcase 'custom (18px, 2px border — not a checkbox)'

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `status` | 'not-started'|'in-progress'|'done' | ✓ |  | Stored status; cycles not-started→in-progress→done→(wrap) on tap (§10). |
| `onCycle` | () => void | ✓ |  | Advances status to the next in the wrapping cycle. Wired to Server Action update_task_status (optimistic). |
| `disabled` | boolean |  | false | Per §10 the button is ALWAYS ENABLED — window-state/blocked are advisory, never gating. Should effectively never be true on the board. |
| `size` | number |  | 18 | Box size px (18 default). Must be wrapped in a ≥44px touch target. |

**Variants:** `not-started (empty square, stroke $border 2px; hover stroke $success)`, `in-progress (stroke $primary, fill #ff6b351f = primary/12, glyph ◼ in $primary)`, `done (stroke $success, fill $success, glyph ✓ in $background/near-black) + paired task name → $muted-foreground (brief §10 also calls for line-through, but NO board renders strikethrough — text-decoration absent across all done rows; left as a brief-intent build option, not screen-confirmed)`

**States:** `not-started`, `in-progress`, `done`, `hover (not-started→border $success)`, `focus-visible (2px $ring)`, `always-enabled (no disabled-on-blocked/closed — §10 guard rule)`

**Tokens:** `$border`, `$border-hover`, `$primary`, `primary/12 (#ff6b351f)`, `$success`, `$background (done glyph color)`, `$ring`, `--radius (0; the 18px square is SHARP — §5 exception, NOT rounded)`

**A11y:** Renders as a real <button> role=button; the ONLY direct board interaction (LOCKED #4).; aria-label announces current status + that activation cycles it (e.g. 'Task status: in progress, activate to mark done').; MUST have a ≥44px touch target (Touch44 wrapper) — every board OMITS it (drift); contract REQUIRES it.; Keyboard-activatable (Enter/Space); 2px $ring focus-visible ring.; Tri-state, NOT a checkbox (do not use role=checkbox).; Always enabled (§10) — blocked/closed advisory only; never dead.; done dims the paired task name to $muted-foreground; the brief §10 line-through is OPTIONAL (no board renders strikethrough — it is brief-intent, not a screen-confirmed channel). The status glyph + color carry meaning either way (LOCKED #6).

### StatusCycleButton — the ONE direct board interaction (§10, LOCKED #4)

**Maps to:** **NEW** component (§14 + §10; scaffolding S1: "Build the new StatusCycleButton CVA — 18px square tri-state, always-enabled"). Wired in S4 to Server Action `update_task_status` via useOptimistic/useTransition. Showcase SpecCap: "StatusCycleButton · custom (18px, 2px border — not a checkbox)".

**Anatomy**
```
[Touch44 (44×44 hit area — REQUIRED, omitted by every board)]
└─ StatusCycleButton (button/frame, 18×18, stroke=2px state-colored, strokeAlignment=inner, justify=center, align=center, SHARP — §5 exception, not rounded)
   └─ glyph:
      • not-started → empty (no glyph, stroke $border)
      • in-progress → text '◼' fill $primary 8–9px/700, fill #ff6b351f, stroke $primary
      • done        → text '✓' fill $background (near-black), fill $success, stroke $success
```

**Variants (showcase RcvKu + boards):** `not-started · base` (empty, stroke $border 2px; hover $success) · `in-progress` (stroke $primary, fill #ff6b351f, ◼ in $primary) · `done` (stroke $success, fill $success, ✓ in $background) — **+ paired task name → $muted-foreground** (brief §10/§9 also specify line-through, but **no board renders strikethrough** — done/closed names are muted only, text-decoration absent across all done rows; line-through is a brief-intent build option, not a screen-confirmed channel).

**States:** not-started · in-progress · done · hover (not-started→border $success) · focus-visible (2px $ring) · **always-enabled** (no disabled-on-blocked/closed — §10 guard rule; never make the single interaction dead).

**Screen usage:** Category (11), Dependencies (8), Timeline (10), Mobile (13) — the 18×18 status box per card.

**Reconciliation (widen AND correct toward the screens):** (1) Adopt glyph/fill encoding (✓/◼/empty) as canonical. (2) **REJECT** the Dependencies + Mobile drift that SUBSTITUTES a triangle-alert/lock/x icon for the box on blocked/not-yet/closed rows — §10 mandates the button ALWAYS remains (status independent; blocked/closed are advisory via pill/card). (3) **REQUIRE** a ≥44px Touch44 wrapper — every board omits it (a11y, LOCKED #4). (4) Mobile is **missing** the in-progress variant — require all 3. (5) done glyph: near-black ✓ on $success (Lucide check or '✓' text both acceptable).

**Screen usages:** Showcase (RcvKu): not-started·base (◼ disabled), in-progress (#ff6b351f + $primary), done ($success + check).; Category (D3JA0i): 11 — done ($success + ✓/$background), in-progress (#ff6b351f + ◼/$primary 9px), not-started (empty stroke $border 2px).; Dependencies (b1b079): 8 — done/in-progress/not-started; DRIFT: blocked/not-yet rows substitute triangle-alert/lock (REJECT).; Timeline (a3Dgz): 10 — done/in-progress/not-started.; Mobile (h9YSWg): 13 — not-started/done; DRIFT lock/x substituted; in-progress MISSING.

**Reconciliation (screen ← library):** NEW atom; showcase gives 3 clean states. Adopt glyph/fill encoding. REJECT icon substitution on blocked/not-yet/closed (button always present, §10). REQUIRE ≥44px Touch44 wrapper (all boards omit). Require all 3 variants (mobile missing in-progress). done ✓ near-black on $success.

---

## StatusDot

**Kind:** atom  ·  **maps_to (camp-404):** Custom token-driven ellipse (no direct camp file); 'StatusDot / CategoryDot'  ·  **maps_to (shadcn):** Custom (rounded-full span); not a shadcn primitive

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `tone` | 'accent'|cat-*|'success'|'warning'|'muted' |  | accent | Fill color. accent=$primary; cat-*=category hue; success=$success (live/sync/done); warning=$warning; muted=$muted-foreground (inactive). |
| `size` | 6 | 7 | 8 |  | 8 | 6px (sync/live + task meta) · 7px (Dependencies inline CategoryTag leading dot, e.g. b1b079 `BXAnH`) · 8px (category group-header dots). |

**Variants:** `accent ($primary) — base`, `medical / bureaucratic / travel / gear / tech ($cat-* hues)`, `success ($success — live/sync/done)`, `warning ($warning)`, `muted ($muted-foreground)`, `sizes: 6px / 7px / 8px`

**States:** `static indicator (no interactive states)`, `optional pulse (live/recording — handled by parent, not the dot)`

**Tokens:** `$primary`, `$cat-medical`, `$cat-bureaucratic`, `$cat-travel`, `$cat-gear`, `$cat-tech`, `$success`, `$warning`, `$muted-foreground`, `--radius (0; rounded-full exception per §5)`

**A11y:** Decorative — always accompanied by a label (group dot beside cat label; sync dot beside 'SYNCED'/'SOLO OPERATOR'). Color never the sole carrier (LOCKED #6).; aria-hidden=true (adjacent label is the accessible text).

### StatusDot / CategoryDot

**Maps to:** Custom small indicator (token-driven ellipse; no direct camp file). Showcase SpecCap: "StatusDot / CategoryDot · custom (rounded indicator)". Serves both the 8px category dot and the 6px live/sync dot.

**Anatomy**
```
StatusDot (ellipse, width=8 [group headers] | 6 [sync + meta], height=match, fill=token, rounded-full [§5 exception])
```

**Variants (showcase RcvKu):** `accent · base` ($primary 8×8) · medical/bureaucratic/travel/gear/tech ($cat-* 8×8) · `done` ($success) · `warning` ($warning). Plus `muted` ($muted-foreground, inactive).

**Sizes:** 8px (category group-header dots) · 7px (Dependencies inline CategoryTag leading dot — b1b079 `Cat Tag` ellipses `BXAnH`/`l5Vab`/`VINL4`/`EwvdT` etc., $cat-* hues) · 6px (SyncStatus live dot + in-card task meta dots).

**Screen usage:** Category (5 — group-header cat dots), Dependencies (4 — sidebar window-chip dots warning/muted/success/cat-bureaucratic), Mobile (5 @8px headers + 6px meta), SyncStatus live indicator (6px $success).

**Reconciliation:** Canonical = 8×8 $primary ellipse; showcase confirms the tone matrix. Screens add a **6px** size for SyncStatus + in-card meta dots and a **7px** size for the Dependencies inline CategoryTag leading dot (b1b079 `Cat Tag` ellipses at width 7) → `size ∈ {6,7,8}`. One component serves both StatusDot (status/live) and CategoryDot (category) roles. Purely presentational — no interactive states; always paired with a label (LOCKED #6).

**Screen usages:** Showcase (RcvKu): accent·base + 5 cat hues + done + warning (8×8).; Category (D3JA0i): 5 — 8×8 cat dot per CategoryGroupHeader.; Dependencies (b1b079): 4 — sidebar window-chip dots (warning/muted/success/cat-bureaucratic).; Mobile (h9YSWg): 5 @8px group headers + 6px task meta.; SyncStatus live indicator: 6px $success (deps + mobile headers).

**Reconciliation (screen ← library):** Canonical 8×8 $primary; showcase confirms tone matrix. Screens add 6px (sync/meta) and 7px (Dependencies inline CategoryTag dot, b1b079 width 7) → size ∈ {6,7,8}. One component for StatusDot + CategoryDot. No interactive states.

---

## Divider

**Kind:** atom  ·  **maps_to (camp-404):** LIFT divider.tsx verbatim (§14); token-driven  ·  **maps_to (shadcn):** shadcn/ui "new-york" Separator (hairline)

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `orientation` | 'horizontal'|'vertical' |  | horizontal | horizontal = full-width 1px rule; vertical = 1px-wide full-height rule. |
| `tone` | 'border'|'border-hover' |  | border | $border (hairline default) or $border-hover (stronger). |

**Variants:** `horizontal hairline (fill $border, height 1, width fill_container) — base`, `vertical hairline (width 1, height fill_container)`, `instance (re-used inline, fill_container width)`

**States:** `static (no interactive states)`

**Tokens:** `$border`, `$border-hover`, `--radius (0)`

**A11y:** role=separator (Radix Separator default); decorative dividers use aria-hidden / role=none.; Carries no text; purely a visual rule.

### Divider

**Maps to:** shadcn/ui "new-york" `Separator` · camp-404 `divider.tsx` **LIFT verbatim** (§14 lift list; token-driven, re-skins). Showcase SpecCap: "Divider · shadcn/ui Separator (hairline)".

**Anatomy**
```
Divider (rectangle, fill=$border, width=fill_container, height=1)   // horizontal
Divider (rectangle, fill=$border, width=1, height=fill_container)   // vertical
```

**Variants:** horizontal hairline (fill $border, height 1, width fill_container — base) · vertical hairline · instance (re-used inline). `tone` $border (default) | $border-hover.

**Screen usage:** Showcase (hairline·base + instance), Timeline bucket 'Rule' under each TimelineWeekHeader, settings/legal section dividers (NMzE5), list/section separators.

**Reconciliation:** Matches showcase exactly (1px $border, fill_container); lifted verbatim. Screens use the same hairline both as a standalone rule AND as element bottom-borders (`strokeWidth {bottom:1}`); the standalone component covers the former, while the latter is a border prop on the parent (not a Divider instance) — noted so build doesn't over-instance. Added a vertical orientation though screens are primarily horizontal.

**Screen usages:** Showcase (RcvKu) Spec — Divider: hairline·base + instance.; Timeline (a3Dgz): per-bucket 'Rule' under each TimelineWeekHeader.; Settings/Legal/Manual (NMzE5): section dividers.; Category/Dependencies: list/section separators (some as element bottom-borders).

**Reconciliation (screen ← library):** Matches showcase exactly; lifted verbatim. Standalone rule = Divider; element bottom-borders (strokeWidth {bottom:1}) are parent border props, not Divider instances. Added vertical orientation.

---

## Eyebrow

**Kind:** typography  ·  **maps_to (camp-404):** Custom mono label role → camp SectionHeader/label pattern; §6 --text-eyebrow  ·  **maps_to (shadcn):** Custom (styled text; may compose with SectionHeader); not a shadcn primitive

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `children` | string | ✓ |  | Label text; rendered UPPERCASE (mono caps). |
| `tone` | 'muted'|'foreground'|'accent'|'subtle' |  | muted | muted=$muted-foreground (default); foreground=$foreground (emphasized); accent=$primary (quick-actions/active); subtle=$muted-foreground-subtle (stat labels per §6). |
| `weight` | 600 | 700 |  | 600 | 600 base; 700 for heavier section eyebrows (library 'Label/Eyebrow'). |
| `tracking` | number |  | 1.5 | letterSpacing px; 1.5 base, 2 heavy (brief: 0.125em). |

**Variants:** `muted · base ($muted-foreground, 11/600 +1.5)`, `foreground ($foreground)`, `accent ($primary)`, `subtle ($muted-foreground-subtle — stat labels, dep hints, 'not yet' reasons)`, `heavy (700 weight, +2 tracking)`

**States:** `static text (no interactive states)`

**Tokens:** `$muted-foreground`, `$foreground`, `$primary`, `$muted-foreground-subtle`, `--text-eyebrow (≈0.6875rem / 11px, letter-spacing 0.125em)`

**A11y:** Use a semantic heading/label element where it titles a section (group headers), not a bare span.; Authored uppercase via CSS text-transform OR literal caps; ensure the accessible name reads naturally (avoid letter-by-letter spell-out).; Always JetBrains Mono per LOCKED #5 (chrome/labels are mono).

### Eyebrow

**Maps to:** Custom typographic role (mono uppercase tracked label) → camp-404 SectionHeader/label pattern; §6 role: "section/task-group/sidebar labels → --text-eyebrow (mono, uppercase, 0.125em)". Showcase SpecCap: "Eyebrow · custom (mono uppercase tracked label)".

**Anatomy**
```
Eyebrow (text, UPPERCASE LABEL, fontFamily=JetBrains Mono, fontSize=11 [--text-eyebrow ≈0.6875rem], fontWeight=600 [700 heavy], letterSpacing=1.5 [2 heavy; brief 0.125em], fill=$muted-foreground)
```

**Variants (showcase RcvKu):** `muted · base` ('SECTION LABEL', $muted-foreground, 11/600 +1.5) · `foreground` ('ACTIVE WINDOWS', $foreground) · `accent` ('QUICK ACTIONS', $primary) · `subtle` ($muted-foreground-subtle — stat labels, dep hints, 'not yet' reasons per §6) · `heavy` (700, +2 — library 'Label/Eyebrow' cell 'SECTION EYEBROW').

**Screen usage:** Category 'MISSIONS' sidebar header; Dependencies (5 — MISSIONS, DEPENDENCY TREE, CRITICAL PATH legend, UNLINKED, stat labels); Timeline section labels; Mobile (7 — SYNCED, TARGET, group labels, stat labels). CategoryGroupHeader labels + StatTile labels are Eyebrow-role text.

**Reconciliation:** Canonical (mono, $muted-foreground, 11/600 +1.5) matches showcase base. Screens prove additional tones ($foreground, $primary, $muted-foreground-subtle per §6) + a heavier 700/+2 variant → contract registers `tone` + `weight` + `tracking`. Brief §6 specifies 0.125em (extraction shows 1.5–2px literal, consistent at 11px). The shared label atom inside CategoryGroupHeader / StatTile labels / Sidebar 'MISSIONS' / Dependencies headers.

**Screen usages:** Showcase (RcvKu): base / foreground / accent + 'Label/Eyebrow' 700/+2 cell.; Category: 'MISSIONS' sidebar header.; Dependencies (b1b079): 5 — MISSIONS, DEPENDENCY TREE, CRITICAL PATH, UNLINKED, stat labels.; Timeline: sidebar 'MISSIONS' + section labels.; Mobile (h9YSWg): 7 — SYNCED, TARGET, group labels, stat labels.; CategoryGroupHeader labels + StatTile labels are Eyebrow-role text.

**Reconciliation (screen ← library):** Canonical matches showcase base. Screens add tones ($foreground/$primary/$muted-foreground-subtle) + heavy 700/+2 → tone+weight+tracking props. §6 = 0.125em (≈1.5–2px at 11px). Shared label atom across group/stat/sidebar headers.

---
