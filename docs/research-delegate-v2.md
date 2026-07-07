# Research Delegate v2 — REST surface, API keys, integration context sources

**Status: BUILT (same branch as v1).** v1 — the 5 research MCP tools — plus
both stages below now ship together: v2a is `apps/web/app/api/v1/**` +
`apps/web/lib/api-principal.ts` + `/settings/api-access`; v2b is
`@opsboard/db/integrations`, the integration MCP tools
(`apps/web/lib/mcp/tools/integrations.ts`), and the cue-time context snapshot
threaded through `@/lib/research-ops` into the runner's synthesis prompt.
This doc remains the design rationale; the "open questions" at the end were
resolved with the recommended options (full CRUD mirror, UI-only key
creation, 4k/8k context caps).

The product framing: OpsBoard is the **fact-finder and tracker** — it owns
missions, tasks, dependencies, and cited research notes. Each consuming app is
an **analyst** — it owns its own synthesis (cost ledgers, power budgets,
compatibility graphs) and consumes OpsBoard's notes as inputs. Nothing in v2
changes that boundary; it widens how apps connect and how much context the
research runner has.

---

## v2a — REST reflection of the MCP surface, authenticated by API keys

### Why

MCP is the right transport for agent clients (claude.ai sessions, other MCP
consoles), but the OAuth client-registration allow-list is deliberately pinned
to loopback / claude.ai / anthropic.com (`apps/web/lib/mcp/oauth.ts`
`isAllowedRedirectUri`). A headless app or server-side job in another project
shouldn't need to impersonate an MCP client or widen that auth surface. An API
key is the natural machine-to-machine credential for a single-user system:
same principal, second transport.

**Decision (recommended): add API keys + a `/api/v1` REST surface; leave the
OAuth allow-list untouched.** Widening the redirect allow-list per consuming
app was considered and rejected — every widening is auth surface, and API keys
give non-agent apps a simpler contract than OAuth+PKCE anyway.

### API keys

One new table (one migration — the first this effort needs):

- `api_keys`: `id`, `user_id`, `name` (e.g. "van-build console"),
  `key_hash` (sha256 of the full secret — the plaintext is never stored,
  mirroring `mcp_access_tokens`), `prefix` (first ~10 chars, display-only),
  `scopes` (space-separated, reserve for later; start with implicit
  full-access), `created_at`, `last_used_at`, `revoked_at`.
- Key format `opsb_<32+ bytes url-safe random>`; shown **once** at creation.
- Creation/revocation happens in the **Settings UI only** — deliberately NOT
  an MCP tool or REST endpoint, so a leaked key/token can never mint more
  credentials. (Same reasoning as keeping the AI keys out of the MCP layer.)
- Resolution: `Authorization: Bearer opsb_...` → hash → active-row lookup →
  the owning `user_id` becomes the request principal. Touch `last_used_at`
  best-effort (mirror `verifyMcpToken`).

### The principal seam

Introduce one helper, e.g. `resolvePrincipal(req)` in `apps/web/lib/auth`:
session cookie (the web UI today) **or** API key → `{ userId, via:
"session" | "api-key", keyId? }`. Route handlers depend on the seam, not on
`getAuthenticatedUser` directly, so a route serves both the UI and programs
without duplication. MCP stays on its own bearer-token path (`verifyMcpToken`)
— no change.

### Surface

Version under `/api/v1/*`, thin controllers over the **same services** the MCP
tools and existing routes call (no new business logic):

| REST | Mirrors |
|---|---|
| `GET/POST /api/v1/missions`, `GET/PATCH/DELETE /api/v1/missions/:id` | `list_missions` / `create_mission` / `get_mission` / `update_mission` / `delete_mission` |
| `GET/POST /api/v1/tasks`, `PATCH/DELETE /api/v1/tasks/:id` | `list_tasks` / `create_task` / `update_task` / `delete_task` |
| `PUT/DELETE /api/v1/tasks/:id/dependencies/:dependsOnId` | `add_dependency` / `remove_dependency` |
| `GET /api/v1/missions/:id/blocked` · `/closing` · `/critical-path` | the three graph reads |
| `POST /api/v1/research` | `cue_research` (incl. `focus`) |
| `GET /api/v1/research/jobs/:jobId` | `get_research_job` |
| `GET /api/v1/tasks/:id/research/jobs` | `list_research_jobs` |
| `POST /api/v1/research/jobs/:jobId/keep-notes` | `keep_research_notes` |
| `GET /api/v1/tasks/:id/research/notes` · `GET /api/v1/missions/:id/research/notes` | `read_research_notes` |

