#!/bin/sh
set -e

echo "Running Prisma migrations..."
cd /app/packages/database
npx prisma db push --skip-generate
cd /app

echo "Starting API server..."
exec node apps/api/dist/main
