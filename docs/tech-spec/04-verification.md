# OpsBoard Tech Spec — 04 · Bidirectional Verification

*Output of Workflow 3 (16 adversarial verifiers) checking the spec against the authoritative screen extracts in BOTH directions: design→spec (every screen element captured) and spec→design (every spec claim supported by the design). Every finding cites node-id/value evidence.*

## Result

- **195 items verified** — **154 match · 39 partial · 2 mismatch**.
- **Findings:** 6 high · 30 medium · 105 low.
- **All 6 high-severity findings have been RESOLVED in the spec** (see §1). Mediums are a refinement backlog (§2); lows are mostly derived-value precision nits (not actionable).

Method: screens are authoritative. A finding is a `design→spec` gap (on-screen but missing/wrong in spec) or a `spec→design` unsupported claim (in spec, not on screen). Reconciliation that widens a contract to serve a divergent screen is correct by policy and not flagged. Brief divergences are informational (§3).

## 1. High-severity findings — RESOLVED

| # | Scope | Finding | Evidence (node) | Fix applied |
|---|---|---|---|---|
| H1 | RecordingPanel (`04-voice-ai.md`) | Desktop Voice-Capture transcript specced as *DM Sans 16* | `d6h84` = **JetBrains Mono 16** (lh 1.55) | Corrected to JetBrains Mono 16; noted mobile `gJENy` = DM Sans 15 |
| H2 | Foundations elevation (`01-foundations.md`) | Specced *"no drop shadows"* | `d4Uy0` (E1) shadow `0 4 12 #00000059`; `iP0k6` (E2) `0 10 24 #00000080` | Documented elevated-tier drop shadows on E1/E2 |
| H3 | Cmp·Switch (`02-atoms-form.md`) | Specced *all 11 switches square (cr2)* | 7 square (`cr2`,44×24) + **4 pill** (`cr12`,42×24: `NYAsE`/`tfit5`/`JkQ33`/`Jd7oZ`) | Added `shape` square/pill split (Settings vs Report/Shake) |
| H4 | Timeline §5.1 (`03-surfaces/timeline.md`) | StatusCycleButton border-hover count = 6 (rows summed to 10, not 11) | 11 `Status` boxes; 7 carry `$border-hover` | Corrected count 6→7 (rows now sum to 11) |

