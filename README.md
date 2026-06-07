# ChordShift / Worship Piano App

Aplicación monorepo para práctica de piano con audio sincronizado, entrenamiento auditivo, sesiones en vivo con WebSockets, y backend opcional con Express + Prisma.

**Stack:** Vite + React 19 + Electron 33 + TypeScript + Tailwind 4 + Tone.js · Express 5 + Prisma 6 + PostgreSQL 16 · Socket.IO · Vitest · Turborepo

---

## Estructura del monorepo

```
worship-piano-app/
├── apps/
│   ├── web/                 # Frontend (Vite + React 19 + Electron 33)
│   │   ├── src/             # Código fuente (TypeScript)
│   │   ├── electron/        # Main + preload de Electron
│   │   ├── android/         # Proyecto Capacitor Android (APK)
│   │   ├── public/          # Assets PWA
│   │   ├── resources/       # Iconos Electron
│   │   ├── capacitor.config.ts
│   │   └── electron-builder.yml
│   └── api/                 # Backend (Express + Prisma + PostgreSQL)
│       ├── prisma/          # Schema + migraciones + seed
│       ├── src/             # routes / controllers / services / middleware
│       ├── Dockerfile       # Multi-stage Node 20-alpine, no-root
│       └── tsconfig.build.json
├── packages/
│   ├── audio/               # Lógica Tone.js compartida (tests Node)
│   ├── db/                  # Interfaces TypeScript compartidas
│   └── ui/                  # Utility `cn` (clsx helper)
├── docker-compose.yml       # Stack local (postgres + api)
├── docker-compose.prod.yml  # Override prod (resource limits + logging)
├── railway.toml             # Railway config-as-code
├── render.yaml              # Render blueprint
├── fly.toml                 # Fly.io config-as-code
├── turbo.json
└── AGENTS.md                # Convenciones del proyecto
```

---

## Quick Start

### 1. Clonar e instalar

```bash
git clone https://github.com/IsmaPX/ChordShift.git
cd ChordShift
pnpm install
```

> **Requisitos:** Node `>=20`, pnpm `9.0.0`, Docker (opcional para backend).

### 2. Desarrollo frontend

```bash
# Modo navegador (Vite dev server en localhost:5173)
pnpm dev

# Modo Electron (Vite con hot-reload + ventana nativa)
pnpm dev:electron

# Build para producción
pnpm build              # Vite (PWA)
pnpm build:electron     # Electron (con VITE_ELECTRON_BUILD=true)
```

### 3. Desarrollo backend (opcional)

```bash
# Opción A: Local con Docker Compose (recomendado)
docker compose up -d postgres
cd apps/api && pnpm prisma:migrate && pnpm db:seed
cd apps/api && pnpm dev  # → http://localhost:3001

# Opción B: Local sin Docker (requiere Postgres 16 local)
cd apps/api
cp .env.example .env
# Editar DATABASE_URL apuntando a tu Postgres local
pnpm prisma:migrate
pnpm db:seed
pnpm dev
```

Activar cloud en el frontend: crear `apps/web/.env.local` con `VITE_API_URL=http://localhost:3001` y reiniciar `pnpm dev`.

### 4. Tests

```bash
# Todos los paquetes
pnpm test                # watch mode
pnpm test:run            # CI mode (run-once)

# Suite específica
cd apps/web && pnpm test
cd apps/api && pnpm test
cd packages/audio && pnpm test
```

**Estado actual:** 164/164 tests web pasando, 35/35 tests API pasando.

---

## Comandos

### Root (Turborepo)

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Inicia todos los dev servers en paralelo |
| `pnpm build` | Build de todos los paquetes (turbo) |
| `pnpm lint` | ESLint en todos los paquetes |
| `pnpm typecheck` | `tsc --noEmit` en todos los paquetes |
| `pnpm test` | Vitest en todos los paquetes (watch) |
| `pnpm test:run` | Vitest run-once (CI) |

### apps/web

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Vite dev server (localhost:5173) |
| `pnpm dev:electron` | Vite + Electron en modo dev |
| `pnpm build` | `tsc -b && vite build` |
| `pnpm build:electron` | Build con `VITE_ELECTRON_BUILD=true` |
| `pnpm dist:win` | `electron-builder --win --x64` |
| `pnpm dist:mac` | `electron-builder --mac --x64` |
| `pnpm dist:linux` | `electron-builder --linux --x64` |
| `pnpm dist:all` | Windows + macOS + Linux |
| `pnpm release` | Build + publish a GitHub Releases |
| `pnpm cap:sync` | `cap sync android` — copia `dist/` al proyecto Android |
| `pnpm cap:open` | `cap open android` — abre Android Studio |
| `pnpm android:assemble` | `cd android && ./gradlew assembleDebug` |
| `pnpm android:bundle` | `cd android && ./gradlew bundleRelease` |

