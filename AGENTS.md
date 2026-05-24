# Conocimiento Aprendido — Worship Piano App

## Arquitectura del Proyecto
- **Monorepo** con Turborepo. Paquetes: `web`, `audio`, `db`, `ui`.
- **Framework**: React + Vite + TypeScript.
- **Base de datos local**: Dexie (IndexedDB) para users, songs, styles, practice_sessions, tips, ear_training_results.
- **Audio**: Tone.js (PolySynth + Reverb + Recorder).
- **Despliegue**: Vercel, CI automático desde `main` en GitHub.

## Errores Conocidos y Soluciones

### 1. Race condition en AudioEngine.initialize()
- **Problema**: Múltiples llamadas concurrentes a `initialize()` desde `AudioGate` (onClick + window listeners) causaban que el AudioContext se iniciara varias veces.
- **Solución**: Agregar flag `_initializing` en `AudioEngineClass`. Si ya está inicializando, las llamadas adicionales hacen `return`.
- **Archivo**: `apps/web/src/audio/AudioEngine.ts`
- **Patrón a seguir siempre**: Usar flag `_initializing` + `if (this.isInitialized || this._initializing) return` al inicio.

### 2. AudioGate overlay + window event listeners
- **Problema**: `onClick` en el overlay Y listeners `window.addEventListener('touchstart', ...)` / `window.addEventListener('click', ...)` llamaban a `initialize()` de forma concurrente.
- **Solución**: Eliminar los window event listeners. Solo usar `onClick` en el overlay.
- **Archivo**: `apps/web/src/components/ui/AudioGate.tsx`

### 3. useEffect con deps incompletas
- **Problema**: `currentChordIndex` y `currentChord` faltaban en el array de dependencias del `useEffect` de reproducción → solo el primer acorde se reproducía.
- **Solución**: Incluir SIEMPRE todas las variables del closure en el array de deps.
- **Archivo**: `apps/web/src/app/(app)/practice/[songId]/page.tsx`

### 4. Cadena de audio incorrecta
- **Problema**: Usar `Tone.Gain` como splitter intermedio rompía la cadena de audio.
- **Solución**: Conectar directo: `synth → reverb → destination` (sin nodos intermedios).
- **Archivo**: `apps/web/src/audio/AudioEngine.ts`

### 5. Tone.Recorder conectado permanentemente
- **Problema**: Tener `Tone.Recorder` (que wrappea `MediaStreamAudioDestinationNode`) siempre conectado al reverb interfería con la reproducción en algunos navegadores.
- **Solución**: Lazy connection: crear y conectar el recorder SOLO durante `startRecording()`, desconectar y null en `stopRecording()`.
- **Archivo**: `apps/web/src/audio/AudioEngine.ts`

### 6. Tone.Recorder() en navegadores sin soporte
- **Problema**: Algunos navegadores no soportan `MediaRecorder` → `new Tone.Recorder()` lanza error.
- **Solución**: Envolver `new Tone.Recorder()` en try-catch.
- **Archivo**: `apps/web/src/audio/AudioEngine.ts`

### 7. Chord mappings incompletas
- **Problema**: Acordes como `Eb`, `Bb`, `Ab`, `F#m`, `C#dim`, `D#dim` no estaban en `CHORD_MAPPINGS` → silencio al reproducir canciones que los usaban.
- **Solución**: Mapear TODOS los acordes que aparecen en los seed songs. Verificar contra `apps/web/src/data/songs.ts`.
- **Archivo**: `apps/web/src/audio/ChordPlayer.ts`

