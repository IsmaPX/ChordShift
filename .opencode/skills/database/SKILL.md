---
name: database
description: MUST be loaded before modifying Prisma schema, migrations, database configuration, or data access patterns.
---

# Database Skill — Worship Piano App

## Objetivo
Mantener integridad del schema, migraciones correctas y patrones de acceso consistentes con Prisma.

---

## 1. Stack

- **ORM**: Prisma 5.22
- **Database**: PostgreSQL 16
- **Cliente**: `@prisma/client` (singleton para evitar duplicados en HMR)

---

## 2. Schema Prisma

### Ubicación
- `apps/api/prisma/schema.prisma`
- Interfaz compartida: `packages/db/src/index.ts`

### Reglas del schema
- **Nunca** editar `schema.prisma` sin generar migración
- Usar nombres en snake_case para campos de BD
- Timestamps: `createdAt` y `updatedAt` con `@updatedAt`
- Soft deletes con `deletedAt DateTime?` donde aplique

---

## 3. Migraciones

```bash
# Development
cd apps/api && pnpm prisma:migrate

# Production
cd apps/api && pnpm prisma:deploy
```

### Reglas
- No editar migraciones manualmente después de aplicadas
- Si hay conflicto, crear nueva migración
- Verificar que `prisma generate` corre tras migración

---

## 4. Cliente Prisma (singleton)

```typescript
// apps/api/src/config/database.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Por qué
Evita instancias duplicadas en HMR de desarrollo.

---

## 5. Seed

```bash
cd apps/api && pnpm db:seed
```

### Datos iniciales
- Admin: `admin@worshippiano.app` / `admin123456`
- Styles predefinidos
- Tips de práctica
- Canciones preset

---

## 6. Variables de entorno (validadas con Zod)

### Obligatorias
- `DATABASE_URL` — connection string completo
- `JWT_SECRET` — >= 32 caracteres
- `CORS_ORIGIN` — url del frontend
- `STORAGE_DRIVER` — `local` | `s3` | `supabase`
- `BCRYPT_ROUNDS` — número de rounds para bcrypt

### Opcionales según storage
- `AWS_*` (para S3/R2)
- `SUPABASE_*` (para Supabase storage)

---

## 7. Storage factory

Drivers soportados:
- `local`: sistema de archivos local
- `s3`: AWS S3, R2, MinIO, DigitalOcean Spaces
- `supabase`: Supabase Storage

Selección por variable `STORAGE_DRIVER`.

---

## 8. Errores Prisma comunes

| Código | Significado | HTTP |
|--------|-------------|------|
| P2002 | Unique constraint | 409 |
| P2025 | Record not found | 404 |

Manejados en `middleware/error.middleware.ts`.

---

## 9. Testing con BD

- Usar `worship_piano_test` (base separada)
- Cada test debe limpiar su estado si modifica datos
- No asumir estado de tests anteriores

---

## 10. Checklist Database

- [ ] Schema no editado sin migración
- [ ] Migraciones aplicadas correctamente
- [ ] Seed genera datos iniciales
- [ ] Singleton de Prisma configurado
- [ ] Variables de entorno validadas
- [ ] Storage factory funcionando
- [ ] Tests usan BD separada