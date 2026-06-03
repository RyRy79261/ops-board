# Surface Spec — Account · Settings · Legal · Manual (`NMzE5`) · P2

*Source: `docs/design-extract/boards/NMzE5__*.json` (screen authoritative). 4 scoped sections.*

# Account & Auth — Sign In, Account Management, and Destructive Flows

*scope: Account & Auth (Sign In · Account management · Delete Account · Delete History)*

## Account & Auth — Sign In, Account Management, Delete Account, Delete History

> Board `NMzE5` → area frame **"Account Management"** (`id` not on area, label text `jF2xW` = "ACCOUNT MANAGEMENT", mono 12/700, `$muted-foreground-subtle`, ls 2). The area is a `width:1380` vertical frame, `gap:24`, holding four numbered sub-sections, each a `Sec — *` vertical frame (`gap:18`) with a `Head` (Tick rect `8x8 $primary` + mono 15/700 label + DM Sans 13 `$muted-foreground` sub + 1px `$border` Rule) then `DESKTOP · 1380` and `MOBILE · 390` caption rows preceding each device artboard.
>
> **Read-only-board constraint.** None of these surfaces live on the read-only board. The board's only interaction is the StatusCycleButton. Everything in this scope is **account scope, off-board**: it is reached before the board (Sign In) or from an Account/Settings route. These are the *only* genuine input surfaces in the product — every field here is a real form input, in contrast to the board's display-only fields. The destructive confirm/done flows are the product's canonical confirmation pattern (P0-adjacent) but their surfaces are P2 because they do not block the board.

### Purpose

1. **Sign In (`01 · SIGN IN`)** — authenticated entry point. Email + password, plus passkey and magic-link alternatives. Shows the focused/default state and the wrong-credentials error state. Sub: "Authenticated entry point — email + password, passkey, and magic-link alternatives. Focused and error states shown."
2. **Account (`02 · ACCOUNT`)** — account & security management screen (`AccountProfileSummary` profile card, EMAIL row, password/passkey/2FA rows, SESSION sign-out row, and the `DangerZoneCard`).
3. **Delete Account (`03 · DELETE ACCOUNT`)** — App-Store-required destructive confirmation with type-to-confirm, then the queued/"scheduled for deletion" success state. Sub: "App Store requirement — destructive confirmation with type-to-confirm, plus the scheduled / queued result state."
4. **Delete History (`04 · DELETE HISTORY`)** — time-range data-deletion picker (`DeleteHistoryRangeOption` radios + affected-count summary + voice hint), then the "history cleared" done state.

All artboards are dark (`$background #0a0a0c`), `1px $border` inner stroke, sharp corners (`radius:0`); only avatars, the status circle, and radios carry explicit `cornerRadius`. Type system: **JetBrains Mono** for labels/captions/buttons/values-in-fields, **DM Sans** for prose/headings/body.

---

### 1 · SIGN IN

#### Desktop (`SIGN IN · Desktop`, `LvBUK`)
`clip:true`, `width:fill_container`, `height:780`, `fill:$background`, stroke `$border` 1 inner, vertical, `padding:[48,40]`, `justifyContent:center`, `alignItems:center`. Holds a `Cards` row (`gap:28`) of two cells, each `vertical gap:12` with a mono-10 caption above the card:

**Cell default** — caption "DEFAULT · EMAIL FOCUSED". **Cell error** — caption "ERROR · WRONG CREDENTIALS".

**Card** (both): `width:440`, `fill:$card`, stroke `$border` 1 inner, vertical, `gap:22`, `padding:34`. Top→bottom:
1. **WM Wrap → Wordmark** (centered): `OPS` (`$primary`) + `BOARD` (`$muted-foreground`), mono 18/700, ls 4.
2. **Title** (vertical gap 6, centered): cap "SECURE ACCESS" (mono 10/normal, ls 2, `$muted-foreground-subtle`) + H "Sign in to your board" (DM Sans 20/700, `$foreground`).
3. **[error only] Alert** (see Alert component) — `fill:#e05a5a1f`, `left:2` stroke `$destructive`, `padding:14`, `gap:12`: `octagon-alert` 18 `$destructive` + Col(gap5): T "ACCESS DENIED" (mono 12/700, ls 1, `$destructive`) + B "Incorrect email or password. 2 attempts remaining." (DM Sans 13, `$foreground`, lineHeight 1.4).
4. **EMAIL Group** (vertical gap 7): LabelRow (space-between) with Label "EMAIL" (mono 11, ls 1.5, `$muted-foreground`); **Field** `width:fill h:42 padding:[0,12] gap:8 alignItems:center`, Value "alex@opsboard.io" (mono 14, `$foreground`).
   - **default:** `fill:$background`, **stroke `$primary`** (focused) + trailing **Cursor** frame `2x18 $primary` (blinking caret affordance).
   - **error:** `fill:$background`, stroke `$border`, no cursor.
5. **PASSWORD Group** (vertical gap 7): LabelRow (space-between): Label "PASSWORD" (mono 11, ls 1.5) + Action "FORGOT?" (mono 11, ls 0.5, **`$primary`**, tappable). **Field** `h:42 padding:[0,12]`, Value "••••••••••" (mono 14) + trailing `eye` icon 16 `$muted-foreground` (show/hide toggle).
   - **default:** `fill:$muted`, stroke `$input` (resting/unfocused), `justifyContent:space_between`.
   - **error:** `fill:$background`, **stroke `$destructive`**, plus a **Help** line below: "Check your password and try again." (DM Sans 12, `$destructive`).
6. **Btn primary** "SIGN IN" — `fill:$primary width:fill padding:[12,16] center`, label mono 13/600 ls 0.5 `$primary-foreground`.
7. **Divider** — `gap:12 center`: 1px `$border` rule, "OR" (mono 10, ls 1.5, `$muted-foreground-subtle`), 1px `$border` rule.
8. **Btn secondary** "Continue with passkey" — `fill:$secondary`, stroke `$border` 1 inner, `padding:[12,16]`, leading `key-round` icon 16 `$foreground`, label mono 13/600 ls 0.5 `$foreground`.
9. **Footer** (vertical gap 9, centered): **MagicLink** row = `mail` icon 13 `$primary` + "Email me a magic link instead" (mono 11, ls 0.5, **`$primary`**); **req** "No account? Request access" (DM Sans 12, `$muted-foreground`).

#### Mobile (`SIGN IN · Mobile`, ×2 — `m2PSsn` focused / `c2foI` error)
Under "MOBILE · 390" cap, a **Mobile Row** (`gap:24`) of two MCells (`vertical gap:12`, captions "FOCUSED" / "ERROR"). Each artboard: `clip:true width:390 fill:$background` stroke `$border` 1 inner, vertical, `gap:22`, `padding:[40,24,32,24]`. **The mobile card content is identical to the desktop card** (wordmark, title, [error→alert], EMAIL group w/ focused `$primary` border + cursor, PASSWORD group, primary/secondary buttons, footer) but the mobile artboard *is* the card (no 440px inner card wrapper, no outer centering). Wordmark stays mono 18/700.

---

### 2 · ACCOUNT

#### Desktop (`ACCOUNT · Desktop`, `iI..` frame, no fixed height — `clip:true width:fill fill:$background` stroke `$border` 1 inner, vertical)
**Header** (`fill:$muted`, `bottom:1` stroke `$border`, `padding:[18,32]`, space-between, center): Wordmark `OPS`+`BOARD` mono 16/700 ls 4; **HRight** = crumb "ACCOUNT" (mono 11, ls 2, `$muted-foreground`) + **Av** circle `30x30 $primary radius15` with initials "AM" (mono 11/700 `$primary-foreground`).
**Body** (`padding:[40,0,48,0]`, center) → **Col** `width:760` vertical `gap:26`:
1. **PageTitle** (vertical gap 5): c "SETTINGS" (mono 10, ls 2, `$muted-foreground-subtle`) + h "Account & security" (DM Sans 24/700).
2. **Profile = AccountProfileSummary** (`fill:$card-elevated`, stroke `$border` 1 inner, `gap:18 padding:22 alignItems:center`): **Avatar** `56x56 $primary radius28` initials "AM" (mono 18/700 `$primary-foreground`); **PCol** (vertical gap 6): name "Alex Mercer" (DM Sans 18/700 `$foreground`), email "alex@opsboard.io" (mono 13 `$muted-foreground`), **Meta** (gap 10, center): since "SINCE MAR 2024" (mono 10, ls 1, `$muted-foreground-subtle`) + **Plan** pill (`fill:#ff6b351f`, stroke `$primary` 1 inner, `padding:[4,9]`) "PRO PLAN" (mono 10/700, ls 1, `$primary`).
3. **Sec EMAIL** (vertical gap 11): **H** = "EMAIL" (mono 12/700, ls 2, `$muted-foreground`) + fill `$border` 1px rule; **Body** (vertical gap 10) → **Row EMAIL ADDRESS** (`fill:$card`, stroke `$border` 1 inner, `gap:14 padding:[15,18]` space-between center): LC(vertical gap 5) = LR(gap8) `mail` icon 14 `$muted-foreground` + Label "EMAIL ADDRESS" (mono 11, ls 1.5), Value "alex@opsboard.io" (DM Sans 14 `$foreground`), Sub "Verified · primary contact" (mono 11 `$muted-foreground-subtle`); trailing **Btn outline** "CHANGE" (stroke `$border` 1 inner, `padding:[8,14]`, mono 12/600 ls 0.5 `$foreground`).
4. **Sec PASSWORD & SECURITY** — three `$card` rows (same row pattern as EMAIL): **Row PASSWORD** (`lock` icon; Btn outline) · **Row PASSKEY** (Btn outline) · **Row TWO-FACTOR AUTH** (trailing **Badge** instead of a button — see component). *Adjacent to scope; documented for completeness.*
5. **Sec SESSION** (vertical gap 11): H "SESSION" + rule; **Row SIGN OUT** (`$card` row): LC = `log-out` icon 14 `$muted-foreground` + Label "SIGN OUT" (mono 11, ls 1.5) + Value "End your session on this device" (DM Sans 14 `$foreground`); trailing **Btn secondary** "SIGN OUT" (`fill:$secondary`, stroke `$border` 1 inner, `padding:[8,14]`, mono 12/600 ls 0.5 `$foreground`).
6. **Danger Zone = DangerZoneCard** (`fill:#e05a5a0d`, **stroke `$destructive` 1 inner**, vertical, `gap:14 padding:20`): **DH** header (gap 9) = `octagon-alert` icon 16 `$destructive` + "DANGER ZONE" (mono 12/700, ls 2, `$destructive`); **DZBody** (vertical gap 10) holds two `$card` rows:
   - **Row DELETE HISTORY** — `history` icon 14, Label "DELETE HISTORY", Value "Remove past tasks & activity by time range" (DM Sans 14); trailing **Btn outline** "DELETE…" (stroke `$border`, mono 12/600).
   - **Row DELETE ACCOUNT** — `trash-2` icon 14, Label "DELETE ACCOUNT", Value "Permanently erase your account and all data"; trailing **Btn destructive** "DELETE…" (`fill:$destructive`, `padding:[8,14]`, mono 12/600 `$destructive-foreground`). *Both buttons end with an ellipsis "…", signalling they open the respective confirm flow (§3/§4) rather than acting immediately.*

#### Mobile (`ACCOUNT · Mobile`, `rG1yF`)
`clip:true width:390 fill:$background` stroke `$border` 1 inner, vertical. **Header** `padding:[16,20]` space-between: Wordmark `OPS`+`BOARD` **mono 14/700**; trailing **gear** = `settings` icon 18 `$muted-foreground` (replaces the desktop crumb+avatar). **Body** `gap:22 padding:[22,20,36,20]` (no 760px centering Col; sections stack full-width). Content is **structurally identical** to desktop: PageTitle, Profile/AccountProfileSummary, Sec EMAIL, Sec PASSWORD & SECURITY (password/passkey/2FA), Sec SESSION (Sign Out), Danger Zone (Delete History outline + Delete Account destructive). Same tokens/copy/icons.

---

### 3 · DELETE ACCOUNT (confirm / done state machine)

#### Desktop (`DELETE ACCOUNT · Desktop`, `OiWio`)
`clip:true width:fill height:760 fill:$background` stroke `$border` 1 inner, `padding:[44,40]`, centered. **Cards** row (`gap:28`) of **Cell confirm** + **Cell done**.

**Cell confirm** (caption "CONFIRM · TYPE-TO-CONFIRM") → **Card** `width:460 fill:$card` **stroke `$destructive` 1 inner**, vertical `gap:18 padding:28`:
1. **Hdr** (space-between): HL = `trash-2` icon 20 `$destructive` + "DELETE ACCOUNT" (mono 16/700, ls 2, `$destructive`); trailing `x` icon 18 `$muted-foreground` (dismiss).
2. **Sub** "This permanently erases your OpsBoard account. There is no way to restore it once confirmed." (DM Sans 14, `$muted-foreground`, lineHeight 1.45).
3. **ListBox** (`fill:$muted`, stroke `$border` 1 inner, vertical `gap:11 padding:16`): lh "THE FOLLOWING WILL BE ERASED" (mono 10, ls 1.5, `$muted-foreground-subtle`), then 5 **it** rows, each `x` icon 14 `$destructive` + DM Sans 13 `$foreground` text: "Profile & login credentials" · "248 tasks across 6 boards" · "Voice command history" · "Connected integrations (3)" · "Billing & subscription records".
4. **Alert** (`fill:#e05a5a1f`, `left:2` stroke `$destructive`, `padding:14`): `octagon-alert` 18 `$destructive` + Col: T "IRREVERSIBLE" (mono 12/700, ls 1) + B "Once deleted, your data cannot be recovered by support or by you." (DM Sans 13, lineHeight 1.4).
5. **TYPE DELETE TO CONFIRM Group = TypeToConfirmField** (vertical gap 7): Label "TYPE DELETE TO CONFIRM" (mono 11, ls 1.5, `$muted-foreground`); **Field** `fill:$background` **stroke `$primary`** 1 inner, `h:42 padding:[0,12]`, Value "DELETE" (mono 14, ls 1, `$foreground`) + Cursor `2x18 $primary`; **Help** "Confirmation matches — you may proceed." (DM Sans 12, **`$success`** — match state).
6. **Actions** (row, gap 12): **Btn outline** "CANCEL" (`width:fill`, stroke `$border`, `padding:[12,16]`, mono 13/600) + **Btn destructive** "DELETE MY ACCOUNT" (`width:fill fill:$destructive`, leading `trash-2` icon 15 `$destructive-foreground`, mono 13/600 `$destructive-foreground`).

