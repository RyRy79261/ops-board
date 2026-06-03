# Components — Settings · Legal · Manual · Debug

*17 contracts. Screens authoritative; library reconciled toward screen usage.*

## LegalSection

**Kind:** molecule  ·  **maps_to (camp-404):** No exact camp-404 primitive. App-level composition of Type/Section heading + Type/Body prose; sibling of camp SectionHeader. Reuse camp Divider for ruled sections.  ·  **maps_to (shadcn):** No single shadcn atom; typography composition over new-york conventions. Embedded Callout child → shadcn Alert. Section id supports in-page TOC nav.
  ·  **composes:** Type/Section, Type/Body, Label/Eyebrow (§NN marker), CodeCallout (embedded Callout), Divider

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `sectionNumber` | string |  |  | Gutter marker, e.g. '§04'. Canonical embedded descriptive caps; screens render the bare marker. |
| `heading` | string | ✓ |  | Section title. |
| `children` | ReactNode | ✓ |  | Body: paragraphs, bullet List, Callout(s), sub-headings, links. |
| `id` | string |  |  | Anchor id for TOC deep-linking. |
| `className` | string |  |  | - |

**Variants:** `header-with-number`, `header-without-number`, `body: paragraph-only`, `body: with bullet List`, `body: with embedded Callout (info/warning)`, `body: with sub-heading (H3)`, `body: with inline link`, `fixed 600px column`, `fill_container pane`

**States:** `static read-only`, `anchor-targeted (scroll-into-view, no persistent state)`, `hover on inline links`

**Tokens:** `$primary`, `$foreground`, `$muted-foreground`, `$warning`, `$success`, `$border`

**A11y:** Heading as semantic <h2> (sub-headings <h3>); §NN marker decorative (aria-hidden) or folded into heading name.; Bullet List is a real <ul><li>.; <section> with aria-labelledby pointing at its heading for landmark/anchor nav.; Inline links focusable with visible $ring focus.

## LegalSection

Vertical legal-document section: a horizontal header (left §NN gutter marker + title) over a body of prose, bullet lists, embedded Callouts and optional sub-headings. The reading unit of the Privacy / Terms screens (~34 sections).

### Anatomy
```
frame LegalSection [vertical, gap 14, width fill_container | 600]
├─ H2 [horizontal, gap 14, items-start]
│  ├─ NumW [padding-top 5] → Num '§04' mono 14/700 ls1 $primary
│  └─ Ttl 'Data Retention & Deletion' DM Sans 24/600 $foreground lh1.2 fill
└─ Body [vertical, gap 14]
   ├─ P  DM Sans 16/normal $foreground lh1.65 fill
   ├─ List [vertical, gap 9] → LI [gap 12]{ Mk(Sq 6×6 $primary, top 9) + T DM Sans 16 $foreground lh1.6 } × n
   └─ Callout (CodeCallout, tone=info|warning)  [Legal sections use $primary/$warning only; no $destructive Callout on-screen]
```

### Variants & states
- **Header:** with §NN gutter marker vs without.
- **Body composition:** paragraph-only | + bullet List | + embedded Callout | + sub-heading (H3) | + inline link.
- **Column:** fixed 600px reading column (desktop) vs fill_container pane.
- **States:** static read-only; anchor-targeted (scroll-into-view via TOC, no persistent visual); hover on inline links only.

### Tokens
`$primary` (gutter marker, bullets) · `$foreground` (title, prose) · `$muted-foreground` · `$warning`/`$success` (callouts) · `$border`.

### Reconciliation
WIDENED toward the authoritative screens. Canonical `FLd5C` was vertical (Num-over-Heading, Num='§ 04 · DATA RETENTION' 11/700 ls1.5, Heading DM Sans 20/700, single muted Body paragraph 15/1.6). Screens win: **horizontal H2** (NumW gutter + Ttl), bare `§04` mono 14/700, **title 24/600**, body is a **container** (P + bullet List + Callout + optional H3) with prose in **$foreground 16/1.65**. Bullet markers are **6px $primary squares** (radius 0). 600px column honored on desktop; pane uses fill_container.

### Maps to
- **camp-404:** no exact primitive; app-level composition of Type/Section + Type/Body (+ Divider for ruled sections).
- **shadcn:** no single atom; typography composition; embedded Callout → Alert.

**Screen usages:** NMzE5 Legal docs (Privacy/Terms, desktop+mobile): ~34 'Sec §NN' sections.; RcvKu showcase 'cl-legalsection'.

**Reconciliation (screen ← library):** WIDENED to the authoritative screen: horizontal H2 header (NumW gutter + Ttl), bare '§04' mono 14/700, title DM Sans 24/600, body container (P + bullet List + Callout + optional H3), prose $foreground 16/1.65, 6px $primary square bullets. Canonical was vertical with muted 15px body. children slot absorbs the inconsistent inner composition across the 34 sections.

---

## LegalIndexRow

**Kind:** molecule  ·  **maps_to (camp-404):** No exact camp-404 component; app-level NavCard-lite list-row (cousin of NavCard without orange-active). Chevron via lucide chevron-right.  ·  **maps_to (shadcn):** No shadcn atom; app-level link row. Container surface = shadcn/camp Card.
  ·  **composes:** Card, Type/Body, Type/Caption, lucide chevron-right

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `title` | string | ✓ |  | Document name. |
| `description` | string |  |  | One-line summary (screen shows it; canonical omits). |
| `updatedDate` | string |  |  | 'UPD 2026-06-03' (screen) / 'UPDATED …' (canonical). |
| `href` | string |  |  | - |
| `onSelect` | () => void |  |  | - |
| `className` | string |  |  | - |

**Variants:** `with description`, `title-only (compact)`, `with updated-date`, `without date`, `first row (full border)`, `middle/last (shared edge borders)`, `trailing chevron-only`, `trailing date+chevron`

**States:** `default`, `hover ($card / $border-hover)`, `focus-visible ($ring)`, `pressed/active (navigates)`

**Tokens:** `$card`, `$border`, `$border-hover`, `$foreground`, `$muted-foreground`, `$muted-foreground-subtle`

**A11y:** Whole row is a link (role=link) named by title; description+date via aria-describedby.; Chevron decorative (aria-hidden).; Keyboard focusable, visible focus ring, Enter/Space activates.; Stacked rows form a <nav>/<ul> list.

## LegalIndexRow

Legal-doc index list row: title + one-line description on the left, mono updated-date + chevron on the right. Stacked into a carded 'DocList' on the Legal index.

### Anatomy
```
frame NavRow [horizontal, space-between, items-center, fill, $card, $border 1 (edge-shared), padding 18/20, gap 20]
├─ Col [vertical, gap 5, fill]{ Ttl 'Privacy Policy' DM Sans 17/600 $foreground + Desc DM Sans 13 $muted-foreground lh1.4 fill }
└─ Right [horizontal, gap 16, items-center]{ Date 'UPD 2026-06-03' mono 11/600 ls1 $muted-foreground-subtle + Chev chevron-right 18 $muted-foreground }
```

### Variants & states
- **With description** (screen NavRow) vs **title-only** (compact, canonical).
- **With updated-date** vs without.
- **Stack position:** first row (full border) | middle/last (shared edge borders, top omitted).
- **States:** default; hover ($card / $border-hover); focus-visible ($ring); pressed (navigates).

### Tokens
`$card` · `$border` · `$border-hover` · `$foreground` · `$muted-foreground` · `$muted-foreground-subtle`.

### Reconciliation
WIDENED toward the screen. Canonical `rAyAF` was 600px with a per-row bottom hairline, title 16/500 + 'UPDATED' meta 10/500 + subtle chevron. Screen 'DocList/NavRow' wins: adds a **Desc paragraph** (13px), title **17/600**, date **'UPD' mono 11/600**, chevron **$muted-foreground** (solid), rows are **full-width carded** ($card+$border) and **stacked with shared edge borders**.

### Maps to
- **camp-404:** NavCard-lite list-row (no orange-active); chevron via lucide.
- **shadcn:** app-level link row on a Card surface.

**Screen usages:** NMzE5 Legal index 'DocList' (desktop+mobile): stacked 'NavRow' entries.; RcvKu showcase 'cl-legalindexrow' (×3).

**Reconciliation (screen ← library):** WIDENED to screen: adds a description line, title 17/600, 'UPD' mono 11/600 date, solid $muted-foreground chevron, full-width carded rows stacked with shared edge borders (first row all borders; subsequent omit top to avoid doubling). Compact title+meta form kept as a variant.

---

## ManualLiveBlock

**Kind:** molecule  ·  **maps_to (camp-404):** Build on camp-404 Card (bordered surface) + a labeled header bar; Stage is a React children slot (note 'slot:[]' in the node). Icon = lucide box.  ·  **maps_to (shadcn):** No shadcn atom; bordered Card + Eyebrow label + children slot. A docs 'live canvas'.
  ·  **composes:** Card, Label/Mono, lucide box, TaskCard, StatusCycleButton, WindowStatePill

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `label` | string |  | 'LIVE COMPONENT' | Bar label; screen pattern 'LIVE COMPONENT · {ComponentName}'. |
| `componentName` | string |  |  | Appended after '·' when documenting a specific component. |
| `children` | ReactNode |  |  | Slot — a real live instance; omit to show the slot hint. |
| `className` | string |  |  | - |

