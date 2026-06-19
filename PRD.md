# PRD — ChordShift / Worship Piano App

> **Versión**: 1.0
> **Última actualización**: 2026-06-15
> **Idioma**: Español (desarrollo), Español (documentación)

---

## 1. Visión General del Producto

### 1.1 Descripción

**ChordShift** ( Worship Piano App) es una aplicación monorepo para práctica de piano con audio sincronizado, entrenamiento auditivo, sesiones en vivo con WebSockets, y backend opcional. Está diseñada específicamente para músicos de adoración cristiana que quieren mejorar su técnica y conocimiento teórico.

### 1.2 Repositorio

- **URL**: https://github.com/IsmaPX/ChordShift
- **Stack**: Turborepo + pnpm 9 · Node >=20 · TypeScript strict

### 1.3 Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend Web | Vite 6 + React 19 + TypeScript strict + Tailwind 4 |
| Audio | Tone.js (piano, guitarra, trompeta, violín, flauta, armónica) |
| Desktop | Electron 33 (Windows, macOS, Linux) |
| Mobile | Capacitor 6 (Android APK) |
| PWA | Service Worker + offline-first |
| Backend | Express 4.21 + Prisma 5.22 + PostgreSQL 16 |
| Real-time | Socket.IO 4 (live sessions) |
| Storage Local | Dexie (IndexedDB) — offline-first por defecto |
| Auth | JWT + bcrypt |
| Testing | Vitest + jsdom (web), Vitest + supertest (api) |

---

## 2. Estructura del Monorepo

```
worship-piano-app/
├── apps/
│   ├── web/                    # Vite + React 19 + Electron 33
│   │   ├── src/
│   │   │   ├── app/           # React Router pages
│   │   │   │   ├── (app)/    # Rutas autenticadas
│   │   │   │   ├── (auth)/   # Login, Register
│   │   │   │   ├── (demo)/   # Effects demo
│   │   │   │   ├── join/     # QR join page
│   │   │   │   └── page.tsx  # Landing page
│   │   │   ├── components/
│   │   │   │   ├── practice/MusicStaff/  # Pentagrama musical
│   │   │   │   ├── ear-training/
│   │   │   │   ├── effects/
│   │   │   │   ├── guitar/
│   │   │   │   ├── trumpet/
│   │   │   │   └── ui/
│   │   │   ├── contexts/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   │   ├── api/      # API client (modo opcional)
│   │   │   │   ├── db.ts     # Dexie (offline-first default)
│   │   │   │   ├── socket/   # Socket.IO client
│   │   │   │   └── sync/     # Sync offline-first
│   │   │   ├── audio/        # Tone.js wrapper singleton
│   │   │   └── data/         # Seed data
│   │   ├── electron/         # main + preload
│   │   └── android/          # Capacitor
│   │
│   └── api/                  # Express + Prisma + Socket.IO
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── seed.ts
│       └── src/
│           ├── config/       # env, database singleton
│           ├── controllers/
│           ├── middleware/   # auth, error, rate limit
│           ├── routes/
│           ├── services/
│           ├── sockets/      # Socket.IO server
│           ├── types/
│           └── validators/  # Zod schemas
│
├── packages/
│   ├── audio/                 # Lógica Tone.js compartida (testeable en Node)
│   ├── db/                   # Interfaces TypeScript compartidas
│   └── ui/                   # cn() utility (clsx)
│
├── docs/
├── .github/workflows/
│   ├── ci.yml
│   ├── deploy.yml
│   ├── docker-publish.yml
│   ├── release.yml
│   └── deploy-api.yml
├── docker-compose.yml
├── turbo.json
├── AGENTS.md
└── README.md
```

---

## 3. Modelo de Datos

### 3.1 Dexie (Frontend — modo offline-first por defecto)

**Tablas locales**:
- `users` — perfiles locales con PIN
- `styles` — estilos musicales (seed)
- `songs` — canciones con chord_data
- `practice_sessions` — sesiones de práctica
- `song_audio` — audios blob de canciones
- `ear_training_results` — resultados de ear training
- `tips` — tips musicales (seed)

### 3.2 Prisma (Backend — PostgreSQL)

**Modelos principales**:

