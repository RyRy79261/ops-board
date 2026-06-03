# Components — Form Atoms

*7 contracts. Screens authoritative; library reconciled toward screen usage.*

## Cmp · TextInput

**Kind:** molecule  ·  **maps_to (camp-404):** packages/ui/src/components/input.tsx (Input) + input-field.tsx (InputField — the Label+Input+helper/error labelled wrapper). LIFT both verbatim; re-skins automatically once OKLCH tokens + --radius:0 land. Add a `size` variant (default 40 / lg 42) and optional leading/trailing icon slots to serve the auth screens.  ·  **maps_to (shadcn):** shadcn/ui Input (new-york). Labelled form = Form/FormField + Label pattern; camp's InputField is the pre-composed equivalent.
  ·  **composes:** Label (Cmp · Label / shadcn Label), Used by: TypeToConfirmField, SettingsRow, AccountProfileSummary, ReportComposer

**Anatomy:** frame [vertical, width fill_container, gap 7]
├─ text "Label" (id FRQsp) — optional; JetBrains Mono 11 / weight normal, $muted-foreground, letterSpacing 1.5, UPPERCASE (e.g. "ASSIGNEE", "EMAIL ADDRESS")
└─ frame "Field" (id yTlNC) [width fill_container, h 40 (showcase) / 42 (Sign-In screens), fill $muted, stroke $input 1px inner, padding [0,12], gap 8, alignItems center; justifyContent space_between WHEN a trailing affordance is present]
   ├─ icon "Lead" — optional leading lucide icon, 16×16, $muted-foreground-subtle (rare; shared shape with SearchField)
   ├─ text "Value" (id uysfT) — placeholder OR typed value; JetBrains Mono 14 / normal. Placeholder fill $muted-foreground-subtle; typed value fill $foreground (on screens the typed value is JetBrains Mono 14, NOT DM Sans — only the showcase ERROR cell switched it to DM Sans, treat as a showcase typo)
   ├─ frame "Cursor" — optional 2×18 fill $primary blink caret, present in the FOCUSED+typing screen state (Sign-In EMAIL Group)
   └─ icon "Trail" — optional trailing lucide icon 16×16 $muted-foreground (e.g. `eye` password reveal); forces Field justifyContent space_between

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `label` | ReactNode |  |  | Optional eyebrow label rendered above the field. Omit when a parent Row supplies it. |
| `value` | string |  |  | Controlled value; renders in $foreground JetBrains Mono 14. |
| `placeholder` | string |  |  | Placeholder text in $muted-foreground-subtle (e.g. "Search teammate…"). |
| `size` | "default" | "lg" |  | "default" | default = 40px field (showcase); lg = 42px field used on auth/account screens. |
| `error` | string |  |  | Error message; switches stroke to $destructive and renders helper in $destructive with role=alert. |
| `helper` | string |  |  | Helper text below field in $muted-foreground 12px (camp InputField). |
| `leadingIcon` | LucideIcon |  |  | Optional leading 16×16 icon, $muted-foreground-subtle. |
| `trailingIcon` | LucideIcon |  |  | Optional trailing 16×16 icon (e.g. eye), $muted-foreground; forces space_between. |
| `onTrailingClick` | () => void |  |  | Handler for the trailing affordance (e.g. toggle password visibility). |
| `disabled` | boolean |  | false | Dims field to opacity 0.45, non-interactive. |
| `required` | boolean |  | false | Appends a $primary asterisk to the label and sets HTML required. |
| `id` | string |  |  | Field id; auto-generated via useId so the label always associates. |

**Variants:** `base/default`, `focused·ring`, `filled`, `error·destructive`, `disabled`, `size: default (40px)`, `size: lg (42px, auth/account)`, `with trailing icon (password eye)`, `with blinking caret (focused typing)`, `TypeToConfirmField overload (focused·primary + confirm-match gate)`

**States:** `default/empty`, `hover`, `focused (ring + caret)`, `filled`, `error`, `disabled`, `read-only (account email display)`

**Tokens:** `$muted`, `$input`, `$background`, `$primary`, `$border`, `$destructive`, `$foreground`, `$muted-foreground`, `$muted-foreground-subtle`

**A11y:** Label associated via htmlFor/id (auto useId when none given); aria-invalid=true on error; aria-describedby points at the error OR helper element that is actually rendered; Error message has role="alert"; focus-visible:ring-2 ring-ring ring-offset-2 (visible keyboard focus); disabled:cursor-not-allowed; required mirrors HTML required attribute; Password-reveal trailing icon is a real button with aria-label and aria-pressed

### Cmp · TextInput

Labelled single-line text entry. A vertical `[Label?] + Field` stack. The Field is a 1px-bordered box on `$muted` with a JetBrains Mono value; the corner radius is 0 globally (`--radius:0`). Wraps shadcn `Input`; the labelled form is camp-404's `InputField`.

