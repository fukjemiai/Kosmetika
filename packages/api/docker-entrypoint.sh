#!/bin/sh

echo "==> Generating Prisma client from mounted schema..."
npx prisma generate
if [ $? -ne 0 ]; then
  echo "ERROR: prisma generate failed"
  exit 1
fi

echo "==> Waiting for database to accept connections..."
MAX_RETRIES=30
RETRY=0
while true; do
  npx prisma db push --accept-data-loss 2>&1
  if [ $? -eq 0 ]; then
    break
  fi
  RETRY=$((RETRY + 1))
  if [ "$RETRY" -ge "$MAX_RETRIES" ]; then
    echo "ERROR: Database not available after $MAX_RETRIES retries. Exiting."
    exit 1
  fi
  echo "Database not ready (attempt $RETRY/$MAX_RETRIES), retrying in 3s..."
  sleep 3
done

echo "==> Database schema pushed successfully."

echo "==> Running seed..."
npx ts-node --project prisma/tsconfig.seed.json prisma/seed.ts 2>&1 || echo "Seed skipped (already seeded or error)"

echo "==> Starting API server..."
exec npx nest start --watch
