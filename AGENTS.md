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

## Estructura de Archivos Relevante
```
apps/web/src/
├── audio/
│   ├── AudioEngine.ts       # Singleton de Tone.js (synth, reverb, recorder)
│   ├── ChordPlayer.ts       # Mapeo acorde → notas MIDI + reproducción
│   └── AudioGate.tsx        # Overlay first-tap para iniciar AudioContext
├── hooks/
│   ├── useAudio.ts          # Hook básico playNote/playChord/stop
│   ├── useRecording.ts      # Hook de grabación con auto-descarga
│   └── ...
├── app/(app)/practice/[songId]/
│   └── page.tsx             # Practice player con reproducción + grabación
├── lib/
│   └── db.ts                # Dexie schema (tablas y versiones)
└── types/
    └── music.ts             # Interfaces del dominio
```