**Cell done** (caption "QUEUED · SUCCESS STATE") → **Card** `width:420 fill:$card` stroke `$border` 1 inner, vertical `gap:18 padding:28 alignItems:center`:
1. **IconWrap** centered → **Circle** `60x60 fill:#d9a73e1f radius30` stroke **`$warning`** 1 inner, `hourglass` icon 26 `$warning`.
2. **TitleW** (vertical gap 8, centered): t "SCHEDULED FOR DELETION" (mono 15/700, ls 1.5, **`$warning`**) + b "Your account and all data are queued for permanent deletion on 10 June 2026." (DM Sans 14, `$foreground`, textAlign center, lineHeight 1.5).
3. **Alert** (`fill:#d9a73e1f`, `left:2` stroke `$warning`): `triangle-alert` icon 18 `$warning` + Col: T "GRACE PERIOD · 7 DAYS" (mono 12/700, ls 1, `$warning`) + B "You can still cancel by signing in any time before the deletion date." (DM Sans 13).
4. **Actions** (vertical gap 10): **Btn primary** "CANCEL DELETION" (`fill:$primary`, leading `rotate-ccw` icon 15 `$primary-foreground`, mono 13/600) + **Btn outline** "SIGN OUT" (stroke `$border`, mono 13/600 `$foreground`).

#### Mobile (`MCell confirm` → `DELETE ACCOUNT · Mobile` `sb47h`; `MCell done` → `DELETE ACCOUNT · Mobile Done` `Q6BdL0`)
Mobile Row `gap:24`, captions "CONFIRM" / "QUEUED". **Confirm** artboard `width:390 fill:$background` stroke `$border` 1 inner, `gap:18 padding:[26,22,30,22]` — *note: the mobile confirm artboard uses the standard `$border` stroke, not the desktop card's `$destructive` stroke.* Content identical to desktop confirm card (Hdr w/ trash-2 + x, Sub, ListBox 5 items, IRREVERSIBLE Alert, TypeToConfirmField w/ `$primary` field + match Help, Actions CANCEL + "DELETE MY ACCOUNT"). **Done** artboard `padding:[40,22,30,22] alignItems:center` — identical to desktop done (warning hourglass Circle, "SCHEDULED FOR DELETION", grace-period Alert, "CANCEL DELETION" primary + "SIGN OUT" outline).

---

### 4 · DELETE HISTORY (confirm / done state machine)

#### Desktop (`DELETE HISTORY · Desktop`, height:840)
`clip:true width:fill height:840 fill:$background` stroke `$border` 1 inner, `padding:[44,40]`, centered. **Cards** row `gap:28` of **Cell confirm** + **Cell done**.

**Cell confirm** (caption "CONFIRM · TIME-RANGE") → **Card** `width:460 fill:$card` stroke **`$border`** 1 inner (non-destructive), vertical `gap:18 padding:28`:
1. **Hdr** (space-between): HL = `history` icon 20 **`$primary`** + "DELETE HISTORY" (mono 16/700, ls 2, **`$foreground`** — not destructive-tinted, since the action is scoped, not terminal); trailing `x` icon 18 `$muted-foreground`.
2. **Sub** "Delete everything from the last:" (DM Sans 14, `$muted-foreground`).
3. **Options** (vertical gap 8) — five **DeleteHistoryRangeOption** rows (`width:fill gap:12 padding:[12,14]` space-between center). Each: **L**(gap 11) = **Radio** `18x18 $background radius9` stroke 2px + label (DM Sans 14), trailing **c** count (mono 12). States by row:
   - "Last 7 days" — `fill:$muted` border `$border`, Radio empty (stroke `$border-hover`), count "64" `$muted-foreground`.
   - "Last 30 days" — same unselected, count "310".
   - "Last 6 months" — same unselected, count "820".
   - **"Last year" (SELECTED)** — `fill:#ff6b350f`, **border `$primary`**; Radio stroke `$primary` 2px with inner **Dot** ellipse `8x8 $primary`; label DM Sans 14 **/600**; count "1,204" mono 12/600 **`$primary`**.
   - "All time" — unselected, count "3,902".
4. **Summary** (`fill:$card-elevated`, **`left:3` stroke `$primary`**, vertical `gap:7 padding:16`): l "WILL BE REMOVED" (mono 10, ls 1.5, `$muted-foreground-subtle`); **NR** row (gap 7, align end): n "1,204" (DM Sans 26/700 `$foreground`) + u "items" (DM Sans 14 `$muted-foreground`); bd "980 tasks · 224 voice logs" (mono 12 `$muted-foreground`).
5. **VoiceHint** (`fill:$muted`, `left:2` stroke `$primary`, `gap:10 padding:[11,13]` center): `mic` icon 15 `$primary` + "or say:  "delete everything from last year"" (mono 12, `$muted-foreground`). *Ties this destructive picker to the global voice command surface.*
6. **Actions** (row, gap 12): **Btn outline** "CANCEL" + **Btn destructive** "DELETE 1,204 ITEMS" (`fill:$destructive`, leading `trash-2` icon 15, mono 13/600 `$destructive-foreground`). *Button label embeds the live count from the selected range.*

**Cell done** (caption "DONE") → **Card** `width:420 fill:$card` stroke `$border` 1 inner, vertical `gap:18 padding:28 alignItems:center`:
1. **IconWrap** → **Circle** `60x60 fill:#5ae07a1f radius30` stroke **`$success`** 1 inner, `check` icon 28 `$success`.
2. **TitleW**: t "HISTORY CLEARED" (mono 15/700, ls 2, **`$success`**) + b "1,204 items from the last year were permanently removed." (DM Sans 14, textAlign center, lineHeight 1.5).
3. **Alert** (`fill:#ff6b351f`, `left:2` stroke **`$info`**): `info` icon 18 `$info` + Col: T "REMOVED · 10 JUN 2026" (mono 12/700, ls 1, `$info`) + B "Your remaining boards and recent activity are untouched." (DM Sans 13). *`$info` resolves to `#ff6b35` (== `$primary`), so this is an orange info alert, not blue.*
4. **Actions** (vertical gap 10): **Btn primary** "DONE" (`fill:$primary`, leading `check` icon 15 `$primary-foreground`, mono 13/600) + **Btn outline** "VIEW WHAT REMAINS" (stroke `$border`, mono 13/600 `$foreground`).

#### Mobile (`MCell confirm` → `DELETE HISTORY · Mobile`; `MCell done` → `DELETE HISTORY · Mobile Done`)
Mobile Row `gap:24`. Both artboards `width:390 fill:$background` stroke `$border` 1 inner. Content **identical** to desktop: confirm = history header, "Delete everything from the last:", five range options (Last year selected, counts 64/310/820/1,204/3,902), Summary card "1,204 items · 980 tasks · 224 voice logs", VoiceHint, CANCEL + "DELETE 1,204 ITEMS"; done = success-check Circle, "HISTORY CLEARED", `$info` "REMOVED · 10 JUN 2026" alert, "DONE" primary + "VIEW WHAT REMAINS" outline.

---

### State machines (authoritative from screens)

**Sign In:** `default/focused` → (submit) → `error` (inline ACCESS DENIED alert + destructive password field + help + decrementing "N attempts remaining") | (success) → board. Alternate auth: `passkey` (secondary btn), `magic-link` (footer link). `FORGOT?` opens reset. Email field shows focused style (`$primary` border + cursor) in default; password field shows resting style (`$muted`/`$input`) until focused.

**Delete Account:** `confirm` (type-to-confirm; destructive button enabled only when typed value === "DELETE", screen captures the *matched* state — `$success` help, primary field border) → (confirm) → `done` = `SCHEDULED FOR DELETION` (warning, 7-day grace). From `done`: `CANCEL DELETION` (rotate-ccw, primary) returns to active account, or `SIGN OUT`. `CANCEL`/`x` exits to Account.

**Delete History:** `confirm` (radio range selection drives Summary count + destructive button label; voice command "delete everything from last year" is an equivalent trigger) → (confirm) → `done` = `HISTORY CLEARED` (success). From `done`: `DONE` (primary) or `VIEW WHAT REMAINS` (outline). `CANCEL`/`x` exits.

---

### Tokens used (resolved)
`$background #0a0a0c` · `$foreground #e8e8f0` · `$muted #131318` · `$muted-foreground #7a7a8e` · `$muted-foreground-subtle #4a4a5e` · `$card #1a1a22` · `$card-elevated #22222e` · `$border #2a2a38` · `$border-hover #3a3a4a` · `$input #2a2a38` · `$primary #ff6b35` · `$primary-foreground #0a0a0c` · `$secondary #1a1a22` · `$destructive #e05a5a` · `$destructive-foreground #fafafa` · `$success #5ae07a` · `$warning #d9a73e` · `$info #ff6b35` (== primary). Inline alpha tints (NOT tokens): `#e05a5a1f` (destructive 12%, alert bg), `#e05a5a0d` (destructive ~5%, DangerZone bg), `#ff6b351f` (primary 12%, PRO PLAN + info alert bg), `#ff6b350f` (primary ~6%, selected range bg), `#d9a73e1f` (warning 12%, queued circle + grace alert), `#5ae07a1f` (success 12%, done circle).

# Settings & Debug Console

*scope: Settings & Debug Console (desktop + mobile)*

## Settings & Debug Console

**Board:** `NMzE5` — *OpsBoard — Account · Settings · Legal · Manual*
**Area frame:** `Settings & Debug` (`BGyhV`, w=1380)
**Scope:** Two paired surfaces — a read-only **Settings** screen and a read-only **Debug Console** — each rendered at **desktop/web** and **mobile (390px)**. Both are status/diagnostic displays; the only writable affordances are toggle Switches and segmented controls in Settings. Everything in the Debug Console is explicitly **read-only** (the header says so).

Both screen captions are literal text in the board: `DESKTOP / WEB · PRIMARY` (`FO3FL`) and `MOBILE · 390` (`a0s9Th`). All corner radii resolve to **0** (the `radius` variable = `0`); any `cornerRadius: 2` on chips/switches is an explicit local override and is the only rounding in scope (plus `cornerRadius: 999` on slider track/knob).

---

### 1. Purpose

- **Settings** — a grouped preferences list. Eyebrow-labelled sections (`ACCOUNT`, `NOTIFICATIONS`, `VOICE & MICROPHONE`, `APPEARANCE`, `DATA & PRIVACY`, `ABOUT`) each contain a bordered `$card` group of settings rows. Rows come in two functional shapes: **navigation-link rows** (label + optional value + chevron, tapping navigates) and **control rows** (label + a live control: Switch, Segmented, Select, Slider, Locked badge, or Accent swatch).
- **Debug Console** — a developer diagnostics panel: a `Last Error` / ErrorStateCard banner, a `COPY DIAGNOSTICS` action, two key/value `SYSTEM INFO` and `SESSION` code blocks (the SESSION block embeds a `feature.flags` FeatureFlagChip grid), and a `RECENT ERRORS` log table with a footer (`LogFooter`) carrying a buffer summary + `DOWNLOAD .LOG`.

---

### 2. Desktop / Web — layout (top → bottom, exact)

**Root** `DESKTOP / WEB` (`wPJPY`): vertical, `width: fill_container`, `fill: $background`, `stroke: $border` 1px.

**2.1 TopBar** (`t8yyGk`) — `fill: $muted`, bottom border 1px `$border`, padding `[14, 22]`, `align center`, `justify space_between`.
- **Left** (`x2ICKX`, gap 12, center): `Tick` rectangle 8×8 → `OPSBOARD` brand → `/` slash → `SETTINGS` crumb.
- **Right** (`YYe8b`, gap 8, center): **EnvChip** (`mCQwK`) `fill #5ae07a1f`, `cornerRadius 2`, padding `[3,8]`, gap 6 → 7×7 success `Dot` ellipse + `PROD` text → then `v2.4.1` version text (`NqvxC`).

**2.2 Body** (`hfMhZ`) — gap 32, padding 28, `fill_container`. Two columns side by side:
- **SETTINGS column** (`KOrFh`) — vertical, gap 30, **fixed width 520**.
- **DEBUG column** (`HUHij`) — vertical, gap 22, `fill_container`.

**2.3 SETTINGS column** — repeats per section: an **Eyebrow** text then a **Group** frame.
- **Eyebrow** (e.g. `qkoUe`): `fill $muted-foreground-subtle`, JetBrains Mono, fs **12**, fw **700**, `letterSpacing 2`. Strings: `ACCOUNT`, `NOTIFICATIONS`, `VOICE & MICROPHONE`, `APPEARANCE`, `DATA & PRIVACY`, `ABOUT`.
- **Group** (`sgX5s` etc.): vertical, `fill $card`, `stroke $border` 1px, `fill_container`. Contains **Row** frames separated by full-width 1px `$border` `Div` rectangles.
- **Row** (`S0enNm` etc.): gap 16, padding `[15, 16]`, `fill_container`, `align center`. Standard shape = `[Avatar?] + L(label/desc, fill_container) + (Link | control)`.
- **Foot** (`BXNw8`): `fill_container`, JetBrains Mono fs **11** fw normal, `fill $muted-foreground-subtle`, content `OpsBoard © 2026 · Made for missions that matter`.

Two adjacent `Div` rectangles (`S0W21` + `f1RFwS`) appear stacked under the ACCOUNT profile row — a deliberate double hairline (heavier separator) before the rest of the group.

