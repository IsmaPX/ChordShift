# API - Worship Piano App / ChordShift

Backend REST API para sincronizar datos de los usuarios en la nube.

## Stack
- **Runtime**: Node.js 20+
- **Framework**: Express 4
- **ORM**: Prisma 5
- **DB**: PostgreSQL 16
- **Auth**: JWT (jsonwebtoken) + bcrypt
- **Validación**: Zod
- **Seguridad**: Helmet, CORS, express-rate-limit

## Setup

```bash
# 1. Instalar PostgreSQL (si no lo tienes)
#    Windows: choco install postgresql
#    Mac: brew install postgresql
#    Linux: sudo apt install postgresql

# 2. Crear base de datos
createdb worship_piano
createdb worship_piano_test

# 3. Variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 4. Instalar dependencias (desde la raíz del monorepo)
pnpm install

# 5. Generar cliente Prisma
pnpm prisma:generate

# 6. Ejecutar migraciones
pnpm prisma:migrate

# 7. Seed inicial (estilos, tips, canciones preset)
pnpm db:seed
```

## Comandos

```bash
pnpm dev              # Servidor con hot-reload (tsx watch)
pnpm build            # Compilar TypeScript
pnpm start            # Servidor producción
pnpm lint             # ESLint
pnpm typecheck        # tsc --noEmit
pnpm test             # Vitest (watch mode)
pnpm test:run         # Vitest (CI mode)

# Prisma
pnpm prisma:generate  # Generar cliente
pnpm prisma:migrate   # Crear/aplicar migración en dev
pnpm prisma:deploy    # Aplicar migraciones en prod
pnpm prisma:studio    # GUI en http://localhost:5555
pnpm db:seed          # Ejecutar seed
```

## Endpoints

### Auth (público)
- `POST /api/auth/register` — Crear cuenta
- `POST /api/auth/login` — Iniciar sesión
- `GET /api/auth/me` — Perfil actual (requiere token)
- `PATCH /api/auth/me` — Actualizar nombre/PIN (requiere token)

### Songs
- `GET /api/songs?search=&styleId=&tab=&limit=&offset=` — Listar
- `GET /api/songs/:id` — Detalle
- `POST /api/songs` — Crear (requiere token)
- `PATCH /api/songs/:id` — Editar (requiere token + ownership)
- `DELETE /api/songs/:id` — Eliminar (requiere token + ownership)

### Audio
- `POST /api/songs/:songId/audio` — Subir audio (multipart/form-data, max 25 MB)
- `GET /api/songs/:songId/audio` — Metadata del audio
- `DELETE /api/songs/:songId/audio` — Eliminar
- `GET /api/storage/:key` — Stream público del archivo

### Sessions
- `GET /api/sessions/user/:userId` — Sesiones de un usuario
- `POST /api/sessions` — Registrar sesión
- `GET /api/sessions/stats/me` — Stats agregadas

### Ear Training
- `POST /api/ear-training` — Registrar resultado
- `GET /api/ear-training?exerciseType=&limit=&offset=` — Mis resultados
- `GET /api/ear-training/stats/me` — Accuracy y breakdown por tipo

### User Settings
- `PATCH /api/users/:id/settings` — Actualizar settings (requiere ownership)
- `POST /api/users/:id/xp` — Añadir XP
- `PUT /api/users/:id/phone` — Guardar teléfono (formato E.164)
- `DELETE /api/users/:id/phone` — Limpiar teléfono

### Shares (compartir canciones)
- `POST /api/shares` — Compartir canción con email
- `GET /api/shares/received` — Canciones compartidas conmigo
- `GET /api/shares/sent` — Canciones que he compartido
- `DELETE /api/shares/:shareId` — Revocar share

### Leaderboard
- `GET /api/leaderboard?category=&period=&limit=` — Ranking global
  - Categorías: `total_minutes`, `sessions_completed`, `ear_training_accuracy`
  - Períodos: `daily`, `weekly`, `monthly`, `all_time`
  - Devuelve `myRank` para el usuario autenticado

### Sync (offline-first)
- `GET /api/sync/status` — Estado del servidor (serverTime, minSupportedClientVersion)
- `GET /api/sync/snapshot` — Snapshot completo del usuario (canciones, sesiones, ear training, catálogo, shares)
- `POST /api/sync/batch` — Procesa batch de operaciones offline. Devuelve resultados por op.
  - Ops soportadas: `create_song`, `delete_song`, `create_session`, `create_ear_training`, `add_xp`, `update_settings`
  - Cada op incluye `clientId` para reconciliación con el outbox del cliente
  - Resultado por op: `applied | rejected | error`, con `serverId` y `error` opcional