**Geometry (reconciled — screens win):** Field height is **42px on real screens** (Sign-In, Type-to-Confirm, Account email rows) and **40px in the showcase library cell**. Build the field height as a prop defaulting to 40 with a `lg`=42 used by the auth/account screens. Padding `[0,12]`, internal `gap 8`, `alignItems center`. When any trailing element is present the Field switches to `justifyContent: space_between`.

**Value typography:** placeholder = JetBrains Mono 14 / `$muted-foreground-subtle`; typed value = JetBrains Mono 14 / `$foreground`. (The showcase ERROR cell rendered the value in DM Sans — informational drift only; on every product screen the value stays JetBrains Mono.)

**Label:** optional. JetBrains Mono 11 / normal, `$muted-foreground`, letterSpacing 1.5, UPPERCASE. Omitted when the field sits inside a labelled Row that already carries the label (Sign-In groups carry their own "EMAIL ADDRESS" eyebrow above).

**Optional affordances (union across screens):**
- **Blinking caret** — a 2×18 `$primary` `Cursor` rectangle inside the Field in the focused/typing state.
- **Trailing icon** — e.g. `eye` (password reveal) 16×16 `$muted-foreground`, pushed right via `space_between`.
- **Leading icon** — supported (shared shape with SearchField) but unused outside SearchField.

**State → style map (exact):**
| State | Field fill | Field stroke | Value fill | Notes |
|---|---|---|---|---|
| default / empty | `$muted` | `$input` | placeholder `$muted-foreground-subtle` | base showcase cell |
| focused · ring | `$background` | `$primary` | `$foreground` + `Cursor` caret | shadcn `focus-visible:ring-2 ring-ring` |
| filled | `$background` | `$border` | `$foreground` | settled value, not focused |
| error · destructive | `$background` | `$destructive` | `$foreground` | pair with helper text in `$destructive` (`role="alert"`) |
| disabled | (base) `opacity 0.45` | — | value e.g. "Unavailable" | non-interactive |

**Composition note:** `TypeToConfirmField` (Delete-Account / Delete-History flows) is a TextInput in the focused/`$primary`-stroke variant wrapped by an eyebrow label "TYPE DELETE TO CONFIRM" — it is the same Field primitive, gated to enable the destructive Button only when the typed value matches the confirm word. Spec the match-validation as a consumer concern (`error` when non-matching), not a new field shape.

**Screen usages:** NMzE5 Account · Sign-In (desktop + 2 mobile): EMAIL/PASSWORD/PASSKEY Field inputs — focused($primary)/filled($border)/error($destructive) + password `eye` trailing + $primary blink Cursor; NMzE5 Account · Delete Account & Delete History: TypeToConfirmField (focused·$primary Field under a TYPE-DELETE-TO-CONFIRM eyebrow); RcvKu component library: Input spec matrix — BASE / FOCUSED·RING / ERROR·DESTRUCTIVE / DISABLED cells

