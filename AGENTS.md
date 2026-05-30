# Worship Piano App / ChordShift

Monorepo (Turborepo npm): `apps/web` (Vite + React 19 + Electron 33), `packages/audio` (Tone.js), `packages/db` (tipos compartidos), `packages/ui` (solo `cn` utility).

## Stack

- **Web/Desktop**: React 19 + Vite 6 + Electron 33 + TailwindCSS 4 + TanStack Query + React Router v7
- **Audio**: Tone.js 15 (dos implementaciones independientes — ver abajo)
- **DB local**: Dexie (IndexedDB)
- **Backend**: Supabase Auth + PostgreSQL, Vercel serverless (Twilio)
- **i18n**: i18next + react-i18next
- **Testing**: Vitest, jsdom, @testing-library/react, fake-indexeddb

## Comandos

Ejecutar desde `apps/web/` para comandos específicos, desde raíz para turbo.

### Raíz del monorepo
| Comando | Acción |
|---------|--------|
| `npm run dev` | `turbo dev` (dev servers paralelos) |
| `npm run build` | `turbo build` |
| `npm run lint` | `turbo lint` (depende de `^build`) |
| `npm run typecheck` | `turbo typecheck` (depende de `^build`) |
| `npm run test` | `turbo test` (depende de `^build`) |

### apps/web/
| Comando | Acción |
|---------|--------|
| `npm run dev` | Vite (puerto 5173) |
| `npm run dev:electron` | Vite + Electron hot reload |
| `npm run build` | `tsc -b && vite build` |
| `npm run build:electron` | `tsc -b && cross-env VITE_ELECTRON_BUILD=true vite build` |
| `npm run lint` | `eslint .` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest (jsdom) |
| `npm run dist:win` | Build + package Windows NSIS |
| `npm run dist:mac` | Build + package macOS DMG |
| `npm run dist:linux` | Build + package Linux AppImage/deb |
| `npm run release` | Build + publish a GitHub Releases |

### packages/audio/
| Comando | Acción |
|---------|--------|
| `npm run test` | Vitest (entorno **node**, no jsdom) |
| `npm run build` | `tsc` |

## TypeScript

- `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`, `noFallthroughCasesInSwitch: true`
- Variables o parámetros sin uso rompen `tsc -b` / `tsc --noEmit`
- `@/` → `apps/web/src/` (configurado en vite.config.ts y vitest.config.ts)
- `import.meta.env.VITE_APP_VERSION` definido vía `define` en vite (lee de package.json), **no** de `.env`

## ESLint

- `prefer-const: off` — no exige `const` sobre `let`
- `no-console: warn`, solo permite `warn`/`error`
- `@typescript-eslint/no-unused-vars: warn`

## Arquitectura

### No existe `App.tsx`
`main.tsx` renderiza `RouterProvider` directamente (sin componente `<App>` wrapper). Cadena: `StrictMode → QueryClientProvider → LanguageProvider → RouterProvider`.

### Router
React Router v7. Usa `react-router` (no `react-router-dom`). Router condicional:
- `VITE_ELECTRON_BUILD=true` → `createHashRouter`
- caso contrario → `createBrowserRouter`
El tipo de router se hornea en build time, no se detecta en runtime.

Directorios `(app)/` y `(auth)/` son solo agrupación visual (Next.js App Router style), no afectan rutas.

| Ruta | Componente | Layout |
|------|-----------|--------|
| `/` | LandingPage | — |
| `/login` | LoginPage | — |
| `/register` | RegisterPage | — |
| `/practice` | PracticePage | AppLayout |
| `/practice/:songId` | PracticePlayerPage | AppLayout |
| `/ear-training` | EarTrainingPage | AppLayout |
| `/encyclopedia` | EncyclopediaPage | AppLayout |
| `/settings` | SettingsPage | AppLayout |

