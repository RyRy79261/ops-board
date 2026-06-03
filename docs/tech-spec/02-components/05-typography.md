# Components — Typography

*8 contracts. Screens authoritative; library reconciled toward screen usage.*

## Type/Display

**Kind:** typography  ·  **maps_to (camp-404):** `--text-display` token (2rem/32px, lh1.1) from camp-404 `packages/ui/src/styles/globals.css` 19-step scale. No dedicated <Display> component — it is a scale step applied via `text-display`.  ·  **maps_to (shadcn):** No shadcn primitive; render a semantic <h1>/<h2> with the `text-display` Tailwind utility. Optionally wrap in a thin Typography/Text helper.

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `children` | ReactNode | ✓ |  | Display text content. |
| `as` | 'h1' | 'h2' | 'div' | 'span' |  | 'h1' | Polymorphic element; default is page-level hero heading. |
| `size` | 'display' | 'manual-hero' | 'display-lg' |  | 'display' | 32 / 34 / 44px steps observed on screens. |
| `className` | string |  |  | Color override hook; never changes family/size off-token. |

**Variants:** `display (32px, w700, DM Sans, $foreground, lh1.1)`, `manual-hero (34px, w700, $foreground)`, `display-lg (44px, w700, $foreground)`

**States:** `default (static text)`, `truncate (optional single-line ellipsis)`

**Tokens:** `$foreground`, `--text-display (32/1.1)`, `--font-dm-sans`, `fontWeight 700`

