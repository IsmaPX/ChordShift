---
name: electron
description: MUST be loaded before modifying Electron main process, preload scripts, or desktop-specific functionality.
---

# Electron Skill — Worship Piano App

## Objetivo
Mantener la integridad del build desktop, evitando crashes, problemas de CSP y comportamiento inconsistente con la versión web.

---

## 1. Proceso principal (main)

### Archivos clave
- `apps/web/electron/main.ts` — punto de entrada
- `apps/web/electron/preload.ts` — contexto bridge

### Reglas críticas
- **`app.requestSingleInstanceLock()` es OBLIGATORIO**
  ```typescript
  const lock = app.requestSingleInstanceLock()
  if (!lock) app.quit()
  ```
- `loadFile()` siempre con `.catch()` para evitar crashes silenciosos
- CSP nonce implementado para scripts inyectados

### Atajos globales
| Atajo | Acción |
|-------|--------|
| `CommandOrControl+Shift+P` | practice |
| `CommandOrControl+Shift+E` | ear-training |
| `CommandOrControl+Shift+S` | settings |

---

## 2. Preload script

- Expone API limitada al renderer via contextBridge
- **Nunca** exponer `require` o `ipcRenderer` directo
- Métodos permitidos:
  - `window.isElectron`
  - `window.electronAPI` (si se define)

---

## 3. Build y distribución

### Vite config (electron)
```typescript
// apps/web/vite.config.ts
base: './'  // cuando VITE_ELECTRON_BUILD=true
```
- Rutas deben ser relativas para funcionar en build desktop

### Scripts
```bash
pnpm dev:electron        # VITE_ELECTRON_BUILD=true vite
pnpm build:electron      # build con main/preload
pnpm dist:win|mac|linux  # electron-builder
pnpm release             # electron-builder --x64 --publish always
```

### Code signing
- Opcional en este proyecto
- `CSC_IDENTITY_AUTO_DISCOVERY=false` desactiva búsqueda de certs
- Sin secrets, binarios suben sin firmar

---

## 4. Diferencias con web

| Aspecto | Web | Electron |
|---------|-----|----------|
| Router | Browser o Hash | Hash (obligatorio) |
| Base path | `/` | `./` |
| Service Worker | Sí | No |
| PWA | Completo | Limitado |

---

## 5. Troubleshooting

### Build falla
- Verificar `VITE_ELECTRON_BUILD=true`
- Confirmar que `electron` y `electron-builder` están instalados

###blank screen al abrir
- Revisar CSP en main.ts
- Verificar que `loadFile` usa path correcto
- Check logs de main process

### audio no funciona
- Electron puede bloquear audio automático
- Requiere gesture del usuario para primer audio

---

## 6. Checklist Electron

- [ ] `requestSingleInstanceLock` implementado
- [ ] `loadFile` con `.catch()`
- [ ] CSP nonce configurado
- [ ] Atajos globales funcionando
- [ ] Build desktop genera ejecutable
- [ ] No blank screens en producción