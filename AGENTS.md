# Worship Piano App / ChordShift

> **Idioma Principal**: Todo el desarrollo, documentación y comunicación de este repositorio debe ser en **Español**. Código en inglés, comentarios y docs en español.

Monorepo Turborepo · pnpm 9 · Node >=20 · TypeScript strict

---

## Estructura

| Paquete | Qué es | Tests |
|---|---|---|
| `apps/web` | Vite + React 18 + Electron 33 (cliente) + Capacitor Android | Vitest + jsdom |
| `apps/api` | Express 4.21 + Prisma 5.22 + PostgreSQL 16 (backend REST + Socket.IO) | Vitest + supertest |
| `packages/audio` | Lógica Tone.js compartida, tests en Node | Vitest |
| `packages/db` | Solo interfaces TypeScript compartidas | — |
| `packages/ui` | Solo exporta `cn` (helper clsx) | — |

> README raíz tiene la referencia completa (variables de entorno, troubleshooting, deploy paso a paso). Esta guía es solo el concentrado de lo que un agente **no vería a primera vista**.

---

## Trampas y reglas no obvias

### Frontend (`apps/web`)

- **No existe `App.tsx`.** `main.tsx` monta `RouterProvider` directo, envuelto en `QueryClientProvider` → `LanguageProvider` → `OnboardingProvider` → `AudioGateProvider` → `AudioGate`. `syncManager.init()` y `getSocketClient()` se llaman a nivel de módulo (top-level) — no dentro de un componente.
- **`<AudioGate>` y `<AudioGateProvider>` deben quedarse en `main.tsx` (root).** Moverlos a un layout causa remounts y vuelve a aparecer "toca para empezar" cada navegación. El `AudioGateContext` vive en `src/contexts/AudioGateContext.tsx`.
- **Dual Audio Engine — regla dura:**
  - `packages/audio/` → lógica Tone.js testeable en Node.
  - `apps/web/src/audio/` → wrapper singleton de Tone.js para el navegador, mockeado en tests.
  - **No importar clases de `packages/audio` dentro de `apps/web/src/`** — los tests web mockean `@/audio/AudioEngine`, no `packages/audio`.
- **Router dual**: `createHashRouter` cuando `VITE_ELECTRON_BUILD=true`, sino `createBrowserRouter`. La elección vive en `src/lib/router.tsx` según `import.meta.env`.
- **Route groups** en `src/app/`: `(auth)/` (login, register), `(app)/` (todo lo autenticado), `(demo)/` (effects). Rutas: `/practice`, `/practice/:songId`, `/ear-training`, `/encyclopedia`, `/settings`, `/leaderboard`, `/shared`, `/sync`, `/join`, `/live/:songId`, `/demo/effects`.
- **Tailwind 4**: `@import "tailwindcss"` en `index.css` + variables en `@theme`. Claves anime: `anime-pink/blue/purple/glow`, `neon-cyan/pink`. Utilities custom: `glow-green/pink/blue`, `text-gradient-anime/green`.
- **PWA**: el service worker se registra solo si `!('isElectron' in window)`.
- **`VITE_APP_VERSION`** viene de `vite.config.ts` (`define`), NO de `.env`.
- **Electron**: `base: './'` en `vite.config.ts` cuando `VITE_ELECTRON_BUILD=true`; las rutas deben ser relativas para funcionar en el build desktop.
- **Capa API opcional** (`src/lib/api`): `repositoryProvider` elige Dexie o API según `VITE_API_URL` o `localStorage['worship_piano_backend_mode']`. Default: Dexie (offline-first). Páginas `/leaderboard` y `/shared` solo se muestran si `isApi === true`. Toggle en runtime: `localStorage.setItem('worship_piano_backend_mode', 'api')`.
- **Sync offline-first** (`src/lib/sync`): `outbox.ts` (IndexedDB persistente, max 5 intentos por op) + `syncManager.ts` (auto-flush en eventos `online`/`offline`) + `snapshotClient.ts` (hidratar Dexie desde `/api/sync/snapshot`). Hook UI: `useSyncStatus()` + `<SyncStatusBadge />`.
- **Socket.IO cliente** (`src/lib/socket`): singleton con backoff 1s→5min. `useSocket`, `useSocketStatus`, `useLiveSession`, `useLeaderboardRealtime`. `beatSync.ts` interpola beats con `requestAnimationFrame` y `classifyDrift()` colorea la latencia.
- **E2E con Playwright**: specs en `apps/web/e2e/` y `@playwright/test` instalado, pero **no hay script `test:e2e` en `package.json`**. Ejecutar `npx playwright test` manualmente.
- **Eslint** (`apps/web/eslint.config.mjs`): `@typescript-eslint` con `no-unused-vars: warn` (permite prefijo `_`), `no-explicit-any: off`, `no-empty-object-type: off`.
- **Path alias**: `@/` → `apps/web/src/`. No existe `@api/` como alias real.

### Backend (`apps/api`)

