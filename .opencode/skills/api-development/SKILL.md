---
name: api-development
description: MUST be loaded before modifying Express routes, controllers, services, or API validation logic.
---

# API Development Skill — Worship Piano App

## Objetivo
Mantener consistencia en la arquitectura backend: routing → controllers → services → Prisma, con validación Zod en todas las entradas.

---

## 1. Arquitectura en capas

```
routes/ → controllers/ → services/ → Prisma
```

### routes/
- Definen endpoints HTTP
- Validación básica de método y path
- Delegan a controllers

### controllers/
- Extraen y validan request
- Llaman servicios apropiados
- Manejan respuestas HTTP

### services/
- Lógica de negocio
- Coordinan acceso a datos
- No saben de HTTP

### Prisma
- Acceso a datos
- Queries complejas en repository

---

## 2. Validación con Zod

### Ubicación
`apps/api/src/validators/`

### Regla
**TODA** entrada debe ser validada con Zod schema antes de procesarse.

### Ejemplo
```typescript
import { z } from 'zod'

export const createSongSchema = z.object({
  title: z.string().min(1),
  tempo: z.number().min(20).max(300),
  // ...
})
```

### Errores
- `ZodError` → HTTP 400
- Manejado centralmente en `middleware/error.middleware.ts`

---

## 3. Autenticación

### JWT
- Header: `Authorization: Bearer <token>`
- Expiración: 7 días
- Bcrypt para passwords y PINs

### Roles
- Admin: acceso total
- User: acceso a sus recursos
- Guest: solo lectura en sesiones compartidas

---

## 4. Variables de entorno

Validadas con Zod en `config/env.ts` (fail-fast al arrancar).

### Críticas
- `DATABASE_URL`
- `JWT_SECRET` (>= 32 chars)
- `CORS_ORIGIN`
- `STORAGE_DRIVER`
- `VAPID_*` (si se usa push)

---

## 5. Middleware de errores

`middleware/error.middleware.ts`:

| Error | HTTP |
|-------|------|
| ZodError | 400 |
| Prisma P2002 | 409 |
| Prisma P2025 | 404 |
| JWT expired | 401 |
| Default | 500 |

---

## 6. Rutas principales

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`

### Songs
- `GET /api/songs`
- `POST /api/songs`
- `GET /api/songs/:id`
- `PUT /api/songs/:id`
- `DELETE /api/songs/:id`

### Live Sessions
- `POST /api/live-sessions`
- `GET /api/live-sessions/:id`
- `POST /api/live-sessions/:id/end`

### Sync
- `GET /api/sync/snapshot`
- `POST /api/sync/operations` (outbox flush)

---

## 7. WebSocket (Socket.IO)

### Evento de handshake
- Cliente envía `auth.token` (JWT)
- Server adjunta `socket.data.userId`

### Rooms
- `session:<id>` — sesión en vivo
- `leaderboard:<category>:<period>` — leaderboard

---

## 8. Storage

### Factory pattern
```typescript
const storage = StorageFactory.create(driver)
```

### Drivers
- `local`: File system
- `s3`: AWS S3 / R2 / MinIO / DO Spaces
- `supabase`: Supabase Storage

---

## 9. Testing API

- Usar supertest con app Express real
- DB: `worship_piano_test` (separada)
- No hardcodear datos, usar factories o fixtures

---

## 10. Checklist API

- [ ] Estructura routes → controllers → services
- [ ] Toda entrada validada con Zod
- [ ] Errores centralizados
- [ ] Auth JWT funcionando
- [ ] Variables validadas al arrancar
- [ ] Storage factory implementado
- [ ] Tests con supertest