### apps/api

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | `tsx watch` con hot-reload (puerto 3001) |
| `pnpm build` | Compila TypeScript → `dist/` |
| `pnpm start` | Servidor producción (`node dist/apps/api/src/server.js`) |
| `pnpm prisma:generate` | Genera Prisma Client |
| `pnpm prisma:migrate` | Crea/aplica migración (dev) |
| `pnpm prisma:deploy` | Aplica migraciones (prod) |
| `pnpm prisma:studio` | GUI en http://localhost:5555 |
| `pnpm db:seed` | Seed inicial (estilos, tips, canciones, admin) |
| `pnpm test` | Vitest watch |
| `pnpm test:run` | Vitest run-once |
| `pnpm docker:up` | `docker compose up -d` |
| `pnpm docker:down` | `docker compose down` |
| `pnpm docker:logs` | `docker compose logs -f api` |
| `pnpm docker:migrate` | `docker compose run --rm api pnpm prisma:deploy` |
| `pnpm docker:seed` | `docker compose run --rm api pnpm db:seed` |
| `pnpm docker:build-local` | `docker build -t chordshift-api:local` |

---

## Deploy

### Frontend (Vercel)

Push a `main` dispara `.github/workflows/deploy.yml` automáticamente.
- URL: https://web-1tmdqw12l-maikel-js-projects.vercel.app
- Configuración en `vercel.json` (raíz).

### Desktop (Electron)

Tags `v*` disparan `.github/workflows/release.yml`:
- **Windows**: NSIS installer + portable (.exe)
- **macOS**: DMG (Intel + Apple Silicon)
- **Linux**: AppImage + .deb

#### Code Signing (Opcional)

Para firmar binarios y evitar warnings de SmartScreen/Gatekeeper, configurar en **GitHub Settings → Secrets and variables → Actions**:

| Secret | Plataforma | Descripción |
|--------|-----------|-------------|
| `CSC_LINK` | Windows + macOS | `.pfx` codificado en base64 (`cat cert.pfx \| base64 -w 0`) |
| `CSC_KEY_PASSWORD` | Windows + macOS | Contraseña del certificado |
| `APPLE_ID` | macOS | Apple ID del Developer |
| `APPLE_APP_SPECIFIC_PASSWORD` | macOS | Generado en appleid.apple.com |
| `APPLE_TEAM_ID` | macOS | 10-char Team ID de App Store Connect |

Si las secrets NO están configuradas, los binarios se suben sin firmar (funcionales pero con warning al instalar).

### Android (APK)

`release.yml` incluye job `build-android-apk` (con `continue-on-error: true` para no romper Electron):
- Compila APK debug con `gradlew assembleDebug`
- Sube `ChordShift-<version>.apk` al release existente

### Backend (Docker + Cloud)

#### Build local con Docker Compose

```bash
# Levantar todo (postgres + api)
docker compose up -d

# Ver logs
docker compose logs -f api

# Aplicar migraciones y seed
docker compose run --rm api pnpm prisma:deploy
docker compose run --rm api pnpm db:seed

# Verificar healthcheck
curl http://localhost:3001/api/health
```

#### Deploy a Railway

1. Crear cuenta en https://railway.app
2. New Project → Deploy from GitHub → seleccionar `IsmaPX/ChordShift`
3. Railway detecta `railway.toml` automáticamente
4. Click `+ New` → `Database` → `PostgreSQL`
5. En el servicio API, añadir variables de entorno (ver `apps/api/.env.example`)

#### Deploy a Render

1. https://dashboard.render.com/blueprints → New Blueprint Instance → seleccionar repo
2. Render detecta `render.yaml` y crea servicios + DB
3. **Importante**: en Settings del API, añadir `Pre-Deploy Command`: `cd apps/api && pnpm prisma:deploy`

#### Deploy a Fly.io

```bash
fly auth signup
fly launch --copy-config --name chordshift-api
fly postgres create --name chordshift-pg --region iad
fly postgres attach chordshift-pg
fly secrets set JWT_SECRET=$(openssl rand -base64 48) \
                CORS_ORIGIN=https://web-1tmdqw12l-maikel-js-projects.vercel.app \
                VAPID_PUBLIC_KEY=... \
                VAPID_PRIVATE_KEY=...
fly deploy
```

#### Setup automatizado

```bash
./scripts/setup-deploy.sh railway    # genera secrets + imprime guía Railway
./scripts/setup-deploy.sh render     # idem Render
./scripts/setup-deploy.sh fly        # idem Fly.io
./scripts/setup-deploy.sh compose    # setup local con docker compose
```

