# Surface Spec — Voice & Toasts (states) (`T2BChB`) · P0

*Source: `docs/design-extract/boards/T2BChB__*.json` (screen authoritative). 2 scoped sections.*

# Voice Capture Pipeline — VoiceFAB Lifecycle (idle · requesting · recording · processing · error)

*scope: voice-capture-lifecycle (VoiceFAB + RecordingPanel + Spinner + error)*

## Voice Capture Pipeline — VoiceFAB Lifecycle

**Board:** `T2BChB` — "OpsBoard — Voice & Toasts (states)" → **Section `01 · VOICE FAB`** (frame `fwYQf`).
**Scope of this section:** the entire voice-*input* surface — the single VoiceFAB affordance across its lifecycle states. Feedback surfaces (toasts, disambiguation, voice-query result) are specced separately. The screen is authoritative; where the board diverges from the canonical 82-component library, the board wins and the component contract is widened to serve it.

> **SOURCE-OF-TRUTH NOTE.** This board lays out the FAB as a **specimen gallery** of state cells (`State · Idle`, `State · Recording`, `State · Processing`, `State · Error`) inside a 1040×200 `layout:none` container (`yUVIR`), each cell 240px wide and absolutely positioned at x = 0 / 266 / 533 / 800. The captions (`IDLE`, `RECORDING`, `PROCESSING`, `ERROR`) and the section chrome (`VOICE COMMAND & FEEDBACK` title, `Component states — voice capture, toasts and query results` subtitle, `01 · VOICE FAB` header) are **documentation framing, not shippable UI**. The *shippable* artifact is a single fixed-position FAB that renders ONE state at a time and transitions between them. This spec describes the runtime FAB; the gallery just enumerates its visual states.

---

### 1. Purpose

The VoiceFAB is the **one and only direct-input affordance** in an otherwise read-only board. It drives the voice command pipeline: **mic → record → transcribe → intent → confirmation**. Tapping/holding it captures audio; on release the transcript is POSTed to the command endpoint (never appended to a text field). Every other interaction on the board is the StatusCycleButton tap; this FAB is how a user creates/mutates/queries by voice or asks read-only questions.

---

### 2. Placement & shell integration (runtime, not drawn on this board)

- **Fixed, circular, bottom-right** on BOTH desktop and mobile. Design-brief §11.1 is a deliberate override of product-brief §3 ("thumb-center"): toasts anchor bottom-center, the FAB anchors bottom-right, so a persistent confirm toast never collides with the mic.
- z-index above content (`z-150` per brief §8), above the Toaster which sits at bottom-center (mobile) / bottom-right (desktop) and must raise above the FAB.
- Mobile: `padding-bottom: env(safe-area-inset-bottom)`.
- **Drawn FAB diameter on this board = 72px** (`width:72 height:72 cornerRadius:36`). Design-brief §11 specifies the shipped FAB at **56–64px**; the mobile Category board (`yQ4mM`) renders it at **56px**. RECONCILE: the 72px here is a gallery-zoom rendering; ship at 56px (mobile) / up to 64px (desktop), keep `cornerRadius = diameter/2` (perfect circle). Flagged as open item.

---

### 3. Layout of each gallery state cell (exact, top → bottom)

All four cells share this structure (frame, `layout:vertical`, `width:240`, `gap:14`, `padding:8`, `alignItems:center`):

```
Cell (240w, vertical, gap 14, pad 8, center)
├─ Caption        text, JetBrains Mono 11 / weight normal / tracking 1.5, fill $muted-foreground
├─ Visual         frame, fill_container width, height 120, gap 16, justify center, align center
│                 └─ [state-specific button + adornments]
└─ Hint           text, JetBrains Mono 11 / weight normal / tracking 1, fill per-state
```

The runtime FAB = the **Visual** block (the button + any adornments). The **Hint** is the inline status label that renders beside/under the button when active. Caption text is gallery-only.

---

### 4. State-by-state rendering (exact px / tokens / icons / literal text)

