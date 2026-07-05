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

# GUARD: NEON_AUTH_COOKIE_SECRET must be present (≥32 chars) for any deployment
# that boots with NODE_ENV=production — i.e. Vercel production AND preview. If it
# is missing, apps/web/lib/neon-auth.ts throws at MODULE EVALUATION, and because
# that module is imported at the top of the middleware (apps/web/proxy.ts) the
# ENTIRE middleware module fails to load → every non-static route 500s (this took
# prod fully down on 2026-07-05). That runtime guard is deliberately SUPPRESSED
# during `next build` (NEXT_PHASE=phase-production-build), so the build itself
# never surfaces the misconfig — we assert it HERE instead, failing the deploy
# BEFORE we ship a bundle that only crashes once it's live. Scoped to VERCEL_ENV
# production|preview so local / CI `next build` (legitimately secret-less) and
# `vercel dev` (NODE_ENV=development) are unaffected.
case "${VERCEL_ENV:-}" in
  production | preview)
    if [ -z "${NEON_AUTH_COOKIE_SECRET:-}" ] || [ "${#NEON_AUTH_COOKIE_SECRET}" -lt 32 ]; then
      echo "vercel-build → FATAL: NEON_AUTH_COOKIE_SECRET is unset or <32 chars for the '${VERCEL_ENV}' environment." >&2
      echo "  Without it the middleware crashes at boot and every route returns 500 (see the 2026-07-05 outage)." >&2
      echo "  Fix: vercel env add NEON_AUTH_COOKIE_SECRET ${VERCEL_ENV}   # value: openssl rand -hex 32" >&2
      exit 1
    fi
    echo "vercel-build → NEON_AUTH_COOKIE_SECRET present (${#NEON_AUTH_COOKIE_SECRET} chars) for ${VERCEL_ENV}."
    ;;
esac

if [ -n "${DATABASE_URL_UNPOOLED:-}" ]; then
  echo "vercel-build → applying migrations to this deployment's Neon branch…"
  pnpm --filter @opsboard/db db:migrate
else
  echo "vercel-build → DATABASE_URL_UNPOOLED not set; skipping migrate."
fi

next build
