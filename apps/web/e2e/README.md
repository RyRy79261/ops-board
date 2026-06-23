# E2E tests (Playwright)

End-to-end regression coverage for the board's user-facing flows (non-voice CRUD
today; more as features land). These run a real `next dev` server against a real
database and drive a real browser.

## How it works

Two test-only seams make hermetic e2e possible without the remote Neon Auth API:

1. **Auth** — `lib/session.ts` honours an `E2E_TEST_AUTH=1` env flag (in a
   **non-production** build only) and resolves the session from a base64-JSON
   `e2e-user` cookie instead of Neon Auth. See `lib/session-e2e.ts` (pure +
   unit-tested) for the full security rationale. Next strips the branch from
   production builds, and the flag is never set in prod/preview.
2. **Database** — `createHttpDb()` honours `DB_DRIVER=node-postgres` and talks to
   a plain Postgres (a throwaway container, or a Neon branch). Prod is unchanged
   (neon-http). Seeding reuses `@opsboard/db/testing` (`seed.ts`).

`globalSetup` migrates + seeds the schema; the `authed` fixture wipes domain data
and authenticates as the seeded user before each spec.

## Run locally

Requires Docker (for the throwaway Postgres) and the Playwright browser:

```bash
pnpm --filter @opsboard/web e2e:install   # one-time: download the chromium binary
pnpm --filter @opsboard/web e2e:local     # spins Postgres in Docker, runs the suite
```

`e2e:local` passes extra args to `playwright test`:

```bash
pnpm --filter @opsboard/web e2e:local mission-crud   # one spec
pnpm --filter @opsboard/web e2e:local --ui           # interactive UI mode
```

### Against a Neon branch instead of Docker

Point `DATABASE_URL` at a (disposable) Neon branch and leave `DB_DRIVER` unset to
exercise the real neon-http driver, then run Playwright directly:

```bash
DATABASE_URL="postgres://…neon-branch…" E2E_TEST_AUTH=1 \
  pnpm --filter @opsboard/web exec playwright test
```

## CI

The `e2e` job in `.github/workflows/ci.yml` runs the same suite against a
`postgres:16` service container — fully hermetic, no Neon secrets, never skipped.