**Reconciliation (screen ← library):** Canonical def fixed Field height at 40 and value as placeholder-only. Widened to: (1) field height prop — screens render 42px on every auth/account input, so `lg`=42 added; (2) explicit filled state (fill $background, stroke $border) seen on Sign-In; (3) blinking $primary Cursor child for focused-typing; (4) optional trailing icon (`eye`) + leading icon, with the Field flipping to space_between when present; (5) typed value stays JetBrains Mono $foreground (the showcase ERROR cell's DM Sans is treated as a showcase artifact, not adopted); (6) TypeToConfirmField is folded in as a TextInput overload (focused·$primary + match-gate) rather than a separate primitive, matching the board which reuses the same `Field` node.

---

## Cmp · Textarea

**Kind:** molecule  ·  **maps_to (camp-404):** packages/ui/src/components/textarea.tsx (Textarea). LIFT verbatim; bump min-h-[80px] → min-h-[96px] to match the screen. Reuse the InputField labelled-wrapper pattern (label/helper/error/aria) for the labelled form.  ·  **maps_to (shadcn):** shadcn/ui Textarea (new-york). Labelled = Form/FormField + Label, or the camp InputField-style wrapper adapted for textarea.
  ·  **composes:** Label (Cmp · Label / shadcn Label), Used by: ReportComposer, ShakeReportSheet

**Anatomy:** frame [vertical, width fill_container, gap 7]
├─ text "Label" (id HRF5b) — optional; JetBrains Mono 11 / normal, $muted-foreground, letterSpacing 1.5, UPPERCASE (e.g. "NOTE")
└─ frame "Area" (id h3v6q) [width fill_container, h 96, fill $muted, stroke $input 1px inner, layout vertical, padding [10,12]]
   └─ text "Value" (id jsHam) — placeholder OR typed text; JetBrains Mono 14 / normal, lineHeight 1.5, width fill_container, textGrowth fixed-width. Placeholder fill $muted-foreground-subtle; filled fill $foreground (showcase filled cell switches to DM Sans — informational only)

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `label` | ReactNode |  |  | Optional eyebrow label above the area. |
| `value` | string |  |  | Controlled multi-line value; renders $foreground JetBrains Mono 14, lineHeight 1.5. |
| `placeholder` | string |  |  | Placeholder in $muted-foreground-subtle. |
| `rows` | number |  |  | Optional row count; default height is 96px (min-h). |
| `error` | string |  |  | Error message; stroke → $destructive, helper rendered $destructive role=alert. |
| `helper` | string |  |  | Helper text below area, $muted-foreground 12px. |
| `disabled` | boolean |  | false | Dims to opacity ~0.45, non-interactive. |
| `required` | boolean |  | false | $primary asterisk on label + HTML required. |
| `id` | string |  |  | Auto-generated via useId for label association. |

**Variants:** `base/default`, `focused·ring`, `filled`, `error·destructive`, `disabled`

**States:** `default/empty`, `hover`, `focused (ring)`, `filled (multi-line)`, `error`, `disabled`

**Tokens:** `$muted`, `$input`, `$background`, `$primary`, `$border`, `$destructive`, `$foreground`, `$muted-foreground`, `$muted-foreground-subtle`

**A11y:** Label associated via htmlFor/id (auto useId); aria-invalid + aria-describedby on error/helper (same wiring as InputField); Error has role="alert"; focus-visible:ring-2 ring-ring ring-offset-2; disabled:cursor-not-allowed; required mirrors HTML required

### Cmp · Textarea

Labelled multi-line text entry. Identical pattern to TextInput but with a taller fixed-height `Area` (96px) and a `vertical` layout so the value flows from the top-left. Corner radius 0. Wraps shadcn `Textarea`.

**Geometry:** Area height **96px** (min-height in build; allow vertical growth), fill `$muted`, stroke `$input` 1px inner, padding `[10,12]`. Value text is JetBrains Mono 14 / lineHeight 1.5, `width: fill_container`, anchored top-left.

**Label:** optional, JetBrains Mono 11 / normal `$muted-foreground` letterSpacing 1.5 UPPERCASE.

**State → style map (exact):**
| State | Area fill | Area stroke | Value | Notes |
|---|---|---|---|---|
| default / empty | `$muted` | `$input` | placeholder `$muted-foreground-subtle` | e.g. "Add context for the dispatcher…" |
| focused · ring | `$background` | `$primary` | — | shadcn `focus-visible:ring-2 ring-ring` |
| filled | `$background` | `$border` | `$foreground` (multi-line) | e.g. "Pickup blocked at dock 3 — reroute to dock 7…" |
| error · destructive | `$background` | `$destructive` | `$foreground` | pair with helper in `$destructive` |
| disabled | base `opacity ~0.45` | — | — | inherits TextInput disabled treatment |

**Build note:** map to `min-h-[96px]` (camp ships `min-h-[80px]`; bump to 96 to match the screen). Auto-grow optional; the design fixes height at 96.

**Screen usages:** RcvKu component library: Textarea spec matrix — BASE / FOCUSED·RING / FILLED cells (placeholder "Add context for the dispatcher…", filled "Pickup blocked at dock 3 — reroute…"); NMzE5 Shake-to-Report / ReportComposer: multi-line message capture (composer body) — the only product surface for free-text notes (read-only board has no task-edit textarea)

**Reconciliation (screen ← library):** Canonical fixed height 96 and placeholder-only. Widened to: explicit FILLED state (fill $background, stroke $border, $foreground multi-line value) and a destructive error state by analogy to TextInput (the showcase only shows base/focused/filled but the error treatment is required for the ReportComposer). The showcase filled cell renders the value in DM Sans — kept informational; the canonical value font (JetBrains Mono) is authoritative for the contract since every other field uses it.

---

## Cmp · Select

**Kind:** molecule  ·  **maps_to (camp-404):** packages/ui/src/components/select.tsx (Radix Select: Trigger/Value/Content/Item/Group/ScrollButtons). LIFT verbatim; re-skins via tokens + --radius:0. Wrap with the InputField label pattern for the labelled form.  ·  **maps_to (shadcn):** shadcn/ui Select (new-york) built on @radix-ui/react-select; trigger = SelectTrigger, value = SelectValue, list = SelectContent + SelectItem.
  ·  **composes:** Label (Cmp · Label / shadcn Label), Popover/SelectContent primitives (Radix), Used by: Settings preference rows

**Anatomy:** frame [vertical, width fill_container, gap 7]
├─ text "Label" (id LfFba) — optional; JetBrains Mono 11 / normal, $muted-foreground, letterSpacing 1.5, UPPERCASE (e.g. "PRIORITY")
└─ frame "Trigger" (id w0mss0) [width fill_container, h 40, fill $muted, stroke $input 1px inner, padding [0,12], justifyContent space_between, alignItems center]
   ├─ text "Value" (id x7bA7R) — placeholder OR selected value; JetBrains Mono 14 / normal. Placeholder fill $muted-foreground-subtle; selected fill $foreground
   └─ icon "Chevron" (id aR80e) — lucide `chevron-down`, 16×16, $muted-foreground

[OPEN] Popover/Content (Radix SelectContent, not drawn as a discrete node on screen — implied by "OPEN · POPOVER" cell): surface $popover, 1px $border, item rows JetBrains Mono 14, selected item shows lucide `check`; matches camp SelectContent/SelectItem.

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `label` | ReactNode |  |  | Optional eyebrow label above the trigger. |
| `value` | string |  |  | Controlled selected value (renders $foreground). |
| `defaultValue` | string |  |  | Uncontrolled initial value. |
| `onValueChange` | (value: string) => void |  |  | Radix change handler. |
| `placeholder` | string |  |  | Trigger placeholder when no value (e.g. "Select priority…"), $muted-foreground-subtle. |
| `items` | Array<{ value: string; label: ReactNode }> | ✓ |  | Options rendered as SelectItem rows in the popover. |
| `disabled` | boolean |  | false | Dims trigger, non-interactive. |
| `error` | string |  |  | Stroke → $destructive + helper in $destructive (parity with TextInput). |
| `id` | string |  |  | Auto-generated via useId for label association. |

**Variants:** `base/placeholder`, `open·popover`, `filled (value selected)`, `error·destructive`, `disabled`

**States:** `closed/placeholder`, `hover`, `focused`, `open (popover visible)`, `item-selected`, `filled (closed with value)`, `disabled`

**Tokens:** `$muted`, `$input`, `$background`, `$primary`, `$popover`, `$border`, `$foreground`, `$muted-foreground`, `$muted-foreground-subtle`, `$destructive`

**A11y:** Radix Select handles roving focus, type-ahead, Esc-to-close, arrow navigation; Trigger is a real button with aria-expanded / aria-controls; Label associated via htmlFor/id; Selected item marked aria-selected; check icon is the visual confirmation; focus:ring-2 ring-ring ring-offset-2 on trigger

### Cmp · Select

Labelled single-choice dropdown. Trigger mirrors TextInput's Field but always carries a trailing `chevron-down` and uses `space_between`. Built on Radix `Select` (camp's `select.tsx`).

