# Surface Spec — AI Research (Task Agent) (`GZ7xA`) · P2

*Source: `docs/design-extract/boards/GZ7xA__*.json` (screen authoritative). 4 scoped sections.*

# AI Research — Capture & Parse (Scope, Recording, Parsed Intent, Disambiguation, Confirm)

*scope: AI Research — capture-and-parse half (desktop 01 + mobile Voice & Intent + mobile Disambiguation)*

## AI Research — Capture & Parse

Board: `GZ7xA` (`OpsBoard — AI Research (Task Agent)`). This section specifies the **capture-and-parse half** of the voice research flow — the surfaces between "user spoke" and "agent starts researching." It covers three authoritative screens:

- **Desktop `01 · Voice & Intent`** (`e8EMmf`, 1320×1120) — the full capture+parse layout: Scope Chip, Voice Capture (RecordingPanel), Parsed Intent panel + side-by-side Disambiguation card, and the Confirm Bar with the `CUE RESEARCH` action.
- **Mobile `Voice & Intent`** (`fuZLi`, 390 wide, hug-height) — single-column capture+parse: Scope, Heard, Intent, CTA.
- **Mobile `Disambiguation`** (`Fux3f`, 390 wide, hug-height) — the standalone pick-one screen reached when the parse is ambiguous (tag `01b PICK`).

OpsBoard is READ-ONLY except for status cycling, but this AI-research agent is the one place a voice command *writes* (appends research notes to a task). These screens are the consent/confirmation gate before that write. **All values below are read directly from the board JSON; the screens are authoritative.** Color tokens resolve via `00-variables.json` (e.g. `$primary` = `#ff6b35`, `$success` = `#5ae07a`, `$warning` = `#d9a73e`, `$cat-bureaucratic` = `#5aa0e0`, `$cat-travel` = `#5ae0a0`, `$cat-gear` = `#e0c05a`, `$muted-foreground` = `#7a7a8e`, `$muted-foreground-subtle` = `#4a4a5e`, `$card` = `#1a1a22`, `$card-elevated` = `#22222e`, `$muted` = `#131318`, `$border` = `#2a2a38`). `radius` token = `0` (square corners everywhere except the pill chips that set `cornerRadius: 999`).

---

### A. Purpose

The agent is **voice-cued and mission-scoped**: everything the user says is interpreted inside a locked mission taxonomy (AfrikaBurn 2026). The capture-and-parse half lets the user (1) see the scope they are speaking into, (2) see the live recording + transcript, (3) review the agent's structured understanding (INTENT / QUERY / TARGET TASK / ACTION) with a match confidence, (4) resolve ambiguity when more than one task matches, and (5) explicitly confirm with `CUE RESEARCH` before any research job runs and notes are appended. Per the functional contract, **low-confidence / write actions must be confirmed, never assumed** — these screens are that confirmation surface.

---

### B. Desktop `01 · Voice & Intent` (`e8EMmf`)

**Frame:** 1320×1120, `fill $background`, `stroke $border` 1px inner, `clip`, vertical layout. Two children: Header, then Body.

**B.1 Header** (`CIqJM`) — `fill $muted`, bottom border 1px `$border`, padding `18 / 32`, space-between, center-aligned.
- **Wordmark** (`f1SpDL`, gap 12): `Mark` 18×18 square `fill $primary`; `Name` text `OPSBOARD` (JetBrains Mono 15 / 700, `$foreground`, letterSpacing 2); `Slash` `/` (Mono 15 / normal, `$muted-foreground-subtle`); `Feature` `TASK AGENT` (Mono 12 / 700, `$primary`, ls 2).
- **Status** (`xPY86`, gap 9): `Dot` ellipse 7×7 `$success`; `Label` `AGENT READY` (Mono 11 / normal, `$muted-foreground`, ls 1.5).

**B.2 Body** (`Neqnz`) — fill width+height, vertical, gap 18, padding 32. Children top→bottom: Mission Scope → Voice Capture → Intent Row → Confirm Bar.

#### B.2.1 Mission Scope (`BmpvI`) — vertical, gap 10
**Scope Chip** (`OF7vE`): `fill $card`, **full `stroke $primary` 1px** inner, gap 10, padding `9 / 14`, center. Children:
- `Lock` lucide `lock` 14×14 `$primary`
- `Key` `SCOPE` (Mono 11 / normal, `$muted-foreground`, ls 1.5)
- `Mid` `·` (Mono 11, `$muted-foreground-subtle`)
- `Val` `AFRIKABURN 2026` (Mono 12 / 700, `$foreground`, ls 1)
- `Locked Tag` (`mD7PT`): `fill $muted`, padding `3 / 7`, contains `T` `LOCKED` (Mono 9 / normal, `$primary`, ls 1.5)

**Hint** (`A9mseW`): fixed-width 760, `Everything you say is interpreted within this mission taxonomy.` (DM Sans 13 / normal, `$muted-foreground`).

#### B.2.2 Voice Capture / RecordingPanel (`w4REH`)
Outer wrapper `fill $primary`, vertical, padding `0 0 0 3` (a **3px bottom accent strip** in primary showing under the inner card). Inner card (`V0T0A`): `fill $card`, vertical, gap 12, padding 18.
- **VHead** (`QBD7e`, space-between, center):
  - **Left** (`mRiGr`, gap 9): `Mic` lucide `mic` 15×15 `$primary`; `Label` `VOICE CAPTURE` (Mono 12 / normal, `$foreground`, ls 1.5).
  - **Live Cue** (`K6rnt`, gap 12, center):
    - **Waveform** (`QqpWF`, height 24, gap 3, center): exactly **8 bars** Bar0…Bar7, each `rectangle` width 3, `fill $primary`, heights `[10, 18, 24, 14, 22, 12, 20, 16]` px.
    - **Rec** (`y9QEz7`, gap 6): `Dot` ellipse 7×7 `$destructive`; `T` `REC` (Mono 11 / normal, `$destructive`, ls 1.5).
    - **Timer** (`iwIjU`): `00:09` (Mono 14 / normal, `$foreground`, ls 1).
- **TLabel** (`VSvyM`): `TRANSCRIPT` (Mono 11 / normal, `$muted-foreground`, ls 1.5).
- **Transcript** (`d6h84`): fill width, lineHeight 1.55, `"Figure out how to submit the Tankwa land-use permit and add the steps to my permit task."` (**JetBrains Mono** 16 / normal, `$foreground`). Note: smart curly quotes in content.
- **Processing** (`knblw`): inline pill `fill $muted`, gap 8, padding `7 / 11`, center. `Dot` ellipse 6×6 `$primary`; `T` `PARSING INTENT…` (Mono 11 / normal, `$primary`, ls 1.5).

#### B.2.3 Intent Row (`z7v46`) — horizontal, gap 24 — two columns side-by-side

**Left column: Parsed Intent / ParsedIntentPanel** (`MFY8j`, fill width). Same primary 3px-bottom-accent wrapper pattern as Voice Capture (`fill $primary`, padding `0 0 0 3`). Inner (`cxYEy`): `fill $card`, vertical, gap 6, padding 18.
- **PHead** (`iyNcJ`, space-between, center): `L` (gap 9) = `Icon` lucide `scan-search` 15×15 `$primary` + `T` `PARSED INTENT` (Mono 12 / normal, `$foreground`, ls 1.5); right `Sub` `AGENT UNDERSTANDING` (Mono 10 / normal, `$muted-foreground-subtle`, ls 1.5).
- **Rows** (`Wa9OJ`, vertical) — four key/value rows, each a horizontal frame gap 18, padding `14 / 0`, with a **bottom 1px `$border`** divider EXCEPT the last (ACTION) which has only `strokeAlignment` set (no visible bottom border). Each row's `Label` is a fixed-width 120px Mono 11 / normal `$muted-foreground` ls 1.5 key column; `Val` is a fill-width vertical frame gap 8.
  1. **Row INTENT** (`u6gw6c`) → Val is a `Pill` (`H5cW7`, `fill $muted`, gap 7, padding `4 / 10`, center): icon lucide `globe` 12×12 `$primary` + `T` `RESEARCH` (Mono 11 / **700**, `$primary`, ls 1.5).
  2. **Row QUERY** (`XadDa`) → Val `Q` text fill-width, lineHeight 1.5, `"How to submit the Tankwa Karoo land-use permit"` (**JetBrains Mono** 14 / normal, `$foreground`).
  3. **Row TARGET TASK** (`TFXQ0`) → Val is **Task Chip** (`Tob1m`, fill width, `fill $card-elevated`, `stroke $border` 1px, gap 12, padding `12 / 14`, space-between, center):
     - Left `L` (gap 11): `Dot` ellipse 9×9 `$cat-bureaucratic`; `C` (vertical, gap 3): `Name` `Tankwa Land-Use Permit` (**DM Sans** 14 / 500, `$foreground`) + `Cat` `BUREAUCRATIC · MATCHED IN MISSION` (Mono 10 / normal, `$cat-bureaucratic`, ls 1).
     - Right `Conf` (vertical, gap 4, align end): `Pct` `92%` (Mono 16 / **700**, `$success`) + `Lab` `CONFIDENCE` (Mono 9 / normal, `$muted-foreground`, ls 1).
  4. **Row ACTION** (`rOOfz`) → Val `A` (gap 9, center): icon lucide `file-plus` 14×14 `$primary` + `T` `Append research notes to this task` (**DM Sans** 14 / normal, `$foreground`).

**Right column: Disambiguation / DisambiguationPicker** (`heaiU`, **fixed width 470**). `fill $card`, `stroke $border` 1px inner, vertical, gap 14, padding 18.
- **DHead** (`Vp3qU`, gap 9, center): icon lucide `git-fork` 15×15 **`$warning`** + `T` `DISAMBIGUATION` (Mono 12 / normal, **`$warning`**, ls 1.5).
- **DTitle** (`ySE9X`): fill width, lineHeight 1.4, `2 TASKS MATCH "permit" — PICK ONE` (Mono 13 / **700**, `$foreground`, ls 0.5). Note: title says "2 TASKS" but **three candidates render** — drift below.
- **Candidates** (`h3P1B`, vertical, gap 10) — three candidate rows, each fill width, `fill $card-elevated`, gap 12, padding `12 / 14`, space-between, center. Each has Left `L` (gap 11) = `Dot` ellipse 9×9 (category color) + `C` (vertical gap 3) = `N` name (DM Sans 14 / 500 `$foreground`) + `Cat` (Mono 10 / normal, category color, ls 1); Right `Pct` (Mono 14 / 700, confidence color).
  1. **Cand Tankwa Land-Use Permit** (`a13pH`): **`stroke $primary` 1px** (selected/top-match state) · Dot `$cat-bureaucratic` · Cat `BUREAUCRATIC` · Pct `92%` `$success`.
  2. **Cand Vehicle Pass Permit** (`g23gsk`): `stroke $border` · Dot `$cat-travel` · Cat `TRAVEL` · Pct `64%` `$warning`.
  3. **Cand Burn Permit · Art Grant** (`XEWon`): `stroke $border` · Dot `$cat-gear` · Cat `GEAR` · Pct `41%` `$muted-foreground`.

  **Confidence → color mapping (desktop, authoritative):** ≥85% (92%) → `$success`; mid-band (64%) → `$warning`; low (41%) → `$muted-foreground`. The selected/top candidate also gets a `$primary` border.

#### B.2.4 Confirm Bar (`Zbq2s`)
`fill $muted`, `stroke $border` 1px inner, padding `16 / 20`, space-between, center.
- **Hint** (`n8sJX`, width 520, gap 9): icon lucide `info` 14×14 `$muted-foreground-subtle` + `T` `Phrasing can be strict & terse — the mission scope plus the agent resolve the rest.` (Mono 11 / normal, `$muted-foreground`, ls 0.5, lineHeight 1.5, fill width).
- **Buttons** (`E7lou`, gap 12, center):
  - **Cancel** (`y3fJi`): `fill $card`, `stroke $border` 1px, padding `12 / 20`, center → `T` `CANCEL` (Mono 12 / **700**, `$muted-foreground`, ls 1.5).
  - **Cue Research** (`T9vFwO`): **primary CTA**, `fill $primary`, gap 9, padding `12 / 22`, center → icon lucide `sparkles` 15×15 `$primary-foreground` + `T` `CUE RESEARCH` (Mono 12 / **700**, `$primary-foreground`, ls 1.5).

---

### C. Mobile `Voice & Intent` (`fuZLi`)

**Frame:** 390 wide, hug height, `fill $background`, `stroke $border` 1px inner, vertical. Header + Body.

**C.1 Header** (`Rwecc`) — `fill $muted`, bottom border 1px, padding `14 / 18`, space-between, center. Wordmark (`Rb2Gn`, no gap): `OPS` (Mono 14 / 700, `$primary`, ls 3) + `BOARD` (Mono 14 / 700, `$muted-foreground`, ls 3). Right `Tag` `01 INTENT` (Mono 9 / 700, `$muted-foreground-subtle`, ls 1.5).

**C.2 Body** (`uXJYc`) — vertical, gap 16, padding `18 18 26 18`. Top→bottom: Scope → Heard → Intent → CTA.

**C.2.1 Scope** (`NJgUC`) — **left-accent chip** (this is the canonical ScopeChip rendering): `fill #ff6b351f` (raw-hex tint = `$primary` at 12% alpha), **left border 2px `$primary`** only, gap 8, padding `10 / 12`, center. Children: icon lucide `target` 14×14 `$primary` + `L` `SCOPE · AfrikaBurn 2026` (Mono 11 / 700, `$primary`, ls 1).

**C.2.2 Heard** (`F3L2W`) — the mobile RecordingPanel equivalent (post-capture, no live waveform): `fill $card`, `stroke $border` 1px, vertical, gap 8, padding 14.
- **Top** (`T8NBvU`, space-between, center): `L` (gap 7) = icon lucide `mic` 13×13 `$muted-foreground` + `T` `HEARD` (Mono 10 / 700, `$muted-foreground`, ls 1.5); right `Dur` `0:06` (Mono 11 / 500, `$muted-foreground-subtle`).
- **Transcript** (`gJENy`): fill width, lineHeight 1.45, `"Figure out how to submit the Tankwa land-use permit and add the steps to my permit task."` (**DM Sans** 15 / normal, `$foreground`). Note: mobile transcript is DM Sans, desktop is Mono.

