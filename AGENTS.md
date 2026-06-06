# Worship Piano App / ChordShift

**Idioma Principal**: Todo el desarrollo, documentación y comunicación de este repositorio debe ser en **Español**.

---

## Monorepo (Turborepo)

| Paquete | Descripción | Tests |
|---|---|---|
| `apps/web` | Vite + React 19 + Electron 33 (cliente) | Vitest + jsdom |
| `apps/api` | Express + Prisma + PostgreSQL (backend) | Vitest + supertest |
| `packages/audio` | Tone.js lógica compartida | Vitest (Node) |
| `packages/db` | Interfaces TypeScript | — |
| `packages/ui` | Utility `cn` | — |

**Package Manager**: `pnpm@9.0.0`, Node `>=20`.

## Comandos

```bash
# Root (usa turbo)
pnpm dev          # Inicia todos los dev servers
pnpm build        # Build de todos los paquetes
pnpm lint         # Lint de todos los paquetes (depende de build)
pnpm typecheck    # Typecheck de todos los paquetes (depende de build)
pnpm test         # Tests de todos los paquetes (depende de build)

# apps/web (cd apps/web)
pnpm dev                    # Vite dev server (localhost:5173)
pnpm dev:electron           # VITE_ELECTRON_BUILD=true vite
pnpm build                  # tsc -b && vite build
pnpm build:electron         # cross-env VITE_ELECTRON_BUILD=true vite build
pnpm dist:win|mac|linux     # electron-builder packaging
pnpm test                   # vitest
pnpm lint                   # eslint .
pnpm typecheck              # tsc --noEmit

# apps/api (cd apps/api) — Backend REST
pnpm dev              # Servidor con hot-reload (tsx watch) en puerto 3001
pnpm build            # Compilar TypeScript → dist/
pnpm start            # Servidor producción
pnpm test             # vitest (watch)
pnpm test:run         # vitest (CI)
pnpm prisma:generate  # Generar Prisma Client
pnpm prisma:migrate   # Crear/aplicar migración (dev)
pnpm prisma:deploy    # Aplicar migraciones (prod)
pnpm prisma:studio    # GUI en http://localhost:5555
pnpm db:seed          # Ejecutar seed inicial

# packages/audio (cd packages/audio)
pnpm build                  # tsc
pnpm test                   # vitest
```

**Orden CI**: `typecheck` → `lint` → `test` (en paralelo después de typecheck) → `build`.

---

## Arquitectura y Quirks

### Sin App.tsx
`main.tsx` renderiza `RouterProvider` directamente. No existe `App.tsx`.

### Router
React Router v7. Pages en `src/app/` con route groups:
- `(auth)/` → login, register
- `(app)/` → practice, ear-training, encyclopedia, settings
- `(demo)/` → effects demo

Usa `createHashRouter` si `VITE_ELECTRON_BUILD=true`, sino `createBrowserRouter`.

### AudioGate Global (CRÍTICO)
`AudioGateContext` vive en `src/contexts/AudioGateContext.tsx`. `<AudioGateProvider>` y `<AudioGate>` se colocan en `main.tsx` a nivel root.
**No colocar `<AudioGate>` dentro de layouts** — causa remounts y reaparece "toca para empezar".

### Dual Audio Engine (CRÍTICO)
1. `packages/audio/` — Lógica compartida, tests en Node.
2. `apps/web/src/audio/` — Wrapper web (singleton Tone.js), tests mockean `@/audio/AudioEngine`.

**Regla**: No importar clases de `packages/audio` dentro de `apps/web/src/`.

### Paquetes
- `packages/db` solo contiene interfaces TypeScript.
- `packages/ui` solo exporta `cn` (clsx helper).

### Tailwind 4
Usa `@import "tailwindcss"` en `index.css` y variables en `@theme`. Colores anime disponibles:
`anime-pink`, `anime-blue`, `anime-purple`, `anime-glow`, `neon-cyan`, `neon-pink`.
Utilities: `glow-pink`, `glow-blue`, `text-gradient-anime`, `glow-green`, `text-gradient-green`.

### PWA
SW en `main.tsx` solo si `!('isElectron' in window)`.

