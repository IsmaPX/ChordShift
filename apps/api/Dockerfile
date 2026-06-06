# =============================================================================
# Dockerfile para apps/api (ChordShift / Worship Piano App)
#
# Multi-stage:
#   - builder: instala deps + compila TS + genera Prisma client
#   - runtime: solo deps de prod + artefactos compilados
#
# Build:  docker build -t chordshift-api -f apps/api/Dockerfile .
# Run:    docker run -p 3001:3001 --env-file apps/api/.env chordshift-api
# =============================================================================

# ---------- builder ----------
FROM node:20-alpine AS builder

# pnpm via corepack (recomendado por Node 20)
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /repo

# Copiamos manifests primero para cachear la instalación.
# pnpm necesita los workspace manifests de todo el monorepo.
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/audio/package.json ./packages/audio/package.json

# Instala TODAS las deps (incluyendo dev) para compilar.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter @chordshift/api... --filter @chordshift/db... --filter @chordshift/ui... --filter @chordshift/audio...

# Copiamos el código fuente necesario para compilar.
COPY tsconfig.json ./
COPY apps/api ./apps/api
COPY packages ./packages

# Genera el cliente Prisma (lee DATABASE_URL de .env si existe, pero
# el cliente se genera sin necesidad de conexión).
WORKDIR /repo/apps/api
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder?schema=public"
RUN pnpm prisma:generate

# Compila TypeScript → dist/
RUN pnpm build

# Limpia devDependencies para que la imagen runtime sea más pequeña.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm prune --prod --filter @chordshift/api

# ---------- runtime ----------
FROM node:20-alpine AS runtime

# Seguridad: ejecutar como usuario no-root
RUN addgroup -g 1001 -S nodejs && adduser -S api -u 1001

ENV NODE_ENV=production
ENV PORT=3001
WORKDIR /app

# Copiamos solo lo necesario para correr.
COPY --from=builder --chown=api:nodejs /repo/apps/api/dist ./dist
COPY --from=builder --chown=api:nodejs /repo/apps/api/node_modules ./node_modules
COPY --from=builder --chown=api:nodejs /repo/apps/api/prisma ./prisma
COPY --from=builder --chown=api:nodejs /repo/apps/api/package.json ./package.json

# healthcheck opcional (no es estrictamente necesario en Fly/Render).
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3001/api/health || exit 1

USER api
EXPOSE 3001

CMD ["node", "dist/server.js"]