| Modelo | Descripción |
|--------|-------------|
| `User` | email, passwordHash, displayName, pinHash, settings (JSON), XP |
| `Style` | 8 estilos de adoración |
| `Song` | título, artista, difficulty, key_signature, bpm, chordData (JSON), isPublished |
| `Tip` | contenido, categoría, teoría requerida, dificultad mínima |
| `PracticeSession` | userId, songId, startedAt, durationS, completed |
| `EarTrainingResult` | userId, exerciseType, question/answer JSON, isCorrect, responseMs |
| `SongAudio` | userId, songId, url, name, size, mimeType |
| `SongShare` | songId, sharedById, sharedWithId, permission |
| `Leaderboard` | userId, category, score, rank, period |
| `LeaderboardSnapshotCache` | Snapshots pre-calculados del leaderboard |
| `LiveSession` | hostId, songId, status, currentBeat, bpm, startedAt, endedAt |
| `PushSubscription` | userId, endpoint, p256dh, auth (Web Push) |

---

## 4. Funcionalidades Principales

### 4.1 Landing Page (`/`)

- Hero con gradiente verde y título animado
- 3 features cards: Práctica, Ear Training, Enciclopedia
- Descarga multi-plataforma (Windows, macOS, Linux, Android APK)
- Fondo con ecualizador animado y musicians anime parallax
- Detección automática de SO del usuario

### 4.2 Autenticación y Perfiles

**Registro** (`/register`):
- Email + password + display name
- PIN opcional (4-8 dígitos)
- Fondo con LoginBackgroundGallery (músicos anime en parallax)
- Validación con Zod

**Login** (`/login`):
- Selección de perfil con avatar
- PIN si está configurado
- Animaciones Framer Motion
- Persistencia en localStorage

**Perfil local**:
```typescript
interface LocalProfile {
  id: string
  display_name: string
  pin_hash: string | null
  settings: UserSettings
  created_at: string
  last_active: string
}
```

**Configuración de perfil**:
- Tempo BPM (60-200)
- Idioma (Español, English)
- Instrumento preferido (piano, guitar, trumpet, violin, flute, harmonica)
- Metrónomo (on/off, volumen)
- Feedback visual (rings, pulse, bar)
- Dificultad (1-5)
- Notificaciones push
- PIN de seguridad
- Gestión de XP

### 4.3 Práctica de Canciones (`/practice`)

**Lista de canciones**:
- Tabs: All, Preset, Mine
- Búsqueda por título/artista
- Filtro por estilo musical
- Tarjetas estilo vinilo con información (key, BPM, dificultad)
- Importar audio o crear canción nueva

**Player de práctica** (`/practice/:songId`):
- Visualización de acordes con ChordDisplay
- Pentagrama musical (MusicStaff) con:
  - 5 líneas verdes
  - Símbolos de acordes (piano/guitarra) o notas reales (trompeta/flauta/violín)
  - Línea amarilla de progreso animado
  - Ledger lines para notas fuera del rango
  - Indicador de válvulas para trompeta
- Selector de instrumento (6 instrumentos)
- Controles: Play/Pause, Reset, Completar
- Grabación de audio
- Diagrama de acordes para guitarra
- Progresión de beats visual
- Metrónomo integrado
- Reproducción de acorde con Tone.js
- Registro de práctica en Dexie

**Instrumentos soportados**:

| Instrumento | Visualización | Características |
|------------|--------------|-----------------|
| Piano | Símbolo de acorde | — |
| Guitarra | Símbolo + ChordDiagram | Digitaciones completas |
| Trumpet | Nota real en pentagrama | Con válvulas |
| Flauta | Nota real | Con finger chart |
| Violín | Nota real | — |
| Armónica | Tablatura visual | — |

### 4.4 Entrenamiento Auditivo (`/ear-training`)

**Tipos de ejercicios**:
- `interval` — Identificar intervalo musical
- `triad` — Identificar tríada (mayor, menor, aumentada, disminuida)
- `seventh_chord` — Identificar acorde de 7ma

**Flujo**:
1. Generar ejercicio aleatorio con ExerciseGenerator
2. Reproducir nota(s) con AudioEngine (arpegiado para trompeta)
3. Usuario selecciona respuesta de 4 opciones
4. Feedback visual (FeedbackCanvas: rings/pulse/bar)
5. Streak counter + Sistema de XP
6. Guardar resultado en Dexie

**Sistema de XP**:
- +10 XP por respuesta correcta
- +5 XP bonus si responde en < 3 segundos
- 0 XP por respuesta incorrecta

### 4.5 Enciclopedia (`/encyclopedia`)

