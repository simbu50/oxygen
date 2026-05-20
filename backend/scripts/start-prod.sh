#!/usr/bin/env sh
set -e

echo "[start-prod] syncing prisma schema to db (db push)..."
npx prisma db push --accept-data-loss --skip-generate

echo "[start-prod] seeding admin (idempotent)..."
node prisma/seed-prod.js || echo "[start-prod] seed skipped (non-fatal)"

echo "[start-prod] verifying dist/main.js exists..."
ls -la dist/ || echo "[start-prod] WARN: dist not present"

echo "[start-prod] starting NestJS on port ${PORT:-3000}..."
exec node dist/main.js