**C.2.3 Intent** (`NpGtk`) — mobile ParsedIntentPanel: `fill $card`, `stroke $border` 1px, vertical, gap 13, padding 14.
- **Top** (`gr4jd`, gap 7, center): icon lucide `sparkles` 14×14 `$primary` + `T` `AGENT UNDERSTANDS` (Mono 10 / 700, `$primary`, ls 1.5). (Desktop header is `PARSED INTENT` with `scan-search`; mobile is `AGENT UNDERSTANDS` with `sparkles`.)
- Four **borderless** key/value stacks (vertical, gap 4 each; no row dividers, unlike desktop). Each key `K` is Mono 9 / 600, `$muted-foreground-subtle`, ls 1.5.
  1. **INTENT** (`V584m`): `V` `RESEARCH` (Mono 13 / **700**, `$foreground`, ls 1) — plain text, **not** the muted globe pill desktop uses.
  2. **QUERY** (`ZCfZe`): `V` `How to submit the Tankwa Karoo land-use permit` (**DM Sans** 14 / 500, `$foreground`) — no surrounding quotes (desktop wraps it in curly quotes + uses Mono).
  3. **TARGET TASK** (`kKOHZ`): `Name` `Submit Tankwa land-use permit` (DM Sans 15 / 600, `$foreground`) + **Meta** (gap 8): two pill chips:
     - **Chip** category (`h3hxKr`): `fill #5aa0e01f` (raw-hex = `$cat-bureaucratic` @ 12%), **`cornerRadius: 999`**, padding `3 / 8` → icon lucide `file-text` 11×11 `#5aa0e0` + `L` `BUREAUCRATIC` (Mono 10 / 700, `#5aa0e0`, ls 0.5).
     - **Chip** match (`pyfsL`): `fill #5ae07a1f` (`$success` @ 12%), radius 999, padding `3 / 8` → icon lucide `circle-check` 11×11 `#5ae07a` + `L` `92% MATCH` (Mono 10 / 700, `#5ae07a`, ls 0.5).
     - Mobile names the task `Submit Tankwa land-use permit` (verb-prefixed); desktop Task Chip names it `Tankwa Land-Use Permit` and carries a `· MATCHED IN MISSION` suffix + standalone `92%` / `CONFIDENCE`.
  4. **ACTION** (`ttfko`): `V` `Append research notes to this task` (DM Sans 14 / 500, `$foreground`) — plain text, no `file-plus` icon (desktop has the icon).
- **No Disambiguation column** on this mobile screen — disambiguation is a separate screen (Section D).

**C.2.4 CTA** (`Wc7Tp`, vertical, gap 8) — replaces the desktop Confirm Bar:
- **Cue** (`UBAog`): full-width, **height 50**, `fill $primary`, gap 8, center → icon lucide **`search`** 16×16 `$primary-foreground` + `L` `CUE RESEARCH` (Mono 13 / 700, `$primary-foreground`, ls 1). Note: mobile uses `search` icon; desktop uses `sparkles`.
- **Cancel** (`KjRbh`): full-width, **height 44**, center, no fill/border → `L` `CANCEL` (Mono 12 / 600, `$muted-foreground`, ls 1).
- **Hint** (`divj0`): fill width, centered, lineHeight 1.4, `Phrasing can be terse — the mission scope + agent resolve the rest.` (Mono 10 / 500, `$muted-foreground-subtle`). Shorter copy than desktop, center-aligned, subtler color.

---

### D. Mobile `Disambiguation` (`Fux3f`)

**Frame:** 390 wide, hug height, `fill $background`, `stroke $border` 1px inner, vertical. Reached when the parse matches >1 task (tag `01b PICK`).

**D.1 Header** (`RvZQd`) — identical structure to C.1; right `Tag` = `01b PICK` (Mono 9 / 700, `$muted-foreground-subtle`, ls 1.5).

**D.2 Body** (`NA2Ou`) — vertical, gap 16, padding `18 18 26 18`. Scope → Prompt → Picks → Retry.

**D.2.1 Scope** (`e9YU44`) — identical to C.2.1 ScopeChip (`#ff6b351f` fill, left 2px `$primary`, target icon, `SCOPE · AfrikaBurn 2026`). The scope chip persists across both mobile screens.

**D.2.2 Prompt** (`NaOFy`, vertical, gap 8):
- **Top** (`ry8bf`, gap 7, center): icon lucide `git-fork` 14×14 **`$primary`** + `T` `WHICH TASK?` (Mono 11 / 700, `$primary`, ls 1.5). Note: mobile uses `$primary` for the fork icon/label; desktop Disambiguation uses `$warning`.
- **Body** (`onMj7`): fill width, lineHeight 1.45, `2 tasks match "permit" in this mission. Pick the one to attach research to:` (**DM Sans** 14 / normal, `$foreground`).

**D.2.3 Picks** (`UrPlu`, vertical, gap 10) — **two** candidate cards (matches the "2 tasks" prompt; desktop renders three). Each: fill width, **`fill $secondary`** (`#1a1a22`, = `$card`), `stroke $border` 1px, vertical, gap 9, padding 14.
- **Top** (space-between via fill-width Name + chevron): `Name` fill width (DM Sans 15 / 600, `$foreground`) + `Chev` lucide `chevron-right` 18×18 `$muted-foreground` — the chevron signals each card is **tappable to select** (desktop candidates have no chevron).
- **Meta** (gap 8, center): a **Cat** pill + a **Conf** pill, both `cornerRadius: 999`, padding `3 / 8`.
  - **Cat** pill: `fill #5aa0e01f` (`$cat-bureaucratic` @ 12%) → icon lucide `file-text` 11×11 `#5aa0e0` + `L` `BUREAUCRATIC` (Mono 10 / 700, `#5aa0e0`, ls 0.5).
  - **Conf** pill: `fill #7a7a8e1f` (`$muted-foreground` @ 12%, **neutral** — confidence is NOT color-coded by band on mobile) → `L` `NN% MATCH` (Mono 10 / 700, `$muted-foreground`, ls 0.5).

  Candidate 1 — `Pick Submit Tankwa land-use permit` (`ZS4OY`): Name `Submit Tankwa land-use permit`, `88% MATCH`.
  Candidate 2 — `Pick Get fire-performance permit` (`YLdeJ`): Name `Get fire-performance permit`, `64% MATCH`.

  Both candidates are BUREAUCRATIC and use the same neutral muted Conf pill — **no top-match `$primary` border** and **no confidence→color banding** here (a divergence from desktop).

**D.2.4 Retry** (`hDAlq`): full-width, **height 46**, no fill, `stroke $border` 1px, gap 8, center → icon lucide `mic` 15×15 `$muted-foreground` + `L` `SAY IT AGAIN` (Mono 12 / 600, `$muted-foreground`, ls 1).

---

### E. States enumerated in this scope

- **RecordingPanel — recording (active):** the only recording sub-state rendered. Desktop: live waveform (8 primary bars), `REC` destructive dot+label, running timer `00:09`. Mobile (`Heard`): post-capture readout with `mic` glyph + `HEARD` + final duration `0:06` (no live waveform).
- **RecordingPanel — processing:** desktop inline `PARSING INTENT…` pill (primary dot + primary text) shown beneath the transcript while parse runs. (Mobile shows the parsed result directly; no parsing pill on these screens.)
- **ParsedIntentPanel — parsed/high-confidence:** all four rows populated; TARGET TASK confidence `92%` rendered in `$success` (desktop) / as a `92% MATCH` success pill (mobile). No empty/low-confidence parse variant appears in this scope.
- **Disambiguation — ambiguous (multi-match):** desktop 3 candidates with confidence banding (success/warning/muted) + top-match `$primary` border; mobile 2 candidates, neutral confidence pills, tap-target chevrons, `SAY IT AGAIN` retry.
- **ScopeChip — scoped/locked:** desktop = locked variant (`LOCKED` tag, lock icon, full primary border, uppercase `AFRIKABURN 2026`); mobile = left-accent variant (`SCOPE · AfrikaBurn 2026`). No global/all-scope variant appears.
- **Confirm action — ready:** Cancel + `CUE RESEARCH` always enabled (no disabled/loading variant rendered).

---

### F. Interactions

- **`CUE RESEARCH`** (desktop `T9vFwO`, mobile `UBAog`): primary action — the explicit confirm gate. Tap → submit the parsed intent to the research/command endpoint and transition to the Running screen. This is the write-consent boundary (never auto-fires on parse).
- **`CANCEL`** (desktop `y3fJi`, mobile `KjRbh`): discard the parse/recording and return to idle/board.
- **Disambiguation candidate select:** desktop candidate rows (`a13pH` / `g23gsk` / `XEWon`) and mobile pick cards (`ZS4OY` / `YLdeJ`, chevron-affordant) are tappable to choose the target task; selecting resolves the ambiguity and proceeds to confirm/research. Top candidate is pre-highlighted on desktop (`$primary` border).
- **`SAY IT AGAIN`** (mobile `hDAlq`): re-trigger voice capture (returns to recording) — the disambiguation escape hatch.
- **Transcript / Parsed fields are read-only displays** — no inline editing; the only way to change them is re-recording. Consistent with OpsBoard's read-only / voice-first model.

---

### G. Data & logic contracts

- **Scope** is a locked mission context (`AfrikaBurn 2026`); all parsing is constrained to that mission's task taxonomy. Scope label is the only scope datum shown.
- **Recording** carries: `isRecording` (state), `elapsedMs`/duration (`00:09` desktop, `0:06` mobile), live `amplitudes` (waveform), and the resulting `transcript` string.
- **Parsed intent** is a structured object with four fields: `intent.kind` (`RESEARCH`), `query` (`How to submit the Tankwa Karoo land-use permit`), `targetTask` (`{ name, category, matchConfidence }`), `action` (`Append research notes to this task`), plus a top-level/target `confidence` (0–1; rendered `92%`).
- **Confidence → color (desktop, authoritative):** ≥~85% → `$success`; ~60–84% → `$warning`; <~60% → `$muted-foreground`. Mobile renders confidence as a **neutral** muted pill (no banding) on Disambiguation, and as a `$success` pill on the high-match Intent panel.
- **Disambiguation** is produced when the target-task match yields multiple candidates: a `prompt` string + a `candidates[]` array of `{ taskId, name, category, matchPct, selected? }`. The desktop set is `[Tankwa Land-Use Permit 92% bureaucratic, Vehicle Pass Permit 64% travel, Burn Permit · Art Grant 41% gear]`; the mobile set is `[Submit Tankwa land-use permit 88% bureaucratic, Get fire-performance permit 64% bureaucratic]`. The two screens use different candidate/percent data — treat each as illustrative content, not a single shared fixture.
- **Category color tokens** drive the candidate dot + category-tag color: bureaucratic `$cat-bureaucratic` `#5aa0e0`, travel `$cat-travel` `#5ae0a0`, gear `$cat-gear` `#e0c05a` (also medical `#e05a9f`, tech `#a05ae0` available but unused here).
- **`CUE RESEARCH` submit** posts the confirmed intent to the command endpoint; per the functional contract the agent then searches the web and appends notes to the target task. Write happens only after this confirm.

---

### H. Component usage notes (USED-as-rendered; divergence detailed in structured field)

- **ScopeChip** — canonical = mobile left-accent variant; **desktop renders a fundamentally different chip** (card fill + full primary border + lock icon + `LOCKED` tag + uppercased label). Both are the "scoped/locked" state.
- **RecordingPanel** — canonical describes ~40 live waveform bars + `RECORDING`/`00:07`; desktop renders **8 static bars**, label `REC`, timer `00:09`, and **bundles a `PARSING INTENT…` processing pill** in the same card. Mobile renders no waveform at all (post-capture `HEARD` readout).
- **ParsedIntentPanel / IntentRow** — desktop = bordered definition-list rows (120px mono key + bottom dividers) with a rich Task Chip (category dot + inline `92%`/`CONFIDENCE`); mobile = borderless gap-4 stacks with pill chips. Different headers (`PARSED INTENT`+`AGENT UNDERSTANDING` vs `AGENT UNDERSTANDS`), different fonts for QUERY/INTENT values, different task-name phrasing.
- **DisambiguationPicker** — desktop = fixed 470px card beside ParsedIntent, 3 candidates, confidence-banded bare `%`, top-match primary border, **no retry**; mobile = full-width screen, 2 candidates, neutral confidence pills, chevron tap-targets, **`SAY IT AGAIN` retry**. Desktop fork icon/label = `$warning`; mobile = `$primary`.
- **Confirm action** — desktop horizontal Confirm Bar (`info` hint + Cancel + sparkles CTA); mobile stacked CTA group (search-icon CTA + ghost Cancel + centered hint). CTA icon differs (`sparkles` vs `search`).


# AI Research — Async Running / Come-Back-Later (desktop frame "02 · Running / Come Back Later" VYFZ9 + "Mobile — Researching" B4ooE5)

*scope: AI Research — async running / come-back-later (desktop 02 + mobile Researching)*

## AI Research — Async Running / Come-Back-Later

Board: `GZ7xA` (OpsBoard — AI Research / Task Agent). Surfaces in scope:
- **Desktop frame** `VYFZ9` — "02 · Running / Come Back Later (desktop)", 1320×1120, `fill $background`, `stroke $border 1` (inner), `clip`, `layout vertical`.
- **Mobile frame** `B4ooE5` — "Mobile — Researching", width 390 (height hug), `fill $background`, `stroke $border 1` (inner), `layout vertical`.

This is the **P2 AI-Research / task-agent extension**: a READ-ONLY status surface shown while an async research job runs against a single bound task. There is **no fixed ETA** and **no determinate completion percentage** — the surface communicates liveness (spinner + ELAPSED timer + indeterminate progress + a streaming step log), reassures the operator they can leave (ComeBackLaterBanner + MinimizedJobPill), and shows what the job is bound to (right Rail target card + ResearchAttachedBadge). The only state that changes here is the job's own live state; the operator's only affordances are Minimize / Come Back Later (desktop) and Expand (the docked pill). Nothing on this surface cycles task status.

> SOURCE-OF-TRUTH: the screens are authoritative. Divergences from the canonical 82-component library and from design-brief.md are recorded as INFORMATIONAL drift in each component entry below; where the screen and the canonical def disagree, the screen wins and the component contract must widen to serve it.

---

### 1. Purpose

Communicate, in a glanceable way, that a long-running AI research job is in flight for a specific task and that the operator is free to walk away:
1. **Liveness without an ETA** — orange arc spinner + `RESEARCHING…` + a monotonic ELAPSED timer (`00:42`) + an **indeterminate** progress bar (a sliding chunk, NOT a value-filled bar) + a `Step 3 of 6` counter explicitly annotated `NO FIXED ETA`.
2. **A live, append-only step log** — done / active / pending rows that stream as the agent works.
3. **Come-back-later reassurance** — a banner explaining the job runs in the background and the operator will be notified, plus Minimize / Come Back Later controls and a docked MinimizedJobPill showing the minimized state.
4. **Binding context** — a right Rail anchored to the target task card (left-accent + ResearchAttachedBadge "RESEARCHING") plus an explanatory bind note ("Findings will be appended as notes…") and two read-only "elsewhere on board" context cards.
5. **Results-pending placeholder** — a Research Notes panel rendered as a Skeleton labelled `WAITING FOR RESULTS` / (mobile) `NOTES — INCOMING`.

---

### 2. Desktop layout (VYFZ9), top → bottom, exact px / tokens

