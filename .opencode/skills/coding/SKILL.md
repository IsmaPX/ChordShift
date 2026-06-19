---
name: coding
description: MUST be loaded before writing, modifying, refactoring, or reviewing code in the Worship Piano project. Ensures consistent architecture, maintainability, and correct handling of audio and UI logic.
---

# Coding Skill — Worship Piano App

## Objetivo
Garantizar que todo el código del proyecto Worship Piano sea consistente, mantenible y estable, especialmente en módulos de audio, sincronización y UI musical.

---

## 1. Principios generales

- Escribir código claro y predecible
- Evitar lógica duplicada
- Mantener separación de responsabilidades
- Priorizar estabilidad sobre optimización prematura
- No introducir cambios innecesarios en módulos funcionales

---

## 2. Arquitectura del proyecto

### Frontend
- Componentes UI separados por funcionalidad
- Lógica de audio aislada de la UI
- Estado centralizado cuando sea posible

### Backend (si aplica)
- API REST estructurada
- Controladores separados de servicios
- Validación estricta de datos de entrada

---

## 3. Reglas específicas para Worship Piano

### Audio y reproducción
- Evitar bloqueos del hilo principal
- Usar manejo asincrónico para carga de sonidos
- Pre-cargar recursos de audio cuando sea posible
- Manejar errores de reproducción sin romper la app

### Sincronización musical
- Toda sincronización debe basarse en timestamps, no en delays fijos
- Evitar drift acumulativo en eventos musicales
- Validar precisión en eventos de tiempo

### UI musical
- No bloquear render con lógica pesada
- Mantener actualización de UI fluida (60 FPS objetivo)
- Separar animaciones de lógica de negocio

---

## 4. Estándares de código

- Usar nombres descriptivos y consistentes
- Funciones pequeñas con una sola responsabilidad
- Evitar callbacks anidados excesivos
- Preferir async/await sobre callbacks cuando sea posible

---

## 5. Manejo de errores

- Capturar errores en capas externas (UI y API)
- Nunca fallar silenciosamente en lógica crítica de audio
- Registrar errores de reproducción y sincronización

---

## 6. Refactorización

- Refactorizar solo cuando sea necesario
- No cambiar comportamiento funcional al refactorizar
- Mantener compatibilidad con módulos existentes

---

## 7. Checklist de calidad

- [ ] Código compila sin errores
- [ ] No hay duplicación evidente
- [ ] Audio funciona sin bloqueos
- [ ] Sincronización es estable
- [ ] UI no se congela
- [ ] Manejo de errores implementado
