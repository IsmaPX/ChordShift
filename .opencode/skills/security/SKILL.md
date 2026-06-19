---
name: security
description: MUST be loaded before modifying authentication, authorization, input validation, or any security-sensitive code.
---

# Security Skill — Worship Piano App

## Objetivo
Asegurar que todas las modificaciones mantengan la seguridad del sistema: auth JWT, validación de inputs, CORS, y protección contra ataques comunes.

---

## 1. Autenticación

### JWT
- Header: `Authorization: Bearer <token>`
- Expiración: **7 días**
- Algoritmo: HS256 (configurable)

### Passwords y PINs
- Bcrypt con rounds configurables via `BCRYPT_ROUNDS`
- Nunca almacenar passwords en texto plano

### Refresh tokens
- Rotación de tokens al refresh
- Invalidar tokens antiguos

---

## 2. Validación de inputs (Zod)

**Toda** entrada debe ser validada con Zod antes de procesarse.

### Reglas
- Strings: longitud mínima/máxima
- Numbers: rango válido (min/max)
- Enums: valores permitidos
- Objetos: schema completo

### Ejemplo
```typescript
const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'user', 'guest']),
})
```

---

## 3. CORS

### Configuración
- `CORS_ORIGIN` valida origen de requests
- Solo orígenes permitidos pueden acceder a la API

### Frontend (web)
- Origin configurado en `.env`
- No enviar credenciales a orígenes no confiables

---

## 4. Inyección SQL

### Prisma
- Usar Prisma para todo acceso a BD
- Nunca concatenar strings en queries
- Prisma sanitiza inputs automáticamente

### No hacer
```typescript
// NUNCA hacer esto
prisma.$queryRaw`SELECT * FROM users WHERE name = ${input}`
```

---

## 5. Rate limiting

- Implementar en endpoints sensibles (login, register)
- Max requests por IP/usuario
- Responder con 429 si se excede

---

## 6. Variables sensibles

### Nunca exponer
- `DATABASE_URL` (contiene credenciales)
- `JWT_SECRET`
- `BCRYPT_ROUNDS`
- Credenciales de storage (AWS keys, etc.)

### En frontend
- Solo variables `VITE_` son públicas
- No almacenar secrets en localStorage

---

## 7. WebSocket security

### Handshake
- Validar JWT en handshake de Socket.IO
- Rechazar conexiones sin token válido

### Rooms
- Verificar que usuario tiene acceso a la room
- No permitir acceso a rooms privadas sin auth

---

## 8. XSS prevention

### React
- React escapa output por defecto
- No usar `dangerouslySetInnerHTML` sin sanitización

### CSP
- Content Security Policy en Electron
- Nonce para scripts inyectados

---

## 9. CSRF

- tokens CSRF en formularios si es necesario
- Verificar Origin header en API

---

## 10. Errores de seguridad

### No exponer
- Stack traces en producción
- Paths de archivos internos
- Versiones de dependencias

### Logging
- Loguear intentos de acceso no autorizado
- No loguear passwords o tokens

---

## 11. Checklist Security

- [ ] JWT con expiración correcta
- [ ] Passwords con bcrypt
- [ ] Inputs validados con Zod
- [ ] CORS configurado
- [ ] Sin inyección SQL
- [ ] Rate limiting en endpoints sensibles
- [ ] Secrets fuera del frontend
- [ ] WebSocket con auth validada
- [ ] No XSS
- [ ] Errores no exponen información sensible