---

## Variables de entorno

Ver `apps/api/.env.example` para la lista completa. Las críticas:

| Variable | Descripción | Default |
|----------|-------------|---------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db?schema=public` | — |
| `JWT_SECRET` | Secreto para firmar tokens (48+ chars) | — |
| `JWT_EXPIRES_IN` | Duración del token | `7d` |
| `BCRYPT_ROUNDS` | Rounds de hash bcrypt | `10` |
| `CORS_ORIGIN` | Origen permitido (URL del frontend) | `http://localhost:5173` |
| `STORAGE_DRIVER` | `local` \| `s3` \| `supabase` | `local` |
| `VAPID_SUBJECT` | Email de contacto para Web Push | `mailto:admin@worshippiano.app` |
| `VAPID_PUBLIC_KEY` | Clave pública VAPID | (generar con `npx web-push generate-vAPIDKeys`) |
| `VAPID_PRIVATE_KEY` | Clave privada VAPID | (idem) |
| `SESSION_TTL_MS` | TTL de live sessions en registry | `3600000` (1h) |
| `RATE_LIMIT_MAX` | Requests permitidos por ventana | `100` |
| `RATE_LIMIT_WINDOW_MS` | Duración de la ventana | `900000` (15min) |

### Frontend (apps/web)

| Variable | Descripción |
|----------|-------------|
| `VITE_API_URL` | URL del backend (si está configurado, activa modo API) |
| `VITE_ELECTRON_BUILD` | `true` en builds de Electron (cambia `createHashRouter`) |

Activar cloud: `localStorage.setItem('worship_piano_backend_mode', 'api')` en DevTools.

---

## Arquitectura

### Frontend
- **Sin App.tsx**: `main.tsx` renderiza `RouterProvider` directamente.
- **Router**: React Router v7 con route groups (`(auth)/`, `(app)/`, `(demo)/`).
- **AudioGate Global**: `<AudioGateProvider>` en `main.tsx` (nunca en layouts — causa remounts).
- **Dual Audio Engine**: `packages/audio/` (lógica, tests Node) + `apps/web/src/audio/` (wrapper Tone.js, mockeado en tests).
- **Tailwind 4**: `@import "tailwindcss"` + variables en `@theme`. Colores anime disponibles.
- **PWA**: SW registrado solo si `!('isElectron' in window)`.
- **VITE_APP_VERSION**: definida en `vite.config.ts` via `define`.

### Backend
- **Patrón en capas**: routes → controllers → services → Prisma.
- **Validación con Zod** en todos los inputs (`validators/`).
- **Auth JWT**: header `Authorization: Bearer <token>`, expira 7 días.
- **Hasheo**: bcrypt para password y PIN, rounds configurables.
- **Errores centralizados** en `middleware/error.middleware.ts`:
  - `ZodError` → 400
  - `Prisma P2002` → 409 (unique constraint)
  - `Prisma P2025` → 404 (record not found)
- **Prisma Singleton** en `config/database.ts` (evita HMR).
- **Variables validadas con Zod** en `config/env.ts` (fail-fast al arranque).
- **Storage factory** con drivers `local`/`s3`/`supabase` (lazy-loaded).
- **WebSockets** con Socket.IO: rooms `session:<id>` y `leaderboard:<category>:<period>`.
- **Live Session Registry**: estado en memoria con TTL, rehidratado desde Prisma al boot.
- **Push Notifications**: Web Push API + VAPID (read at runtime, test-friendly).

### Capa API en Frontend
- **Cliente HTTP** `lib/api/client.ts` — wrapper `fetch` con auth automática y `ApiError` tipado.
- **Token Store** `lib/api/tokenStore.ts` — JWT persistido en localStorage.
- **Repositories API** — `ApiAuthService`, `ApiSongRepository`, etc. Implementan las interfaces existentes (drop-in replacements de las versiones Dexie).
- **Provider selector** `lib/repositories/provider.ts` — `repositoryProvider.getXRepository()` devuelve Dexie o API según modo.
- **Hooks TanStack Query** `useApiFeatures.ts` — `useUserStats`, `useEarTrainingStats`, `useLeaderboard`, `useSharedWithMe`, `useMyShares`, `useCreateShare`, `useRevokeShare`, `useUploadAudio`, `useSongAudio`.

### Sync Offline-First
- **Outbox** `lib/sync/outbox.ts` — IndexedDB persistente para operaciones pendientes.
- **SyncManager** `lib/sync/syncManager.ts` — orquesta flush, detecta online/offline, deduplica flushes concurrentes.
- **Snapshot Client** `lib/sync/snapshotClient.ts` — descarga estado completo y aplica a Dexie.
- **Hook UI** `useSyncStatus` + `<SyncStatusBadge />` reusables.