### VITE_APP_VERSION
Definida en `vite.config.ts` via `define`, no en `.env`.

### Backend (apps/api)
- **Patrón en capas**: routes → controllers → services → Prisma
- **Validación con Zod** en todos los inputs (ver `validators/`)
- **Auth JWT**: token expira en 7 días, header `Authorization: Bearer <token>`
- **Hasheo**: bcrypt para password y PIN, rounds configurables via `BCRYPT_ROUNDS`
- **Errores centralizados** en `middleware/error.middleware.ts` (ZodError → 400, Prisma P2002 → 409, P2025 → 404)
- **Prisma Singleton**: `config/database.ts` evita múltiples instancias en HMR
- **Variables de entorno validadas con Zod** en `config/env.ts` (falla rápido al arranque)
- **Migraciones**: usar `prisma:migrate` (dev) o `prisma:deploy` (prod). Nunca modificar `schema.prisma` sin generar migración
- **Seed**: estilos, tips, canciones preset y usuario admin (`admin@worshippiano.app / admin123456`)

### Capa API en Frontend (apps/web/src/lib/api)
- **Cliente HTTP** `client.ts` — wrapper sobre `fetch` con auth automática y error tipado (`ApiError`)
- **Token Store** `tokenStore.ts` — JWT persistido en localStorage con caché en memoria
- **Repositories API** — `ApiAuthService`, `ApiSongRepository`, `ApiPracticeSessionRepository`, `ApiSettingsRepository`, `ApiStyleRepository`, `ApiTipRepository`, `ApiEarTrainingRepository`. Todos implementan las interfaces existentes (drop-in replacements de las versiones Dexie).
- **Provider selector** `repositories/provider.ts` — `repositoryProvider.getXRepository()` devuelve Dexie o API según `repositoryProvider.getMode()`. Default: `dexie` (preserva offline-first). Override via `VITE_API_URL` o `localStorage.setItem('worship_piano_backend_mode', 'api')`.
- **Hook** `useBackendMode` — suscribe a cambios del provider con `useSyncExternalStore` para re-renderizar al alternar.
- **Hooks de TanStack Query** `useApiFeatures.ts` — `useUserStats`, `useEarTrainingStats`, `useLeaderboard`, `useSharedWithMe`, `useMyShares`, `useCreateShare`, `useRevokeShare`, `useUploadAudio`, `useSongAudio`.
- **Páginas de ejemplo** — `/leaderboard` (ranking global) y `/shared` (canciones compartidas conmigo). Solo visibles con `isApi === true`.
- **Activación cloud**: definir `VITE_API_URL` en `.env` y arrancar `apps/api` en paralelo (`pnpm dev` desde raíz).

### Sync Offline-First (apps/web/src/lib/sync)
- **Outbox** `outbox.ts` — IndexedDB persistente (`WorshipPianoOutbox`) para operaciones pendientes. Estados: `pending → syncing → applied | rejected`. Max 5 intentos por op.
- **SyncManager** `syncManager.ts` — orquesta el flush. Detecta `online`/`offline` events del browser, deduplica flushes concurrentes, backoff implícito entre intentos, y emite eventos para la UI.
- **Offline Queue** `offlineQueue.ts` — helpers para enqueuear operaciones (`createSong`, `createSession`, `addXp`, `updateSettings`, etc.) con un solo call.
- **Snapshot Client** `snapshotClient.ts` — descarga el estado completo del usuario desde `/api/sync/snapshot` y lo aplica a Dexie (hidratación inicial o recuperación).
- **Hook UI** `useSyncStatus.ts` — `useSyncStatus()` + `<SyncStatusBadge />` reusables. Inicializar `syncManager.init()` una sola vez (ya está en `main.tsx`).
- **Inicialización**: `syncManager.init()` se llama automáticamente en `main.tsx`. Detecta conexión, suscribe a eventos del browser, y dispara flush inicial si hay sesión.