### Paquetes
- `packages/db` — solo **tipos** (`interface`), sin runtime
- `packages/ui` — solo exporta `cn(...classes)` (filtra falsy y join con espacio, **no** tailwind-merge)
- `packages/audio` — lógica de audio compartida, **no importar sus clases de audio en apps/web/src/**

### Motor de audio dual
Dos implementaciones independientes que **no se importan entre sí**:

1. `packages/audio/` — `AudioEngine`, `ChordPlayer`, generación de ejercicios. Tests en node, mockea `tone` directamente.
2. `apps/web/src/audio/` — wrapper web: `AudioEngine.ts` (singleton con flag `_initializing`), `ChordPlayer.ts`, `ExerciseGenerator.ts`, instrumentos (piano/guitar/trumpet). Tests lo mockean completamente via `setup.tsx`.

Ambos usan Tone.js pero con cadenas de audio independientes. El web nunca debe importar de `packages/audio` las clases de audio.

### TailwindCSS 4
Usa `@import "tailwindcss"` en CSS (no el plugin PostCSS de Tailwind v3). Variables en `@theme`, utilities con `@utility`.

### PWA
Service worker (`/sw.js`) se registra en `main.tsx` solo cuando **no** es Electron (`!('isElectron' in window)`).

### Variables de entorno requeridas (dev)
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_ENV=development
```

## Tests

### Configuración
- **apps/web**: vitest + jsdom, setup en `src/test/setup.tsx`
- **packages/audio**: vitest + node, sin setup global ni vitest.config.ts

### Setup de tests web (setup.tsx)
- Mockea `framer-motion` (AnimatePresence, motion → divs)
- Mockea `@/audio/AudioEngine` completo (singleton con vi.fn())
- Activa `fake-indexeddb/auto` para Dexie
- Polyfills: `structuredClone`, `crypto.randomUUID`, `crypto.subtle.digest`
- **Seed obligatorio** en `beforeEach`: estilos, tips y song mínimos para evitar que `seedIfEmpty` de `useAuth` intente escribir

### Utilities de test
```ts
import { renderWithProviders } from '@/test/utils'
// Envuelve en QueryClientProvider + LanguageProvider + MemoryRouter
renderWithProviders(<MyComponent />, { initialEntries: ['/custom-path'] })
```

### Mock de audio en tests
`@/audio/AudioEngine` está mockeado globalmente en `setup.tsx`. No escribir tests que dependan de audio real.

## Electron Desktop

- `electron/main.ts` — BrowserWindow con `loadFile()` **requiere `.catch()`** (Promise no manejada = crash silencioso)
- `app.requestSingleInstanceLock()` obligatorio; `second-instance` maneja deep links
- `preload.ts` — contextBridge expone `window.isElectron` + `window.electronAPI`
- `electron-builder.yml`: `asar: false` (necesario para twilio extraResources), deep link `worship-piano://`
- CSP en `session.webRequest` solo para URLs http/https (no file://)
- Atajos globales: Ctrl+Shift+P/E/S → practice/ear-training/settings
- Twilio via IPC: simula respuesta exitosa si faltan credenciales

## CI/CD

- **Push a main/develop**: `ci.yml` → typecheck + lint (paralelo) → test (web + audio, paralelo) → build (secuencial, depende de tests)
- **Push a main**: `deploy.yml` → build + deploy a Vercel (project `prj_shAUREiwHUTCPTzEzU1weF5Hzzcy`)
- **workflow_dispatch**: `deploy.yml` build-android → Capacitor + Java 21
- **Tags v\***: `release.yml` → Electron build (Win/Mac/Linux, matrix) + GitHub Release + APK
- Lint/typecheck en CI corren solo en `apps/web/`, no en packages (excepto test de audio)
- VITE_ELECTRON_BUILD **no** se setea en CI normal — solo en release workflow

## API (Vercel Serverless + Electron IPC)

`apps/web/api/` contiene Twilio serverless functions (`send-otp`, `send-whatsapp`). Duplicado como IPC handlers en `electron/ipc-handlers.ts` (usa `process.resourcesPath/node_modules/twilio` en prod). Ambos devuelven éxito simulado si faltan credenciales.

## Errores Conocidos (no repetir)

### AudioEngine (apps/web/src/audio/AudioEngine.ts)
- Singleton con flag `_initializing` — evitar race conditions en llamadas concurrentes a `initialize()`
- `Tone.Recorder` conectar solo durante `startRecording()`, desconectar en `stopRecording()`
- `new Tone.Recorder()` en try-catch (falla sin MediaRecorder)

### Electron
- `loadFile()` requiere `.catch()` — Promise rechazada = crash
- `app.requestSingleInstanceLock()` obligatorio
- `extraResources` para twilio: `require()` usa `process.resourcesPath` en prod
- `npx cap add android` → conflicto kotlin-stdlib → parchear `build.gradle`