#### 4.1 `idle` — cell `kcGtQ`
- **Button** (`Z1R5Fr`): 72×72, `cornerRadius:36`, **fill `$primary` (#ff6b35)**, justify+align center. No stroke. No ring.
- **Icon** (`VW9jB`): lucide **`mic`**, **30×30**, fill **`$primary-foreground` (#0a0a0c)**.
- **Hint** (`S045y`): literal **`TAP TO RECORD`**, fill `$muted-foreground` (#7a7a8e).
- Semantics: orange-on-near-black, at rest, inviting a tap/hold.

#### 4.2 `requesting` / mic-permission — **NOT ON BOARD (open item, must be added)**
- Design-brief §11 enumerates 5 states (idle · **requesting** · recording · processing · error). The board renders only 4 — the permission/`requesting` state is **absent**. Screens are authoritative on what IS drawn, but this is a documented gap the build must fill.
- **Prescribed contract** (derived from brief + the processing cell's idiom): button shows a **spinner** (orange `Loader`/`loader-circle`), Hint literal **`ALLOW MICROPHONE…`**, fill `$muted-foreground`. Visually closest to the Processing cell (muted button + bordered ring + orange loader) so transcription and permission share one "busy" treatment; differentiate by Hint copy only. Triggered when `navigator.mediaDevices.getUserMedia` is pending the OS/browser permission prompt. If denied → transition to `error` with a permission-specific retry hint.

#### 4.3 `recording` — cell `SUKpb`
- **Ring Wrap** (`nKet2`): 96×96 `layout:none` positioning frame.
  - **Pulse Ring** (`mxDl5`): ellipse 96×96 at (0,0), **stroke `$destructive` (#e05a5a)**, **strokeWidth 2**, no fill. This is the "sharp glow/pulse ring on active" (tactical idiom — a stroked ring that animates scale/opacity, NOT a soft box-shadow glow).
  - **Button** (`niilB`): 72×72 at (12,12) inside the 96px wrap (12px inset → ring is a 12px halo), `cornerRadius:36`, **fill `$destructive` (#e05a5a)** (button flips from orange→red), justify+align center.
  - **Stop Icon** (`qXPPs`): lucide **`square`**, **24×24** (note: SMALLER than the 30px idle Mic), fill **`$destructive-foreground` (#fafafa)**.
- **Meta** (`GuixM`): vertical, gap 8, sits to the right of the ring (parent Visual is horizontal, gap 16):
  - **Waveform** (`wUjxw`): horizontal frame, **height 34**, **gap 3**, align center. **10 bars**, each a `rectangle` **3px wide**, fill **`$primary` (#ff6b35)** (waveform stays ORANGE even though the button is red). Bar heights in order: **12, 22, 30, 18, 34, 14, 26, 20, 28, 12** (ids `hDMax`/`U7C3y`/`ScPPh`/`XMIvP`/`wsu1s`/`wUrqU`/`BQDJQ`/`OWtRy`/`IXt3O`/`Z5kSHi`). Max bar = 34 (= frame height). At runtime these animate from live audio amplitude.
  - **Timer** (`p3ypeS`): literal **`00:07`** (mm:ss), JetBrains Mono **18px**, tracking 1, fill **`$foreground` (#e8e8f0)**. Stacked UNDER the waveform.
- **Hint** (`ntetW`): literal **`● TAP TO STOP`** (leading U+25CF filled circle as a "REC" dot baked into the string), fill **`$destructive` (#e05a5a)**.

#### 4.4 `processing` / transcribing — cell `uDTbs`
- **Button** (`f43co`): 72×72, `cornerRadius:36`, **fill `$muted` (#131318)**, **stroke `$border` (#2a2a38)**, **strokeWidth 1**, justify+align center. (Button no longer colored; becomes a quiet bordered well.)
- **Loader Icon** (`PAmqB`): lucide **`loader`**, **30×30**, fill **`$primary` (#ff6b35)** (orange spinner). Spins at runtime.
- **Hint** (`l6FzW`): literal **`TRANSCRIBING…`** (with U+2026 ellipsis), fill `$muted-foreground` (#7a7a8e).

#### 4.5 `error` / retry — cell `KgVFG`
- **Err Stack** (`Sbai0`): vertical, gap 10, center.
  - **Button** (`TXXVH`): 72×72, `cornerRadius:36`, **fill `$muted` (#131318)**, **stroke `$destructive` (#e05a5a)**, **strokeWidth 1** (red outline replaces the processing-state grey border), justify+align center.
  - **Alert Icon** (`lwHGv`): lucide **`triangle-alert`**, **28×28** (note: distinct from idle 30 / recording-stop 24), fill **`$destructive` (#e05a5a)**.
  - **Red Line** (`fDa9o`): rectangle **64×2**, fill **`$destructive` (#e05a5a)** — a bespoke "inline red line" underscore motif directly below the button (matches brief's "inline red line, role=alert").
- **Hint** (`S7NPuk`): literal **`TAP TO RETRY`**, fill **`$destructive` (#e05a5a)**.

---

### 5. Color & sizing rules (consolidated)

| Rule | Value |
|---|---|
| Idle button fill | `$primary` #ff6b35; icon fill `$primary-foreground` #0a0a0c |
| Recording button fill | `$destructive` #e05a5a; icon fill `$destructive-foreground` #fafafa |
| Processing/Error button fill | `$muted` #131318 (processing border `$border`; error border `$destructive`, both 1px) |
| **Pulse ring color (board)** | **`$destructive` #e05a5a, solid, 2px stroke** — DIVERGES from canonical orange-35% ring. Board is authoritative → ring is **red** in recording. |
| **Waveform color** | `$primary` #ff6b35 (orange) — stays orange while button is red (intentional, matches brief) |
| Timer / answer text fill | `$foreground` #e8e8f0 |
| Hint fill (idle/processing) | `$muted-foreground` #7a7a8e |
| Hint fill (recording/error) | `$destructive` #e05a5a |
| Button diameter (board) | 72px; **ship 56–64px** (see §2) |
| Icon sizes | Mic 30 · Square 24 · Loader 30 · TriangleAlert 28 (all lucide) |
| Pulse ring inset | 12px (96px ring around 72px button) |
| Corner radius | 36 (button); board global `radius` token = 0 (everything else sharp) — the FAB is the explicit `rounded-full` exception per brief §3 |

---

### 6. Icon manifest (lucide library)

| State | Board icon name | Size | Brief name | Reconcile |
|---|---|---|---|---|
| idle | `mic` | 30 | `Mic` | Board 30 vs canonical VoiceFAB Mic 28 → ship at one size (recommend 28 to match canon, but board=30 is authoritative; flag). |
| recording | `square` | 24 | `Square` | Match. |
| processing | `loader` | 30 | `Loader2` | Board uses `loader`; canonical Spinner uses `loader-circle`; brief says `Loader2`. Three different names → pick ONE (recommend `loader-circle`/`Loader2` spinning variant; board=`loader` is authoritative for THIS surface). Flag. |
| error | `triangle-alert` | 28 | `AlertTriangle` | Same glyph, lucide-react export name `AlertTriangle`. |
| requesting (missing) | — | — | spinner | Add: reuse processing `loader` treatment. |

---

### 7. Interaction model

- **Capture trigger:** push-to-talk via `onPointerDown` (start) / `onPointerUp` + `onPointerLeave` + `onPointerCancel` (stop), OR tap-to-toggle. The board copy supports tap-toggle (`TAP TO RECORD` → `TAP TO STOP` → `TAP TO RETRY`). Build BOTH: pointer-hold for press-and-hold, single-tap to latch into recording and tap again to stop. (Open decision: which is default — brief offers both.)
- **State machine:**
  - `idle` —(pointerdown / tap)→ `requesting` (if permission not yet granted) → `recording`; if permission already granted, skip straight to `recording`.
  - `requesting` —(denied)→ `error` (permission hint); —(granted)→ `recording`.
  - `recording` —(pointerup / tap-stop)→ `processing`.
  - `processing` —(transcript OK)→ pipeline hands off to intent/confirmation (toast surface), FAB returns to `idle`; —(failure)→ `error`.
  - `error` —(tap)→ `requesting`/`recording` (retry) — the whole error button is the retry target (`TAP TO RETRY`).
- **On transcript:** POST to the command endpoint. NEVER append text to an input field (read-only board).
- **The FAB itself never confirms destructive intents** — that is gated by the needsConfirmation toast (separate section). The FAB only captures.
- **Touch target:** the visual button is 56–72px and is itself an ample ≥44px tap target; no separate hit-area frame is drawn.

---

### 8. Accessibility

- **Button role:** `button` with an `aria-label` that reflects state — idle `"Record voice command"`, recording `"Stop recording"`, processing `"Transcribing"`, error `"Voice command failed — tap to retry"`.
- **Live state announcement:** wrap the status Hint in `aria-live="polite"` for idle→recording→processing transitions; the **error** Hint/cell carries **`role="alert"`** (per brief: "inline red line, `role=alert`") so it is announced assertively.
- **Pulse ring** (`mxDl5`) and the **waveform** bars are decorative → **`aria-hidden="true"`** (the timer + status label carry the semantic info). This matches the brief's "scanline/pulse always decorative/aria-hidden" rule.
- **Timer:** expose elapsed seconds to AT via the `aria-label` (e.g. "Recording, 7 seconds") rather than relying on the mono `00:07` glyph.
- **Reduced motion:** honor `prefers-reduced-motion` — pause the pulse-ring scale animation and freeze the waveform/loader spin to a static frame.

---

### 9. Data & logic contracts

- **Inputs:** microphone stream via `getUserMedia`; live amplitude samples feed the 10-bar waveform (board bars are static placeholders 12–34px tall; runtime maps amplitude → height capped at 34px). Elapsed timer = `mm:ss` from record-start, mono.
- **Outputs:** on stop → audio blob → transcription → POST `{transcript}` to the command endpoint. Response routes to the feedback surfaces (success / needsConfirmation / disambiguation / error toasts / voice-query panel) — none of which this FAB renders.
- **No persisted state:** the FAB lifecycle is ephemeral client state (a small state machine); nothing here writes to the task store directly. `blocked`/window-state are never computed here.
- **Error sources:** permission denied (requesting→error), transcription failure, command-endpoint failure/parse failure → `error` state; `TAP TO RETRY` re-enters the pipeline at recording.

---

### 10. Divergence from canonical components (board is authoritative)

1. **VoiceFAB is idle-only canonically** (single tree: 96px wrap, orange pulse ring ~35% alpha #ff6b3559, 72px button, 28px Mic). The board invents **4 bespoke flattened state cells** with no shared component basis and **none ref the canonical**. → **Widen VoiceFAB to a stateful component** owning all five lifecycle states (idle/requesting/recording/processing/error) rather than splitting non-idle states into RecordingPanel/Spinner/ErrorStateCard.
2. **Pulse ring** is **solid `$destructive` 2px** on the board vs canonical **orange #ff6b3559 (~35% alpha)**. Board wins → recording ring is RED.
3. **Waveform** here is a tiny inline **10-bar @3px (max h34)** block beside the button; canonical RecordingPanel waveform is **~40 bars @4px full-width** inside a full card. The FAB does NOT use RecordingPanel — it flattens its own compact waveform. → For the FAB recording state, the compact 10-bar inline waveform is canonical.
4. **Timer** is **18px stacked under the waveform**; canonical RecordingPanel Timer is **13px / weight 600 in a space-between top row**. Board wins for the FAB.
5. **Processing loader** uses lucide **`loader` @30px inside a 72px muted button**; canonical Spinner is **`loader-circle` @20px in an inline row** with a `PROCESSING COMMAND…` label. The FAB does NOT compose Spinner — it embeds a loader icon in the button.
6. **Error FAB has no canonical equivalent.** The muted-button + `$destructive` border + `triangle-alert` + 64×2 red underline (`Red Line`) is a **net-new motif**; it must become the canonical VoiceFAB `error` variant (not the search/no-results ErrorStateCard, and not ErrorBoundaryFallback).
7. **`requesting` state is missing** from the board (4 of 5 brief states drawn). Must be added in build.
8. **Diameter** drawn at 72px (gallery zoom) vs shipped 56–64px.

---

### 11. Coverage checklist
- [x] Purpose of the voice-input surface
- [x] Fixed bottom-right placement (desktop + mobile), z-order, safe-area, toast-collision rationale (§11.1)
- [x] Gallery vs runtime distinction (specimen cells are documentation-only)
- [x] Per-cell layout structure (Caption / Visual / Hint) with exact frame props
- [x] `idle` state: button fill, mic icon name+size, hint copy, tokens
- [x] `requesting` state: flagged MISSING, prescribed contract
- [x] `recording` state: pulse ring (color/stroke/size/inset), button→destructive, Square 24, 10-bar waveform (count/width/gap/heights/color), 18px timer, `● TAP TO STOP` hint
- [x] `processing` state: muted bordered button, orange `loader` 30, `TRANSCRIBING…`
- [x] `error` state: muted button + destructive border, `triangle-alert` 28, 64×2 red line, `TAP TO RETRY`, role=alert
- [x] Color & sizing rules table (every token resolved to hex)
- [x] Full icon manifest with size + name reconciliation
- [x] Interaction state machine + push-to-talk/tap-toggle + POST-not-append rule
- [x] A11y: role=button per-state aria-label, role=alert on error, aria-hidden pulse/waveform, reduced-motion
- [x] Data/logic contracts (getUserMedia, amplitude→waveform, transcript POST, ephemeral state, error sources)
- [x] All 8 drift candidates reconciled (board authoritative)

# Feedback Surfaces — Toasts, Inline Disambiguation & Voice Query Result

*scope: feedback-surfaces-spec*

## Feedback Surfaces — Toasts, Inline Disambiguation & Voice Query Result

**Board:** `T2BChB` — "OpsBoard — Voice & Toasts (states)" (frame `1120 × 1160`, `fill $background`).
**Scope:** Section `02 · TOASTS` (4 toast cells: success / needs-confirmation / disambiguation / command-error) + the **inline Disambiguation toast** + Section `03 · VOICE QUERY RESULT` (transient read-only answer panel). Out of scope (separate spec): Section `01 · VOICE FAB` (`fwYQf`) — referenced only for layout adjacency and shared `role="alert"` semantics.

> **Source-of-truth note:** the screen-flattened renderings on this board are authoritative. Where they diverge from the canonical `Toast` (`kTqS3`), `DisambiguationPicker` (`cLP7O`), or `VoiceQueryResultCard` (`YMkie`) catalog defs, the screen wins and the component contract must be widened to serve it. Divergences from `design-brief.md §14` are informational and called out inline.

---

### 1. Purpose

These surfaces are the **read-back / feedback channel** for the voice + MCP command pipeline. OpsBoard is READ-ONLY apart from `StatusCycleButton`; everything else is driven by voice/MCP. After a command is transcribed → parsed → executed (or gated), the system surfaces one of these:

1. **Success toast** — reports a completed mutation; auto-dismisses (4s). Result-only, no action.
2. **Needs-confirmation toast** — gates a destructive / low-confidence intent behind an explicit tap; **persistent** (no auto-dismiss); carries a `Confirm + Cancel` action row.
3. **Disambiguation toast (inline)** — multiple tasks matched the utterance; offers a short vertical pick-list (2 picks here). Tap-to-pick re-issues the resolved intent. For larger candidate sets this escalates to the full `DisambiguationPicker` dialog (out of this board; see §6).
4. **Command-error toast** — the command could not be parsed/executed; `role="alert"`; tap-to-dismiss.
5. **Voice Query Result panel** — answers a read-only **query** intent ("what's closing this week?") from computed state. **Never mutates.** Transient (~8s dwell), no actions, visually distinct (info/primary accent vs the warning confirm tone).

The board lays them out in a **gallery** (caption + live specimen per cell) for state review, not in their runtime positions; runtime placement is documented in §3.5.

---

### 2. Shared anatomy & token map

All four toasts share one anatomy (canonical `Toast` `kTqS3`):

```
frame Toast [fill $card, stroke $border 1px, layout vertical, width fill_container]
 ├ frame Accent  [width fill_container, height 2, fill $<tone-accent>]   ← tone channel
 └ frame Body    [layout vertical, gap 10, padding 16]
     ├ text Header  (JetBrains Mono, 12, letterSpacing 1, fill $<tone-accent>)
     ├ text Body    (DM Sans, 13, lineHeight 1.4, textGrowth fixed-width, width fill_container, fill varies)
     └ <Meta line  OR  Actions row  OR  Picks list>   ← the variant-specific tail
```

**Accent-token-per-variant map (the tone channel — color is carried by the 2px top Accent bar AND the Header text):**

| Toast variant | Caption (gallery) | Accent fill (token → hex) | Header content + fill | Body fill | Tail |
|---|---|---|---|---|---|
| **Success** (`U0NLW`) | `SUCCESS` | `$success` → `#5ae07a` | `✓ MARKED DONE` · `$success` | `$foreground` `#e8e8f0` | Meta `AUTO-DISMISS · 4S` |
| **Needs-confirmation** (`Lx9uA`) | `NEEDS CONFIRMATION` | `$warning` → `#d9a73e` | `CONFIRM DELETE` · `$warning` | `$foreground` `#e8e8f0` | Actions row (DELETE + CANCEL) |
| **Disambiguation** (`j5Ef9W`) | `DISAMBIGUATION` | `$border-hover` → `#3a3a4a` | `WHICH TASK?` · `$foreground` | `$muted-foreground` `#7a7a8e` | Picks list (2 rows) |
| **Command-error** (`IqPYB`) | `ERROR` | `$destructive` → `#e05a5a` | `COMMAND FAILED` · `$destructive` | `$muted-foreground` `#7a7a8e` | Meta `TAP TO DISMISS` |

**Distinctions baked into the tokens:**
- **info-query vs warning-confirm:** the Voice Query Result uses a **`$primary` (`#ff6b35`) info accent** (the board's `info` token resolves to the same orange `#ff6b35`), whereas the destructive-gate confirm toast uses **`$warning` (`#d9a73e`)**. These are deliberately different hues so a read-only answer is never mistaken for a destructive prompt.
- **Disambiguation is neutral**, not warning: its accent is the muted `$border-hover` (`#3a3a4a`) and its header is plain `$foreground` — it is a *choice*, not an alert. (Brief §14 colors it `$warning`; the screen overrides to neutral — **screen wins**.)
- **Meta line tokens:** all meta lines use `$muted-foreground-subtle` (`#4a4a5e`), JetBrains Mono `10`, letterSpacing `1`.

---

### 3. Layout — exact px / tokens / structure (top → bottom)

#### 3.0 Board scaffold (shared by all sections)
- Root frame `T2BChB` `1120×1160`, `fill $background`, `layout none`.
- `Gallery Content` (`R664ri`): `width 1120`, `fill $background`, `layout vertical`, `gap 34`, `padding 40`.
- `Gallery Header` (`UnTkh`): `gap 6` → Title `VOICE COMMAND & FEEDBACK` (JetBrains Mono `20`, letterSpacing `2`, `$foreground`) + Subtitle `Component states — voice capture, toasts and query results` (DM Sans `13`, `$muted-foreground`).
- Each section: `gap 20`, opens with a Section Header (JetBrains Mono `12`, letterSpacing `2`, `$foreground`): `01 · VOICE FAB`, `02 · TOASTS`, `03 · VOICE QUERY RESULT`.

#### 3.1 Section `02 · TOASTS` — Toast Row (`B13wqZ`)
- Horizontal row, `width fill_container`, `gap 20`, **4 equal cells** (`width fill_container` each → ~245px each within the 1040px content width).
- Each cell: `layout vertical`, `gap 10` → Caption (JetBrains Mono `11`, letterSpacing `1.5`, `$muted-foreground`) + the Toast specimen.
- Every Toast: `fill $card` (`#1a1a22`), `stroke $border` (`#2a2a38`) `1px`, `cornerRadius 0` (global `radius=0` — sharp tactical corners), `layout vertical`. **No internal gap** between Accent and Body (Accent is flush to the top edge).
- Accent bar: `width fill_container`, `height 2`, fill per §2 map.
- Body: `layout vertical`, `gap 10`, `padding 16`.

**3.1.a Success cell (`ujR0M` → toast `U0NLW`)** top→bottom:
1. Accent `2px` `$success`.
2. Header `✓ MARKED DONE` (mono `12`, ls `1`, `$success`).
3. Body `Build burn platform — structural pass` (DM Sans `13`, lineHeight `1.4`, `$foreground`, `width fill_container`).
4. Meta `AUTO-DISMISS · 4S` (mono `10`, ls `1`, `$muted-foreground-subtle`).

**3.1.b Needs-confirmation cell (`g9Ajb` → toast `Lx9uA`)** top→bottom:
1. Accent `2px` `$warning`.
2. Header `CONFIRM DELETE` (mono `12`, ls `1`, `$warning`).
3. Body `Delete task "Cardiology follow-up"?` (DM Sans `13`, lineHeight `1.4`, `$foreground`). *(Note curly quotes `“ ”` in the literal.)*
4. **Actions row** (`XXjyT`, horizontal, `width fill_container`, `gap 8`):
   - **Btn DELETE** (`Wqo6m`): `width fill_container`, `fill $destructive` (`#e05a5a`), `padding [8,12]` (v,h), `justify/align center`, `cornerRadius 0`. Label `DELETE` (mono `11`, ls `1`, `$destructive-foreground` `#fafafa`). **This is the primary/confirm action**, styled destructive because the gated intent is a delete.
   - **Btn CANCEL** (`DfyVw`): `width fill_container`, **no fill** (transparent over `$card`), `stroke $border 1px`, `padding [8,12]`, center. Label `CANCEL` (mono `11`, ls `1`, `$muted-foreground`).
   - Buttons are **50/50 fill-width**, side by side.

**3.1.c Disambiguation cell (`S1XHB` → toast `j5Ef9W`)** top→bottom:
1. Accent `2px` `$border-hover` (`#3a3a4a`).
2. Header `WHICH TASK?` (mono `12`, ls `1`, `$foreground`).
3. Body `Two tasks match "follow up." Which one?` (DM Sans `13`, lineHeight `1.4`, **`$muted-foreground`** — dimmer than other toasts because it's a prompt). *(Curly quotes in literal.)*
4. **Picks list** (`P2wCZ`, `layout vertical`, `gap 8`): two `Pick` rows, each `fill $card-elevated` (`#22222e`), `stroke $border 1px`, `padding [10,12]`, `gap 8`, `alignItems center`, horizontal:
   - **Pick 1** (`O2REqf`): Name `Cardiology follow-up` (DM Sans `12`, `$foreground`, `width fill_container`) + Win tag `MED` (mono `10`, ls `1`, `$muted-foreground`).
   - **Pick 2** (`U8pSNH`): Name `Supplier follow-up — LED panels` + Win tag `TECH`.
   - The trailing `Win` tag is a category/window short-code (MED, TECH) used to disambiguate visually.

**3.1.d Command-error cell (`lySlh` → toast `IqPYB`)** top→bottom:
1. Accent `2px` `$destructive`.
2. Header `COMMAND FAILED` (mono `12`, ls `1`, `$destructive`).
3. Body `Couldn't parse "mark teh medevac done."` (DM Sans `13`, lineHeight `1.4`, **`$muted-foreground`**). *(Intentional typo "teh" — illustrates a failed parse; curly quotes/apostrophe in literal.)*
4. Meta `TAP TO DISMISS` (mono `10`, ls `1`, `$muted-foreground-subtle`).

#### 3.2 Section `03 · VOICE QUERY RESULT` — Query Panel (`jfz3H`)
- Cell (`F0Brt`): `gap 10` → Caption `TRANSIENT — NO ACTIONS` (mono `11`, ls `1.5`, `$muted-foreground`) + the panel.
- **Outer accent frame `Query Panel`** (`jfz3H`): **fixed `width 540`**, `fill $primary` (`#ff6b35`), `stroke $border 1px`, `layout vertical`, `padding [0,0,0,3]` (top,right,bottom,left). The orange fill shows **only as a 3px left stripe** because the inner Content covers the rest — this is the **left-accent technique** (analogous to the toasts' top accent, rotated 90°).
- **Inner `Content`** (`iEd5X`): `width fill_container`, `fill $card-elevated` (`#22222e`), `layout vertical`, `gap 12`, `padding 18`. Top→bottom:
  1. **Header Row** (`hbEr0`, horizontal, `gap 8`, `alignItems center`): icon `calendar-clock` (lucide, `15×15`, `$primary`) + Header `CLOSING THIS WEEK` (mono `12`, ls `1.5`, `$primary`).
  2. **Answer** (`DUGIb`): `3 tasks close before the Tankwa gates open.` (DM Sans `13`, lineHeight `1.45`, `$foreground`, `width fill_container`). Natural-language answer line.
  3. **Task List** (`EnoyQ`, `layout vertical`, no gap — separation is via row top-borders): 3 `Row`s, each `width fill_container`, `gap 12`, `padding [10,0]` (v,h=0), `alignItems center`:
     - Row 1 (`GDP8x`, **no top border**): Name `Theme camp registration` (mono `12`, ls `0.5`, `$foreground`, `width fill_container`) + Window `MON–WED` (mono `11`, ls `1`, `$muted-foreground`).
     - Row 2 (`A4eRV`, `stroke $border` **top 1px**): Name `Tankwa permit confirmation` + Window `TUE 17:00`.
     - Row 3 (`JPo5K`, `stroke $border` **top 1px**): Name `MEDEVAC insurance` + Window `THU–FRI`.
  - Note: task **Names here are JetBrains Mono `12`** (vs DM Sans in the toasts) — the query result presents a data-table-style read-out; Windows are mono `11`.

#### 3.5 Runtime placement (from design-brief §11; not drawn on the gallery board)
- **Toaster anchor:** bottom-center on mobile, bottom-right on desktop; raised above the Voice FAB. `max-w-sm` per toast (brief §14).
- **Voice FAB** is fixed bottom-right (LOCKED §2.7), so the persistent confirm toast and FAB never collide.
- Query result panel renders in the same toast region but is wider (`540`) and longer-lived; treat as a transient sheet/panel, not a stacked toast.

---

### 4. Components used (as rendered) & divergence from canonical

#### 4.1 `Toast` (`kTqS3`) — used 4×
- **Props observed (inferred from rendering):** `tone`, `header`, `text`, `autoDismissMs?`, `actions?[]`, `onDismiss`.
- **Variants seen on this board:** `tone: success` (✓ accent), `tone: warning` (confirm), **neutral/disambiguation** (`$border-hover` accent — NOT in canonical tone enum), `tone: error/destructive`.
- **Tail variants:** meta-line (success, error) · actions-row (confirm) · picks-list (disambiguation).
- **Tokens:** `$card`, `$border`, `$success`, `$warning`, `$border-hover`, `$destructive`, `$destructive-foreground`, `$foreground`, `$muted-foreground`, `$muted-foreground-subtle`, `$card-elevated`.
- **Screen divergence from canonical:**
  1. Canonical `Toast` def has **NO `actions[]` row** ("today camp's toast is dismiss-✕ only"). The **needs-confirmation screen requires a 2-button `Confirm/Cancel` row** → the `actions[]` API must be added (scaffolding S1/S5; `ToastRecord` extension). **Screen authoritative.**
  2. Canonical tone enum is `success | error | warning | info`. The disambiguation screen introduces a **neutral tone** (accent `$border-hover`, header `$foreground`) and a **picks-list tail** — neither is in the canonical def. The Toast contract must add a `disambiguation`/neutral tone + an inline-picks slot, OR disambiguation is modeled as its own toast subtype. **Screen authoritative.**
  3. Canonical shows a single dismiss-✕; **none of the 4 screen toasts render a ✕ button** — dismissal is implicit (auto-dismiss / tap-to-dismiss / action-driven). The dismiss affordance is communicated by the **meta line copy** (`AUTO-DISMISS · 4S`, `TAP TO DISMISS`) rather than a glyph.
  4. The confirm toast's primary button is **`$destructive`-filled** (`DELETE`), not a generic "Confirm" — the button label and tone mirror the *gated verb*. Canonical/brief say "Confirm (destructive) + Cancel"; screen makes the label literal (`DELETE`). **Screen authoritative** (label is intent-derived).
  5. Brief §14 says the confirm toast header is `CONFIRM DELETE` and success header `✓ MARKED DONE` — screen matches. Brief says disambiguation is `$warning`-toned; **screen overrides to neutral `$border-hover`** — informational drift, screen wins.

#### 4.2 Inline disambiguation picks (rendered, no canonical molecule)
- Each `Pick` is a flattened `card-elevated` row (`fill $card-elevated`, `stroke $border 1px`, `padding [10,12]`, `gap 8`) with a Name (DM Sans `12`) + a trailing short-code tag (mono `10`).
- **Divergence from `DisambiguationPicker` (`cLP7O`):** the canonical picker is a **full Dialog organism** with per-candidate **match %** (`92% / 64% / 41%` colored by confidence), a `CategoryTag` + a `Confidence` Badge, a `$primary` border on the top match, and a `SAY IT AGAIN` retry button. The **inline toast variant on this board is the lightweight 2-pick form**: no match %, no confidence badge, no category color, no top-match border, **no retry button** — just Name + a short window/category code (`MED`, `TECH`). These are **two distinct surfaces**: inline-toast (2–3 matches, low ceremony, in the toast region) vs full `DisambiguationPicker` Dialog (escalation for >3 or low-confidence sets). The Toast `actions[]`/picks slot serves the inline form; the Dialog is the canonical organism. **Screen authoritative for the inline form.**

#### 4.3 `VoiceQueryResultCard` (`YMkie`) — used 1×
- **Props observed:** `header`, `icon?` (`calendar-clock`), `answer`, `results: {name, window}[]`.
- **Variant seen:** `closing-this-week` intent (icon `calendar-clock` + label `CLOSING THIS WEEK`), `$primary` accent, 3 result rows.
- **Tokens:** `$primary`, `$card-elevated`, `$foreground`, `$muted-foreground`, `$border`.
- **Screen divergence from canonical:** matches the canonical def closely. The **accent stripe is achieved via an outer `$primary` frame + 3px asymmetric left padding**, NOT a `border-left` token — flag for the Card adaptation (the Card primitive needs a left-accent affordance or this stays a bespoke wrapper). Result-row **Names are JetBrains Mono `12`** (the canonical summary also says mono12) — consistent. No `expand` affordance is drawn despite brief §14 mentioning one for long answers — **open item**.

#### 4.4 Captions / Section headers (gallery chrome, not runtime)
- All `Caption` and `Section Header` text nodes are **gallery scaffolding** (state labels), not part of the shipped component. They are JetBrains Mono, `$muted-foreground`/`$foreground`. Do not ship.

---

### 5. States enumerated (this scope)

| Surface | State | Trigger | Persistence/dwell | a11y role |
|---|---|---|---|---|
| Success toast | `success` (auto-dismiss) | mutation executed OK | **4s auto-dismiss** (`autoDismissMs: 4000`) | `role="status"` |
| Confirm toast | `needsConfirmation` | destructive/low-confidence intent | **persistent** (no auto-dismiss; resolves only via Confirm/Cancel) | `role="alertdialog"`-like; focus on actions |
| Disambiguation toast | `disambiguation` (inline) | 2–3 matches for utterance | **persistent** until a Pick is tapped (or dismissed) | `role="status"` / listbox-ish picks |
| Command-error toast | `error` | parse/execute failed | tap-to-dismiss (no auto-dismiss; or long auto-dismiss) | **`role="alert"`** |
| Voice Query Result | `populated` query answer | read-only `query` intent | **~8s dwell** (`role="status"`, longer than success) | `role="status"` |
| Voice Query Result | `empty` (0 rows) | query returns no tasks | ~8s | inferred — open item |

Domain/global states the brief requires elsewhere (`empty · loading · error`) are partially represented: error = command-error toast; loading is the FAB `processing` state (other scope). The **query panel's empty/loading states are not drawn** — open items.

---

### 6. Interactions

- **Success toast:** non-interactive body; auto-dismisses after **4s**. (Tap may dismiss early — implied, not drawn.)
- **Confirm toast — DELETE (`Wqo6m`):** re-issues the original intent with `confirmed: true` → executes the mutation → **replaces the confirm toast with a success toast** (`✓ MARKED DONE`-style). Destructive styling.
- **Confirm toast — CANCEL (`DfyVw`):** dismisses the toast, **no-op** (no mutation). Original task untouched.
- **Disambiguation — tap a Pick:** **re-issues the resolved intent** bound to that candidate's `taskId` → executes → replaces with the appropriate success/confirm toast. No mutation occurs from merely showing picks.
- **Disambiguation — overflow:** if matches exceed the inline ceiling (>3, or low confidence), escalate to the full `DisambiguationPicker` Dialog (the ONE MVP-sanctioned Dialog use) — see §4.2.
- **Command-error toast:** **tap-to-dismiss** (`TAP TO DISMISS`). `role="alert"` so screen readers announce immediately. No retry button on the toast itself (retry is via the Voice FAB's `error → TAP TO RETRY` state, other scope).
- **Voice Query Result:** **no actions** (`TRANSIENT — NO ACTIONS`). Read-only; auto-dismisses ~8s. Rows are **not tappable to mutate** (board is read-only; tapping a row could navigate/scroll-to in the dependency/timeline view — not specified here). Brief mentions an "expand" for long answers — not drawn (open item).
- **Toaster stacking:** multiple toasts stack in the bottom anchor; the persistent confirm toast must not be obscured by later auto-dismiss toasts (z-order / focus management).

---

### 7. Data & logic contracts

- **Source of all four toasts:** the `/api/voice/command` route (and the mirrored MCP destructive-tool path). The route: transcribe → Claude Haiku 4.5 (temp 0, forced `tool_use`, Zod-validated against the 10-branch voice-intent `discriminatedUnion`) → **either execute via `@opsboard/core` + `@opsboard/db` (→ success toast)** OR **return `needsConfirmation` (→ confirm toast)** OR **return `disambiguation` with candidates (→ disambiguation toast/dialog)** OR **fail (→ command-error toast)**.
- **`needsConfirmation` gate:** destructive intents (delete) and low-confidence parses are **never auto-executed**; they return a confirmation token. Confirm re-issues with `confirmed: true`. (Mirrors the MCP rule: "Destructive tools return a confirmation token.")
- **Toast `actions[]` API (to add):** `actions?: { label: string; onClick: () => void; variant: 'destructive' | 'outline' | … }[]`. Confirm toast renders `[{label:'DELETE', variant:'destructive', onClick: confirm}, {label:'CANCEL', variant:'outline', onClick: dismiss}]`. Buttons render fill-width, `gap 8`.
- **Disambiguation candidates:** `{ taskId, name, window/categoryShortCode }[]` for the inline form (2 here). The full picker additionally carries `{ matchPct, category, confidenceLabel, selected }`.
- **Voice Query Result data:** powered by **`@opsboard/core` derivations** — `get_closing_windows` (this specimen), and analogously `get_blocked_tasks` / `get_critical_path` for other query intents (header + icon swap). Shape: `{ header, icon, answer, results: { taskId, name, window }[] }`. The `window` strings (`MON–WED`, `TUE 17:00`, `THU–FRI`) are derived window-state labels, **never** raw due-dates (OpsBoard shows window state, never "overdue"/due-date).
- **Persistence/dwell rules (authoritative from screen meta lines):**
  - Success: **4s** auto-dismiss (`AUTO-DISMISS · 4S`). *(Brief §14 said ~5s; screen says 4s — screen wins.)*
  - Confirm: **persistent**, action-resolved only.
  - Disambiguation: **persistent** until pick/dismiss.
  - Command-error: tap-to-dismiss (`TAP TO DISMISS`).
  - Query result: **~8s** (longer dwell, info tone).
- **No mutation from query:** the query result surface is read-only by contract.
- **Color is never the sole channel:** each tone pairs an accent color with a distinct mono header word (`✓ MARKED DONE` / `CONFIRM DELETE` / `WHICH TASK?` / `COMMAND FAILED` / `CLOSING THIS WEEK`) and (for error) `role="alert"` — CVD-safe redundancy.

---

### 8. Coverage checklist

This section fully specifies the feedback-surface scope of board `T2BChB`. See structured `coverage_checklist`.



## Open items (this board)

- 'requesting' / mic-permission state is NOT drawn on board (brief §11 lists 5 states; only 4 present). Screens authoritative on what exists, but build MUST add it — prescribed: muted bordered button + orange loader + 'ALLOW MICROPHONE…' hint.
- FAB drawn at 72px (gallery zoom) but design-brief §11 specifies 56–64px shipped and mobile Category board renders 56px. Decide shipped diameter (recommend 56 mobile / up to 64 desktop) keeping cornerRadius = diameter/2.
- Pulse ring color: board = solid $destructive #e05a5a 2px; canonical VoiceFAB = orange #ff6b3559 ~35% alpha. Board authoritative → red ring, but confirm vs design-system token (no destructive-at-alpha token currently exists).
- Idle Mic icon size: board 30px vs canonical 28px. Pick one (flag).
- Processing loader icon name: board 'loader' vs canonical Spinner 'loader-circle' vs brief 'Loader2'. Standardize on one lucide export.
- Push-to-talk vs tap-to-toggle as the DEFAULT capture gesture is unresolved in the brief — needs a product decision.
- Whether RecordingPanel/Spinner/ErrorStateCard remain separate components or are absorbed as VoiceFAB state variants (recommendation: VoiceFAB owns all 5 states; RecordingPanel stays for the heavier research/voice-intent flow).
- Voice Query Result 'expand' affordance for long answers (brief §14) is NOT drawn on the board — confirm whether to add or drop.
- Query panel empty-state (0 result rows) and loading-state are not drawn — need designs/copy for empty query results.
- Toast dismiss affordance: no ✕ glyph rendered on any toast; confirm whether auto-dismiss/tap-dismiss is sufficient or a ✕ is still needed for stacked persistent toasts.
- Inline-disambiguation ceiling: confirm the exact candidate count threshold (2-3 inline vs >3 → Dialog) and low-confidence escalation rule.
- Disambiguation accent tone is neutral $border-hover on screen but $warning in brief §14 — confirm canonical reconciliation (screen wins per rule, but the canonical DisambiguationPicker Dialog still uses $warning).
- Success dwell is 4s on screen vs ~5s in brief — confirm 4s is the locked value.
- VoiceQueryResultCard left-accent is a bespoke outer-frame+padding technique, not a border-left token — confirm whether the Card primitive gains a left-accent prop or this stays bespoke.
- Disambiguation Pick trailing short-codes (MED, TECH) — confirm whether these are category short-codes, window-state codes, or a combined label, and how they're derived.

## Coverage checklist (verification targets)

- [ ] Purpose of the VoiceFAB as the sole input affordance
- [ ] Fixed bottom-right placement on desktop + mobile, z-150, safe-area-inset, toast-collision rationale per §11.1
- [ ] Gallery-vs-runtime distinction (specimen cells are documentation framing, not shippable)
- [ ] Per-cell layout (Caption / Visual / Hint) with exact frame props (240w, gap 14, pad 8, Visual 120h)
- [ ] idle state: 72×72 $primary button, lucide mic 30, $primary-foreground icon, TAP TO RECORD hint
- [ ] requesting state: flagged MISSING with prescribed contract (loader + ALLOW MICROPHONE…)
- [ ] recording state: 96px wrap, $destructive 2px pulse ring at 12px inset, button→$destructive, lucide square 24, $destructive-foreground icon
- [ ] recording waveform: 10 bars × 3px, gap 3, h34, $primary fill, exact heights 12/22/30/18/34/14/26/20/28/12
- [ ] recording timer: 00:07 mono 18px $foreground stacked under waveform; ● TAP TO STOP destructive hint
- [ ] processing state: $muted button + $border 1px, lucide loader 30 $primary, TRANSCRIBING… hint
- [ ] error state: $muted button + $destructive 1px border, lucide triangle-alert 28, 64×2 red line, TAP TO RETRY
- [ ] All token refs resolved to hex via 00-variables.json
- [ ] Full icon manifest with names + sizes + reconciliation (mic30/square24/loader30/triangle-alert28)
- [ ] Pulse/waveform color rules: red ring (board-authoritative), orange waveform
- [ ] Interaction state machine + push-to-talk/tap-toggle + transcript-POST-not-append rule
- [ ] A11y: per-state role=button aria-label, role=alert on error, aria-hidden pulse+waveform, reduced-motion, aria-live on status
- [ ] Data/logic contracts: getUserMedia, amplitude→waveform, mm:ss timer, command-endpoint POST, ephemeral state machine, error sources
- [ ] All 8 drift candidates from triage reconciled with board as source-of-truth
- [ ] Section 02 · TOASTS — all 4 cells fully specified: SUCCESS (U0NLW), NEEDS CONFIRMATION (Lx9uA), DISAMBIGUATION (j5Ef9W), ERROR (IqPYB)
- [ ] Shared Toast anatomy (Accent 2px + Body pad16 gap10: Header/Body/tail) documented with exact tokens
- [ ] Accent-token-per-variant map: $success / $warning / $border-hover / $destructive (+ $primary for query)
- [ ] Success toast: header '✓ MARKED DONE', body, meta 'AUTO-DISMISS · 4S', 4s auto-dismiss
- [ ] Needs-confirmation toast: header 'CONFIRM DELETE', Actions row DELETE($destructive) + CANCEL(outline), 50/50 fill-width, persistent
- [ ] Inline Disambiguation toast: neutral $border-hover accent, 'WHICH TASK?' header, 2 picks (Cardiology follow-up/MED, Supplier follow-up — LED panels/TECH) with exact tokens
- [ ] Command-error toast: $destructive accent, 'COMMAND FAILED', body with intentional typo, 'TAP TO DISMISS' meta, role=alert
- [ ] Section 03 · VOICE QUERY RESULT: 540px panel, 3px $primary left-accent stripe via outer frame + padding, $card-elevated content, calendar-clock + 'CLOSING THIS WEEK', answer line, 3-row divided task list (exact names + windows)
- [ ] Toast actions[] API contract + needsConfirmation gate (confirmed:true re-issue) documented
- [ ] Dwell/persistence rules: 4s success vs persistent confirm vs persistent disambiguation vs ~8s query
- [ ] Inline-disambiguation vs full DisambiguationPicker (cLP7O) Dialog distinction documented
- [ ] info-query ($primary) vs warning-confirm ($warning) tone distinction documented
- [ ] All exact px/tokens/literal strings/gaps/paddings/fonts captured for every node in scope
- [ ] Every state enumerated with persistence + a11y role
- [ ] All interactions (Confirm/Cancel/Pick/dismiss/escalation) documented
- [ ] Divergence-from-canonical recorded for Toast, inline picks, VoiceQueryResultCard, action buttons
- [ ] Out-of-scope noted: Section 01 Voice FAB (separate spec); query empty/loading states + expand affordance flagged as open items