**8 Estilos de adoración**:

| Estilo | Dificultad | Descripción |
|--------|-----------|-------------|
| Worship Contemporáneo | 3 | Hillsong, Elevation, Bethel Music |
| Gospel Sureño | 4 | Voicings de bloque y walking bass |
| Gospel Urbano / R&B | 4 | Sus chords, grooves urbanos |
| Balada Pop Cristiana | 2 | I-V-vi-IV progresiones |
| Himno Tradicional Arreglado | 3 | Arreglos expresivos |
| Worship Latino / Iberoamericano | 3 | Ritmos latinos, cluster chords |
| Gospel Coral (Mass Choir) | 5 | Voicings grandiosos |
| Soaking Worship | 2 | Contemplativo, pedal tone |

**Información por estilo**:
- Técnicas requeridas
- Teoría musical necesaria
- Descripción
- Dificultad (1-5)
- Songs asociadas

**Tips por categoría**:
- teoría, técnica, mentalidad, worship

### 4.6 Sesiones en Vivo (`/live/:songId`)

**Arquitectura**:
- REST para crear/finalizar sesiones
- Socket.IO para comunicación en tiempo real
- Guest tokens via QR (5 min TTL, one-shot)

**Eventos Socket.IO**:

| Cliente → Servidor | Descripción |
|------------------|-------------|
| `session:join` | Unirse a sesión |
| `session:leave` | Salir de sesión |
| `session:pause` | Pausar (solo host) |
| `session:resume` | Reanudar (solo host) |
| `session:end` | Finalizar (solo host) |
| `session:beat-report` | Reportar beat actual (host, 10fps) |
| `leaderboard:subscribe` | Suscribir a updates |

| Servidor → Cliente | Descripción |
|--------------------|-------------|
| `session:state` | Estado actual de sesión |
| `session:beat` | Beat actualizado + timestamp |
| `session:paused` | Sesión pausada |
| `session:resumed` | Sesión reanudada |
| `session:ended` | Sesión finalizada |
| `session:participant-joined` | Nuevo participante |
| `session:participant-left` | Participante salió |
| `session:error` | Error |
| `leaderboard:updated` | Rankings actualizados |

**Host features**:
- Crear sesión con songId y BPM opcional
- Pausar/reanudar
- Finalizar sesión
- Reportar beats (rAF loop a 10fps)
- Generar QR para invitados (5 min TTL)
- Ver participantes conectados

**Participante features**:
- Unirse via QR o URL
- Ver beat actual con interpolación
- Ver drift/latencia
- Reconectar automáticamente

**Recovery on boot**:
- El servidor rehidrata sesiones activas desde Prisma
- TTL configurable (default 1h)

### 4.7 Leaderboard (`/leaderboard`)

> Solo disponible con backend activo (modo API)

**Categorías**:
- `total_minutes` — Minutos totales practicados
- `sessions_completed` — Sesiones completadas
- `ear_training_accuracy` — Precisión en ear training (%)

**Períodos**:
- `daily`, `weekly`, `monthly`, `all_time`

**Vista**:
- Top 3 con colores especiales (oro, plata, bronce anime)
- Posición actual del usuario
- Stats personales
- Lista de entries con rank, nombre, score

### 4.8 Sincronización Offline-First (`/sync`)

**Arquitectura**:
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Outbox     │────▶│  SyncManager │────▶│  API Server │
│ (IndexedDB) │     │ (flush on    │     │  (batch ops) │
│             │◀────│  online)     │◀────│             │
└─────────────┘     └──────────────┘     └─────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │  Snapshot   │
                   │  Client     │
                   └─────────────┘