**Trigger geometry:** h 40, fill `$muted`, stroke `$input` 1px inner, padding `[0,12]`, `justifyContent space_between`, `alignItems center`. Value JetBrains Mono 14; chevron lucide `chevron-down` 16×16 `$muted-foreground`.

**State → style map (exact):**
| State | Trigger fill | Trigger stroke | Value | Chevron |
|---|---|---|---|---|
| base / placeholder | `$muted` | `$input` | placeholder `$muted-foreground-subtle` ("Select priority…") | `$muted-foreground` |
| open · popover | `$background` | `$primary` | selected `$foreground` ("High") | `$muted-foreground` (rotates per Radix) |
| filled (closed, has value) | `$muted` | `$input` | selected `$foreground` | `$muted-foreground` |
| disabled | base `opacity ~0.45` | — | — | — |

**Popover content (Radix SelectContent):** `$popover` surface, 1px `$border`, sharp corners; each `SelectItem` is JetBrains Mono 14, selected item shows a leading/trailing `check`. The board doesn't draw the open list as nodes — the "OPEN · POPOVER" showcase cell only restyles the trigger — so the list styling is inherited from camp's Select primitives.

**Note:** the board's intent/scope dropdown-like UI (AI Research INTENT row) is a bespoke badge, NOT this Select — do not conflate.

**Screen usages:** RcvKu component library: Select spec matrix — BASE ("Select priority…") / OPEN·POPOVER ("High", trigger $background/$primary); NMzE5 Settings: any single-choice preference (theme/range) renders through this trigger pattern; component-usage-map lists Select for the Account·Settings board

**Reconciliation (screen ← library):** Canonical only renders the trigger (label + value + chevron). Widened to: (1) explicit filled-closed state (value $foreground, trigger stays $muted/$input); (2) Radix popover content styling inherited from camp's SelectContent/SelectItem (the screens never draw the open list, so the canonical trigger-only def is extended by composition rather than redrawn); (3) error/destructive state added for parity. The chevron stays $muted-foreground; OPEN cell only swaps trigger fill/stroke to $background/$primary (focus ring), matching TextInput's focused treatment.

---

## Cmp · SearchField

**Kind:** molecule  ·  **maps_to (camp-404):** packages/ui/src/components/input.tsx (Input) composed with a leading lucide `search` icon — there is no dedicated camp SearchField, so build as a small wrapper around Input (REF the input + icon-affordance pattern). Labelled form reuses InputField.  ·  **maps_to (shadcn):** shadcn/ui Input + leading Search icon (new-york). (Not Command/Combobox — those are explicitly excluded from MVP per design-brief §14 "Do not bring over".)
  ·  **composes:** Cmp · TextInput (shares the Input + Field primitive), Label (Variant A), Used by: Manual (Search), board filter bars

