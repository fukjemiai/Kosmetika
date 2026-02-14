# ── Base ──────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

# ── Dependencies ──────────────────────────────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY apps/staff/package.json apps/staff/
COPY packages/ui/package.json packages/ui/
COPY packages/types/package.json packages/types/
COPY packages/auth/package.json packages/auth/
COPY packages/database/package.json packages/database/
RUN pnpm install --frozen-lockfile || pnpm install

# ── Build ─────────────────────────────────────────────────────────────────────
FROM deps AS build

ARG NEXT_PUBLIC_STAFF_API_URL=http://localhost:3001
ARG NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
ARG NEXT_PUBLIC_KEYCLOAK_REALM=kosmetika
ARG NEXT_PUBLIC_STAFF_KEYCLOAK_CLIENT_ID=kosmetika-staff

ENV NEXT_PUBLIC_STAFF_API_URL=$NEXT_PUBLIC_STAFF_API_URL
ENV NEXT_PUBLIC_KEYCLOAK_URL=$NEXT_PUBLIC_KEYCLOAK_URL
ENV NEXT_PUBLIC_KEYCLOAK_REALM=$NEXT_PUBLIC_KEYCLOAK_REALM
ENV NEXT_PUBLIC_STAFF_KEYCLOAK_CLIENT_ID=$NEXT_PUBLIC_STAFF_KEYCLOAK_CLIENT_ID

COPY tsconfig.base.json ./
COPY packages/ packages/
COPY apps/staff/ apps/staff/

RUN pnpm --filter @kosmetika/staff run build

# ── Runner ────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=build /app/apps/staff/public ./apps/staff/public
COPY --from=build --chown=nextjs:nodejs /app/apps/staff/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/apps/staff/.next/static ./apps/staff/.next/static

USER nextjs
EXPOSE 3002
ENV PORT=3002
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/staff/server.js"]
