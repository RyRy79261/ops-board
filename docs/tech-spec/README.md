# OpsBoard — Functional Tech Spec

Derived from the Pencil design (`design/app.pen`) by a multi-stage agent pipeline. **The screens as laid out on the Pencil boards are the authoritative intended design**; the canonical component library is reconciled *toward* the screens. Divergence from `design/design-brief.md` is recorded as *informational* (the brief was Pencil's input, not the source of truth).

## How this was produced

1. **Extract** — `scripts/extract-design.sh` reads `app.pen` via the Pencil **CLI** (headless `pencil interactive`, never the MCP), serialized to respect the CLI's fixed socket, writing clean validated JSON to `docs/design-extract/` (11 boards + tokens + 82 component defs, zero truncation).
2. **Triage** (Workflow 1, 15 agents) — per-board priority/complexity/surfaces/component-usage/drift + recommended fan-out, foundations, 82-component catalog, composition map → [`00-triage-and-priorities.md`](00-triage-and-priorities.md).
3. **Spec authoring** (Workflow 2, 29 agents) — 21 surface specs + foundations + 7 consolidated component-contract specs (82 components unified across screen usage).
4. **Verification** (Workflow 3) — each component & surface checked bidirectionally against the screen design → [`04-verification.md`](04-verification.md).

## Contents

- [`00-triage-and-priorities.md`](00-triage-and-priorities.md) — board priorities, complexity, drift inventory, composition map, build order.
- [`01-foundations.md`](01-foundations.md) — type scale, color tokens, radius, spacing, primitives.
- [`02-components/`](02-components/00-index.md) — **82 component contracts** (props, variants, states, tokens, a11y, `maps_to` build source, reconciliation notes), in 7 groups.
- [`03-surfaces/`](03-surfaces/00-index.md) — **per-board surface specs** (layout, exact values, states, interactions, coverage checklists).
- [`04-verification.md`](04-verification.md) — bidirectional design↔spec verification results.

## Source-of-truth & conflict rules

- **Screens win.** Where a board's flattened rendering diverges from the canonical component def, the component contract is widened/changed to serve the screen (`reconciliation_notes` per component).
- **Brief is informational.** Recorded divergences (e.g. only 11–12 of 19 type steps shown; StatusCycleButton "done" rendered orange vs the brief's green; window-state pill icons rendered as generic dots) are flagged for the operator, not auto-corrected.
- **Build target:** shadcn/ui "new-york" + Tailwind v4 OKLCH `@theme` tokens, assembled as `@opsboard/ui`, mirroring camp-404. Reuse mapping per component in `docs/scaffolding-plan.md` (Asset reuse manifest).

## Raw data

- `docs/design-extract/` — the clean JSON extraction (authoritative screen data).
- `docs/design-extract/_triage-raw.json`, `_spec-raw.json` — structured workflow payloads.