### Live Sessions (REST + WebSockets)
- `POST /api/live-sessions` — Crea sesión en vivo (body: `{ songId, bpm? }`). Devuelve estado inicial.
- `GET /api/live-sessions` — Lista las sesiones activas del host actual (multi-sesión).
- `GET /api/live-sessions/:id` — Estado actual de la sesión (registry en memoria, fallback a DB).
- `POST /api/live-sessions/:id/end` — Finaliza la sesión (sólo host).
- **Recovery on boot**: `server.ts` llama a `recoverFromDatabase()` al iniciar, que rehidrata el registry con sesiones activas de Prisma (filtradas por `SESSION_TTL_MS`).
- **Persistencia**: cada `ended` (host o TTL) actualiza `endedAt` en Prisma via lifecycle hook.
- **WebSocket** `ws://host:port` (Socket.IO 4.x):
  - Auth: `auth: { token: <JWT> }` en el handshake
  - Cliente → Server: `session:join`, `session:leave`, `session:pause`, `session:resume`, `session:end`, `session:beat-report`, `leaderboard:subscribe`, `leaderboard:unsubscribe`
  - Server → Cliente: `session:state`, `session:beat`, `session:paused`, `session:resumed`, `session:ended`, `session:error`, `session:participant-joined`, `session:participant-left`, `leaderboard:updated`
  - Sólo el host puede pausar / reanudar / reportar beats / finalizar

### QR (invitar guest a sesión en vivo)
- `POST /api/live-sessions/:id/qr` — Genera QR para unirse (sólo host, requiere token). Devuelve `{ token, qrUrl, expiresAt }`. El token vive 5 minutos, one-shot.
- `POST /api/qr/redeem` — Canjea token (público). Body: `{ token }`. Devuelve `{ sessionId, hostId }` y (si la conexión entrante es un WebSocket) el socket queda auto-añadido a `session:<id>` con `socket.data.autoJoinSessionId`.

### Push (Web Push / VAPID)
- `GET /api/push/vapid-public-key` — Devuelve la clave pública VAPID (público). El cliente la usa para `subscribe()`.
- `POST /api/push/subscribe` — Registra suscripción (requiere token). Body: `{ endpoint, keys: { p256dh, auth } }`.
- `POST /api/push/unsubscribe` — Elimina suscripción (requiere token). Body: `{ endpoint }`.
- `POST /api/push/test` — Envía push de prueba al usuario actual (requiere token). Útil para debugging.

### Catalog (público)
- `GET /api/catalog/styles` — Estilos musicales
- `GET /api/catalog/tips?category=&styleId=&difficultyMin=` — Tips filtrados

## Autenticación

Todas las rutas protegidas esperan un header:
```
Authorization: Bearer <jwt-token>
```

El token se obtiene en `/api/auth/register` o `/api/auth/login`.
Expira en 7 días (configurable via `JWT_EXPIRES_IN`).

## Estructura

```
apps/api/
├── prisma/
│   ├── schema.prisma       # Schema de DB
│   └── seed.ts             # Datos iniciales
├── src/
│   ├── config/             # env, database
│   ├── controllers/        # Lógica de negocio
│   ├── middleware/         # auth, error, rate limit
│   ├── routes/             # Definición de rutas
│   ├── services/           # password, token
│   ├── validators/         # Schemas Zod
│   ├── app.ts              # Configuración Express
│   └── server.ts           # Bootstrap
└── tests/
    ├── setup.ts            # Setup vitest
    ├── auth.test.ts        # Tests integración auth
    └── env.test.ts         # Tests unitarios env
```

## Despliegue

Hay tres rutas soportadas, de menor a mayor control:

### 1. Docker + GitHub Container Registry (recomendado)

El workflow `.github/workflows/docker-publish.yml` publica la imagen a `ghcr.io` automáticamente:

- `push` a `main` → `ghcr.io/<owner>/chordshift-api:main`
- `tag v*` → `ghcr.io/<owner>/chordshift-api:vX.Y.Z`
- PR → `ghcr.io/<owner>/chordshift-api:pr-<num>`

