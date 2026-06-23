#!/usr/bin/env bash
set -euo pipefail

# Local hermetic e2e: spin a throwaway Postgres in Docker, point the app + seed
# at it (DB_DRIVER=node-postgres), run Playwright, then tear the container down.
# Mirrors the CI `e2e` job (which uses a Postgres service container instead).
# Pass-through args go to `playwright test` (e.g. `... --ui`, `... mission-crud`).

CONTAINER="opsboard-e2e-pg"
PG_PORT="${E2E_PG_PORT:-5599}"
WEB_DIR="$(cd "$(dirname "$0")/.." && pwd)"

cleanup() { docker rm -f "$CONTAINER" >/dev/null 2>&1 || true; }
trap cleanup EXIT
cleanup

echo "[e2e] starting throwaway Postgres on :${PG_PORT}…"
docker run -d --name "$CONTAINER" \
  -e POSTGRES_USER=opsboard \
  -e POSTGRES_PASSWORD=opsboard \
  -e POSTGRES_DB=opsboard_e2e \
  -p "${PG_PORT}:5432" \
  postgres:16 >/dev/null

echo "[e2e] waiting for Postgres to accept connections…"
for _ in $(seq 1 30); do
  if docker exec "$CONTAINER" pg_isready -U opsboard >/dev/null 2>&1; then break; fi
  sleep 1
done

export DATABASE_URL="postgres://opsboard:opsboard@127.0.0.1:${PG_PORT}/opsboard_e2e"
export DB_DRIVER="node-postgres"
export E2E_TEST_AUTH="1"

cd "$WEB_DIR"
pnpm exec playwright test "$@"