**2.1 Header** `A1Jc2b` — `fill $muted`, `stroke {bottom:1} $border` (inner), `width fill_container`, `padding [16,28]`, `justify space_between`, `align center`.
- **Wordmark** `Rdw9w`: `OPS` (`$primary`, JetBrains Mono 16/700, letterSpacing 4) + `BOARD` (`$muted-foreground`, same).
- **Crumb** `r8BQq` (`gap 10`): `Sep` "/" (`$muted-foreground-subtle`, JetBrains Mono 13/normal) + `Screen` "AI RESEARCH" (`$muted-foreground`, JetBrains Mono 12/700, letterSpacing 2).
- **HeaderStatus** `kAKbE` (`gap 14`, align center):
  - **RunningBadge** `it2Sf` — `fill #ff6b351f` (primary/12 literal), `stroke $primary 1` (inner), `gap 7`, `padding [6,10]`, align center → `Pulse` ellipse 7×7 `$primary` + `Label` "RESEARCHING" (`$primary`, JetBrains Mono 11/normal, letterSpacing 1.5).
  - **Timer** `cV739` — "00:42" (`$foreground`, JetBrains Mono 14/700, letterSpacing 1).

**2.2 Body** `z3yPuI` — `width fill_container`, `height fill_container`, **horizontal split** (no explicit layout key → default row): Main (fluid) + Rail (400 fixed).

**2.3 Main column** `TVxMS` — `width fill_container`, `height fill_container`, `layout vertical`, `gap 22`, `padding 32`. Four stacked cards:

**(a) Research Job panel** `k8VQ7` — `fill $card`, `stroke $border 1` (inner), `width fill_container`, `layout vertical`.
- `Accent` `s4alJ` — top bar `fill $primary`, `width fill_container`, `height 2`.
- `JobBody` `xYEl6` — `layout vertical`, `gap 18`, `padding 22`:
  - **JobHead** `Ak0ne` — `width fill_container`, `justify space_between` (row):
    - **JobLeft** `x05tzU` (`layout vertical`, `gap 8`):
      - **StatusRow** `GNQqi` (`gap 9`): `Spinner` ellipse `u13C0l` 13×13 `$primary`, **arc** (`innerRadius 0.62`, `startAngle 60`, `sweepAngle 280`) + `Running` "RESEARCHING…" (`$primary`, JetBrains Mono 12/700, letterSpacing 2).
      - `Task` "Tankwa land-use permit" (`$foreground`, DM Sans 22/700).
      - `Scope` "Web research · finding required steps & official sources" (`$muted-foreground`, DM Sans 13/normal).
    - **JobRight** `hsq98` (`layout vertical`, `gap 4`):
      - `ElapsedLabel` "ELAPSED" (`$muted-foreground-subtle`, JetBrains Mono 10/600, letterSpacing 2).
      - `ElapsedVal` "00:42" (`$foreground`, JetBrains Mono **30**/700, letterSpacing 1).
  - **Indeterminate** track `VVUzb` — `fill $card-elevated`, `width fill_container`, `height 4`, `clip true`, `layout none` → `Chunk` rect `dF9sA` `fill $primary`, **width 340**, height 4, positioned `x 430` (offset into the track; it slides — indeterminate, no value semantics).
  - **ProgMeta** `uWd3r` — `width fill_container` (row, space-between implied by the two ends):
    - `PStep` "Step 3 of 6 · reading sources" (`$muted-foreground`, JetBrains Mono 11/normal, letterSpacing 0.5).
    - `PNote` "NO FIXED ETA" (`$muted-foreground-subtle`, JetBrains Mono 10/normal, letterSpacing 1.5).

**(b) Step Log panel** `Q0zpVY` — `fill $card`, `stroke $border 1`, `width fill_container`, `layout vertical`.
- **LogHead** `qVYYe` — `fill $muted`, `stroke {bottom:1} $border`, `width fill_container`, `padding [12,18]` (row):
  - `LogTitle` "LIVE STEP LOG" (`$muted-foreground`, JetBrains Mono 12/700, letterSpacing 2).
  - `Streaming` `Q3Jmy` (`gap 7`): `Dot` ellipse 7×7 `$success` + `StrmLabel` "STREAMING" (`$success`, JetBrains Mono 10/600, letterSpacing 1.5).