- **Patrón en capas**: `routes/` → `controllers/` → `services/` → `Prisma`. Validación con Zod en `validators/` para TODA entrada.
- **Prisma singleton** en `config/database.ts` para evitar instancias duplicadas en HMR. Si Prisma Client no se encuentra: `cd apps/api && pnpm prisma:generate`.
- **Variables de entorno validadas con Zod** en `config/env.ts` (fail-fast al arrancar). Ver `apps/api/.env.example` para la lista completa. Críticas: `DATABASE_URL`, `JWT_SECRET` (>=32 chars), `CORS_ORIGIN`, `STORAGE_DRIVER`, `VAPID_*`.
- **Storage factory** con drivers `local` | `s3` (R2/MinIO/DO Spaces compatible) | `supabase`. Selección por `STORAGE_DRIVER`.
- **Errores centralizados** en `middleware/error.middleware.ts`: `ZodError` → 400, `Prisma P2002` (unique) → 409, `Prisma P2025` (not found) → 404.
- **Auth JWT**: header `Authorization: Bearer <token>`, expira 7 días. Bcrypt para password y PIN (rounds via `BCRYPT_ROUNDS`).
- **Migraciones**: `pnpm prisma:migrate` (dev) o `pnpm prisma:deploy` (prod). **Nunca** edites `schema.prisma` sin generar migración. Seed: `pnpm db:seed` crea admin (`admin@worshippiano.app / admin123456`), estilos, tips y canciones preset.
- **WebSockets / live sessions** (`src/sockets`): rooms `session:<id>` y `leaderboard:<category>:<period>`. El handshake envía `auth.token` (JWT) y el server adjunta `socket.data.userId`. Guest QR pasa por `socket.data.autoJoinSessionId` (NO es JWT); el `userId` del guest es `guest:<hostId>`.
- **Live Session Registry**: estado en memoria (`liveSession.registry.ts`) con TTL (`SESSION_TTL_MS`, default 1h). **No persiste cada beat** — solo metadata en `LiveSession` (Prisma). `liveSession.service.ts` rehidrata el registry desde DB en `recoverFromDatabase()` al boot. `notifyLeaderboardChanged()` debe llamarse desde controllers de session/ear-training cuando hay cambios significativos.
- **Endpoints REST auxiliares** para live: `POST /api/live-sessions`, `GET /api/live-sessions/:id`, `POST /api/live-sessions/:id/end`. Pause/resume/beat **solo** por socket.
- **DB de test**: `worship_piano_test` (separada de dev). Tests integración con supertest + app Express real.
- **Path alias en tsconfig.json**: `@chordshift/db` → `../../packages/db/src/index.ts`.

### Electron / Desktop

- `app.requestSingleInstanceLock()` es obligatorio en `electron/main.ts`.
- `loadFile()` siempre con `.catch()` para evitar crashes silenciosos.
- CSP nonce implementado para scripts inyectados.
- Atajos globales: `CommandOrControl+Shift+P/E/S` → practice / ear-training / settings.

### Android (Capacitor)

- Requiere **Java 21** en el entorno de build.
- Parche `kotlin-stdlib` en `apps/web/android/app/build.gradle` (fuerza `1.9.22`, excluye `kotlin-stdlib-jdk7/8`) para resolver conflicto Capacitor 6 + Java 21.
- `pnpm cap:sync` copia `dist/` a `android/app/src/main/assets/public/`. Requiere haber corrido `pnpm build` antes.
- `versionCode` se calcula como `$(date +%s)` en CI; `versionName` viene del tag.
- Comandos: `cd apps/web && pnpm cap:sync && pnpm cap:open`.

---

## Comandos clave

```bash
# Root
pnpm dev          # turbo dev — todos los servers
pnpm build        # turbo build
pnpm typecheck    # turbo typecheck
pnpm lint         # turbo lint
pnpm test         # turbo test (vitest watch)
pnpm test:run     # turbo test (run-once)

# apps/web (cd apps/web)
pnpm dev                   # vite en :5173
pnpm dev:electron          # VITE_ELECTRON_BUILD=true vite
pnpm build:electron        # build con main/preload de Electron
pnpm dist:win|mac|linux    # electron-builder
pnpm release               # electron-builder --x64 --publish always
pnpm android:assemble      # gradlew assembleDebug
pnpm android:bundle        # gradlew bundleRelease

# apps/api (cd apps/api)
pnpm dev                   # tsx watch en :3001
pnpm prisma:migrate        # dev
pnpm prisma:deploy         # prod
pnpm db:seed               # datos iniciales
pnpm docker:up             # stack local (postgres + api)

# packages/audio (cd packages/audio)
pnpm test                  # vitest node
```

Lista exhaustiva con todas las variantes en `README.md` raíz.

---

## Testing

