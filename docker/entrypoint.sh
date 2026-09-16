#!/bin/sh
set -e

echo "[entrypoint] Menyiapkan folder data..."
mkdir -p "${UPLOAD_DIR:-/app/data/uploads}"

echo "[entrypoint] Sinkronisasi skema database..."
./node_modules/.bin/prisma db push --skip-generate

echo "[entrypoint] Menjalankan seeding (idempoten)..."
./node_modules/.bin/tsx prisma/seed.ts || echo "[entrypoint] Seeding dilewati."

echo "[entrypoint] Menjalankan aplikasi..."
exec "$@"