**Variants:** `empty (slot hint)`, `filled (live instance)`, `generic label`, `component-named label`

**States:** `static documentation host (embedded component carries its own states)`

**Tokens:** `$muted`, `$border`, `$card-elevated`, `$primary`, `$muted-foreground`, `$muted-foreground-subtle`

**A11y:** Bar label is the caption/heading for the demo region (aria-label on the Stage).; Stage is role=group labeled by the bar; embedded component keeps its roles.; If demos are illustrative-only, mark the Stage 'inert' so demo controls aren't tab-traps; if interactive, ensure full operability.

## ManualLiveBlock

Manual 'live component' embed: a labeled bar ('LIVE COMPONENT · {Name}') over a Stage slot where a real @opsboard/ui instance is rendered for documentation.

### Anatomy
```
frame ManualLiveBlock [vertical, fill | 600, $muted, $border 1]
├─ Bar [horizontal, items-center, gap 7, padding 9/14, $card-elevated, border-bottom 1 $border]
│     { box icon 13 $primary + L 'LIVE COMPONENT · TaskCard' mono 10/700 ls1.5 $muted-foreground }
└─ Stage [vertical, fill, padding 28, slot:[]]
      empty → SlotHint '→ instance the documented component here' mono 12/500 $muted-foreground-subtle (centered)
      filled → <live component instance>
```

### Variants & states
- **Empty** (slot hint) vs **filled** (live instance).
- **Label:** generic 'LIVE COMPONENT' vs component-named 'LIVE COMPONENT · TaskCard'.
- **States:** static host — it carries no interactive state; the embedded component carries its own.

### Tokens
`$muted` · `$border` · `$card-elevated` · `$primary` · `$muted-foreground` · `$muted-foreground-subtle`.

### Reconciliation
Canonical `CQp4D` defines the EMPTY state (explicit `slot:[]` + centered SlotHint). The authoritative Manual screens render the FILLED state: the bar appends the component name, the hint is replaced by a real instance, and the Stage drops center-justification when content fills width. Critically, the on-board live demos are FLATTENED copies of TaskCard/StatusCycleButton/WindowStatePill — the build must INSTANCE the canonical components here, not re-copy them.

### Maps to
- **camp-404:** Card + Eyebrow-style label bar + children slot (Storybook-like canvas).
- **shadcn:** no atom; bordered Card + label + slot.

**Screen usages:** NMzE5 Manual (desktop+mobile): wraps live demos incl. 'LIVE COMPONENT · TaskCard', live StatusCycleButton, live WindowState pills (incl. BLOCKED). 6+ Stages.; RcvKu showcase 'cl-manualliveblock (slot)'.

**Reconciliation (screen ← library):** Canonical defines the empty/slot state; screens render the filled state (name appended to bar, hint replaced by a live instance, Stage top-aligned when content fills). Contract makes label/componentName explicit and treats children as the primary path. The board's live demos are flattened copies (drift) — build must instance the canonical components for single-source-of-truth.

---

## ManualTOCItem