### WebSockets / Sesiones en vivo (apps/web/src/lib/socket + apps/api/src/sockets)
- **Cliente** `socketClient.ts` — singleton Socket.IO con reconexión (backoff 1s→5min), queue de comandos offline, y API tipada. Se inicializa en `main.tsx` con `getSocketClient()`.
- **Hooks** `useSocket.ts` — `useSocket()`, `useSocketStatus()`, `useLiveSession()`, `useLeaderboardRealtime()`. Integración con TanStack Query via `invalidateQueryKey`.
- **Beat Sync** `beatSync.ts` — interpolación lineal del beat entre frames usando `requestAnimationFrame` y `bpm/60_000` beats/ms. `classifyDrift()` para colorear la latencia.
- **Página demo** `/live/:songId` — crea sesión, host reporta beats a 10fps (cliente UI a 60fps via rAF), participantes ven drift en ms.
- **Auth**: handshake con `auth.token` (JWT). Server valida y adjunta `socket.data.userId`.
- **Rooms**: `session:<id>` y `leaderboard:<category>:<period>`. Subscripción a leaderboard emite `leaderboard:updated` cuando hay cambios.
- **Registry** `liveSession.registry.ts` — estado en memoria de sesiones activas (TTL configurable, sin DB por beat). Emite eventos `created`/`ended` (host/ttl) via `onLifecycle()`. Sólo metadata en Prisma (`LiveSession`).
- **Recovery on restart** `liveSession.service.ts` — `recoverFromDatabase()` rehidrata el registry con sesiones activas (filtradas por `SESSION_TTL_MS`). Se llama en `server.ts` al boot.
- **Persistencia de endedAt** via lifecycle hook — la registry emite `ended` y el service actualiza `endedAt` en Prisma (host o TTL).
- **Emisor de leaderboard** `leaderboardEmitter.service.ts` — `notifyLeaderboardChanged()` se llama desde controllers de session/ear-training tras cambios significativos.
- **Endpoints REST auxiliares**: `POST /api/live-sessions` (crear), `GET /api/live-sessions/:id` (estado), `POST /api/live-sessions/:id/end` (finalizar). Pause/resume/beat sólo por socket.

---

## TypeScript & Lint
- `strict: true`. Variables/parámetros sin uso rompen el build.
- `@/` → `apps/web/src/`.
- `@api/` → `apps/api/src/` (alias solo disponible en tests, ver `tsconfig`)

## Testing

### Web (apps/web)
**Setup**: `src/test/setup.tsx`
- Mocks: `framer-motion`, `@/audio/AudioEngine`
- Dexie: `fake-indexeddb/auto`
- Polyfills: `structuredClone`, `crypto.randomUUID`, `crypto.subtle.digest`

**Seed obligatorio** en `beforeEach` (db seeds evitan que `useAuth.seedIfEmpty` falle):
```ts
await db.styles.add({ id: 'test-style', ... })
await db.tips.add({ id: 'test-tip', ... })
await db.songs.add({ id: 'test-song', ... })
```

**Utility**: `renderWithProviders(<Component />, { initialEntries: ['/path'] })` en `src/test/utils.tsx`.

### API (apps/api)
**Setup**: `tests/setup.ts` — variables de entorno de test cargadas.
**Tests integración** con `supertest` + app Express real.
**DB de test**: `worship_piano_test` (separada de dev).

## Electron
- `loadFile()` requiere `.catch()` para evitar crashes silenciosos.
- `app.requestSingleInstanceLock()` es obligatorio.
- `extraResources`: Twilio usa `process.resourcesPath` en producción.
- Atajos globales: `Ctrl+Shift+P/E/S` → practice/ear-training/settings.
- CSP nonce implementado para scripts inyectados.

## CI/CD & Deploy
- **Vercel** (rama `main`): `https://web-1tmdqw12l-maikel-js-projects.vercel.app`
- **GitHub Releases**: Tags `v*` para releases de escritorio.
- **Android**: Capacitor + Java 21. Requiere parche `kotlin-stdlib` en `build.gradle`.
- **API Twilio**: Duplicada en `apps/web/api/` (serverless) y `electron/ipc-handlers.ts` (IPC).
- **Backend (apps/api)**: desplegar en Railway/Render/Fly.io. Variables de entorno en dashboard del provider.
