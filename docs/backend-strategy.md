# Estrategia de Backend - Worship Piano App / ChordShift

## Resumen Ejecutivo

Dado el estado actual del proyecto (offline-first con Dexie/IndexedDB), proponemos una transición por fases hacia un backend robusto que preserve la experiencia offline mientras agrega capacidades cloud.

## Opciones Arquitectónicas Evaluadas

### A. Baseline - Estado Actual (Dexie Offline)
**Qué tenemos:** Todo en cliente.
- ✅ 100% offline, funciona sin internet
- ✅ Sin costos de infraestructura
- ❌ Sin sync entre dispositivos
- ❌ Sin backups
- ❌ Sin funcionalidades sociales

### B. Supabase como Backend Principal (Recomendado)
Migración a Supabase: reemplaza Dexie por PostgreSQL+Auth+RLS.
- **Pros:** Auth listo, DB relacional, RLS, Realtime, Storage, JS SDK, ya está en el stack.
- **Contras:** Migración completa, pensar offline-first.
- **Esfuerzo:** ⭐⭐⭐☆☆
- **Cuándo:** Ideal para datos personales, sync entre dispositivos y rankings globales.

### C. Backend Propio (Node.js/Express + Prisma + PostgreSQL)
API REST propia, 100% control del stack.
- **Pros:** Control total, CI/CD homogéneo (usamos Node), arquitectura que conocemos:
   - Express/Fastify para API
   - Prisma ORM para PostgreSQL
   - JWT para Auth
   - Swagger/OpenAPI documentación
- **Contras:** Implementar Auth propio, más líneas de código.
- **Esfuerzo:** ⭐⭐⭐⭐☆
- **Cuándo:** Si necesitamos lógica de negocio muy custom o queremos evitar vendor lock-in.

### D. Híbrido Dexie + Supabase (Offline-First Sync)
Dexie para offline + Supabase backend. Sync cuando hay conexión.
- **Pros:** La experiencia offline se mantiene.
- **Contras:** Complejidad de sync, conflictos de datos, doble implementación.
- **Esfuerzo:** ⭐⭐⭐⭐⭐
- **Cuándo:** Si offline-first es crítico y no se puede perder funcionalidad sin red.

## Decisión

**Partimos por la Opción B (Supabase)** por:
1. Ya está en el stack documentado (README dice "Backend: Supabase")
2. Menor esfuerzo que C y D para funcionalidad básica
3. Auth integrado (no reimplementamos hashes de PIN)
4. RLS para seguridad sin código adicional

**Pero:** preservaremos la capa de repositorios existente (patrón repository en `src/lib/repositories/`) para poder cambiar de proveedor en el futuro sin tocar la UI.

## Plan de Implementación (Fases)

### Fase 1: Infraestructura y Auth
- Crear proyecto Supabase
- Configurar tablas: `users`, `profiles`, `songs`, `practice_sessions`, `ear_training_results`
- Implementar Auth (email/password, opcionalmente OAuth con Google)
- Migrar `useAuth` del frontend para usar Supabase Auth

### Fase 2: Repositorios Cloud
- Implementar `SupabaseUserRepository`, `SupabaseSongRepository`, etc.
- Mantener `DexieUserRepository` como fallback offline
- Configurar TanStack Query con invalidación de caché

### Fase 3: Funcionalidades Avanzadas
- Row Level Security: cada usuario solo ve sus datos
- Rankings globales (tabla `leaderboard` con datos agregados)
- Compartir canciones (tabla `shared_songs` con permisos)

### Fase 4: Sync Offline
- Opcional: Dexie como caché local
- Sync automático cuando hay conexión
- Manejo de conflictos (último gana o estrategia custom)

## Consideraciones de Seguridad
- RLS obligatorio en todas las tablas
- Nunca confiar en el cliente para validación de datos
- Hashear PINS en el backend (no en frontend) si se mantiene funcionalidad de PIN
- Sanitizar inputs y usar prepared statements (Prisma lo hace automáticamente)

## Presupuesto Estimado
- **Supabase Free Tier:** Suficiente para <10k usuarios
- **Después:** ~$25/mes para Pro (mejor rendimiento y soporte)