**Kind:** molecule  ·  **maps_to (camp-404):** NavCard-lite sidebar nav-item with a left-accent active rail (mirrors NavCard active + window-state border-l-2). Label = DM Sans 14px (--text-body).  ·  **maps_to (shadcn):** No shadcn atom; app-level nav item. Mobile realized as SectionNavChip pill — paired presentations of one model.
  ·  **composes:** Type/Body, SectionNavChip (mobile sibling), NavCard (active-rail reference)

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `label` | string | ✓ |  | TOC entry, e.g. 'Window states'. |
| `active` | boolean |  | false | Current section (drives left-accent + label color). |
| `href` | string |  |  | In-page anchor (#section-id). |
| `onSelect` | () => void |  |  | - |
| `className` | string |  |  | - |

**Variants:** `active (left border $primary + label $primary 14/600 + optional wash)`, `inactive`, `desktop left-rail item`, `mobile SectionNavChip pill (sibling)`

**States:** `default (inactive)`, `active/current (scroll-spy)`, `hover`, `focus-visible ($ring)`

**Tokens:** `$primary`, `$foreground`, `$muted-foreground`, `(transparent #00000000)`, `(active wash bg-primary/12)`

**A11y:** Link to the in-page anchor (role=link); active carries aria-current='location'/'true'.; Active not color-only — pair left-accent + label-color + aria-current (redundant channels).; Focusable with visible focus ring; inside a <nav> labeled 'On this page'.

## ManualTOCItem

Manual table-of-contents item: a 248px row with a left-accent rail and a DM Sans label. Desktop TOC sidebar entry; on mobile the same nav model is realized as SectionNavChip pills.

### Anatomy
```
frame ManualTOCItem [width 248, fill #00000000 (active → bg-primary/12), border-left 2 (#00000000 → $primary active), padding 9/12]
└─ L 'Window states' DM Sans 14 ($muted-foreground/normal → $primary/600 active)  [screen: active row tvaRu label Ez23n = $primary 14/600]
```

### Variants & states
- **Active** (left border → $primary, label → $primary 14/600, optional $primary/12 wash) vs **inactive** (transparent border, muted label).
- Desktop left-rail item vs mobile SectionNavChip pill (sibling components, one nav model).
- **States:** default (inactive); active/current (scroll-spy); hover (label → $foreground); focus-visible ($ring).

### Tokens
`$primary` (active rail/wash + active label) · `$muted-foreground` (inactive label) · transparent fill/border.

### Reconciliation
Canonical `AqpmA` ships ONLY the inactive default (transparent rail, muted label). ADDED explicit active tokens from the screen: active = border-left-2 $primary + label $primary 14/600 (+ optional bg-primary/12 wash) — verified on NMzE5 active row `tvaRu` (label `Ez23n` = $primary 14/600, fill #ff6b351f, border-left $primary) and mirrored by the mobile SectionNavChip `T5qoy` (label `vDidy` = $primary mono 11/700). Mobile uses SectionNavChip (pill) — kept as a sibling presentation sharing the active-section source.

### Maps to
- **camp-404:** NavCard-lite sidebar item with a left-accent active rail (echoes window-state border-l-2).
- **shadcn:** no atom; app-level nav item.

**Screen usages:** NMzE5 Manual desktop: left TOC rows with left-border active indicator.; NMzE5 Manual mobile: SectionNavChip pills.; RcvKu showcase 'cl-manualtocitem' (default-vs-active pair).

**Reconciliation (screen ← library):** Canonical only shows inactive; active state added (border-left-2 $primary + label $primary 14/600 + optional bg-primary/12) per screen (tvaRu/Ez23n). Drift: active was stroke-color-only — contract makes active a first-class prop with redundant visual+ARIA channels (left-accent + label-color + aria-current). Mobile SectionNavChip kept as a sibling, not collapsed.

---

## CodeCallout

**Kind:** molecule  ·  **maps_to (camp-404):** Build on Card/Alert surface with a left-accent border (border-l-2 from window-state treatment). Lines use --text-mono.  ·  **maps_to (shadcn):** shadcn Alert closest for the bordered-callout shape; code/console form is app-level (mono lines on $card-elevated + border-l-2 $primary).
  ·  **composes:** Card / Alert, Label/Mono, Type/Body, lucide triangle-alert/info/octagon-alert

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `variant` | 'code' | 'callout' |  | 'code' | - |
| `tone` | 'primary'|'info'|'warning'|'danger'|'success' |  | 'primary' | - |
| `icon` | LucideIcon |  |  | Callout form, e.g. triangle-alert. |
| `title` | string |  |  | Callout form mono caps title. |
| `lines` | { text: string; role?: 'comment'|'input'|'success'|'error' }[] |  |  | Code form ordered mono lines. |
| `children` | ReactNode |  |  | Callout form DM Sans body. |
| `className` | string |  |  | - |

**Variants:** `form: code/console`, `form: prose-callout`, `tone: primary/info`, `tone: warning`, `tone: danger`, `tone: success (result line)`, `line role: comment/input/success/error`, `variable line/body length`

**States:** `static read-only`

**Tokens:** `$card-elevated`, `$primary`, `$muted-foreground-subtle`, `$foreground`, `$success`, `$warning`, `$destructive`, `bg-tone/12`

**A11y:** Callout form: role='note' (advisory); danger/warning legal callouts prefix a visually-hidden 'Warning:' so SR conveys severity beyond color.; Code form: <pre><code>; success/error result text carries meaning (not color-only).; Title as strong/heading; icon decorative (aria-hidden).

## CodeCallout

Left-accent callout block with two realizations: a **code/console** form (mono lines: comment / spoken command / success result) for the Manual voice demos, and a tinted **prose-callout** form (icon + mono caps title + DM Sans body). The prose-callout is embedded in Legal sections in **info ($primary) and warning ($warning) tones only** (all 6 Legal `Sec §NN` callouts on NMzE5 — iRWkH/FXRG9 $primary, HHY3C/Dx7Rl/ZITNf/t2ytm $warning). The **danger ($destructive) tone** is supported but appears outside Legal, on Account/Debug `Alert`/`Last Error` frames (V7FNVF, X1UBu = #e05a5a1f / $destructive).

### Anatomy
```
CODE form:
frame [vertical, gap 5, fill | 600, $card-elevated, border-left 2 $primary, padding 16]
├─ Ln '// scope, then speak'                     mono 12.5/500 $muted-foreground-subtle lh1.6
├─ Ln '“AfrikaBurn — mark insurance done”'         mono 12.5/500 $foreground
└─ Ln '→ resolves the task in-mission, status → DONE' mono 12.5/600 $success

CALLOUT form:
frame [horizontal, gap 12, fill, bg-warning/12, border-left 2 $warning, padding 16]
├─ Ico triangle-alert 18 $warning
└─ Col [vertical, gap 6]{ Title 'ACCOUNT DELETION IS PERMANENT' mono 12/700 ls1 $warning + Body DM Sans 14 $foreground lh1.55 fill }
```

### Variants & states
- **Form:** code/console vs prose-callout.
- **Tone:** code/info (primary) | warning ($warning) | danger ($destructive) | success-result line ($success).
- **Per-line role (code):** comment (subtle) | input (foreground) | success (600) | error (destructive).
- **States:** static read-only.

### Tokens
`$card-elevated` · `$primary` · `$muted-foreground-subtle` · `$foreground` · `$success` · `$warning` · `$destructive` · tint fills via /12.

### Reconciliation
WIDENED. Canonical `g2Ink7` is ONLY the code form. Legal screens add a tinted prose 'Callout' (icon + caps title + body) in **info/warning only** (no $destructive Callout in any Legal section); the danger tone comes from the Account/Debug `Alert`/`Last Error` frames. Unified into one component with `variant` + `tone`. Raw tints (#d9a73e1f) → /12 token alphas (brief §3). Shared DNA: $card-elevated/tinted surface + left-accent border-l-2 + sharp corners.

### Maps to
- **camp-404:** Card/Alert surface + border-l-2 accent.
- **shadcn:** Alert is closest for the bordered shape; code form is an app-level extension.

**Screen usages:** NMzE5 Manual: code/console CodeCallout (voice command example).; NMzE5 Legal: tinted 'Callout' blocks (info/warning) embedded in §sections.; NMzE5 Account/Debug: danger-toned 'Alert'/'Last Error' frames (same shape, $destructive).; RcvKu showcase 'cl-codecallout'.

**Reconciliation (screen ← library):** WIDENED: canonical is code-only; Legal screens add tinted prose callouts (icon + caps title + body) in info/warning (the danger tone is sourced from Account/Debug Alert frames, not Legal). Unified via variant ('code'|'callout') + tone axis. Raw hex tints → /12 token alphas. Shared structural DNA: tinted/$card-elevated surface + left-accent border-l-2 + sharp corners.

---

## SettingsRow

**Kind:** molecule  ·  **maps_to (camp-404):** camp Card (LIFT) as the GROUP container; rows = label/desc column + trailing slot, separated by camp Divider. Trailing reuses adapted Switch + lucide chevron-right.  ·  **maps_to (shadcn):** shadcn Switch (toggle) / Select / link+chevron (nav) in the slot; row is an app-level molecule.
  ·  **composes:** Card, Switch (adapted square), Divider, Label/Eyebrow (SettingsGroupHeader), Type/Body, lucide chevron-right

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `label` | string | ✓ |  | - |
| `description` | string |  |  | - |
| `trailing` | ReactNode |  |  | Trailing control slot. |
| `trailingKind` | 'switch'|'nav'|'value'|'select' |  |  | - |
| `checked` | boolean |  |  | Switch case. |
| `onChange` | (checked: boolean) => void |  |  | - |
| `value` | string |  |  | Nav/value case: 'Manage' / count / read-only value. |
| `leading` | ReactNode |  |  | Optional leading element (initials avatar on account row). |
| `href` | string |  |  | - |
| `disabled` | boolean |  | false | - |
| `className` | string |  |  | - |

**Variants:** `trailing: switch`, `trailing: navigation (chevron)`, `trailing: value text`, `trailing: select`, `trailing: avatar+Manage`, `switch ON`, `switch OFF`, `with description`, `label-only`, `with leading avatar`, `grouped (authoritative)`, `standalone 520px card (canonical)`, `disabled`

**States:** `default`, `hover`, `focus-visible ($ring)`, `switch toggling`, `disabled`

**Tokens:** `$card`, `$border`, `$foreground`, `$muted-foreground`, `$muted-foreground-subtle`, `$primary`, `$primary-foreground`, `$muted`, `$border-hover`, `$card-elevated`

**A11y:** Switch rows: trailing is role=switch with aria-checked; row Label is its name (aria-labelledby), Desc via aria-describedby; whole row may toggle.; Nav rows: link/button named by label; chevron+value decorative, value folded into name ('Connected devices, 3').; Switch state beyond knob position — aria-checked + sufficient contrast.; Group is a region; eyebrow labels it (aria-labelledby).; Visible focus ring.

## SettingsRow

The unit of the Settings screen: a label + description on the left and a trailing control slot on the right. On the authoritative screens rows are grouped inside a 'Group' card with hairline dividers, beneath a mono-caps eyebrow (SettingsGroupHeader).

### Anatomy
```
Group [vertical, fill, $card, $border 1] → [ Row, Div(1px $border), Row, … ]
Row [horizontal, gap 16, padding 15/16, items-center, fill]
├─ L [vertical, gap 3, fill]{ Label DM Sans 14/500 $foreground + Desc DM Sans 12 $muted-foreground lh1.4 fill }
└─ Trailing (slot):
     SWITCH 44×24 radius2  ON: $primary fill + $primary stroke + justify-end + Knob 18 $primary-foreground
                           OFF: $muted fill + $border-hover stroke + justify-start + Knob 18 $foreground
     NAV    Link{ optional Val mono 12/500 $muted-foreground + Chev chevron-right 18 $muted-foreground-subtle }
```

### Variants & states
- **Trailing:** switch | navigation (chevron, optional Val/count) | read-only value | select | account avatar+Manage.
- **Switch:** ON vs OFF (full token sets enumerated above).
- With/without description; with/without leading avatar; grouped (authoritative) vs standalone 520px card (canonical).
- **States:** default; hover; focus-visible on the control; switch toggling (animated knob); disabled.

### Tokens
`$card` `$border` `$foreground` `$muted-foreground` `$muted-foreground-subtle` `$primary` `$primary-foreground` `$muted` `$border-hover` `$card-elevated`.

### Reconciliation
WIDENED. Canonical `W5Yvw` is a standalone 520px carded row with one Switch. Screens win: rows live inside a **Group card** as a **stack with 1px Div separators**, preceded by a **SettingsGroupHeader eyebrow** (ls2). Trailing has FOUR realizations (switch / nav-chevron / value+chevron / count+chevron); the account variant adds a **leading initials avatar**. The Switch is a **square** (radius 2) — re-skin shadcn Switch from pill to square to honor the zero-radius identity. SettingsGroupHeader is naming-drift (no canonical def) — build as a thin eyebrow alongside.

### Maps to
- **camp-404:** Card group container + Switch in the slot + Divider separators.
- **shadcn:** Switch (toggle) / Select / link+chevron (nav); row is app-level.

**Screen usages:** NMzE5 Settings (desktop+mobile): eyebrow-grouped 'Group' cards of stacked 'Row' frames with 'Div' separators — switches (Push/Reminders/Voice-confirm/Digest) + nav rows (Connected devices, Sign out, account Manage).; NMzE5 Account: profile/email/password/passkey/2FA rows reuse the idiom.; RcvKu showcase 'cl-settingsrow' (recurs 20+).

**Reconciliation (screen ← library):** WIDENED to grouped layout: rows in a Group card stacked with 1px Div separators + SettingsGroupHeader eyebrow. Four trailing realizations + leading avatar variant added. Switch is a square (radius 2) — ON ($primary) / OFF ($muted + $border-hover + $foreground knob) enumerated; re-skin shadcn Switch from pill to square. SettingsGroupHeader is naming-drift (no canonical def) — build as a thin eyebrow molecule.

---

## AccountProfileSummary

**Kind:** molecule  ·  **maps_to (camp-404):** camp Card (card-elevated) + a minimal inline initials Avatar (NOT Radix — single-user) + adapted Badge for the PRO PLAN pill.  ·  **maps_to (shadcn):** Card surface + shadcn Badge for the plan pill; no shadcn Avatar (brief excludes it).
  ·  **composes:** Card (card-elevated), Badge (adapted, plan pill), Label/Mono, (inline) initials Avatar circle

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `name` | string | ✓ |  | - |
| `email` | string | ✓ |  | Mono. |
| `initials` | string |  |  | Avatar fallback, e.g. 'AM'/'RN'. |
| `memberSince` | string |  |  | 'SINCE MAR 2024'. |
| `plan` | { label: string; tone?: 'primary'|'muted' } |  |  | - |
| `className` | string |  |  | - |

**Variants:** `plan PRO (primary tint)`, `plan FREE`, `with initials avatar 56px (canonical)`, `compact 38px account-row avatar`, `without plan pill`, `without member-since`

**States:** `static read-only (no inline edit form)`, `hover on Manage affordance`

**Tokens:** `$card-elevated`, `$border`, `$primary`, `$primary-foreground`, `$foreground`, `$muted-foreground`, `$muted-foreground-subtle`, `bg-primary/12`, `$border-hover`

**A11y:** Avatar initials decorative if name is present as text; else aria-label = full name. Avatar is the rounded-full exception.; Name as the card's primary heading; email/meta as supporting text.; Plan pill text readable by SR; tone color supplementary.; Any Manage/edit affordance is a separate focusable link.

## AccountProfileSummary

380px elevated profile card: circular initials avatar + name/email + a meta row (member-since caption + tinted plan pill). Read-only display — editing lives behind a Manage nav row.

### Anatomy
```
frame [width 380, $card-elevated, $border 1, gap 18, padding 22, items-center]
├─ Avatar [56×56, $primary, radius 28 (circle), center]{ 'AM' mono 18/700 $primary-foreground }
└─ PCol [vertical, gap 6, fill]
   ├─ name 'Alex Mercer' DM Sans 18/700 $foreground
   ├─ email 'alex@opsboard.io' mono 13 $muted-foreground
   └─ Meta [horizontal, gap 10, items-center, pt 2]{ since 'SINCE MAR 2024' mono 10 ls1 $muted-foreground-subtle + Plan(bg-primary/12, $primary 1, padding 4/9){ 'PRO PLAN' mono 10/700 ls1 $primary } }
```

### Variants & states
- **Plan pill** tone/label: PRO PLAN (primary) | FREE | other; with/without pill.
- **Avatar:** 56px circle (canonical) vs account-row compact 38px ($card-elevated, $border-hover, 'RN').
- With/without member-since caption.
- **States:** static read-only (no inline edit form on the board); hover only on any Manage affordance.

### Tokens
`$card-elevated` `$border` `$primary` `$primary-foreground` `$foreground` `$muted-foreground` `$muted-foreground-subtle` · bg-primary/12 (was #ff6b351f) · `$border-hover` (compact).

### Reconciliation
Canonical `Up5c1` matches the desktop Profile card. **CONFLICT (informational):** brief §5/§14 says 'avatars (none in MVP) — do not bring over Avatar'; this P2 extension reintroduces an initials avatar. Screen wins — keep the avatar but build a minimal inline circle (no Radix Avatar). Raw #ff6b351f → bg-primary/12. Compact 38px account-row avatar added.

### Maps to
- **camp-404:** Card (card-elevated) + inline initials Avatar + adapted Badge (plan pill).
- **shadcn:** Card + Badge; no shadcn Avatar (excluded by brief).

**Screen usages:** NMzE5 Account (desktop+mobile): 'Profile' header. Account-settings 'Row' uses a compact 38px avatar 'RN'.; RcvKu showcase 'cl-accountprofilesummary'.

**Reconciliation (screen ← library):** Matches canonical closely. CONFLICT flagged: brief excludes avatars (single-user) but this P2 surface reintroduces an initials avatar — screen wins, build inline circle (no Radix). Raw #ff6b351f → bg-primary/12. Compact 38px account-row avatar added. Read-only (no inline edit form; editing is a downstream nav target).

---

## TypeToConfirmField

**Kind:** molecule  ·  **maps_to (camp-404):** No camp primitive; controlled mono input wrapper with derived match state; pairs with camp Button (Cancel outline + Confirm destructive).  ·  **maps_to (shadcn):** shadcn Input (mono variant) + label + match-state helper line. Static Cursor → native caret.
  ·  **composes:** TextInput / shadcn Input (mono), Label/Mono, Type/Caption (help), Button (Cancel + Confirm destructive)

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `confirmWord` | string |  | 'DELETE' | - |
| `value` | string | ✓ |  | - |
| `onChange` | (value: string) => void | ✓ |  | - |
| `matches` | boolean |  |  | Derived value===confirmWord; drives border/help/button enablement. |
| `label` | string |  | 'TYPE DELETE TO CONFIRM' | - |
| `helpText` | string |  | 'Confirmation matches — you may proceed.' | - |
| `className` | string |  |  | - |

**Variants:** `state: empty`, `state: mismatch ($destructive help)`, `state: match ($success help, $primary border)`, `focused (caret)`, `blurred`, `confirm word configurable`, `disabled`

**States:** `empty`, `typing/mismatch`, `match (enables destructive confirm)`, `focused/blurred`, `disabled`

**Tokens:** `$muted-foreground`, `$background`, `$primary`, `$foreground`, `$success`, `$destructive`

**A11y:** Real <input> named by the Label; help line aria-live='polite' + aria-describedby announces match/mismatch.; On match, expose via aria + enable the destructive button (help TEXT states the result, not color-only).; Cursor frame decorative (native caret used) — aria-hidden.; Destructive action is a separate focusable button, disabled until matches===true.

## TypeToConfirmField

Destructive-confirmation input: a mono caps label, a primary-bordered field showing the typed value + caret, and a state-colored helper line. The terminal destructive action stays disabled until the value matches.

### Anatomy
```
frame [width 420, vertical, gap 7]
├─ Label 'TYPE DELETE TO CONFIRM' mono 11/normal ls1.5 $muted-foreground
├─ Field [horizontal, fill, h42, $background, $primary 1, padding 0/12, gap 8, items-center]
│     { Value 'DELETE' mono 14 ls1 $foreground + Cursor 2×18 $primary }
└─ Help 'Confirmation matches — you may proceed.' DM Sans 12 $success (match) / $destructive (mismatch)
```

### Variants & states
- **Match state:** empty (no help) | mismatch ($destructive help) | match ($primary border + $success help).
- Focused (caret) vs blurred; confirm word configurable.
- **States:** empty, typing/mismatch, match (enables destructive confirm), focused/blurred, disabled.

### Tokens
`$muted-foreground` `$background` `$primary` `$foreground` `$success` `$destructive`.

### Reconciliation
Canonical `qFALW` matches the on-screen rendering (verified at NMzE5). Reconciled by enumerating the full match-state set (canonical shows only the match state) and binding `matches` to enablement of the destructive Confirm button (observed Actions row: CANCEL outline + DELETE MY ACCOUNT destructive). The static Cursor is a design affordance → replace with a native caret.

### Maps to
- **camp-404:** no primitive; controlled mono input wrapper; pairs with camp Button (Cancel + destructive).
- **shadcn:** Input (mono) + match-state helper.

**Screen usages:** NMzE5 Delete Account (desktop+mobile confirm): 'TYPE DELETE TO CONFIRM Group' + Actions (CANCEL + DELETE MY ACCOUNT).; NMzE5 Delete History flow.; RcvKu showcase 'cl-typetoconfirmfield'.

**Reconciliation (screen ← library):** Canonical matches the screen. Reconciled by enumerating the full match-state set and binding `matches` to downstream destructive-button enablement. Cursor frame documented as an affordance to be replaced by a native caret.

---

## DangerZoneCard

**Kind:** organism  ·  **maps_to (camp-404):** camp Card (or Alert destructive) outer container + camp Button (outline + destructive, 6-variant kit AtbGz). Inner rows = DangerZoneRow sub-molecule.  ·  **maps_to (shadcn):** shadcn Card/Alert (destructive) + Button (outline/destructive). Triggers TypeToConfirmField + Dialog confirm flow.
  ·  **composes:** Card / Alert (destructive), Button (outline + destructive, ref AtbGz), SettingsRow (structural sibling), TypeToConfirmField (confirm step), lucide octagon-alert/history/trash-2

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `title` | string |  | 'DANGER ZONE' | - |
| `actions` | DangerAction[] | ✓ |  | { icon, label, description, buttonLabel, severity:'outline'|'filled', onClick }[] |
| `children` | ReactNode |  |  | Slot (DZBody) alternative to actions[]. |
| `className` | string |  |  | - |

**Variants:** `row action: outline (secondary danger)`, `row action: filled $destructive (terminal)`, `n rows (slot)`, `per-row icon/label/value (history / trash-2)`

**States:** `default`, `row hover (button states)`, `focus-visible`, `flow: DELETE… → TypeToConfirmField + Dialog → success/done`

**Tokens:** `bg-destructive/8 (#e05a5a0d)`, `$destructive`, `$card`, `$border`, `$muted-foreground`, `$foreground`, `$destructive-foreground`, `(transparent #00000000)`

**A11y:** Region labeled by 'DANGER ZONE' heading (aria-labelledby); octagon-alert decorative.; Action buttons have explicit names ('Delete history…', 'Delete account…'), not just 'DELETE…'.; Never single-click destructive — actions open a type-to-confirm step; terminal Delete disabled until match.; Severity via button variant + label, not color alone.

## DangerZoneCard

Destructive-tinted bordered card titled 'DANGER ZONE' (octagon-alert), wrapping a slot of destructive action rows: DELETE HISTORY (outline button) and DELETE ACCOUNT (filled destructive button). Each action opens a type-to-confirm step.

### Anatomy
```
frame [width 520, bg-destructive/8 (#e05a5a0d), $destructive 1, vertical, gap 14, padding 20]
├─ DH [horizontal, gap 9, items-center]{ octagon-alert 16 $destructive + 'DANGER ZONE' mono 12/700 ls2 $destructive }
└─ DZBody [slot, vertical, gap 10]
   └─ Row [space-between, items-center, fill, $card, $border 1, gap 14, padding 15/18] × n
      ├─ LC [vertical, gap 5, fill]{ LR{ icon(history|trash-2) 14 $muted-foreground + Label mono 11 ls1.5 $muted-foreground } + Value DM Sans 14 $foreground }
      └─ Btn  outline: transparent + $border 1, 'DELETE…' mono 12/600 $foreground
            filled : $destructive, 'DELETE…' $destructive-foreground
```

### Variants & states
- **Row action severity:** outline (secondary danger) vs filled $destructive (terminal danger).
- n rows (DZBody slot); per-row icon/label/value.
- **States:** default; row hover (button states); focus-visible; clicking DELETE… opens confirm → TypeToConfirmField + Dialog → success/done.

### Tokens
bg-destructive/8 (#e05a5a0d) · `$destructive` `$card` `$border` `$muted-foreground` `$foreground` `$destructive-foreground` · transparent.

### Reconciliation
Canonical `cfa4F` matches the screen. Raw tints normalize: #e05a5a0d → bg-destructive/8, #00000000 → transparent. Inner rows are a DangerZoneRow sub-molecule mirroring SettingsRow but with action buttons. Drift: row buttons are bespoke frames — reconcile to camp Button outline / destructive. Flow continuation (DELETE… → confirm → 'QUEUED · SUCCESS STATE') captured.

### Maps to
- **camp-404:** Card/Alert (destructive) + Button (outline + destructive, ref AtbGz).
- **shadcn:** Card/Alert + Button; triggers TypeToConfirmField + Dialog.

**Screen usages:** NMzE5 Account 'Danger Zone' (desktop+mobile): DELETE HISTORY (outline) + DELETE ACCOUNT (filled destructive).; RcvKu showcase 'cl-dangerzonecard'.

**Reconciliation (screen ← library):** Matches canonical. Raw tints → tokens (bg-destructive/8, transparent). Inner rows = DangerZoneRow sub-molecule (SettingsRow + action button). Drift: bespoke button frames → camp Button outline/destructive. Flow (DELETE… → confirm → done cell) captured.

---

## DeleteHistoryRangeOption

**Kind:** molecule  ·  **maps_to (camp-404):** No camp primitive; label-wrapped radio option in a Card-like row; member of a RadioGroup.  ·  **maps_to (shadcn):** shadcn RadioGroup / RadioGroupItem inside a Card-like row; selected drives border→$primary + filled dot.
  ·  **composes:** Radio / shadcn RadioGroupItem, Card (row surface), Type/Body + Label/Mono, DangerZoneCard (host flow)

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `label` | string | ✓ |  | e.g. 'Last 7 days'. |
| `value` | string | ✓ |  | - |
| `affectedCount` | number | ✓ |  | Items the range would remove (mono, right). |
| `selected` | boolean | ✓ |  | - |
| `onSelect` | (value: string) => void | ✓ |  | - |
| `name` | string | ✓ |  | Radio group name. |
| `disabled` | boolean |  | false | - |
| `className` | string |  |  | - |

**Variants:** `selected ($primary border + filled dot)`, `unselected (empty circle, $border-hover)`, `range label: Last 7 days / Last 30 days / Last 6 months / Last year / All time`, `count value`, `disabled (zero affected)`

**States:** `unselected`, `selected`, `hover`, `focus-visible`, `disabled`

**Tokens:** `$muted`, `$border`, `$background`, `$border-hover`, `$foreground`, `$muted-foreground`, `$primary`

**A11y:** Real radio (role=radio) in a radiogroup labeled by the dialog prompt; whole row is the clickable label.; Selected via aria-checked + border + filled dot (redundant, not color-only).; Count in the accessible name ('Last 7 days, 64 items').; Arrow-key nav within the group; visible focus ring; zero-affected is aria-disabled.

## DeleteHistoryRangeOption

Selectable time-range row for the delete-history flow: a radio + label on the left, an affected-count mono number on the right. One of a RadioGroup; exactly one range is active.

### Anatomy
```
frame [width 420, $muted, $border 1 (→ $primary selected), gap 12, padding 12/14, space-between, items-center]
├─ L [horizontal, gap 11, items-center]
│     { Radio 18×18 $background radius9 (circle) $border-hover 2 (→ $primary + inner dot selected) + t 'Last 7 days' DM Sans 14 $foreground }
└─ c '64' mono 12 $muted-foreground
```

### Variants & states
- **Selected** (Radio filled dot + $primary row border + count → $primary) vs **unselected** (empty circle, $border-hover, count $muted-foreground).
- Range set is exactly five rows: **Last 7 days (64) · Last 30 days (310) · Last 6 months (820) · Last year (1,204, selected) · All time (3,902)** — affected-count value; disabled (zero affected).
- **States:** unselected, selected, hover, focus-visible, disabled.

### Tokens
`$muted` `$border` `$background` `$border-hover` `$foreground` `$muted-foreground` · `$primary` (selected accent + dot).

### Reconciliation
Canonical `aRrxF` shows only the unselected row (empty 18px circle). ADDED the selected state from the radio model + brief: Radio border → $primary + inner filled dot + row border → $primary + count → $primary. Radio is the rounded-full exception (radius 9). Built as a RadioGroupItem. Range set verified on NMzE5 desktop (mnoWv/Y9EtG/N9TFL/GUu9T/RIGlU) and mobile (tdwvP/zIAfv/X0QdGe/muknx/jHCAb): Last 7 days / 30 days / 6 months / year (selected) / All time — no '90 days' range exists.

### Maps to
- **camp-404:** label-wrapped radio option in a Card-like row.
- **shadcn:** RadioGroup / RadioGroupItem in a row.

**Screen usages:** NMzE5 Delete History (desktop+mobile confirm): time-range rows (recurs ~5×).; RcvKu showcase 'cl-deletehistoryrangeoption'.

**Reconciliation (screen ← library):** Canonical shows only unselected. Selected state added (Radio $primary border + inner dot, row $primary border). Radio is the rounded-full exception. Count mono right-aligned. Built as a RadioGroupItem (single active range).

---

## DebugInfoRow

**Kind:** molecule  ·  **maps_to (camp-404):** No camp primitive; tiny 2-column mono KV row (--font-jetbrains-mono). Sibling of ReportComposer KV rows — share a KVRow primitive.  ·  **maps_to (shadcn):** No shadcn atom; app-level definition-list row (<dl><dt><dd>).
  ·  **composes:** Label/Mono

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `label` | string | ✓ |  | Key, e.g. 'app.version'. |
| `value` | string | ✓ |  | e.g. '2.4.1'. |
| `keyWidth` | number |  | 104 | Fixed key-column width px. |
| `className` | string |  |  | - |

**Variants:** `flat background`, `zebra-alternating`, `value normal`, `value code/numeric`, `long value wrap`, `fixed key-column width`

**States:** `static read-only`, `selectable/copyable values`

**Tokens:** `$card-elevated`, `$muted-foreground`, `$foreground`

**A11y:** Render as <dl> with <dt>/<dd> (or key as aria-label for value) so the relationship is announced.; Values user-selectable/copyable (debug context).; Decorative — no interactive state required.

## DebugInfoRow

Tiny mono key/value row for the Debug/About panel (fixed key column + fill value). Sibling of ReportComposer's KV rows — share a KVRow primitive.

### Anatomy
```
frame [width 360, $card-elevated, gap 12, padding 9/13]
├─ K 'app.version' mono 11/normal $muted-foreground (fixed width 104)
└─ V '2.4.1'       mono 11/500   $foreground (fill, lh1.4, wraps)
```

### Variants & states
- Flat $card-elevated vs zebra-alternating (long lists); value emphasis normal vs code/numeric; long value wrap; fixed key-column width (default 104).
- **States:** static read-only; selectable/copyable values.

### Tokens
`$card-elevated` `$muted-foreground` `$foreground`.

### Reconciliation
Canonical `C6etd5` matches the on-screen System Info / Session KV rows — no structural divergence. The same pattern recurs in ReportComposer's Context Block; share one KVRow primitive (surfaced here as DebugInfoRow). Tier-1 atom.

### Maps to
- **camp-404:** no primitive; 2-column mono KV row.
- **shadcn:** no atom; semantic <dl><dt><dd>.

**Screen usages:** NMzE5 Settings → Debug/About: System Info & Session KV blocks (recurs 15+).; RcvKu showcase 'cl-debuginforow'.

**Reconciliation (screen ← library):** Matches canonical; no divergence. Same KV pattern recurs in ReportComposer Context Block — share a single KVRow primitive. Tier-1 atom.

---

## ErrorLogRow

**Kind:** molecule  ·  **maps_to (camp-404):** Row + canonical Badge (severity variants) for the level pill.  ·  **maps_to (shadcn):** shadcn Badge (severity-toned) inside an app-level table-cell log row.
  ·  **composes:** Badge (adapted, severity tones), Label/Mono, Divider (separators)

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `timestamp` | string | ✓ |  | e.g. '14:32:01'. |
| `severity` | 'error'|'warn'|'info' | ✓ |  | - |
| `code` | string |  |  | e.g. 'OPS-4012'. |
| `message` | string | ✓ |  | - |
| `layout` | 'table'|'stacked' |  | 'table' | - |
| `className` | string |  |  | - |

**Variants:** `severity ERROR/ERR`, `severity WARN`, `severity INFO`, `badge 'ERROR' (canonical)`, `badge 'ERR' (screen)`, `layout table`, `layout stacked`, `with/without code`, `single/multi-line message`

**States:** `static read-only`, `hover (row highlight)`, `selectable text`

**Tokens:** `$card-elevated`, `$muted-foreground`, `bg-destructive/12 (#e05a5a1f)`, `$destructive`, `$warning`, `$primary`, `$foreground`

**A11y:** Log uses table or list semantics; severity via badge TEXT not color alone.; Code is a copyable mono chip ($primary-styled identifier, not necessarily a link).; Time+severity+code folded into row context.; Scrollable log region labeled 'Recent errors'.

## ErrorLogRow

Log entry for the Debug 'Recent Errors' list: timestamp + severity badge + error code + message. On screen it is a fixed-cell table row; the canonical def is a stacked card.

### Anatomy
```
TABLE form (screen):
frame LogRow [horizontal, gap 14, padding 9/14, items-center, fill]
├─ Cell[78] T '14:32:01' mono 11 $muted-foreground
├─ Cell[56] Badge(bg-destructive/12 #e05a5a1f, padding 3/6){ 'ERR' mono 10/700 ls0.5 $destructive }
├─ Cell[86] C 'OPS-4012' mono 11/600 $primary
└─ CellMsg[fill] M 'Voice transcription timed out after 8s' mono 11 $foreground
(rows separated by 1px Div $border + a LogFooter)

STACKED form (canonical AsyPb): frame[vertical, gap 6, $card-elevated, padding 10/13]{ TopLine{T + Badge 'ERROR' + C} + M(fill) }
```

### Variants & states
- **Severity:** ERROR/ERR ($destructive + /12) | WARN ($warning + /12) | INFO ($muted).
- **Badge label:** 'ERROR' (canonical) vs 'ERR' (screen table).
- **Layout:** table (fixed cells) vs stacked.
- With/without code; single/multi-line message.
- **States:** static; hover (row highlight); selectable text.

### Tokens
`$card-elevated` `$muted-foreground` · bg-destructive/12 (#e05a5a1f) `$destructive` `$warning` `$primary` `$foreground`.

### Reconciliation
WIDENED for the table layout. Canonical `AsyPb` is a vertical card. The authoritative Debug screen renders a TABLE (fixed cells 78/56/86/fill), badge label 'ERR', rows separated by Div + LogFooter. Both layouts retained via `layout`. Severity badge reuses the canonical Badge with severity tones; #e05a5a1f → bg-destructive/12; WARN/INFO tones added.

### Maps to
- **camp-404:** row + canonical Badge (severity variants).
- **shadcn:** Badge (severity) in an app-level log row.

**Screen usages:** NMzE5 Debug 'Recent Errors' (desktop ~6×, mobile ~4×): LogRow + LogFooter.; RcvKu showcase 'cl-errorlogrow' (recurs 4×).

**Reconciliation (screen ← library):** WIDENED: canonical is a vertical card; screen is a fixed-cell table (78/56/86/fill) with 'ERR' badge + Div separators + LogFooter. Both via `layout`. Badge reuses severity tones; #e05a5a1f → bg-destructive/12; WARN/INFO added.

---

## FeatureFlagChip

**Kind:** atom  ·  **maps_to (camp-404):** Adapted Badge with a tone variant (success/muted/destructive) + leading StatusDot; same family as CategoryTag/Badge.  ·  **maps_to (shadcn):** shadcn Badge with success/muted tone; a small inline pill.
  ·  **composes:** Badge (adapted, +success tone), StatusDot, Label/Mono

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `label` | string | ✓ |  | Flag key, e.g. 'voice_v2'. |
| `enabled` | boolean | ✓ |  | Drives tint + dot color + ON/OFF text. |
| `tone` | 'success'|'muted'|'destructive' |  | 'success' | - |
| `className` | string |  |  | - |

**Variants:** `enabled (ON, success/12 + $success dot + $success 'ON')`, `disabled (OFF, $muted + $border + subtle dot + 'OFF')`, `tone success`, `tone muted`, `tone destructive`, `leading dot (screen)`, `leading check/x icon (canonical)`

**States:** `enabled (ON)`, `disabled (OFF)`, `static read-only`

**Tokens:** `bg-success/12 (#5ae07a1f)`, `(transparent #5ae07a00)`, `$success`, `$foreground`, `$muted`, `$border`, `$muted-foreground`, `$muted-foreground-subtle`

**A11y:** State via 'ON'/'OFF' TEXT not color alone; accessible name 'voice_v2, on' / 'offline_sync, off'.; Status dot decorative (aria-hidden).; Read-only — no interactive role unless toggleable (then role=switch).

## FeatureFlagChip

Small chip for a feature flag in the Debug 'feature.flags' row: a status dot + flag name + ON/OFF label. Enabled = success-tinted; disabled = muted.

### Anatomy
```
ENABLED (screen): frame Flag [horizontal, bg-success/12 (#5ae07a1f), transparent success stroke, gap 7, padding 3/8, items-center]
   { D ellipse 6×6 $success + N 'voice_v2' mono 11/500 $foreground + S 'ON' mono 10/700 ls0.5 $success }
DISABLED (screen): frame Flag [$muted, $border 1, gap 7, padding 3/8]
   { D ellipse 6×6 $muted-foreground-subtle + N 'offline_sync' mono 11/500 $muted-foreground + S 'OFF' mono 10/700 ls0.5 $muted-foreground-subtle }
```

### Variants & states
- **Enabled (ON)** vs **disabled (OFF)** — full token sets above.
- Tone: success | muted | destructive.
- Leading: dot (screen) vs check/x icon (canonical).
- **States:** enabled, disabled, static read-only.

### Tokens
bg-success/12 (#5ae07a1f) · transparent (#5ae07a00) · `$success` `$foreground` `$muted` `$border` `$muted-foreground` `$muted-foreground-subtle`.

### Reconciliation
RECONCILED to the screen, which DIFFERS from canonical. Canonical `R8JgR` uses a lucide CHECK icon + name in $success, no ON/OFF, no OFF state. Screen wins: a **6px DOT** (not icon), name in **$foreground**, explicit **ON/OFF text**, and a full **OFF state** ($muted + $border + subtle dot). Raw tints → bg-success/12 + transparent; Badge gains a success tone per brief §14.

### Maps to
- **camp-404:** adapted Badge with success/muted tone (+ leading StatusDot).
- **shadcn:** Badge (success/muted).

**Screen usages:** NMzE5 Debug 'feature.flags' ChipRow (desktop+mobile): ON (voice_v2, deps_graph, ai_research, telemetry) + OFF (offline_sync, beta_ui). 12 instances.; RcvKu showcase 'cl-featureflagchip' (recurs 6×).

**Reconciliation (screen ← library):** RECONCILED to screen (differs from canonical). Screen uses a 6px DOT (not check icon), name in $foreground, explicit ON/OFF text, and a full OFF state. Raw tints → bg-success/12 + transparent; Badge gains success tone.

---

## ReportComposer

**Kind:** organism  ·  **maps_to (camp-404):** camp Card/Dialog shell + Waveform (LIFT) + Textarea + Switch + Button (Send) + IconButton (close). Stop+waveform reuse the voice RecordingPanel/VoiceFAB pattern (S5).  ·  **maps_to (shadcn):** shadcn Dialog (mobile Sheet / desktop modal) + Textarea + Switch + Button + lifted Waveform; send-result Toast is the adapted Toast.
  ·  **composes:** Dialog / Sheet, Card, Textarea, Switch (adapted), Button (Send primary), IconButton (close), Waveform (LIFT), DebugInfoRow / KVRow (context), Toast (adapted, send result), StatusDot (REC), lucide bug/lightbulb/x/paperclip/mic/square/send/hash

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `reportType` | 'bug'|'feature' |  | 'bug' | - |
| `context` | { lastError?: string; screen: string; appVersion: string } | ✓ |  | - |
| `includeDiagnostics` | boolean |  | true | - |
| `onToggleDiagnostics` | (v: boolean) => void |  |  | - |
| `recordingState` | 'idle'|'recording'|'transcribing'|'done' |  | 'idle' | - |
| `onStartStop` | () => void |  |  | - |
| `description` | string | ✓ |  | - |
| `onChange` | (v: string) => void | ✓ |  | - |
| `onSend` | () => void | ✓ |  | - |
| `onClose` | () => void | ✓ |  | - |
| `className` | string |  |  | - |

**Variants:** `report type: bug`, `report type: feature`, `dictation idle`, `dictation recording`, `dictation transcribing`, `dictation done`, `diagnostics on/off`, `context rows variable`, `send enabled/disabled/sending`, `send success (Toast + reference)`, `send error (retry Toast)`, `mobile sheet`, `desktop modal`

**States:** `idle (send disabled)`, `recording (Stop + live waveform)`, `transcribing`, `filled (send enabled)`, `sending`, `success`, `error (role=alert)`

**Tokens:** `$card`, `$border`, `$foreground`, `$primary`, `$muted-foreground`, `$muted-foreground-subtle`, `$card-elevated`, `$destructive`, `$destructive-foreground`, `$primary-foreground`, `$background`, `$success`

**A11y:** Dialog/Sheet focus-trapped, labeled by the header (aria-labelledby), Escape + Close dismiss, focus returns to trigger.; Recording announced via aria-live; REC timer + 'TRANSCRIBING LIVE' convey status beyond the red dot.; Real <textarea> with a label; Send disabled until valid (aria-disabled).; Diagnostics Switch role=switch + aria-checked.; Send result: success role=status, error role=alert; reference number selectable.; Waveform decorative (aria-hidden); Stop control named 'Stop recording'.

## ReportComposer

400px bug/feature report panel (mobile Sheet / desktop modal): header, an auto-attached-context block (KV rows + diagnostics toggle), a live voice-dictation capture, a description textarea, and a SEND REPORT button. Sending resolves into a success Toast (with reference) or an error/retry Toast.

### Anatomy
```
frame [width 400, $card, $border 1, vertical, gap 16, padding 20]
├─ Header{ TitleGroup(bug 17 $primary + 'REPORT A BUG' mono 14/700 ls1.5) + Close 32×32 $border 1 (x 16 $muted-foreground) }
├─ Context Block [$card-elevated, $border 1]{ CtxLabel(paperclip + 'AUTO-ATTACHED CONTEXT' mono 10/600 ls1.5 $muted-foreground-subtle)
│     + KV×3 (LAST ERROR→OPS-4012 $primary, SCREEN→Category Board, APP VERSION→1.4.2 · build 318) + Divider
│     + Toggle Row('Include diagnostics' DM Sans 13/500 + sub mono 10 | Switch 42×24 ON) }
├─ Voice Dictation [$card-elevated, $primary 1]{ VLabel(mic 15 $primary + 'DICTATE YOUR REPORT' mono 11/700 | Status($destructive dot 7 + 'REC 00:09' mono 10/600 $destructive))
│     + Capture(Stop 52 $destructive circle + square 20 $destructive-foreground + WfWrap{ Waveform 36h ~33 bars 3px ($primary head / $muted-foreground-subtle tail) + Hint 'TRANSCRIBING LIVE · TAP TO STOP' mono 9 }) }
├─ Description Field{ 'DESCRIPTION' mono 11 ls1.5 $muted-foreground + Box h96 $background $primary 1 (Val DM Sans 14 $foreground + ▋ caret) }
└─ Send Report [fill, h48, $primary, center]{ send 16 + 'SEND REPORT' mono 13/600 ls1 $primary-foreground }
```

### Variants & states
- **Report type:** bug vs feature-request (icon/title swap).
- **Dictation:** idle | recording (REC + active waveform) | transcribing | done.
- Diagnostics on/off; context rows variable.
- **Send:** enabled | disabled | sending | success (Toast '✓ REPORT SENT' + REFERENCE OPS-R-2291 + 'AUTO-DISMISS · 4S') | error (retry Toast, role=alert).
- Container: mobile bottom-sheet vs desktop modal.

### Tokens
`$card` `$border` `$foreground` `$primary` `$muted-foreground` `$muted-foreground-subtle` `$card-elevated` `$destructive` `$destructive-foreground` `$primary-foreground` `$background` · `$success` (send result).

### Reconciliation
Canonical `ZDRoi` matches the composer. Reconciliations: the Description box + Switch are inline — reconcile to lifted Textarea + adapted Switch; the ~33-bar Waveform is hand-laid — reconcile to the LIFTED Waveform ($primary head / $muted-foreground-subtle tail); the KV rows duplicate DebugInfoRow — share KVRow; the Send button is bespoke — camp Button primary. Send-result Toast (success + reference chip / error retry) is the richer adapted Toast and part of this flow's state machine.

### Maps to
- **camp-404:** Card/Dialog shell + Waveform (LIFT) + Textarea + Switch + Button + IconButton.
- **shadcn:** Dialog/Sheet + Textarea + Switch + Button + Toast.

**Screen usages:** NMzE5 Shake-to-Report: mobile 'Sheet'/'Report Composer' + desktop 'Modal Composer' (5×).; NMzE5 Send States: sending → success Toast ('✓ REPORT SENT' + OPS-R-2291 + auto-dismiss 4s) → error/retry.; RcvKu showcase 'cl-reportcomposer'.

**Reconciliation (screen ← library):** Matches canonical closely. Reconcile: inline Description → lifted Textarea; inline Switch → adapted Switch; hand-laid 33-bar Waveform → lifted Waveform ($primary head / subtle tail); KV rows → shared KVRow with DebugInfoRow; bespoke Send → camp Button primary. Report-type axis shared with ShakeReportSheet CTAs. Send-result Toast (success + reference chip / error retry) is part of the state machine. Container: Dialog (desktop) / Sheet (mobile).

---

## ShakeReportSheet

**Kind:** organism  ·  **maps_to (camp-404):** Dialog/Sheet shell + camp Button (primary + secondary/outline) + inline camp IconBadge (vibrate). Opens ReportComposer on action.  ·  **maps_to (shadcn):** shadcn Dialog (or Sheet) content composition. Brief §14 reserves Dialog for voice disambiguation — P2 extension.
  ·  **composes:** Dialog / Sheet, Button (primary + secondary), IconBadge (vibrate), Label/Mono, ReportComposer (opened on action), lucide vibrate/bug/lightbulb

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `title` | string |  | 'Report an error?' | - |
| `explainer` | string |  | 'We felt a shake. Something broken, or an idea worth flagging? Send it straight to the build team.' | - |
| `actions` | { icon: LucideIcon; label: string; variant: 'primary'|'secondary'; onClick: () => void }[] | ✓ |  | - |
| `onDismiss` | () => void | ✓ |  | - |
| `shakeHint` | string |  | '↻ SHAKE AGAIN TO DISMISS' | - |
| `className` | string |  |  | - |

**Variants:** `n actions (2: bug/feature)`, `with shake-hint footer`, `without shake-hint footer`, `bottom-sheet (mobile)`, `centered modal`, `action primary (bug)`, `action secondary/outline (feature)`

**States:** `visible (shake-triggered)`, `dismissing (shake again / DISMISS)`, `action-selected (opens ReportComposer)`

**Tokens:** `$card`, `$border`, `$card-elevated`, `$primary`, `$primary-foreground`, `$foreground`, `$muted-foreground`, `$muted-foreground-subtle`, `$secondary`

**A11y:** Sheet/Dialog focus-trapped, labeled by the title; vibrate icon decorative.; Two CTAs are real buttons with clear names; secondary distinct via variant + label not color alone.; Dismiss via DISMISS button AND Escape (shake is an enhancement, not the only path); focus returns to the prior surface.; Shake hint is supplementary text, not the sole dismiss affordance.

## ShakeReportSheet

330px shake-triggered prompt sheet: a vibrate icon badge, heading + explainer, two CTAs (REPORT A BUG primary / REQUEST A FEATURE secondary), and a dismiss footer with a 'shake again' hint. Entry point that opens ReportComposer.

### Anatomy
```
frame [width 330, $card, $border 1, vertical, gap 18, padding 24, items-center]
├─ Icon Badge [52×52, $card-elevated, $border 1, center]{ vibrate 24 $primary }
├─ Heading [vertical, gap 8, center]{ Title 'Report an error?' DM Sans 21/600 $foreground + Explainer DM Sans 14 $muted-foreground center }
├─ Actions [vertical, gap 10, fill]
│  ├─ Report Bug   [fill, h48, $primary, center]{ bug 16 + 'REPORT A BUG' mono 13/600 ls1 $primary-foreground }
│  └─ Request Feature [fill, h48, $secondary, $border 1, center]{ lightbulb 16 $foreground + 'REQUEST A FEATURE' mono 13/600 ls1 $foreground }
└─ Footer [vertical, gap 6, center, pt 6]{ Dismiss 'DISMISS' mono 12/600 ls1.5 $muted-foreground + Hint '↻ SHAKE AGAIN TO DISMISS' mono 10/500 ls1.5 $muted-foreground-subtle }
```

### Variants & states
- n actions (here 2: bug/feature); with/without shake-hint footer; bottom-sheet vs centered modal; action variant primary vs secondary/outline.
- **States:** visible (shake-triggered); dismissing (shake again / DISMISS); action-selected (opens ReportComposer).

### Tokens
`$card` `$border` `$card-elevated` `$primary` `$primary-foreground` `$foreground` `$muted-foreground` `$muted-foreground-subtle` `$secondary`.

### Reconciliation
Canonical `Ht1Ql` matches the mobile Sheet exactly. Reconcile: the two CTA buttons are bespoke frames → camp Button primary + secondary/outline; the vibrate badge reuses camp IconBadge. **Flagged extension:** brief §14 reserves Dialog for voice disambiguation in MVP — this is a P2 extension surface. The 'shake again to dismiss' gesture needs an accessible fallback (DISMISS button + Escape). Selecting an action opens ReportComposer (shared report-type axis).

### Maps to
- **camp-404:** Dialog/Sheet shell + Button (primary + secondary) + IconBadge.
- **shadcn:** Dialog/Sheet content composition.

**Screen usages:** NMzE5 Shake-to-Report (mobile): shake-triggered 'Sheet' — entry to ReportComposer.; RcvKu showcase 'cl-shakereportsheet'.

**Reconciliation (screen ← library):** Matches canonical exactly. Bespoke CTA buttons → camp Button primary + secondary; vibrate badge → camp IconBadge. Flagged P2 extension (brief reserves Dialog for voice disambiguation). Shake-again gesture needs accessible fallback (DISMISS + Escape). Action opens ReportComposer.

---

## ErrorBoundaryFallback

**Kind:** organism  ·  **maps_to (camp-404):** camp Alert (destructive) or Card-with-destructive-accent + camp Button (primary Reload ref AtbGz; outline Report) + lucide TriangleAlert. Outermost ErrorBoundary (S4; intake-tracker error-boundary REF).  ·  **maps_to (shadcn):** shadcn Alert (destructive) / Card + Button. Distinct from per-feature ErrorStateCard.
  ·  **composes:** Alert / Card (destructive), Button (primary Reload/Retry + outline Report, ref AtbGz), Type typography + Label/Mono (code/trace), lucide triangle-alert/rotate-cw/bug, ShakeReportSheet / ReportComposer (Report target)

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `errorCode` | string |  |  | e.g. 'ERR · COMPONENT TREE CRASHED'. |
| `title` | string |  | 'Something broke' | - |
| `description` | string |  | 'An unexpected error stopped this view from rendering. Reload to recover, or report the issue with the trace below.' | - |
| `trace` | string |  |  | e.g. 'TRACE 0x3F·a1b2c3 · build 2026.06.03 · render@TaskBoard'. |
| `onReload` | () => void | ✓ |  | - |
| `onReport` | () => void |  |  | - |
| `variant` | 'full'|'compact' |  | 'full' | - |
| `className` | string |  |  | - |

**Variants:** `full (accent bar + code + trace + Reload + Report)`, `compact/simplified (single RETRY)`, `with/without trace`, `with/without Report`, `compact/inline`, `full-screen`, `recoverable vs fatal`

**States:** `error (on crash)`, `retrying/reloading`, `report-opened`

**Tokens:** `$card`, `$background`, `$destructive`, `$foreground`, `$muted-foreground`, `$muted-foreground-subtle`, `$border`, `$primary`, `$primary-foreground`, `(transparent #00000000)`

**A11y:** Container role='alert' (or aria-live='assertive' region) so the crash is announced.; Title is a heading; code/trace supplementary + selectable for bug reports.; Reload/Retry is the primary focusable action (autofocus on mount acceptable); Report secondary links to the report flow.; Icon decorative; severity via 'Something broke' + ERR text, not color alone.

## ErrorBoundaryFallback

Fallback shown when a React subtree crashes. Two realizations: a rich canonical full form (accent bar + ERR code + trace + Reload + Report) for the outermost ErrorBoundary, and a simplified board form (triangle-alert + 'SOMETHING BROKE' + single RETRY) seen on the states sheet. Distinct from the per-feature ErrorStateCard.

### Anatomy
```
CANONICAL (full): frame [fill, $card, $destructive 1, vertical]
├─ Accent [fill, h2, $destructive]
└─ Body [vertical, gap 14, padding 28, center]
   { triangle-alert 30 $destructive + Code 'ERR · COMPONENT TREE CRASHED' mono 11/700 ls1.5 $destructive
     + Title 'Something broke' DM Sans 20/700 $foreground + Desc DM Sans 13 $muted-foreground center
     + Trace 'TRACE 0x3F·… · render@TaskBoard' mono 10 $muted-foreground-subtle center
     + Actions{ ref AtbGz Button 'RELOAD' (primary) + Report(transparent + $border 1){ bug 14 + 'REPORT' mono 13/600 $foreground } } }

SCREEN (simplified): frame [$background, $border 1, vertical, gap 16, padding 32, center]
   { triangle-alert 48 $destructive + 'SOMETHING BROKE' mono 15/700 ls1.5 $foreground + body DM Sans 14 $muted-foreground center
     + Retry($primary){ rotate-cw 14 + 'RETRY' mono 12/700 ls1 $primary-foreground } }
```

### Variants & states
- **Fidelity:** full (accent bar + code + trace + Reload + Report) vs simplified (single RETRY).
- With/without trace; with/without Report; compact/inline vs full-screen; recoverable vs fatal.
- **States:** error (on crash); retrying/reloading; report-opened.

### Tokens
`$card` `$background` `$destructive` `$foreground` `$muted-foreground` `$muted-foreground-subtle` `$border` `$primary` `$primary-foreground` · transparent.

### Reconciliation
TWO realizations into one component via `variant`. Canonical `d4KRE9` is the rich app-level fallback (net-new, not on any board). TvXzz 'ErrorState' is simplified ('compact'): no accent bar (plain $border/$background), no code/trace, all-caps mono header, single RETRY (rotate-cw) instead of Reload+Report. Screen authoritative for the inline/board case; canonical full form for the OUTERMOST boundary. Drift: canonical Reload is a Button ref but Report is bespoke → Button outline; screen RETRY bespoke → Button primary. Distinct from ErrorStateCard.

### Maps to
- **camp-404:** Alert (destructive) / Card + Button (Reload/Retry + Report).
- **shadcn:** Alert (destructive) / Card + Button.

**Screen usages:** TvXzz 'W ERROR'/'ErrorState' (simplified, RETRY-only).; RcvKu showcase 'cl-errorboundaryfallback' (rich canonical; net-new, not on any board).; scaffolding-plan S4 (ErrorBoundary outermost).

**Reconciliation (screen ← library):** Two realizations into one via `variant`. Canonical rich (accent bar + ERR code + trace + Reload + Report) = 'full' outermost fallback. TvXzz screen simplified ('compact'): no accent bar, no code/trace, mono caps header, single RETRY (rotate-cw). Screen authoritative for inline/board case; canonical full for outermost boundary. Reconcile bespoke Report → Button outline, bespoke RETRY → Button primary. Distinct from ErrorStateCard.

---

## LoadingScreen

**Kind:** organism  ·  **maps_to (camp-404):** Composes the camp Skeleton atom (ref HLa60) for card placeholders in an app-shell layout (Sidebar + Main mirroring the real shell). Spinner for voice/processing micro-loads.  ·  **maps_to (shadcn):** shadcn Skeleton primitives composed into a screen layout; Spinner alt.
  ·  **composes:** Skeleton (ref HLa60, composed card placeholders), Spinner (voice/processing alt), Sidebar / app-shell layout (mirrors AppHeader+Sidebar)

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `showSidebar` | boolean |  | true | Desktop app-shell vs mobile/board list-only. |
| `cardCount` | number |  | 3 | - |
| `className` | string |  |  | - |

**Variants:** `full app-shell (sidebar+main)`, `main-only / mobile / board list-only`, `card count (n)`, `with sidebar`, `without sidebar`, `Spinner-based (voice/processing) alt`

**States:** `loading (shimmer)`, `resolved (replaced — not persistent)`

**Tokens:** `$background`, `$border`, `$muted`, `$card-elevated`, `$card`, `($primary shimmer)`

**A11y:** Container role='status' + aria-busy='true' + accessible label ('Loading…'); visually-hidden 'Loading' text.; Skeleton bars decorative (aria-hidden) — role=status carries the meaning.; Honor prefers-reduced-motion: disable shimmer.; Skeleton layout approximates final content to reduce layout shift.

## LoadingScreen

App-shell first-paint skeleton. Two realizations: the full canonical form (220px sidebar of skeleton brand/nav bars beside a main column of skeleton title/lead + 3 card skeletons via Skeleton ref) and the simplified board form (list-only: title/sub bars + 3 skeleton card rows, no sidebar).

### Anatomy
```
CANONICAL (full): frame [fill, h340, $background, $border 1, horizontal]
├─ Sidebar [220w, fill-h, $muted, border-right 1, vertical, gap 14, padding 18]
│     { skBrand 130×16 $card-elevated + skSub 90×10 $card + spacer + skNav×5 $card-elevated (fill/144/138/132/126) }
└─ Main [fill, vertical, gap 14, padding 22]
      { skTitle 200×18 $card-elevated + skLead 130×11 $card + spacer + ref HLa60 Skeleton skCard×3 (fill) }

SCREEN (list-only): frame [$background, $border 1, vertical, gap 14, padding 24]
   { skTitle 190×18 $card-elevated + skSub 120×12 $card + spacer
     + skCard1/2/3 (fill, h66, $card, $border 1){ box 18×18 $card-elevated + lines{ l1 240×12 + l2 130×10 $card-elevated } } }
```

### Variants & states
- **Layout:** full app-shell (sidebar+main) vs main-only / mobile / board list-only.
- Card count (default 3); with/without sidebar; Spinner-based alt for voice/processing.
- **States:** loading (shimmer); resolved (replaced — not persistent).

### Tokens
`$background` `$border` `$muted` `$card-elevated` `$card` · $primary shimmer hint.

### Reconciliation
TWO realizations via `showSidebar`. Canonical `lLfcN` is the full app-shell skeleton composing the Skeleton atom by ref (HLa60). The TvXzz 'LoadingState' is list-only (no sidebar): skTitle + skSub + 3 hand-built skCard rows (box + 2 lines), no Skeleton refs (drift). Build ONE LoadingScreen composing the Skeleton primitive for both layouts; list-only/mobile sets showSidebar=false. Skeleton primitives normalize from the screen's loose frames to the canonical Skeleton atom. Honor prefers-reduced-motion. Spinner variant for voice/processing micro-loads (noted, not drawn here).

### Maps to
- **camp-404:** composes the Skeleton atom (ref HLa60) in an app-shell layout; Spinner for micro-loads.
- **shadcn:** Skeleton primitives composed into a screen layout.

**Screen usages:** TvXzz 'W LOADING'/'LoadingState' (list-only, no sidebar).; RcvKu showcase 'cl-loadingscreen' (full app-shell, Skeleton-ref cards).; scaffolding-plan S4 (skeletons for sidebar rows + cards).

**Reconciliation (screen ← library):** Two realizations via showSidebar. Canonical = full app-shell composing Skeleton by ref; TvXzz screen = list-only (no sidebar) with hand-built skCard rows (no refs — drift). Build ONE LoadingScreen composing the Skeleton primitive for both; mobile/board sets showSidebar=false. Normalize loose frames to the Skeleton atom; honor reduced-motion. Spinner variant for voice/processing micro-loads.

---