La imagen se construye multi-stage con `apps/api/Dockerfile` (Node 20-alpine, usuario no-root, healthcheck integrado).

Luego cualquier provider puede hacer pull:

```bash
docker pull ghcr.io/ismapx/chordshift-api:main
docker run --rm -p 3001:3001 --env-file .env ghcr.io/ismapx/chordshift-api:main
```

### 2. Railway / Render / Fly.io (más simple)

Estos providers soportan Docker nativamente. Configuración típica:

- **Build command**: (vacío — usan Dockerfile)
- **Start command**: (vacío — usa CMD del Dockerfile)
- **Dockerfile path**: `apps/api/Dockerfile`
- **Image source**: `ghcr.io/ismapx/chordshift-api:main` (con auto-deploy)
- **Variables de entorno**: ver `.env.example` (pegar todas en el dashboard)
- **Postgres**: añadir add-on PostgreSQL del provider y pegar su `DATABASE_URL`
- **Port**: `3001` (ya expuesto en el Dockerfile)
- **Healthcheck path**: `/api/health` (en el manifest del Dockerfile)

#### Fly.io (ejemplo con `fly.toml`)

```toml
app = "chordshift-api"
primary_region = "iad"

[build]
  image = "ghcr.io/ismapx/chordshift-api:main"

[env]
  NODE_ENV = "production"
  PORT = "3001"

[[services]]
  internal_port = 3001
  protocol = "tcp"
  [[services.ports]]
    port = 80
    handlers = ["http"]
    force_https = true
  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

  [[services.tcp_checks]]
    interval = "15s"
    timeout = "2s"
    grace_period = "10s"

[deploy]
  release_command = "node node_modules/.prisma/client scripts/migrate-deploy.js"
```

> **Importante**: el `release_command` corre las migraciones Prisma antes de levantar la nueva versión. Alternativa: hacer `prisma migrate deploy` en un `CMD` externo y dejar que la app corra en un container separado.

#### Railway

Railway detecta el Dockerfile automáticamente. Sólo:

1. Crear nuevo proyecto desde GitHub repo
2. Apuntar root a la rama `main`
3. Añadir plugin PostgreSQL (Railway crea `DATABASE_URL` automáticamente)
4. Pegar las demás vars de `.env.example`
5. Railway redeploya en cada push a `main`

#### Render

- New → Web Service → Image URL: `ghcr.io/ismapx/chordshift-api:main`
- Port: `3001`
- Health check: `/api/health`
- Add Disk: 1 GB (sólo si `STORAGE_DRIVER=local`)

### 3. Build local (sin Docker)

```bash
# Compilar
pnpm build

# Generar cliente Prisma
pnpm prisma:generate

# Aplicar migraciones (en prod, una sola vez)
pnpm prisma:deploy

# Arrancar
pnpm start
```

Necesitas un PostgreSQL accesible y todas las vars de `.env.example` definidas.

### Orden de operaciones recomendado

1. **Subir imagen**: push a `main` o crear tag `v*` → la imagen queda en ghcr.io.
2. **Configurar provider**: crear servicio en Railway/Render/Fly que apunte a la imagen.
3. **Añadir PostgreSQL**: add-on del provider o externo (Supabase/Neon/Railway Postgres).
4. **Configurar env vars**: copiar todas las vars de `.env.example` con valores reales.
5. **Migrar DB**: en el primer deploy, `prisma migrate deploy` corre la migración. Si tu provider no lo hace automáticamente, conectarte por SSH y correrlo manualmente.
6. **Seed (opcional)**: `pnpm db:seed` para crear estilos, tips, canciones preset y el admin (`admin@worshippiano.app / admin123456`).
7. **Verificar**: `curl https://tu-api.com/api/health` debe responder 200.

### CORS en producción

No olvides actualizar `CORS_ORIGIN` con la URL de tu frontend (Vercel, dominio custom, etc). Si el frontend y la API están en subdominios distintos, separar por comas:

```
CORS_ORIGIN=https://web-1tmdqw12l-maikel-js-projects.vercel.app,https://chordshift.app
```

## Próximos pasos
- [x] Storage remoto para audios (S3/Supabase Storage) — `STORAGE_DRIVER=s3|supabase`
- [x] Notificaciones push (VAPID) — opcional, configurable via env
- [x] QR para sesiones en vivo
- [ ] Materialized views para leaderboard (cuando el volumen crezca)
