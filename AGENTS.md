# Worship Piano App / ChordShift

**Idioma Principal**: Todo el desarrollo, documentación y comunicación de este repositorio debe ser en **Español**.

## Monorepo (Turborepo)

| Paquete | Descripción | Tests |
|---|---|---|
| `apps/web` | Vite + React 19 + Electron 33 | Vitest + jsdom |
| `packages/audio` | Tone.js lógica compartida | Vitest (Node) |
| `packages/db` | Interfaces TypeScript | — |
| `packages/ui` | Utility `cn` | — |

## Stack
- **Core**: React 19 + Vite 6 + Electron 33 + TailwindCSS 4 + TanStack Query + React Router v7.
- **Audio**: Tone.js 15 (Dual implementation).
- **DB**: Dexie (IndexedDB) + Supabase.
- **Package Manager**: pnpm 9.0.0, Node ≥20.

## Comandos

```bash
# Root (usa turbo)
npm run dev|build|test|lint|typecheck

# apps/web
npm run dev                    # Vite dev
npm run dev:electron           # VITE_ELECTRON_BUILD=true vite
npm run build                  # tsc -b && vite build
npm run build:electron         # cross-env VITE_ELECTRON_BUILD=true vite build
npm run dist:win|mac|linux     # electron-builder packaging
npm run test                   # vitest
npm run lint                   # eslint .
npm run typecheck              # tsc --noEmit

# packages/audio
npm run build                  # tsc
npm run test                   # vitest
```

## CI Pipeline (GitHub Actions)
`typecheck` → `lint` → `test` (web + audio en paralelo) → `build`

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

## TypeScript & Lint
- `strict: true`. Variables/parámetros sin uso rompen el build.
- `@/` → `apps/web/src/`.

## Testing (Web)

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