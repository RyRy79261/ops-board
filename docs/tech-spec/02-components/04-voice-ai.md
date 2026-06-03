# Components — Voice & AI

*17 contracts. Screens authoritative; library reconciled toward screen usage.*

## VoiceFAB

**Kind:** organism  ·  **maps_to (camp-404):** ADAPT `apps/web/components/voice/dictate-button.tsx` → `packages/ui/src/components/voice/voice-fab.tsx`; the inner press button is REF-extracted from `control-panel.tsx` CentreButton (~L193-212). Composes camp's `use-voice-recorder.ts` + `waveform.tsx`.  ·  **maps_to (shadcn):** shadcn Button (`variant="default"`/`size="icon"`, circular via `rounded-full`), fixed-position wrapper. Design-brief §14: "Voice FAB → extracted from Camp's push-to-talk centre button, made fixed-position."
  ·  **composes:** Waveform (sibling, recording state), Spinner (loader glyph reuse), RecordingPanel (the recording surface it triggers)

**Anatomy:** frame[96×96, layout:none] (canonical id F36g7L) → { Pulse Ring (ellipse 96×96, stroke `#ff6b3559`=primary/35, strokeWidth 2; animated pulse) + Button (frame 72×72 @x12,y12, fill $primary, cornerRadius 36, center) → Mic (lucide `mic`, 28×28, fill $primary-foreground) }. On screen T2BChB each state is a flattened cell sharing this 96-ring/72-button geometry; on screen GZ7xA the idle FAB Mic renders 30px (2px larger than canonical 28).

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `state` | 'idle' | 'requesting' | 'recording' | 'processing' | 'error' | ✓ | 'idle' | Drives glyph, button fill, ring, and hint. 'requesting' is documented in brief §11/§12 but NOT drawn on any board — include for completeness. |
| `elapsedMs` | number |  |  | When recording, feeds the sibling mm:ss timer (shown in RecordingPanel/cell Meta, not on the FAB glyph itself). |
| `onPress / onPointerDown / onPointerUp / onPointerLeave / onPointerCancel` | () => void | ✓ |  | Push-to-talk or tap-to-toggle. On transcript completion, POST to `/api/voice/command` — NEVER append text to a field (brief §11). |
| `hint` | string |  |  | Caption shown beneath in showcase/mobile (e.g. 'TAP TO RECORD'). Optional in fixed-position product use. |
| `className` | string |  |  | For fixed positioning: bottom-right both desktop & mobile (brief §11.1), z-150, `padding-bottom: env(safe-area-inset-bottom)` on mobile. |
| `aria-label` | string | ✓ | 'Voice command' | State-appropriate label; error state adds `role="alert"`. |

**Variants:** `idle: 72px button fill $primary, lucide `mic` 28px (board idle uses 30px), Pulse Ring visible static, hint 'TAP TO RECORD' ($muted-foreground)`, `requesting (DOCUMENTED-but-MISSING on boards): button $primary, spinner glyph, hint 'Allow microphone…' — synthesize from brief §11`, `recording: button fill $destructive, lucide `square` glyph, Pulse Ring stroke $destructive (animated), hint '● TAP TO STOP' ($destructive); pairs with live waveform + mm:ss in RecordingPanel`, `processing: button fill $muted + 1px $border ring (Pulse Ring hidden/`enabled:false`), lucide `loader-circle` (spinning), hint 'TRANSCRIBING…' ($muted-foreground)`, `error: button fill $muted + stroke $destructive, lucide `triangle-alert` 28px, a 2px $destructive underline bar below the button, hint 'TAP TO RETRY' ($destructive)`

**States:** `idle`, `requesting`, `recording`, `processing`, `error/retry`, `hover (idle → border/ring brighten)`, `focus-visible (ring $ring)`

**Tokens:** `$primary`, `$primary-foreground`, `$destructive`, `$destructive-foreground`, `$muted`, `$border`, `#ff6b3559 (=primary/35, pulse ring)`, `$muted-foreground`

**A11y:** `aria-label` reflects state ('Tap to record' / 'Recording, tap to stop' / 'Transcribing' / 'Microphone error, tap to retry'); error state: `role="alert"`; pulse ring + waveform are decorative → `aria-hidden`; 44×44 minimum hit target satisfied (72px button); keyboard: Space/Enter toggles; do not rely on pointer-only for push-to-talk fallback; respect `prefers-reduced-motion` for pulse ring + spinner

## VoiceFAB

**Kind:** organism · **Canonical id:** `F36g7L` · **shadcn:** Button (`variant=default`, `size=icon`, `rounded-full`) · **camp-404:** ADAPT `dictate-button.tsx` → `voice-fab.tsx`, REF CentreButton from `control-panel.tsx`.

The single voice input affordance — the entry point to the whole command pipeline. Fixed bottom-right on **both** desktop and mobile (brief §11.1), z-150, raised above the toaster.

### Anatomy (canonical)
```
frame 96×96 (layout:none)
├─ Pulse Ring   ellipse 96×96, stroke #ff6b3559 (primary/35), 2px   [animated, aria-hidden]
└─ Button       frame 72×72 @(12,12), fill $primary, cornerRadius 36, center
   └─ Mic       lucide `mic` 28px (board idle: 30px), fill $primary-foreground
```

### State matrix (UNION across T2BChB cells + showcase + brief)
| state | button fill | glyph | ring | hint |
|---|---|---|---|---|
| **idle** | $primary | `mic` (28/30px) | $primary, static | `TAP TO RECORD` ($muted-foreground) |
| **requesting** *(brief-only, no board art)* | $primary | spinner | — | `Allow microphone…` |
| **recording** | $destructive | `square` | $destructive, animated | `● TAP TO STOP` ($destructive) |
| **processing** | $muted + 1px $border | `loader-circle` (spin) | hidden | `TRANSCRIBING…` |
| **error** | $muted + stroke $destructive | `triangle-alert` | — + 2px $destructive underline bar | `TAP TO RETRY` ($destructive) |

### Props
`state` (req), `elapsedMs?`, `onPointerDown/Up/Leave/Cancel` + `onPress`, `hint?`, `className?` (fixed positioning), `aria-label` (req).

### Data / interaction contract
Push-to-talk (`onPointerDown`→record, `onPointerUp/Leave/Cancel`→stop) OR tap-to-toggle. On transcript → **POST to the command endpoint**; never write into an input. error → `role="alert"`.

### Reconciliation
Canonical is idle-only; **screens win** → widened to a 5-value `state` prop. Recording waveform+timer live in `RecordingPanel`. `requesting` synthesized from brief. Idle Mic size: screens render 30px → default 30 (token-driven, 28 acceptable). Error underline + triangle-alert glyph are screen-only additions.

### a11y
State-reflecting `aria-label`; `role="alert"` on error; decorative ring/waveform `aria-hidden`; ≥44px target (72px); honor `prefers-reduced-motion`.

**Screen usages:** T2BChB §01 'Voice FAB' — 4 state cells (idle/recording/processing/error) laid out as a documentation row; each is a flattened bespoke tree, none refs canonical F36g7L; RcvKu showcase 'Spec · VoiceFAB' — 3 cells (IDLE·MIC / RECORDING·SQUARE / PROCESSING·LOADER) as refs to F36g7L with descendant overrides; GZ7xA — the persistent voice entry; brief §11 fixes it bottom-right; mobile screens dock it bottom-right too

**Reconciliation (screen ← library):** Canonical F36g7L is IDLE-ONLY (single tree). The SCREENS (authoritative) render 4–5 distinct states, so the contract is WIDENED to a `state` prop driving glyph/fill/ring/hint per the union above. The 'recording' inline waveform + mm:ss live in RecordingPanel (or a compact inline cell), not on the FAB face. 'requesting' has no board art — included from brief §11/§12 as the documented gap. Resolve the 2px idle Mic size drift IN FAVOUR OF THE SCREEN (30px) per source-of-truth rule, OR keep 28 and treat 30 as showcase noise — flag: screens win, default 30px idle, but token-driven sizing prop allows either. The error underline bar and `triangle-alert` glyph come only from the screen, not canonical.

---

## RecordingPanel

**Kind:** organism  ·  **maps_to (camp-404):** LIFT `apps/web/components/voice/waveform.tsx` (auto-themes orange) + LIFT `use-voice-recorder.ts` (timer/cleanup/iOS fallback); shell is a shadcn Card.  ·  **maps_to (shadcn):** shadcn Card shell + lucide-driven live Waveform + mono mm:ss. (Showcase caption: 'RecordingPanel · shadcn Card + live waveform + mm:ss'.)
  ·  **composes:** Waveform (camp LIFT), Spinner (parsing chip dot/loader), ScopeChip + ParsedIntentPanel (the surfaces it precedes in the GZ7xA flow)

**Anatomy:** frame[card/border, vertical, gap14, pad16] (id R6D1f3) → { Top (horizontal, space-between, center) → [ Status (gap7, center) → Dot (ellipse 8×8 $destructive) + L (mono 11/700, ls1.5, $destructive, 'RECORDING') ; Timer (mono 13/600, ls1, $foreground, '00:07') ] ; Waveform (frame fill, h40, gap3, center) → 40× Bar (rectangle, w4, fill $primary, heights 8–34 varying) }. On GZ7xA 'Voice Capture' the panel is WIDENED: a $primary 3px left-accent wrapper, VHead (Mic icon + 'VOICE CAPTURE' label + LiveCue {8-bar waveform h24 w3 + REC dot/label + timer}), a 'TRANSCRIPT' eyebrow, the transcript text (JetBrains Mono 16), and a 'PARSING INTENT…' processing chip ($muted, primary dot).

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `state` | 'recording' | 'transcribing' | 'parsing' | ✓ | 'recording' | recording → $destructive dot/'RECORDING'; transcribing → $warning dot/'TRANSCRIBING' (showcase variant); parsing → 'PARSING INTENT…' processing chip (GZ7xA). |
| `elapsedLabel` | string (mm:ss) | ✓ | '00:07' | Mono timer; showcase recording=00:07, transcribing=00:12, GZ7xA=00:09. |
| `amplitudes` | number[] |  |  | Live bar heights for the Waveform (canonical 40 bars @4px; GZ7xA inline 8 bars @3px h24). |
| `transcript` | string |  |  | GZ7xA-only: the live transcript text (JetBrains Mono 16) shown under a 'TRANSCRIPT' eyebrow. |
| `showTranscript` | boolean |  | false | Toggles the transcript + processing-chip block (the screen Voice Capture variant). |

**Variants:** `recording (canonical): $destructive dot + 'RECORDING' label, $primary 40-bar waveform`, `transcribing (showcase ref AHaAj): dot+label recolored $warning, label 'TRANSCRIBING', timer 00:12`, `Voice Capture (GZ7xA): + left $primary 3px accent, header Mic+'VOICE CAPTURE', inline 8-bar waveform, 'TRANSCRIPT' eyebrow + JetBrains Mono 16 transcript, 'PARSING INTENT…' chip ($muted, $primary dot, mono 11 ls1.5)`

**States:** `recording (active capture)`, `transcribing`, `parsing-intent (post-capture, screen variant)`

**Tokens:** `$card`, `$border`, `$destructive`, `$warning`, `$foreground`, `$primary`, `$muted`, `$muted-foreground`

**A11y:** live region: announce timer + state via `role="status"` / `aria-live="polite"`; waveform bars decorative → `aria-hidden`; transcript text readable by SR if present; do not flash >3Hz; respect `prefers-reduced-motion` for bar animation

## RecordingPanel

**Kind:** organism · **Canonical id:** `R6D1f3` · **shadcn:** Card + live Waveform + mono mm:ss · **camp-404:** LIFT `waveform.tsx` + `use-voice-recorder.ts`.

Active voice-capture surface. On the AI-Research screen it is widened to also host the live transcript and the 'parsing intent' cue.

### Anatomy (canonical R6D1f3)
```
Card [vertical, gap14, pad16]
├─ Top [space-between, center]
│  ├─ Status: Dot ellipse 8×8 $destructive + 'RECORDING' (mono 11/700 ls1.5 $destructive)
│  └─ Timer  '00:07' (mono 13/600 ls1 $foreground)
└─ Waveform [fill, h40, gap3] → 40× Bar (rect w4 $primary, heights 8–34)
```