**2.4 DEBUG column → Debug Console** (`YYF0Z`) — `fill $card`, `stroke $border`.
- **Console Header** (`ARTiX`): `fill $muted`, border `$border`, padding `[14,18]`, `align center`, `justify space_between`. Left = `Term` icon 18×18 `$primary` + title block (`DEBUG CONSOLE` JetBrains Mono fs 14 fw 700 `$foreground` / sub `diagnostics · read-only` fs 11 `$muted-foreground-subtle`). Right = **Copy Diagnostics** button (`N9vvr0`) `fill $primary`, padding `[9,14]`, gap 8, center: `Clip` icon 15×15 `$primary-foreground` + `COPY DIAGNOSTICS` fs 12 fw 700 `$primary-foreground`.
- **Inner** (`H3kfR`): vertical, gap 24, padding 20. Order top→bottom: **Last Error** card → **SecHead `SYSTEM INFO`** → Code Block → **SecHead `SESSION`** → Code Block (with flag grid) → **SecHead `RECENT ERRORS`** → Error Log table.

**SecHead** (`JzgDx`/`y4y2rK`/`oYO97`): vertical gap 10. Row (gap 10, center) = 8×8 `$primary` `Tick` + label (JetBrains Mono fs **13** fw **700** `$foreground`). `RECENT ERRORS` SecHead row additionally has a `fill_container` spacer + a **Cnt** badge (`YPDeM`): `fill $muted`, `stroke $border`, padding `[2,8]`, text `6 / 128` fs 11 fw 600 `$muted-foreground`. Below the row: 1px `$border` `Rule`.

---

### 3. Mobile (390) — layout (top → bottom, exact)

**Root** `MOBILE` (`YvD6Q`): vertical, **width 390**, `fill $background`, `stroke $border` 1px.

**3.1 AppBar** (`vv9Rp`): `fill $muted`, bottom border 1px, padding `[14,16]`, gap 12, center → `Back` icon 20×20 `$foreground` + `SETTINGS` title (JetBrains Mono fs 14 fw 700) + `fill_container` spacer + **EnvChip** (`Z3kMF`, `fill #5ae07a1f`, `cornerRadius 2`): 6×6 success `Dot` + `PROD` fs 10 fw 600 `$success`.

**3.2 Content** (`oA4ey`): vertical, gap 26, padding 16, `fill_container`. Single column. Settings groups first, then debug section inline.

Mobile settings sections (Eyebrow + Group, same Eyebrow style as desktop fs 12 fw 700 letterSpacing 2):
- `ACCOUNT` (`UAryA`): profile row (Avatar 36×36 `$card-elevated` stroke `$border-hover`, `RN` initials, `ryan@opsboard.io` / `OpsBoard Pro`, chevron link) + `Subscription` row (`Pro` value + `Renews 12 Jan 2027` desc + chevron).
- `NOTIFICATIONS` (`uyZcJ`): 3 Switch rows — `Push notifications` (ON), `Task reminders` (ON), `Voice confirmations` (OFF).
- `VOICE & MICROPHONE` (`EqVz0`): `Input device` (Select `MacBook Mic`), `Activation` (Segmented PUSH/TAP, PUSH active), `Mic sensitivity` (Slider width 120, fill 80, `68%`).
- `APPEARANCE` (`W5BOM`): `Theme` (Locked `DARK` badge).
- `DATA & PRIVACY` (`XQ21H`): `Export my data` (chevron), `Privacy & Terms` (chevron), `Delete account` (`$destructive` label + chevron `$destructive`).
- `ABOUT` (`K3paOP`): `Version` row with inline value `2.4.1 · 1842`.

Mobile **Row** (`k4rre`): gap 12, padding **14** (vs desktop `[15,16]`), center. Mobile groups carry `fill $card` + `stroke $border` 1px.

**3.3 Mobile Debug section** (inline in Content, not a bordered console card):
- **Debug Head** (`lZ7qR`): gap 12 → Row (gap 8): `Term` icon 18×18 `$primary` + `DEBUG CONSOLE` fs 13 fw 700 + `fill_container` spacer + `read-only` fs 10 `$muted-foreground-subtle`.
- **Copy Diagnostics** (`I3TG7W`): full-width `fill $primary`, padding `[12,14]`, gap 8 → `Clip` 15×15 + `COPY DIAGNOSTICS` fs 12 fw 700 `$primary-foreground`.
- **Last Error** (`lXM8A`): see §5.
- Eyebrow `SYSTEM INFO` + Code Block (`ecahR`).
- Eyebrow `SESSION` + Code Block (`oksR0`, contains flag grid).
- Eyebrow `RECENT ERRORS` + Code Block (`PQmfS`, a stacked log list + Footer).

Mobile debug section headers use the **same Eyebrow style** as the settings sections (`SYSTEM INFO`/`SESSION`/`RECENT ERRORS`), unlike desktop which uses the `Tick + bold mono label + Rule` SecHead pattern. Divergence noted in §9.

---

### 4. SettingsRow — variants as rendered

All rows share `gap / padding / align center` and the `L` label-block (`Label` DM Sans fs **14** fw **500** `$foreground`; optional `Desc` DM Sans fs **12** fw normal `$muted-foreground`, `fill_container`). Variants observed:

| Variant | Trailing element | Examples (exact) |
|---|---|---|
| **Profile** (nav-link) | Avatar (38 desktop / 36 mobile, `$card-elevated`, mono initials `RN` `$primary` fw 700) + Link(value? + Chev) | desktop `ryan@opsboard.io` / `Signed in · OpsBoard Pro` → `Manage` + chevron; mobile `ryan@opsboard.io` / `OpsBoard Pro` |
| **Nav-link (value + chevron)** | Link = Val (JetBrains Mono fs 12 fw 500 `$muted-foreground`) + Chev icon 18×18 `$muted-foreground-subtle` | `Connected devices` → `3`; mobile `Subscription` → `Pro`; `Version` → `2.4.1 · build 1842` (desktop value is plain `Val` text, no chevron) |
| **Nav-link (chevron only)** | Link = Chev 18×18 `$muted-foreground-subtle` | `Sign out` (label `$muted-foreground`), `Export my data`, `Privacy Policy`, `Terms of Service`, `What's new`, `Open-source licenses` |
| **Destructive nav-link** | Chev 18×18 `$destructive`; label `$destructive` | `Delete account` / `Permanently erase all missions & data` |
| **Switch control** | Switch 44×24 (see §6) | `Push notifications`, `Task reminders`, `Voice confirmations`, `Weekly digest` |
| **Select control** | Select pill (`$muted`, `stroke $input`, h 34, padding `[0,10]`, gap 10): Val mono fs 12 fw 500 `$foreground` + Chev 14×14 `$muted-foreground` | `Input device` → `MacBook Pro Mic` / mobile `MacBook Mic` |
| **Segmented control** | Segmented (`$muted`, `stroke $border`, padding 2): active Seg `$primary`/`$primary-foreground`, inactive Seg `fill #00000000`/`$muted-foreground`; text fs 11 fw 600 mono | `Activation` → `PUSH`(active) `TAP` |
| **Slider control** | Slider: Track (h16, `cornerRadius 999`) with BarBg (`$muted` stroke `$border-hover` h6) + BarFill (`$primary` h6, **112/170** desktop, **80/120** mobile) + Knob ellipse 16×16 `$foreground`; trailing `Pct` mono fs 11 `68%` | `Mic sensitivity` |
| **Locked badge** | Locked pill (`$muted`, `stroke $border`, padding `[6,10]`, gap 6): Lock icon 12×12 `$muted-foreground` + `DARK` mono fs 11 fw 600 `$muted-foreground` | `Theme` / `OpsBoard is dark-only — light theme disabled` |
| **Accent swatch** | AccentW (gap 8, center): 18×18 Swatch `$primary` + Hex mono fs 12 `#FF6B35` `$muted-foreground` | `Accent` / `Tactical orange — fixed` (desktop only) |

---

### 5. Switch — exact rendering (ON / OFF)

Frame **44×24**, `cornerRadius 2`, padding `[0, 3]`, `align center`. Knob = ellipse **18×18**.

- **ON** (`IOSAg`, `IKIoK`, `Fc7Sa` desktop; `j0pQg`, `J0XnUa` mobile): `fill $primary`, `stroke $primary` 1px, **`justifyContent: end`** (knob pinned right), Knob `fill $primary-foreground`.
- **OFF** (`favri` desktop; `XICuj` mobile): `fill $muted`, `stroke $border-hover` 1px, **no justifyContent** (knob defaults left/start), Knob `fill $foreground`.

The ON/OFF state is encoded purely by `fill` + `stroke` + knob `justifyContent` + knob `fill`. There is no track-fill animation node; it is a flattened static depiction. As-rendered ON count: 3 of 4 (desktop NOTIFICATIONS), `Voice confirmations` is the single OFF.

### 5b. Last Error / ErrorStateCard — exact rendering

- **Desktop** (`X1UBu`): `fill #e05a5a1f`, **left border only 2px** (`strokeWidth {left:2}`) `$destructive`, padding 14, gap 12, horizontal. Children: `Icon` 18×18 `$destructive` + Col (fill_container) → Top row(`TL` = `LAST ERROR` + `OPS-4012`, both `$destructive` JetBrains Mono fs 12 fw 700; spacer; `Time` `14:32:01` `$muted-foreground` fs 11) → `Msg` (DM Sans fs **13** `$foreground`, full sentence: `Voice transcription timed out after 8s — request aborted, no transcript returned.`) → `Stack` (JetBrains Mono fs 11 `$muted-foreground`: `at VoicePipeline.transcribe (voice.ts:212) → fetch /v1/stt`).
- **Mobile** (`lXM8A`): `fill #e05a5a1f`, **full** `stroke $destructive`, padding 13, gap 10. Same icon + Col, but `LAST ERROR`/`OPS-4012`/`Time` at fs 10–11, Msg shortened to `Voice transcription timed out after 8s — request aborted.` and **no `Stack` line**.

### 5c. FeatureFlagChip — exact rendering (ON / OFF)

Inside SESSION block, under `feature.flags` label. Chip frame: padding `[3,8]` desktop / `[3,7]` mobile, gap 7 / 6, `cornerRadius` inherits 0 except explicit chip fills. Children: 6×6 `D` dot ellipse + `N` flag-name (DM-rendered as JetBrains Mono fs 11 fw 500) + `S` status text (mono fs 10 fw 700).

- **ON chip:** `fill #5ae07a1f`, `stroke #5ae07a00` (transparent), Dot `$success`, Name `$foreground`, Status `ON` `$success`.
- **OFF chip:** `fill $muted`, `stroke $border`, Dot `$muted-foreground-subtle`, Name `$muted-foreground`, Status `OFF` `$muted-foreground-subtle`.

Flags & states (identical content desktop + mobile, only wrapping differs): `voice_v2`=ON, `deps_graph`=ON, `ai_research`=ON, `offline_sync`=OFF, `beta_ui`=OFF, `telemetry`=ON. Desktop = 2 ChipRows of 3 (`D2n32`, `WhWNA`); mobile = 3 ChipRows of 2 (`PpXCV`/`r3A9bF`/`RtOQN`), each ChipRow gap 8 (desktop) / 7 (mobile).

---

### 6. Debug code blocks & error log — exact rendering

**Code Block** (`c6jXMu`, `o8bYE7` desktop; `ecahR`, `oksR0` mobile): vertical, `fill $card-elevated`, `stroke $border` 1px. Rows = **KV** frames separated by 1px `$border` `Div`.

**DebugInfoRow (KV):** gap 16 desktop / 12 mobile, padding `[9,14]` desktop / `[9,13]` mobile. `K` key (mono fs 11 fw normal `$muted-foreground`, **fixed width 150 desktop / 104 mobile**) + `V` value (mono fs 11 fw 500 `fill_container`). Default value color `$foreground`; **`commit` (`a3f9c2e`) and `session.id` (`ses_...`) values are `$primary`** to flag them as copy-worthy identifiers.

SYSTEM INFO keys/values (desktop): `app.version 2.4.1`, `build 1842 · release`, `commit a3f9c2e`(primary), `environment production`, `platform macOS 15.3 · arm64`, `user-agent Mozilla/5.0 …Chrome/132.0 Safari/537.36`(muted value), `screen 1512 × 982 · DPR 2.0`, `viewport 1324 × 880`, `locale en-ZA · Africa/Johannesburg (UTC+2)`, `network online`, `last sync 2026-06-03 14:32:08 · 6s ago`. Mobile SYSTEM INFO drops `viewport` + `user-agent` and changes platform to `iOS 18.3 · iPhone15,2`, screen `393 × 852 · DPR 3.0`, locale `en-ZA · UTC+2`, last sync `14:32:08 · 6s ago` — a device-context divergence between platforms.

SESSION keys/values: `user.id usr_8f2a91c4`, `session.id ses_2b7d-44ff-9a01-ce63`(primary; mobile truncated `ses_2b7d-44ff`), `auth jwt · exp 2026-06-03 18:11` (mobile omits the `auth` row), then the `feature.flags` row (§5c).

**ErrorLogRow table** — desktop **table** (`CscmH`, `$card-elevated`, `stroke $border`):
- **HeadRow** (`DwlBa`): `fill $muted`, bottom border 1px, padding `[8,14]`, gap 14, center. Header cells (mono fs **10** fw 700 `$muted-foreground-subtle`): `TIME`(Cell w78) · `LVL`(w56) · `CODE`(w86) · `MESSAGE`(CellMsg fill).
- **LogRow** (e.g. `vZnaS`): padding `[9,14]`, gap 14, center. Cell widths mirror header. `TIME` mono fs 11 `$muted-foreground`; `LVL` = **Badge** (padding `[3,6]`, mono fs 10 fw 700); `CODE` mono fs 11 fw 600 **`$primary`**; `MESSAGE` mono fs 11 `$foreground`. Rows separated by 1px `$border` Div. Six rows:
  1. `14:32:01` · **ERR** · `OPS-4012` · `Voice transcription timed out after 8s`
  2. `14:31:48` · **WARN** · `OPS-2207` · `Sync retry 3/5 — network unstable`
  3. `14:30:15` · **ERR** · `OPS-4090` · `Dispatch failed: task missing assignee`
  4. `14:29:52` · **INFO** · `OPS-1004` · `Background sync completed · 142 items`
  5. `14:28:30` · **WARN** · `OPS-2210` · `Mic permission prompt dismissed by user`
  6. `14:21:07` · **ERR** · `OPS-4012` · `Voice transcription timed out after 8s`
