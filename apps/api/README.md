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
- `GET /api/live-sessions/:id` — Estado actual de la sesión (registry en memoria, fallback a DB).
- `POST /api/live-sessions/:id/end` — Finaliza la sesión (sólo host).
- **Recovery on boot**: `server.ts` llama a `recoverFromDatabase()` al iniciar, que rehidrata el registry con sesiones activas de Prisma (filtradas por `SESSION_TTL_MS`).
- **Persistencia**: cada `ended` (host o TTL) actualiza `endedAt` en Prisma via lifecycle hook.
- **WebSocket** `ws://host:port` (Socket.IO 4.x):
  - Auth: `auth: { token: <JWT> }` en el handshake
  - Cliente → Server: `session:join`, `session:leave`, `session:pause`, `session:resume`, `session:end`, `session:beat-report`, `leaderboard:subscribe`, `leaderboard:unsubscribe`
  - Server → Cliente: `session:state`, `session:beat`, `session:paused`, `session:resumed`, `session:ended`, `session:error`, `session:participant-joined`, `session:participant-left`, `leaderboard:updated`
  - Sólo el host puede pausar / reanudar / reportar beats / finalizar

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

### Vercel (recomendado para prototipos)
```bash
# Crear vercel.json en la raíz del proyecto
# El root directory es apps/api
```

### Railway / Render
```bash
# Build command: pnpm build
# Start command: pnpm start
# Variables de entorno: ver .env.example
```

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter api prisma:generate && pnpm --filter api build
EXPOSE 3001
CMD ["pnpm", "--filter", "api", "start"]
```

## Próximos pasos
- [ ] Storage remoto para audios (S3/Supabase Storage) — actualmente filesystem local
- [ ] Notificaciones push
- [ ] Materialized views para leaderboard (cuando el volumen crezca)
