#!/usr/bin/env sh
# Production entrypoint:
#   1. Apply DB migrations (idempotent)
#   2. Run idempotent seed (creates admin if missing; safe to repeat)
#   3. Start NestJS
#
# Render and most PaaS hosts run this single command.
# Any failure on migrate exits non-zero; the platform retries with backoff.

set -e

echo "[start-prod] applying prisma migrations..."
npx prisma migrate deploy

echo "[start-prod] seeding admin (idempotent)..."
node prisma/seed-prod.js || echo "[start-prod] seed skipped (non-fatal)"

echo "[start-prod] starting NestJS on port ${PORT:-3000}..."
exec node dist/main.js