- **Badge (LVL) tones:** `ERR` `fill #e05a5a1f` / text `$destructive`; `WARN` `fill #d9a73e1f` / text `$warning`; `INFO` `fill #ff6b351f` / text `$info`.
- **LogFooter** (`OLvxp`): `fill $muted`, padding `[8,14]`, `align center`, `justify space_between`. Left = `showing last 6 of 128 events · buffer 14:18:02 → 14:32:01` (mono fs 10 `$muted-foreground-subtle`). Right = **Download** pill (`tjMpq`, `stroke $border-hover` 1px, padding `[6,10]`, gap 6): `DlI` icon 13×13 `$muted-foreground` + `DOWNLOAD .LOG` mono fs 11 fw 600 `$muted-foreground`.

**Mobile RECENT ERRORS** (`PQmfS`) is a **stacked card list**, not a table: each `LogRow` (padding `[10,13]`, gap 6) = TopLine (gap 8: `TIME` + LVL Badge padding `[2,6]` + `CODE` `$primary`) over a full-width `M` message line. Only **4 rows** shown (rows 1–4 above; rows 5–6 dropped) and the Footer (`SzVu4`, `fill $muted`, padding `[9,13]`) is simplified to `last 4 of 128 events` + plain `DOWNLOAD .LOG` text (mono fs 10 fw 600, no icon, no buffer range, no border).

---

### 7. Every state in scope

- **Switch:** ON (3×) / OFF (1×).
- **Segmented:** active segment (`PUSH`) / inactive segment (`TAP`).
- **Locked control:** disabled-by-product state (Theme `DARK`, lock icon) — non-interactive.
- **FeatureFlagChip:** ON (4: voice_v2, deps_graph, ai_research, telemetry) / OFF (2: offline_sync, beta_ui).
- **Log level Badge:** ERR / WARN / INFO (3 tones).
- **KV value emphasis:** default (`$foreground`) / identifier-highlighted (`$primary`) / de-emphasised long value (`user-agent` `$muted-foreground`).
- **Nav-link row:** default / value-bearing / destructive (`Delete account`, `Sign out` is muted-label).
- **Error banner:** populated error state (Last Error with code, time, message, optional stack). No empty/loading variant is depicted in this scope.
- **EnvChip:** single `PROD` success state shown (no other env shown).

---

### 8. Interactions

