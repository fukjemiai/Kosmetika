#!/bin/sh
set -e

echo "Waiting for database..."
until npx prisma db push --accept-data-loss 2>/dev/null; do
  echo "Database not ready, retrying in 3s..."
  sleep 3
done

echo "Database schema pushed successfully."

echo "Running seed (if needed)..."
npx ts-node prisma/seed.ts 2>/dev/null || echo "Seed skipped (already seeded or error)"

echo "Starting API server..."
exec npx nest start --watch