- **Web setup** (`apps/web/src/test/setup.tsx`): mocks `framer-motion` y `@/audio/AudioEngine`, carga `fake-indexeddb/auto`, polyfillea `structuredClone` / `crypto.randomUUID` / `crypto.subtle.digest`.
- **Seed automático en `setup.tsx`**: el `beforeEach` ya hace seed de `styles`, `tips` y `songs` en IndexedDB. No hace falta repetirlo salvo que necesites datos adicionales.
- **Utilidad**: `renderWithProviders(<Component />, { initialEntries: ['/path'] })` en `src/test/utils.tsx`.
- Si un test se queja de `navigator.onLine is undefined`, revisa que importe el setup correctamente.

---

## CI / Deploy

**Orden de validación CI** (`ci.yml`): `lint-and-typecheck` (web only) y `test` (web + audio) corren en paralelo tras `install`; `build` depende de ambos. `lint-and-typecheck` corre `typecheck` y luego `lint` secuencialmente en `apps/web`. El job `test` **no corre tests de API** en CI.

| Workflow | Trigger | Salida |
|---|---|---|
| `ci.yml` | push/PR a `main`/`develop` | lint + typecheck + tests web/audio + build web |
| `deploy.yml` | push a `main` | Vercel |
| `docker-publish.yml` | push/main, PR, tag `v4*` | `ghcr.io/<owner>/chordshift-api` |
| `release.yml` | tag `v*` o manual | Electron (Win/Mac/Linux) + APK Android |
| `deploy-api.yml` | manual | SSH deploy a servidor propio |

- **Code signing** (Electron) es opcional. Sin secrets, los binarios suben sin firmar. Con `CSC_IDENTITY_AUTO_DISCOVERY=false` se desactiva la búsqueda automática de certs.

---

## TypeScript

- `strict: true`, `noUnusedLocals`, `noUnusedParameters` — variables o parámetros sin uso rompen el build.
- Root `tsconfig.json` solo declara references; no compila nada directo.
- `@/` → `apps/web/src/`.

---

## MusicStaff — Alineación de notas en el pentagrama

El contenedor de notas (`.music-staff-notes-container`) usa el mismo `inset-y-*` que el contenedor de líneas (`.music-staff-lines`) para alinear los sistemas de coordenadas. Las notas usan `transform: translateX(-50%)` (solo centrado horizontal, sin `translateY`). El `top: 0%` de la nota más grave coincide con la primera línea del pentagrama.

Convención de coordenadas: `E4 = position 0`, `F4 = 0.5`, `G4 = 1`, `A4 = 1.5`, `B4 = 2` (línea media), `C5 = 2.5`, `D5 = 3`, `E5 = 3.5`, `F5 = 4` (línea superior). Posiciones <0 o >4 generan `ledger lines` automáticamente.

Archivos clave: `src/components/practice/MusicStaff/Component.tsx`, `src/components/practice/MusicStaff/pitch.ts`, `src/index.css` (clases `music-staff-*`).

---

## Agentes especializados de OpenCode

El proyecto incluye **8 agentes especializados** en `.opencode/agents/` que puedes invocar con `@nombre` en cualquier conversación.

### Agentes de análisis (solo lectura, sin cambios)

| Agente | Qué hace | Cuándo invocarlo |
|--------|----------|-------------------|
| `@music-staff-revisionist` | Verifica alineación de notas en pentagrama | Cuando toques archivos de `MusicStaff/` |
| `@security-auditor` | Escanea credenciales expuestas y config insegura | Antes de commit, especialmente con secrets |
| `@sync-architect` | Valida consistencia offline/online y repository layer | Cuando toques `src/lib/api/`, `src/lib/sync/`, o `packages/db` |
| `@ts-dead-code-hunter` | Detecta código muerto, imports no usados | Antes de cada PR, cuando `typecheck` falla |

### Agentes de validación (ejecutan comandos)

| Agente | Qué hace | Cuándo invocarlo |
|--------|----------|-------------------|
| `@deploy-smoke-tester` | Valida config de deploy/CI, ejecuta builds de prueba | Cuando toques `.github/workflows/`, `vercel.json`, `Dockerfile` |
| `@bundle-watcher` | Monitorea tamaño del bundle, detecta crecimiento | Después de agregar dependencies o refactors |
| `@e2e-guardian` | Verifica que cambios UI no rompen tests E2E | Cuando toques componentes de `src/app/(app)/*` |
| `@monorepo-sync` | Mantiene consistencia de estructura | Cuando crees packages nuevos o modifiques tsconfig |

### Ejemplo de uso

```
@music-staff-revisionist Revisa los cambios en pitch.ts de este commit
@security-auditor Hay algún secret expuesto en este PR?
@ts-dead-code-hunter Qué imports muertos hay en packages/audio?
@deploy-smoke-tester Valida el workflow de release.yml
@monorepo-sync Se rompío algo en la estructura del monorepo?
```

### Notas

- Los agentes están en `.opencode/agents/*.md` y se descubren automáticamente
- Tienen permisos restrictivos: `edit: deny` para la mayoría (solo leen)
- `monorepo-sync` tiene `edit: ask` (pide permiso antes de cambiar)
- Pueden cargar skills del proyecto con `skill({ name: "..." })` cuando lo necesiten