- **Switch rows** — the only writable toggles; tapping flips ON↔OFF (visual = fill/stroke/knob position swap per §5). All other settings rows are read or navigate.
- **Nav-link rows** — tap navigates (Manage account, Connected devices, Sign out, Export, Privacy Policy, Terms, Delete account, What's new, Open-source licenses, Subscription).
- **Segmented (`Activation`)** — tap a segment to select PUSH vs TAP.
- **Select (`Input device`)** — opens a picker (not shown).
- **Slider (`Mic sensitivity`)** — drag to set noise-gate threshold (shown 68%).
- **Locked (`Theme`)** — non-interactive; disabled by product decision (dark-only).
- **Back** (mobile AppBar) — returns to previous screen.
- **COPY DIAGNOSTICS** — copies the full diagnostics payload (the SYSTEM INFO + SESSION + recent errors) to clipboard.
- **DOWNLOAD .LOG** (LogFooter / mobile footer) — downloads the error buffer as a `.log` file.
- **Debug Console is read-only** (header states `diagnostics · read-only` / `read-only`) — no edit affordances on any KV row, error row, or flag chip.

---

### 9. Divergence from canonical / design-brief (informational)

The screens are authoritative; these are notes for the consolidation phase.
- **Switch, Avatar, Select, Slider, Locked badge, Segmented are NOT in the canonical kit (§14).** The brief explicitly says *"Do not bring over: … Avatar … Combobox"* and lists no Switch/Select/Slider. These screens introduce a full **Settings primitive set** (SettingsRow, Switch, Select, Slider, FeatureFlagChip, DebugInfoRow, ErrorLogRow, LogFooter, ErrorStateCard) that the canonical library must be widened to include.
- **`SegmentedControl`** exists canonically only as the *view tabs*; here it is reused as a small inline preference toggle (`PUSH`/`TAP`) at a smaller scale — widen its size variants.
- **Font sizes are raw px (14/13/12/11/10).** They map to the named scale roughly as: 14→`--text-body`/`--text-label`, 13→`--text-mono`, 12→`--text-mono-caption`, 11→`--text-micro`, 10→`--text-micro-xs`. Build should bind to the named steps, not literal px.
- **`cornerRadius: 2` on Switch/EnvChip/chips** contradicts the global `--radius: 0` (LOCKED #2 sharp corners). The screens deliberately round the iOS-style switch + chips by 2px; treat the screen as authoritative but flag for token reconciliation.
- **Avatar** uses mono initials at `$primary` on `$card-elevated` — consistent with the single-user note but contradicts "do not bring over Avatar".
- **Mobile vs desktop debug headers diverge:** desktop uses `SecHead` (Tick + bold mono label + Rule); mobile reuses the settings `Eyebrow`. The shared component must support both header treatments or two compositions.
- **Last Error border differs by platform:** desktop = left-only 2px accent bar; mobile = full destructive border. ErrorStateCard needs both an `accent-bar` and `outlined` variant.
- **Recent-errors presentation differs by platform:** desktop renders a 4-column table (ErrorLogRow with fixed cell widths 78/56/86/fill); mobile renders a stacked card list (no LVL column widths). Same data, two layouts.
- **No `closing/closed/not-yet` window-state tokens appear here** — this surface is outside the task-window model, so window-state precedence rules don't apply.

---

### 10. Data / logic contracts

- **Settings values** are live preferences/account facts; only Switch + Segmented + Slider + Select write. The board fixes them as: notifications {push:on, reminders:on, voice-confirm:off, weekly-digest:on}; activation:`PUSH`; mic sensitivity 68%; input device `MacBook Pro Mic`; theme locked `DARK`; accent fixed `#FF6B35`.
- **EnvChip** reflects build environment (`PROD`) + version (`v2.4.1`).
- **Debug Console** is a read-only mirror of runtime/session telemetry: app.version/build/commit/environment/platform/screen/viewport/locale/network/last-sync (SYSTEM INFO); user.id/session.id/auth/feature.flags (SESSION); a ring-buffered error log (`6 / 128` shown of buffer `14:18:02 → 14:32:01`).
- **Feature flags** = boolean map rendered as chips; `ON` => success styling, `OFF` => muted.
- **Error log** = list of `{ time, level: ERR|WARN|INFO, code: OPS-####, message }`; `Last Error` is the most-recent ERR (`OPS-4012`, 14:32:01) surfaced as a banner with an optional stack trace.
- **COPY DIAGNOSTICS** serialises the whole console; **DOWNLOAD .LOG** exports the buffer. Both are client-side actions.
- Counts must stay consistent: header `6 / 128` and footer `last 6 of 128` (desktop) / `last 4 of 128` (mobile, only 4 rows rendered).


# Shake-to-Report Flow (Bug Report / Feature Request)

*scope: Shake-to-Report flow spec*

## Shake-to-Report Flow

**Source board:** `NMzE5__account-settings-legal-manual.json` → section frame **"Shake to Report"** (id `XaNpF` label, board width 1380, vertical, gap 24). The screens on this board are authoritative; divergences from `design-brief.md` are informational only.

This is the most stateful sub-flow in OpsBoard: it lets the operator file a **bug report** or a **feature request** to the build team, attaching auto-captured diagnostics and an optional voice dictation. It is the only place in the otherwise read-only app where free-text user input is created. The flow has two entry idioms — **mobile shake gesture → bottom sheet** and **desktop Help menu / ⌘⇧R → centered modal** — and a shared composer with three send outcomes (sending / success / error-retry).

The section is organized into four labeled rows, each a `Cap` (JetBrains Mono 11, `$muted-foreground`, weight 600, letterSpacing 1.5) plus a horizontal `Screens` frame (gap 30):

- **01 · MOBILE — SHAKE → COMPOSE (over dimmed app · bottom-sheet idiom)** — Shake Prompt, Report Composer, Feature Request
- **02 · MOBILE — SEND STATES** — State · Sending, State · Success, State · Error / Retry
- **03 · DESKTOP — REPORT ENTRY (no shake → help menu → centered modal)** — Desktop Report Entry (Help menu), Desktop Report Modal

All mobile screens are 390×844, clip true, `layout: none` (absolute stacking of an App Backdrop + an Overlay). All desktop screens are 1180×720. The global radius token is **0** (`radius` = 0): every surface, button, badge, and field is square-cornered EXCEPT explicitly rounded primitives (switch track `cornerRadius` 12, switch knob ellipse, the capture Stop button `cornerRadius` 26 → circle, the sheet grabber bar `cornerRadius` 2, toast accent bar). Tokens resolve via `00-variables.json` (e.g. `$primary` = #ff6b35, `$success` = #5ae07a, `$destructive` = #e05a5a, `$card` = #1a1a22, `$card-elevated` = #22222e, `$background` = #0a0a0c).

---

### 1 · MOBILE — Shake Prompt (`blOrx`)

**Purpose:** First touchpoint after the device shake gesture is detected. A modal dialog floating over the live, dimmed board offers two destinations (bug / feature) or a dismiss.

**Layout (top→bottom):**
- **App Backdrop** (`meoIb`, 390×844, fill `$background`, **opacity 0.5**, padding [56,20,40,20], vertical, gap 16): a real board snapshot — Wordmark row (`OPSBOARD` `$primary` JBM 14/700/ls2 + `SYNCED` `$muted-foreground-subtle` JBM 10/500/ls1.5), a Mission card (78h, `$card`, title "AfrikaBurn 2026 · Tankwa Karoo" DM Sans 15/600 + "TARGET: 2026-04-27" JBM 11/500/ls1), then four Task rows (52h, `$card`, gap 12, padding [0,14]) each = 16×16 unchecked checkbox (stroke `$border-hover`, strokeWidth 2) + DM Sans 14 label.
- **Overlay** (`eGLKB`, 390×844, fill **`#0a0a0ce6`** ≈ 90% scrim over background, vertical, gap 14, padding [0,24], centered both axes):
  - **Shake Glyph** (`m3z0Eq`, horizontal, gap 8, centered): lucide `chevrons-left` 14×14 `$primary` + `smartphone` 26×26 `$primary` + `chevrons-right` 14×14 `$primary` — the "device shaking" motif.
  - **Dialog** (`ol8CJ`, fill_container width, `$card`, stroke `$border` 1 inner, vertical, gap 18, padding 24, centered):
    - **Icon Badge** (`dwH3v`, 52×52, `$card-elevated`, stroke `$border` 1) wrapping lucide `vibrate` 24×24 `$primary`.
    - **Heading** (gap 8): Title "Report an error?" (DM Sans 21/600 `$foreground`); Explainer "We felt a shake. Something broken, or an idea worth flagging? Send it straight to the build team." (DM Sans 14/normal `$muted-foreground`, lineHeight 1.45, textAlign center, fill_container).
    - **Actions** (vertical, gap 10):
      - **Report Bug** (`A39cO`, fill_container, 48h, fill `$primary`, gap 9, padding [0,18], centered): lucide `bug` 16×16 `$primary-foreground` + "REPORT A BUG" (JBM 13/600/ls1 `$primary-foreground`).
      - **Request Feature** (`OyPo9`, fill_container, 48h, fill `$secondary`, stroke `$border` 1): lucide `lightbulb` 16×16 `$foreground` + "REQUEST A FEATURE" (JBM 13/600/ls1 `$foreground`).
    - **Footer** (vertical, gap 6, padding-top 6, centered): "DISMISS" (JBM 12/600/ls1.5 `$muted-foreground`) + hint "↻ SHAKE AGAIN TO DISMISS" (JBM 10/500/ls1.5 `$muted-foreground-subtle`).

**States/interactions:** Tap "REPORT A BUG" → Report Composer (bug variant). Tap "REQUEST A FEATURE" → Feature Request composer. Tap "DISMISS" OR shake again → dismiss prompt, return to board. The backdrop board remains read-only and non-interactive while the scrim is up.

---

### 2 · MOBILE — Report Composer (`D6qTpN`) and Feature Request (`RdOj2`)

**Purpose:** Bottom-sheet composer to author the report. Two sibling variants share one structure; they differ only in title/icon, the context block, and the dictation/send copy.

**Backdrop:** identical board snapshot, opacity **0.4** (slightly darker than the prompt's 0.5). The bug-variant Wordmark sync slot reads "OPS-4012 ⚠" (JBM 10/500); the feature-variant reads "IDEA ✦".

**Overlay** (`C8f8K7`, fill `#0a0a0ce6`, vertical, justifyContent **end**, alignItems center) anchors a bottom **Sheet** (`qTLhb`):
- Sheet: fill_container, `$card`, stroke `$border` **top:1 only** (inner), vertical, gap 16, padding **[12,20,26,20]**.
- **Grabber** (`E3yRzf`, centered, padding-bottom 4): a 40×4 bar, fill `$border-hover`, `cornerRadius` 2.
- **Header** (`Vhwgu`, space_between, center):
  - TitleGroup (gap 9): bug variant = lucide `bug` 17×17 `$primary` + "REPORT A BUG" (JBM 14/700/ls1.5 `$foreground`); feature variant = lucide `lightbulb` + "REQUEST A FEATURE".
  - Close (`mBGqn`, 32×32, stroke `$border` 1) wrapping lucide `x` 16×16 `$muted-foreground`.
- **Context Block** (`NyggZ`, fill_container, `$card-elevated`, stroke `$border` 1, vertical, gap 12, padding 14):
  - CtxLabel: lucide `paperclip` 12×12 `$muted-foreground-subtle` + "AUTO-ATTACHED CONTEXT" (JBM 10/600/ls1.5 `$muted-foreground-subtle`).
  - **KV rows** (space_between; key JBM 11/normal/ls1 `$muted-foreground`, value JBM 12/500/ls0.5):
    - Bug variant: **LAST ERROR → `OPS-4012`** (value `$primary`); **SCREEN → Category Board** (`$foreground`); **APP VERSION → 1.4.2 · build 318** (`$foreground`).
    - Feature variant: **REQUEST TYPE → Enhancement**; **SCREEN → Category Board**; **APP VERSION → 1.4.2 · build 318** (all values `$foreground`).
  - Divider (1px `$border`).
  - **Toggle Row**: label group (T DM Sans 13/500 + S JBM 10/normal/ls0.5 `$muted-foreground`) + **Switch** (42×24, `$primary`, `cornerRadius` 12, justify end = ON, knob 18×18 ellipse `$primary-foreground`).
    - Bug: "Include diagnostics" / "logs · device · network trace".
    - Feature: "Attach current view" / "screenshot · active filters · route".
- **Voice Dictation** (`npbW5`, fill_container, `$card-elevated`, **stroke `$primary` 1** — the focused/active accent, vertical, gap 13, padding 16):
  - **VLabel** (space_between): LL = lucide `mic` 15×15 `$primary` + bug "DICTATE YOUR REPORT" / feature "DICTATE YOUR IDEA" (JBM 11/700/ls1.5 `$foreground`); Status = 7×7 ellipse + label. **Recording state shown:** dot `$destructive`, "REC 00:09" (JBM 10/600/ls1 `$destructive`).
  - **Capture** (`tZD5R`, fill_container, gap 14, center): **Stop** button (52×52, fill `$destructive`, `cornerRadius` 26 = circle) wrapping lucide `square` 20×20 `$destructive-foreground`; **WfWrap** (vertical, gap 6) = **Waveform** (36h, gap 3) of **44 vertical bars** 3px wide, heights cycling 8–34px — the first ~25 bars are `$primary` (elapsed/recorded), the trailing ~19 bars are `$muted-foreground-subtle` (not-yet) — plus Hint "TRANSCRIBING LIVE · TAP TO STOP" (JBM 9/500/ls1 `$muted-foreground-subtle`).
- **Description Field** (`s9qPD9`, vertical, gap 7): FLabel "DESCRIPTION" (JBM 11/normal/ls1.5 `$muted-foreground`); **Box** (96h, fill `$background`, **stroke `$primary` 1** = active/focused, padding 12) containing live transcript text (DM Sans 14/normal, lineHeight 1.45) ending in a **`▋` block-cursor glyph**:
  - Bug: "The status filter resets every time I switch categories — selected tags don't stick when I come back to the board.▋"
  - Feature: "It'd help to pin a saved filter set per mission — like "medical only" — so I don't re-select the same tags every time I open the board.▋"
- **Send Report** (`X74K1`, fill_container, 48h, `$primary`, gap 9, padding [0,18], centered): lucide `send` 16×16 `$primary-foreground` + bug "SEND REPORT" / feature "SEND REQUEST" (JBM 13/600/ls1 `$primary-foreground`).

**States/interactions:** Tap Stop → end recording (transitions to "done/transcript attached" capture state, see Sending below). Switch toggle → include/exclude diagnostics (or attachments). Edit description (text input). Close (`x`) → dismiss sheet. Tap Send Report → enters Sending state.

---

### 3 · MOBILE — Send States (row 02)

**State · Sending (`Rz2xi`).** Backdrop opacity 0.4; Wordmark sync = "SENDING…". The same composer Sheet is shown but now reflects a **finished recording**:
- Voice Dictation Status: **dot `$success`** (7×7), label "DONE · 0:14" (NOTE: label fill is `$destructive` in the data — see open items). Capture Stop button fill `$success` (`cornerRadius` 26), icon swapped to lucide **`check`** 20×20 (`$destructive-foreground`). Waveform identical 44-bar pattern. Hint changes to "TRANSCRIPT ATTACHED" (JBM 9/500/ls1 **`$success`**).
- Description Box stroke reverts to **`$border`** (no longer focused/active `$primary`), transcript text loses the `▋` cursor: "The status filter resets every time I switch categories — selected tags don't stick when I come back to the board."
- **Send Report** button: icon swapped to lucide **`loader-circle`** 16×16 `$primary-foreground`, label "SENDING REPORT…" (JBM 13/600/ls1). Button remains `$primary` (implies disabled-but-styled-active / spinner state).

**State · Success (`Zy2pG`).** Backdrop opacity **0.6** (sheet has dismissed). A top-anchored **Toast** is shown over an **Overlay** (`yKx5U`, fill **`#0a0a0c80`** ≈50% scrim, padding [64,16,0,16], alignItems center) — the same scrim value as the Error toast overlay (see below):
- **Toast** (`YSg6I`, fill_container, `$card`, stroke `$border` 1, vertical):
  - **Accent** bar (`RXt92`, fill_container × **2px**, fill **`$success`**) — the bespoke top accent stripe.
  - **Body** (vertical, gap 12, padding 16):
    - HeadRow (space_between): H "✓ REPORT SENT" (JBM 13/700/ls1 **`$success`**); Auto "AUTO-DISMISS · 4S" (JBM 10/normal/ls1 `$muted-foreground-subtle`).
    - Msg "Thanks — the build team has your bug report and the attached diagnostics." (DM Sans 13/normal `$foreground`, lineHeight 1.45, fill_container).
    - **RefRow** (`D8oJsG`, fill_container, `$card-elevated`, stroke `$border` 1, padding [10,12], space_between): L = lucide `hash` 13×13 `$muted-foreground` + "REFERENCE" (JBM 10/normal/ls1.5 `$muted-foreground`); V = **`OPS-R-2291`** (JBM 13/700/ls1 **`$primary`**) — the assigned reference number.

**State · Error / Retry (`WzxLm`).** Backdrop opacity 0.6; Wordmark sync = "OFFLINE ⚠"; backdrop shows a fuller board (8 task rows incl. "Convoy roster — finalise"). Overlay (`LMEXD`) fill is the **`#0a0a0c80`** (≈50%) scrim — identical to the Success toast overlay (`yKx5U`); both toast states share this lighter ~50% scrim (distinct from the prompt/composer/modal `#0a0a0ce6` ≈90% scrim). Padding [64,16,0,16], top-anchored:
- **Toast** (`h4S6mx`, `$card`, stroke `$border` 1, vertical):
  - **Accent** bar (`Iv05k`, 2px, fill **`$destructive`**).
  - **Body** (gap 12, padding 16):
    - HeadRow: H "COULDN'T SEND" (JBM 13/700/ls1 **`$destructive`**); Q "QUEUED" (JBM 10/normal/ls1 `$muted-foreground-subtle`).
    - Msg "No connection. Your report is saved as a draft and will auto-retry when you're back online." (DM Sans 13/normal **`$muted-foreground`**, lineHeight 1.45).
    - **Actions** (horizontal, gap 10):
      - **Retry** (`oZe3B`, fill_container, **44h**, `$primary`, gap 8, padding [0,16], center): lucide `refresh-cw` 15×15 `$primary-foreground` + "RETRY NOW" (JBM 12/600/ls1 `$primary-foreground`).
      - **Dismiss** (`Wzqip`, fill_container, 44h, `$secondary`, stroke `$border` 1): "SAVE DRAFT" (JBM 12/600/ls1 `$foreground`).

---

### 4 · DESKTOP — Report Entry (`B8O1uh`)

**Purpose:** Desktop has no shake gesture; the report composer is reached via the Help menu or ⌘⇧R.

- **Top Bar** (`Ddm23`, 1180×56, `$card`, stroke `$border` bottom:1, padding [0,24], space_between): Left = "OPSBOARD" (JBM 15/700/ls2 `$primary`) + Nav ("BOARD" active `$foreground` 600, "TIMELINE"/"DEPENDENCIES" `$muted-foreground` normal, all JBM 12/ls1); Right = Sync pill (`$card-elevated`, stroke `$border` 1, padding [6,12]: 7×7 `$success` dot + "SYNCED" JBM 10/600/ls1.5 `$muted-foreground`), **Help Btn** (`nciM1`, 34×34, fill `$accent`, **stroke `$primary` 1** = active/open) wrapping lucide `info` 17×17 `$primary`, Avatar (34×34, `$primary`, "RN" JBM 12/700 `$primary-foreground`).
- **Board Ghost** (`cEX7N`, opacity **0.5**, below top bar) — dimmed board skeleton (mission title + MEDICAL etc. columns of ghosted 48h task rows with 14×14 checkboxes and 120×8 `$muted-foreground-subtle` line placeholders).
- **Help Menu** (`Hd...` id, anchored absolutely at **x 874, y 62**, just under the Help Btn): width **282**, `$popover`, stroke `$border` 1, **shadow** (outer, `#00000099`, offset y 8, blur 24), vertical, padding [6,0]:
  - Section header "HELP" (JBM 10/600/ls2 `$muted-foreground-subtle`, padding [8,16,4,16]).
  - Items (each fill_container, padding [10,16], space_between; icon 15×15 `$muted-foreground`, label DM Sans 14/normal `$foreground`):
    - "Keyboard shortcuts" (`command`) + shortcut "?" (JBM 11 `$muted-foreground-subtle`).
    - "Documentation" (`book-open`).
    - "What's new" (`sparkles`).
    - Separator (1px `$border`).
    - **"Report an issue"** (`S7cu9w`) — **highlighted/active row**: fill `$accent`, lucide `bug` 15×15 **`$primary`**, label DM Sans 14/**600** **`$primary`**, trailing shortcut "⌘⇧R" (JBM 11 `$muted-foreground-subtle`).
    - "Contact support" (`life-buoy`).
- **Note** annotation (`Y7pLWA`, x 874 y 300, 282w, `$card-elevated`, stroke `$border` **left:2**, padding 12): "NO SHAKE ON DESKTOP" (JBM 9/600/ls1.5 `$muted-foreground-subtle`) + "Open Help → Report an issue, or press ⌘⇧R to launch the same composer." (DM Sans 12/normal `$muted-foreground`).

**Interactions:** Click Help Btn → opens Help Menu. Click "Report an issue" OR press **⌘⇧R** → opens Report Modal.

---

### 5 · DESKTOP — Report Modal (`jwuPw`)

**Purpose:** The same composer as the mobile sheet, presented as a centered modal dialog over a heavily-ghosted board.

- **Board Ghost** (`HL7ni`, opacity **0.32** — darker than the help-menu entry's 0.5) behind the modal.
- **Overlay** (`...`, 1180×720, fill `#0a0a0ce6`, padding 24, justify+align **center**): centers the modal.
- **Modal Composer** (`wetlH`): **fixed width 440** (not full-bleed), `$card`, stroke `$border` 1, vertical, gap 16, padding [12,20,26,20].
  - **Grabber** is present in the tree but **`enabled: false`** (positioned x20 y12, width "fill_container(350)") — the mobile drag-affordance is retained-but-disabled on desktop.
  - Header / Context Block / Toggle / Voice Dictation / Description / Send Report are **identical in content and tokens to the mobile bug composer**: "REPORT A BUG" title; LAST ERROR `OPS-4012` / SCREEN Category Board / APP VERSION 1.4.2 · build 318; "Include diagnostics" switch ON; Voice Dictation in **recording state** (dot `$destructive`, "REC 00:09", Stop 52×52 `$destructive` circle, 44-bar waveform, "TRANSCRIBING LIVE · TAP TO STOP"); Description Box stroke `$primary` with `▋` cursor; Send Report = `send` icon + "SEND REPORT".

**Interactions:** Same as mobile composer (Stop, toggle, edit, close `x`, Send). On send it follows the same Sending → Success/Error outcomes (the success/error toasts are only drawn for mobile in this board, but the contract is shared).

---

### Data & logic contracts

- **Trigger:** mobile = accelerometer shake detection (debounced; "shake again to dismiss"); desktop = Help → Report an issue, or global shortcut **⌘⇧R**. Both open the **same composer**.
- **Report type:** `bug | feature`. Type drives header icon/title (`bug`/`lightbulb`, "REPORT A BUG"/"REQUEST A FEATURE"), context-block keys, dictation label ("…YOUR REPORT"/"…YOUR IDEA"), send label ("SEND REPORT"/"SEND REQUEST"), and success-toast copy.
- **Auto-attached context (read at open):** bug → `lastErrorCode` (e.g. OPS-4012), `currentScreen` (Category Board), `appVersion` (1.4.2 · build 318). feature → `requestType` (Enhancement), `currentScreen`, `appVersion`.
- **Diagnostics/attachment toggle:** boolean, default **ON**. bug = "Include diagnostics" (logs · device · network trace); feature = "Attach current view" (screenshot · active filters · route).
- **Voice dictation:** recording state with elapsed timer ("REC 00:09"); on Stop → transcript finalized, status "DONE · 0:14", capture button turns `$success`+`check`, hint "TRANSCRIPT ATTACHED". Live transcript streams into the Description field with a `▋` cursor; cursor removed once dictation stops.
- **Description:** free-text, prefilled by transcription, editable.
- **Send pipeline:** `idle → sending → success | error`. Sending = button label "SENDING REPORT…" + `loader-circle` (spinner); Wordmark sync shows "SENDING…".
- **Success:** server assigns a **reference number** (`OPS-R-2291`), shown in toast RefRow; toast **auto-dismisses after 4s**.
- **Error (offline/network):** report is **saved as a draft + queued**, will **auto-retry** when online; toast offers **RETRY NOW** (immediate re-send) and **SAVE DRAFT** (dismiss/keep queued). Wordmark sync shows "OFFLINE ⚠".
- **Bespoke Toast contract:** a `$card` surface with a **2px top Accent bar** colored by severity (`$success` for sent, `$destructive` for error), a HeadRow (status H left + meta right: "AUTO-DISMISS · 4S" / "QUEUED"), a body Msg, and either a RefRow (success) or an Actions row (error). Square corners.

### Window-state / read-only note
This flow is the sole authoring surface in an otherwise read-only app; it does not touch task/mission window-state. Backdrops are presentational ghosts of the live board and are non-interactive while a scrim/sheet/modal/toast is up.

# Legal & In-App Manual (Privacy / Terms / Legal Index + Manual desktop & mobile)

*scope: Legal + Manual (board NMzE5)*

## Legal & In-App Manual — Functional Spec

Board `NMzE5` (`OpsBoard — Account · Settings · Legal · Manual`). This section covers two of the board's five areas: **Legal & Typography** (`#kab1h`) and **Manual** (`#NrgXn`). All surfaces are READ-ONLY presentation screens; the only stateful interaction in scope is the documented (non-functional, illustrative) tap target inside the Manual's Live demos. Tokens resolve via `00-variables.json`. `radius = 0` globally; only pills/dots use `cornerRadius: 999`.

> **Source-of-truth note:** the screens as laid out are authoritative. Where a flattened screen rendering diverges from the canonical 82-component library, the screen wins and the canonical contract must widen. Divergences are catalogued in `component_usages` and `open_items`.

---

### A. LEGAL PAGES

Three documents × two breakpoints = six surfaces: Privacy (desktop `#TtQZB` / mobile `#EFxCk`), Terms (desktop `#Z2RjI` / mobile `#S8buy8`), Legal Index (desktop `#KLmsX` / mobile `#b31uT`). Desktop pages live under `Desktop Pages #faIIU` (label `DESKTOP · LEGAL PAGES`); mobile pages under `Mobile Pages #jtgVe` (label `MOBILE · 390PX`, all `width: 390`).

#### A.1 Purpose
Plain-language legal center. Privacy and Terms are long-form numbered articles; the Index is a 3-row directory linking out to Privacy, Terms, and Open-Source Licenses. Read-only; the only affordances are chrome navigation (Back to app, Close ✕, document rows, mailto links) — none are wired in the static screens.

#### A.2 Legal TopBar (article pages + index, desktop & mobile)
Every legal page is a vertical frame, `fill: $background`, opened by a sticky-style **TopBar**.

**Desktop TopBar** (`#OKhhk` etc.): `stroke: $border` `strokeWidth: {bottom: 1}`, `padding: [18, 40]`, `width: fill_container`, space-between row.
- **Left** (`gap: 16`): **Wordmark** = `OPS` (`$primary`, JetBrains Mono, 18/700, letterSpacing 3) + `BOARD` (`$muted-foreground`, same) · vertical **Sep** rect (`$border`, 1×18) · **Tag** mono eyebrow (`$muted-foreground-subtle`, 11/600, letterSpacing 2) = `LEGAL / PRIVACY` | `LEGAL / TERMS` | `LEGAL / INDEX`.
- **Right** (`gap: 14`): **Back** button (Privacy/Terms only — absent on Index) = bordered chip `stroke: $border` `strokeWidth: 1`, `gap: 8`, `padding: [8, 12]`, lucide `arrow-left` 14px (`$muted-foreground`) + label `BACK TO APP` (mono 11/600, letterSpacing 1.5, `$muted-foreground`). **Close** = 32×32 bordered square, lucide `x` 16px (`$muted-foreground`).

**Mobile TopBar** (`#opAGb` etc.): `padding: [14, 16]`, `strokeWidth: {bottom: 1}`. Left (`gap: 12`) = lucide `arrow-left` **Back** 18px (`$muted-foreground`) + Wordmark (mono 15/700, letterSpacing 2). **Close** = 30×30 bordered square, lucide `x` 15px. (Mobile drops the Sep rule, the `LEGAL / …` tag, and the labelled "BACK TO APP" chip — back is icon-only.)

#### A.3 Legal article body (Privacy & Terms)
**Desktop Body** `#I4bW5q`: `padding: [64, 40, 96, 40]`, holds a centered **ReadingColumn** `width: 700`, `layout: vertical`, `gap: 30`.
**Mobile Body** `#VwhhB`: `layout: vertical`, `gap: 24`, `padding: [24, 18, 44, 18]`, full-width column (no fixed reading width).

**PageHead** (vertical; desktop `gap: 18`, mobile `gap: 14`):
- **Eyebrow** (`gap: 8`): 6×6 `$primary` **Tick** square + mono eyebrow `$muted-foreground-subtle`. Privacy/Terms eyebrow = `LAST UPDATED 2026-06-03`; Index eyebrow = `OPSBOARD · LEGAL CENTER`. Desktop 11/600 letterSpacing 2; mobile 10/600 letterSpacing 1.5.
- **Title** (DM Sans, 700; desktop 44/lineHeight 1.1, mobile 30/lineHeight 1.12, `$foreground`).
- **Lead** (DM Sans normal, `$muted-foreground`; desktop 18/lineHeight 1.6, mobile 15/lineHeight 1.55). Lead copy is shortened on mobile.

A 1px **Rule** rect (`$border`, full-width) separates head from sections (present desktop+mobile Privacy/Terms; **absent** on Index where DocList follows head directly).

**LegalSection (§NN)** — the repeated article unit. Each is `layout: vertical`, `width: fill_container`; desktop `gap: 14`, mobile `gap: 12`.
- **H2 row** (`gap` desktop 14 / mobile 10): **NumW** wrapper `padding: [5,0,0,0]` (mobile `[3,0,0,0]`) holding **Num** = `§01`…`§09` (JetBrains Mono, `$primary`, 700, letterSpacing 1; desktop 14, mobile 12) + **Ttl** heading (DM Sans 600, `$foreground`, lineHeight 1.2; desktop 24, mobile 20).
- **Body** (vertical, gap matches section): a mix of **P** paragraphs, **H3** sub-headings, **List**s, and **Callout**s.
  - **P**: DM Sans normal, `$foreground`; desktop 16/lineHeight 1.65, mobile 15/lineHeight 1.6.
  - **H3** (Privacy §02 only): DM Sans **700**, `$foreground`, 16/lineHeight 1.4 — `Account data`, `Mission content`, `Voice recordings & transcripts`, `Diagnostics`.
  - **List**: vertical, desktop `gap: 9` / mobile `gap: 8`. Each **LI** = `Mk` marker wrapper `padding: [9,0,0,0]` (mobile `[8,0,0,0]`) holding a **square** bullet `$primary` (desktop 6×6, mobile 5×5) + **T** text (DM Sans normal, `$foreground`; desktop 16/lineHeight 1.6, mobile 15/lineHeight 1.55). NB legal-list bullets are **`rectangle`** squares, distinct from the Manual's **`ellipse`** dot bullets.
  - **Link**: standalone DM Sans, `$primary` (e.g. `privacy@opsboard.app`, `legal@opsboard.app`, `opsboard.app/legal/subprocessors`). No underline/hover modeled.

**Privacy section map** (desktop §01–§09; mobile same §01–§09 with condensed copy): §01 Overview · §02 Data We Collect (desktop has 4 H3 + an `info` Callout; mobile collapses to one P + Callout) · §03 How We Use It (5-item list desktop / 4-item mobile) · §04 Data Retention & Deletion (list + `warning` Callout) · §05 Third-Party Services (list desktop / inline P mobile + subprocessors Link) · §06 Your Rights (list desktop / P mobile) · §07 Children · §08 Changes to This Policy · §09 Contact (`privacy@opsboard.app`). Mobile §04 title shortens to `Retention & Deletion`, §08 to `Changes`.

**Terms section map** (desktop §01–§08; mobile §01–§08): §01 Acceptance · §02 The Service · §03 Acceptable Use (4-item "you agree not to" list) · §04 Your Content · §05 Disclaimers (`warning` Callout + P) · §06 Limitation of Liability (mobile title `Liability`) · §07 Changes & Termination · §08 Contact (`legal@opsboard.app`).

**CodeCallout / admonition Callout** (the legal "callout" boxes, two tones):
- `info`/primary tone (Privacy §02 voice block): `fill: #ff6b351f`, `stroke: $primary` `strokeWidth: {left: 2}`, `gap: 12` (mobile 10), `padding: 16` (mobile 14). lucide `shield` icon (desktop 18 / mobile 16, `$primary`) + **Col** (vertical, gap 6/5): **Title** mono 700 `$primary` letterSpacing 1 (desktop 12 / mobile 11) + **Body** DM Sans normal `$foreground` (desktop 14/lineHeight 1.55 / mobile 13/lineHeight 1.5). Title `VOICE RECORDINGS & TRANSCRIPTS`.
- `warning` tone (Privacy §04, Terms §05): identical geometry, `fill: #d9a73e1f`, `stroke: $warning`, lucide `triangle-alert` icon `$warning`, Title `$warning`. Titles: `ACCOUNT DELETION IS PERMANENT` / `DELETION IS PERMANENT` (mobile) · `OPSBOARD IS A PLANNING TOOL` / `A PLANNING TOOL, NOT ADVICE` (mobile).

#### A.4 Legal Index (LegalIndexRow / NavRow)
**Desktop** `#KLmsX`: Body `padding: [64,40,96,40]`, ReadingColumn `width: 700`, `gap: 32`. PageHead (eyebrow `OPSBOARD · LEGAL CENTER`, Title `Legal`, Lead). **DocList** `#kCF23` (vertical, no gap — rows share borders to form one stacked table).
- **NavRow** (3 rows): `fill: $card`, `gap: 20`, `padding: [18, 20]`, `width: fill_container`. **First** row carries full `strokeWidth: 1`; rows 2–3 carry `strokeWidth: {right:1, bottom:1, left:1}` (top border omitted to avoid doubling). Each row = **Col** (vertical, gap 5): **Ttl** (DM Sans 600, `$foreground`, 17) + **Desc** (DM Sans normal, `$muted-foreground`, 13/lineHeight 1.4); and **Right** (`gap: 16`): **Date** mono pill (`$muted-foreground-subtle`, 11/600, letterSpacing 1) + lucide `chevron-right` 18px (`$muted-foreground`).
- Rows: **Privacy Policy** (`UPD 2026-06-03`) · **Terms of Service** (`UPD 2026-06-03`) · **Open-Source Licenses** (`UPD 2026-05-12`).
- **Foot** `#D4TOkz` (`gap: 8`): `Need help? Contact` (`$muted-foreground-subtle`, DM Sans 14) + `legal@opsboard.app` (`$primary`, DM Sans 14).

**Mobile** `#b31uT`: Body `gap: 24`, `padding: [24,18,44,18]`; **no Rule**. NavRow layout differs structurally — `gap: 14`, `padding: 16`, and the **Date moves inside Col** (stacked under Desc: Ttl 16/600 + Desc 12/lineHeight 1.4 + Date mono 10/600) with a **single** trailing lucide `chevron-right` 18px as Col's sibling (not wrapped in a "Right" group). Same border-stacking rule (first row full, rest omit top). Foot `gap: 7`, 13px text.

---

### B. MANUAL

`Manual #NrgXn` — two surfaces: **Manual — Desktop** `#UdCR4` (fixed `width: 1320`, `height: 1900`, `stroke: $border` `strokeWidth: 1`) and **Manual — Mobile** `#bnRmc` (`width: 390`). The rendered article on both is the **"Task cards"** page (CORE CONCEPTS / 03) — chosen because it embeds the three Live demos.

#### B.1 Purpose
In-app documentation reader. Desktop = persistent left **TOC sidebar** + scrollable article + header **Search**. Mobile = sticky **SectionNav chip** strip + single article column. The article teaches the board's core concepts and embeds **Live component demos** (rendered, illustrative instances of TaskCard, StatusCycleButton, WindowState pills) so the reader sees the real UI inline.

#### B.2 Manual Header
**Desktop Header** `#pB4R8`: `fill: $muted`, `strokeWidth: {bottom:1}`, `padding: [18, 28]`, space-between. **Left** (`gap: 14`): Wordmark `OPS`/`BOARD` (mono 15/700, letterSpacing 3) · 1×18 `Div` rect (`$border`) · **Crumb** `MANUAL` (mono `$muted-foreground`, 12/700, letterSpacing 2). **Search** field `#CLcFP` (right): `fill: $background`, `stroke: $border` `strokeWidth: 1`, `gap: 8`, `padding: [8, 12]`, `width: 240`; lucide `search` 14px (`$muted-foreground-subtle`) + placeholder `Search the manual…` (DM Sans normal, `$muted-foreground-subtle`, 13). Read-only placeholder — no input state modeled.

**Mobile Header** `#ujjb4`: `fill: $muted`, `padding: [14, 16]`, space-between. Left (`gap: 10`): lucide `chevron-left` Back 18px (`$muted-foreground`) + Crumb `MANUAL` (mono **`$foreground`**, 12/700, letterSpacing 2). Trailing: lucide `x` Close 18px. **No Search field** on mobile.

#### B.3 Desktop TOC sidebar (ManualTOCItem)
**TOC** `#yAnTD`: `fill: $muted`, `strokeWidth: {right:1}`, `layout: vertical`, `gap: 2`, `padding: [22, 12, 22, 16]`, `width: 268`, full height. Two labelled groups:
- **Group label** `Grp`/`Grp2` (mono `$muted-foreground-subtle`, 10/700, letterSpacing 2): `CORE CONCEPTS` and `INPUT`. Spacers: 8px after a group label, 18px between groups (`Sp`/`Sp2`/`Sp3`).
- **ManualTOCItem** rows: `width: fill_container`, `strokeWidth: {left: 2}`, `padding: [9, 12]`, single **L** label (DM Sans 14).
  - **Inactive** (default): `fill: #00000000`, `stroke: #00000000` (transparent left rule), label `$muted-foreground` 14/normal.
  - **Active** (`Task cards` `#tvaRu`): `fill: #ff6b351f`, `stroke: $primary` left rule, label `$primary` 14/**600**.
  - Items: CORE CONCEPTS → Getting started, Missions, **Task cards (active)**, Status cycle, Window states, Categories. INPUT → Voice commands, AI research, Timeline, Dependencies.

#### B.4 Mobile SectionNav (SectionNavChip)
**SectionNav** `#m6S1vq`: `fill: $muted`, `strokeWidth: {bottom:1}`, `gap: 8`, `padding: [10, 16]`, horizontal chip row (scrollable).
- **SectionNavChip**: pill, `cornerRadius: 999`, `padding: [5, 11]`, label mono letterSpacing 0.5, 11px.
  - **Inactive**: `fill: #00000000`, `stroke: $border` `strokeWidth: 1`, label `$muted-foreground` **500**.
  - **Active** (`Task cards` `#T5qoy`): `fill: #ff6b351f`, `stroke: $primary` `strokeWidth: 1`, label `$primary` **700**.
  - Chips: **Task cards (active)**, Status, Windows, Voice. (Condensed 4-chip subset vs. the 10-item desktop TOC.)

#### B.5 Article content (CORE CONCEPTS / 03 — Task cards)
**Desktop Article** `#oBMh2`: `padding: [48, 72]`, holds **Doc** `#KXru3` (vertical, `gap: 22`, `width: 744`).
**Mobile Article** `#mOLts`: `layout: vertical`, `gap: 18`, `padding: [20, 18, 28, 18]`, full-width (no Doc wrapper — children flat).

Top-down content order (identical on both, sizes differ):
1. **Eyebrow** `CORE CONCEPTS / 03` (mono `$primary`, 700, letterSpacing 2; desktop 11 / mobile 10).
2. **H1** `Task cards` (DM Sans 700, `$foreground`, lineHeight 1.15; desktop 34 / mobile 28).
3. **Lead** (DM Sans normal, `$muted-foreground`, desktop 16/lineHeight 1.6 / mobile 15/lineHeight 1.55; mobile copy is shortened).
4. **H2a** `Anatomy` (DM Sans 700, `$foreground`, lineHeight 1.3; desktop 21 / mobile 19).
5. (desktop only) **Pa** intro paragraph `Every card is built from four parts…` (DM Sans normal `$muted-foreground` 15).
6. **List** (bulleted, 4 items) — the four card parts. Bullets are **`ellipse` Dots** 6×6 `$primary` in a `D` wrapper (`padding [9,0,0,0]` desktop / `[8,0,0,0]` mobile, `width 12`/`10`), text DM Sans normal `$muted-foreground` (desktop 15/lineHeight 1.55 / mobile 14/lineHeight 1.5): Status cycle button (the only direct interaction) · Task name · Category tag (colour+icon+label) · Window-state pill.
7. **Live TaskCard** demo (see B.6).
8. **H2** `Status cycle` + **P** explaining the square is the one direct interaction; cycles not-started→in-progress→done wrapping; "always enabled: window state and blocking are advisory, never gating."
9. **Live StatusCycleButton** demo (see B.6).
10. **H2** `Window states` + **P**: "open, closing, closed, blocked, or not-yet… colour, icon and label together… The word 'overdue' is never used."
11. **Live WindowState pills** demo (see B.6).
12. **H2** `Drive it by voice` + **P** (scope-then-speak).
13. **CodeCallout** (the voice example block).

**CodeCallout** (`#f6foC` desktop / `#SBTke` mobile): `fill: $card-elevated`, `stroke: $primary` `strokeWidth: {left: 2}`, `layout: vertical`, `gap: 5`, `padding: 16` (mobile 14). Mono lines `width: fill_container`, lineHeight 1.6, 12.5px (mobile 12): comment line `// scope, then speak` (`$muted-foreground-subtle`, 500), command line(s) (`$foreground`, 500), a blank line, then result lines (`$success`, 600) prefixed `→`. Desktop: `"AfrikaBurn 2026 — mark renew insurance as done"` → `→ OpsBoard finds the task inside the mission` / `→ cycles its status to DONE. No typing, no forms.` Mobile condenses to `"AfrikaBurn — mark insurance done"` → `→ resolves the task in-mission` / `→ cycles status to DONE.`

#### B.6 Live component demos (ManualLiveBlock) — PRIME DRIFT SOURCES
Each demo is a **ManualLiveBlock**: `fill: $muted`, `stroke: $border` `strokeWidth: 1`, `layout: vertical`, `width: fill_container`. A **Bar** header (`fill: $card-elevated`, `strokeWidth: {bottom:1}`, `gap: 7`/6, `padding: [9,14]`/`[8,12]`) = lucide `box` icon (`$primary`, 13px desktop / 12px mobile) + mono label (`$muted-foreground`, 700, letterSpacing 1.5; 10px desktop / 9px mobile) reading `LIVE COMPONENT · {Name}`. Below sits a **Stage** (`padding: 28` desktop / `16` mobile) holding a flattened, hardcoded instance of the documented component.

**(i) Live TaskCard** (`#ecVk8` desktop / `#qQucY` mobile) — label `LIVE COMPONENT · TaskCard`.
Stage renders one **Task** row: `fill: $card`, `stroke: $warning` `strokeWidth: {left: 2}` (card carries the *closing* window-state border treatment), `gap: 14`/12, `padding: 16`/14, full-width.
- **Touch** target frame 24×24 (desktop) / 22×22 (mobile) containing a **Cycle** square = the in-progress glyph: `fill: #ff6b351f`, `stroke: $primary` `strokeWidth: 2`, 18×18, with an 8×8 `$primary` **F** fill square inside (desktop). (On mobile the Touch is 22×22 and the inner Cycle/fill is omitted in the extract — flattened empty.)
- **Body** (vertical, gap 10/8): **Name** `Renew travel insurance policy` (DM Sans **500**, `$foreground`; 16 desktop / 15 mobile) + **Meta** row (`gap: 8`) of two pills:
  - **Category pill** (BUREAUCRATIC): `fill: #5aa0e01f`, `cornerRadius: 999`, `gap: 5`/4, `padding: [4,9]`/`[3,8]`, lucide `file-text` icon (`#5aa0e0`, 12/11px) + label `BUREAUCRATIC` (mono 600, letterSpacing 0.5, `#5aa0e0`; 11/10px).
  - **Window pill** (CLOSING): `fill: #d9a73e1f`, lucide `timer` icon (`#d9a73e`) + label `CLOSING · T-5d` (mono 600, `#d9a73e`).

**(ii) Live StatusCycleButton** (`#VMLDM` desktop / `#zf4O0` mobile) — label `LIVE COMPONENT · StatusCycleButton`.
Stage `gap: 18`/14, holds a **States** row (`gap: 36` desktop / full-width mobile) of **three** labelled state columns (vertical, gap 12/10): a Touch target (30×30 desktop / 28×28 mobile) + mono label (`$muted-foreground`, 700, letterSpacing 1/0.5; 10/9px).
- **NOT STARTED**: Cycle 18×18, `fill: #00000000`, `stroke: $border` `strokeWidth: 2` (empty square).
- **IN PROGRESS**: Cycle `fill: #ff6b351f`, `stroke: $primary` `strokeWidth: 2`, inner 8×8 `$primary` fill square.
- **DONE**: Cycle `fill: $success`, `stroke: $success` `strokeWidth: 2`, lucide `check` icon 12px filled `$primary-foreground` (the near-black check on the green square).

**(iii) Live WindowState pills** (`#f3F9a` desktop / `#Itp95` mobile) — label `LIVE COMPONENT · WindowState pills`.
Stage `gap: 18`/14. **Five** rows, each pairing a pill (in a fixed-width `PW`/`PR` slot — desktop `width: 188`; mobile stacked vertical `gap: 5`) with a DM Sans description (`$muted-foreground`, 14/lineHeight 1.45 desktop / 13/lineHeight 1.4 mobile). All pills `cornerRadius: 999`, `gap: 5`/4, `padding: [4,9]`/`[3,8]`, label mono 600 letterSpacing 0.5 (11/10px). Enumerated states + exact values:

| State | Pill fill | Icon (lucide) | Icon+label colour | Label | Description |
|---|---|---|---|---|---|
| OPEN | `#7a7a8e1f` | *(none)* | `#7a7a8e` | `OPEN` | "Healthy. On a real card no pill is shown — absence means fine." |
| CLOSING | `#d9a73e1f` | `timer` | `#d9a73e` | `CLOSING · T-5d` | "The window closes within seven days." |
| CLOSED | `#7a7a8e1f` | `circle-x` | `#7a7a8e` | `WINDOW CLOSED` | "Past the cliff. The task name is struck through — never 'overdue'." |
| BLOCKED | `#7a7a8e1f` | `triangle-alert` | `#7a7a8e` | `BLOCKED` | "Waiting on a dependency to finish first." |
| NOT YET | `#4a4a5e1f` | `lock` | `#4a4a5e` | `NOT YET` | "Can't begin before its not-before date." |

`#7a7a8e` = `$muted-foreground`; `#4a4a5e` = `$muted-foreground-subtle`; `#d9a73e` = `$warning`; the `…1f` suffix = 12% alpha tint. Mobile descriptions are shortened ("Window closes within seven days." / "Waiting on a dependency." / "Healthy. No pill shown on a real card.").

---

### C. DATA & LOGIC CONTRACTS
- **Legal content** is fully static authored copy keyed by document (`privacy` | `terms` | `licenses`) and locale-neutral; `LAST UPDATED` and `UPD` dates are literal strings (`2026-06-03` for Privacy/Terms, `2026-05-12` for Licenses). The Index `Open-Source Licenses` row links to a doc not authored as its own screen in scope.
- **No editing anywhere** — every legal/manual surface is read-only. Back/Close/links/rows/Search are navigation affordances with no modeled active/hover/focus states.
- **Live demos are illustrative, not interactive** in the manual context: the StatusCycleButton glyphs are fixed exemplars of the three statuses, and the WindowState pills are fixed exemplars of the five window states. They mirror the *real* board components' state model (status: not-started/in-progress/done cycling+wrapping; window: open/closing/closed/blocked/not-yet computed live) but do not cycle here.
- **Window-state model echoed by the manual** (must stay consistent with the board): window state is computed, never stored, from `too_late_by` cliff + `not_before` + dependency graph; `CLOSING_THRESHOLD_DAYS = 7`; "overdue" is forbidden — past-cliff = `WINDOW CLOSED` with strikethrough name. `blocked` is derived from the dependency graph, not stored.
- **Status guard rule echoed by the manual**: the StatusCycleButton is *always enabled*; window state and blocking are advisory, never gating.
- **Category mapping shown**: BUREAUCRATIC ↔ `$cat-bureaucratic` (`#5aa0e0`) + lucide `file-text` icon.

### D. INTERACTIONS (modeled / implied)
- Legal TopBar **Back** → returns to app; **Close ✕** → dismisses legal stack. Article **Link**s → mailto/URL.
- Legal Index **NavRow** → tap navigates to the corresponding document (chevron affordance). Footer mailto link.
- Manual desktop **Search** → filters manual (placeholder only, behavior not modeled). **ManualTOCItem** tap → scroll/select section; exactly one active at a time (orange left-rule + tint + bold + `$primary` label).
- Manual mobile **SectionNavChip** tap → jump to section; exactly one active (orange fill+border, label 700 `$primary`). Header **Back/Close**.
- The desktop/mobile Live demos imply the documented board interactions but are non-functional here.


## Open items (this board)

- $info resolves to #ff6b35 (== $primary, orange) — the Delete History 'REMOVED' alert is an orange info alert, not blue; confirm this is intentional vs a token mistake.
- Raw-hex tints used instead of tokens throughout: #e05a5a1f, #e05a5a0d, #ff6b351f, #ff6b350f, #d9a73e1f, #5ae07a1f — reconcile to destructive/warning/success/primary alpha tokens.
- Field height drift: account/sign-in/type-to-confirm Fields render at h:42, but canonical Cmp·TextInput is 40px. Pick one.
- AccountProfileSummary reintroduces an initials avatar that design-brief §5/§14 excluded for the single-user MVP ('avatars (none in MVP)'). Screen is authoritative → avatar stays as a P2 extension; flag the brief conflict.
- TypeToConfirmField only renders the matched state on screen; empty and partial-mismatch ($destructive help) states are described by the canonical def but not pictured — confirm styling for those.
- Delete History canonical variant list (7d/30d/90d/all) differs from the screen (7d/30d/6mo/1yr/all-time, 5 options); the canonical component option set must be widened to match the screen.
- Sign-out appears in two places (Account SESSION row, and Delete Account done-state 'SIGN OUT' button) — confirm they share one action.
- Password/Passkey/Two-Factor rows in Account (Sec PASSWORD & SECURITY) are adjacent to the requested scope; documented structurally but their dedicated flows (change password, manage passkey, enable 2FA) are out of this section's scope.
- Mobile Delete Account *confirm* artboard uses $border stroke while the desktop confirm card uses $destructive stroke — confirm whether the destructive card border should also apply on mobile.
- The 'x' dismiss icon and 'CANCEL' button coexist on confirm cards — confirm both route to the same cancel/exit.
- Canonical kit must be widened to add: SettingsRow, Switch, Select, Slider, Locked badge, Accent swatch, FeatureFlagChip, DebugInfoRow, ErrorLogRow, LogFooter, ErrorStateCard, EnvChip, Avatar — none are in design-brief §14 (which even excludes Avatar/Combobox).
- cornerRadius:2 (Switch/EnvChip/chips) and cornerRadius:999 (Slider track/knob) override the global --radius:0 (LOCKED #2). Confirm these local roundings are intended or reconcile.
- ErrorStateCard needs two border variants: accent-bar (left 2px, desktop) vs full outline (mobile). Confirm which is canonical.
- Recent-errors needs two presentations (4-col table vs stacked card list) and two row counts (6 vs 4) — confirm responsive contract.
- SecHead (desktop tick+rule) vs Eyebrow (mobile) for the same sections — decide whether SectionHeader carries both treatments or screens compose differently.
- SYSTEM INFO contents differ by platform (mobile drops viewport+user-agent+auth; different platform/screen/locale strings) — confirm this is a real device-context divergence, not a design omission.
- Font sizes are raw px (14/13/12/11/10); confirm mapping onto the named --text-* scale (do-not-add-ad-hoc-px rule) before build.
- Avatar initials 'RN' on $card-elevated/$primary — confirm minimal Avatar is in scope despite the 'do not bring over' note.
- Success-state capture status: dot is $success but the 'DONE · 0:14' text fill is $destructive (lines ~24628/24636) — likely a board copy/paste artifact; canonical 'done' status should be $success. Flag for reconciliation.
- OFF state of the diagnostics/attach Switch is never shown on these screens (only ON / $primary). Need an OFF token mapping for the canonical Switch.
- Default (idle, pre-recording) Capture state is not depicted — every composer screen shows either recording or done. The idle/start-recording affordance (e.g. a record/mic button before REC) is implied but not on-board.
- Desktop Sending/Success/Error states are not separately drawn — only the desktop entry + recording modal exist; the send outcomes are assumed shared with mobile.
- Help Btn active styling (stroke $primary) is shown only in the open/menu state; the resting Help Btn appearance is not separately depicted.
- Hover/pressed states for buttons and menu items are not enumerated on-board (only the 'Report an issue' highlighted row).
- Reference-number format 'OPS-R-2291' vs the context 'LAST ERROR OPS-4012' — confirm the two ID namespaces (error code vs report reference) are intentionally different.
- Toast positioning: BOTH toast states use the same lighter `#0a0a0c80` (≈50%) Overlay scrim — Success (`yKx5U`) and Error (`LMEXD`) are identical, and lighter than the prompt/composer/modal `#0a0a0ce6` (≈90%) scrim. (Earlier notes that the success path was "scrim-less / backdrop 0.6 only" or that #0a0a0c80 was error-specific were wrong — the App Backdrop sits at 0.6 *behind* the #0a0a0c80 toast scrim in both states.) Confirm whether toasts should keep this scrim in production.
- Live TaskCard demo Touch target is 24x24 (desktop) / 22x22 (mobile) — below the canonical 44x44 a11y target and below the StatusCycleButton demo's own 30x30/28x28 touch frame. Decide the real card's touch-target size and whether the demo should match it.
- WindowState pills demo: BLOCKED is coloured $muted-foreground (#7a7a8e), identical to OPEN/CLOSED — no visually distinct blocked hue. Design-brief §9 also specifies muted-foreground for blocked, so screen agrees with brief, but confirm BLOCKED is distinguishable from CLOSED only by icon (triangle-alert vs circle-x) + label.
- Window-state icon naming drift vs design-brief §9: screen uses lucide 'timer' for CLOSING (brief says Clock) and 'circle-x' for CLOSED (brief says XCircle). Pick canonical lucide names.
- OPEN pill renders a visible borderless pill in the demo, but the OPEN description says 'On a real card no pill is shown — absence means fine.' Confirm the real TaskCard suppresses the OPEN pill entirely (demo shows it only for documentation).
- Mobile Live TaskCard Stage (#A8s1fu) renders an empty 22x22 Touch (Cycle glyph + Meta omitted in extract) — confirm whether the mobile demo card is intentionally partial or truncated in extraction.
- Legal list bullets are rectangle squares ($primary 6x6/5x5) while Manual list bullets are ellipse Dots ($primary 6x6) — confirm this is an intentional legal-vs-manual distinction for the canonical List/ListItem component.
- Canonical TaskCard category Tag/Win pill have borders/strokes; demo pills are borderless tinted. Reconcile pill border policy (CategoryTag vs WindowStatePill, bordered vs borderless).
- Legal Index NavRow has divergent desktop vs mobile structure (Date+chevron Right group vs Date-inside-Col + lone chevron) — pick one canonical layout with a responsive rule.
- Open-Source Licenses document is referenced (Index row, UPD 2026-05-12) but not authored as a screen in scope.
- Search, hover, focus, and link active/visited states are not modeled anywhere — define before build.

## Coverage checklist (verification targets)

- [ ] Sign In Desktop: default·email-focused state (440 card, focused email field + cursor, password resting field, primary/secondary buttons, magic-link footer) — full px/tokens/copy
- [ ] Sign In Desktop: error·wrong-credentials state (ACCESS DENIED alert #e05a5a1f, $destructive password field + help, '2 attempts remaining') — full
- [ ] Sign In Mobile: focused (m2PSsn) + error (c2foI) variants at width 390, content parity with desktop — full
- [ ] Account Desktop: header (Wordmark + ACCOUNT crumb + 30x30 Av), PageTitle, AccountProfileSummary (avatar 56, name/email/since/PRO PLAN pill) — full
- [ ] Account Desktop: Sec EMAIL row (mail icon, value, Verified sub, CHANGE outline btn) — full
- [ ] Account Desktop: Sec SESSION Sign Out row (log-out icon, secondary SIGN OUT btn) — full
- [ ] Account Desktop: DangerZoneCard (#e05a5a0d/$destructive, DELETE HISTORY outline + DELETE ACCOUNT destructive rows, '…' labels) — full
- [ ] Account Desktop: Sec PASSWORD & SECURITY (password/passkey/2FA rows incl. 2FA Badge) — documented as adjacent
- [ ] Account Mobile: header gear (settings icon), full-width stacked sections, parity with desktop — full
- [ ] Delete Account Desktop confirm: $destructive card, 5-item erase ListBox (exact strings), IRREVERSIBLE alert, TypeToConfirmField matched state, CANCEL + DELETE MY ACCOUNT — full
- [ ] Delete Account Desktop done: warning hourglass circle #d9a73e1f, SCHEDULED FOR DELETION + 10 June 2026, GRACE PERIOD·7 DAYS alert, CANCEL DELETION + SIGN OUT — full
- [ ] Delete Account Mobile confirm (sb47h, $border stroke) + done (Q6BdL0) — full with desktop parity + stroke divergence noted
- [ ] Delete History Desktop confirm: history header $primary, 5 DeleteHistoryRangeOption radios w/ exact counts (64/310/820/1,204/3,902), Last year selected, Summary card (1,204 items · 980 tasks · 224 voice logs), VoiceHint, DELETE 1,204 ITEMS — full
- [ ] Delete History Desktop done: success check circle #5ae07a1f, HISTORY CLEARED, $info REMOVED·10 JUN 2026 alert, DONE + VIEW WHAT REMAINS — full
- [ ] Delete History Mobile confirm (u2Nu2) + done — full with desktop parity
- [ ] Confirm/done state machines for both destructive flows — full
- [ ] Token resolution table (all $tokens + 6 raw-hex tints) — full
- [ ] All five named components (Cmp·TextInput, TypeToConfirmField, DangerZoneCard, DeleteHistoryRangeOption, AccountProfileSummary) + Button/Alert usage with screen_divergence_from_canonical — full
- [ ] Read-only-board constraint (off-board account scope) — stated
- [ ] Data/logic contracts (auth methods, type-to-confirm gating, grace period, range→count map, voice trigger) — full
- [ ] Settings desktop: TopBar (brand/crumb/EnvChip PROD/version v2.4.1) exact tokens & padding
- [ ] Settings desktop: 6 eyebrow sections + group/row/divider structure, 520px fixed column, footer string
- [ ] Settings mobile: AppBar (Back/SETTINGS/EnvChip), single-column Content gap26 pad16, all 6 groups
- [ ] SettingsRow navigation-link variant (chevron-only, value+chevron, profile, destructive, muted-label) with exact tokens
- [ ] SettingsRow control variant: Switch, Select, Segmented, Slider, Locked, Accent swatch
- [ ] Switch ON (fill $primary, knob right, $primary-foreground) and OFF (fill $muted, knob left, $foreground) — exact 44x24 + cornerRadius2 + counts
- [ ] Select / Segmented / Slider / Locked / Accent control rendering with exact px and tokens
- [ ] Debug Console desktop: Console Header + Copy Diagnostics button, Inner gap24 pad20 ordering
- [ ] Last Error / ErrorStateCard desktop (left 2px bar, stack trace) vs mobile (full border, no stack) with exact strings
- [ ] SYSTEM INFO DebugInfoRow KV pairs (all keys/values, key-width 150/104, $primary highlights, platform divergence desktop vs mobile)
- [ ] SESSION DebugInfoRow KV pairs + feature.flags chip grid
- [ ] FeatureFlagChip ON/OFF as rendered (6 flags, exact names/states/tokens, desktop 2x3 vs mobile 3x2)
- [ ] ErrorLogRow table desktop (HeadRow TIME/LVL/CODE/MESSAGE, cell widths 78/56/86/fill, 6 rows exact)
- [ ] ErrorLogRow mobile stacked list (4 rows exact)
- [ ] LVL Badge tones ERR/WARN/INFO with exact alpha fills and text tokens
- [ ] LogFooter desktop (buffer summary + DOWNLOAD .LOG pill) vs mobile (simplified text)
- [ ] RECENT ERRORS count badge 6/128 and footer count consistency (6 desktop / 4 mobile)
- [ ] Every state enumerated: switch on/off, segmented active/inactive, flag on/off, log err/warn/info, KV value emphasis, destructive/muted nav-link
- [ ] Interactions: switch toggle, nav-link navigate, segmented/slider/select, copy diagnostics, download .log, read-only enforcement
- [ ] Data/logic contracts: preferences vs read-only telemetry, feature-flag map, error ring buffer, env/version
- [ ] Divergence from canonical §14: new Settings primitives (Switch/Select/Slider/SettingsRow/Avatar etc.), cornerRadius2 vs --radius:0, platform header/border/layout differences
- [ ] Mobile Shake Prompt (blOrx): scrim, shake glyph, dialog, vibrate badge, Report Bug + Request Feature buttons, Dismiss + shake-again hint — exact tokens/sizes/copy
- [ ] Mobile Report Composer bug variant (D6qTpN): sheet structure, grabber, header, context KV (LAST ERROR/SCREEN/APP VERSION), diagnostics switch ON, voice dictation recording, 44-bar waveform, description w/ ▋ cursor, Send Report
- [ ] Mobile Feature Request variant (RdOj2): all deltas (IDEA ✦, lightbulb, REQUEST TYPE Enhancement, Attach current view, DICTATE YOUR IDEA, SEND REQUEST, feature transcript)
- [ ] Mobile State · Sending (Rz2xi): SENDING… sync, recording-done capture (check/$success/TRANSCRIPT ATTACHED), description unfocused, loader-circle + 'SENDING REPORT…'
- [ ] Mobile State · Success (Zy2pG): bespoke toast, 2px $success accent, ✓ REPORT SENT, AUTO-DISMISS · 4S, message, REFERENCE OPS-R-2291
- [ ] Mobile State · Error/Retry (WzxLm): OFFLINE sync, lighter #0a0a0c80 scrim, $destructive accent toast, COULDN'T SEND / QUEUED, offline-draft message, RETRY NOW + SAVE DRAFT actions
- [ ] Desktop entry (B8O1uh): top bar Help Btn (active stroke), Help Menu popover items + shortcuts, highlighted Report an issue + ⌘⇧R, NO SHAKE ON DESKTOP note
- [ ] Desktop Report Modal (jwuPw): centered 440-wide modal, disabled grabber, ghost board 0.32, full composer reuse in recording state
- [ ] Component usages with screen-divergence: ShakeReportSheet, ReportComposer, Capture, Send button, bespoke Toast, HelpMenu, Switch, Modal/Dialog
- [ ] Data/logic contracts: trigger paths (shake / ⌘⇧R), report type, auto-context fields, diagnostics toggle default ON, dictation lifecycle, send pipeline idle->sending->success/error, reference number, offline draft+queue+auto-retry, toast auto-dismiss 4s
- [ ] All exact tokens resolved against 00-variables.json (radius 0; square corners except r2 grabber/r12 switch/r26 stop/2px accent)
- [ ] Legal TopBar (desktop + mobile): Wordmark, Sep/Div, Tag/Crumb, Back chip+icon, Close button — exact padding/tokens/sizes
- [ ] Privacy desktop §01–§09 full structure incl. §02 H3 sub-heads + info Callout, §04 list + warning Callout, §03/§05/§06 lists, contact link
- [ ] Privacy mobile §01–§09 (condensed copy, shortened titles §04/§08)
- [ ] Terms desktop §01–§08 incl. §03 acceptable-use list + §05 warning Callout
- [ ] Terms mobile §01–§08 (mobile §06 title 'Liability')
- [ ] Legal Index desktop: PageHead + 3 NavRow (border-stacking, Date+chevron Right group) + Foot
- [ ] Legal Index mobile: NavRow variant (Date inside Col, single chevron) + Foot
- [ ] LegalSection §NN unit: NumW/Num/Ttl/H2 + Body children (P/H3/List/Callout) with exact type sizes
- [ ] Legal Callout both tones (info #ff6b351f/$primary/shield, warning #d9a73e1f/$warning/triangle-alert) with all literal titles
- [ ] Legal list LI structure (rectangle bullet 6x6/5x5 + DM Sans text)
- [ ] Manual desktop Header: Wordmark, Div, Crumb MANUAL, Search field (240, search icon, placeholder)
- [ ] Manual desktop TOC: group labels CORE CONCEPTS/INPUT, all 10 ManualTOCItems, active vs inactive treatment
- [ ] Manual mobile Header (chevron-left Back, $foreground Crumb, x Close, no Search)
- [ ] Manual mobile SectionNav: 4 SectionNavChips, active vs inactive treatment
- [ ] Manual article content order (Eyebrow→H1→Lead→H2a Anatomy→List→Live TaskCard→Status cycle→Live SCB→Window states→Live pills→Drive by voice→CodeCallout) desktop+mobile
- [ ] Live TaskCard demo: ManualLiveBlock Bar, Task row with $warning closing border, in-progress Cycle, Name, BUREAUCRATIC + CLOSING·T-5d pills
- [ ] Live StatusCycleButton demo: 3 states (not-started empty / in-progress orange+square / done $success+check icon) with touch frames + captions
- [ ] Live WindowState pills demo: 5 states (OPEN no-icon, CLOSING timer, WINDOW CLOSED circle-x, BLOCKED triangle-alert, NOT YET lock) with exact fills/colours/icons + descriptions incl. BLOCKED
- [ ] CodeCallout (voice example) desktop 5-line vs mobile condensed, line colours/roles
- [ ] All lucide icon identities (arrow-left, x, shield, triangle-alert, chevron-right, search, box, file-text, timer, circle-x, lock, check, chevron-left)
- [ ] Window-state model + status guard rule + blocked-derived logic echoed by the manual
- [ ] Divergence-from-canonical for AppHeader, LegalSection, LegalIndexRow, ManualTOCItem, SectionNavChip, ManualLiveBlock, TaskCard, StatusCycleButton, WindowStatePill, CodeCallout, Eyebrow
- [ ] Informational divergence vs design-brief §9 window-state model (icon names)