# ── Base ──────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

# ── Dependencies ──────────────────────────────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY packages/database/package.json packages/database/
COPY packages/types/package.json packages/types/
COPY packages/auth/package.json packages/auth/
COPY packages/ui/package.json packages/ui/
RUN pnpm install --frozen-lockfile || pnpm install

# ── Build ─────────────────────────────────────────────────────────────────────
FROM deps AS build
COPY tsconfig.base.json ./
COPY packages/ packages/
COPY apps/api/ apps/api/

# Prisma generate
RUN pnpm --filter @kosmetika/database exec prisma generate

# Build API
RUN pnpm --filter @kosmetika/api run build

# ── Runner ────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/package.json /app/pnpm-lock.yaml* /app/pnpm-workspace.yaml ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/package.json ./apps/api/
COPY --from=build /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/packages/database ./packages/database
COPY --from=build /app/packages/types ./packages/types
COPY apps/api/entrypoint.sh ./apps/api/entrypoint.sh

EXPOSE 3001

CMD ["sh", "apps/api/entrypoint.sh"]