**Anatomy:** CANONICAL (showcase): frame [vertical, width fill_container, gap 7]
├─ text "Label" (id DkKOb) — JetBrains Mono 11 / normal, $muted-foreground, letterSpacing 1.5, UPPERCASE ("FILTER")
└─ frame "Field" (id qNmRA) [width fill_container, h 40, fill $muted, stroke $input 1px inner, padding [0,12], gap 8, alignItems center]
   ├─ icon "Icon" (id csIht) — lucide `search`, 16×16, $muted-foreground-subtle
   └─ text "Value" (id JGuLZ) — placeholder/value; JetBrains Mono 14 / normal. Placeholder $muted-foreground-subtle; typed $foreground

SCREEN OVERLOAD (NMzE5 Manual "Search"): frame [width 240 (NOT fill), fill $background (NOT $muted), stroke $border 1px, padding [8,12], gap 8, alignItems center; NO Label]
   ├─ icon "I" — lucide `search`, 14×14 (NOT 16), $muted-foreground-subtle
   └─ text "P" — placeholder "Search the manual…", DM Sans 13 (NOT JetBrains Mono 14), $muted-foreground-subtle

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `label` | ReactNode |  |  | Optional eyebrow label (Variant A only; Variant B omits it). |
| `value` | string |  |  | Controlled query string. |
| `placeholder` | string |  | "Filter tasks…" | Placeholder text. |
| `variant` | "labelled" | "compact" |  | "labelled" | labelled = h40 $muted/$input JetBrains Mono 14, 16px icon; compact = width 240 $background/$border DM Sans 13, 14px icon (Manual). |
| `onValueChange` | (query: string) => void |  |  | Fires on each keystroke to filter the visible surface. |
| `onClear` | () => void |  |  | Clears the query; surfaces a trailing `x` button when value is non-empty. |
| `width` | number | "fill" |  |  | fill (Variant A) or fixed 240 (Variant B). |
| `disabled` | boolean |  | false | Dims, non-interactive. |

**Variants:** `labelled (A)`, `compact (B, Manual)`, `focused·ring`, `with-clear (trailing x)`, `disabled`

**States:** `base/empty`, `hover`, `focused (ring)`, `typing/filled`, `with-clear`, `no-results (consumer shows EmptyState/ErrorStateCard, not a field state)`, `disabled`

**Tokens:** `$muted`, `$input`, `$background`, `$border`, `$primary`, `$foreground`, `$muted-foreground`, `$muted-foreground-subtle`

**A11y:** role="searchbox" (or type=search) with aria-label when no visible label; Leading search icon aria-hidden (decorative); Clear button is a real button with aria-label="Clear search"; focus-visible:ring-2 ring-ring ring-offset-2; Debounced filtering announced via aria-live on the results region (consumer)

### Cmp · SearchField

A TextInput specialised with a leading `search` icon, for filtering/search. Two real renderings exist and the contract must cover both.

**Variant A — Labelled filter (showcase / board filter bars):** the canonical shape. Vertical `Label + Field`; Field h 40, fill `$muted`, stroke `$input`, leading `search` 16×16 `$muted-foreground-subtle`, value JetBrains Mono 14.

**Variant B — Inline compact search (Manual top bar, NMzE5):** **no label**, fixed `width 240`, fill `$background`, stroke `$border`, padding `[8,12]`, leading `search` **14×14**, placeholder **DM Sans 13** ("Search the manual…"). This is the divergent screen rendering — the contract is widened with a `compact` variant and an explicit `font`/`iconSize`/`surface` set so Variant B is reproducible.

**State → style map (exact):**
| State | Variant | Field fill | Field stroke | Icon | Value |
|---|---|---|---|---|---|
| base | A (labelled) | `$muted` | `$input` | search 16, `$muted-foreground-subtle` | placeholder `$muted-foreground-subtle` ("Filter tasks…") |
| focused · ring | A | `$background` | `$primary` | search 16 | typed `$foreground` ("tankwa") |
| base | B (compact) | `$background` | `$border` | search 14, `$muted-foreground-subtle` | placeholder DM Sans 13 ("Search the manual…") |
| focused · ring | B | `$background` | `$primary` | search 14 | typed `$foreground` |
| with-clear | A/B | — | — | + trailing `x` 14/16 `$muted-foreground` when value present | clears on click |
| disabled | A/B | base opacity ~0.45 | — | — | — |

Search is read-only-board-safe: it filters the visible board, never mutates data.

**Screen usages:** NMzE5 Manual — Desktop & Mobile: the compact "Search" bar (width 240, $background, DM Sans 13, search 14px, "Search the manual…"); RcvKu component library: SearchField spec matrix — BASE ("Filter tasks…") / FOCUSED·RING ("tankwa", $background/$primary); vsP7L usage map: SearchField listed for the Manual surface of the Account·Settings·Legal·Manual board

**Reconciliation (screen ← library):** The canonical SearchField (labelled, $muted, 16px icon, JetBrains Mono 14) does NOT match the real Manual search bar (no label, fixed 240, $background/$border, 14px icon, DM Sans 13). Since screens are authoritative, the contract gains a `compact` variant capturing the Manual rendering exactly (surface/stroke/icon-size/font/width all differ) while keeping `labelled` for filter bars. A `with-clear` state was added for the trailing `x` that any populated search needs. Command/Combobox is explicitly NOT used.