### 8. Duplicados en CHORD_MAPPINGS
- **Problema**: Ediciones parciales dejaron entradas duplicadas (E, E7, F, F#m, Fm, Fmaj7, Fm7, F7, G, G7, Gm, Gmaj7, Gm7 aparecían dos veces).
- **Solución**: Reemplazar el objeto completo en vez de hacer ediciones parciales.
- **Archivo**: `apps/web/src/audio/ChordPlayer.ts`

## Flujo de Grabación (Actual)
- `useRecording.ts` hook maneja el estado de grabación.
- `AudioEngine.startRecording()` crea y conecta `Tone.Recorder` lazy.
- `AudioEngine.stopRecording()` desconecta y descarta el recorder, devuelve Blob.
- Al detener, se descarga automáticamente el archivo `.webm`.
- NO se almacena en IndexedDB (se eliminó la tabla `recordings`).
- Botones post-grabación: Download (re-descargar) + Trash2 (descartar).

## Comandos Importantes
- `npm run typecheck` — TypeScript check en todo el monorepo
- `npm run build` — Build completo con Turborepo
- `npm run test` — Tests (vitest)
- `npm run dev` — Dev server

## Vercel
- **Production URL**: `https://web-maikel-js-projects.vercel.app`
- **Project ID**: `prj_shAUREiwHUTCPTzEzU1weF5Hzzcy`
- **Team**: `maikel-js-projects`
- **CI**: Automático desde `main` en GitHub. El deploy se gatilla con cada push a main.

### 9. Guitar voicings incompletas para 6 acordes
- **Problema**: `GUITAR_CHORD_VOICINGS` en `ChordPlayer.ts` faltaba para Ab, Bb, C#dim, D#dim, Eb, F#m → al seleccionar guitarra, esos acordes caían a voicings de piano (fallback).
- **Solución**: Agregar las 6 voicings con posiciones propias de guitarra.
- **Archivo**: `apps/web/src/audio/ChordPlayer.ts`

### 10. Ear training sin soporte de instrumentos
- **Problema**: La página de ear training usaba `AudioEngine.playChord()` directamente, sin pasar por `ChordPlayer`, y no tenía selector de instrumentos.
- **Solución**: Agregar `InstrumentSelector`, estado `instrument` desde `preferred_instrument`, y playback instrument-aware:
  - Piano: acorde simultáneo (igual que antes)
  - Guitarra: usa `notesToChordSymbol()` + `ChordPlayer.getChordNotes()` para voicings auténticos
  - Trompeta: arpegia todas las notas secuencialmente con delay de 120ms
- **Archivos**: `apps/web/src/app/(app)/ear-training/page.tsx`, `apps/web/src/audio/ChordPlayer.ts`

### 11. Función notesToChordSymbol()
- **Problema**: El ear training genera notas MIDI raw (`['C4','E4','G4']`), no símbolos de acorde. Guitarra necesita símbolos para usar sus voicings.
- **Solución**: Crear `notesToChordSymbol(notes: string[])` que detecta triadas (major→'', minor→'m', dim→'dim', aug→'aug') y séptimas (maj7, m7, 7, m7b5) por semitonos desde la raíz.
- **Archivo**: `apps/web/src/audio/ChordPlayer.ts`

### 12. ExerciseGenerator expandido
- **Problema**: Solo 7 raíces diatónicas (C-B) y 8 intervalos; faltaban cromáticas e intervalos como tritone, minor_2nd, minor_6th, major_7th.
- **Solución**: ROOTS ahora tiene 12 notas (incluye C#, Eb, F#, Ab, Bb). INTERVALS incluye minor_2nd(1), tritone(6), minor_6th(8), major_7th(11). Se agregó campo `root` al `Exercise` type.
- **Archivos**: `apps/web/src/audio/ExerciseGenerator.ts`, `apps/web/src/types/music.ts`

### 13. Botón de descarga de escritorio — sin abrir nueva pestaña
- **Problema**: Los botones "Descargar para Windows/macOS/Linux" en landing y settings abrían una nueva pestaña hacia GitHub Releases. El usuario debía quedarse en la misma página.
- **Intentos fallidos (no repetir)**:
  1. `<button onClick → triggerDownload(url)>` con `<a>` temporal → el navegador no descarga cross-origin sin `target="_blank"` (navega en lugar de descargar)
  2. Hidden iframe → GitHub CDN bloquea con `X-Frame-Options: DENY` y `CSP: frame-ancestors 'none'`
  3. `fetch()` + blob → GitHub CDN no envía cabeceras CORS
- **Solución**: `<a href={url}>` sin `target`, sin `rel="noopener noreferrer"`, sin JavaScript. El navegador recibe `Content-Type: application/octet-stream` y descarga automáticamente sin navegar ni abrir pestañas.
- **Precondición crítica**: El release en GitHub debe estar **publicado** (`draft: false`). Releases en draft (`gh release view <tag> --json isDraft` → `true`) bloquean descargas a no-colaboradores (redirigen a login/404). Verificar con `curl -I -L <url>` que el status final sea `200` con `Content-Type: application/octet-stream`.
- **Regla**: Para descargar assets de GitHub Releases desde el browser, usar `<a href={url}>` plano. NO usar: `target="_blank"`, `download=""`, `window.open()`, iframes, fetch, blob, ni ningún JavaScript intermedio. Si no funciona, el release probablemente está en draft o el asset no existe.
- **Archivos**: `apps/web/src/app/page.tsx`, `apps/web/src/app/(app)/settings/page.tsx`
- **Patrón correcto**:
  ```tsx
  <a href={url} className="...">Descargar</a>
  ```

## Flujo de Deploy
- Push a `main` → GitHub Actions (`ci.yml` + `deploy.yml`).
- `ci.yml`: typecheck → lint → test → build (jobs secuenciales).
- `deploy.yml`: build con `VITE_APP_ENV=production` → `vercel --prod` en `apps/web`.
- El backend son 2 serverless functions (`api/send-whatsapp.ts`, `api/send-otp.ts`) que se deployan junto con el frontend.
- Variables de entorno requeridas en Vercel para WhatsApp real: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`.

### 9. IndexedDB no accesible desde serverless
- **Problema**: Serverless functions en Vercel no pueden leer IndexedDB (solo existe en el browser).
- **Solución**: Cualquier lógica que necesite datos locales (ej: reminder checks) debe ejecutarse en hooks del lado cliente.
- **Archivo**: `apps/web/src/hooks/useWhatsAppReminder.ts`

## Flujo de WhatsApp (Recordatorios)
- **Settings UI**: Ingreso de número con código de país, OTP de 6 dígitos, selector de hora y días de semana.
- **OTP Flow**: Cliente genera OTP de 6 dígitos, envía via `/api/send-otp`, usuario ingresa, cliente verifica localmente.
- **Recordatorio**: Se gatilla al abrir la app via `useWhatsAppReminder` en `AppLayout`.
- **Serverless functions**: `/api/send-whatsapp` y `/api/send-otp` en `apps/web/api/`. Usan Twilio SDK. Si faltan env vars (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`), retornan `simulated: true`.
- **vercel.json**: Las funciones en `/api/*` se sirven como serverless; se excluyeron de las rewrites SPA con `"source": "/(.*)", "destination": "/"` + `"source": "/api/(.*)"` exception.

## Flujo de Grabación (Actual)
- `useRecording.ts` hook maneja el estado de grabación.
- `AudioEngine.startRecording()` crea y conecta `Tone.Recorder` lazy.
- `AudioEngine.stopRecording()` desconecta y descarta el recorder, devuelve Blob.
- Al detener, se descarga automáticamente el archivo `.webm`.
- NO se almacena en IndexedDB (se eliminó la tabla `recordings`).
- Botones post-grabación: Download (re-descargar) + Trash2 (descartar).

## Flujo de Settings
- `useUserSettings.ts`: CRUD completo de settings + hooks de phone/OTP/WhatsApp.
- `UserSettings` en `types/music.ts`: Incluye `tempo_bpm`, `language`, `notifications_enabled`, `feedback_concept`, `xp`, `preferred_instrument`, `metronome_enabled`, `metronome_volume`, `difficulty`, `pin_enabled`, `pin_hash`, `phone_number`, `phone_verified`, `reminder_time`, `reminder_days`, `last_reminder_sent`.
- PIN: SHA-256 hasheado con `crypto.subtle.digest`.
- Toast y ConfirmModal: componentes UI reutilizables.

## Comandos Importantes
- `npm run typecheck` — TypeScript check en todo el monorepo
- `npm run build` — Build completo con Turborepo
- `npm run test` — Tests (vitest)
- `npm run dev` — Dev server

## Vercel
- **Production URL**: `https://web-maikel-js-projects.vercel.app`
- **Project ID**: `prj_shAUREiwHUTCPTzEzU1weF5Hzzcy`
- **Team**: `maikel-js-projects`
- **CI**: Automático desde `main` en GitHub. El deploy se gatilla con cada push a main.
- **Env vars requeridas para WhatsApp**: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`

## Electron Desktop
- **Stack**: Electron 33 + Vite 6 (`vite-plugin-electron`) + electron-builder + electron-updater
- **Main process**: `apps/web/electron/main.ts` — BrowserWindow 1200×800, menú, CSP, dev/prod load
- **Preload**: `apps/web/electron/preload.ts` — contextBridge expone `window.electronAPI` + `window.isElectron`
- **IPC Twilio**: `apps/web/electron/ipc-handlers.ts` — handlers `send-otp` y `send-whatsapp` (migrados de serverless)
- **Auto-update**: `apps/web/electron/updater.ts` — electron-updater con GitHub Releases (check a los 5s de inicio)
- **Detección en renderer**: `window.isElectron` (booleano) + `window.electronAPI` (objeto con métodos)
- **Fallback**: Si no está en Electron, las llamadas OTP/WhatsApp usan `fetch()` al serverless de Vercel (comportamiento original)
- **Service Worker**: Se salta si `window.isElectron === true`
- **Comandos**:
  - `npm run dev:electron` — Dev con hot reload + Electron
  - `npm run build:electron` — Build para Electron
  - `npm run dist:win` — Build + empaquetado Windows (NSIS)
  - `npm run dist:mac` — Build + empaquetado macOS (DMG)
  - `npm run dist:linux` — Build + empaquetado Linux (AppImage/deb)
  - `npm run release` — Build + publish a GitHub Releases
- **Release CI**: `.github/workflows/release.yml` — manual `workflow_dispatch` para Win/Mac/Linux
- **Actualizaciones**: electron-updater busca nuevos releases en `IsmaPX/ChordShift` en GitHub
- **Iconos**: Espera `apps/web/resources/icon.png` (PNG 512×512 para electron-builder)

### 14. Electron packaging — files whitelist omite node_modules en monorepo
- **Problema**: `electron-builder.yml` usaba `files: [dist/**, dist-electron/**, package.json]` sin incluir `node_modules`. En monorepo con Turborepo, los deps están hoisted en la raíz. `twilio` está externalizado en Vite (`external: ['electron', 'twilio']`) → no se bundlea → al hacer `require('twilio')` en `ipc-handlers.ts` crashea.
- **Solución**: Usar `extraResources` para incluir `twilio` desde la raíz del monorepo (`../../node_modules/twilio` → `node_modules/twilio`).
- **Archivo**: `apps/web/electron-builder.yml`
- **Patrón**:
  ```yaml
  extraResources:
    - from: ../../node_modules/twilio
      to: node_modules/twilio
      filter: ["**/*"]
  ```

### 15. CSP en Electron — bloquea renderer en file:// protocol
- **Problema**: `session.defaultSession.webRequest.onHeadersReceived` aplicaba CSP a TODAS las requests, incluyendo `file://`. `default-src 'self'` no siempre coincide con `file://` en Electron 33, lo que puede causar pantalla en blanco.
- **Solución**: Condicionar CSP solo a requests HTTP/HTTPS. Agregar `'unsafe-eval'` a `script-src` para compatibilidad.
- **Archivo**: `apps/web/electron/main.ts`
- **Patrón**:
  ```ts
  if (!url.startsWith('http')) { callback({ responseHeaders }) }
  ```

### 16. Vite base path — rutas absolutas rompen renderer en Electron
- **Problema**: Vite genera `src="/assets/index-xxx.js"` (ruta absoluta desde la raíz). En Electron con `loadFile()` (protocolo `file://`), el browser intenta resolver como `file:///C:/assets/...` → no encuentra el JS/CSS → renderer en blanco.
- **Solución**: Condicionar `base` en `vite.config.ts` según `VITE_ELECTRON_BUILD`:
  ```ts
  base: process.env.VITE_ELECTRON_BUILD === 'true' ? './' : '/',
  ```
- **Archivo**: `apps/web/vite.config.ts`
- **Verificación**: Electron build produce `dist/index.html` con `src="./assets/...`. Web build (Vercel) sigue usando `src="/assets/..."`.

## Estructura de Archivos Relevante
```
apps/web/
├── api/
│   ├── send-whatsapp.ts     # Serverless: enviar WhatsApp via Twilio
│   └── send-otp.ts          # Serverless: enviar OTP via Twilio
├── electron/
│   ├── main.ts              # Main process (BrowserWindow, menú, IPC, seguridad)
│   ├── preload.ts           # Context bridge (electronAPI + isElectron)
│   ├── ipc-handlers.ts      # Twilio IPC handlers (send-otp, send-whatsapp)
│   └── updater.ts           # Auto-update con electron-updater
├── electron-builder.yml     # Packaging config (Win/Mac/Linux)
├── resources/               # Iconos para empaquetado desktop
├── vercel.json               # Rewrites SPA + exclusión /api/*
└── src/
    ├── electron.d.ts        # Tipos globales Window.isElectron + Window.electronAPI
    ├── audio/
    │   ├── AudioEngine.ts       # Singleton de Tone.js (synth, reverb, recorder)
    │   ├── ChordPlayer.ts       # Mapeo acorde → notas MIDI + reproducción
    │   └── AudioGate.tsx        # Overlay first-tap para iniciar AudioContext
    ├── hooks/
    │   ├── useAudio.ts          # Hook básico playNote/playChord/stop
    │   ├── useRecording.ts      # Hook de grabación con auto-descarga
    │   ├── useUserSettings.ts   # CRUD settings + phone/OTP/WhatsApp hooks (+ IPC fallback)
    │   └── useWhatsAppReminder.ts # Reminder check al abrir app
    ├── components/ui/
    │   ├── Toast.tsx            # Toast animado con auto-dismiss
    │   └── ConfirmModal.tsx     # Modal de confirmación animado
    ├── app/(app)/settings/
    │   └── page.tsx             # Settings completo (+ sección auto-update si isElectron)
    ├── lib/
    │   └── db.ts                # Dexie schema (tablas y versiones)
    └── types/
        └── music.ts             # Interfaces del dominio
```
