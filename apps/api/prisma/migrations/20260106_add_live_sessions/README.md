# Migration: add_live_sessions

Añade la tabla `live_sessions` para soportar sesiones en vivo vía WebSockets (Socket.IO).

## Cambios
- Nueva tabla `live_sessions` con metadata de auditoría
- Foreign key a `users` (host) con `ON DELETE CASCADE`
- Índices en `host_id`, `song_id`, `status`, `started_at`

## Aplicar en local
```bash
pnpm prisma:migrate
```

## Aplicar en prod
```bash
pnpm prisma:deploy
```
