# Worship Piano App / ChordShift

**Idioma Principal**: Todo el desarrollo, documentación y comunicación de este repositorio debe ser en **Español**.

Monorepo (Turborepo): `apps/web` (Vite + React 19 + Electron 33), `packages/audio` (Tone.js), `packages/db` (Tipos), `packages/ui` (Utilidad `cn`).

## Stack
- **Core**: React 19 + Vite 6 + Electron 33 + TailwindCSS 4 + TanStack Query + React Router v7.
- **Audio**: Tone.js 15 (Dual implementation).
- **DB**: Dexie (IndexedDB) + Supabase.
- **Testing**: Vitest + jsdom (Web), Vitest + Node (Audio).

## Comandos
Ejecutar `turbo <cmd>` desde root o `npm run <cmd>` en la carpeta correspondiente.

| Ámbito | `dev` | `build` | `test` | `lint` | `typecheck` |
|---|---|---|---|---|---|
| **Root** | `npm run dev` | `npm run build` | `npm run test` | `npm run lint` | `npm run typecheck` |
| **Web** | `npm run dev` | `npm run build` | `npm run test` | `npm run lint` | `npm run typecheck` |
| **Audio** | — | `npm run build` | `npm run test` | — | — |

**Web/Electron Specifics**:
- `npm run dev:electron`: Dev con hot reload.
- `npm run build:electron`: Build con `VITE_ELECTRON_BUILD=true`.
- `npm run dist:win/mac/linux`: Packaging vía electron-builder.

## Arquitectura y Quirks
- **Sin `App.tsx`**: `main.tsx` renderiza el `RouterProvider` directamente.
- **Router**: React Router v7. Usa `createHashRouter` si `VITE_ELECTRON_BUILD=true`, sino `createBrowserRouter`.
- **Transiciones globales**: `RootLayout` en `layouts/` envuelve rutas con `AnimatePresence` + `PageTransition` (variants: fade, slide, wave, curtain).
- **Dual Audio Engine (CRÍTICO)**:
    1. `packages/audio/`: Lógica compartida. Tests en Node.
    2. `apps/web/src/audio/`: Wrapper web (Singleton). Tests mockean `@/audio/AudioEngine`.
    - **Regla**: No importar clases de `packages/audio` dentro de `apps/web/src/`.
- **Paquetes**: `packages/db` solo contiene interfaces; `packages/ui` solo exporta `cn`.
- **Tailwind 4**: Usa `@import "tailwindcss"` y variables en `@theme`.
- **PWA**: SW en `main.tsx` solo si `!('isElectron' in window)`.

## Arquitectura Modular (Nueva)
`src/` se organiza en:
- **`modules/`**: Feature modules (home, auth, gallery, music, profile). Cada módulo tiene su página y lógica encapsulada.
- **`components/animations/`**: Animaciones aisladas. Cada una sigue el patrón `index.ts`, `Component.tsx`, `animation.ts`, `types.ts`.
- **`components/effects/`**: Efectos decorativos anime-musicales (`FloatingNotes`, `RhythmPulse`, `AudioWave`).
- **`components/transitions/`**: Transiciones de página (`PageTransition` con variants fade/slide/wave/curtain).
- **`components/carousels/`**: Sistema de carruseles (`BaseCarousel`, `HeroCarousel`, `CharacterCarousel`, `CoverflowCarousel`).
- **`components/gallery/`**: Sistema de galerías (`GridGallery`, `MasonryGallery`, `InfiniteGallery`).
- **`components/ui/`**: Componentes base existentes (no modificar).
- **`hooks/`**: Custom hooks (ej: `useReducedMotion` para accesibilidad).
- **`layouts/`**: Layouts root (`RootLayout` con AnimatePresence).

### Patrón de animación
Cada animación en `components/animations/` contiene 4 archivos:
- `animation.ts`: Variants de Framer Motion.
- `types.ts`: Props del componente.
- `Component.tsx`: Implementación React.
- `index.ts`: Re-export.

**Regla**: Las animaciones NO contienen lógica de negocio.

### Tema anime-musical
Colores disponibles en Tailwind 4 (`@theme`):
- `anime-pink`, `anime-blue`, `anime-purple`, `anime-glow`, `neon-cyan`, `neon-pink`
- Utilities: `glow-pink`, `glow-blue`, `text-gradient-anime`
- Efectos: `FloatingNotes` (notas flotando), `AudioWave` (visualizador), `RhythmPulse` (pulso rítmico)

### Accesibilidad
- Hook `useReducedMotion` basado en `framermotion` respeta `prefers-reduced-motion`.
- Los carruseles soportan navegación por teclado y autoplay configurable.

## TypeScript & Lint
- `strict: true`. Variables/parámetros sin uso rompen el build (`tsc -b`).
- `@/` → `apps/web/src/`.
- `import.meta.env.VITE_APP_VERSION` se define en `vite.config.ts`, no en `.env`.

## Testing (Web)
- Setup: `src/test/setup.tsx` mockea `framer-motion` y `@/audio/AudioEngine`.
- Dexie: Usa `fake-indexeddb/auto`.
- Seed: Obligatorio en `beforeEach` para evitar fallos en `useAuth.seedIfEmpty`.
- Utility: `renderWithProviders(<Component />, { initialEntries: ['/path'] })`.

## Electron
- `loadFile()` requiere `.catch()` para evitar crashes silenciosos.
- `app.requestSingleInstanceLock()` es obligatorio.
- `extraResources`: Twilio usa `process.resourcesPath` en producción.
- Atajos: `Ctrl+Shift+P/E/S` → practice/ear-training/settings.

## CI/CD & API
- **CI**: `typecheck + lint` → `test` → `build`.
- **Deploy**: Vercel (main) y GitHub Releases (Tags `v*`).
- **Android**: Capacitor + Java 21. Requiere parche de `kotlin-stdlib` en `build.gradle`.
- **API**: Funciones Twilio duplicadas en `apps/web/api/` (serverless) y `electron/ipc-handlers.ts` (IPC).