```

**Operaciones soportadas en batch**:
- `create_song`, `delete_song`, `create_session`
- `create_ear_training`, `add_xp`, `update_settings`

**Retry strategy**:
- Máximo 5 intentos
- Backoff: 1s, 5s, 30s, 2min, 10min
- Estados: pending, syncing, applied, rejected

**UI**:
- Estado de conexión (online/offline)
- Contador de operaciones pendientes
- Última sincronización
- Botón forzar sync
- Botón traer snapshot del servidor
- Botón limpiar outbox
- Lista de operaciones con estado

### 4.9 Compartir Canciones (`/shared`)

> Solo con backend activo

- Ver canciones compartidas conmigo
- Compartir canciones por email
- Permisos: view (default)
- Ver canciones que he compartido
- Revocar acceso

### 4.10 Settings (`/settings`)

1. **General**: Idioma, tempo, dificultad, instrumento
2. **Metrónomo**: On/off, volumen
3. **Notificaciones**: Push enabled
4. **Seguridad**: PIN (set, change, remove)
5. **Feedback**: Visual (rings/pulse/bar)
6. **Datos**: Limpiar historial práctica, limpiar resultados ear training
7. **Desktop**: Auto-update (Electron)
8. **Perfil**: Info, cambiar perfil, eliminar perfil

---

## 5. Catálogo de Datos

### 5.1 Estilos Musicales (8)

| ID | Nombre | Dificultad | Técnicas |
|----|--------|-----------|----------|
| style-wc | Worship Contemporáneo | 3 | pad_sostenido, arpegio_broken, walking_bass |
| style-gs | Gospel Sureño | 4 | walking_bass, voicings_spread, turnarounds, improvisacion |
| style-gu | Gospel Urbano / R&B | 4 | soul_piano, vamps, improvisation |
| style-bp | Balada Pop Cristiana | 2 | sustain, dynamics, fills, rubato |
| style-ht | Himno Tradicional Arreglado | 3 | close_voicings, anticipation, dramatic, ornaments |
| style-wl | Worship Latino / Iberoamericano | 3 | rhythmic_patterns, cluster_chords, montunos |
| style-gc | Gospel Coral (Mass Choir) | 5 | block_voicings, call_response, ad-libs |
| style-sk | Soaking Worship (Contemplativo) | 2 | sustain_piano, texturas, silencio_activo, pedal_tone |

### 5.2 Canciones Preset (150+)

Distribuidas en: Himnos tradicionales en inglés (35), Himnos latinos (15), Spirituals afroamericanos (15), Christmas carols (10), Folk gospel (10), Contemplative (5), Ejercicios prácticos (5), Songs guitarra, Songs trompeta

### 5.3 Acordes y Digitaciones

- **Guitarra**: Digitaciones completas para acordes mayores, menores, 7ma, etc.
- **Trombeta**: Digitaciones con válvulas para cada nota
- **Flauta**: Patrones de dedos
- **Armónica**: Tablatura visual C

---

## 6. API REST del Backend

### 6.1 Endpoints Principales

| Ruta | Métodos | Descripción |
|------|---------|-------------|
| `/api/auth` | POST register, POST login, GET me, PATCH me | Autenticación |
| `/api/songs` | GET, GET :id, POST, PATCH :id, DELETE :id | CRUD canciones |
| `/api/songs/:songId/audio` | POST, GET, DELETE | Audios de canciones |
| `/api/sessions` | GET user/:userId, POST, GET stats/me | Sesiones de práctica |
| `/api/ear-training` | POST, GET, GET stats/me | Resultados ear training |
| `/api/users/:id/settings` | PATCH | Settings de usuario |
| `/api/users/:id/xp` | POST | Añadir XP |
| `/api/shares` | POST, GET received, GET sent, DELETE :shareId | Compartir canciones |
| `/api/leaderboard` | GET | Rankings (category, period, limit) |
| `/api/sync/status` | GET | Estado del servidor |
| `/api/sync/snapshot` | GET | Snapshot completo del usuario |
| `/api/sync/batch` | POST | Procesar operaciones offline |
| `/api/live-sessions` | POST, GET, GET :id, POST :id/end | Sesiones en vivo |
| `/api/live-sessions/:id/qr` | POST | Generar QR para guest |
| `/api/qr/redeem` | POST | Canjear token QR |
| `/api/push/vapid-public-key` | GET | Clave VAPID pública |
| `/api/push/subscribe` | POST | Registrar suscripción push |
| `/api/push/unsubscribe` | POST | Eliminar suscripción push |
| `/api/push/test` | POST | Push de prueba |
| `/api/catalog/styles` | GET | Lista de estilos |
| `/api/catalog/tips` | GET | Tips filtrados |

### 6.2 Validación

Todos los inputs son validados con **Zod schemas** en `validators/`

### 6.3 Middleware de Errores

- `ZodError` → 400
- `Prisma P2002` (unique) → 409
- `Prisma P2025` (not found) → 404

### 6.4 Storage Factory

Drivers soportados: `local` | `s3` (R2/MinIO/DO Spaces compatible) | `supabase`

---

## 7. Diseño Visual

### 7.1 Sistema de Diseño

**Tokens de color principales**:

| Token | Hex | Uso |
|-------|-----|-----|
| `bg-primary` | `#0a0a0a` | Fondo principal |
| `bg-secondary` | `#141414` | Fondo secundario |
| `bg-card` | `#132013` | Cards con borde verde sutil |
| `accent` | `#22c55e` | Verde principal (botones, highlights) |
| `accent-hover` | `#16a34a` | Verde hover |
| `text-primary` | `#f0f0f0` | Texto principal |
| `text-secondary` | `#8aa88a` | Texto secundario (verde muted) |
| `danger` | `#ef4444` | Error |
| `anime-pink` | `#ff6ec7` | Acento anime |
| `anime-blue` | `#00d4ff` | Acento anime |
| `anime-purple` | `#a855f7` | Acento anime |
| `neon-cyan` | `#00f5d4` | Neon |
| `neon-pink` | `#ff0050` | Neon |