### Screen-widened anatomy (GZ7xA 'Voice Capture')
```
frame [$primary fill, pad-left 3 → left accent]
└─ Inner [Card, pad18, gap12]
   ├─ VHead: Mic + 'VOICE CAPTURE' (mono 12 ls1.5) | LiveCue {8-bar waveform h24 w3 · REC dot+label $destructive · timer}
   ├─ 'TRANSCRIPT' eyebrow (mono 11 ls1.5 $muted-foreground)
   ├─ Transcript (JetBrains Mono 16 $foreground)
   └─ Processing chip [$muted, pad7/11]: $primary dot + 'PARSING INTENT…' (mono 11 ls1.5 $primary)
```

### Variants / states
`recording` (canonical, $destructive) · `transcribing` (showcase ref → $warning, '00:12') · `parsing-intent` (screen 'PARSING INTENT…' chip). Bar count/size data-driven (40@4 default, 8@3 compact).

### Props
`state` (req), `elapsedLabel` (req mm:ss), `amplitudes?`, `transcript?`, `showTranscript?`.

### Reconciliation
Screens win → canonical record-only header is **widened** to combine transcript + parsing cue with a real `border-l-[3px] border-primary`. Replace the 8 hand-placed Bar rects with the camp Waveform.

### a11y
`role="status"`/`aria-live="polite"` for timer+state; waveform `aria-hidden`; respect reduced-motion.

**Screen usages:** GZ7xA §01 'Voice Capture' (id ~V0T0A) — the record+transcript+parsing combined panel with $primary left accent; RcvKu showcase 'Spec · RecordingPanel' — canonical R6D1f3 + 'transcribing' ref (AHaAj); T2BChB recording FAB cell flattens an inline waveform+timer instead of using this panel

**Reconciliation (screen ← library):** Canonical R6D1f3 is record-ONLY (40-bar waveform, status header, timer). The GZ7xA screen (authoritative) CONFLATES record + transcript + intent-parsing into one $primary-left-accent panel with a richer header (Mic + 'VOICE CAPTURE'), an 8-bar (not 40) inline waveform at h24/w3, a transcript paragraph (**JetBrains Mono 16**, lineHeight 1.55, node `d6h84` — the DESKTOP transcript is Mono; the mobile Heard panel `gJENy` uses DM Sans 15), and a 'PARSING INTENT…' processing chip. Contract is WIDENED with `transcript`/`showTranscript`/`parsing` so one component serves both the bare recording header and the screen's combined capture surface. Waveform bar count/size is data-driven (40@4 default; 8@3 compact). The showcase 'transcribing' variant recolors the status to $warning — kept as a state. Triage flags the 8 hand-placed Bar0..Bar7 rects vs a Waveform component and the $primary 3px left-accent-via-padding hack: build with the camp `waveform.tsx` and a real `border-l-[3px]`.

---

## Toast

**Kind:** molecule  ·  **maps_to (camp-404):** ADAPT `packages/ui/src/components/toast.tsx` — extend `ToastRecord` with `actions[]` (currently dismiss-✕ only) per brief §14.  ·  **maps_to (shadcn):** shadcn Sonner / Toast (showcase caption 'Toast · shadcn Sonner / Toast'). Action buttons = shadcn Button.
  ·  **composes:** Button (actions + picks), (disambiguation Toast is the lightweight cousin of DisambiguationPicker)

**Anatomy:** frame[card/border, vertical] (id kTqS3) → { Accent (frame fill, h2, color by variant) + Body (vertical, gap10, pad16) → [ Header (mono 12, ls1, color by variant, e.g. '✓ MARKED DONE') ; Text (DM Sans 13, $foreground, lineHeight 1.4) ; Meta (mono 10, ls1, $muted-foreground-subtle, e.g. 'AUTO-DISMISS · 4S') ] }. The Meta slot is OVERLOADED: in needs-confirmation it becomes an Actions row (Confirm+Cancel buttons); in disambiguation it becomes a Picks list (2–3 tap rows).

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `variant` | 'success' | 'needsConfirmation' | 'disambiguation' | 'info' | 'error' | ✓ |  | Drives accent + header color + dwell + footer. success=$success, needsConfirmation=$warning, disambiguation=$border-hover (neutral), info=$info(orange), error=$destructive. |
| `header` | string | ✓ |  | Mono caps header, e.g. '✓ MARKED DONE' / 'CONFIRM DELETE' / 'WHICH TASK?' / 'CLOSING THIS WEEK' / 'COMMAND FAILED'. |
| `body` | string | ReactNode | ✓ |  | DM Sans body. error body uses $muted-foreground. |
| `meta` | string |  |  | Mono caption footer ('AUTO-DISMISS · 4S' / 'TAP TO DISMISS' / 'ROLE=STATUS · NO BUTTONS'). |
| `actions` | { label, intent: 'confirm'|'cancel', variant }[] |  |  | needsConfirmation: [DELETE (destructive fill), CANCEL (outline)]; padding 8/12, mono 11 ls1. |
| `picks` | { name, code, onPick }[] |  |  | disambiguation: 2–3 rows (name DM/mono + window/category code), each $card-elevated + $border, pad10/12. |
| `durationMs` | number | null |  |  | null = persistent (needsConfirmation). success ~4000–5000, info/query ~8000. |
| `onDismiss / onConfirm / onCancel / onPick` | () => void |  |  | - |

**Variants:** `success — $success accent, '✓ MARKED DONE', auto-dismiss 4S meta`, `needsConfirmation — $warning accent, 'CONFIRM DELETE', persistent, Actions row {DELETE destructive + CANCEL outline}`, `disambiguation — $border-hover accent (neutral), 'WHICH TASK?', Picks list (2–3 tap rows name+code), the lightweight inline picker (vs full DisambiguationPicker panel)`, `info / query-result — $info (orange) accent, 'CLOSING THIS WEEK', role=status, NO buttons, longer dwell`, `error — $destructive accent, 'COMMAND FAILED', body $muted-foreground, 'TAP TO DISMISS' meta, role=alert`

**States:** `entering / visible / exiting (animation)`, `auto-dismiss (success/info) vs persistent (needsConfirmation)`, `hover (pause auto-dismiss)`, `action-pending (after Confirm → re-issue intent → replace with success)`

**Tokens:** `$card`, `$border`, `$success`, `$warning`, `$border-hover`, `$info`, `$destructive`, `$destructive-foreground`, `$foreground`, `$muted-foreground`, `$muted-foreground-subtle`, `$card-elevated`

**A11y:** success/info → `role="status"` `aria-live="polite"`; error → `role="alert"` `aria-live="assertive"`; needsConfirmation is persistent → focus moves to Confirm; Escape = Cancel; picks: each pick is a button, arrow-key navigable; do not auto-dismiss action/confirmation toasts; color never the only channel — header text carries the semantic

## Toast

**Kind:** molecule · **Canonical id:** `kTqS3` · **shadcn:** Sonner/Toast + Button · **camp-404:** ADAPT `toast.tsx` (+`actions[]`).

Transient result/confirmation surface for voice & MCP commands. Bottom-center (mobile) / bottom-right (desktop), above the FAB.

### Anatomy (canonical kTqS3)
```
Card [vertical]
├─ Accent  frame h2, fill = variant color
└─ Body [vertical, gap10, pad16]
   ├─ Header  mono 12 ls1, variant color   ('✓ MARKED DONE')
   ├─ Text    DM Sans 13 $foreground
   └─ Meta    mono 10 ls1 $muted-foreground-subtle ('AUTO-DISMISS · 4S')
```
The **Meta slot is overloaded** by variant → Actions row or Picks list.

### Variant matrix (UNION: T2BChB + showcase + brief §11)
| variant | accent | header | footer | dwell | role |
|---|---|---|---|---|---|
| **success** | $success | `✓ MARKED DONE` | `AUTO-DISMISS · 4S` | ~4s | status |
| **needsConfirmation** | $warning | `CONFIRM DELETE` | Actions: DELETE (destructive) + CANCEL (outline) | persistent | — |
| **disambiguation** | $border-hover | `WHICH TASK?` | Picks (2–3: name+code) | persistent | — |
| **info / query** | $info (orange) | `CLOSING THIS WEEK` | none | ~8s | status |
| **error** | $destructive | `COMMAND FAILED` | `TAP TO DISMISS` | tap | alert |

### Props
`variant` (req), `header` (req), `body` (req), `meta?`, `actions[]?`, `picks[]?`, `durationMs?` (null=persistent), `onDismiss/onConfirm/onCancel/onPick`.

### Interaction
Confirm → re-issue intent `confirmed:true` → execute → replace with success toast. Cancel → dismiss no-op. Pick → re-issue resolved intent.

### Reconciliation
Screens win → canonical action-less toast **widened** with `actions[]`/`picks[]` (overloading the Meta slot). disambiguation accent is **neutral $border-hover**, not brand. Buttons = real shadcn Button.

### a11y
success/info `role=status`/polite; error `role=alert`/assertive; persistent confirm focuses Confirm, Esc=Cancel; never the color alone.

**Screen usages:** T2BChB §02 'Toasts' — 4 cells: SUCCESS / NEEDS CONFIRMATION (DELETE+CANCEL) / DISAMBIGUATION (2 picks: Cardiology MED, Supplier TECH) / ERROR; RcvKu showcase 'Spec · Toast' — success + needs-confirmation (with Actions) + info query-result + error refs; GZ7xA §03 'Success Toast' — 'ADDED 5 NOTES' success variant after research notes appended; brief §11 'Confirmation toast / disambiguation' enumerates exactly these states

**Reconciliation (screen ← library):** Canonical kTqS3 has NO actions/picks — just Accent+Header+Text+Meta. The SCREENS (authoritative) overload the Meta slot: needs-confirmation replaces it with a 2-button Actions row, disambiguation replaces it with a Picks list. Contract is WIDENED with `actions[]` (matches brief §14 'add optional actions[]') and `picks[]`. Variant→accent mapping is union of T2BChB caption-derived colors: success=$success, needs-confirmation=$warning, disambiguation=$border-hover (neutral grey — NOT a brand color), info/query=$info(orange), error=$destructive. Note the info variant overlaps VoiceQueryResultCard (the larger 540px panel is the canonical query surface; the info Toast is the compact form). Buttons must be real shadcn Button (triage flags hand-built frames).

---

## ScopeChip

**Kind:** molecule  ·  **maps_to (camp-404):** No direct camp source — compose from shadcn primitives. Closest verdict: build alongside Badge variants (ADAPT `badge.tsx`).  ·  **maps_to (shadcn):** shadcn Badge-like pill / Alert-inline idiom (left-accent). New molecule (no canonical shadcn 1:1).
  ·  **composes:** (leaf molecule; uses Badge tint idiom but composes no other listed component)

**Anatomy:** CANONICAL (R0QP9O): frame[fill `#ff6b351f`(primary/12), border-LEFT 2px $primary, gap8, pad10/12, center] → { Target (lucide `target` 14×14 $primary) + Label (mono 11/700 ls1 $primary, 'SCOPE · AfrikaBurn 2026') }. SCREEN (GZ7xA, authoritative): frame[fill $card, FULL border 1px $primary, gap10, pad9/14, center] → { Lock (lucide `lock` 14 $primary) + Key (mono 11 ls1.5 $muted-foreground 'SCOPE') + Mid ('·' $muted-foreground-subtle) + Val (mono 12/700 ls1 $foreground 'AFRIKABURN 2026') + Locked Tag [frame $muted, pad3/7 → 'LOCKED' mono 9 ls1.5 $primary] }.

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `mission` | string | ✓ |  | Mission/scope name shown in Val (screen) or after 'SCOPE · ' (canonical). |
| `locked` | boolean |  | true | Screen variant shows a 'LOCKED' tag — voice interpreted strictly within this scope. |
| `variant` | 'screen' | 'compact' |  | 'screen' | screen = $card fill + full $primary border + Lock + KEY/MID/VAL + LOCKED tag (authoritative). compact = mobile reduced (icon+label, no LOCKED tag). |
| `icon` | LucideIcon |  | lock | Screen uses `lock`; canonical showcase used `target`. |

**Variants:** `screen (GZ7xA, AUTHORITATIVE): $card fill, full 1px $primary border, Lock icon, SCOPE key + '·' + mission Val + LOCKED tag`, `compact (mobile): reduced icon + label, no LOCKED tag (triage: 'reduced I+L variant')`, `canonical/showcase (R0QP9O): primary/12 tint fill, left-2px $primary accent, `target` icon, single 'SCOPE · {mission}' label`

**States:** `locked (default — scope enforced)`, `(no interactive states — read-only context indicator)`

**Tokens:** `$card`, `$primary`, `$muted-foreground`, `$muted-foreground-subtle`, `$foreground`, `$muted`, `#ff6b351f (primary/12, canonical only)`

