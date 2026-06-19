---
name: business-logic
description: MUST be loaded before implementing or modifying any business rules, data flow logic, or core application behavior in the Worship Piano system. Ensures consistency in musical workflows, song handling, and system rules.
---

# Business Logic Skill — Worship Piano App

## Objetivo
Definir y controlar toda la lógica de negocio del sistema Worship Piano, asegurando coherencia en el manejo de canciones, reproducción, sincronización y reglas del sistema.

---

## 1. Principios de lógica de negocio

- La lógica de negocio NO debe depender de la UI
- La lógica de negocio NO debe estar mezclada con el acceso a datos
- Toda regla debe ser determinística (mismo input = mismo output)
- Evitar duplicación de reglas en múltiples módulos
- Centralizar decisiones críticas del sistema

---

## 2. Dominio del sistema (Worship Piano)

### Entidades principales
- **Song**: canción con estructura musical, tempo, metadatos
- **User**: usuario con configuraciones y progreso
- **Session**: sesión de reproducción activa
- **MusicEvent**: evento musical con timestamp absoluto
- **PlaybackSettings**: configuración de reproducción

### Entidades secundarias
- Style, Tip, Category (contenido estático)
- LiveSession, LeaderboardEntry ( multiplayer)
- SyncOperation (offline queue)

---

## 3. Reglas de negocio

### Canciones
- Una canción debe tener estructura válida antes de ser reproducida
- No se permite reproducción de canciones incompletas o corruptas
- Cada canción debe tener: tempo, estructura (sections), eventos musicales
- El campo `isComplete` debe ser `true` para considerarse reproducible

### Reproducción
- Solo una sesión activa de reproducción por usuario
- La reproducción debe poder pausarse y reanudarse sin pérdida de estado
- El estado de reproducción debe ser persistente durante la sesión
- Almacenar `currentPosition` como timestamp absoluto, no offset

### Sincronización musical
- Todo evento musical debe basarse en tiempo absoluto (timestamps)
- No se permiten delays fijos como base de sincronización
- Los eventos deben ejecutarse en orden estricto
- Interpolar beats con `requestAnimationFrame` para precisión

###Live Sessions (multiplayer)
- El host crea la sesión y recibe un código QR
- Guests se unen via QR o código
- El host transmite beats en tiempo real
- Sistema de latencia con clasificación (good/warning/critical)

### Gestión de estado
- El estado de la canción debe ser la fuente de verdad
- UI y frontend solo reflejan el estado, no lo definen
- Cambios de estado deben pasar por capa de negocio
- Nomutar estado directamente en componentes

---

## 4. Flujos críticos

### Flujo de carga de canción
1. Validar estructura de la canción (`validateSong()`)
2. Cargar metadatos (tempo, key, sections)
3. Preparar recursos de audio
4. Inicializar estado de reproducción

### Flujo de reproducción
1. Verificar validez de la canción
2. Inicializar sesión
3. Sincronizar eventos musicales
4. Actualizar estado en tiempo real

### Flujo de sincronización offline
1. Guardar operación en outbox (IndexedDB)
2. Marcar como pending
3. Intentar flush cuando hay conexión
4. Reintentar hasta máximo 5 intentos
5. Marcar como failed si agotó intentos

---

## 5. Validaciones obligatorias

- Datos consistentes antes de persistencia
- Reglas de sincronización siempre respetadas
- No permitir estados inválidos
- Verificación de integridad de canciones
- Tempo debe estar en rango válido (20-300 BPM)
- Timestamps deben ser monotonically increasing

---

## 6. Manejo de errores de negocio

- Errores deben ser explícitos y descriptivos
- Diferenciar:
  - `ValidationError`: datos inválidos de entrada
  - `StateError`: estado del sistema inconsistente
  - `ExecutionError`: fallo en ejecución de lógica
- Nunca ocultar errores críticos del dominio
- Loguear todos los errores con contexto suficiente

---

## 7. Checklist de lógica de negocio

- [ ] Reglas centralizadas en lugar de dispersas
- [ ] Sin lógica en UI
- [ ] Sin lógica duplicada
- [ ] Estados consistentes
- [ ] Canciones validadas antes de uso
- [ ] Sincronización basada en timestamps
- [ ] Flujo de reproducción estable
- [ ] Offline sync con reintentos