### WebSockets / Live Sessions
- **Cliente** `lib/socket/socketClient.ts` — singleton Socket.IO con reconexión (backoff 1s→5min).
- **Hooks** `useSocket.ts` — `useSocket`, `useSocketStatus`, `useLiveSession`, `useLeaderboardRealtime`.
- **Beat Sync** `beatSync.ts` — interpolación lineal del beat entre frames con `requestAnimationFrame`.
- **Auth**: handshake con `auth.token` (JWT), server adjunta `socket.data.userId`.
- **Guest QR token**: viaja en `socket.data.autoJoinSessionId` (no JWT). Guest userId = `guest:<hostId>`.
- **Recovery on restart** `liveSession.service.ts` rehidrata el registry al boot.

---

## Testing

### apps/web (Vitest + jsdom)

Setup en `src/test/setup.tsx`:
- Mocks: `framer-motion`, `@/audio/AudioEngine`
- Dexie: `fake-indexeddb/auto`
- Polyfills: `structuredClone`, `crypto.randomUUID`, `crypto.subtle.digest`

**Seed obligatorio en beforeEach**:
```ts
await db.styles.add({ id: 'test-style', ... })
await db.tips.add({ id: 'test-tip', ... })
await db.songs.add({ id: 'test-song', ... })
```

**Utility**: `renderWithProviders(<Component />, { initialEntries: ['/path'] })` en `src/test/utils.tsx`.

### apps/api (Vitest + supertest)

Setup en `tests/setup.ts` — variables de entorno de test cargadas. Tests de integración con supertest + app Express real. **DB de test**: `worship_piano_test` (separada de dev).

### packages/audio (Vitest Node)

Lógica Tone.js testeada en Node (sin DOM).

---

## Convenciones de código

Ver `AGENTS.md` para el detalle completo. Resumen:
- TypeScript `strict: true`. Variables/parámetros sin uso rompen el build.
- Alias: `@/` → `apps/web/src/`, `@api/` → `apps/api/src/`.
- `pnpm@9.0.0`, Node `>=20`.
- Tests obligatorios para nueva lógica. Mantener ratio verde 100%.
- Idioma: todo en **Español** (código en inglés, comentarios/docs en español).

---

## CI/CD

| Workflow | Trigger | Descripción |
|----------|---------|-------------|
| `ci.yml` | push a `main` o PR | Lint + typecheck + tests (web/audio/api) + build |
| `deploy.yml` | push a `main` | Vercel deploy del frontend |
| `docker-publish.yml` | push a `main`, PR, tag `v*` | Publica `ghcr.io/ismapx/chordshift-api` con tags multi-source |
| `release.yml` | tag `v*` o manual | Binarios Electron (Win/Mac/Linux) + APK Android |
| `deploy-api.yml` | manual | SSH deploy a servidor propio (opcional) |

### Orden de validación CI

```
typecheck → lint → test (en paralelo) → build
```

Si `typecheck` falla, no corren los demás. Si `lint` o `test` fallan, no se hace `build`.

---

## Troubleshooting

### "toca para empezar" reaparece al navegar

`<AudioGate>` está mal ubicado. Verifica que esté en `main.tsx` (root), NO dentro de layouts.

### Prisma client no encontrado

```bash
cd apps/api
pnpm prisma:generate
```

### Docker build falla con "Cannot find module"

Verifica que `pnpm install` en el Dockerfile se ejecute sin filter (instala devDeps de workspaces). El `pnpm prune --prod` rompe los symlinks de workspaces — no incluir.

### Capacitor `cap sync` no copia el build

```bash
cd apps/web
pnpm build         # genera dist/
pnpm exec cap sync android
```

### Tests con error "navigator.onLine is undefined"

Está mockeado en `src/test/setup.tsx`. Verifica que el test importe el setup correctamente.

### APK falla con "kotlin-stdlib version conflict"

Parche aplicado en `apps/web/android/app/build.gradle`:
```gradle
configurations.all {
    resolutionStrategy {
        force 'org.jetbrains.kotlin:kotlin-stdlib:1.9.22'
    }
    exclude group: 'org.jetbrains.kotlin', module: 'kotlin-stdlib-jdk7'
    exclude group: 'org.jetbrains.kotlin', module: 'kotlin-stdlib-jdk8'
}
```

---

## Licencia

Privado. Todos los derechos reservados.

---

## Releases

- [v0.2.0](https://github.com/IsmaPX/ChordShift/releases/tag/v0.2.0) — Docker deploy, API completa, live sessions
- [v0.1.0](https://github.com/IsmaPX/ChordShift/releases/tag/v0.1.0) — PWA + Electron (inicial)