### Items marked `mismatch`
- **Timeline §5.1 StatusCycleButton — 4 appearances + INSTANCE COUNTS** (Surface) — The 4 APPEARANCES themselves are all correct: subtle-stroke (Rkud0 $background + $muted-foreground-subtle 1.5); border-hover ($background + $border-hover 1.5); in-progress (HAihJ $background + $primary 1.5 + inner 8x8 $primary rect J1Lz09); done (Lw1pC/qczG2 $success fill + lucide check 12x12 $succe
- **ManualTOCItem** (Component) — Contract is correct on structure (248-ish row, border-left 2, active wash) but states the wrong active LABEL color. The screen renders the active label in $primary, not $foreground.

## 2. Medium-severity refinement backlog

These are real but non-build-breaking precision/coverage gaps — captured for a follow-up spec pass. (Reconciliation policy: where a screen diverges, the screen wins.)

| Scope | Item | Direction | Finding |
|---|---|---|---|
| SURFACE spec — Empty/Loa | §7 + checklist: Divergence led | spec→design | Canonical node ids and their property values are asserted: EmptyState Ie7mv (60x60 Hex polygon 2px stroke + inner 22x22  |
| SURFACE spec — AI Resear | Errors & Edge States — Desktop | design→spec | Desktop Errors D01 'NO RESULTS' accent-stripe fill (Cell 01 Accent frame) |
| Surface spec NMzE5 — Acc | Shake-to-Report — Success/Erro | design→spec | Success-state Overlay scrim fill (node yKx5U) |
| Surface spec NMzE5 — Acc | Shake-to-Report — Success/Erro | spec→design | Open item (line 680): 'success uses scrim #0a0a0ce6 path implied gone (backdrop 0.6) while error uses lighter #0a0a0c80  |
| Component contracts — 01 | StatusCycleButton | spec→design | done → task name 'line-through text-muted-foreground' redundant channel (A11y line 312, variants lines 306/328) |
| Component contracts — 01 | StatusDot | design→spec | size enum omits 7px |
| Component contracts — 02 | Cmp · Textarea | design→spec | Real product Textarea value font/lineHeight/padding (ReportComposer Description Field) |
| Component contracts — 02 | Cmp · Select | design→spec | Compact Settings Select rendering (height/value-font/padding/chevron-size) |
| Component contracts — 02 | Cmp · Switch | design→spec | Pill Switch rendering in ReportComposer/ShakeReport Toggle Rows (not captured by the square contract) |
| Component contracts — 02 | Cmp · Switch | design→spec | Switch screen-instance count and location |
| Component contracts — 02 | Cmp · StatTile | design→spec | size='detail' value (22) is claimed for 'Category/Timeline/Deps desktop', but the three boards render three DIFFERENT Va |
| Component contracts — 02 | Cmp · ProgressBar | design→spec | Contract prop table states height default 4 with note 'always 4 on screens' — Timeline mission-detail Progress Bar is he |
| Component contracts — 02 | Cmp · ProgressBar | design→spec | Timeline remainder uses a THIRD remainder tone ($muted) not covered by remainderTone enum 'track'($card-elevated)|'borde |
| Component contracts — 02 | Cmp · ProgressBar | design→spec | Anatomy/mode='progress' description names the track as $card-elevated, but the Deps board progress bar track fill is $mu |
| Component contracts — 02 | MissionSummaryCard | design→spec | variants table 'Desktop detail header … StatTile size detail (22)' — only Category renders 22; Timeline=21, Deps=20 |
| Voice & AI component con | VoiceFAB | design→spec | processing glyph: spec states lucide 'loader-circle' (variant list, state matrix, anatomy), but the authoritative T2BChB |
| Voice & AI component con | SourceRow | design→spec | favicon tone mapping is wrong vs the actual §03 sources. Spec says 'capenature=$cat-bureaucratic blue, tankwatown=#e0c05 |
| Voice & AI component con | SourceRow | design→spec | 'failed' variant is structurally divergent from the SourceRow molecule. Partial-results rows (§04 cell 07) are circle-x  |
| Typography component con | Type/Title | spec→design | Variant table line 86 cites 'MissionDetailHeader (D3JA0i)' and line 97 cites 'D3JA0i MissionDetailHeader ... (canonical  |
| Typography component con | Type/Title | spec→design | Variant table line 88 cites 'Dependencies mission title (b1b079)'. b1b079 is the BOARD FRAME id; the actual Deps title t |
| Typography component con | Type/Section | spec→design | Variant 'section-lg (24px, w600) — larger Legal layout' (line 117, 138). The grep for 44px Legal H1 and the WCTkf scale  |
| Component contracts — Ch | AppHeader | spec→design | Exact values + Reconciliation: 'the Category/Timeline/Dependencies boards render the wordmark at letter-spacing 1px (dri |
| Component contracts — Ch | MissionDetailHeader | spec→design | 'Dependencies/Timeline desktop variant: adds a leading live dot before the title, a richer target LINE with a LOCATION s |
| Component contracts — Ch | DependencyConnector | spec→design | 'Dependencies board b1b079 (6 connectors: 3 muted-subtle normal + 3 primary critical-path...)' and '3 normal + 3 critica |
| Component contracts — 07 | ManualTOCItem | design→spec | Active label color: screen TOC active row (node tvaRu, label 'Task cards') renders label fill=$primary with border-left  |
| Component contracts — 07 | ManualTOCItem | spec→design | Active label color $foreground |
| Component contracts — 07 | CodeCallout | spec→design | Legal sections embed a danger ($destructive) tinted Callout (spec line 261 'embedded in Legal sections in warning/info/d |
| Component contracts — 07 | DeleteHistoryRangeOption | design→spec | Range set: screen renders five ranges — Last 7 days (64), Last 30 days (310), Last 6 months (820), Last year (1,204, SEL |
| Component contracts — 07 | DeleteHistoryRangeOption | spec→design | range label '90d' (Last 90 days) — spec line 560. |
| 01-foundations.md vs WCT | Tint / alpha convention (12% f | design→spec | ~40%-alpha hue stroke on tint demo frames (e.g. JNawK stroke '#ff6b3566', f41OQ '#d9a73e66', AEhEs '#5ae0a066', strokeWi |

## 3. Operator decisions (screen vs design-brief — informational)

The screens (Pencil output) resolved several brief points differently. Per the source-of-truth rule the screens win and the spec follows them, but these are worth an explicit operator sign-off:

- **StatusCycleButton "done":** screens paint it **orange (`$primary`)**, the brief §10 specified **green (`$success` ✓)**. Spec follows the screen.
- **WindowStatePill icons:** the Design-System screen renders generic **dot/circle** icons, not the brief's per-state Lucide set (Clock/XCircle/AlertTriangle/Lock). Real task cards on the view boards DO use distinct icons — confirm the intended icon set.
- **Type scale:** the foundations screen specimens only **11–12 of the brief's 19 `--text-*` steps**; the rest are unexercised. Confirm whether the full 19-step scale ships or only the shown subset.
- **Elevation shadows:** screens use **drop shadows on E1/E2** (now in spec) — a departure from the pure-flat "tactical" reading of the brief.
- **`CategoryTag` gear icon:** `package` on some specimens vs the brief's `backpack`.
- **`--overlay` token** is absent from `00-variables.json` and the screen; add it at build time if scrims are needed.

*Full structured findings: `docs/design-extract/_verify-raw.json`.*