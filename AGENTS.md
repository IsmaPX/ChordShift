# Worship Piano App / ChordShift

**Idioma Principal**: Todo el desarrollo, documentación y comunicación de este repositorio debe ser en **Español**.

Monorepo (Turborepo): `apps/web` (Vite + React 19 + Electron 33), `packages/audio` (Tone.js), `packages/db` (Tipos), `packages/ui` (Utilidad `cn`).

## Stack
- **Core**: React 19 + Vite 6 + Electron 33 + TailwindCSS 4 + TanStack Query + React Router v7.
- **Audio**: Tone.js 15 (Dual implementation).
- **DB**: Dexie (IndexedDB) + Supabase.
- **Testing**: Vitest + jsdom (Web), Vitest + Node (Audio).

## Comandos
Desde root usar `turbo <cmd>` o `npm run <cmd>` en la carpeta correspondiente.

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
- **AudioGate Global**: El estado de inicialización de audio (`AudioGate`) vive en `src/contexts/AudioGateContext.tsx` y se provee a nivel de `main.tsx`. **No colocar `<AudioGate>` dentro de layouts** — eso causa remounts y que reaparezca "toca para empezar".
- **Dual Audio Engine (CRÍTICO)**:
    1. `packages/audio/`: Lógica compartida. Tests en Node.
    2. `apps/web/src/audio/`: Wrapper web (Singleton). Tests mockean `@/audio/AudioEngine`.
    - **Regla**: No importar clases de `packages/audio` dentro de `apps/web/src/`.
- **Paquetes**: `packages/db` solo contiene interfaces; `packages/ui` solo exporta `cn`.
- **Tailwind 4**: Usa `@import "tailwindcss"` y variables en `@theme`.
- **PWA**: SW en `main.tsx` solo si `!('isElectron' in window)`.

## Arquitectura Modular
`src/` se organiza en:
- **`modules/`**: Feature modules (home, auth, gallery, music, profile).
- **`components/`**: Sistema de componentes visuales.
- **`hooks/`**: Custom hooks (ej: `useReducedMotion` para accesibilidad).
- **`layouts/`**: Layouts root (`RootLayout` con AnimatePresence).

## Componentes Visuales

### Patrón de animación (4 archivos)
`components/animations/`, `components/effects/`, `components/transitions/`:
- `animation.ts`: Variants de Framer Motion.
- `types.ts`: Props del componente.
- `Component.tsx`: Implementación React.
- `index.ts`: Re-export.

**Regla**: Las animaciones NO contienen lógica de negocio.

### Efectos decorativos (`components/effects/`)
| Componente | Props clave |
|---|---|
| `FloatingNotes` | `count`, `color` |
| `AudioWave` | `className` |
| `RhythmPulse` | `active`, `color` |
| `MusicalParticles` | `count`, `color`, `speed` (slow/medium/fast) |
| `GlowTrail` | `color`, `length`, `zIndex` |
| `SparkleEffect` | `count`, `maxSize`, `color` |
| `BackgroundMotion` | `variant` (wave/particles/lines), `intensity` |

### Animaciones (`components/animations/`)
| Componente | Props clave |
|---|---|
| `FadeIn` | `delay` |
| `SlideReveal` | `direction` (left/right/up/down), `delay` |
| `ScaleReveal` | `delay` |
| `RotateReveal` | `delay` |
| `ParallaxContainer` | `speed`, children con `ParallaxContainer.Layer` |

### Transiciones (`components/transitions/`)
| Componente | Props clave |
|---|---|
| `PageTransition` | `variant` (fade/slide/wave/curtain) |
| `AnimeSceneTransition` | `className` |

### Carruseles (`components/carousels/`)
| Componente | Props clave |
|---|---|
| `BaseCarousel` | `items`, `autoplay`, `interval`, `onItemChange` |
| `HeroCarousel` | `items`, `autoplay`, `interval` |
| `CharacterCarousel` | — |
| `CoverflowCarousel` | — |
| `InfiniteCarousel` | `items`, `speed`, `direction` |

### Galerías (`components/gallery/`)
`GridGallery`, `MasonryGallery`, `InfiniteGallery` — ya existentes.

## Tema anime-musical
Colores disponibles en Tailwind 4 (`@theme`):
- `anime-pink`, `anime-blue`, `anime-purple`, `anime-glow`, `neon-cyan`, `neon-pink`
- Utilities: `glow-pink`, `glow-blue`, `text-gradient-anime`

## Accesibilidad
- Hook `useReducedMotion` basado en `framermotion` respeta `prefers-reduced-motion`.
- Los carruseles soportan navegación por teclado y autoplay configurable.

## TypeScript & Lint
- `strict: true`. Variables/parámetros sin uso rompen el build.
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

## CI/CD & Deploy
- **CI**: `typecheck` → `lint` → `test` → `build`.
- **Deploy**: Vercel (rama `main`). URL: `https://web-1tmdqw12l-maikel-js-projects.vercel.app`
- **GitHub Releases**: Tags `v*` para releases de escritorio.
- **Android**: Capacitor + Java 21. Requiere parche de `kotlin-stdlib` en `build.gradle`.
- **API**: Funciones Twilio duplicadas en `apps/web/api/` (serverless) y `electron/ipc-handlers.ts` (IPC).