Conventions carried over: Zod at the boundary, owner-scoping via the resolved
principal (foreign ids → 404), rate limits on the **same principal buckets**
(`research-cue:{userId}` etc.) so UI + MCP + REST draw one budget, deletes
require an explicit `?confirm=` echo of the resource id (the REST analogue of
the confirm-token dance), and an audit row per API-key call (extend the MCP
audit table with a `via` column or add a sibling — decide at build time).

### Non-goals

No webhooks/push (polling stays the contract), no multi-user/org keys, no
public API docs site — this is a private surface for the operator's own apps.

---

## v2b — Registered integrations as research context sources

### Why

A consuming app knows constraints the research runner doesn't: "the van is a
MWB Crafter with a 24 V / 300 Ah system", "budget ceiling is X", "we already
committed to induction". Today the only steering is the 280-char query + the
500-char `focus`. Letting an app **register itself as an integration with a
standing context document** makes every research job on its missions
better-informed without repeating the constraints in every cue.

### Data model (one migration)

- `integrations`: `id`, `user_id`, `name`, `slug`, `description`,
  `context` (text, hard cap ~4,000 chars — it enters a prompt), `created_at`,
  `updated_at`.
- `mission_integrations` (`mission_id`, `integration_id`, unique pair): a
  join table, so one app can inform several missions and a mission can draw on
  several sources. (Task-level linking is deliberately out — mission
  granularity matches the "Category = subsystem" mapping.)
- `research_jobs.context` (nullable text): a **snapshot** of the merged
  context taken at cue time (see below).

### Verbs (both transports)

`register_integration`, `update_integration` (rename / replace context),
`list_integrations`, `link_integration` / `unlink_integration`
(mission ↔ integration), and `delete_integration` (confirm-gated). All thin
CRUD following the existing tool conventions; context is user/app-authored
plain text, audited like any other arg.

### Threading context into the runner

Two options considered:

- **(a) Snapshot at cue (recommended).** When a job is cued, load the task's
  mission's linked integrations, concatenate their `context` blocks (bounded),
  and store the result on the job row. The runner passes it to synthesis as a
  distinct CONTEXT block. Auditable (the job records exactly what informed
  it), deterministic on re-read, and the runner change is minimal: one extra
  prompt section + a versioned prompt bump in
  `packages/ai-prompts/src/research-runner.ts`.
- **(b) Live read at run time.** Fresher, but the context can change between
  cue and run, making results unexplainable after the fact. Rejected.

This is the first v2 piece that touches the engine (the synthesis prompt gains
a CONTEXT block → prompt version bump + runner test update). Keep it isolated
from v2a, which touches no engine code.

### Safety note

Integration context is operator-authored text injected into a web-searching
prompt. In a single-user system the "attacker" would be the operator's own
apps, so this is acceptable — but bound the size, render it as data (a fenced
CONTEXT block, not instructions), and audit updates, so a buggy consuming app
can't silently balloon token spend or hijack the question.

---

## Sequencing

1. **v1 (this branch):** the 5 MCP research tools. No migrations.
2. **v2a:** `api_keys` migration + principal seam + `/api/v1` controllers +
   Settings UI for key management. No engine change.
3. **v2b:** `integrations` + `mission_integrations` + job-context snapshot +
   prompt version bump. One engine-adjacent change, well-fenced.

## Open questions (operator to confirm before v2 builds)

1. v2a scope: research verbs only, or the full mission/task CRUD mirror in the
   first cut? (Recommend full mirror — it's thin and apps will want setup.)
2. Confirm key creation stays UI-only (recommended) vs. also over REST.
3. v2b context cap (default proposal: 4,000 chars merged, truncate oldest-link
   first) and whether `focus` remains useful once context exists (it does —
   context is standing, focus is per-question).