**A11y:** Render as a true heading element (<h1> for page hero); exactly one <h1> per page (Legal/Manual hero).; Do not rely on visual size for hierarchy; downgrade the element when nested while keeping the scale.; $foreground (#e8e8f0) on $background (#0a0a0c) ≈16:1, passes AAA.; Not aria-hidden; it is primary content.

### Type/Display

**Role:** Hero display heading. The largest DM Sans heading in the system.

**Canonical token:** DM Sans · 32px · weight 700 · line-height 1.1 · `$foreground` · no tracking (showcase id `X9ejlL`; WCTkf specimen `display · 32 · DM Sans 700`).

**Anatomy:** single `text` leaf, no children. `fill=$foreground · fontFamily=DM Sans · fontSize=32 · fontWeight=700 · lineHeight=1.1`.

**Variants (UNION across screens):**
| variant | size | weight | color | where |
|---|---|---|---|---|
| `display` | 32 | 700 | $foreground | canonical / WCTkf foundations specimen ('Field Operations') |
| `manual-hero` | 34 | 700 | $foreground | NMzE5 Manual article hero ('Task cards'), WCTkf board title |
| `display-lg` | 44 | 700 | $foreground | NMzE5 Legal page H1 ('Privacy Policy' / 'Terms of Service') |

**States:** default (static), optional truncate.

**Build:** render as `<h1>` (page hero) with `text-display` Tailwind utility (size+line-height paired token). No shadcn primitive; no camp-404 component — it is a scale step from `globals.css`. Expose `size` ('display'|'manual-hero'|'display-lg'), `as`, `className`.

**Reconciliation:** canonical and WCTkf agree at 32/700. WIDENED with a `size` axis because the Legal H1 renders at 44px and the Manual/board hero at 34px on the authoritative screens. All stay DM Sans / 700 / lh~1.1 / $foreground, so one component with a size axis. `--text-display-lg` (2.75rem) may need adding to the 19-step scale.

**Screen usages:** WCTkf specimen 'Field Operations' (32/700) annotated 'display · 32 · DM Sans 700'; NMzE5 Legal desktop H1 'Privacy Policy'/'Terms of Service' at 44px/700; NMzE5 Manual hero 'Task cards' at 34px/700; WCTkf board title at 34px/700; RcvKu showcase 'Type/Display · DM Sans 32/700' specimen

**Reconciliation (screen ← library):** Canonical (X9ejlL) and WCTkf specimen agree exactly (DM Sans 32/700/lh1.1/$foreground/no tracking). WIDENED for two authoritative screen realities beyond the single token: Legal H1 at 44px and Manual/board hero at 34px. Exposed as a `size` prop rather than separate components since family/weight/lh/color are constant. Letter-spacing stays 0.

---

## Type/Title

**Kind:** typography  ·  **maps_to (camp-404):** `--text-title` token (1.625rem/26px, lh1.2) from camp-404 globals.css; consumed as `text-title` on a semantic heading, used inside lifted DetailHeader/SectionHeader.  ·  **maps_to (shadcn):** No shadcn primitive; semantic <h1>/<h2> with `text-title` utility.

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `children` | ReactNode | ✓ |  | Title text (page or mission-detail heading). |
| `as` | 'h1' | 'h2' |  | 'h1' | Semantic level; page & MissionDetailHeader titles are h1. |
| `size` | 'title' | 'title-24' | 'title-compact' |  | 'title' | 26 (desktop) / 24 / 22 (mobile, --text-title-compact). |
| `weight` | '600' | '700' |  | '700' | 700 canonical; Timeline renders 600. |
| `className` | string |  |  | Color override only. |

**Variants:** `title (26px, w700, DM Sans, $foreground, lh1.2)`, `title-600 (25–26px, w600) — Timeline (a3Dgz)`, `title-24 (24px, w700) — Dependencies (b1b079) / Account desktop`, `title-compact (22px, w600/700) — mobile mission-detail / GZ7xA`

**States:** `default (static)`, `truncate (fixed-width header)`

**Tokens:** `$foreground`, `--text-title (26/1.2)`, `--text-title-compact (≈22)`, `--font-dm-sans`, `fontWeight 700/600`

**A11y:** Use as the page/section <h1> (MissionDetailHeader, Settings, Legal, Account, AI-research headers).; Single logical heading order; do not skip levels for visual size.; $foreground on $card/$background passes AAA.; When truncated, expose full text via title/aria-label.

### Type/Title (H1)

**Role:** Page title / mission-detail header heading.

**Canonical token:** DM Sans · 26px · weight 700 · line-height 1.2 · `$foreground` · no tracking (showcase id `IRZCA`, 'Spec · Type/Title (H1)'; WCTkf specimen `title · 26 · DM Sans 700` 'Mission Control'). This is the heading of the canonical `MissionDetailHeader` (batch3 id `lu9U0`).

**Anatomy:** single `text` leaf. `fill=$foreground · DM Sans · 26 · 700 · lh1.2`.

**Variants (UNION):**
| variant | size | weight | where |
|---|---|---|---|
| `title` | 26 | 700 | canonical; MissionDetailHeader (D3JA0i), desktop page titles |
| `title-600` | 25–26 | 600 | Timeline mission title (a3Dgz) |
| `title-24` | 24 | 700 | Dependencies mission title (b1b079); desktop Account title |
| `title-compact` | 22 | 600/700 | mobile mission-detail header; GZ7xA compact task titles |

**States:** default, optional truncate (header beside actions).

**Build:** `<h1>` with `text-title` (desktop) / `text-title-compact` (mobile, `--text-title-compact` ≈22px). Composes into lifted camp-404 `DetailHeader`/`SectionHeader` heading slot. Expose `size`, `weight` (default 700), `as`.

**Reconciliation:** canonical + WCTkf agree at 26/700. Screens diverge on size/weight (Timeline 25/600, Deps 24/700, mobile 22). WIDENED with `size`+`weight` axes; 22px maps to `--text-title-compact`. IMPORTANT: the mission **name** on cards/summary (16–17px w600) is the separate `subtitle` role — do NOT author it as Type/Title.

**Screen usages:** D3JA0i MissionDetailHeader 'AfrikaBurn 2026' 26/700 (canonical lu9U0); a3Dgz mission title 25/600; b1b079 24/700; mobile 22/600-700; NMzE5 page titles 'Account & security' 24/700 desktop, 22/700 mobile; GZ7xA task titles 26/700, 22/700; RcvKu 'Type/Title (H1) · DM Sans 26/700'; WCTkf 'Mission Control' 26/700

**Reconciliation (screen ← library):** Canonical (IRZCA) = DM Sans 26/700/lh1.2; WCTkf agrees. Screens diverge: Timeline 25/600, Deps 24/700, mobile 22/600-700, plus MissionSummaryCard uses 17px (separate `subtitle` role, flagged). WIDENED with size (title/title-24/title-compact) + weight (600/700) axes; 22px = --text-title-compact. Stays one component (DM Sans/$foreground/no tracking). Mission name on cards is NOT Title.

---

## Type/Section

**Kind:** typography  ·  **maps_to (camp-404):** `--text-section` token (1.25rem/20px, lh1.3) from camp-404 globals.css; the heading slot of lifted `SectionHeader` (scaffolding LIFT list).  ·  **maps_to (shadcn):** No shadcn primitive; semantic <h2>/<h3> with `text-section`, typically inside the lifted SectionHeader. LegalSection.Heading (kkQKe) instances this.

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `children` | ReactNode | ✓ |  | Section/subsection heading text. |
| `as` | 'h2' | 'h3' |  | 'h2' | Sub-heading under the page title; nested manual subsections h3. |
| `weight` | '600' | '700' |  | '600' | DEFAULT 600 (foundations specimen + Legal); 700 for canonical/LegalSection. |
| `size` | 'section' | 'section-lg' | 'section-manual' | 'section-compact' |  | 'section' | 20 / 24 / 21-19 / 16px observed. |
| `className` | string |  |  | Color override only. |

**Variants:** `section (20px, w600, DM Sans, $foreground, lh1.3) — DEFAULT`, `section-700 (20px, w700) — canonical def + LegalSection.Heading`, `section-lg (24px, w600) — larger Legal layout`, `section-manual (21px/19px, w700) — Manual sub-headings`, `section-compact (16px, w700) — Account subsection labels`

**States:** `default (static)`, `truncate (optional)`

**Tokens:** `$foreground`, `--text-section (20/1.3)`, `--font-dm-sans`, `fontWeight 600/700`

**A11y:** Render as <h2> (or <h3> nested) to preserve outline under the page <h1>/Title.; Do not use Section purely for visual weight where no semantic section exists.; $foreground passes AAA.

### Type/Section (H2)

**Role:** Section / subsection heading.

**Canonical token vs foundations DRIFT:** showcase component def + 'Spec · Type/Section (H2)' say **DM Sans 20/700** (id `r9iwu`); the authoritative WCTkf foundations specimen renders the scale step at **DM Sans 20/600** ('section · 20 · DM Sans 600', sample 'Active Missions'), and most NMzE5 Legal headings are also w600. Brief §6 sets `--text-section`=1.25rem (20px) as size-only (weight per-component).

**Anatomy:** single `text` leaf. `fill=$foreground · DM Sans · 20 · {600 default | 700} · lh1.3`.

**Variants (UNION):**
| variant | size | weight | where |
|---|---|---|---|
| `section` (default) | 20 | 600 | WCTkf foundations specimen + most Legal headings |
| `section-700` | 20 | 700 | canonical def + LegalSection.Heading (batch3 `kkQKe`) |
| `section-lg` | 24 | 600 | larger Legal layout (NMzE5) |
| `section-manual` | 21/19 | 700 | Manual sub-headings desktop/mobile |
| `section-compact` | 16 | 700 | Account subsection labels ('Account data') |

**Build:** `<h2>`/`<h3>` with `text-section`; the heading slot of lifted camp-404 `SectionHeader`. Default `weight=600`.

**Reconciliation:** DRIFT RESOLVED toward screens — DEFAULT weight set to 600 (foundations + Legal majority); `section-700` retained for the canonical/LegalSection rendering. Size widened to 24 (Legal-lg), 21/19 (Manual), 16 (Account compact — possibly `subtitle`).

**Screen usages:** NMzE5 Legal headings 'Overview'/'Data We Collect' 20/600 (×17) and 24/600 (×17); NMzE5 LegalSection.Heading 'Data retention & deletion' 20/700 (canonical kkQKe); NMzE5 Account 'Account data'/'Mission content' 16/700; Manual 'Anatomy'/'Status cycle' 21/700 desktop, 19/700 mobile; WCTkf specimen 'Active Missions' 20/600 'section · 20 · DM Sans 600'; RcvKu 'Type/Section (H2) · DM Sans 20/700'

**Reconciliation (screen ← library):** DRIFT RESOLVED toward screens: canonical def + RcvKu label say 20/700 but the authoritative WCTkf foundations specimen and most Legal headings render 20/600. Brief §6 treats weight as per-component. DEFAULT weight=600; weight=700 variant kept for canonical/LegalSection. Size axis widened to section-lg (24), section-manual (21/19), section-compact (16, flagged as possibly subtitle).

---

## Type/Lead

**Kind:** typography  ·  **maps_to (camp-404):** `--text-subtitle`/`--text-body-long` neighborhood (16px, lh1.55). No dedicated Lead component; rendered as <p> with muted color.  ·  **maps_to (shadcn):** No shadcn primitive; <p class="text-[1rem] leading-[1.55] text-muted-foreground"> as intro paragraph on Legal/Manual/About.

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `children` | ReactNode | ✓ |  | Lead/intro paragraph text. |
| `as` | 'p' | 'div' |  | 'p' | Block paragraph element. |
| `maxWidth` | number | string |  | 640 | Measure cap; canonical specimen fixes 640px column. |
| `tone` | 'muted' | 'foreground' |  | 'muted' | Default $muted-foreground; foreground for emphasized leads. |
| `size` | 'lead' | 'lead-lg' | 'lead-compact' |  | 'lead' | 16 (canonical) / 18 (desktop Legal) / 13-14 (AI-research). |
| `className` | string |  |  | Override hook. |

**Variants:** `lead (16px, w400, DM Sans, $muted-foreground, lh1.55, maxW640)`, `lead-lg (18px, w400, $muted-foreground) — desktop Legal intro`, `lead-compact (13–14px, w400, $muted-foreground) — AI-research/docs intros`

**States:** `default (wrapping multi-line prose)`

**Tokens:** `$muted-foreground`, `$foreground (tone=foreground)`, `--text-subtitle/16px`, `--font-dm-sans`, `lineHeight 1.55`

**A11y:** Constrained measure (≤640px / ~70ch) for readability.; $muted-foreground (#7a7a8e) on $background ≈5.0:1 — passes AA at 16px; if smaller than 16px ensure ≥4.5:1.; Not a heading; do not use heading tags.

### Type/Lead

**Role:** Leading/intro paragraph — calmer, slightly larger than body, introduces a section.

**Canonical token:** DM Sans · 16px · weight 400 (normal) · line-height 1.55 · `$muted-foreground` · fixed width 640px measure (id `Z1zBb`, 'Type/Lead · DM Sans 16/400 muted').

**Anatomy:** single `text` leaf, `textGrowth=fixed-width`, `width=640`. `fill=$muted-foreground · DM Sans · 16 · normal · lh1.55`.

**Variants (UNION):**
| variant | size | weight | color | where |
|---|---|---|---|---|
| `lead` | 16 | 400 | $muted-foreground | canonical; Manual lead, Legal intro |
| `lead-lg` | 18 | 400 | $muted-foreground | NMzE5 desktop Legal page intro |
| `lead-compact` | 13–14 | 400 | $muted-foreground | AI-research / documentation section intros (GZ7xA, WCTkf) |

**States:** default (wrapping prose).

**Build:** `<p>` with 16px/lh1.55 muted, constrained measure (≤640px / ~70ch). No camp-404 Lead component — `--text-subtitle`-neighborhood scale step. Expose `size`, `tone` ('muted'|'foreground'), `maxWidth` (default 640).

**Reconciliation:** No separate WCTkf 'lead' specimen exists (scale jumps section→subtitle→body); Lead is a brief-§6 + showcase role. WIDENED with `size` (lead/lead-lg/lead-compact) + `tone`: Legal desktop intros render 18px; AI-research/documentation use 13–14px.

**Screen usages:** NMzE5 Legal desktop intros 18/normal $muted-foreground ('OpsBoard turns the chaos…') and 16/normal (×42); NMzE5 Manual article lead 'A task card is the smallest unit…' 16/normal $muted-foreground; GZ7xA section intros 13–14/$muted-foreground; WCTkf board intro prose; RcvKu 'Type/Lead · DM Sans 16/400 muted' width 640 lh1.55

**Reconciliation (screen ← library):** Canonical (Z1zBb) = DM Sans 16/400/lh1.55/$muted-foreground/width640. No separate foundations specimen. WIDENED: Legal desktop renders 18px (lead-lg), AI-research/docs use 13–14px compact leads. Added size + tone axes; maxWidth preserves the 640px measure.

---

## Type/Body

**Kind:** typography  ·  **maps_to (camp-404):** `--text-body` token (0.875rem/14px, lh1.45) — camp-404 DEFAULT body step; brief §6 designates it for task names & notes. Rendered as <p>/<span> with `text-body`.  ·  **maps_to (shadcn):** No shadcn primitive; <p class="text-body text-muted-foreground"> (or $foreground). Used inside lifted Card/Alert/Toast bodies; LegalSection.Body (OGBpt) instances it.

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `children` | ReactNode | ✓ |  | Body / task-name / notes text. |
| `as` | 'p' | 'span' | 'div' |  | 'p' | Block paragraph by default; span for inline task name in a card. |
| `tone` | 'foreground' | 'muted' | 'subtle' | 'destructive' | 'success' | 'primary' |  | 'muted' | Canonical muted; task names $foreground/$muted-foreground; error $destructive; success $success. |
| `weight` | '400' | '500' |  | '400' | 400 prose; 500 for task names (dominant card usage). |
| `size` | 'body' | 'body-sm' | 'body-lg' |  | 'body' | 15 (canonical/long-read) / 13–14 (cards/toasts/dense) / 16 (Manual lead-body). |
| `maxWidth` | number | string |  | 640 | Measure cap for prose; cards pass fill_container. |
| `strikethrough` | boolean |  | false | Line-through for task name in 'closed' window-state card treatment (§9). |
| `className` | string |  |  | Override hook. |

**Variants:** `body (15px, w400, DM Sans, $muted-foreground, lh1.6, maxW640)`, `body-task (14–15px, w500, $foreground) — task name active (dominant)`, `body-task-done (14–15px, w500, $muted-foreground) — task name done`, `body-sm (13px, w400, $foreground) — Toast/Alert/Banner/AINotes summary`, `body-muted-sm (13px, w400, $muted-foreground) — meta/AI descriptions`, `body-strikethrough — task name line-through (closed window-state)`

**States:** `default (wrapping prose)`, `strikethrough (closed window-state)`, `truncate / line-clamp (task names in fixed-height rows)`

**Tokens:** `$foreground`, `$muted-foreground`, `$muted-foreground-subtle`, `$destructive`, `$success`, `$primary`, `--text-body (14) / --text-body-long (15)`, `--font-dm-sans`, `lineHeight 1.45–1.6`

**A11y:** Default $foreground on $card passes AAA; muted prose ≥4.5:1 at ≥14px (AA).; <p> for prose; task-name spans inside a card carry the card's accessible name, not a heading tag.; Strikethrough for 'closed' tasks is redundant with the pill + border (§8) — never the only signal.; Line-clamped task names expose full text via title/aria-label.

### Type/Body

**Role:** DEFAULT body copy AND task names/notes — the densest text role in the app.

**Canonical token vs foundations:** showcase def = DM Sans **15**/400/lh1.6/$muted-foreground/width640 (id `shzZl`); WCTkf foundations specimen documents the step as **14**/400 ('body · 14 · DM Sans 400 · tasks / notes'); brief §6 sets `--text-body`=14 default, `--text-body-long`=15.

**Anatomy:** single `text` leaf, `textGrowth=fixed-width`, `width=640` (prose) or fill_container (cards).

**Variants (UNION — consolidates ~10 screen renderings):**
| variant | size | weight | color | where |
|---|---|---|---|---|
| `body` | 15 | 400 | $muted-foreground | canonical long-read prose |
| `body-task` | 14–15 | **500** | $foreground | **task name (active) — dominant card usage every view** |
| `body-task-done` | 14–15 | 500 | $muted-foreground | task name (done/de-emphasized) |
| `body-sm` | 13 | 400 | $foreground | Toast.Text, Alert.Body, ComeBackLaterBanner, AINotesBlock summary |
| `body-muted-sm` | 13 | 400 | $muted-foreground | meta/AI-research descriptions |
| `body-strikethrough` | 14–15 | 500 | $muted-foreground | task name line-through ('closed' window-state, §9) |

**States:** default (wrapping), strikethrough ('closed' task), truncate/line-clamp (fixed-height rows).

**Build:** `<p>` prose / `<span>` task name with `text-body`. Composes into lifted Card/Alert/Toast bodies and LegalSection.Body (batch3 `OGBpt`). Expose `weight` (400/500), `tone` (6 colors), `size` (body/body-sm/body-lg), `strikethrough`, `maxWidth`.

**Reconciliation:** dominant real usage is the **task name at 14–15px weight 500 in $foreground** (or muted when done) — not 400 muted. Body becomes the shared role for prose AND task names via weight/tone/size axes + a `strikethrough` boolean for the closed window-state card treatment.

**Screen usages:** ALL boards — task names DM Sans 14–15/500 $foreground/$muted-foreground (densest usage); NMzE5 Legal long-form 14/normal $foreground (×73), 15/normal $muted-foreground (×25), 13/normal (×24); Toast.Text (ZWDOu) 13/normal $foreground; Alert.Body (QTfzL) 13; AINotesBlock.Summary 14/500 lh1.5; ComeBackLaterBanner 13; GZ7xA descriptions 13/$muted-foreground (×20), values 14/$foreground (×13); RcvKu 'Type/Body · DM Sans 15/400 muted'; WCTkf 'body · 14 · DM Sans 400 · tasks / notes'

**Reconciliation (screen ← library):** Canonical (shzZl)=15/400/lh1.6/muted; WCTkf documents 14/400; brief sets --text-body=14 default, --text-body-long=15. Dominant real usage is the task name at 14–15/500 $foreground — NOT 400 muted. Body unifies prose + task names via weight (400/500), tone (6 colors), size (body/body-sm/body-lg) + strikethrough boolean (closed window-state §9). 13px small body covers Toast/Alert/Banner. Consolidates ~10 renderings into one component.

---

## Type/Caption

**Kind:** typography  ·  **maps_to (camp-404):** `--text-caption` token (0.75rem/12px, lh1.4). Brief §6 maps stat labels & meta to caption in $muted-foreground-subtle. Rendered as muted <span>/<small> with `text-caption`.  ·  **maps_to (shadcn):** No shadcn primitive; <span class="text-caption text-muted-foreground">. Appears as meta lines in lifted Card/Toast.

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `children` | ReactNode | ✓ |  | Caption / meta / helper text. |
| `as` | 'span' | 'p' | 'small' |  | 'span' | Inline/meta element. |
| `tone` | 'subtle' | 'muted' | 'destructive' |  | 'muted' | DEFAULT $muted-foreground (foundations + screens); subtle=$muted-foreground-subtle (canonical def); destructive for inline form errors. |
| `size` | 'caption' | 'caption-subtle' | 'caption-sm' |  | 'caption' | 12 (foundations) / 13 (canonical def) / 11 (mobile dep hints). |
| `className` | string |  |  | Override hook. |

**Variants:** `caption (12px, w400, DM Sans, $muted-foreground, lh1.4) — DEFAULT`, `caption-subtle (13px, w400, $muted-foreground-subtle) — canonical-def rendering`, `caption-sm (11px, w400, $muted-foreground) — mobile dependency hints`, `caption-error (12px, w400, $destructive) — inline form error caption`

**States:** `default (static meta)`

**Tokens:** `$muted-foreground`, `$muted-foreground-subtle`, `$destructive`, `--text-caption (12/1.4)`, `--font-dm-sans`

**A11y:** Keep ≥12px; muted tones must meet ≥4.5:1 or be treated as non-essential decorative meta.; $muted-foreground-subtle (#4a4a5e) on $background ≈2.4:1 FAILS AA — restrict subtle tone to non-essential decorative meta.; Inline error captions (destructive) must be associated with the field via aria-describedby.; Not a heading.

### Type/Caption

**Role:** Caption / meta / helper text (DM Sans). The smallest DM Sans text.

**Canonical vs foundations DRIFT:** showcase def = DM Sans **13**/normal/`$muted-foreground-subtle` (id `qcfai`, 'Type/Caption · DM Sans 13 subtle'); the authoritative WCTkf foundations specimen renders **12**px/`$muted-foreground` ('caption · 12 · DM Sans 400', sample 'Updated 4m ago'); most NMzE5 meta are 12/$muted-foreground.

**Anatomy:** single `text` leaf. `fill={muted default | subtle} · DM Sans · {12 default | 13} · normal · lh1.4`.

**Variants (UNION):**
| variant | size | color | where |
|---|---|---|---|
| `caption` (default) | 12 | $muted-foreground | WCTkf foundations + Settings/Legal meta |
| `caption-subtle` | 13 | $muted-foreground-subtle | canonical def / faint meta |
| `caption-sm` | 11 | $muted-foreground | mobile dependency-hint sub-text (h9YSWg) |
| `caption-error` | 12 | $destructive | inline form error caption (NMzE5) |

**States:** default (static meta).

**Build:** `<span>`/`<small>` with `text-caption`. Expose `tone` ('muted'|'subtle'|'destructive'), `size`, `as`.

**Reconciliation:** DRIFT RESOLVED toward screens — DEFAULT 12px/$muted-foreground; `caption-subtle` (13/$muted-foreground-subtle) kept as canonical-def variant. Added caption-sm (11, mobile dep hints) + caption-error (destructive form errors). NOTE: mono meta like Toast.Meta 'AUTO-DISMISS · 4S' is Label/Mono (mono-caption), NOT this DM Sans caption — kept distinct.

**Screen usages:** WCTkf specimen 'Updated 4m ago' 12/normal $muted-foreground 'caption · 12 · DM Sans 400'; NMzE5 Settings/Legal row descriptions 12/normal $muted-foreground (×32), 13/normal ('Need help? Contact', 'Search the manual…'); h9YSWg dependency-hint sub-text 'ticket confirmation email' 11/normal $muted-foreground; GZ7xA 'Findings will be appended…' 12/$muted-foreground; RcvKu 'Type/Caption · DM Sans 13 subtle'

**Reconciliation (screen ← library):** DRIFT RESOLVED toward screens: canonical def=13/subtle but the authoritative WCTkf foundations specimen and most Settings/Legal meta render 12/$muted-foreground. DEFAULT 12/muted; caption-subtle (13/subtle) kept as canonical variant. Added caption-sm (11) + caption-error (destructive). Mono meta lines belong to Label/Mono, kept distinct. Flagged: subtle tone fails AA — decorative meta only.

---

## Label/Eyebrow

**Kind:** typography  ·  **maps_to (camp-404):** `--text-eyebrow` token (0.6875rem/11px, ls0.125em≈2px), JetBrains Mono, uppercase. Brief §6 maps section/group/sidebar labels to it. The SectionHeader eyebrow slot; also feeds the separate `Eyebrow` atom component.  ·  **maps_to (shadcn):** No shadcn primitive; <span class="text-eyebrow uppercase tracking-[0.125em] font-mono">. Consumed by lifted SectionHeader, new Sidebar 'MISSIONS', ViewTabs, CategoryGroupHeader.

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `children` | ReactNode | ✓ |  | Eyebrow text; rendered UPPERCASE via text-transform. |
| `as` | 'span' | 'p' | 'h2' |  | 'span' | Span; <h2> when it functions as a real section heading ('MISSIONS'). |
| `tone` | 'primary' | 'muted' | 'subtle' | 'foreground' | 'destructive' | 'warning' | 'success' | 'info' | 'cat-medical' | 'cat-bureaucratic' | 'cat-travel' | 'cat-gear' | 'cat-tech' |  | 'primary' | Full color overload set: category tints, danger destructive, AI states warning, sidebar subtle. |
| `weight` | '600' | '700' | 'normal' |  | '700' | 700 canonical/showcase; 600 foundations; normal for some sidebar/Timeline labels. |
| `size` | 'eyebrow-xs' | 'eyebrow' | 'eyebrow-lg' |  | 'eyebrow' | 10 / 11-12 / 13-18px. |
| `tracking` | number | string |  | 2 | Letter-spacing px (0.125em). Screens use 1/1.5/2/3/4 scaled with size. |
| `className` | string |  |  | Override hook. |

**Variants:** `eyebrow (11px, w700, JetBrains Mono, $primary, ls2, uppercase) — canonical`, `eyebrow-600 (11px, w600, $foreground, ls2) — WCTkf 'CATEGORY'`, `eyebrow-muted / -subtle (11–12px, $muted-foreground / -subtle, ls1.5–2) — section/group/sidebar`, `eyebrow-category (12px, w700, ls1.5, cat-*) — CategoryGroupHeader`, `eyebrow-tab-active / -inactive (12px, w700, ls1.5, $primary / $muted-foreground) — ViewTabs`, `eyebrow-warning (10–12px, $warning) — AI-research states`, `eyebrow-destructive (12px, $destructive) — DANGER ZONE / ACCESS DENIED`, `eyebrow-xs (10px) — compact state/pill eyebrows`, `eyebrow-lg (13–18px, ls2–3) — WCTkf section/group headers`

**States:** `default (static)`, `active vs inactive (ViewTabs: $primary / $muted-foreground)`

**Tokens:** `$primary`, `$muted-foreground`, `$muted-foreground-subtle`, `$foreground`, `$destructive`, `$warning`, `$success`, `$info`, `$cat-medical`, `$cat-bureaucratic`, `$cat-travel`, `$cat-gear`, `$cat-tech`, `--text-eyebrow (11, ls0.125em)`, `--font-jetbrains-mono`, `fontWeight 700`

**A11y:** When an eyebrow functions as a section heading ('MISSIONS', section eyebrows), give it heading semantics or pair with the visible heading; decorative eyebrows stay spans.; Use text-transform:uppercase (not uppercased source) so the accessible name stays natural-cased.; Category-tinted eyebrows always pair with a category icon + label (redundant channel §4/§8); color is never the only signal.; Subtle tone ($muted-foreground-subtle) fails AA — decorative/secondary labels only.

### Label/Eyebrow

**Role:** Uppercase tracked mono micro-label — section/group/sidebar headers, tab labels, category group headers, state eyebrows.

**Canonical token vs DRIFT:** type token (id `N8Xfr2`, 'Label/Eyebrow · JetBrains Mono 11/700 +2') = JetBrains Mono · 11px · weight **700** · letter-spacing **2 (0.125em)** · `$primary` · uppercase. WCTkf foundations specimen = **600**/2px ('eyebrow · 11 · JetBrains Mono 600 · 2px tracking'). The separate standalone `Eyebrow` atom is authored at **ls 1.5** — a tracking mismatch the triage (cl-eyebrow) explicitly flags. There is ALSO a non-typography `Eyebrow` atom component that consumes this token.

**Anatomy:** single `text` leaf. `fill=$primary · JetBrains Mono · 11 · 700 · letterSpacing=2 · uppercase`.

**Variants (UNION across screens):**
| variant | size | weight | tracking | color | where |
|---|---|---|---|---|---|
| `eyebrow` (default) | 11 | 700 | 2 | $primary | canonical/showcase |
| `eyebrow-600` | 11 | 600 | 2 | $foreground | WCTkf specimen 'CATEGORY' |
| `eyebrow-muted`/`-subtle` | 11–12 | 700/normal | 1.5–2 | $muted-foreground / -subtle | 'MISSIONS', 'ACCOUNT MANAGEMENT' |
| `eyebrow-category` | 12 | 700 | 1.5 | cat-medical/bureaucratic/travel/gear/tech | CategoryGroupHeader |
| `eyebrow-tab-active`/`-inactive` | 12 | 700 | 1.5 | $primary / $muted-foreground | ViewTabs |
| `eyebrow-warning` | 10–12 | 700 | 1.5 | $warning | AI-research states |
| `eyebrow-destructive` | 12 | 700 | 1–2 | $destructive | 'DANGER ZONE'/'ACCESS DENIED' |
| `eyebrow-xs` | 10 | 700 | 1.5 | (tone) | compact pill/state eyebrows |
| `eyebrow-lg` | 13–18 | 700 | 2–3 | (tone) | WCTkf section/group headers, 'SYSTEM STATES' |

**States:** default; active vs inactive (ViewTabs, color-driven).

**Build:** `<span class="text-eyebrow uppercase tracking-[0.125em] font-mono">` (use `text-transform:uppercase`, not uppercased source). Consumed by lifted SectionHeader, Sidebar 'MISSIONS', ViewTabs, CategoryGroupHeader. Expose `tone` (14 colors), `weight` (600/700/normal), `size` (xs/eyebrow/lg), `tracking` (default 2).

**Reconciliation:** DOCUMENTED DRIFT — canonical/RcvKu say 11/700/ls2/$primary; WCTkf says 600; standalone Eyebrow atom uses ls1.5. Screens use a far wider tone+size+tracking range than $primary. WIDENED into a multi-axis component; default kept at 11/700/$primary/ls2. Recommend normalizing the Eyebrow atom's tracking to 2 to resolve the 1.5-vs-2 drift.

**Screen usages:** D3JA0i/a3Dgz/b1b079 — Sidebar 'MISSIONS' (11 w700/normal ls2/1.5 subtle); ViewTabs 'BY CATEGORY'/'TIMELINE'/'DEPENDENCIES' (12 w700 ls1.5, primary active/muted inactive); CategoryGroupHeader 'MEDICAL' etc (12 w700 ls1.5 cat-colored); TvXzz — 'EMPTY'/'LOADING'/'ERROR' (11 w700 ls2 subtle), 'SYSTEM STATES' (13 w700 ls2 primary); NMzE5 — '§01', 'VOICE RECORDINGS & TRANSCRIPTS' (12 w700 ls1), group eyebrows 'ACCOUNT MANAGEMENT' (12 w700 ls2 subtle), 'CORE CONCEPTS / 03' (primary), 'DANGER ZONE' (destructive); GZ7xA — 'AGENT UNDERSTANDS' (10 ls1.5 primary), 'DISAMBIGUATION'/'NEEDS CONFIRMATION' (12 ls1.5 warning), 'SOURCES' (11 ls2 subtle), 'TASK AGENT' (12 ls2 primary); WCTkf — 'FOUNDATIONS'/'MOBILE KIT' (18 ls2), 'TYPE SCALE' (13 ls2), 'CATEGORY' (11 w600 ls2); RcvKu 'Label/Eyebrow · 11/700 +2' + 'Spec — Eyebrow' showing 3 tone overloads (muted/foreground/primary)

**Reconciliation (screen ← library):** DOCUMENTED DRIFT (triage cl-eyebrow): canonical token + RcvKu label = 11/700/ls2/$primary; WCTkf foundations = 600/2px; the standalone Eyebrow atom uses ls1.5 (flagged mismatch). Screens use a much wider tone+size+tracking range. WIDENED into multi-axis: tone (14 colors), weight (600/700/normal), size (xs/eyebrow/lg), tracking (default 2). Default kept at canonical 11/700/$primary/ls2. The visual Eyebrow atom should consume this token; recommend normalizing its tracking to 2.

---

## Label/Mono

**Kind:** typography  ·  **maps_to (camp-404):** `--text-mono` token (0.8125rem/13px, lh1.5), JetBrains Mono. Brief §6 maps data rows/counts/countdown/stat values to --text-mono and tags/dep hints/captions to --text-mono-caption (12). Rendered as mono <span> (data/console rows).  ·  **maps_to (shadcn):** No shadcn primitive; <span class="font-mono text-mono">. Wrapped by StatTile values, TARGET lines, countdown timers, T-minus dep captions, source domains, citation chips, window-state pill text.

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `children` | ReactNode | ✓ |  | Mono data / count / countdown / code / domain / citation text. |
| `as` | 'span' | 'time' | 'code' | 'p' |  | 'span' | <time> for dates/countdowns, <code> for code-callout lines, span otherwise. |
| `tone` | 'foreground' | 'muted' | 'subtle' | 'primary' | 'success' | 'warning' | 'destructive' | 'info' | 'primary-foreground' | 'cat-*' |  | 'foreground' | Full overload: StatTile values colored by window-state; dep captions subtle; counts/targets muted; citations/scope primary; match% success/warning/muted; code result lines success. |
| `weight` | 'normal' | '500' | '600' | '700' |  | '500' | 500 data; 600 emphasized (domains, dep steps); 700 StatTile values/timers/codes; normal for log lines. |
| `size` | 'mono' | 'mono-caption' | 'mono-data-sm' | 'mono-stat' | 'mono-display' |  | 'mono' | 13 (data) / 12 (caption) / 10-11 (T-minus/dates/logs/citations) / 20-22 (StatTile) / 30 (elapsed timer). |
| `tracking` | number | string |  | 0.5 | Letter-spacing px; counts often 0–1, TARGET lines 1, nil for tabular figures. |
| `tabularNums` | boolean |  | true | Tabular/lining figures so digits don't jitter on mm:ss / T-Nd / x/y updates. |
| `className` | string |  |  | Override hook. |

**Variants:** `mono (13px, w500, JetBrains Mono, $foreground, ls0.5, lh1.5) — canonical`, `mono-caption (12px, w500, $muted-foreground) — tags/dep hints/field captions`, `mono-data-sm (10–11px, w normal/500/600) — T-minus chips, dates, log lines, citations`, `mono-target (11px, w500, ls1, $muted-foreground) — MissionSummary TARGET line`, `mono-timer (13px, w600/700, ls1, tabular) — RecordingPanel/job timers`, `mono-stat (20–22px, w700, colored by window-state) — StatTile values`, `mono-display (30px, w700, ls1) — large AI-research elapsed timer`, `mono-domain (12px, w600, $muted-foreground) — SourceRow domain`, `mono-citation (10px, w600, $primary) — CitationChip '[1]'`, `mono-match (14–16px, w700, success/warning/muted) — confidence %`, `mono-code (12.5px, w500/600) — CodeCallout lines`

**States:** `default (static data)`, `value-update (timers/counts re-render in place; tabularNums stabilizes width)`

**Tokens:** `$foreground`, `$muted-foreground`, `$muted-foreground-subtle`, `$primary`, `$primary-foreground`, `$success`, `$warning`, `$destructive`, `$info`, `$cat-medical`, `$cat-bureaucratic`, `$cat-travel`, `$cat-gear`, `$cat-tech`, `--text-mono (13/1.5)`, `--text-mono-caption (12/1.4)`, `--font-jetbrains-mono`, `fontWeight 500`

**A11y:** Live-updating values (mm:ss timers, countdowns, recording duration) belong in aria-live=polite (or off if redundant with a status pill); the recording timer pairs with a status label.; Use semantic <time datetime> for dates/countdowns and <code> for code-callout lines.; Color-coded StatTile values & match% always pair with a text label (DONE/BLOCKED/CLOSING, 'MATCH') — color is never the sole channel (§8).; Tabular figures prevent layout shift on counts/timers.; Subtle tone fails AA — non-essential meta only (dep-hint captions pair with the ⚠ icon + dependency name as the real signal).

### Label/Mono

**Role:** Mono data text — counts, countdowns/timers, T-minus & date meta, stat-tile values, source domains, citations, code, dependency captions. Carries most of the OpsBoard chrome.

**Canonical token:** JetBrains Mono · 13px · weight 500 · letter-spacing 0.5 · line-height 1.5 · `$foreground` (id `El0g7`, 'Label/Mono · JetBrains Mono 13/500 data'; WCTkf agrees: 'mono · 13 · JetBrains Mono 500 · data / counts'). Brief §6 splits the scale into `--text-mono` (13, data/counts/countdown/stat values) + `--text-mono-caption` (12, tags/dep hints/captions).

**Anatomy:** single `text` leaf. `fill=$foreground · JetBrains Mono · 13 · 500 · letterSpacing=0.5 · lh1.5`.

**Variants (UNION — unifies the two mono scale steps under one role):**
| variant | size | weight | color | where |
|---|---|---|---|---|
| `mono` (default) | 13 | 500 | $foreground | canonical data/count |
| `mono-caption` | 12 | 500 | $muted-foreground | tags / dep hints / field captions (--text-mono-caption) |
| `mono-data-sm` | 10–11 | normal/500/600 | (tone) | T-minus chips, dates, log lines, citations '[1]' |
| `mono-target` | 11 | 500 | $muted-foreground (ls1) | MissionSummary 'TARGET: …' |
| `mono-timer` | 13 | 600/700 | (ls1, tabular) | RecordingPanel/job timers '00:07','00:42' |
| `mono-stat` | 20–22 | 700 | success/destructive/warning/foreground | StatTile values (colored by window-state) |
| `mono-display` | 30 | 700 | $foreground (ls1) | large AI-research elapsed timer |
| `mono-domain` | 12 | 600 | $muted-foreground | SourceRow domain |
| `mono-citation` | 10 | 600 | $primary | CitationChip '[1]' |
| `mono-match` | 14–16 | 700 | success/warning/muted | confidence '92%'/'64%'/'41%' |
| `mono-code` | 12.5 | 500/600 | foreground/success/subtle | CodeCallout lines |

**States:** default; value-update (timers/counts re-render in place — tabularNums keeps width stable).

**Build:** `<span>` / `<time datetime>` (dates, countdowns) / `<code>` (callouts) with `font-mono text-mono`. This is the leaf wrapped by WindowStatePill, CitationChip, SourceRow, StatTile, RecordingPanel timer. Expose `tone` (14 colors), `weight` (normal–700), `size` (mono/mono-caption/mono-data/mono-stat/mono-display), `tracking` (default 0.5), `tabularNums` (default true).

**Reconciliation:** canonical + WCTkf agree (13/500). Brief splits into --text-mono + --text-mono-caption but screens treat them as one mono role, so UNIFIED under a `size` axis. Screens vastly widen tone (14 colors incl. window-state coloring of StatTile values), weight (StatTile/timers at 700), and size (10px log lines → 30px elapsed timer). Added `tabularNums` so timers/counts/countdowns don't jitter.

**Screen usages:** EVERY board — countdowns/timers ('00:07' 13/600, '00:42' 13/30 700, 'T-02:14:33' 13/500), counts ('3/11 tasks' 12, StatTile 20–22/700 colored by state), TARGET lines ('TARGET: 2026-04-27' 11/500 ls1 muted); D3JA0i/a3Dgz/b1b079 — dep captions '⚠ blocked by: …' (10–12 normal ls0.3-0.5 subtle), date meta '15 Mar','T-3d','T-12d'; GZ7xA — domains 'tankwatown.org' (12/600 muted), citation '[1]' (10/600 primary), match '92%' (16/700 success), IntentRow keys (11 ls1.5 muted); NMzE5 — version/build strings (11/500 foreground), error-log lines 'at VoicePipeline.transcribe…' (11/normal muted), code-callout (12.5/500-600), 'mono · data · 2026-06-03'; WCTkf — 'T-02:14:33' 13/500 'mono · 13 · JetBrains Mono 500 · data/counts', '#travel #docs' 12/500 'mono-caption'; RcvKu 'Label/Mono · 13/500 data'

**Reconciliation (screen ← library):** Canonical (El0g7) = JetBrains Mono 13/500/ls0.5/$foreground/lh1.5; WCTkf agrees. Brief splits into --text-mono (13) + --text-mono-caption (12) but screens treat them as one mono role, so UNIFIED under a size axis (mono/mono-caption/mono-data-sm/mono-stat/mono-display) rather than two components. Screens widen tone (14 colors incl. window-state coloring of StatTile values), weight (StatTile/timers 700; StatTile is the dominant large-mono usage 20–30px), size (10px logs → 30px timer). Added tabularNums (default true). Window-state pill text, CitationChip, SourceRow domain, StatTile COMPOSE this leaf — it has no build_order_deps but is a dependency of many molecules.

---
