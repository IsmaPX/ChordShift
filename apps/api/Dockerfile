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
# Usamos un install general del monorepo (sin --filter) para que las
# devDependencies de cada workspace package (ej. `prisma` en apps/api)
# queden disponibles durante el build.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

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

# NOTA: Conservamos las devDependencies (prisma, etc) en la imagen
# runtime porque los workspaces de pnpm enlazan node_modules de forma
# compleja. Esto añade ~50 MB a la imagen pero garantiza que arranque.
# Optimización futura: usar `pnpm deploy` para aplanar el workspace.

# ---------- runtime ----------
FROM node:20-alpine AS runtime

# Seguridad: ejecutar como usuario no-root
RUN addgroup -g 1001 -S nodejs && adduser -S api -u 1001

ENV NODE_ENV=production
ENV PORT=3001
WORKDIR /app

# Copiamos todo lo necesario para correr.
# El workspace de pnpm requiere la estructura completa (root + packages)
# para resolver las dependencias de workspaces como @chordshift/db.
COPY --from=builder --chown=api:nodejs /repo/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=api:nodejs /repo/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder --chown=api:nodejs /repo/apps/api/prisma ./apps/api/prisma
COPY --from=builder --chown=api:nodejs /repo/apps/api/package.json ./apps/api/package.json
COPY --from=builder --chown=api:nodejs /repo/packages ./packages
COPY --from=builder --chown=api:nodejs /repo/node_modules ./node_modules
COPY --from=builder --chown=api:nodejs /repo/package.json ./package.json
COPY --from=builder --chown=api:nodejs /repo/pnpm-workspace.yaml ./pnpm-workspace.yaml

# healthcheck opcional (no es estrictamente necesario en Fly/Render).
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3001/api/health || exit 1

USER api
EXPOSE 3001

CMD ["node", "apps/api/dist/server.js"]
