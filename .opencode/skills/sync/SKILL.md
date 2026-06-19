---
name: sync
description: MUST be loaded before modifying offline sync logic, Socket.IO client, or live session synchronization.
---

# Sync Skill — Worship Piano App

## Objetivo
Mantener consistencia en la sincronización offline-first, incluyendo outbox, sync manager y socket.IO.

---

## 1. Arquitectura offline-first

### Capas
1. **Outbox** (`src/lib/sync/outbox.ts`): cola de operaciones en IndexedDB
2. **SyncManager** (`src/lib/sync/syncManager.ts`): flush automático en eventos online/offline
3. **SnapshotClient** (`src/lib/sync/snapshotClient.ts`): hidrata Dexie desde `/api/sync/snapshot`

### Outbox
- Almacena operaciones pendientes en IndexedDB (persistente)
- Máximo 5 intentos por operación
- Reintenta en eventos `online` o cuando hay conexión

### SyncManager
- Auto-flush en eventos `online`/`offline`
- Backoff exponencial: 1s → 5min
- No enviar operaciones si ya hay una en curso

---

## 2. Socket.IO cliente

### Archivo
`src/lib/socket/index.ts` — singleton

### Reconexión
- Backoff: 1s → 5min
- Auto-reconnect habilitado

### Hooks disponibles
- `useSocket()` — socket instance
- `useSocketStatus()` — conexión activa
- `useLiveSession()` — sesión en vivo
- `useLeaderboardRealtime()` — leaderboard en tiempo real

---

## 3. Live Sessions

### Rooms
- `session:<id>` — sala de la sesión
- `leaderboard:<category>:<period>` — sala del leaderboard

### Eventos socket
- `beat` — sincronización de beat del host
- `session:update` — actualización de sesión
- `leaderboard:update` — cambio en leaderboard

### Beat Sync
- Interpola beats con `requestAnimationFrame`
- `classifyDrift()` colorea latencia:
  - Verde: < 50ms
  - Amarillo: 50-100ms
  - Rojo: > 100ms

---

## 4. Guest join

- Guest recibe QR o código del host
- Handshake envía `auth.token` (guest token) o `socket.data.autoJoinSessionId`
- userId del guest: `guest:<hostId>`

---

## 5. API endpoints REST auxiliares

- `POST /api/live-sessions` — crear sesión
- `GET /api/live-sessions/:id` — obtener sesión
- `POST /api/live-sessions/:id/end` — terminar sesión

### Solo socket
- pause/resume/beat

---

## 6. Snapshot e hidratación

### GET /api/sync/snapshot
Retorna estado completo para hidratar Dexie local.

### Flujo
1. App detecta que no hay datos locales
2. Llama `/api/sync/snapshot`
3. Hydrata Dexie con respuesta
4. Usuario puede usar app offline

---

## 7. UI de sincronización

### Hook
`useSyncStatus()` — estado actual de sync

### Componente
`<SyncStatusBadge />` — indicador visual en UI

---

## 8. Checklist Sync

- [ ] Outbox persiste operaciones
- [ ] Max 5 reintentos
- [ ] SyncManager auto-flusha
- [ ] Socket reconecta con backoff
- [ ] Live sessions transmiten beats
- [ ] Guest join funciona
- [ ] Snapshot hidrata correctamente
- [ ] UI muestra estado de sync