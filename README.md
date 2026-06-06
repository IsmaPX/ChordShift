# ChordShift / Worship Piano App

Sistema de entrenamiento para músicos de adoración.

## Stack

- **Frontend**: React 19 + Vite + TypeScript + Tailwind CSS 4
- **Audio**: Tone.js
- **Routing**: React Router v7
- **Server State**: TanStack Query
- **Backend**: Express 4 + Prisma 5 + PostgreSQL 16
- **Real-time**: Socket.IO 4
- **Push**: Web Push (VAPID)
- **Auth**: JWT (jsonwebtoken) + bcrypt
- **Mobile**: Capacitor (Android)
- **Desktop**: Electron 33
- **Deploy**: Vercel (frontend) + Docker (backend) + GitHub Releases (desktop)

## Estructura

```
.
├── apps/
│   ├── web/              # React + Vite + Electron (cliente)
│   └── api/              # Express + Prisma + PostgreSQL (backend)
├── packages/
│   ├── audio/            # Lógica de audio compartida (Tone.js)
│   ├── db/               # Interfaces TypeScript compartidas
│   └── ui/               # cn helper
├── docker-compose.yml    # API + Postgres para dev/demo
├── docker-compose.prod.yml  # Override de prod
└── .github/
    ├── workflows/
    │   ├── ci.yml             # Lint + Typecheck + Tests + Build (web+audio)
    │   ├── deploy.yml         # Vercel (frontend)
    │   ├── release.yml        # Electron (tag v*) + APK
    │   ├── docker-publish.yml # API image → ghcr.io
    │   └── deploy-api.yml     # Manual deploy via SSH (opcional)
    └── release-notes/         # Notas de release por versión
```

## Quick Start (todo el stack)

```bash
# 1. Clonar e instalar
git clone https://github.com/IsmaPX/ChordShift.git
cd ChordShift
pnpm install

# 2. Levantar backend con Docker
cp apps/api/.env.example apps/api/.env
docker compose up -d postgres
docker compose run --rm api pnpm prisma:deploy
docker compose run --rm api pnpm db:seed   # opcional: datos seed + admin
docker compose up -d api

# 3. Arrancar frontend
pnpm dev          # localhost:5173 (web)
pnpm --filter api dev   # localhost:3001 (api en modo watch)

# 4. Verificar
curl http://localhost:3001/api/health
open http://localhost:5173
```

## Comandos (monorepo)

```bash
pnpm dev          # Inicia todos los dev servers (web + api)
pnpm build        # Build de todos los paquetes
pnpm lint         # ESLint
pnpm typecheck    # tsc --noEmit
pnpm test         # Vitest

# Backend (apps/api)
pnpm --filter api dev
pnpm --filter api prisma:generate
pnpm --filter api prisma:migrate
pnpm --filter api db:seed

# Backend (docker)
pnpm --filter api docker:up
pnpm --filter api docker:down
pnpm --filter api docker:logs
pnpm --filter api docker:migrate
pnpm --filter api docker:build-local

# Frontend (apps/web)
pnpm --filter web dev
pnpm --filter web build
pnpm --filter web dist:win|mac|linux
```

## Variables de entorno

| Archivo | Vars | Notas |
|---|---|---|
| `apps/api/.env` | DB, JWT, VAPID, storage | Ver `apps/api/.env.example` |
| `apps/web/.env` | `VITE_API_URL` (opcional) | Si no, usa Dexie offline-first |

Si `VITE_API_URL` no está definido, el frontend usa IndexedDB (Dexie) sin backend.

## Backend (apps/api)

- **Docker image**: `ghcr.io/ismapx/chordshift-api:v0.2.0` (público)
- **Source**: [apps/api/README.md](apps/api/README.md) (endpoints completos, setup, deploy)
- **API doc**: 50+ endpoints REST + WebSocket (auth, songs, sessions, ear-training, leaderboard, sync, live-sessions, QR, push, shares)
- **35 tests pasando** (qrToken, pushNotification, leaderboard, multiSession, storage)
- **164 tests frontend pasando**

## Frontend (apps/web)

- **Web**: Vercel auto-deploy desde `main` → [web-1tmdqw12l-maikel-js-projects.vercel.app](https://web-1tmdqw12l-maikel-js-projects.vercel.app)
- **Desktop**: GitHub Releases → [v0.2.0](https://github.com/IsmaPX/ChordShift/releases/tag/v0.2.0) (Windows/macOS/Linux)
- **Mobile (Android)**: APK incluido en cada release

## Deploy

### Frontend → Vercel
Automático en push a `main`. Configurar `VITE_API_URL` en Vercel dashboard si quieres usar el backend.

### Backend → Docker (múltiples opciones)

**Opción 1: Docker Compose (self-hosted)**

```bash
docker compose up -d
```

**Opción 2: Pull de la imagen + DB externa**

```bash
docker run -d --name chordshift-api \
  -p 3001:3001 \
  -e DATABASE_URL="postgresql://user:pass@db.host/worship_piano" \
  -e JWT_SECRET="$(openssl rand -base64 48)" \
  ghcr.io/ismapx/chordshift-api:v0.2.0
```

**Opción 3: Cloud providers (Railway/Render/Fly.io)**

- Image source: `ghcr.io/ismapx/chordshift-api:v0.2.0`
- Port: 3001
- Healthcheck: `/api/health`
- Pegar vars de `.env.example`

Ver [apps/api/README.md](apps/api/README.md) para instrucciones detalladas.

## CI/CD

| Trigger | Workflow | Acción |
|---|---|---|
| Push a `main` | `ci.yml` | Lint + Typecheck + Tests + Build |
| Push a `main` | `deploy.yml` | Deploy frontend a Vercel |
| Push a `main` | `docker-publish.yml` | Publica imagen API a ghcr.io |
| Tag `v*` | `release.yml` | Genera binarios Electron + APK |
| Manual | `deploy-api.yml` | Deploy SSH a server propio |

## Releases

Ver [GitHub Releases](https://github.com/IsmaPX/ChordShift/releases) para descargas de binarios desktop.

## Repositorio

https://github.com/IsmaPX/ChordShift

## Licencia

Privado (todos los derechos reservados).