**A11y:** informational landmark; `aria-label="Active scope: {mission} (locked)"`; decorative icons `aria-hidden`; not a button — purely a status indicator

## ScopeChip

**Kind:** molecule · **Canonical id:** `R0QP9O` · **shadcn:** Badge/inline-Alert idiom · **camp-404:** build with Badge variants.

Bound-to-mission scope indicator on the voice/AI surface — everything spoken is interpreted within this taxonomy.

### Anatomy — SCREEN (GZ7xA, AUTHORITATIVE)
```
frame [$card fill, border 1px $primary, gap10, pad 9/14, center]
├─ Lock        lucide `lock` 14 $primary
├─ Key         'SCOPE'        mono 11 ls1.5 $muted-foreground
├─ Mid         '·'            $muted-foreground-subtle
├─ Val         'AFRIKABURN 2026'  mono 12/700 ls1 $foreground
└─ Locked Tag  [$muted pill, pad3/7] → 'LOCKED' mono 9 ls1.5 $primary
```

### Anatomy — canonical/compact (R0QP9O, demoted)
```
frame [fill primary/12, border-left 2px $primary, gap8, pad10/12]
├─ `target` 14 $primary
└─ 'SCOPE · AfrikaBurn 2026'  mono 11/700 ls1 $primary
```

### Variants
`screen` (default, authoritative) · `compact` (mobile, no LOCKED tag) · `canonical` (legacy target+tint).

### Props
`mission` (req), `locked?`=true, `variant?`='screen', `icon?`=`lock`.

### Reconciliation
**Screens win**: default to the $card+full-border+lock+KEY/VAL+LOCKED form; the primary/12+target canonical becomes the `compact`/legacy variant. Lock idiom aligns with brief §9 not_before window state.

### a11y
Read-only; `aria-label="Active scope: {mission} (locked)"`; icons `aria-hidden`.

**Screen usages:** GZ7xA §01 'Mission Scope' — Scope Chip + a hint line 'Everything you say is interpreted within this mission taxonomy.'; GZ7xA mobile 'Scope' — compact variant; RcvKu showcase 'spec/ScopeChip' — canonical R0QP9O (target + primary/12 tint)

**Reconciliation (screen ← library):** Major divergence: canonical R0QP9O uses a **primary/12 fill + left-2px accent + `target` icon + single label**. The SCREEN (authoritative) instead uses a **$card fill + full 1px $primary border + `lock` icon + a 3-part KEY('SCOPE') / MID('·') / VAL(mission) structure + a separate 'LOCKED' tag** ($muted pill, primary text). Per source-of-truth rule the SCREEN WINS → default `variant='screen'` with the lock/locked treatment; the canonical primary/12+target form is demoted to an optional `compact`/legacy variant. The brief §9 also uses `Lock` for the not_before window-state, so the lock idiom is consistent. Triage flags the mobile reduced field set (no LOCKED tag) → covered by `compact`.

---

## IntentRow

**Kind:** molecule  ·  **maps_to (camp-404):** No direct camp source — primitive key/value row built from Type/Label scale.  ·  **maps_to (shadcn):** Plain flex row (Label + content). Composes shadcn Badge / CategoryTag in the value slot on screen.
  ·  **composes:** Badge (pill value), CategoryTag (taskChip dot/category), (consumed by ParsedIntentPanel)

**Anatomy:** CANONICAL (dO0U6): frame[horizontal, gap18, fill] → { Key (mono 11, ls1.5, $muted-foreground, fixed w120, e.g. 'INTENT') + Value (DM Sans 14/500, $foreground, fill, e.g. 'Append research notes to this task') }. SCREEN (GZ7xA Parsed Intent rows, authoritative): same key column (w120) but bottom-border 1px $border between rows, pad14/0, and the Value is a SLOT holding rich content: an Intent pill ($muted + globe icon + 'RESEARCH' primary), a quoted query string, a Task Chip (dot+name+category + a vertical 92%/CONFIDENCE block), or an icon+text action.

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `label` | string | ✓ |  | Mono key, w120 fixed: INTENT / QUERY / TARGET TASK / ACTION. |
| `value` | ReactNode | ✓ |  | Fills remaining width. Plain DM Sans 14 (canonical) OR a rich node: badge pill / quoted text / task chip / icon+text (screen). |
| `divider` | boolean |  | false | Screen rows carry a bottom 1px $border between rows (last row none). |
| `valueKind` | 'text' | 'pill' | 'query' | 'taskChip' | 'action' |  | 'text' | Hints the value rendering used on the GZ7xA Parsed Intent panel. |

**Variants:** `text (canonical): plain DM Sans 14 value`, `pill (INTENT on screen): $muted chip + globe icon + 'RESEARCH' (mono 11/700 ls1.5 $primary)`, `query (QUERY on screen): quoted string DM Sans 14 $foreground`, `taskChip (TARGET TASK on screen): card-elevated chip {dot + name + category} + Conf block {92% $success + 'CONFIDENCE' mono 9}`, `action (ACTION on screen): file-plus icon $primary + DM Sans 14 text`

**States:** `(static key/value; no interactive states — read-only)`

**Tokens:** `$muted-foreground`, `$foreground`, `$border`, `$muted`, `$primary`, `$success`, `$card-elevated`, `$cat-bureaucratic`

**A11y:** semantic key/value: render as `<dt>`/`<dd>` or row with `aria-label` combining label+value; decorative icons `aria-hidden`

## IntentRow

**Kind:** molecule · **Canonical id:** `dO0U6` · **shadcn:** flex row + Badge/CategoryTag in value slot.

Key/value row inside ParsedIntentPanel.

### Anatomy (canonical)
```
frame [horizontal, gap18, fill]
├─ Key    mono 11 ls1.5 $muted-foreground, fixed w120  ('INTENT')
└─ Value  DM Sans 14/500 $foreground, fill  ('Append research notes to this task')
```

### Screen value-slot polymorphism (GZ7xA, AUTHORITATIVE — rows divided by 1px $border, pad14/0)
| label | valueKind | content |
|---|---|---|
| INTENT | pill | $muted chip + `globe` + 'RESEARCH' (mono 11/700 $primary) |
| QUERY | query | quoted DM Sans 14 string |
| TARGET TASK | taskChip | card-elevated {dot + name + category} + 92%/CONFIDENCE block ($success) |
| ACTION | action | `file-plus` $primary + DM Sans 14 text |

### Props
`label` (req), `value: ReactNode` (req), `valueKind?`='text', `divider?`=false.

### Reconciliation
Screens win → value becomes a polymorphic **slot** (`ReactNode`) with a `valueKind` hint, plus inter-row dividers. Fixed 120px key column retained. Confidence in the task-chip is the bespoke numeric %→color sub-pattern (≥85 $success / ≥50 $warning / else $muted).

### a11y
`<dt>`/`<dd>` semantics; icons `aria-hidden`.

**Screen usages:** GZ7xA §01 'Parsed Intent' Rows — INTENT(pill) / QUERY / TARGET TASK(task chip+confidence) / ACTION(icon+text), divided by 1px borders; RcvKu showcase 'spec/IntentRow' canonical dO0U6 + ParsedIntentPanel refs (INTENT/QUERY/TARGET TASK/ACTION); mobile 'Intent' rows

**Reconciliation (screen ← library):** Canonical dO0U6 value is plain DM Sans text. The SCREEN (authoritative) makes the Value a polymorphic SLOT (pill / quoted query / task-chip-with-confidence / icon+text) AND adds inter-row bottom borders + pad14/0. Contract is WIDENED: `value: ReactNode` + `valueKind` hint + `divider`. The key column stays fixed at 120px. The task-chip value embeds a confidence sub-pattern (92%/CONFIDENCE) — see ConfidencePill drift flag in ParsedIntentPanel notes (numeric % colored success≥threshold/warning/muted).

---

## ParsedIntentPanel

**Kind:** organism  ·  **maps_to (camp-404):** No direct camp source — composed organism (Card + IntentRows). Confidence chip uses Badge.  ·  **maps_to (shadcn):** shadcn Card containing a stack of IntentRows + a confidence Badge.
  ·  **composes:** IntentRow (×4), CitationChip / Badge (intent pill, confidence chip), CategoryTag (target task chip), Toast (downstream needsConfirmation) / Confirm Bar

