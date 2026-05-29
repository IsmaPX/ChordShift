# Worship Piano App / ChordShift

Monorepo (Turborepo): `apps/web` (Vite + React 19 + Electron 33), `packages/audio` (Tone.js), `packages/db` (Dexie/IndexedDB), `packages/ui` (shared components).

## Arquitectura

- **Web/Desktop**: React 19 + Vite 6 + Electron 33 + TailwindCSS 4
- **Audio**: Tone.js (PolySynth → Reverb → Destination, sin nodos intermedios)
- **DB local**: Dexie (IndexedDB) — users, songs, styles, practice_sessions, tips, ear_training_results
- **Routing**: React Router v7
- **State server**: TanStack Query + Supabase (Auth + PostgreSQL)
- **i18n**: i18next + react-i18next
- **Testing**: Vitest, jsdom, @testing-library/react

## Comandos (ejecutar desde apps/web/)

| Comando | Acción |
|---------|--------|
| `npm run dev` | Vite dev server |
| `npm run dev:electron` | Vite + Electron hot reload |
| `npm run build` | `tsc -b && vite build` |
| `npm run build:electron` | `tsc -b && VITE_ELECTRON_BUILD=true vite build` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest |
| `npm run dist:win` | Build + package Windows NSIS |
| `npm run dist:mac` | Build + package macOS DMG |
| `npm run dist:linux` | Build + package Linux AppImage/deb |
| `npm run release` | Build + publish a GitHub Releases |

## CI/CD (GitHub Actions)

- **Push a main**: `ci.yml` (typecheck → lint → tests → build) + `deploy.yml` (Vercel)
- **workflow_dispatch**: `deploy.yml` build-android job (Capacitor wrapper → APK)
- **Tags v\***: `release.yml` → Electron build Win/Mac/Linux + publish
- Vercel: `https://web-maikel-js-projects.vercel.app` (project `prj_shAUREiwHUTCPTzEzU1weF5Hzzcy`)

## Electron Desktop

- `apps/web/electron/main.ts` — BrowserWindow 1200×800, CSP condicional (solo HTTP/HTTPS)
- `preload.ts` — contextBridge expone `window.electronAPI` + `window.isElectron`
- `ipc-handlers.ts` — Twilio handlers con `require(path.join(process.resourcesPath, 'node_modules/twilio'))` en prod
- `updater.ts` — electron-updater con GitHub Releases (check a los 5s)
- **Packaging**: `electron-builder.yml` con `extraResources` para twilio desde raíz del monorepo, NSIS con `perMachine: false`
- **Base path**: Vite usa `base: './'` cuando `VITE_ELECTRON_BUILD=true`

## APK Android (Capacitor)

Trigger manual via `gh workflow run deploy.yml --repo IsmaPX/ChordShift`. El workflow:
1. `npm install @capacitor/cli @capacitor/android` + `npx cap init "ChordShift" com.chordshift.app --web-dir=dist`
2. `npx cap add android` → `npm run build` → `npx cap sync android`
3. Parchea `android/app/build.gradle` con resolución de kotlin-stdlib (evita duplicados con kotlin-stdlib-jdk7/8)
4. `./gradlew assembleDebug`
5. APK en `apps/web/android/app/build/outputs/apk/debug/app-debug.apk`

Requisito: Java 21 (no 17) para Capacitor 7.

## Errores Conocidos (no repetir)

### AudioEngine (apps/web/src/audio/AudioEngine.ts)
- `initialize()` debe tener flag `_initializing` para evitar race conditions (múltiples llamadas concurrentes)
- `Tone.Recorder` solo conectar durante `startRecording()`, desconectar en `stopRecording()` — no tenerlo permanentemente en la cadena
- `new Tone.Recorder()` en try-catch (falla en navegadores sin MediaRecorder)

### Electron
- `loadFile()` requiere `.catch()` — Promise rechazada = muerte silenciosa
- Agregar `process.on('uncaughtException')` + `process.on('unhandledRejection')` con log a archivo
- `app.requestSingleInstanceLock()` obligatorio
- `extraResources` para twilio: el `require()` debe usar `process.resourcesPath` en prod
- `npx cap add android` genera gradle con conflicto de kotlin-stdlib → parchear build.gradle con resolutionStrategy

### Vite + Electron
- CSP condicional: solo aplicar a requests HTTP/HTTPS, no a file://
- `base: process.env.VITE_ELECTRON_BUILD === 'true' ? './' : '/'` en vite.config.ts