- **LogLines** `b2M9s7` — `width fill_container`, `layout vertical`, `padding [8,0]`. Seven ResearchStepRow rows top→bottom:
  1. **Done** `w4QPwx` (`gap 11`, `padding [8,18]`): `Glyph` 16w → `Check` "✓" (`$success`, JetBrains Mono 13/700) + `Txt` "Parsed intent" (`$foreground`, JetBrains Mono 13/normal).
  2. **Done** `zj98S`: ✓ + `Txt` "Identified task scope" + `Meta` "tankwa land-use" (`$muted-foreground-subtle`, JetBrains Mono 11/normal, letterSpacing 0.5).
  3. **Done** `XXDK8`: ✓ + `Txt` "Searched the web" + `Meta` "8 RESULTS".
  4. **Active** `ccomF` — `fill $card-elevated`, `stroke {left:2} $primary` (inner), `gap 11`, `padding [10,16]`: `Glyph` 16w → `Spin` ellipse 13×13 `$primary` (arc spinner) + `Txt` "Reading source 3 of 6" (`$primary`, JetBrains Mono 13/**700**) + `Src` "· tankwatown.org" (`$muted-foreground`, JetBrains Mono 12/normal).
  5. **Pending** `J2mQS3` (`gap 11`, `padding [8,18]`): `PDot` ellipse 6×6 `$muted-foreground-subtle` + `Txt` "Extracting steps…" (`$muted-foreground`, JetBrains Mono 13/normal).
  6. **Pending** `KGl0I`: `PDot` + `Txt` "Drafting notes…".
  7. **Pending** `xZx2J`: `PDot` + `Txt` "Appending to task" (no ellipsis).

**(c) Come Back Banner** `gboRN` — `fill #ff6b3514` (primary/8 literal), `stroke {left:2} $primary` (inner), `width fill_container`, `gap 16`, `padding [16,18]` (row):
- **BLeft** `Czu1q` (`width fill_container`, `gap 13`):
  - `IconWrap` `fhuAl` — `fill #ff6b351f`, 32×32 → `Coffee` icon `whecT` 17×17 `$primary`.
  - **BText** `EPQBt` (`layout vertical`, `gap 3`): `BTitle` "Running in the background" (`$foreground`, DM Sans 14/700) + `BSub` "You can leave — we'll notify you the moment results are ready." (`$muted-foreground`, DM Sans 13/normal, `width fill_container`).
- **BActions** `ixX32` (`gap 10`):
  - **Btn Minimize** `bkCHm` — `stroke $border-hover 1` (no fill = outline/secondary), `gap 7`, `padding [9,14]`: `Min` icon 13×13 `$muted-foreground` + `MinL` "MINIMIZE" (`$muted-foreground`, JetBrains Mono 11/700, letterSpacing 1).
  - **Btn ComeBack** `nnfZC` — `fill $primary` (primary button), `gap 7`, `padding [9,14]`: `Bell` icon 13×13 `$primary-foreground` + `CBL` "COME BACK LATER" (`$primary-foreground`, JetBrains Mono 11/700, letterSpacing 1).

**(d) Notes Skeleton** `A2iZz5` — `fill $card`, `stroke $border 1`, `width fill_container`, `layout vertical`.
- **NotesHead** `moXzr` — `fill $muted`, `stroke {bottom:1} $border`, `padding [12,18]` (row): `NotesTitle` "RESEARCH NOTES" (`$muted-foreground`, JetBrains Mono 12/700, letterSpacing 2) + `NotesWait` "WAITING FOR RESULTS" (`$muted-foreground-subtle`, JetBrains Mono 10/normal, letterSpacing 1.5).
- **SkeletonLines** `NslSB` — `layout vertical`, `gap 14`, `padding 20`. Three identical `SkBlock` (`gap 11`): `SkDot` ellipse 14×14 `$card-elevated` + `SkCol` (`layout vertical`, `gap 8`) → `L1` rect `width fill_container` h11 `$card-elevated` + `R2` frame width **520** h11 → `L2` rect fill h11 `$card-elevated`.

**2.4 Rail** `BgfHp` — `fill $muted`, `stroke {left:1} $border` (inner), **width 400**, `height fill_container`, `layout vertical`, `gap 18`, `padding 28`. Top→bottom:
- `RailLabel` "BOUND TO TASK" (`$muted-foreground-subtle`, JetBrains Mono 11/700, letterSpacing 2).
- **MissionCtx** `qZXr9` (`gap 8`): `Folder` icon 14×14 `$muted-foreground` + `MName` "AfrikaBurn 2026" (`$muted-foreground`, DM Sans 13/700) + `MSep` "·" (`$muted-foreground-subtle`, JetBrains Mono 13/normal) + `MCat` "BUREAUCRATIC" (`$cat-bureaucratic`, JetBrains Mono 10/700, letterSpacing 1).
- **Target Card** `B4pse` — `fill $card`, `stroke {left:2} $primary` (inner), `clip`, `width fill_container`. `Inner` `XpSZI` (`gap 12`, `padding 14`, row):
  - **Status** `loHpp` — 18×18, `fill #ff6b351f`, `stroke $primary 2`, justify+align center → `SpinSm` ellipse `coba7` 11×11 `$primary` (arc, `innerRadius 0.6`, start 60, sweep 280).
  - **Col** `h6JMvc` (`layout vertical`, `gap 8`, `width fill_container`):
    - `TitleRow` `f1P0ya` (`gap 8`): `CTitle` "Tankwa land-use permit" (`$foreground`, DM Sans 14/700, width 200).
    - **ResearchBadge** `l3MpUu` (= ResearchAttachedBadge) — `fill #ff6b351f`, `stroke $primary 1`, `gap 6`, `padding [4,8]`, align center: `PulseSm` ellipse 6×6 `$primary` + `RBL` "RESEARCHING" (`$primary`, JetBrains Mono 10/700, letterSpacing 1).
    - **MetaRow** `S6uqN` (`gap 8`, align center): `Clock` icon 12×12 `$muted-foreground-subtle` + `Due` "Target: 27 Apr 2026" (`$muted-foreground`, JetBrains Mono 11/normal).
- **BindNote** `aatQR` (`gap 9`, `padding [12,0,0,0]`, `width fill_container`): `CornerDown` icon 14×14 `$muted-foreground-subtle` + `BindTxt` "Findings will be appended as notes on this task when research completes." (`$muted-foreground`, DM Sans 12/normal, fill).
- **Divider** `rt9GA` — `fill $border`, `width fill_container`, `height 1`.
- `CtxLabel` "ELSEWHERE ON BOARD" (`$muted-foreground-subtle`, JetBrains Mono 11/700, letterSpacing 2).
- **CtxCard** `e302I` — `fill $card`, `stroke $border 1`, fill width. `Inner` `TG4gG` (`gap 12`, `padding 12`): `Status` `fixFx` 16×16 `stroke $border 2` (empty / not-started, no inner dot) + `Col` (`gap 6`): `T` "Theme camp registration" (`$foreground`, DM Sans 13/700) + `M` (`gap 7`) → `Cat` "CLOSES MON–WED" (`$cat-bureaucratic`, JetBrains Mono 10/normal, letterSpacing 1).
- **CtxCard** `IIOsI` — same shape: `Status` 16×16 empty + `T` "MEDEVAC insurance" + `Cat` "DUE THU–FRI" (`$cat-medical`, JetBrains Mono 10/normal, letterSpacing 1).

**2.5 Minimized state (annotated example, absolute-positioned over the frame)**
- **Min Caption** `d84nxW` — `layoutPosition absolute`, x 644 / y 1004, `gap 7`, align center: `ArrowDown` icon 13×13 `$muted-foreground-subtle` + `CapTxt` "MINIMIZED STATE — DOCKS HERE WHEN YOU LEAVE" (`$muted-foreground-subtle`, JetBrains Mono 10/600, letterSpacing 1.5).
- **Minimized Pill** `qogkb` — `layoutPosition absolute`, x 644 / y 1036, `fill $card`, `cornerRadius 999`, `stroke $primary 1` (inner), **outer shadow** `#00000066` offset (0,6) blur 20, `gap 11`, `padding [11,16]`, align center:
  - `Glyph` `RubBe` (15w) → `PillSpin` ellipse `FOl1F` 14×14 `$primary` (arc, `innerRadius 0.62`, start 60, sweep 280).
  - `PillTxt` "Researching permit steps" (`$foreground`, JetBrains Mono 13/700).
  - `PillSep` "·" (`$muted-foreground-subtle`, JetBrains Mono 13/normal).
  - `PillTime` "00:42" (`$primary`, JetBrains Mono 13/700, letterSpacing 1).
  - `Expand` `GuvLP` — 24×24, `fill $card-elevated`, `cornerRadius 999`, center → `Up` icon (chevron-up) 13×13 `$muted-foreground`.

> The pill + caption are the **only** rounded (radius 999) and **only** shadowed elements on an otherwise zero-radius board (`--radius` = 0). These are intentional exceptions and are authoritative for MinimizedJobPill.

---

### 3. Mobile layout (B4ooE5), top → bottom, exact px / tokens

**3.1 Header** `c7ftHc` — `fill $muted`, `stroke {bottom:1} $border`, `width fill_container`, `padding [14,18]` (row): `Wordmark` `P7bvA` → `OPS` (`$primary`, JetBrains Mono 14/700, letterSpacing 3) + `BOARD` (`$muted-foreground`, same) ; `Tag` `eNTvf` "02 RUNNING" (`$muted-foreground-subtle`, JetBrains Mono 9/700, letterSpacing 1.5).

**3.2 Body** `dHWHz` — `width fill_container`, `layout vertical`, `gap 16`, `padding [18,18,26,18]`. Stacked sections:

**(a) Scope chip** `TvJEp` (= ScopeChip) — `fill #ff6b351f`, `stroke {left:2} $primary` (inner), `width fill_container`, `gap 8`, `padding [10,12]` (row): `I` icon (Target) 14×14 `$primary` + `L` "SCOPE · AfrikaBurn 2026" (`$primary`, JetBrains Mono 11/700, letterSpacing 1).

**(b) Job card** `xOvqP` (= ResearchJobPanel, mobile rendering) — `fill $card`, `stroke $border 1`, `width fill_container`, `layout vertical`, `gap 14`, `padding 16` (NO top `Accent` bar on mobile):
- **Top** `h3IB1` — `width fill_container`, `justify space_between`, align center: `L` `nmsf0` (`gap 8`) → `I` icon (loader-circle) 15×15 `$primary` + `T` "RESEARCHING…" (`$primary`, JetBrains Mono 12/700, letterSpacing 1.5) ; `Timer` "00:42" (`$foreground`, JetBrains Mono 13/700, letterSpacing 1) — note: mobile inlines the timer here, no separate ELAPSED label/30px value.
- `Task` "Submit Tankwa land-use permit" (`$foreground`, DM Sans 15/**600**, `width fill_container`) — note copy differs from desktop ("Submit …" vs "Tankwa land-use permit").
- **Track** `a0hNt6` — `fill $card-elevated`, `width fill_container`, `height 4`, `clip` → `Bar` `DV5NL` `fill $primary`, **width 150**, height 4 (indeterminate chunk; no x-offset on mobile — starts at left).
- **Log** `VcMKt` — `width fill_container`, `layout vertical`, `gap 9`. Five steps (`Step` frames, `gap 10`, glyph `G` 16×16):
  1. **Done** `kNLsB`: `I` icon (circle-check) 15×15 `$success` + `T` "Parsed intent · resolved target task" (`$foreground`, JetBrains Mono 12/**500**, fill).
  2. **Done** `qk87P`: circle-check `$success` + "Searched the web · 8 results".
  3. **Active** `ig2Dv`: `I` icon (loader-circle) 15×15 `$primary` + "Reading source 3 of 6 · tankwatown.org" (`$primary`, JetBrains Mono 12/**600**, fill). NOTE: mobile active row has **no** `$card-elevated` fill and **no** left-accent stroke (unlike desktop Active row).
  4. **Pending** `UzQyS`: `I` ellipse 6×6 `$muted-foreground-subtle` + "Extracting steps" (`$muted-foreground-subtle`, JetBrains Mono 12/500, fill). NOTE: mobile pending text uses `$muted-foreground-subtle` (desktop uses `$muted-foreground`).
  5. **Pending** `v8ghwG`: ellipse 6×6 + "Drafting notes".

**(c) ComeBack banner** `a6QbQc` (= ComeBackLaterBanner, mobile rendering) — `fill $muted`, `stroke $border 1` (NOT the desktop primary/8 fill + left-accent), `width fill_container`, `gap 10`, `padding 13` (row): `I` icon (Bell) 16×16 `$muted-foreground` + `T` "Running in the background — you can leave. We'll notify you when it's ready." (`$muted-foreground`, DM Sans 13/normal, fill). This matches the canonical ComeBackLaterBanner (muted Alert) shape; the desktop variant is the one that diverges.

**(d) Notes preview** `eKrjy` — `width fill_container`, `layout vertical`, `gap 9`: `K` "NOTES — INCOMING" (`$muted-foreground-subtle`, JetBrains Mono 9/600, letterSpacing 1.5) + **Skeleton** `H6GCC` — `fill $card`, `stroke $border 1`, `width fill_container`, `layout vertical`, `gap 10`, `padding 14` → five `Skel` rects `$card-elevated` h11 of varying widths: 300, 340, 210, 330, 160 (no leading dot — pure stacked bars, unlike desktop dot+two-line blocks).

**(e) Minimized example** `D0ttF` — `width fill_container`, `layout vertical`, `gap 8`: `K` "MINIMIZED — DOCKED PILL" (`$muted-foreground-subtle`, JetBrains Mono 9/600, letterSpacing 1.5) + **Pill** `C8uAS` — `fill $card-elevated` (NOTE: mobile pill uses `$card-elevated`, desktop uses `$card`), `stroke $primary 1`, `gap 9`, `padding [10,14]`, align center, **NO cornerRadius (sharp) and NO shadow** on mobile: `I` icon (loader-circle) 14×14 `$primary` + `T` "Researching permit steps" (`$foreground`, JetBrains Mono 12/**500**) + `Dur` "00:42" (`$primary`, JetBrains Mono 12/700). No separator dot and no expand chevron on mobile.

---

### 4. Every state in this scope

**Job-level state (ResearchJobPanel):** only **running / researching** is laid out here. Canonical job states `complete` (→ AINotesBlock, out of scope) and `error` (→ ErrorStateCard, out of scope) are referenced but not rendered on these frames.

**Progress bar:** **indeterminate** only — a single `$primary` chunk (desktop 340w offset x430; mobile 150w at left) over a `$card-elevated` track. This is NOT the canonical 3-segment mission ProgressBar (done/closing/blocked). No determinate / value-filled state appears.

**ResearchStepRow states (all three rendered):**
- **done** — glyph = check (desktop "✓" mono text; mobile circle-check icon) `$success`; label `$foreground` (mobile weight 500); optional trailing `Meta` (desktop only: "tankwa land-use", "8 RESULTS").
- **active** — glyph = arc spinner ellipse `$primary`; label `$primary` weight 700 (mobile 600); desktop adds row container highlight (`$card-elevated` fill + `{left:2} $primary` accent + `padding [10,16]`); optional `Src` suffix ("· tankwatown.org").
- **pending** — glyph = 6×6 ellipse dot `$muted-foreground-subtle`; label `$muted-foreground` (desktop) / `$muted-foreground-subtle` (mobile); often trailing ellipsis "…".

**Streaming indicator (desktop LogHead only):** static `STREAMING` + `$success` dot — represents the log actively appending.

**RunningBadge / RESEARCHING header badge:** desktop header carries a bespoke `RunningBadge` (Pulse dot + "RESEARCHING" + a separate header `Timer` 00:42). Mobile header carries only the static `02 RUNNING` tag (no live badge/timer in the header).

**ResearchAttachedBadge (Target Card, desktop):** `researching` state — pulse dot + "RESEARCHING" (no timer rendered in this instance, though the canonical atom supports an elapsed timer).

**Target/Context card status glyphs:** Target Card = research/active (18×18 primary-bordered box + arc spinner); both CtxCards = not-started (16×16 `$border`-stroked empty box, no inner dot). These are display-only here (no in-progress/done variants rendered).

**MinimizedJobPill state:** `running` (arc spinner + live timer 00:42 + expand chevron-up). Canonical `done`/`error` pill states are not rendered.

**Skeleton:** single "waiting/incoming" loading state (no content/empty/error variants).

---

### 5. Interactions

This surface is read-only except for three job-lifecycle controls and the docked pill:
1. **MINIMIZE** (`Btn Minimize` `bkCHm`, desktop): collapses the in-page panels to the docked **MinimizedJobPill**; the job keeps running. Pill is shown docked bottom-area (absolute x644/y1036) per the "MINIMIZED STATE — DOCKS HERE WHEN YOU LEAVE" caption.
2. **COME BACK LATER** (`Btn ComeBack` `nnfZC`, desktop, primary): backgrounds the job and (per copy) registers a notification — "we'll notify you the moment results are ready." Navigating away is explicitly safe.
3. **Expand** (`Expand` `GuvLP` chevron-up inside the desktop pill): re-opens the full Research Job panel from the minimized pill (mobile pill has no expand control rendered).
4. **Live updates (no user input):** spinners rotate (arc ellipses), the indeterminate chunk slides, the ELAPSED / Timer values tick up, and the step log appends/promotes rows (pending → active → done) as the agent streams. `Step N of M` and the active step's source text update in place. None of these are gestures — they are driven by job state.

No StatusCycleButton interaction occurs here; the Target Card status glyph is a non-interactive research-state indicator, and the CtxCards are non-interactive context references.

---

### 6. Data / logic contracts

- **job.state** ∈ {`running`(=researching), `complete`, `error`}. This scope renders only `running`. `complete` transitions the Notes Skeleton → AINotesBlock and the pill → done; `error` → ErrorStateCard. (Transitions out of scope but must be wired.)
- **job.taskName** → `Task` text (desktop "Tankwa land-use permit"; mobile "Submit Tankwa land-use permit" — copy differs by breakpoint).
- **job.scope** → desktop `Scope` line ("Web research · finding required steps & official sources").
- **job.elapsedMs** → formatted `mm:ss` ("00:42") rendered in: desktop header Timer, desktop ELAPSED value (30px), MinimizedJobPill PillTime, mobile Top Timer, mobile pill Dur. ELAPSED is **monotonic count-up**; there is **no ETA / countdown** (`PNote` = "NO FIXED ETA"). The progress bar is **indeterminate** and carries no completion fraction.
- **job.steps[]** = `{ label, state: 'done'|'active'|'pending', meta?, source? }` → ResearchStepRow log. Step counter `Step {currentIndex} of {steps.length}` ("Step 3 of 6"); the active step's `source` ("tankwatown.org") and done steps' `meta` ("8 RESULTS", "tankwa land-use") are optional per-step fields.
- **Step counter mismatch (informational):** desktop step log renders **7** rows (3 done + 1 active + 3 pending) while `PStep` says "Step 3 of 6"; mobile renders **5** rows (2 done + 1 active + 2 pending). The "of 6" is the agent's planned-step count, not the rendered-row count — the contract is `currentIndex`/`plannedTotal`, decoupled from how many log lines are visible.
- **binding:** the job is BOUND TO TASK — Rail Target Card shows the bound task (title, target date, ResearchAttachedBadge). `BindNote` states findings are **appended as notes** on this task on completion (read-only output; consistent with OpsBoard's read-only model). MissionCtx shows the parent mission ("AfrikaBurn 2026", category `cat-bureaucratic`). Mobile surfaces this as the ScopeChip ("SCOPE · AfrikaBurn 2026").
- **task target date:** "Target: 27 Apr 2026" (human format) — note OpsBoard's cliff semantics ("too_late_by"); this is a target line, not a due date, and shows no window-state pill in this scope.
- **context cards:** read-only references to two other board tasks with window-summary labels ("CLOSES MON–WED" `cat-bureaucratic`; "DUE THU–FRI" `cat-medical`); both rendered not-started. Purely contextual — no interaction, no live binding to the job.
- **notify-on-complete:** COME BACK LATER implies a notification capability ("we'll notify you the moment results are ready"); the trigger is `job.state → complete`.

---

### 7. Token / hex notes (informational drift)

- Raw orange tints `#ff6b351f` (primary/12) and `#ff6b3514` (primary/8) appear literally on: RunningBadge, ResearchBadge, Target Card Status, IconWrap, Come Back Banner fill, mobile Scope chip. Per the token-alpha rule these should resolve to `$primary/12` and `$primary/8` tokens. Authoritative as rendered; recorded for consolidation.
- MinimizedJobPill shadow `#00000066` and `cornerRadius 999` are literal exceptions on a zero-radius board — intentional, authoritative for the pill.
- `--radius` token = 0; everything except the desktop pill/caption is sharp-cornered.

---

### 8. Coverage checklist

This section fully specs, for both VYFZ9 (desktop) and B4ooE5 (mobile): the header (incl. desktop bespoke RunningBadge + header Timer, mobile 02 RUNNING tag), the ResearchJobPanel (spinner, RESEARCHING…, ELAPSED label + 30px value, indeterminate ProgressBar chunk, Step 3 of 6, NO FIXED ETA), the LIVE STEP LOG / ResearchStepRow done/active/pending rows with exact glyphs/tokens/copy and the STREAMING indicator, the ComeBackLaterBanner (desktop primary/8 + accent + Minimize/Come Back Later buttons; mobile muted Alert variant), the Notes Skeleton (desktop dot+two-line blocks; mobile 5 stacked bars), the right Rail (BOUND TO TASK label, MissionCtx, Target Card + ResearchAttachedBadge, BindNote, divider, ELSEWHERE ON BOARD + 2 CtxCards), the MinimizedJobPill docked state (desktop absolute+shadow+radius999+expand; mobile inline example), every rendered state, all interactions (Minimize / Come Back Later / Expand / live updates), the data & logic contracts, and the indeterminate-vs-3-segment ProgressBar divergence and all token/hex drift.

# AI Research — Result & Notes read-out (desktop 03 + mobile Result & Notes)

*scope: AI Research — Result & Notes read-out*

## AI Research — Result & Notes read-out

> **Scope:** the completed-research read-out screens of the AI Research (Task Agent) flow — desktop frame `03 · Result & Notes` (`d6vKcL`) and mobile frame `Mobile — Result & Notes` (`oCRZL`) on board GZ7xA. This is the **VoiceQueryResultCard payload** rendered as a task-detail surface: AI-authored notes appended to a task, with attribution, summary, numbered steps with citations, a sources list, keep/dismiss/view-sources affordances, and a success toast. Authoritative source = the screens as laid out; canonical-library divergence is noted per component.
>
> **Read-only product law:** OpsBoard is a status display. Nothing here mutates board data except (a) tapping the task's StatusCycleButton (cycle not-started→in-progress→done) and (b) the **KEEP NOTES** affordance, which is the explicit user confirmation that appends the AI notes to `tasks.notes`. **DISMISS** discards the proposed notes (no write). VIEW SOURCES / OPEN ALL SOURCES open external links only.

### 1. Purpose

A completed AI-research job has produced a structured answer bound to one task ("Submit Tankwa land-use permit", mission "AfrikaBurn 2026", category BUREAUCRATIC). This surface presents that answer for human review before it is committed to the task's notes. It is the terminal state of the 01→02→03 research flow (Voice & Intent → Running/Come-back-later → Result & Notes). The screen composes a **result-mode MissionDetailHeader** (task identity + window state + status cycle), the bespoke **AINotesBlock** (attribution + NEW pill + summary + numbered steps + inline citations + embedded sources list), an **affordances row**, and a transient **success Toast** confirming the append once KEEP NOTES is pressed.

### 2. Desktop frame `03 · Result & Notes` (`d6vKcL`)

Outer frame: `1320 × 1120`, fill `$background` (#0a0a0c), 1px `$border` (#2a2a38) stroke, vertical layout. Top→bottom:

**A. TopBar** (`Ku0Zm`) — fill `$muted` (#131318), 1px `$border` bottom stroke only (`strokeWidth {bottom:1}`), padding `[16,32]`, `alignItems center`, `justifyContent space-between`.
- **Breadcrumb** (`V3h9x`), gap 8, center: `OPSBOARD` (JetBrains Mono 13 / 700, `$primary` #ff6b35, letterSpacing 1.5) · `/` separator (Mono 13 / normal, `$muted-foreground-subtle` #4a4a5e) · `AfrikaBurn 2026` (Mono 13 / normal, `$muted-foreground` #7a7a8e) · `/` separator · `TASK DETAIL` (Mono 13 / 700, `$foreground` #e8e8f0, letterSpacing 1). Four crumb segments + two separators.
- **Esc affordance** (`jiVYX`), gap 7, center: text `CLOSE` (Mono 11 / 600, `$muted-foreground-subtle`, letterSpacing 1.5) + lucide `x` icon 15×15 `$muted-foreground`. Maps to keyboard ESC to dismiss the detail.

**B. Body** (`b6KXP`) — `fill_container` w/h, vertical, gap 22, padding `[28,32]`. Two children: DetailHeader, AINotesBlock (the affordances row and sources list live INSIDE the AINotesBlock on desktop — see below).

**B1. DetailHeader** (`q7rlPD`) — result-mode MissionDetailHeader. Vertical, gap 14, padding `[0,0,22,0]`, 1px `$border` bottom stroke.
- **MetaRow** (`M4tpx`), gap 10, center:
  - **CategoryTag** (`i1xKei`): fill `#5aa0e01f` (= `$cat-bureaucratic` #5aa0e0 @ ~12% alpha, raw hex), gap 5, padding `[4,9]`, NO stroke, NO cornerRadius authored. lucide `file-text`-class icon 12×12 `$cat-bureaucratic` + label `BUREAUCRATIC` (Mono 11 / 600, `$cat-bureaucratic`, letterSpacing 0.5).
  - **WindowStatePill** (`ZaJM2`): gap 5, center, NO fill / NO stroke / NO radius authored (transparent). lucide `clock`-class icon 12×12 `$warning` (#d9a73e) + label `CLOSING · T-12d` (Mono 11 / 600, `$warning`, letterSpacing 0.5). State = **closing**.
  - **Spacer** (`D551qk`): `fill_container` width, height 1.
  - **StatusCycleButton** (`VPTOj`): RENDERED AS A LABELED PILL, not the canonical 18px square. fill `$card` (#1a1a22), 1px `$border` stroke, gap 8, padding `[8,12]`, center. Children: 8×8 ellipse **Dot** fill `$muted-foreground` + label `OPEN` (Mono 12 / 700, `$foreground`, letterSpacing 1) + lucide cycle/refresh icon 13×13 `$muted-foreground-subtle`. (NOTE: label `OPEN` reads as a window state but sits in the status-cycle control; see divergence notes.)
- **Title** (`jB9Xw`): `Submit Tankwa land-use permit` — DM Sans 26 / 700, `$foreground`.
- **Target** (`fd1nK`): `Target: 18 Apr 2026 · CapeNature regional office · Mission: AfrikaBurn 2026` — JetBrains Mono 13 / normal, `$muted-foreground`. (Word "Target", NOT "due"/"overdue" — temporal-cliff language.)

**B2. AINotesBlock** (`L6TvtJ`) — fill `$card`, 2px `$primary` **left** stroke only (`strokeWidth {left:2}`), `fill_container`, vertical. Inner padding container (`KgwT1`): `fill_container`, vertical, gap 18, padding `[18,22]`. Children top→bottom:
1. **AttribRow** (`nD8i9`): `fill_container`, center, space-between.
   - Left (`ZdEfU`): gap 9, lucide `bot`/`sparkles`-class icon 16×16 `$primary` + **Attribution** `AI RESEARCH · 5 NOTES · 2026-06-03 14:22` (Mono 12 / 700, `$primary`, letterSpacing 1). Embeds note count (5) and ISO timestamp in one mono string.
   - **NEW pill** (`l2I4Bw`): fill `$primary`, padding `[3,9]`, cornerRadius 999, center; label `NEW` (Mono 10 / 700, `$primary-foreground` #0a0a0c, letterSpacing 1.5).
2. **Summary** (`kKtoV`): DM Sans 14 / normal, `$foreground`, `fill_container`, lineHeight 1.5. Literal: *"Tankwa land-use happens through CapeNature — submit the regional land-use application with the AfrikaBurn event letter, settle the SARS levy, then await the gate-access permit. Allow ~10 working days."*
3. **Steps** (`lNfaQ`): vertical, gap 14, `fill_container`. Five numbered steps; each step (`w6LipG` etc.) is horizontal, gap 12:
   - **Num badge** (`y0ydT`): 24×24, fill `$card-elevated` (#22222e), 1px `$border` stroke, center; numeral (Mono 12 / 700, `$primary`). Sharp square (no cornerRadius authored).
   - **Col** (`y9sb6`): vertical, gap 6 — step text (DM Sans 14 / normal, `$foreground`, `fill_container`, lineHeight 1.5) + **Citations row** (`RiCKw`): gap 6, center, holding 1–N **CitationChip** frames.
   - **CitationChip** (e.g. `ETWAB`): fill `$card-elevated`, 1px `$border` stroke, padding `[1,6]`, center; text `[1]` (Mono 10 / 600, `$primary`). Rendered as a discrete bordered chip (NOT inline-bracket in the prose) on desktop.
   - Step→citation map (desktop): **Step 1** → `[1]`; **Step 2** → `[1] [2]`; **Step 3** → `[3]`; **Step 4** → `[2]`; **Step 5** → `[1] [2]`. Citation indices reference the sources list 1-based.
   - Step texts (literal): (1) "Open the CapeNature land-use application portal and select the Tankwa Karoo regional office as the responsible authority." (2) "Attach the AfrikaBurn 2026 official event authorisation letter plus the participant land-use motivation form." (3) "Pay the environmental impact assessment levy via SARS eFiling and retain the payment reference (PRN)." (4) "Submit the completed application at least 10 working days before the target date to clear regional review." (5) "On approval, download the gate-access permit and record the permit number against this task."
4. **Sources** (`g9TRt`): vertical, gap 4, padding `[16,0,0,0]`, 1px `$border` **top** stroke. Label `SOURCES` (Mono 11 / 700, `$muted-foreground-subtle`, letterSpacing 2). **List** (`Xi6TU`) `fill_container` vertical, three **SourceRow** items:
   - SourceRow chassis: `fill_container`, gap 10, padding `[10,0]`, center; 9×9 ellipse favicon-dot + Domain (Mono 12 / 600, `$muted-foreground`) + Title (DM Sans 13 / normal, `$foreground`, `fill_container`) + lucide `external-link` icon 14×14 `$muted-foreground-subtle`. Rows 2 & 3 add a 1px `$border` **top** stroke as inter-row divider (row 1 has none).
   - Row 1 (`z1Pwf`): dot `$cat-bureaucratic` · `tankwatown.org` · "Tankwa Town — land-use & gate permits".
   - Row 2 (`YA4aX`): dot `$cat-travel` (#5ae0a0) · `capenature.co.za` · "Protected-area land-use applications".
   - Row 3 (`TgThl`): dot `$primary` · `sars.gov.za` · "eFiling — environmental levy payments".
5. **Affordances** (`WlPxa`): `fill_container`, padding `[16,0,0,0]`, 1px `$border` **top** stroke, center, space-between.
   - **Primary Actions** (`Sospk`), gap 10:
     - **KEEP NOTES** (`avAye`): fill `$primary`, gap 7, padding `[10,18]`, center; lucide check/save icon 14×14 `$primary-foreground` + label `KEEP NOTES` (Mono 12 / 700, `$primary-foreground`, letterSpacing 1). Primary action.
     - **DISMISS** (`SU2It`): NO fill / NO stroke (ghost), gap 7, padding `[10,16]`, center; label `DISMISS` (Mono 12 / 700, `$muted-foreground`, letterSpacing 1).
   - **VIEW SOURCES** (`IhMgm`): fill `$secondary` (#1a1a22), 1px `$border` stroke, gap 7, padding `[10,16]`, center; lucide list/external icon 14×14 `$foreground` + label `VIEW SOURCES` (Mono 12 / 700, `$foreground`, letterSpacing 1). Secondary action, right-aligned.

**C. Success Toast** (`p2Cz3`) — width 380, fill `$card`, 1px `$border` stroke, vertical. Floating/overlay element (not in body flow). Structure:
- **Accent** (`E7ZEfM`): `fill_container` width, height 2, fill `$success` (#5ae07a) — top accent bar.
- **Body** (`xXcYA`): `fill_container`, vertical, gap 8, padding 16.
  - **HeaderRow** (`K1qdO`): gap 8, center; lucide `check`/`check-circle` icon 14×14 `$success` + header `ADDED 5 NOTES` (Mono 12 / 700, `$success`, letterSpacing 1).
  - **Body text** (`sxYKj`): `Tankwa land-use permit · notes appended to task` (DM Sans 13 / normal, `$foreground`, `fill_container`, lineHeight 1.4).
  - **Meta** (`cobu3`): `AUTO-DISMISS · 4S` (Mono 10 / normal, `$muted-foreground-subtle`, letterSpacing 1).

### 3. Mobile frame `Mobile — Result & Notes` (`oCRZL`)

Outer frame: width 390 (auto height), fill `$background`, 1px `$border` stroke, vertical. Top→bottom:

**A. Header** (`Y3NzP`) — fill `$muted`, 1px `$border` bottom stroke, padding `[14,18]`, center, space-between.
- **Wordmark** (`ZOd0T`): `OPS` (Mono 14 / 700, `$primary`, letterSpacing 3) + `BOARD` (Mono 14 / 700, `$muted-foreground`, letterSpacing 3). Split-color wordmark.
- **Tag** (`pBbj0`): `03 RESULT` (Mono 9 / 700, `$muted-foreground-subtle`, letterSpacing 1.5).

**B. Body** (`nwbuc`) — `fill_container`, vertical, gap 16, padding `[18,18,26,18]`. Children: TaskHeader (card), AINotes (card), Actions stack, Toast.

**B1. TaskHeader** (`JjDMF`) — card chassis: fill `$card`, 1px `$border` stroke, `fill_container`, gap 12, padding 14, horizontal. Reuses the **TaskCard** chassis as a detail header.
- **Touch target** (`H4a7nL`): 30×30, center → **Cycle** (`C4aNJ`): 18×18, fill `#ff6b351f` (= `$primary` @ ~12%, raw hex), 2px `$primary` stroke, center → 8×8 rectangle `F` fill `$primary`. This is the **canonical StatusCycleButton in-progress glyph** (square ▪) — mobile renders the real 18px/2px-square control, unlike desktop's labeled pill.
- **Body** (`huTDn`): `fill_container`, vertical, gap 8.
  - **Name** (`Jo6lT`): `Submit Tankwa land-use permit` (DM Sans 15 / 600, `$foreground`, `fill_container`).
  - **Meta** (`m2DI2`), gap 8, center:
    - **CategoryTag** (`k3rK0`): fill `#5aa0e01f`, gap 4, padding `[3,8]`, cornerRadius 999, center; 11×11 icon `#5aa0e0` (raw hex, not `$cat-bureaucratic` token) + `BUREAUCRATIC` (Mono 10 / 700, `#5aa0e0`, letterSpacing 0.5). NOTE: mobile pill HAS cornerRadius 999; desktop pill did not.
    - **WindowStatePill** (`W0XiuQ`): fill `#d9a73e1f` (= `$warning` @ ~12%, raw hex), gap 4, padding `[3,8]`, cornerRadius 999, center; 11×11 `clock`-class icon `$warning` + `CLOSING · T-21d` (Mono 10 / 700, `$warning`, letterSpacing 0.5). NOTE: mobile shows tinted fill + radius; desktop window pill was transparent/no-radius. Also **T-21d on mobile vs T-12d on desktop** (different copy values).

**B2. AINotes** (`gfPA3`) — fill `$card`, 2px `$primary` **left** stroke, `fill_container`, vertical, gap 13, padding 16. Children:
1. **Attr row** (`dzl6T`): `fill_container`, center, space-between. Left (`V6p0iV`) gap 7: 14×14 icon `$primary` + `AI RESEARCH · 5 NOTES` (Mono 10 / 700, `$primary`, letterSpacing 1.5) — NOTE: timestamp split out of the attribution string on mobile. **New pill** (`bq3Qw`): fill `$primary`, padding `[2,7]`, cornerRadius 999; `NEW` (Mono 9 / 700, `$primary-foreground`, letterSpacing 1).
2. **Date** (`Yj1NR`): `Added 2026-06-03 · 14:22` (Mono 10 / 500, `$muted-foreground-subtle`) — separate row (vs inlined on desktop).
3. **Summary** (`ynv2p`): DM Sans 14 / 500, `$foreground`, `fill_container`, lineHeight 1.45. Literal: *"The Tankwa Karoo land-use permit is issued by CapeNature. Apply at least 30 days before arrival and carry the PDF to the gate."* (Different copy from desktop summary.)
4. **Steps** (`LyeZ3`): vertical, gap 11, `fill_container`. Five steps; each (`zKv7Q` etc.) horizontal, gap 10:
   - **Num** (`B5LcYb`): 20×20, fill `#ff6b351f` (raw hex, NO stroke — divergent from desktop's `$card-elevated`+border square), center; numeral (Mono 11 / 700, `$primary`).
   - **Text** (`bGqc5`): DM Sans 14 / normal, `$foreground`, `fill_container`, lineHeight 1.45. **Citations are INLINE BRACKETS appended to the text string, NOT discrete chips** — e.g. "…land-use application. [1]". This is the key mobile vs desktop CitationChip divergence.
   - Mobile step texts + inline citations: (1) "Create a CapeNature online profile and start a new land-use application. **[1]**" (2) "Upload your ID, vehicle details and AfrikaBurn ticket confirmation. **[2]**" (3) "Pay the R150 conservation levy by EFT and attach proof of payment." (no citation) (4) "Submit at least 30 days before 27 Apr 2026 to allow processing. **[1]**" (5) "Save the emailed permit PDF — you must show it at the Tankwa gate. **[3]**".
5. **Divider** (`rvODh`): rectangle, `fill_container` width, height 1, fill `$border` (explicit rect, vs desktop's top-stroke technique).
6. **Sources label** (`uHmOI`): `SOURCES` (Mono 9 / 600, `$muted-foreground-subtle`, letterSpacing 1.5).
7. **Sources** (`goOHb`): vertical, gap 11, `fill_container`. Three rows; each (e.g. `TGvAu`) horizontal, gap 10, center: 8×8 ellipse favicon + **Txt** col (vertical, gap 2: Domain Mono 11 / 600 `$muted-foreground` over Title DM Sans 13 / normal `$foreground` `fill_container`) + lucide `external-link` 14×14 `$muted-foreground-subtle`. NOTE: mobile stacks domain-over-title in a 2-line column; desktop laid domain+title on one row. No inter-row dividers on mobile.
   - Row 1: favicon `#5ae0a0` · `capenature.co.za` · "Land-use permits & conservation levies".
   - Row 2: favicon `#ff6b35` · `afrikaburn.org` · "Tickets & Tankwa permits FAQ".
   - Row 3: favicon `#e0c05a` · `tankwatown.org` · "Getting to the Tankwa Karoo".
   - Favicon dots are raw hex (not category tokens) and the source SET differs from desktop (afrikaburn.org replaces sars.gov.za).

**B3. Actions** (`SkKHv`) — `fill_container`, vertical, gap 8. Mobile re-orders/stacks the affordances:
- **OPEN ALL SOURCES** (`h12nn`): full-width, fill `$secondary`, 1px `$border` stroke, height 46, gap 8, center; 15×15 icon `$foreground` + `OPEN ALL SOURCES` (Mono 12 / 600, `$foreground`, letterSpacing 1). NOTE: mobile label is "OPEN ALL SOURCES" vs desktop "VIEW SOURCES"; placed first/full-width.
- **Pair** (`sNK1q`): horizontal, gap 10, two half-width buttons:
  - **DISMISS** (`oIrtX`): `fill_container`, NO fill, 1px `$border` stroke (outline, vs desktop ghost), height 48, center; `DISMISS` (Mono 12 / 600, `$muted-foreground`, letterSpacing 1).
  - **KEEP NOTES** (`lLfCz`): `fill_container`, fill `$primary`, height 48, gap 8, center; 16×16 icon `$primary-foreground` + `KEEP NOTES` (Mono 12 / 700, `$primary-foreground`, letterSpacing 1).

**B4. Toast** (`XsIrn`) — IN-FLOW on mobile (last body child, not overlay): fill `$card`, 3px `$success` **left** stroke (vs desktop's 2px success TOP accent bar), `fill_container`, vertical, gap 6, padding 14.
- **Row** (`RsUcM`), gap 8, center: 14×14 icon `$success` + `ADDED 5 NOTES` (Mono 11 / 700, `$success`, letterSpacing 1.5).
- **Body** (`rmUW4`): `Submit Tankwa land-use permit` (DM Sans 13 / normal, `$muted-foreground`, `fill_container`). NOTE: mobile toast body uses `$muted-foreground` and the full task name; desktop used `$foreground` + "…· notes appended to task", and includes a `AUTO-DISMISS · 4S` meta line that mobile omits.

### 4. States in this scope

- **Result populated (success)** — the only data-bearing state shown: notes proposed, NEW pill present, 5 steps, citations, sources, affordances active.
- **Window state = closing** (warning) for the bound task — desktop "CLOSING · T-12d", mobile "CLOSING · T-21d". The WindowStatePill must support open/closing/closed/not-yet; only closing is rendered here.
- **Task status = in-progress** (mobile cycle glyph = filled orange ▪ on `#ff6b351f`) / labeled "OPEN" on desktop pill — see divergence; the StatusCycleButton supports not-started/in-progress/done.
- **NEW (unseen) state** — NEW pill present indicates the notes are newly attached and not yet reviewed/kept.
- **Success toast (post-KEEP-NOTES)** — `ADDED 5 NOTES`, auto-dismiss 4s (desktop meta) / persistent-until-replaced semantics on mobile in-flow placement.
- Implied (not rendered here, belongs to sibling frames 01/02/04): loading/skeleton (frame 02), error/empty/low-confidence (frame 04). This scope covers ONLY the populated success read-out + its toast.

### 5. Interactions

1. **KEEP NOTES** → user-confirmed commit. Appends the AI-authored notes (summary + steps + citation refs + source URLs) to `tasks.notes` for the bound task; replaces the proposal with the success Toast (`ADDED 5 NOTES`). This is the single write this surface performs and is intentionally explicit (read-only-board law: AI output is never auto-committed).
2. **DISMISS** → discards the proposed notes, no DB write, returns to prior view. No-op on task data.
3. **VIEW SOURCES** (desktop) / **OPEN ALL SOURCES** (mobile) → opens all source URLs (external links, new tab/in-app browser). Read-only.
4. **SourceRow tap / external-link icon** → opens that single source URL externally.
5. **CitationChip tap** (desktop bordered chip) → scroll/highlight the matching SourceRow (citation index → source). On mobile citations are inline-bracket text, so the equivalent is the OPEN ALL SOURCES affordance (inline brackets may be non-interactive).
6. **StatusCycleButton tap** → cycle task status not-started→in-progress→done (the board's universal direct interaction); not a research-specific action but present on the header.
7. **ESC / CLOSE** (desktop topbar) → dismiss the task-detail read-out, return to board.
8. **Toast auto-dismiss** → desktop ~4s ("AUTO-DISMISS · 4S"); the toast is informational, no actions.

### 6. Data & logic contracts

- **VoiceQueryResultCard payload (research result).** This screen IS the rendered research result: `{ taskRef, attribution: { source:'AI RESEARCH', noteCount:5, timestamp:'2026-06-03 14:22' }, isNew:true, summary, steps: [{ index, text, citations: number[] }], sources: [{ index, domain, title, url, faviconTone }] }`. `noteCount` = `steps.length` (5). Citations are 1-based indices into `sources`.
- **Bound task identity** = `{ name:'Submit Tankwa land-use permit', mission:'AfrikaBurn 2026', category:'bureaucratic', tooLateBy → window:'closing', target:'18 Apr 2026' (desktop) / implied 27 Apr 2026 (mobile step copy), status:'in-progress'|displayed 'OPEN' }`. Header content is the same task whether desktop or mobile.
- **Window state** is DERIVED in `@opsboard/core` from `too_late_by` (closing = cliff near). Pill shows color+icon+label (redundant channels); NEVER "overdue". T-Nd countdown is computed (today 2026-06-03).
- **Status** is one of the 3 stored statuses (`not-started|in-progress|done`); `blocked` is computed elsewhere and not shown on this surface. The cycle control mutates `tasks.status` directly.
- **KEEP NOTES write contract:** append serialized notes to `tasks.notes` (the `notes text` column in schema.ts). This is the research/append-notes action the AI flow produces; it is a confirmed mutation (per brief: AI/low-confidence output requires explicit confirmation, never auto-applied). After write, emit the success toast.
- **Sources / citations are content data**, not stored board state; they are part of the transient research payload and (optionally) persisted alongside the appended notes when KEEP NOTES is pressed.
- **Source-of-truth note:** the two frames disagree on several literal values (window countdown T-12d vs T-21d, summary text, step copy, citation map, source set, target date). The build should treat these as INDEPENDENT mocked instances of the same component contract; the COMPONENT contract (props/shape) is what's authoritative, not the specific literals.

### 7. Token & type inventory (resolved)

- Colors: `$background` #0a0a0c · `$foreground` #e8e8f0 · `$card` #1a1a22 · `$card-elevated` #22222e · `$muted` #131318 · `$border` #2a2a38 · `$muted-foreground` #7a7a8e · `$muted-foreground-subtle` #4a4a5e · `$secondary` #1a1a22 · `$primary` #ff6b35 · `$primary-foreground` #0a0a0c · `$warning` #d9a73e · `$success` #5ae07a · `$cat-bureaucratic` #5aa0e0 · `$cat-travel` #5ae0a0. Raw-hex tints used (drift): `#5aa0e01f`, `#d9a73e1f`, `#ff6b351f` (≈12% alpha of their tokens); mobile favicon dots `#5ae0a0`/`#ff6b35`/`#e0c05a` and category icon/label `#5aa0e0` are raw hex rather than tokens.
- Type: JetBrains Mono = all chrome/labels/data/citations/sources-domain/window+category/attribution/toast-header (sizes 9–14, weights 500/600/700). DM Sans = human text: task name (15/600 mobile, 26/700 title desktop), summary (14), step text (14), source titles (13), toast body (13). lineHeight 1.4–1.5 on body text.

# AI Research — Errors & Edge States (ErrorStateCard catalog)

*scope: AI Research errors & edge-state catalog*

## AI Research — Errors & Edge States (ErrorStateCard catalog)

**Board:** `GZ7xA` · `docs/design-extract/boards/GZ7xA__ai-research-task-agent.json`
**Scope surfaces:** Desktop `04 · Errors & Edge States (desktop)` (`#tKi6z`, 1320×1120) — a gallery of **8** error cells; Mobile `Mobile — Errors & Edge States` (`#B0JYg`, 390×auto) — a stacked list of **6** error cards.

> SOURCE-OF-TRUTH: these screens are authoritative. The canonical `ErrorStateCard` (component-library `#d2mdF`, `reusable:true`) uses the **left-stripe** model — and the MOBILE cards on this board match it exactly. The DESKTOP gallery renders a **structurally different** variant (top accent bar + filled action buttons). That divergence is documented per-component below; the desktop screen wins and the component contract must widen to a `layout` prop.

### Purpose
A recovery/edge-state catalog for the voice-first Task Agent research flow: what the board shows when a research job fails, is uncertain, is throttled, is slow, partially succeeds, or can't capture voice. OpsBoard is READ-ONLY apart from status-cycle; these cards are the one place the agent surfaces recoverable actions (retry / confirm / pick / allow). No "overdue/deadline" language appears here — this is agent-pipeline state, not task window state.

---

### Desktop layout (`#tKi6z`) — top → bottom (exact px / tokens)
- **Frame** `#tKi6z`: `1320×1120`, `fill $background (#0a0a0c)`, `stroke $border (#2a2a38)` `strokeWidth 1`, `layout vertical`.
- **Gallery Content** `#qi8za`: `fill_container`, `fill $background`, `layout vertical`, `gap 26`, `padding 40`.
  - **Gallery Header** `#QJRjL` (`layout vertical`, `gap 6`):
    - **Title** `#jcJru`: `"ERRORS & EDGE STATES"` — JetBrains Mono, **20px**, weight normal, `letterSpacing 2`, `fill $foreground (#e8e8f0)`.
    - **Subtitle** `#hdQUI`: `"Task Agent — recovery states for failed, uncertain and partial research"` — DM Sans, **13px**, `fill $muted-foreground (#7a7a8e)`.
  - **Row 1 / 2 / 3 / 4** (`#OvEWU` / `#Lptlz` / `#wyZhM` / `#V3nTtC`): each `fill_container`, horizontal, `gap 24`, holding **2 cells** at `width fill_container` (≈50% each). 4 rows × 2 = **8 cells**.

**Per-cell wrapper (all 8 identical):** `Cell · NN` frame, `layout vertical`, `gap 12`. Child 1 = **Section Header** text (JetBrains Mono **12px**, weight normal, `letterSpacing 2`, `fill $foreground`, e.g. `"01 · NO RESULTS"`). Child 2 = the **Card**.

**Desktop Card anatomy (top → bottom):**
1. **Card** frame: `fill_container`, `fill $card (#1a1a22)`, `stroke $border` `strokeWidth 1`, `layout vertical`, **cornerRadius 0** (radius token = 0; sharp corners everywhere).
2. **Accent** frame: `fill_container`, `height 2`, `fill = <severity token>` — the top severity stripe (see mapping). This is the desktop-only severity carrier.
3. **Body** frame: `fill_container`, `layout vertical`, `gap 12`, `padding 16`.
   - **Header Row** (`gap 8`, `alignItems center`): `[icon]` 15×15 `fill <severity>` + **Header** text JetBrains Mono **12px** weight normal `letterSpacing 1.5` `fill <severity>`.
   - **Body** text: `fill_container`, DM Sans **13px**, `fill $muted-foreground`.
   - *(optional middle block — varies by state: target chip / pick list / meta line / source list)*
   - **Actions** frame: `fill_container`, horizontal, `gap 8` — 1–2 buttons each `fill_container` (equal width).

**Desktop button anatomy:** frame `padding [9,14]` (v,h), `gap 8`, `alignItems center`, `justifyContent center`, cornerRadius 0. Icon 14×14. Label JetBrains Mono **11px**, weight **700**, `letterSpacing 1`.
- **Primary/filled** button: `fill <action token>` (`$primary` / `$warning`), label+icon = `<token>-foreground`.
- **Secondary/outline** button: no fill, `stroke $border` `strokeWidth 1`, label+icon `$muted-foreground`.

---

### Mobile layout (`#B0JYg`) — top → bottom
- **Frame** `#B0JYg`: `width 390`, `fill $background`, `stroke $border` `strokeWidth 1`, `layout vertical`.
- **Header** `#pLMUG`: `fill_container`, `fill $muted (#131318)`, `strokeWidth {bottom:1}` `stroke $border`, `padding [14,18]`, `alignItems center`, `justifyContent space_between`.
  - **Wordmark** `#x86iqp` (`alignItems center`): `"OPS"` + `"BOARD"` texts.
  - **Tag** `#AY2bM`: `"04 ERRORS"` — JetBrains Mono **9px** weight 700 `letterSpacing 1.5` `fill $muted-foreground-subtle (#4a4a5e)`.
- **Body** `#qzix7`: `fill_container`, `layout vertical`, `gap 14`, `padding [18,18,26,18]` — stacks **6** cards.

**Mobile Card anatomy (= canonical `ErrorStateCard`):** frame `fill_container`, `fill $card`, **`strokeWidth {left:3}` `stroke = <severity token>`** (severity carried by the LEFT stripe, not a top bar), `layout vertical`, `gap 10`, `padding 14`, cornerRadius 0.
- **Top** (`gap 8`, `alignItems center`): `[icon]` 15×15 `fill <severity>` + **Header** JetBrains Mono **11px** weight **700** `letterSpacing 1.5` `fill <severity>`.
- **Body** text: `fill_container`, DM Sans **13px**, `fill $muted-foreground`.
- **Act** frame (when present): `fill_container`, horizontal, `gap 10`.

**Mobile button anatomy:** frame `height 40`, `padding [0,14]`, `gap 7`, `alignItems center`, `justifyContent center`. Icon 14×14. Label JetBrains Mono **12px**, weight **600**, `letterSpacing 1`.
- **Outline** button: `fill #00000000` (transparent), `stroke $border` `strokeWidth 1`, label+icon `$foreground`.
- **Filled** button: `fill <action token>` (`$primary` for KEEP RUNNING, `$destructive` for RETRY / ALLOW ACCESS), label+icon `<token>-foreground`. Note: mobile filled CTAs use the **severity color as the fill** (CONNECTION/MIC use `$destructive` fill), unlike desktop which fills with `$primary`.

---

### Accent-stripe → severity color mapping
Severity is encoded by **(a)** the accent/stripe fill, **(b)** the header text color, **(c)** the header icon fill — these share one token **except for desktop D01 NO RESULTS** (see note ‡). Desktop carries it on a 2px TOP `Accent` frame; mobile carries it on the 3px `strokeWidth.left`.

| Severity tier | Token | Hex | Used by (state) |
|---|---|---|---|
| Neutral / no-data | `$muted-foreground` | `#7a7a8e` | NO RESULTS (D01 ‡ / M1) — *icon + header text*; **D01 desktop stripe is `$border-hover` `#3a3a4a`, not `$muted-foreground`** |
| Caution / soft | `$warning` | `#d9a73e` | LOW CONFIDENCE (D02), AMBIGUOUS *(see note)*, RATE LIMITED (D05/M5), TIMEOUT (D06/M2), PARTIAL RESULTS (D07/M3) |
| Critical / hard fail | `$destructive` | `#e05a5a` | CONNECTION ERROR (D04/M4), MICROPHONE BLOCKED (D08/M6) |
| Info / agent prompt | `$primary` | `#ff6b35` | AMBIGUOUS / disambiguation (D03 only) |

Note: **AMBIGUOUS (D03)** uses `$primary` (orange) for stripe/icon/header — treated as an agent *prompt* not an error. There is **no AMBIGUOUS card on mobile** (disambiguation lives on the dedicated `Mobile — Disambiguation` screen `#Fux3f`, out of this scope).

‡ Note: **desktop D01 NO RESULTS is the one stripe-vs-icon/header divergence.** Its top `Accent` frame (`#ELFhU`) is `fill $border-hover (#3a3a4a)`, while the header icon (`#p533ux`) and header text (`#KUgbk`) are both `$muted-foreground (#7a7a8e)`. So for D01 the three channels do NOT share one token — the stripe reads as a near-invisible neutral border rather than the muted-foreground used elsewhere. Mobile M1 (`#M20Ya5`) keeps all three on `$muted-foreground` (left stroke + icon + header), so M1 is consistent; D01 desktop is the anomaly. A build must render the D01 desktop stripe as `$border-hover`, not `$muted-foreground`.

---

### The 8 desktop states (exact text + actions)

1. **`#I3xLdC` 01 · NO RESULTS** — severity `$muted-foreground` (icon `#p533ux` + header `#KUgbk`); **but the top `Accent` stripe `#ELFhU` is `$border-hover (#3a3a4a)`, not `$muted-foreground`** (the one stripe-vs-header divergence — see ‡ in the mapping section). Icon `search-x`. Header `"NO RESULTS FOUND"`. Body `"Couldn't find reliable steps. Try rephrasing or narrowing the request."` Actions: **[SAY IT AGAIN]** (filled `$primary`, icon `mic`) · **[REPHRASE]** (outline, icon `pencil-line`).
2. **`#vZWGF` 02 · LOW CONFIDENCE** — severity `$warning`. Icon `badge-alert`. Header `"NEEDS CONFIRMATION"`. Body `"I'm not fully sure this is the task you meant. Confirm before I apply these steps."` Middle = **Target chip** `#LVVHf` (`fill $card-elevated (#22222e)`, `stroke $border` 1, `padding [10,12]`, `gap 8`, `alignItems center`): Name `"Renew passport — courier collection"` (DM Sans **12px** `$foreground`, `fill_container`) + Tag `"BUREAU"` (JetBrains Mono **10px** `letterSpacing 1` `$muted-foreground`). Actions: **[CONFIRM]** (filled `$warning`, icon `check`) · **[CANCEL]** (outline, no icon).
3. **`#Aqxp3` 03 · AMBIGUOUS** — severity `$primary`. Icon `git-fork`. Header `"WHICH TASK DID YOU MEAN?"`. Body `"More than one task matches your request. Tap the one you meant."` Middle = **Picks** list `#OjupS` (`layout vertical`, `gap 8`) of **3** Pick rows (same chip styling as the Target chip): `"Book travel clinic — yellow fever"`/`MED`, `"Book courier — passport pickup"`/`BUREAU`, `"Book campsite — Tankwa gates"`/`TRAVEL`. Footer = **Say Line** `#krXAS` (`gap 6`, `alignItems center`): icon `mic` 12×12 `$muted-foreground-subtle` + `"none of these?"` (`$muted-foreground-subtle`, JetBrains Mono **11px**) + `"say it again"` (`$primary`, weight 600). No filled action buttons — the picks ARE the actions.
4. **`#H7X1Dx` 04 · CONNECTION ERROR** — severity `$destructive`. Icon `wifi-off`. Header `"CONNECTION ERROR"`. Body `"Couldn't reach the research service. Check your connection and try again."` **Meta** line `#UcMIr`: `"OFFLINE · LAST SYNC 2M AGO"` (JetBrains Mono **10px** `letterSpacing 1` `$muted-foreground-subtle`). Actions: **[RETRY]** (filled `$primary`, icon `rotate-cw`) · **[DISMISS]** (outline).
5. **`#P6hXR` 05 · RATE LIMITED** — severity `$warning`. Icon `timer-off`. Header `"RATE LIMITED"`. Body `"Too many requests — try again in a few minutes. Your place in line is saved."` Meta `#udBn2`: `"RETRY AVAILABLE IN 3:00"`. Actions: **[RETRY IN 3:00]** (note: **outline** disabled-style countdown button — `stroke $border`, icon `timer` `$muted-foreground`; NOT filled) · **[DISMISS]** (outline).
6. **`#gRlsM` 06 · TIMEOUT** — severity `$warning`. Icon `hourglass`. Header `"TAKING LONGER THAN EXPECTED"`. Body `"This is still running. Keep it going in the background, or come back later — we'll notify you when it's done."` Actions: **[KEEP RUNNING]** (filled `$primary`, icon `loader`) · **[COME BACK LATER]** (outline, icon `timer`).
7. **`#Evjyv` 07 · PARTIAL RESULTS** — severity `$warning`. Icon `circle-alert`. Header `"PARTIAL RESULTS"`. Body `"Added 3 notes — 2 sources were unreachable. You can retry the ones that failed."` Middle = **Sources** container `#G6VqH` (`fill $card-elevated`, `stroke $border` 1, `layout vertical`) of **2 failed SourceRows** `Src` (`gap 8`, `padding [9,12]`, `alignItems center`): icon `circle-x` 13×13 `$warning` + domain text (JetBrains Mono **11px** `$foreground`, `fill_container`) + `"UNREACHABLE"` badge (JetBrains Mono **10px** `letterSpacing 1` `$warning`). Rows: `dha.gov.za` / `sars.gov.za`. The 2nd `Src` adds an internal divider via `strokeWidth {top:1}` `stroke $border`. Actions: **[RETRY FAILED SOURCES]** (filled `$primary`, icon `rotate-cw`) · **[VIEW NOTES]** (outline).
8. **`#X2Ocy` 08 · MICROPHONE ERROR** — severity `$destructive`. Icon `mic-off`. Header `"MICROPHONE BLOCKED"`. Body `"Voice capture failed. Allow microphone access to dictate your request."` Actions row = single full-width **[ALLOW MICROPHONE ACCESS]** (filled `$primary`, icon `mic`). **Keyboard fallback** = **Type Line** `#dQlRp` (`gap 6`, `alignItems center`): icon `keyboard` 12×12 `$muted-foreground-subtle` + `"or type your request instead"` (JetBrains Mono **11px** `$muted-foreground-subtle`).

### The 6 mobile states (exact text + actions)
Mobile is a curated subset (no LOW CONFIDENCE, no AMBIGUOUS, no SourceRow list, no countdown/offline meta lines). Order is fixed top→bottom:

1. **`#M20Ya5` NO RESULTS FOUND** — stripe `$muted-foreground`. Icon `search-x`. Body `"Couldn't find reliable steps. Try rephrasing or narrowing the request."` Action: single **[SAY IT AGAIN]** outline (icon `mic`). *(Drops desktop's REPHRASE button.)*
2. **`#z5J3bw` TAKING LONGER THAN USUAL** — stripe `$warning`. Icon `timer` *(desktop uses `hourglass`)*. Body `"This is taking a while. Keep it running in the background?"` Actions (`gap 10`): **[COME BACK LATER]** outline · **[KEEP RUNNING]** filled `$primary`. *(Button ORDER reversed vs desktop: outline first, primary last.)*
3. **`#TNGum` PARTIAL RESULTS** — stripe `$warning`. Icon `circle-alert`. Body `"Added 3 notes — 2 sources were unreachable."` Action: single **[RETRY FAILED SOURCES]** outline (icon `refresh-cw`). *(No inline SourceRow list; no VIEW NOTES button.)*
4. **`#M64XjW` CONNECTION LOST** — stripe `$destructive`. Icon `wifi-off`. Body `"Can't reach the network. Check your connection and retry."` Action: single **[RETRY]** **filled `$destructive`** (icon `refresh-cw`, label `$destructive-foreground`). *(Header text differs: "CONNECTION LOST" vs desktop "CONNECTION ERROR"; no DISMISS; no offline meta line.)*
5. **`#q67xd` RATE LIMITED** — stripe `$warning`. Icon `hourglass` *(desktop uses `timer-off`)*. Body `"Too many requests right now. Try again in a few minutes."` **No action button at all** (only Top + Body) — informational; recovery is implicit/timed.
6. **`#iWtkl` MICROPHONE BLOCKED** — stripe `$destructive`. Icon `mic-off`. Body `"Allow microphone access to use voice commands."` Action: single **[ALLOW ACCESS]** filled `$destructive` (icon `mic`). *(Shorter label than desktop "ALLOW MICROPHONE ACCESS"; no "or type instead" keyboard-fallback line on mobile.)*

---

### Desktop-vs-mobile structural differences (summary)
- **Severity carrier:** desktop = 2px TOP `Accent` frame; mobile = 3px LEFT stroke (`strokeWidth.left:3`). Mobile == canonical.
- **Card count:** desktop 8 (adds LOW CONFIDENCE + AMBIGUOUS); mobile 6 (those two move to the Disambiguation/confirmation flow off-board for this scope).
- **Header weight:** desktop header `weight normal` 12px; mobile header `weight 700` 11px.
- **Filled CTA fill:** desktop primary CTAs fill `$primary` even on destructive states; mobile destructive CTAs fill `$destructive`.
- **Button metrics:** desktop `padding [9,14]`, label 11px/700; mobile `height 40`, `padding [0,14]`, label 12px/600.
- **Detail blocks:** target chip, 3-item pick list, offline/countdown meta lines, and the 2-row SourceRow list exist only on desktop. Mobile compresses copy and shows ≤2 buttons (or 0 for RATE LIMITED).
- **Icon swaps mobile→desktop:** TIMEOUT `timer`↔`hourglass`; RATE LIMITED `hourglass`↔`timer-off`; retry glyph `refresh-cw`(mobile)↔`rotate-cw`(desktop).
- **Header label text drift:** CONNECTION `LOST`(M)↔`ERROR`(D); TIMEOUT `…THAN USUAL`(M)↔`…THAN EXPECTED`(D); mic CTA `ALLOW ACCESS`(M)↔`ALLOW MICROPHONE ACCESS`(D).

### Per-state action button sets (canonical mapping)
| State | Desktop buttons | Mobile buttons |
|---|---|---|
| NO RESULTS | SAY IT AGAIN (primary) · REPHRASE (outline) | SAY IT AGAIN (outline) |
| LOW CONFIDENCE | CONFIRM (warning fill) · CANCEL (outline) | — (not on mobile) |
| AMBIGUOUS | 3× pick rows + "say it again" link | — (Disambiguation screen) |
| CONNECTION | RETRY (primary) · DISMISS (outline) | RETRY (destructive fill) |
| RATE LIMITED | RETRY IN m:ss (outline, countdown) · DISMISS (outline) | — (no button) |
| TIMEOUT | KEEP RUNNING (primary) · COME BACK LATER (outline) | COME BACK LATER (outline) · KEEP RUNNING (primary) |
| PARTIAL RESULTS | RETRY FAILED SOURCES (primary) · VIEW NOTES (outline) | RETRY FAILED SOURCES (outline) |
| MICROPHONE | ALLOW MICROPHONE ACCESS (primary) + keyboard fallback link | ALLOW ACCESS (destructive fill) |

### Data / logic contracts
- **Read-only invariant holds:** every action here triggers an agent-pipeline operation (retry/confirm/pick/allow), never a board CRUD mutation. Confirming/picking attaches research to an *existing* task, consistent with the read-only + voice/MCP model.
- **Severity → token** is the only "logic": `tier ∈ {neutral→$muted-foreground, caution→$warning, critical→$destructive, prompt→$primary}` drives stripe + icon + header color together.
- **Dynamic values seen as literals to template:** PARTIAL counts (`Added {n} notes — {m} sources were unreachable`, here 3/2) and the failed-domain list; RATE LIMITED / CONNECTION countdowns & timers (`RETRY AVAILABLE IN 3:00`, `RETRY IN 3:00`, `OFFLINE · LAST SYNC 2M AGO`) — these are tick-driven and must update live.
- **AMBIGUOUS / LOW CONFIDENCE** carry candidate task metadata (name + category tag MED/BUREAU/TRAVEL) — sourced from intent-match candidates; tapping a pick selects it (single-select), "say it again" re-records.
- **MICROPHONE BLOCKED** is the permission-denied terminal state of the voice FAB's `requesting/error` path (design-brief §16); the keyboard fallback is the read-only escape hatch to text entry.

### Open items / things to consult in consolidation
- The canonical `ErrorStateCard` def (`#d2mdF`) only models the **single-button, left-stripe** shape. The desktop gallery needs the contract widened with: a `layout: "stripe-left" | "accent-top"` prop, an `actions[]` array (0–2, each `{label, variant: primary|warning|destructive|outline, icon, disabled/countdown}`), and optional slot blocks (`targetChip`, `picks[]`, `metaLine`, `sourceRows[]`).
- AMBIGUOUS (D03) overlaps with the canonical **DisambiguationPicker** (`#cLP7O`) but renders here as a *flattened, simplified* inline variant (no confidence %, no candidate borders/selection highlight). Reconcile: is D03 an ErrorStateCard variant or an embedded DisambiguationPicker? Screen shows it inside the gallery as a flattened card.
- PARTIAL's `Src` rows are a flattened **SourceRow** in its "UNREACHABLE/failed" state — confirm against the canonical SourceRow contract during consolidation.
- "DISMISS" semantics undefined (clears the card? snoozes the job?) — needs a behavior decision.


## Open items (this board)

- Desktop Disambiguation DTitle says '2 TASKS MATCH "permit"' but renders 3 candidate rows (Tankwa 92%, Vehicle Pass 64%, Burn Permit 41%). Confirm whether the title or the candidate count is the intended truth.
- Desktop and mobile use DIFFERENT disambiguation datasets and confidence values (desktop 92/64/41 across 3 tasks; mobile 88/64 across 2 tasks, both bureaucratic). Confirm which is canonical or whether both are illustrative; reconcile the example data.
- Confidence→color banding is desktop-only; mobile uses a neutral muted pill. Decide whether mobile should also band high/medium/low or intentionally stays neutral.
- ScopeChip diverges hard between platforms (mobile left-accent target chip vs desktop full-border lock chip with LOCKED tag). Confirm both are required variants of one component vs two distinct components.
- RecordingPanel canonical specifies ~40 analyser-driven bars; desktop renders 8 static bars and label 'REC' not 'RECORDING', timer 00:09 not 00:07. Confirm bar count/label/timer are illustrative mock values to be replaced by live data.
- CUE RESEARCH icon differs by platform: sparkles (desktop) vs search (mobile). Decide the canonical icon.
- Raw-hex tints (#ff6b351f, #5aa0e01f, #5ae07a1f, #7a7a8e1f) are token@12%-alpha values used directly in the screens; confirm these map to /alpha token utilities (e.g. $primary/12, $cat-bureaucratic/12) at build time rather than hard-coded hex.
- No low-confidence / failed-parse / empty-transcript state appears in this capture-and-parse scope (only high-confidence + ambiguous). Confirm whether a low-confidence parse variant of ParsedIntentPanel is needed.
- ConfirmBar has no canonical primitive (design-brief routes confirm/disambiguation through Toast actions[] / Dialog, a flagged functional gap). Decide whether this inline bar/CTA replaces or supplements the toast-based confirm path.
- ComeBackLaterBanner has two structurally different renderings (desktop = primary/8 + left-accent + Coffee icon + title + action buttons; mobile = muted neutral Alert + Bell, no actions). Consolidation must decide: one Alert with an 'attention/primary' variant + optional action slot, vs two distinct primitives. Both authoritative for their breakpoint.
- Two spinner idioms coexist for the same liveness role: desktop arc-stroke ellipse (innerRadius0.62/0.6, start60, sweep280) vs mobile lucide loader-circle. Must unify to one Spinner source while preserving the arc look.
- MinimizedJobPill desktop (radius999 + #00000066 shadow + arc spinner + expand) vs mobile (sharp $card-elevated, no shadow, no chevron, loader-circle, weight 500) diverge substantially — confirm whether the docked pill is breakpoint-responsive or two separate components.
- ProgressBar needs a NET-NEW indeterminate variant (single sliding chunk) distinct from the canonical 3-segment value bar — confirm the consolidation phase adds it rather than overloading the segment contract.
- RunningBadge (header) has no canonical match and is effectively ResearchAttachedBadge-at-header-scale + a standalone Timer; ResearchAttachedBadge itself renders WITHOUT its optional timer on the Target Card. Reconcile these into one Badge(+pulse,+optional timer) family.
- Raw orange hex literals (#ff6b351f = primary/12, #ff6b3514 = primary/8) and the pill shadow #00000066 should resolve to tokens; recorded as informational drift (screens authoritative).
- ResearchStepRow glyph is a structural node swap (icon↔ellipse) and the done glyph differs by breakpoint (mono '✓' text desktop vs circle-check icon mobile); the desktop active row has a container highlight the mobile active row lacks — these must become CVA state variants.
- Notes Skeleton geometry is bespoke to notes (desktop dot+2-line blocks ×3; mobile 5 ragged bars) and does NOT match the canonical TaskCard-shaped Skeleton — needs its own parameterized skeleton.
- Step-counter ('of 6') vs rendered-row-count (7 desktop / 5 mobile) mismatch — confirm 'plannedTotal' vs 'visibleRows' is the intended contract.
- Desktop StatusCycleButton renders as a labeled pill with a 'OPEN' word (dot + label + cycle icon), conflating window state with task status; canonical is an 18px square (mobile matches). Needs reconciliation: is 'OPEN' a status label, a window-state echo, or a mislabel? Confirm intended semantics and whether a labeled StatusCyclePill variant is wanted.
- CitationChip has two incompatible renderings (desktop bordered chip vs mobile inline-bracket text). Decide whether the component supports a presentation prop or the build splits per breakpoint, and whether inline-bracket citations are interactive.
- AINotesBlock, CitationChip, SourceRow, and the desktop Breadcrumb/result-TopBar are NOT in the canonical 71-component library (genuine gaps) — they must be authored in the consolidation phase.
- VoiceQueryResultCard canonical showcase renders a buttonless read-only 'closing this week' query answer (role=status, never mutates); this Result&Notes surface is an action-bearing variant with KEEP/DISMISS that DOES mutate (notes append). Confirm whether this is the same component widened or a separate AIResearchResultCard.
- Window countdown literals differ (T-12d desktop vs T-21d mobile) and target dates differ (18 Apr vs 27 Apr) — confirm canonical mock values or treat both as illustrative.
- Toast accent treatment differs across screens (desktop 2px $success TOP bar + dwell caption vs mobile 3px $success LEFT stroke, no caption) — pick one accent convention.
- Tints are raw hex (#5aa0e01f, #d9a73e1f, #ff6b351f) and mobile favicon/category colors are raw hex rather than tokens — flag for token-alpha (bg-x/12) conversion at build (informational drift, consistent board-wide).
- The brief's base VoiceIntent union does not name a 'research'/append-notes intent explicitly; confirm the intent name and that the research action targets the tasks.notes column.
- Canonical ErrorStateCard (#d2mdF) only models single-button left-stripe shape; must widen contract with layout:'stripe-left'|'accent-top', actions[] (0-2 with variant/icon/countdown), and optional slots (targetChip, picks[], metaLine, sourceRows[]). Desktop accent-top + filled CTAs + $primary 'prompt' severity are not in canonical.
- AMBIGUOUS (D03) is a flattened simplified DisambiguationPicker (no confidence %, no selected highlight) embedded as an ErrorStateCard cell — decide if it's an ErrorStateCard variant or an embedded DisambiguationPicker.
- PARTIAL 'Src' rows are a flattened failed-state SourceRow — reconcile against canonical SourceRow contract; only the UNREACHABLE state is shown.
- DISMISS button behavior undefined (clears card? snoozes/cancels job?).
- RATE LIMITED retry-enable transition (outline -> filled at 0:00) is implied by the countdown styling but not explicitly drawn.
- Mobile RATE LIMITED has no recovery affordance at all — confirm intended (timed auto-retry) vs missing button.

## Coverage checklist (verification targets)

- [ ] Desktop 01 frame geometry, header (wordmark + AGENT READY status), and body padding/gaps
- [ ] Desktop Scope Chip: full structure, lock icon, SCOPE/·/AFRIKABURN 2026 values, LOCKED tag, 760px hint
- [ ] Desktop Voice Capture / RecordingPanel: primary 3px accent wrapper, VHead mic label, 8-bar waveform with exact heights, REC dot+label, 00:09 timer, TRANSCRIPT label, transcript text (Mono 16), PARSING INTENT… processing pill
- [ ] Desktop Parsed Intent panel: PHead (scan-search + PARSED INTENT + AGENT UNDERSTANDING sub), 4 bordered IntentRows (INTENT pill, QUERY mono text, TARGET TASK Task Chip with 92%/CONFIDENCE, ACTION icon+text), row dividers
- [ ] Desktop Disambiguation card: 470px width, $warning git-fork header, DTitle, 3 candidates with category dots/tags + banded confidence (92% success / 64% warning / 41% muted) + top-match $primary border
- [ ] Desktop Confirm Bar: info hint copy (520px), Cancel button, CUE RESEARCH primary (sparkles + label)
- [ ] Mobile Voice & Intent frame: header (OPS+BOARD + 01 INTENT tag), body padding/gaps
- [ ] Mobile Scope chip (left-accent #ff6b351f + 2px primary border + target + label)
- [ ] Mobile Heard panel: mic + HEARD + 0:06 duration + DM Sans transcript
- [ ] Mobile Intent panel: AGENT UNDERSTANDS header + 4 borderless key/value stacks (INTENT/QUERY/TARGET TASK with cat+match pills/ACTION)
- [ ] Mobile CTA: CUE RESEARCH (h50, search icon) + CANCEL (h44 ghost) + centered hint
- [ ] Mobile Disambiguation frame: header (01b PICK tag), Scope chip, Prompt (git-fork $primary + WHICH TASK? + DM Sans body)
- [ ] Mobile Disambiguation Picks: 2 tappable cards ($secondary, name + chevron, BUREAUCRATIC cat pill, neutral NN% MATCH conf pill, 88%/64%)
- [ ] Mobile Disambiguation Retry: SAY IT AGAIN (h46 bordered, mic icon)
- [ ] All exact tokens, raw-hex tints, px sizes, font families/sizes/weights, letterSpacing, gaps, padding, and literal text strings for every node in scope
- [ ] Every state in scope: recording, processing, parsed/high-confidence, ambiguous (desktop 3 / mobile 2), scoped/locked
- [ ] Confidence→color mapping (desktop banded vs mobile neutral)
- [ ] Interactions: CUE RESEARCH confirm/write-gate, CANCEL, candidate select, SAY IT AGAIN retry, read-only fields
- [ ] Data/logic contracts: scope lock, recording payload, parsed-intent shape, disambiguation candidate shape, category color mapping, write-consent boundary
- [ ] Desktop-vs-mobile field-set and rendering divergences documented per component
- [ ] Canonical divergences captured for ScopeChip, RecordingPanel, ParsedIntentPanel, IntentRow, DisambiguationPicker, ConfirmBar/CUE RESEARCH
- [ ] Desktop frame VYFZ9: full top→bottom layout with exact px/tokens (Header, Body horizontal split, Main pad32/gap22, Rail 400px pad28/gap18)
- [ ] Mobile frame B4ooE5: full top→bottom layout with exact px/tokens (Header, Body vertical gap16, sections)
- [ ] ResearchJobPanel desktop (Accent bar, arc Spinner, RESEARCHING…, Task 22/700, Scope, ELAPSED label 10/600 + value 30/700, indeterminate Chunk 340w@x430, Step 3 of 6, NO FIXED ETA)
- [ ] ResearchJobPanel mobile (no accent, loader-circle, RESEARCHING…, inline Timer, Task 15/600, 150w Bar, 5-row log)
- [ ] Indeterminate ProgressBar variant vs canonical 3-segment bar divergence (track $card-elevated, $primary chunk, layout none/clip)
- [ ] ResearchStepRow done/active/pending — all three states, exact glyphs/tokens/copy/weights, desktop vs mobile differences (mono ✓ vs circle-check; active highlight; pending color)
- [ ] STREAMING indicator (desktop LogHead $success dot + label)
- [ ] ComeBackLaterBanner desktop (primary/8 fill, left-accent, Coffee icon, title+body, Minimize outline btn + Come Back Later primary btn)
- [ ] ComeBackLaterBanner mobile (muted Alert, Bell, single message, no actions)
- [ ] Minimize / Come Back Later / Expand interactions + live-update behavior + read-only nature
- [ ] Notes Skeleton desktop (RESEARCH NOTES + WAITING FOR RESULTS, 3 dot+2-line blocks, 520w R2)
- [ ] Notes Skeleton mobile (NOTES — INCOMING, 5 bars widths 300/340/210/330/160)
- [ ] Right Rail: BOUND TO TASK label, MissionCtx (Folder + AfrikaBurn 2026 + BUREAUCRATIC), Target Card + ResearchAttachedBadge + MetaRow target date, BindNote, Divider, ELSEWHERE ON BOARD + 2 CtxCards (cat-bureaucratic/cat-medical)
- [ ] ResearchAttachedBadge (Target Card pulse + RESEARCHING, no timer) + bespoke header RunningBadge + header Timer
- [ ] MinimizedJobPill desktop (absolute x644/y1036, radius999, #00000066 shadow, arc PillSpin, sep, PillTime, Expand chevron) + Min Caption
- [ ] MinimizedJobPill mobile example ($card-elevated, sharp, no shadow, no chevron, loader-circle, weight 500)
- [ ] ScopeChip mobile (#ff6b351f + left-accent + Target + SCOPE · AfrikaBurn 2026)
- [ ] Arc-stroke ellipse vs loader-circle spinner idiom divergence (innerRadius/startAngle/sweepAngle params)
- [ ] All rendered states enumerated (job running only; step done/active/pending; progress indeterminate; cards research-active/not-started; pill running)
- [ ] Data/logic contracts: job.state machine, elapsed count-up no-ETA, indeterminate progress, steps[] schema, step-counter vs row-count, task binding & notes-append, mission/target/context, notify-on-complete
- [ ] Token/hex drift notes (#ff6b351f primary/12, #ff6b3514 primary/8, #00000066 shadow, radius999 exceptions on zero-radius board)
- [ ] Desktop frame 03 Result & Notes (d6vKcL): full top→bottom layout, exact px/tokens/structure
- [ ] Desktop TopBar (Ku0Zm): breadcrumb (4 segments + 2 separators) + CLOSE/ESC affordance with exact type/tokens
- [ ] Desktop DetailHeader (q7rlPD): MetaRow (CategoryTag + WindowStatePill + Spacer + StatusCycleButton), Title, Target line — exact values
- [ ] Desktop AINotesBlock (L6TvtJ): 2px $primary left accent, AttribRow + NEW pill, Summary, 5 numbered Steps with Num badges, CitationChips + full citation→step map, embedded SOURCES list (3 rows), Affordances row
- [ ] Desktop CitationChip rendered as bordered chip; mobile rendered as inline bracket — both documented with the divergence
- [ ] Desktop SourceRow ×3 (inline layout, top-border dividers, favicon tones, domains, titles)
- [ ] Desktop Affordances: KEEP NOTES (primary) + DISMISS (ghost) + VIEW SOURCES (secondary) with exact padding/tokens/labels
- [ ] Desktop Success Toast (p2Cz3): 2px $success top accent, header/body/meta, auto-dismiss 4s
- [ ] Mobile frame Result & Notes (oCRZL): full layout, exact px/tokens
- [ ] Mobile Header (Y3NzP): split-color wordmark + 03 RESULT tag
- [ ] Mobile TaskHeader (JjDMF): canonical 18px StatusCycleButton (in-progress glyph) + Name + CategoryTag + WindowStatePill (T-21d)
- [ ] Mobile AINotes (gfPA3): left accent, attribution + separate Date row, summary, 5 inline-bracket-citation steps, explicit Div, stacked SourceRows ×3
- [ ] Mobile Actions (SkKHv): OPEN ALL SOURCES (full-width) + DISMISS/KEEP NOTES pair
- [ ] Mobile in-flow Toast (XsIrn): 3px $success left stroke, header + task-name body
- [ ] Every component used (MissionDetailHeader, CategoryTag, WindowStatePill, StatusCycleButton, AINotesBlock, CitationChip, SourceRow, Toast, Breadcrumb/TopBar) documented as-rendered with screen_divergence_from_canonical
- [ ] Every state in scope enumerated (result populated, NEW/unseen, closing window, status in-progress/OPEN, success toast)
- [ ] All interactions enumerated (KEEP NOTES write, DISMISS discard, VIEW/OPEN SOURCES, citation→source, status cycle, ESC, toast auto-dismiss)
- [ ] Data/logic contracts: VoiceQueryResultCard payload shape, citation indexing, KEEP NOTES → tasks.notes append, window-state derivation, read-only-board law
- [ ] Resolved token + type inventory for the scope
- [ ] Desktop vs mobile divergences captured per surface (radius, citation rendering, source set, toast accent, countdown/target literals)
- [ ] Desktop gallery frame layout (1320x1120, header, 4 rows x 2 = 8 cells) with exact gaps/padding/tokens
- [ ] All 8 desktop ErrorStateCard variants: NO RESULTS, LOW CONFIDENCE/NEEDS CONFIRMATION, AMBIGUOUS, CONNECTION ERROR, RATE LIMITED, TIMEOUT, PARTIAL RESULTS, MICROPHONE BLOCKED — each with exact header/body text, icon, severity token, action buttons
- [ ] Mobile errors frame layout (390px, header chrome, 6-card body) with exact gaps/padding/tokens
- [ ] All 6 mobile ErrorStateCard variants with exact text, icons, action sets (incl. RATE LIMITED zero-button case)
- [ ] Accent-stripe -> severity color mapping table (4 tiers, tokens + hex + which states)
- [ ] Desktop top-accent-bar vs mobile left-stripe structural difference (and canonical match)
- [ ] Per-state action button sets table (desktop vs mobile)
- [ ] Button anatomy desktop (padding [9,14], 11px/700) and mobile (height 40, 12px/600) with filled/outline variants
- [ ] PARTIAL RESULTS failed SourceRow rendering (desktop) with UNREACHABLE badges + divider
- [ ] MICROPHONE BLOCKED keyboard fallback (desktop 'or type your request instead' + keyboard icon)
- [ ] Disambiguation/target chip inline rendering (D02 target chip, D03 3 picks + say-it-again link)
- [ ] Meta/countdown lines (OFFLINE LAST SYNC, RETRY AVAILABLE IN 3:00)
- [ ] Divergence from canonical ErrorStateCard (#d2mdF), DisambiguationPicker (#cLP7O), SourceRow
- [ ] Data/logic contracts (read-only invariant, severity derivation, dynamic literals, candidate metadata)
- [ ] Interaction contracts per action button
- [ ] Icon (lucide) name per slot for all states (search-x, badge-alert, git-fork, wifi-off, timer-off, hourglass, circle-alert, circle-x, mic-off, mic, pencil-line, check, rotate-cw/refresh-cw, timer, loader, keyboard)
- [ ] Desktop-vs-mobile text/icon drift (CONNECTION LOST vs ERROR, TIMEOUT label, mic CTA label, icon swaps)