**Anatomy:** CANONICAL (Qi7sU): Card[vertical, gap14, pad16] → { Header [space-between, center] → [ L (gap7, center) → Sparkles (lucide `sparkles` 14 $primary) + T (mono 10/700 ls1.5 $primary 'AGENT UNDERSTANDS') ; ConfidenceChip (frame `#5ae07a1f`(success/12), radius999, gap4, pad3/8) → circle-check (#5ae07a) + '92% MATCH' (mono 10/700 #5ae07a) ] ; Rows (vertical, gap12) → 4× IntentRow (INTENT/QUERY/TARGET TASK/ACTION) }. SCREEN (GZ7xA, authoritative): WIDENED — wrapped in a $primary 3px left-accent; header uses `scan-search` icon + 'PARSED INTENT' ($foreground) + a right-aligned 'AGENT UNDERSTANDING' sub-eyebrow ($muted-foreground-subtle) (NOT a confidence chip in the header); rows are bottom-border-divided IntentRows with the confidence shown INSIDE the TARGET TASK row (92%/CONFIDENCE block).

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `intent` | string | ✓ |  | e.g. 'Research' — populates INTENT row pill. |
| `query` | string | ✓ |  | QUERY row quoted string. |
| `targetTask` | { name, category, confidence } | ✓ |  | TARGET TASK row — task chip + confidence %. |
| `action` | string | ✓ |  | ACTION row, e.g. 'Append research notes to this task'. |
| `confidence` | number (0–100) | ✓ |  | Match confidence; canonical shows as a header ConfidenceChip ('92% MATCH', success tint); screen shows inside TARGET TASK as 92%/CONFIDENCE. |
| `variant` | 'screen' | 'canonical' |  | 'screen' | screen = scan-search + 'PARSED INTENT'/'AGENT UNDERSTANDING' + left accent + confidence-in-row; canonical = sparkles + 'AGENT UNDERSTANDS' + header confidence chip. |

**Variants:** `screen (GZ7xA, AUTHORITATIVE): $primary left accent, `scan-search` icon, 'PARSED INTENT' + 'AGENT UNDERSTANDING' eyebrow, divided rows, confidence inside TARGET TASK`, `canonical (showcase Qi7sU): `sparkles` icon, 'AGENT UNDERSTANDS', header ConfidenceChip (success/12 '92% MATCH')`, `confidence threshold: ≥85 $success, ≥50 $warning, else $muted-foreground (color of the % value)`

**States:** `high-confidence (success)`, `low-confidence (warning — pairs with needsConfirmation downstream)`, `(read-only display; the panel itself has no inputs — confirmation is a sibling Confirm Bar / toast)`

**Tokens:** `$card`, `$border`, `$primary`, `$foreground`, `$muted-foreground`, `$muted-foreground-subtle`, `#5ae07a / #5ae07a1f (success + success/12)`, `$success`, `$warning`

**A11y:** `role="region"` `aria-label="Parsed intent, {confidence}% confidence"`; confidence conveyed by text not color alone; sparkles/scan-search icon `aria-hidden`

## ParsedIntentPanel

**Kind:** organism · **Canonical id:** `Qi7sU` · **shadcn:** Card + IntentRows + confidence Badge.

Shows what the agent understood before acting (voice confirmation).

### Anatomy — SCREEN (GZ7xA, AUTHORITATIVE)
```
frame [$primary fill → left 3px accent]
└─ Inner [Card, pad18, gap6]
   ├─ PHead [space-between]: (`scan-search` $primary + 'PARSED INTENT' mono 12 ls1.5 $foreground) | 'AGENT UNDERSTANDING' (mono 10 ls1.5 $muted-foreground-subtle)
   └─ Rows (1px $border dividers, pad14/0): INTENT(pill) · QUERY · TARGET TASK(chip + 92%/CONFIDENCE) · ACTION
```

### Anatomy — canonical (Qi7sU)
```
Card [vertical, gap14, pad16]
├─ Header: (`sparkles` + 'AGENT UNDERSTANDS' mono 10/700) | ConfidenceChip [success/12 pill, `circle-check` + '92% MATCH']
└─ Rows: 4× IntentRow
```

### Props
`intent`, `query`, `targetTask{name,category,confidence}`, `action`, `confidence` (req), `variant?`='screen'.

### Confidence threshold (bespoke ConfidencePill)
`≥85 → $success` · `≥50 → $warning` · `else → $muted-foreground` (colors the % value).

### Reconciliation
Screens win → default `scan-search`/'PARSED INTENT'/left-accent form with confidence inside TARGET TASK; canonical sparkles+header-chip kept as option. Register an `intent` Badge tone ($muted fill + $primary text) for the RESEARCH pill. Confirmation lives in the sibling Confirm Bar / needsConfirmation Toast, not here.

### a11y
`role=region`, label includes confidence as text; icons `aria-hidden`.

**Screen usages:** GZ7xA §01 'Parsed Intent' — the screen-authoritative form (scan-search, left accent, AGENT UNDERSTANDING, confidence in TARGET TASK row); followed by a 'Confirm Bar' (Cancel + CUE RESEARCH) and/or inline Disambiguation; RcvKu showcase 'spec/ParsedIntentPanel' — canonical Qi7sU with sparkles + header confidence chip; mobile 'Intent'

**Reconciliation (screen ← library):** Two genuinely different header treatments. Canonical Qi7sU: `sparkles` + 'AGENT UNDERSTANDS' + a header **ConfidenceChip** (success/12 pill '92% MATCH'). SCREEN (authoritative): `scan-search` + 'PARSED INTENT' + a muted right sub-eyebrow 'AGENT UNDERSTANDING' (no header chip) + a **$primary 3px left accent**, with confidence relocated INTO the TARGET TASK IntentRow as a 92%/CONFIDENCE block. Per source-of-truth, default `variant='screen'`; keep canonical as an option. Triage flags: (1) the bespoke ConfidencePill numeric→color threshold pattern (success/warning/muted) needs a canonical helper; (2) the INTENT 'RESEARCH' pill uses $muted fill + $primary text (a bespoke intent badge, not Badge's window/status/category variants) — register an `intent` Badge tone. The confirmation action is NOT inside this panel — it is the sibling 'Confirm Bar' (Cancel + CUE RESEARCH) on screen 01, which reconciles with the needsConfirmation Toast.

---

## CitationChip

**Kind:** atom  ·  **maps_to (camp-404):** No camp source — tiny inline Badge.  ·  **maps_to (shadcn):** shadcn Badge (`variant=outline`, xs) — a bracketed reference marker.
  ·  **composes:** (leaf atom; consumed by AINotesBlock)

**Anatomy:** frame[fill $card-elevated, border 1px $border, pad1/6, center] (id G35WX) → Num (mono 10/600 $primary, '[1]'). Inline within AINotesBlock step Citations frames (gap6) and result steps.

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `number` | number | ✓ |  | Citation index → renders as '[n]'. |
| `onClick` | () => void |  |  | Optional: scroll/anchor to the matching SourceRow. |
| `href` | string |  |  | Optional: link to the source. |

**Variants:** `number content '[1]'..'[n]' (the only canonical variant axis)`, `desktop: bordered chip frame (authoritative for desktop)`, `mobile drift: inline bracketed suffix text '… [2]' inside the step string (no chip frame)`

**States:** `default`, `hover (if interactive — links to source)`, `focus-visible`

**Tokens:** `$card-elevated`, `$border`, `$primary`

**A11y:** if interactive: `<a>`/`<button>` with `aria-label="Source {n}"`; if static: inline text marker, ensure it reads naturally with surrounding prose; min hit target relaxed (inline marker) — but ≥24px tappable if linked

## CitationChip

**Kind:** atom · **Canonical id:** `G35WX` · **shadcn:** Badge (`outline`, xs).

Inline citation marker inside research notes.

### Anatomy
```
frame [$card-elevated, border 1px $border, pad 1/6, center]
└─ Num  '[1]'  mono 10/600 $primary
```

### Variants / states
Content `[1]…[n]`. `renderMode`: **chip** (desktop, authoritative) · **inline** (mobile bracketed suffix text). Optionally interactive (link/anchor to SourceRow) → hover/focus.

### Props
`number` (req), `onClick?`, `href?`, `renderMode?`='chip'.

### Reconciliation
Desktop chip wins; mobile inline-text drift covered by `renderMode='inline'`. Add optional link to the matching source (canonical is visual-only).

### a11y
Interactive → `aria-label="Source {n}"`; static → reads inline with prose.

**Screen usages:** GZ7xA §03 AINotesBlock steps — [1]/[2]/[3] chips after step text (desktop ~6); RcvKu showcase 'spec/CitationChip' canonical G35WX; mobile: citations inlined as bracketed text in the step string

**Reconciliation (screen ← library):** Canonical G35WX is stable — a bordered card-elevated pill with a primary bracketed number. The mobile screen DRIFTS by inlining '[n]' as plain suffix text rather than a chip frame (triage 'CitationChip vs inline bracket text'). Per source-of-truth, desktop chip is authoritative; provide a `renderMode: 'chip' | 'inline'` so mobile can render the bracket as inline text while keeping the same semantic + optional source link. Add optional `onClick`/`href` to wire to the matching SourceRow (canonical is purely visual).

---

## SourceRow

**Kind:** molecule  ·  **maps_to (camp-404):** No camp source — list row; favicon dot uses category tones (ADAPT icon-badge tone idea).  ·  **maps_to (shadcn):** Plain flex row + lucide `external-link`; sits in a shadcn Card 'SOURCES' section.
  ·  **composes:** (leaf molecule; consumed by AINotesBlock + ErrorStateCard partial-results)

**Anatomy:** frame[horizontal, gap10, pad10/0, center, fill] (id ggMJH) → { Favicon (ellipse 9×9, fill = source category tone, default $cat-bureaucratic) + Domain (mono 12/600 $muted-foreground, 'tankwatown.org') + Title (DM Sans 13 $foreground, fill, 'Tankwa Town — land-use & gate permits') + Ext (lucide `external-link` 14 $muted-foreground-subtle) }. In AINotesBlock the rows stack with top 1px $border dividers between them under a 'SOURCES' label.

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `domain` | string | ✓ |  | Mono domain, e.g. 'capenature.co.za'. |
| `title` | string | ✓ |  | DM Sans source title. |
| `faviconColor` | token | hex |  | $cat-bureaucratic | Favicon dot tone — screens use per-source colors (capenature=$cat-bureaucratic blue, afrikaburn=#ff6b35 orange, tankwatown=#e0c05a/$cat-gear amber, sars=…). |
| `href` | string |  |  | External link target → opens in new tab. |
| `status` | 'ok' | 'failed' |  | 'ok' | Partial-results: a failed source uses an error treatment (x icon, muted/destructive) instead of external-link. |

**Variants:** `ok (canonical): favicon dot + domain + title + external-link icon`, `failed (GZ7xA partial-results cell 07): same shape but failed/error treatment — x/alert icon, retry affordance context (the divergent failed-source variant)`, `favicon tones: $cat-bureaucratic / #ff6b35 / #e0c05a per source`

**States:** `default`, `hover (underline/elevate if linked)`, `failed (unreachable source)`

**Tokens:** `$cat-bureaucratic`, `#ff6b35`, `#e0c05a ($cat-gear)`, `$muted-foreground`, `$foreground`, `$muted-foreground-subtle`, `$border`, `$destructive (failed)`

**A11y:** row is a link → `<a target="_blank" rel="noopener">` with `aria-label="{title}, {domain} (opens in new tab)"`; favicon dot decorative `aria-hidden`; external-link icon decorative; the new-tab affordance announced via label; failed row: `aria-label` includes 'unreachable'

## SourceRow

**Kind:** molecule · **Canonical id:** `ggMJH` · **shadcn:** flex row + `external-link`.

Research source list row.

### Anatomy
```
frame [horizontal, gap10, pad10/0, center, fill]
├─ Favicon  ellipse 9×9, fill = source tone (default $cat-bureaucratic)
├─ Domain   mono 12/600 $muted-foreground   ('tankwatown.org')
├─ Title    DM Sans 13 $foreground, fill
└─ Ext      lucide `external-link` 14 $muted-foreground-subtle
```
Stacks with top 1px $border dividers under a 'SOURCES' label inside AINotesBlock.

### Variants / states
`ok` (canonical) · `failed` (partial-results — x/alert icon + muted/destructive). Favicon tone per source ($cat-bureaucratic / #ff6b35 / #e0c05a). hover (if linked).

### Props
`domain` (req), `title` (req), `faviconColor?`=$cat-bureaucratic, `href?`, `status?`='ok'.

### Reconciliation
Screens win → `status` widened for the reused failed-source variant; whole row becomes the external link.

### a11y
Linked row `<a target=_blank rel=noopener>` + new-tab label; dot/icon `aria-hidden`; failed announces 'unreachable'.

**Screen usages:** GZ7xA §03 AINotesBlock 'Sources' — 3 rows (tankwatown.org, capenature.co.za, sars.gov.za) with top-border dividers; GZ7xA §04 cell 07 'PARTIAL RESULTS' — failed-source rows (2) in a card-elevated box; RcvKu showcase 'spec/SourceRow' canonical ggMJH + AINotesBlock source list refs

**Reconciliation (screen ← library):** Canonical ggMJH is the healthy 'ok' row. The SCREEN reuses the same shape for FAILED sources (partial-results cell 07) with an error treatment (triage 'SourceRow reused as failed-source row'). Contract WIDENED with `status: 'ok'|'failed'`. Favicon tone is per-source (data-driven) — defaults to $cat-bureaucratic but screens set orange/amber/etc. Add `href` to make the whole row the external link (canonical only draws the icon).

---

## ResearchStepRow

**Kind:** molecule  ·  **maps_to (camp-404):** REF intake-tracker `voice-panel.tsx` stage→review log idiom; otherwise composed. Spinner glyph LIFT from Spinner.  ·  **maps_to (shadcn):** Plain flex row + lucide glyph (loader-circle / circle-check / dot); list lives in a Card.
  ·  **composes:** Spinner (active glyph), (consumed by ResearchJobPanel / Live Step Log)

**Anatomy:** CANONICAL (hHAnh): frame[horizontal, gap10, center, fill] → { Glyph (16×16 center) → I (lucide `loader-circle` 15 $primary) + T (mono 12/600 $primary, fill, 'Reading source 3 of 6 · tankwatown.org') }. SCREEN (GZ7xA 'Live Step Log', authoritative): rows are pad8/18; states are richer — ACTIVE row gets a $card-elevated fill + 2px $primary LEFT border box (pad10/16) with a spinner ellipse, primary bold text + a secondary source string; DONE rows show a '✓' (success) + text + optional Meta caption ('8 RESULTS'); PENDING rows show a 6px $muted-foreground-subtle dot + muted text.

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `status` | 'done' | 'active' | 'pending' | ✓ |  | done → circle-check/✓ $success; active → spinner $primary (+ highlighted box on screen); pending → 6px subtle dot, muted text. |
| `label` | string | ✓ |  | Step text, e.g. 'Searched the web', 'Reading source 3 of 6', 'Drafting notes'. |
| `meta` | string |  |  | Trailing caption, e.g. '8 RESULTS' or '· tankwatown.org' (active source). |
| `highlightActive` | boolean |  | true | Screen 'Live Step Log' wraps the active row in a $card-elevated + left-2px-$primary box; the canonical/showcase active row is a plain row. |

**Variants:** `done (canonical ref): `circle-check` $success + $foreground 500 text (showcase) / '✓' $success glyph (screen)`, `active (canonical): `loader-circle` $primary + $primary 600 text — flat row`, `active (screen, highlighted): $card-elevated box, 2px $primary left border, pad10/16, spinner ellipse + primary bold text + source string`, `pending: 6×6 $muted-foreground-subtle dot ellipse + $muted-foreground-subtle text`

**States:** `done`, `active (in-flight)`, `pending (not started)`, `streaming (parent log shows a 'STREAMING' success dot header)`

**Tokens:** `$primary`, `$success`, `$foreground`, `$muted-foreground`, `$muted-foreground-subtle`, `$card-elevated`, `$border`

**A11y:** log container `role="log"` `aria-live="polite"` so new/active steps are announced; glyph decorative `aria-hidden`; status conveyed in text ('done'/'in progress'/'pending' via visually-hidden text or aria); respect reduced-motion for the active spinner

## ResearchStepRow

**Kind:** molecule · **Canonical id:** `hHAnh` · **shadcn:** flex row + lucide glyph · **REF:** intake-tracker `voice-panel.tsx` log idiom.

A single line in the live research progress log. **Distinct from the numbered result steps in AINotesBlock.**

### Anatomy (canonical)
```
frame [horizontal, gap10, center, fill]
├─ Glyph 16×16 → `loader-circle` 15 $primary
└─ T     mono 12/600 $primary, fill  ('Reading source 3 of 6 · tankwatown.org')
```

### State matrix (UNION canonical + screen 'Live Step Log')
| status | glyph | text | extra |
|---|---|---|---|
| **done** | `circle-check`/✓ $success | $foreground 500 | Meta caption ('8 RESULTS') |
| **active** | spinner $primary | $primary 600/700 | screen: $card-elevated box + 2px $primary left border + source string |
| **pending** | 6px $muted-foreground-subtle dot | $muted-foreground-subtle | — |

### Props
`status` (req), `label` (req), `meta?`, `highlightActive?`=true.

### Reconciliation
Screens win → active row highlighted box + `meta` caption + ✓ done glyph. Do NOT conflate with AINotesBlock numbered steps. Log container is `role=log`/polite.

### a11y
`role=log` polite; status as text; spinner respects reduced-motion.

**Screen usages:** GZ7xA §02 'Live Step Log' card — done/active/pending rows; active row highlighted; header 'LIVE STEP LOG' + 'STREAMING' dot; RcvKu showcase 'spec/ResearchStepRow' — canonical hHAnh + done + pending refs; ResearchJobPanel canonical 'Log' — 5 step refs (done×2, active, pending×2)

**Reconciliation (screen ← library):** DISTINCT from the AINotesBlock numbered result steps (triage explicitly warns against conflating progress-log steps vs result note-steps). Canonical hHAnh active/done/pending are flat rows. The SCREEN 'Live Step Log' (authoritative) gives the ACTIVE row a highlighted box ($card-elevated + 2px $primary left border) and uses a '✓' glyph for done + a trailing Meta caption ('8 RESULTS', source domain). Contract WIDENED with `meta` + `highlightActive`. The glyph swap pending→ellipse dot, done→circle-check/✓ is handled by `status`. Note the on-screen log lives in a SEPARATE card from ResearchJobPanel (see that component's notes) — but the canonical ResearchJobPanel embeds the log; both compositions are valid.

---

## ResearchJobPanel

**Kind:** organism  ·  **maps_to (camp-404):** REF intake-tracker `voice-panel.tsx` (stage/progress) + ADAPT ProgressBar (indeterminate variant). Spinner LIFT.  ·  **maps_to (shadcn):** shadcn Card + Progress (indeterminate) + ResearchStepRow log. NEW indeterminate ProgressBar variant required.
  ·  **composes:** ResearchStepRow (the log), Spinner, ProgressBar (indeterminate variant — NEW), ComeBackLaterBanner + MinimizedJobPill (sibling job-state surfaces)

**Anatomy:** CANONICAL (MQL6i): Card[vertical, gap14, pad16] → { Top [space-between] → [ L → `loader-circle` $primary + 'RESEARCHING…' (mono 12/700 ls1.5 $primary) ; Timer (mono 13/700 ls1 $foreground '00:42') ] ; Task (DM Sans 15/600, 'Submit Tankwa land-use permit') ; Track (frame h4 $card-elevated, clip) → Bar (rect $primary w150) ; Log (vertical gap9) → 5× ResearchStepRow }. SCREEN (GZ7xA, authoritative): WIDENED — top 2px $primary Accent bar; JobBody pad22; JobHead splits into JobLeft {StatusRow (spinner + 'RESEARCHING…' mono 12/700 ls2) + Task (DM Sans 22/700!) + Scope subtitle (DM Sans 13 $muted-foreground)} and JobRight {'ELAPSED' label (mono 10/600 ls2 $muted-foreground-subtle) + 30px/700 elapsed value}; an Indeterminate progress (Chunk $primary w340 sliding over $card-elevated h4 track); ProgMeta {'Step 3 of 6 · reading sources' + 'NO FIXED ETA'}. The step Log is rendered as a SEPARATE 'Live Step Log' card on screen 02, not inside the panel.

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `task` | string | ✓ |  | Task name. Canonical DM Sans 15; screen DM Sans 22. |
| `scope` | string |  |  | Screen subtitle, e.g. 'Web research · finding required steps & official sources'. |
| `elapsedLabel` | string (mm:ss) | ✓ | '00:42' | Elapsed timer; screen renders it big (30px) under an 'ELAPSED' label. |
| `step` | { index, total, label } |  |  | Screen 'Step 3 of 6 · reading sources'. |
| `progress` | 'indeterminate' | number |  | 'indeterminate' | Screen uses an indeterminate sliding chunk (NO ETA); canonical shows a fixed-width bar. |
| `steps` | ResearchStepRow[] |  |  | Canonical embeds the log; screen renders it in a separate Live Step Log card (pass-through / slot). |
| `variant` | 'screen' | 'canonical' |  | 'screen' | - |

**Variants:** `screen (GZ7xA, AUTHORITATIVE): top $primary accent, large 22px task + 30px elapsed, indeterminate bar, Step X of Y + 'NO FIXED ETA', separate Live Step Log card`, `canonical (showcase MQL6i): no accent, 15px task, fixed bar, embedded 5-step log`

**States:** `running (RESEARCHING…)`, `streaming (Live Step Log header 'STREAMING' success dot)`, `minimized → docks to MinimizedJobPill`, `backgrounded → ComeBackLaterBanner offers leave`, `taking-longer → ErrorStateCard 'timeout/TAKING LONGER' variant`

**Tokens:** `$card`, `$border`, `$primary`, `$foreground`, `$muted-foreground`, `$muted-foreground-subtle`, `$card-elevated`, `$success (streaming dot)`

**A11y:** `role="region"` `aria-label="Research job for {task}, running"`; indeterminate progress → `role="progressbar"` `aria-valuetext="Step {i} of {total}"` (no value when indeterminate); 'NO FIXED ETA' announced; live step log polite; spinner respects reduced-motion

## ResearchJobPanel

**Kind:** organism · **Canonical id:** `MQL6i` · **shadcn:** Card + Progress(indeterminate) + ResearchStepRow.

Live long-running research-job progress.

### Anatomy — SCREEN (GZ7xA §02, AUTHORITATIVE)
```
Card [top 2px $primary Accent]
└─ JobBody [pad22]
   ├─ JobHead [space-between]
   │  ├─ JobLeft: ('RESEARCHING…' mono 12/700 ls2 + spinner) · Task (DM Sans 22/700) · Scope (DM Sans 13 $muted-foreground)
   │  └─ JobRight: 'ELAPSED' (mono 10/600 ls2) + '00:42' (mono 30/700)
   ├─ Indeterminate: Chunk (rect $primary w340) over $card-elevated h4 track  [sliding]
   └─ ProgMeta: 'Step 3 of 6 · reading sources' | 'NO FIXED ETA'
```
The step log is a **separate** 'Live Step Log' card on screen 02 (header 'LIVE STEP LOG' + 'STREAMING' success dot).

### Anatomy — canonical (MQL6i)
Small 'RESEARCHING…' header + 13px timer · Task DM Sans 15 · fixed $primary Bar · **embedded** 5× ResearchStepRow.

### Props
`task` (req), `scope?`, `elapsedLabel` (req), `step?{index,total,label}`, `progress?`='indeterminate', `steps?` (slot), `variant?`='screen'.

### Reconciliation
Screens win → top accent, large header, **indeterminate** progress (NEW ProgressBar mechanic, not the 3-segment mission bar) + 'NO FIXED ETA', log split into a separate card via the `steps` slot. Job-status also surfaces as a header RUNNING badge (bespoke).

### a11y
`role=region`; indeterminate `role=progressbar` `aria-valuetext='Step i of n'`; log polite; reduced-motion.

**Screen usages:** GZ7xA §02 'Research Job' (accent + big header + indeterminate bar) + separate 'Step Log' card (Live Step Log); RcvKu showcase 'spec/ResearchJobPanel' — canonical MQL6i with embedded 5-step log; mobile 'Job'

**Reconciliation (screen ← library):** Big divergence. Canonical MQL6i: small header ('RESEARCHING…' + 13px timer), 15px task, a FIXED-width primary Bar over the track, and the step Log EMBEDDED. SCREEN (authoritative): a top 2px $primary Accent, pad22, a LARGE header (22px task + 30px elapsed + 'ELAPSED' label + scope subtitle), an INDETERMINATE sliding chunk (w340) with 'Step X of Y · reading sources' + 'NO FIXED ETA', and the step log SPLIT OUT into a separate 'Live Step Log' card. Contract WIDENED: `progress: 'indeterminate'|number` (triage flags this is a NEW ProgressBar mechanic distinct from the 3-segment mission bar), `scope`, `step`, big-vs-small via `variant`, and `steps` as an optional slot so the log can be embedded (canonical) OR external (screen). The header 'RESEARCHING…'/spinner/timer also appears as a 'RUNNING badge' in the frame-02 header (bespoke, no canonical) — note but keep within this organism's scope.

---

## AINotesBlock

**Kind:** organism  ·  **maps_to (camp-404):** No camp source — composed result organism (Card + numbered steps + Sources). Buttons LIFT shadcn Button.  ·  **maps_to (shadcn):** shadcn Card with left accent; numbered step list; CitationChip + SourceRow children; Button action footer.
  ·  **composes:** CitationChip (×n in steps), SourceRow (×n in Sources), Button (Affordances footer)

**Anatomy:** CANONICAL (eAQ2M): Card[border-LEFT 2px $primary, vertical, gap14, pad16] → { Attr [space-between] → [ L → `sparkles` 14 $primary + Attribution (mono 11/700 ls1 $primary, 'AI RESEARCH · 5 NOTES · 2026-06-03 14:22') ; NEW Pill (frame $primary radius999 pad2/7 → 'NEW' mono 9/700 $primary-foreground) ] ; Summary (DM Sans 14/500 lineHeight1.5) ; Steps (vertical gap12) → 5× Step {Num (24×24 $card-elevated +1px $border, mono 12/700 $primary) + Col [Txt DM Sans 14 lineHeight1.5 + Citations (gap6) → CitationChip refs]} ; Sources (top 1px $border, pad-top16) → 'SOURCES' (mono 11/700 ls2 $muted-foreground-subtle) + List → SourceRow refs }. SCREEN (GZ7xA §03, authoritative): adds an 'Affordances' footer (top 1px $border, pad-top16) → Primary Actions {KEEP NOTES ($primary fill + check icon) + DISMISS (text $muted-foreground)} + VIEW SOURCES ($secondary + $border + external-link).

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `attribution` | string | ✓ |  | 'AI RESEARCH · {n} NOTES · {timestamp}'. |
| `isNew` | boolean |  | true | Shows the 'NEW' pill ($primary). |
| `summary` | string | ✓ |  | DM Sans 14/500 lead paragraph. |
| `steps` | { text, citations: number[] }[] | ✓ |  | Numbered steps; each has a 24px Num box + text + CitationChips. |
| `sources` | SourceRow[] | ✓ |  | 'SOURCES' list. |
| `onKeep / onDismiss / onViewSources` | () => void |  |  | Screen 'Affordances' footer actions. |
| `citationRenderMode` | 'chip' | 'inline' |  | 'chip' | desktop=chip frames; mobile=inline bracketed text in the step string. |

**Variants:** `with Affordances footer (GZ7xA §03, AUTHORITATIVE): KEEP NOTES / DISMISS / VIEW SOURCES`, `without footer (canonical eAQ2M): notes display only (no actions)`, `NEW pill present / absent`, `citations as chips (desktop) vs inline bracket text (mobile)`

**States:** `new (NEW pill, pre-keep)`, `kept (notes persisted — footer hidden/changed)`, `mobile (citations inline, numbered-step structure differs)`

**Tokens:** `$card`, `$primary`, `$primary-foreground`, `$foreground`, `$muted-foreground`, `$muted-foreground-subtle`, `$border`, `$card-elevated`, `$secondary`

**A11y:** `role="region"` `aria-label="AI research notes, {n} notes"`; numbered steps as an ordered list `<ol>`; citation chips link to sources (`aria-label="Source {n}"`); footer actions are real buttons; KEEP NOTES is the primary action; sparkles/icons `aria-hidden`; read-only board rule: 'KEEP NOTES' is the only mutation and it is voice/agent-originated confirmation, not board CRUD

## AINotesBlock

**Kind:** organism · **Canonical id:** `eAQ2M` · **shadcn:** Card (left accent) + ordered steps + CitationChip + SourceRow + Button footer.

The research result attached to a task.

### Anatomy (canonical eAQ2M)
```
Card [border-left 2px $primary, vertical, gap14, pad16]
├─ Attr [space-between]: (`sparkles` + 'AI RESEARCH · 5 NOTES · 2026-06-03 14:22' mono 11/700 $primary) | NEW Pill ($primary, 'NEW' $primary-foreground)
├─ Summary  DM Sans 14/500 lh1.5
├─ Steps (gap12): 5× { Num 24×24 [$card-elevated +1px $border, mono 12/700 $primary] + Col [Txt DM Sans 14 lh1.5 + Citations → CitationChip[]] }
└─ Sources [top 1px $border, pad-top16]: 'SOURCES' (mono 11/700 ls2) + SourceRow[]
```

### Screen-added footer (GZ7xA §03, AUTHORITATIVE)
```
Affordances [top 1px $border, pad-top16]
├─ Primary Actions: KEEP NOTES ($primary + `check`)  ·  DISMISS (text $muted-foreground)
└─ VIEW SOURCES ($secondary + $border + `external-link`)
```

### Props
`attribution` (req), `isNew?`=true, `summary` (req), `steps[]{text,citations[]}` (req), `sources[]` (req), `onKeep/onDismiss/onViewSources?`, `citationRenderMode?`='chip'.

### Reconciliation
Screens win → adds the KEEP/DISMISS/VIEW SOURCES footer. Mobile inline-citation + differing Num-box structure → `citationRenderMode`. KEEP NOTES is the only mutation (agent-confirmation, not board CRUD). Numbered steps ≠ ResearchStepRow.

### a11y
`role=region`; `<ol>` steps; citation links labelled; real buttons; icons `aria-hidden`.

**Screen usages:** GZ7xA §03 'AI Notes Block' — attribution + NEW pill + summary + 5 numbered steps with citations + Sources + Affordances footer (KEEP/DISMISS/VIEW SOURCES); RcvKu showcase 'spec/AINotesBlock' canonical eAQ2M (no footer); mobile 'AI Notes' — citations inlined as bracketed text; numbered-step structure differs

**Reconciliation (screen ← library):** Canonical eAQ2M is display-only (attribution + summary + numbered steps + sources). The SCREEN (authoritative) adds an 'Affordances' footer with KEEP NOTES / DISMISS / VIEW SOURCES — the disposition actions for freshly-attached research. Contract WIDENED with `onKeep/onDismiss/onViewSources`. Mobile DRIFTS: citations are inline bracketed text (not chip frames) and the numbered-step Num-box structure differs (triage 'numbered-step structure differs desktop vs mobile' + 'CitationChip vs inline bracket text') → handled by `citationRenderMode`. The numbered result steps are DISTINCT from ResearchStepRow progress steps. This block is the persistent result attached to a task; the transient/info answer is VoiceQueryResultCard.

---

## ComeBackLaterBanner

**Kind:** molecule  ·  **maps_to (camp-404):** No camp source — inline reassurance banner (Alert-left-accent idiom). Buttons LIFT shadcn Button.  ·  **maps_to (shadcn):** shadcn Alert (inline, left-accent) + Button action pair.
  ·  **composes:** Button (MINIMIZE + COME BACK LATER), MinimizedJobPill (minimize target), ResearchJobPanel (the job it backgrounds)

**Anatomy:** CANONICAL (lPm1x): frame[fill $muted, border 1px $border, gap10, pad13, center] → { Bell (lucide `bell` 16 $muted-foreground) + T (DM Sans 13 $muted-foreground, fill, 'Running in the background — you can leave. We'll notify you when it's ready.') }. SCREEN (GZ7xA §02, authoritative): WIDENED — fill primary/12 (`#ff6b3514`≈/8), border-LEFT 2px $primary, pad16/18; BLeft → IconWrap (32×32 primary/12 box, `coffee` icon $primary) + BText {BTitle (DM Sans 14/700 $foreground 'Running in the background') + BSub (DM Sans 13 $muted-foreground 'You can leave — we'll notify you the moment results are ready.')}; BActions → MINIMIZE (outline $border-hover, `minus` icon) + COME BACK LATER ($primary fill, `bell` icon).

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `title` | string |  | 'Running in the background' | Screen bold title (DM Sans 14/700). |
| `message` | string | ✓ |  | Reassurance body. |
| `icon` | LucideIcon |  | coffee | Screen uses `coffee` (in a tinted square); canonical uses `bell`. |
| `onMinimize` | () => void |  |  | MINIMIZE → docks job to MinimizedJobPill. |
| `onComeBackLater` | () => void |  |  | COME BACK LATER → background + notify when ready. |
| `variant` | 'screen' | 'canonical' |  | 'screen' | - |

**Variants:** `screen (GZ7xA §02, AUTHORITATIVE): primary/12 fill, left-2px $primary, coffee-in-square icon, title+sub, MINIMIZE + COME BACK LATER buttons`, `canonical (lPm1x): $muted fill, full $border, bell icon, single message line, no buttons`

**States:** `default (job running, offering to background)`, `(action-driven: minimize / come-back-later)`

**Tokens:** `$muted`, `$border`, `$muted-foreground`, `$primary`, `$primary-foreground`, `$foreground`, `$border-hover`, `#ff6b3514 / #ff6b351f (primary/8–/12 — triage flags as raw-hex; use bg-primary/12)`

**A11y:** `role="status"` (informational reassurance); action buttons real & labelled (MINIMIZE / COME BACK LATER); icon `aria-hidden`

## ComeBackLaterBanner

**Kind:** molecule · **Canonical id:** `lPm1x` · **shadcn:** Alert (inline, left-accent) + Button pair.

Reassurance + controls for backgrounding a long research job.

### Anatomy — SCREEN (GZ7xA §02, AUTHORITATIVE)
```
frame [fill primary/12, border-left 2px $primary, gap, pad16/18, center]
├─ BLeft: IconWrap [32×32 primary/12] `coffee` $primary
│         + BText: BTitle 'Running in the background' (DM Sans 14/700) · BSub (DM Sans 13 $muted-foreground)
└─ BActions: MINIMIZE (outline $border-hover + `minus`)  ·  COME BACK LATER ($primary + `bell`)
```

### Anatomy — canonical (lPm1x)
```
frame [$muted, border 1px $border, gap10, pad13]
└─ `bell` $muted-foreground + 'Running in the background — we'll notify you…' (DM Sans 13 $muted-foreground)
```

### Props
`title?`, `message` (req), `icon?`=`coffee`, `onMinimize?`, `onComeBackLater?`, `variant?`='screen'.

### Reconciliation
Screens win → primary/12 tint + left accent + title/sub + MINIMIZE/COME BACK LATER buttons. Replace raw `#ff6b3514`/`#ff6b351f` with `bg-primary/12`.

### a11y
`role=status`; real labelled buttons; icon `aria-hidden`.

**Screen usages:** GZ7xA §02 'Come Back Banner' — coffee icon + title/sub + MINIMIZE + COME BACK LATER (authoritative); RcvKu showcase 'spec/ComeBackLaterBanner' canonical lPm1x (bell, $muted, no actions); mobile come-back line (mirrored)

**Reconciliation (screen ← library):** Canonical lPm1x is a flat $muted single-line bell banner with NO actions. The SCREEN (authoritative) is far richer: primary/12 tint, left-2px $primary accent, a `coffee` icon in a tinted square, a bold title + sub, and TWO action buttons (MINIMIZE → MinimizedJobPill, COME BACK LATER → background+notify). Contract WIDENED with `title`, `onMinimize`, `onComeBackLater`, `icon`. Triage flags the raw hex tints `#ff6b3514`/`#ff6b351f` → use `bg-primary/12` per brief token convention. Default `variant='screen'`.

---

## MinimizedJobPill

**Kind:** molecule  ·  **maps_to (camp-404):** No camp source — floating pill (one of the only rounded+shadowed elements). Build bespoke.  ·  **maps_to (shadcn):** shadcn Button-like floating pill (rounded-full) + Spinner glyph + chevron.
  ·  **composes:** Spinner (arc glyph), ResearchJobPanel (the expanded form), ComeBackLaterBanner (MINIMIZE → this pill)

**Anatomy:** frame[fill $card, cornerRadius 999, border 1px $primary, outer shadow {color #00000066, y6, blur20}, gap11, pad11/16, center] (id o2ncW) → { Glyph (w15 center) → PillSpin (ellipse 14×14 $primary, arc: innerRadius0.62 startAngle60 sweepAngle280 — a partial-ring spinner) + PillTxt (mono 13/700 $foreground 'Researching permit steps') + PillSep ('·' $muted-foreground-subtle) + PillTime (mono 13/700 ls1 $primary '00:42') + Expand (24×24 $card-elevated radius999) → `chevron-up` 13 $muted-foreground }. On screen 02 it is absolutely positioned (docks bottom).

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `jobTitle` | string | ✓ |  | 'Researching permit steps'. |
| `elapsedLabel` | string (mm:ss) | ✓ | '00:42' | Primary-colored elapsed timer. |
| `onExpand` | () => void | ✓ |  | Chevron-up → re-expands to the full ResearchJobPanel. |
| `position` | 'docked' | 'inline' |  | 'docked' | Screen docks it absolute bottom; showcase renders inline. |

**Variants:** `running (only state): arc spinner + title + elapsed + expand chevron`, `docked (absolute) vs inline (showcase) placement`

**States:** `running`, `hover (elevate)`, `focus-visible`, `(expanding → ResearchJobPanel)`

**Tokens:** `$card`, `$primary`, `$foreground`, `$muted-foreground`, `$muted-foreground-subtle`, `$card-elevated`, `#00000066 (shadow)`

**A11y:** the whole pill is a button → `aria-label="Research job: {jobTitle}, {elapsed} elapsed. Expand."`; arc spinner decorative `aria-hidden`; respect reduced-motion; ≥44px hit target (pill height ~36–40px + padding; ensure expand target ≥24px, total ≥44)

## MinimizedJobPill

**Kind:** molecule · **Canonical id:** `o2ncW` · **shadcn:** floating rounded Button + Spinner + chevron.

Docked pill for a minimized background research job. **Intentional rounded+shadow exception** to the board's `--radius:0`.

### Anatomy
```
frame [fill $card, cornerRadius 999, border 1px $primary, shadow(#00000066, y6, blur20), gap11, pad11/16, center]
├─ Glyph w15 → PillSpin ellipse 14×14 $primary  (arc: innerRadius0.62 / startAngle60 / sweepAngle280)
├─ PillTxt   'Researching permit steps'  mono 13/700 $foreground
├─ PillSep   '·'  $muted-foreground-subtle
├─ PillTime  '00:42'  mono 13/700 ls1 $primary
└─ Expand    24×24 $card-elevated radius999 → `chevron-up` 13 $muted-foreground
```

### Variants / states
running (only). `position`: docked (absolute, screen) / inline (showcase). hover/focus.

### Props
`jobTitle` (req), `elapsedLabel` (req mm:ss), `onExpand` (req), `position?`='docked'.

### Reconciliation
Canonical ≈ screen 1:1. Radius999 + shadow are an **intentional exception** to `--radius:0` — fixed in the contract. `position` covers absolute docking vs inline.

### a11y
Whole pill is a button (`aria-label` with job+elapsed+'Expand'); spinner `aria-hidden`/reduced-motion; ≥44px target.

**Screen usages:** GZ7xA §02 floating 'Minimized Pill' (absolute, docks bottom) + a 'MINIMIZED STATE — DOCKS HERE WHEN YOU LEAVE' caption; RcvKu showcase 'spec/MinimizedJobPill' canonical o2ncW; mobile 'Minimized Example' pill

**Reconciliation (screen ← library):** Canonical o2ncW matches the screen 1:1 (rounded-999 + $primary border + outer shadow + arc spinner + title + sep + elapsed + expand chevron). The only reconciliation: it is one of the FEW intentionally rounded+shadowed elements on an otherwise sharp/zero-radius board (brief `--radius:0`) — triage confirms this is an INTENTIONAL exception, so the contract explicitly carries `cornerRadius:999` + the outer shadow as fixed, not token-derived radius. Add `position` to cover the screen's absolute docking vs showcase inline. The arc-spinner (innerRadius/startAngle/sweepAngle) is the same glyph family used in ResearchJobPanel/step-log active.

---

## ErrorStateCard

**Kind:** molecule  ·  **maps_to (camp-404):** REF intake-tracker `error-boundary.tsx` for the per-feature recovery pattern; build on shadcn Card + Button. (App-level crash = separate ErrorBoundaryFallback.)  ·  **maps_to (shadcn):** shadcn Card + Alert semantics + Button actions. Distinct from the app-level ErrorBoundaryFallback.
  ·  **composes:** Button (actions), SourceRow (partial-results), CategoryTag (target/picks category), (ambiguous variant overlaps DisambiguationPicker)

**Anatomy:** CANONICAL (d2mdF): Card[border-LEFT 3px $muted-foreground, vertical, gap10, pad14] → { Top (gap8, center) → Icon (lucide `search-x` 15) + Header (mono 11/700 ls1.5 'NO RESULTS FOUND') ; Body (DM Sans 13 $muted-foreground) ; Act → Btn (h40, transparent + 1px $border, `mic` + 'SAY IT AGAIN' mono 12/600 ls1) }. SCREEN (GZ7xA §04, 8 cells, authoritative): WIDENED — uses a TOP 2px Accent bar (color by severity) instead of a left border; pad16; optional Target chip / Picks list / Meta line / Sources list; 1–2 action buttons with varying fills (primary/warning/destructive solid or outline).

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `variant` | 'no-results' | 'needs-confirmation' | 'ambiguous' | 'connection' | 'rate-limited' | 'timeout' | 'partial-results' | 'mic' | ✓ |  | The 8 screen-04 states (+showcase aliases). Drives accent, icon, header, body, extra slot, and actions. |
| `icon` | LucideIcon |  |  | Per variant: search-x / badge-alert / git-fork / wifi-off / timer(-off) / hourglass / circle-alert / mic-off. |
| `header` | string | ✓ |  | - |
| `body` | string | ✓ |  | - |
| `meta` | string |  |  | e.g. 'OFFLINE · LAST SYNC 2M AGO', 'RETRY AVAILABLE IN 3:00'. |
| `target` | { name, tag } |  |  | needs-confirmation: a target task chip ($card-elevated). |
| `picks` | { name, code }[] |  |  | ambiguous: tap-to-pick list + a 'none of these? say it again' line. |
| `sources` | SourceRow[] |  |  | partial-results: failed/ok source rows. |
| `actions` | { label, kind, onClick }[] | ✓ |  | 1–2 buttons. Fills vary: SAY IT AGAIN(primary)/REPHRASE(outline), CONFIRM(warning)+CANCEL, RETRY(primary)+DISMISS, WAIT+DISMISS(both outline), KEEP RUNNING(primary)+COME BACK LATER, RETRY FAILED(primary)+VIEW NOTES, ALLOW MICROPHONE(primary) + 'or type instead' line. |

**Variants:** `no-results: accent $border-hover (neutral), `search-x` $muted-foreground, SAY IT AGAIN + REPHRASE`, `needs-confirmation: accent $warning, `badge-alert`, target chip, CONFIRM($warning)+CANCEL`, `ambiguous: accent $primary, `git-fork`, Picks list + 'say it again' line`, `connection: accent $destructive, `wifi-off`, Meta 'OFFLINE…', RETRY($primary)+DISMISS`, `rate-limited: accent $warning, `timer-off`, Meta 'RETRY IN 3:00', WAIT+DISMISS (mobile omits actions — divergence)`, `timeout/taking-longer: accent $warning, `hourglass`(screen)/`timer`(showcase), KEEP RUNNING($warning/$primary)+COME BACK LATER`, `partial-results: accent $warning, `circle-alert`, Sources list, RETRY FAILED($primary)+VIEW NOTES`, `mic/microphone-blocked: accent $destructive, `mic-off`, ALLOW MICROPHONE($destructive/$primary) + 'or type your request instead' line`

**States:** `recoverable error (all 8)`, `mobile variant (some omit accent stripe; rate-limited omits actions)`, `showcase variant: left-3px-border form (no-results/timeout/connection/mic)`

**Tokens:** `$card`, `$border`, `$border-hover`, `$muted-foreground`, `$muted-foreground-subtle`, `$warning`, `$warning-foreground`, `$primary`, `$primary-foreground`, `$destructive`, `$destructive-foreground`, `$foreground`, `$card-elevated`

**A11y:** `role="alert"` for destructive (connection/mic), `role="status"` for advisory (rate-limited/timeout/partial/no-results); color never sole channel — header text + icon carry semantics; action buttons real & labelled; ambiguous picks are buttons; mic variant: provide the keyboard/type fallback as a real affordance; meta countdowns announced via aria-live where they change

## ErrorStateCard

**Kind:** molecule · **Canonical id:** `d2mdF` · **shadcn:** Card + Alert semantics + Button · **REF:** intake-tracker `error-boundary.tsx`.

Recoverable, per-feature error/edge-state card for the Task Agent. (App-level crash = separate `ErrorBoundaryFallback`.)

### Anatomy — SCREEN (GZ7xA §04, AUTHORITATIVE)
```
Card [fill $card, border 1px $border]
├─ Accent  frame h2, fill = severity color
└─ Body [pad16]
   ├─ Header Row: icon + Header (mono 12)  [severity color]
   ├─ Body (DM Sans 13 $muted-foreground)
   ├─ (optional) Target chip / Picks list / Meta line / Sources list
   └─ Actions: 1–2 Buttons (fills per variant)
```
Canonical d2mdF differs: a **left 3px $muted-foreground** border + single 'SAY IT AGAIN' button.

### Variant matrix (8, UNION of §04 cells)
| variant | accent | icon | extra | actions |
|---|---|---|---|---|
| no-results | $border-hover | `search-x` | — | SAY IT AGAIN(primary)+REPHRASE |
| needs-confirmation | $warning | `badge-alert` | Target chip | CONFIRM($warning)+CANCEL |
| ambiguous | $primary | `git-fork` | Picks + 'say it again' | (picks) |
| connection | $destructive | `wifi-off` | Meta 'OFFLINE…' | RETRY(primary)+DISMISS |
| rate-limited | $warning | `timer-off` | Meta 'RETRY IN 3:00' | WAIT+DISMISS (mobile omits) |
| timeout | $warning | `hourglass` | — | KEEP RUNNING+COME BACK LATER |
| partial-results | $warning | `circle-alert` | Sources list | RETRY FAILED(primary)+VIEW NOTES |
| mic | $destructive | `mic-off` | type-fallback line | ALLOW MICROPHONE + 'or type instead' |

### Props
`variant` (req), `icon?`, `header` (req), `body` (req), `meta?`, `target?`, `picks?`, `sources?`, `actions[]` (req).

### Reconciliation
Screens win → **top accent bar** (not left border), pad16, variable slots, per-variant button fills. Accent = severity (neutral/warning/destructive/primary). Always render actions (fix mobile rate-limited gap). Ambiguous overlaps DisambiguationPicker (this is the in-result form). Distinct from app-level ErrorBoundaryFallback.

### a11y
`role=alert` (danger) / `role=status` (advisory); icon+text carry semantics; real labelled buttons; mic type-fallback is real; announce countdowns.

**Screen usages:** GZ7xA §04 'Errors & Edge States' — 8 desktop cells (01 NO RESULTS, 02 NEEDS CONFIRMATION, 03 AMBIGUOUS, 04 CONNECTION, 05 RATE LIMITED, 06 TIMEOUT, 07 PARTIAL, 08 MIC) + 6 mobile stacked states; RcvKu showcase 'spec/ErrorStateCard' — canonical d2mdF (no-results) + timeout + connection + mic refs (LEFT-border form); usage map: 'All 8 desktop error cells + the mobile error stack collapse to ErrorStateCard'

**Reconciliation (screen ← library):** The single biggest reconciliation. Canonical d2mdF uses a LEFT 3px $muted-foreground border, a single icon+header+body, and ONE 'SAY IT AGAIN' button — the showcase also varies it (timeout→$warning, connection/mic→$destructive) via left-border restyle. The SCREEN §04 (authoritative) instead uses a TOP 2px Accent bar colored by severity, pad16, and a VARIABLE body: optional Target chip (needs-confirmation), Picks list (ambiguous — note this overlaps DisambiguationPicker; ambiguous-as-error is the gallery form), Meta line (connection/rate-limited), Sources list (partial-results), and 1–2 buttons with per-variant fills. Contract is WIDENED to the 8-variant union with `target`/`picks`/`sources`/`meta`/`actions[]` slots and an `accent` driven by `variant`. Triage flags: accent token must match severity (no-results=$border-hover neutral; closing/advisory=$warning; danger=$destructive; ambiguous=$primary); mobile omits the accent stripe and the mobile RATE-LIMITED card is missing its action buttons — reconcile by ALWAYS providing the actions (screen-desktop wins). The 'needs-confirmation' error overlaps the needsConfirmation Toast and the screen-01 Confirm Bar — these are three confirmation surfaces; ErrorStateCard is the in-result-context form. Distinct from the app-level ErrorBoundaryFallback (separate component).

---

## DisambiguationPicker

**Kind:** organism  ·  **maps_to (camp-404):** REF intake-tracker `voice-panel.tsx` review/pick idiom; Dialog reserved (brief §14 'Dialog for voice disambiguation only') for >3 candidates. Build on shadcn Card + Button.  ·  **maps_to (shadcn):** shadcn Card (or Dialog for >3) + candidate Buttons + CategoryTag + confidence Badge.
  ·  **composes:** CategoryTag (candidate category), Badge / ConfidencePill (confidence %), Button (candidates + SAY IT AGAIN), Dialog (>3 candidates — brief §14)

**Anatomy:** CANONICAL (cLP7O): Card[vertical, gap14, pad18] → { Head (gap9, center) → `git-fork` 15 $warning + Title (mono 12/700 ls1.5 $warning 'DISAMBIGUATION') ; Prompt (DM Sans 14, '2 tasks match "permit" — pick the one…') ; Candidates (vertical gap10) → 3× Candidate [card-elevated; top candidate stroke $primary, others $border; pad12/14] → { Top → Name (DM Sans 15/600) + Pct (mono 14/700, success/warning/muted by threshold) ; Meta → CategoryTag ref + Confidence badge ref } ; Retry (h44, 1px $border, `mic` + 'SAY IT AGAIN' mono 12/600) }. SCREEN inline (GZ7xA §01, authoritative for that surface): lighter candidates = Dot (category-tone ellipse 9px) + {Name DM Sans 14/500 + Category label} + Pct — NO CategoryTag/Confidence-badge refs.

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `prompt` | string | ✓ |  | e.g. '2 tasks match "permit" — pick the one to attach research to.' |
| `candidates` | { id, name, category, confidence, selected? }[] | ✓ |  | 2–3 inline; >3 → Dialog. Each: name + category + match %; top/selected gets $primary stroke. |
| `onPick` | (id) => void | ✓ |  | Re-issues the resolved intent. |
| `onRetry` | () => void |  |  | 'SAY IT AGAIN' voice retry. |
| `variant` | 'panel' | 'inline' | 'toast' |  | 'panel' | panel = full card (CategoryTag+Confidence badge, retry); inline = GZ7xA §01 light dot+name+cat+pct; toast = the lightweight 2-pick Toast cousin. |
| `candidateRender` | 'tag' | 'dot' | 'chevron' |  |  | tag=Badge layout (gallery cell 03); dot=category ellipse (desktop inline); chevron=mobile name+chevron+category-chip+confidence (three divergent renderings). |

**Variants:** `panel (canonical cLP7O): git-fork $warning header, 3 candidates with CategoryTag + Confidence badge, top $primary-bordered, SAY IT AGAIN retry`, `inline (GZ7xA §01): dot(category tone)+name+category-label+Pct, top $primary-bordered, no badges`, `gallery-cell-03 (GZ7xA §04 'AMBIGUOUS'): name + Tag(Badge) + 'none of these? say it again' line (no dot) — also expressible via ErrorStateCard ambiguous variant`, `mobile: name + chevron + category-chip-with-icon + confidence`, `toast (T2BChB): 2 picks {name + window/category code} — the lightweight inline picker`, `confidence %: ≥85 $success, ≥50 $warning, else $muted-foreground`

**States:** `pick-pending (awaiting selection — persistent, no auto-dismiss)`, `top candidate pre-highlighted ($primary stroke)`, `retry (voice re-ask)`

**Tokens:** `$card`, `$card-elevated`, `$border`, `$primary`, `$warning`, `$success`, `$muted-foreground`, `$foreground`, `$cat-bureaucratic`, `$cat-travel`, `$cat-gear`

**A11y:** `role="dialog"`/`aria-modal` when rendered as Dialog (>3); else `role="group"` `aria-label="Disambiguation: pick a task"`; each candidate is a button; arrow-key navigable; top candidate gets initial focus; confidence as text not color alone; git-fork icon `aria-hidden`; persistent (no auto-dismiss) until pick or retry

## DisambiguationPicker

**Kind:** organism · **Canonical id:** `cLP7O` · **shadcn:** Card (or Dialog for >3) + Button + CategoryTag · **camp:** REF voice-panel review idiom.

Candidate task pick-list when a voice command matches multiple tasks. Persistent until pick/retry.

### Anatomy — canonical (cLP7O, `variant='panel'`)
```
Card [vertical, gap14, pad18]
├─ Head: `git-fork` $warning + 'DISAMBIGUATION' (mono 12/700 ls1.5 $warning)
├─ Prompt (DM Sans 14)
├─ Candidates (gap10): 3× [card-elevated; top=stroke $primary, rest $border; pad12/14]
│   ├─ Top: Name (DM Sans 15/600) + Pct (mono 14/700, threshold color)
│   └─ Meta: CategoryTag + Confidence badge
└─ Retry [h44, 1px $border]: `mic` + 'SAY IT AGAIN'
```

### Screen renderings (UNION)
| variant / render | candidate row |
|---|---|
| inline (GZ7xA §01) | category-tone dot + name + category label + Pct (no badges) |
| gallery cell 03 / ErrorStateCard ambiguous | name + Tag(Badge) + 'say it again' line |
| mobile | name + chevron + category chip + confidence |
| toast (T2BChB) | 2 picks: name + bare code |

### Props
`prompt` (req), `candidates[]{id,name,category,confidence,selected?}` (req), `onPick` (req), `onRetry?`, `variant?`='panel', `candidateRender?`.

### Confidence color
≥85 $success · ≥50 $warning · else $muted-foreground.

### Reconciliation
Screens win → `variant`+`candidateRender` span all 5 renderings. >3 candidates → Dialog (brief §14). Shares confidence threshold with ParsedIntentPanel; sibling to ErrorStateCard 'ambiguous' + disambiguation Toast.

### a11y
Dialog `aria-modal` for >3, else `role=group`; candidates are arrow-navigable buttons, top focused; confidence as text; persistent.

**Screen usages:** GZ7xA §01 inline 'Disambiguation' — 3 candidates (Tankwa Land-Use 92% bureaucratic / Vehicle Pass 64% travel / Burn Permit·Art Grant 41% gear), dot+name+cat+pct; GZ7xA §04 cell 03 'AMBIGUOUS' — name+Tag picks + 'say it again' line; RcvKu showcase 'Spec · DisambiguationPicker' canonical cLP7O (CategoryTag + Confidence badge refs); T2BChB §02 Disambiguation Toast — 2 picks (lightweight); mobile 'Disambiguation' — name+chevron+category-chip+confidence

**Reconciliation (screen ← library):** Three+ structurally divergent renderings (triage 'DisambiguationPicker — three divergent renderings'): (a) canonical cLP7O panel with CategoryTag + Confidence badge refs + SAY IT AGAIN; (b) GZ7xA §01 inline = category-tone dot + name + category label + Pct (no badges, top $primary-bordered); (c) gallery cell 03 = name + Tag(Badge) + 'say it again' line; (d) mobile = name + chevron + category chip + confidence; (e) T2BChB toast = 2 picks with bare codes. Per source-of-truth the SCREENS define the real variants → contract carries `variant` ('panel'|'inline'|'toast') + `candidateRender` ('tag'|'dot'|'chevron') so one component spans all renderings. Confidence %→color threshold shared with ParsedIntentPanel. Brief §14 reserves Dialog for >3 candidates. The 'ambiguous' ErrorStateCard variant and the disambiguation Toast are sibling lightweight forms of the same intent.

---

## ResearchAttachedBadge

**Kind:** atom  ·  **maps_to (camp-404):** No camp source — small pulse Badge. ADAPT `badge.tsx` (new primary 'researching' tone).  ·  **maps_to (shadcn):** shadcn Badge (primary tint) with a pulsing dot + live timer.
  ·  **composes:** (leaf atom; visually relates to MinimizedJobPill + AINotesBlock; sits on TaskCard/MissionDetailHeader)

**Anatomy:** frame[fill `#ff6b351f`(primary/12), border 1px $primary, gap6, pad4/8, center] (id y16GIJ) → { Pulse (ellipse 6×6 $primary, animated) + Label (mono 10/700 ls1 $primary 'RESEARCHING') + Timer (mono 10/700 ls0.5 $primary '00:42') }. Binds a live research job to a task card (sits on the Target Card / detail header).

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `elapsedLabel` | string (mm:ss) | ✓ | '00:42' | Live elapsed timer of the bound job. |
| `label` | string |  | 'RESEARCHING' | Status label. |
| `onClick` | () => void |  |  | Optional: expand to the ResearchJobPanel / MinimizedJobPill. |

**Variants:** `researching (only documented state): pulse dot + 'RESEARCHING' + timer, primary/12 tint`

**States:** `active (job running, pulsing)`, `(implicitly removed when the job completes → replaced by AINotesBlock 'NEW' pill)`

**Tokens:** `#ff6b351f (primary/12 — triage flags raw hex; use bg-primary/12)`, `$primary`

**A11y:** `role="status"` `aria-label="Research running, {elapsed} elapsed"`; pulse dot decorative `aria-hidden`; respect reduced-motion; timer changes announced politely (or not, to avoid spam — prefer label only)

## ResearchAttachedBadge

**Kind:** atom · **Canonical id:** `y16GIJ` · **shadcn:** Badge (primary tint, pulsing).

Inline pulse badge binding a live research job to a task card.

### Anatomy
```
frame [fill primary/12, border 1px $primary, gap6, pad4/8, center]
├─ Pulse  ellipse 6×6 $primary  [animated, aria-hidden]
├─ Label  'RESEARCHING'  mono 10/700 ls1 $primary
└─ Timer  '00:42'        mono 10/700 ls0.5 $primary
```

### Variants / states
`researching` (only). active (pulsing) → removed/replaced by AINotesBlock 'NEW' pill on completion.

### Props
`elapsedLabel` (req mm:ss), `label?`='RESEARCHING', `onClick?`.

### Reconciliation
Canonical = screen; was ad-hoc 'ResearchBadge', now registered. Replace raw `#ff6b351f` with `bg-primary/12`. Optional click re-opens the job panel.

### a11y
`role=status`; pulse `aria-hidden`/reduced-motion; prefer label-only announcement.

**Screen usages:** GZ7xA §02 Rail — 'ResearchBadge' on the bound Target Card; GZ7xA §03 — conceptually the 'NEW' pill / research-attached flag on the notes block; RcvKu showcase 'Spec · ResearchAttachedBadge' canonical y16GIJ

**Reconciliation (screen ← library):** Canonical y16GIJ matches the screen. It was rendered ad-hoc on boards as 'ResearchBadge' (id l3MpUu) and never formally registered — now canonicalized. Triage flags the raw `#ff6b351f` tint → use `bg-primary/12` per token convention. It binds a live job to a task; on completion it gives way to the AINotesBlock attribution + 'NEW' pill. Optional `onClick` added to let it re-open the job panel (canonical is visual-only).

---

## VoiceQueryResultCard

**Kind:** organism  ·  **maps_to (camp-404):** No camp source — composed read-only answer panel. Build on shadcn Card with a left accent rail.  ·  **maps_to (shadcn):** shadcn Card with a 3px primary left rail over card-elevated content (info-tinted, role=status).
  ·  **composes:** (composed leaf organism; conceptually paired with Toast info variant and AINotesBlock; window codes could later use WindowStatePill)

**Anatomy:** frame[width 540, fill $primary, pad-left 3 → left rail, vertical] (id YMkie) → Content [fill $card-elevated, vertical, gap12, pad18] → { Header (gap8, center) → `calendar-clock` 15 $primary + Header (mono 12 ls1.5 $primary 'CLOSING THIS WEEK') ; Answer (DM Sans 13 lineHeight1.45 $foreground '3 tasks close before the Tankwa gates open.') ; Task List (vertical) → 3× Row [pad10/0, top 1px $border between rows] → Name (mono 12 ls0.5 $foreground) + Window (mono 11 ls1 $muted-foreground, e.g. 'MON–WED' / 'TUE 17:00' / 'THU–FRI') }. On T2BChB the panel adds an extra OUTER 1px $border stroke the canonical lacks.

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `header` | string | ✓ |  | Mono caps answer category, e.g. 'CLOSING THIS WEEK', 'WHAT'S BLOCKING ME'. |
| `icon` | LucideIcon |  | calendar-clock | Topic icon. |
| `answer` | string | ✓ |  | Short DM Sans natural-language answer. |
| `tasks` | { name, window }[] |  |  | Mono task list (name + window/time code); divided by top borders. |
| `durationMs` | number |  | 8000 | Transient, longer dwell (~8s) than confirmation toasts; NO action buttons. |
| `onExpand` | () => void |  |  | Brief §11 offers an 'expand' for longer answers. |

**Variants:** `closing-this-week (shown): calendar-clock + 3-row window list`, `(extensible by query topic — e.g. blocking/closed; same shell, different icon/header/rows)`, `T2BChB drift: extra outer 1px $border around the rail`

**States:** `transient (auto-dismiss ~8s)`, `populated (with task list)`, `no-list (answer-only)`, `(NEVER mutates — read-only)`

**Tokens:** `$primary`, `$card-elevated`, `$foreground`, `$muted-foreground`, `$border`

**A11y:** `role="status"` `aria-live="polite"` (read-only answer — explicitly NOT an alert); NO action buttons (distinct from the warning confirmation toast); calendar-clock icon `aria-hidden`; task list as a list; window codes read with task names

## VoiceQueryResultCard

**Kind:** organism · **Canonical id:** `YMkie` · **shadcn:** Card + 3px primary left rail (info-tinted, role=status).

Transient read-only answer to a spoken **query** (e.g. 'what's closing this week?'). **Never mutates.** Distinct from the warning confirmation Toast and from the persistent AINotesBlock.

### Anatomy
```
frame [w540, fill $primary, pad-left 3 → left rail]
└─ Content [fill $card-elevated, vertical, gap12, pad18]
   ├─ Header: `calendar-clock` 15 $primary + 'CLOSING THIS WEEK' (mono 12 ls1.5 $primary)
   ├─ Answer  DM Sans 13 lh1.45 $foreground
   └─ Task List: 3× Row [pad10/0, top 1px $border] → Name (mono 12 $foreground) + Window (mono 11 $muted-foreground, 'MON–WED'/'TUE 17:00')
```
T2BChB adds an outer 1px $border the canonical lacks.

### Variants / states
closing-this-week (shown); extensible per query topic. transient (~8s) · populated · answer-only. **No actions.**

### Props
`header` (req), `icon?`=`calendar-clock`, `answer` (req), `tasks[]{name,window}?`, `durationMs?`=8000, `onExpand?`.

### Reconciliation
Screens win → add the optional outer 1px $border (default `bordered`). Strictly read-only, info-tinted, NO buttons — never confused with the needsConfirmation Toast (brief anti-state). Window codes are plain mono text (WindowStatePill not used here).

### a11y
`role=status`/polite (NOT alert); no action buttons; icon `aria-hidden`; list reads name+window.

**Screen usages:** T2BChB §03 'Voice Query Result' — 'CLOSING THIS WEEK' + answer + 3-row list (Theme camp MON–WED / Tankwa permit TUE 17:00 / MEDEVAC THU–FRI), 'TRANSIENT — NO ACTIONS' caption; RcvKu showcase 'Spec · VoiceQueryResultCard' canonical YMkie; GZ7xA §03 Result & Notes is the persistent counterpart (AINotesBlock); this is the transient answer; brief §11 'Voice query result (distinct from confirmation)'

**Reconciliation (screen ← library):** Canonical YMkie matches the T2BChB screen almost 1:1 (540px, 3px $primary left rail over $card-elevated, calendar-clock header, 3 rows, identical copy). The ONLY divergence: the T2BChB 'Query Panel' wraps it in an extra outer 1px $border the canonical lacks (triage). Per source-of-truth, ADD the optional outer border (screen wins) — make it the default or a `bordered` flag. This is the TRANSIENT, info-tinted, NO-ACTIONS answer surface — explicitly distinct from the warning needsConfirmation Toast (brief §11/§12 anti-state: don't confuse with confirmation) and from the persistent AINotesBlock result. role=status, ~8s dwell, optional expand. Window/time codes are plain mono text (WindowStatePill is NOT used here — triage 'plain-text drift', acceptable for a transient compact answer).

---