---

## Cmp · Checkbox

**Kind:** atom  ·  **maps_to (camp-404):** packages/ui/src/components/checkbox.tsx (Radix Checkbox). LIFT; bump box h-4 w-4 → h-[18px] w-[18px] and border to 2px, swap rounded-sm → rounded-none (--radius:0). Check icon 13px. Compose label via the row wrapper.  ·  **maps_to (shadcn):** shadcn/ui Checkbox (new-york) on @radix-ui/react-checkbox; data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground.
  ·  **composes:** Label / inline text, Sibling-but-distinct: StatusCycleButton (do NOT reuse for binary checks)

**Anatomy:** frame "Cmp · Checkbox" [horizontal, gap 10, alignItems center]
├─ frame "Box" (id gBulc) [18×18, fill $background, stroke $border-hover 2px inner, cornerRadius 0, justifyContent center, alignItems center]
│  └─ icon "Check" (id F7XMr) — lucide `check`, 13×13, weight 600, $primary-foreground, enabled=false until checked
└─ text "Label" (id GmShX) — DM Sans 14 / normal, $foreground (e.g. "Notify crew")

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `checked` | boolean | "indeterminate" |  |  | Controlled checked state; indeterminate renders a minus glyph. |
| `defaultChecked` | boolean |  |  | Uncontrolled initial state. |
| `onCheckedChange` | (checked: boolean) => void |  |  | Radix change handler. |
| `label` | ReactNode |  |  | Adjacent DM Sans 14 label, $foreground. |
| `disabled` | boolean |  | false | Dims whole control to opacity 0.4, non-interactive. |
| `id` | string |  |  | Auto-generated via useId; label htmlFor association. |
| `required` | boolean |  | false | HTML required (form validation). |

**Variants:** `unchecked`, `checked`, `indeterminate`, `disabled (checked & unchecked)`, `focused·ring`

**States:** `unchecked`, `hover`, `focused`, `checked`, `indeterminate`, `disabled`

**Tokens:** `$background`, `$border-hover`, `$primary`, `$primary-foreground`, `$foreground`

**A11y:** Radix Checkbox role="checkbox" with aria-checked (true/false/mixed); Label associated via htmlFor/id; clicking label toggles; focus-visible:ring-2 ring-ring ring-offset-2; disabled:cursor-not-allowed disabled:opacity-50 (design uses 0.4); Keyboard: Space toggles

### Cmp · Checkbox