**Glow Effects**: `glow-green`, `glow-pink`, `glow-blue`

**Gradientes de texto**: `text-gradient-anime` (rosa → cyan → purple), `text-gradient-green`

### 7.2 Componentes Base

- **Botón Primario**: fondo accent, radius 12px, padding 12px 24px
- **Botón Secundario**: outline con borde accent/15
- **Input**: bg bg-card, borde accent/15, radius 12px
- **Card**: bg bg-card, borde rgba(34,197,94,0.15), radius 16px

### 7.3 Animaciones (Framer Motion)

- Page transitions
- Fade in/scale in
- Stagger containers
- Parallax backgrounds
- Equalizer bars animados
- Ripple rings en player
- Login background gallery (músicos anime parallax)

---

## 8. Flujos de Usuario

### 8.1 Registro y Login

```
Landing → Register → Crear perfil (email, name, PIN opcional) → Login → Practice
                                                                    ↓
Landing → Login → Seleccionar perfil → PIN (si tiene) → Practice ◀──┘
```

### 8.2 Práctica de Canción

```
Practice (lista) → Click canción → Player (play/pause chords) → Complete → Stats
                                           ↓
                                   Recording (opcional)
```

### 8.3 Ear Training

```
Ear Training → Seleccionar tipo → Generar ejercicio → Escuchar → Responder → Feedback → Siguiente
```

### 8.4 Live Session (Host)

```
Practice → Click canción → Crear live session → /live/:songId
    → Generar QR → Invitar amigos → Controlar (pause/resume/end)
    → Beat reporting (rAF loop)
```

### 8.5 Live Session (Guest)

```
Host comparte QR → /join?qr=<token> → Redeem QR → Redirect /live/session/:id → Ver beat sincronizado
```

### 8.6 Sync Offline-First

```
Usuario practica offline → Operations guardadas en outbox
    → Online detectado → SyncManager flush → POST /api/sync/batch
    → Server procesa → Response applied/rejected → UI actualizada
```

---

## 9. Deploy y Distribución

### 9.1 Frontend

| Plataforma | Deploy | Notas |
|-----------|--------|-------|
| Web (PWA) | Vercel | push a main automático |
| Desktop Windows | GitHub Releases | electron-builder NSIS |
| Desktop macOS | GitHub Releases | electron-builder DMG |
| Desktop Linux | GitHub Releases | AppImage + deb |
| Android | GitHub Releases | APK debug |

### 9.2 Backend

| Método | Notas |
|--------|-------|
| Docker (GHCR) | Recomendado, multi-stage Node 20-alpine |
| Railway | Detecta Dockerfile automáticamente |
| Render | Blueprint support |
| Fly.io | fly.toml configurado |
| SSH manual | deploy-api.yml workflow |

### 9.3 Variables de Entorno Críticas

**Backend**:
- `DATABASE_URL`: postgresql://
- `JWT_SECRET`: >= 32 chars
- `CORS_ORIGIN`: URLs separadas por coma
- `STORAGE_DRIVER`: local | s3 | supabase
- `VAPID_*`: para push notifications

**Frontend**:
- `VITE_API_URL`: URL del backend (activa modo API)
- `VITE_ELECTRON_BUILD`: true para builds Electron

---

## 10. CI/CD

