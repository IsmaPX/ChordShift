---
name: deployment
description: MUST be loaded before deploying the Worship Piano application to any environment (development, staging, production). Includes build validation, environment setup, and post-deployment verification.
---

# Deployment Skill — Worship Piano App

## Contexto del proyecto
Worship Piano es una aplicación web (Node.js + frontend) que requiere despliegue controlado para evitar fallos en audio, sincronización y dependencias del sistema.

---

## 1. Pre-despliegue (OBLIGATORIO)

### Validación del código
- Ejecutar linting del proyecto
- Verificar que no existan errores de build
- Confirmar que el código compila correctamente (frontend y backend)

### Pruebas
- Ejecutar pruebas unitarias
- Ejecutar pruebas de integración
- Validar flujos críticos:
  - Carga de canciones
  - Reproducción de piano/audio
  - Sincronización de eventos

### Dependencias
- Verificar `package.json` sin conflictos
- Limpiar `node_modules` si hay inconsistencias
- Confirmar versiones compatibles de Node.js

---

## 2. Variables de entorno

- Verificar `.env` o variables del hosting
- Confirmar:
  - BASE_URL
  - API_URL
  - DB_CONNECTION (si aplica)
  - STORAGE / MEDIA_PATH
- Nunca exponer credenciales en el build

---

## 3. Build

- Generar build de producción:
  - Frontend: `npm run build`
  - Backend: `npm run build` (si aplica)
- Confirmar que no hay warnings críticos
- Validar tamaño del bundle (evitar sobrecarga de audio assets)

---

## 4. Despliegue

- Seleccionar entorno correcto:
  - development / staging / production
- Subir artefactos del build
- Aplicar migraciones de base de datos (si existen)
- Reiniciar servicios

---

## 5. Post-despliegue (CRÍTICO)

- Verificar que el servidor responde (health check)
- Probar endpoints principales
- Validar:
  - Reproducción de audio/piano
  - Carga de recursos multimedia
  - Latencia aceptable
- Revisar logs de errores inmediatamente

---

## 6. Rollback (si falla)

- Revertir a la última versión estable
- Restaurar base de datos si fue afectada
- Verificar integridad del sistema antes de reabrir tráfico

---

## 7. Checklist final

- [ ] Build exitoso
- [ ] Tests OK
- [ ] Variables de entorno configuradas
- [ ] Despliegue completado
- [ ] Sistema funcional verificado
- [ ] Logs sin errores críticos