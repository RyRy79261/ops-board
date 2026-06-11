#!/usr/bin/env sh
# OpsBoard Vercel build step (wired as the apps/web "vercel-build" script, which
# Vercel runs for every deployment).
#
# This is the SINGLE place migrations are applied. Each deployment migrates ITS
# OWN Neon branch using the DATABASE_URL_UNPOOLED that the Vercel–Neon
# integration injects into the build:
#   • production build → the production branch
#   • preview build    → that preview's ephemeral branch
# so prod AND previews run their own code's schema with one mechanism — no
# separate GitHub Action, no copied secret. drizzle-kit is idempotent, so once a
# migration is applied this is a no-op.
#
# `db:migrate` uses the DIRECT/unpooled endpoint (drizzle.config prefers
# DATABASE_URL_UNPOOLED) — pooled PgBouncer can choke on DDL / advisory locks.
#
# GUARD: if DATABASE_URL_UNPOOLED isn't set (a build with no DB attached —
# shouldn't happen on Vercel, belt-and-braces) we SKIP migrate rather than fail.
# But when it IS set and the migration FAILS, `set -e` exits non-zero and the
# deploy fails ON PURPOSE — we never ship code against a schema that didn't
# apply. Migrations are validated against an ephemeral Neon branch in CI before
# they ever reach here.
set -eu

if [ -n "${DATABASE_URL_UNPOOLED:-}" ]; then
  echo "vercel-build → applying migrations to this deployment's Neon branch…"
  pnpm --filter @opsboard/db db:migrate
else
  echo "vercel-build → DATABASE_URL_UNPOOLED not set; skipping migrate."
fi

next build