| Workflow | Trigger | Descripción |
|----------|---------|-------------|
| `ci.yml` | push/PR main/develop | lint → typecheck → test (web+audio) → build |
| `deploy.yml` | push a main | Vercel deploy |
| `docker-publish.yml` | push/PR/tag | GHCR API image |
| `release.yml` | tag v* / manual | Electron + APK |
| `deploy-api.yml` | manual | SSH deploy |

**Orden de validación CI**:
```
typecheck → lint
     ↓
   tests (web + audio) ←── paralela
     ↓
    build
```

---

## 11. Testing

### 11.1 Web (Vitest + jsdom)

- Setup en `src/test/setup.tsx`
- Mocks: framer-motion, AudioEngine
- Dexie: fake-indexeddb/auto
- Polyfills: crypto, structuredClone
- Seed automático en beforeEach

### 11.2 API (Vitest + supertest)

- Tests de integración con Express real
- DB separada: `worship_piano_test`

### 11.3 Audio Package (Vitest Node)

- Lógica Tone.js testeable en Node

---

## 12. Arquitectura de Audio

### 12.1 Dual Audio Engine

- **`packages/audio/`** → lógica Tone.js compartida, testeable en Node
- **`apps/web/src/audio/`** → wrapper singleton de Tone.js para el navegador, mockeado en tests

**Regla**: No importar clases de `packages/audio` dentro de `apps/web/src/` — los tests web mockean `@/audio/AudioEngine`, no `packages/audio`.

### 12.2 Instrumentos Soportados

- Piano (PolyphonicSynth)
- Guitarra (ChordPlayer con digitaciones)
- Trompeta (arpegiado, fingerings con válvulas)
- Flauta (fingerings)
- Violín (monofónico)
- Armónica (tablatura visual)

### 12.3 Pentagrama Musical (MusicStaff)

**Coordenadas**:
```
E4 (Línea inferior)  → position 0
F4 (Espacio)         → position 0.5
G4 (Línea)           → position 1
B4 (Línea media)     → position 2
D5 (Línea)           → position 3
F5 (Línea superior)  → position 4
```

- 5 líneas principales ocupan el rango [0, 4]
- Posiciones negativas o superiores a 4 generan ledger lines automáticamente

---

## 13. Reglas de Arquitectura Importantes

- **`<AudioGate>` y `<AudioGateProvider>` deben quedarse en `main.tsx`** — moverlos a un layout causa remounts y vuelve a aparecer "toca para empezar" cada navegación
- **Router dual**: `createHashRouter` cuando `VITE_ELECTRON_BUILD=true`, sino `createBrowserRouter`
- **No existe `App.tsx`** — `main.tsx` monta `RouterProvider` directo
- **Repository pattern**: `repositoryProvider` elige Dexie o API según `VITE_API_URL` o `localStorage['worship_piano_backend_mode']`. Default: Dexie (offline-first)
- **No editar `schema.prisma` sin generar migración**
- **`@/`** → `apps/web/src/`. **`@api/`** es solo convención interna (no existe como alias real)

---

## 14. Roadmap de Features

### Implementadas

- [x] Auth con JWT
- [x] Perfiles locales con PIN
- [x] Práctica de canciones con pentagrama
- [x] 6 instrumentos (piano, guitarra, trompeta, flauta, violín, armónica)
- [x] Ear training (intervalos, tríadas, 7mas)
- [x] Enciclopedia de 8 estilos
- [x] Live sessions con WebSockets
- [x] QR para invitados
- [x] Leaderboard global (con backend)
- [x] Sync offline-first (outbox + batch)
- [x] Compartir canciones (con backend)
- [x] Push notifications
- [x] Desktop Electron (Win/Mac/Linux)
- [x] Android APK

### Pendientes / Ideas

- [ ] Materialized views para leaderboard (optimización)
- [ ] Grabación multipista
- [ ] Modo colaborativo de creación de songs
- [ ] Integración con streaming (Spotify/YouTube)
- [ ] Lecciones estructuradas por nivel
- [ ] Achievements gamification

---

## 15. Documentación Relacionada

| Archivo | Propósito |
|---------|----------|
| `AGENTS.md` | Convenciones de desarrollo |
| `README.md` | Setup completo y deploy |
| `docs/design/Tokens.md` | Sistema de diseño |
| `docs/backend-strategy.md` | Estrategia de backend |
| `docs/mcp-integrations.md` | Configuración MCP |
| `apps/api/README.md` | API endpoints detallado |
| `apps/api/prisma/schema.prisma` | Modelo de datos completo |