Binary checkbox with an adjacent DM Sans label. An 18×18 sharp-cornered box (2px border) + a `check` glyph that toggles on. Built on Radix `Checkbox` (camp's `checkbox.tsx`).

**Geometry:** Box 18×18 (camp ships h-4 w-4=16 — bump to 18 to match the screen), 2px border, corner radius 0 (`--radius:0`). Check icon lucide `check` 13×13, weight 600. Row gap 10, `alignItems center`. Label DM Sans 14 `$foreground`.

**State → style map (exact):**
| State | Box fill | Box stroke | Check | Label |
|---|---|---|---|---|
| unchecked | `$background` | `$border-hover` 2px | hidden (`enabled:false`) | `$foreground` |
| checked | `$primary` | none (`strokeWidth 0`) | visible, `$primary-foreground` | `$foreground` |
| disabled | (state's) `opacity 0.4` | — | — | dimmed |
| focused | + ring (`ring-ring`) | — | — | — |
| indeterminate | `$primary` | none | `minus` glyph `$primary-foreground` | `$foreground` |

**Note:** distinct from the **StatusCycleButton** (also an 18px square) — Checkbox is binary; StatusCycleButton is a 3-state cycle and is a separate component. Do not substitute.

**Screen usages:** RcvKu component library: Checkbox spec matrix — UNCHECKED ("Notify crew") / CHECKED ($primary box, white check) / DISABLED (opacity 0.4); NMzE5: available for Settings/Report opt-in toggles where a checkbox (vs Switch) is appropriate — no checkbox is drawn on a product screen beyond the library, so the showcase matrix is authoritative for its states

**Reconciliation (screen ← library):** Canonical box is 18×18 with 2px $border-hover; checked fills $primary and zeroes the stroke (strokeWidth 0) and enables the check glyph — exactly matching the showcase CHECKED cell. Added an `indeterminate` state (Radix supports it; needed if any 'select all' affordance appears) and an explicit focused ring. camp's 16px/rounded-sm box is overridden to 18px/0-radius to match the design. No on-screen product usage diverges, so the canonical def stands.

---

## Cmp · Radio

**Kind:** atom  ·  **maps_to (camp-404):** No dedicated radio in camp-404's listed components — build on shadcn/ui RadioGroup (@radix-ui/react-radio-group), styled to match Checkbox's token treatment. (option-card-group.tsx is a card-style picker, a different pattern — REF only.)  ·  **maps_to (shadcn):** shadcn/ui RadioGroup + RadioGroupItem (new-york). The 18px circle + 8px primary dot maps to RadioGroupItem + indicator.
  ·  **composes:** RadioGroup wrapper (Radix), Label / inline text

**Anatomy:** frame "Cmp · Radio" [horizontal, gap 10, alignItems center]
├─ frame "Radio" (id C57Of) [18×18, fill $background, cornerRadius 9 (circle), stroke $border-hover 2px inner, justifyContent center, alignItems center]
│  └─ ellipse "Dot" (id OwSYJ) — 8×8, fill $primary, enabled=false until selected
└─ text "Label" (id F3mfPh) — DM Sans 14 / normal, $foreground (e.g. "Dock 7")

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `value` | string | ✓ |  | This item's value within the RadioGroup. |
| `label` | ReactNode |  |  | Adjacent DM Sans 14 label, $foreground. |
| `disabled` | boolean |  | false | Dims this option to opacity 0.4. |
| `id` | string |  |  | Auto-generated via useId; label association. |

**Variants:** `unchecked`, `checked`, `disabled (checked & unchecked)`, `focused·ring`

**States:** `unchecked`, `hover`, `focused`, `checked`, `disabled`

**Tokens:** `$background`, `$border-hover`, `$primary`, `$foreground`

**A11y:** Radix RadioGroup: arrow-key navigation within the group, single tab-stop; role="radio" with aria-checked; group has role="radiogroup" + aria-label; Label htmlFor/id association; clicking label selects; focus-visible:ring-2 ring-ring ring-offset-2; disabled:cursor-not-allowed disabled:opacity (design 0.4)

### Cmp · Radio

Single-select radio with an adjacent DM Sans label. An 18×18 circle (the ONE intentionally round control in an otherwise 0-radius system) with an 8×8 `$primary` center dot. Built on Radix `RadioGroup` (item).

**Geometry:** outer circle 18×18, `cornerRadius 9`, 2px border, `$background` fill. Inner Dot ellipse 8×8 `$primary`. Row gap 10. Label DM Sans 14 `$foreground`.

**State → style map (exact):**
| State | Circle stroke | Dot | Label |
|---|---|---|---|
| unchecked | `$border-hover` 2px | hidden (`enabled:false`) | `$foreground` |
| checked | `$primary` 2px | visible 8×8 `$primary` | `$foreground` |
| disabled | (state's) `opacity 0.4` | — | dimmed |
| focused | + ring (`ring-ring`) | — | — |

**Usage scope:** Radio appears only in the component-library showcase (DeleteHistory range options on NMzE5 are rendered as bespoke `DeleteHistoryRangeOption` cards, not this Radio — that is a separate organism). The Radio contract is therefore authoritative from the showcase; reconcile any future range-picker toward this primitive + RadioGroup.

**Screen usages:** RcvKu component library: Radio spec matrix — UNCHECKED ("Dock 7") / CHECKED ($primary stroke + dot) / DISABLED (opacity 0.4); Not used directly on a product board (DeleteHistory range options are the bespoke DeleteHistoryRangeOption organism, not this primitive)

**Reconciliation (screen ← library):** Showcase-only component; no divergent product rendering. The canonical def is adopted verbatim. Flagged: the round 18px circle is the single intentional non-zero radius in a --radius:0 system — keep cornerRadius 9 explicitly (do not let the global radius reset flatten it). Checked toggles the circle stroke from $border-hover to $primary AND enables the 8px dot (both changes from the showcase CHECKED cell). DeleteHistoryRangeOption is explicitly NOT this primitive and is owned by the Account/Settings organism set.

---

## Cmp · Switch

**Kind:** atom  ·  **maps_to (camp-404):** packages/ui/src/components/switch.tsx (Radix Switch). ADAPT: camp ships a rounded-full (pill) track with bg-background thumb and h-6 w-11 (24×44) — restyle to a SQUARE track (rounded-[2px], --radius context), border 1px $border-hover (off) / $primary (on), thumb 18×18 rounded-full with fill $foreground (off) / $primary-foreground (on), translate-x on checked. Geometry 44×24 already matches camp's w-11 h-6.  ·  **maps_to (shadcn):** shadcn/ui Switch (new-york) on @radix-ui/react-switch; override the track to square (rounded-sm) and the thumb fills per the table.
  ·  **composes:** Radix Switch primitive, Used by (trailing slot): SettingsRow, Optional inline Label

**Anatomy:** CANONICAL (showcase): frame "Cmp · Switch" [horizontal, gap 10, alignItems center]
├─ frame "Track" (id erfHJ) [44×24, fill $muted, cornerRadius 2 (square), stroke $border-hover 1px inner, padding [0,3], alignItems center]
│  └─ frame "Knob" (id qNOb3) [18×18, fill $muted-foreground, cornerRadius 9]
└─ text "Label" (id ZwrZX) — DM Sans 14 / normal, $foreground (e.g. "Auto-dispatch")

ON state (showcase "Switch On"): Track fill $primary, strokeWidth 0, justifyContent end; Knob fill $primary-foreground.

SCREEN OVERLOAD (NMzE5 Settings, 11 instances — standalone, NO inline label, sits in SettingsRow trailing slot):
  Track 44×24, cornerRadius 2, strokeWidth 1
  • ON:  fill $primary, stroke $primary, justifyContent end, Knob = ellipse 18×18 fill $primary-foreground
  • OFF: fill $muted,   stroke $border-hover, (knob left), Knob = ellipse 18×18 fill $foreground

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `checked` | boolean |  |  | Controlled on/off. ON → $primary track, $primary-foreground knob, knob right. |
| `defaultChecked` | boolean |  |  | Uncontrolled initial state. |
| `onCheckedChange` | (checked: boolean) => void |  |  | Radix change handler. |
| `label` | ReactNode |  |  | Optional inline DM Sans 14 label; omit when used inside SettingsRow (Row supplies the label). |
| `disabled` | boolean |  | false | Dims control ~opacity 0.5, non-interactive. |
| `id` | string |  |  | Auto-generated via useId; label/aria association. |

**Variants:** `off (inline-label, showcase)`, `on·primary (inline-label, showcase)`, `off (standalone, SettingsRow)`, `on (standalone, SettingsRow)`, `disabled (on & off)`, `focused·ring`

**States:** `off`, `hover`, `focused`, `on`, `disabled`

**Tokens:** `$muted`, `$border-hover`, `$primary`, `$primary-foreground`, `$muted-foreground`, `$foreground`

**A11y:** Radix Switch role="switch" with aria-checked; Label associated via htmlFor/id; when standalone in a SettingsRow, aria-labelledby points at the row's label; focus-visible:ring-2 ring-ring ring-offset-2 ring-offset-background; Keyboard: Space/Enter toggles; disabled:cursor-not-allowed disabled:opacity-50

### Cmp · Switch

On/off toggle for settings/preferences. A **square** 44×24 track (cornerRadius 2 — NOT a pill) with an 18×18 round knob that slides between ends. Built on Radix `Switch` (camp's `switch.tsx`), restyled to the OpsBoard square track.

**Geometry (reconciled — screens win):** Track 44×24, `cornerRadius 2`, padding `[0,3]`. Knob 18×18, `cornerRadius 9` (round) — the showcase models it as a `frame`; the screens model it as an `ellipse`; both render as a round knob, build as a round thumb. Position is driven by `justifyContent: end` (ON) vs start (OFF) — i.e. a `translate-x` shift on the thumb.

**State → style map (exact, unioned across showcase + 11 screen instances):**
| State | Track fill | Track stroke | Knob fill | Knob position |
|---|---|---|---|---|
| OFF (showcase) | `$muted` | `$border-hover` 1px | `$muted-foreground` | start (left) |
| OFF (screen) | `$muted` | `$border-hover` 1px | `$foreground` | start (left) |
| ON · primary | `$primary` | `$primary` 1px (screen) / strokeWidth 0 (showcase) | `$primary-foreground` | end (right) |
| disabled | (state's) `opacity ~0.5` | — | — | — |
| focused | + ring (`ring-ring`) | — | — | — |

**Knob-fill drift:** OFF knob is `$muted-foreground` in the showcase but `$foreground` on the real screens. Screens are authoritative → **OFF knob = `$foreground`**, ON knob = `$primary-foreground`. ON stroke: keep `$primary` (screen) — visually equal to strokeWidth 0 on a $primary track.

**Label:** the canonical Switch carries an inline DM Sans 14 label ("Auto-dispatch"), but on the Settings screens the Switch is **standalone** (no inline label) and lives in the trailing slot of a `SettingsRow` that supplies the label+description. Support both: an optional inline `label`, omitted when embedded in a Row.

**Screen usages:** NMzE5 Settings — Desktop & Mobile: 11 standalone Switch toggles in SettingsRow trailing slots (push notifications, auto-dispatch, etc.) — ON ($primary/$primary-foreground) and OFF ($muted/$foreground); RcvKu component library: Switch spec matrix — OFF ("Auto-dispatch", $muted track, $muted-foreground knob) / ON·PRIMARY ($primary track, $primary-foreground knob, justifyContent end)

**Reconciliation (screen ← library):** Major reconciliation away from camp's pill switch: (1) track is SQUARE (cornerRadius 2), not rounded-full — both showcase and all 11 screen instances confirm; (2) OFF knob fill differs between sources — showcase $muted-foreground vs screen $foreground; screens are authoritative so OFF knob = $foreground; (3) ON state pushes the knob via justifyContent:end and fills the knob $primary-foreground (white-on-orange), track $primary; ON stroke is $primary on screen / strokeWidth 0 in showcase (visually identical) — keep $primary; (4) the inline label is OPTIONAL — the real Settings usage is label-less inside a SettingsRow, while the showcase carries the label, so the contract supports both with `label?`. Knob is an ellipse on screen / frame(radius 9) in showcase — both round, build as a round thumb.

---
