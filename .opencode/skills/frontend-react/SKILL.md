---
name: frontend-react
description: MUST be loaded before modifying React components, providers, routing, or UI logic in apps/web.
---

# Frontend React Skill — Worship Piano App

## Objetivo
Mantener consistencia en la arquitectura frontend: providers, routing, componentes y estilos.

---

## 1. Estructura de mounts (main.tsx)

**NO existe App.tsx**. El mount es directo:

```
main.tsx
  └── QueryClientProvider
        └── LanguageProvider
              └── OnboardingProvider
                    └── AudioGateProvider
                          └── AudioGate
                                └── RouterProvider
```

### Regla crítica
`<AudioGate>` y `<AudioGateProvider>` **deben quedarse en main.tsx (root)**.
Moverlos a un layout causa remounts y vuelve a aparecer "toca para empezar".

---

## 2. Routing

### Dual router
```typescript
// src/lib/router.tsx
const router = import.meta.env.VITE_ELECTRON_BUILD
  ? createHashRouter()   // Electron
  : createBrowserRouter() // Web
```

### Route groups
```
src/app/
  (auth)/        → /login, /register
  (app)/         → /practice, /ear-training, /encyclopedia, etc.
  (demo)/        → /demo/effects
```

### Rutas
| Path | Descripción |
|------|-------------|
| `/practice` | Práctica principal |
| `/practice/:songId` | Práctica con canción |
| `/ear-training` | Entrenamiento auditivo |
| `/encyclopedia` | Enciclopedia de acordes |
| `/settings` | Configuración |
| `/leaderboard` | Rankings |
| `/shared` | Canciones compartidas |
| `/sync` | Estado de sincronización |
| `/join` | Unirse a sesión |
| `/live/:songId` | Sesión en vivo |
| `/demo/effects` | Demo de efectos |

---

## 3. Providers

### AudioGateContext
- `src/contexts/AudioGateContext.tsx`
- Controla estado de "toca para empezar"
- No remountar en navegación

### QueryClientProvider
- Configuración de React Query
- Opciones por defecto

### LanguageProvider
- i18n del app

### OnboardingProvider
- Estado de onboarding

---

## 4. API layer (opcional)

### Repository provider
```typescript
// src/lib/api/repositoryProvider.ts
// Elige entre Dexie (offline) o API según:
// - VITE_API_URL (variable de entorno)
// - localStorage['worship_piano_backend_mode']
```

### Default
- Dexie (offline-first)
- Solo cambia a API si está configurado

### Páginas que requieren API
- `/leaderboard`
- `/shared`

### Toggle runtime
```javascript
localStorage.setItem('worship_piano_backend_mode', 'api')
```

---

## 5. Estilos (Tailwind 4)

```css
/* index.css */
@import "tailwindcss";
@theme {
  /* Variables anime */
  --color-anime-pink: ...
  --color-anime-blue: ...
  /* Utilities glow */
  --utility-glow-green: ...
}
```

### Clases custom
- `glow-green`, `glow-pink`, `glow-blue`
- `text-gradient-anime`, `text-gradient-green`
- `anime-pink`, `anime-blue`, `anime-purple`

---

## 6. Audio engine

### Ubicación
`apps/web/src/audio/AudioEngine.ts` — wrapper singleton de Tone.js

### Imports
- **NO importar** clases de `packages/audio` directamente en web
- Los tests web mockean `@/audio/AudioEngine`

### packages/audio
- Lógica Tone.js compartida y testeable en Node
- Tests usan mock de `@/audio/AudioEngine`

---

## 7. Service Worker / PWA

- Se registra **solo** si `!('isElectron' in window)`
- Ubicación typical: `public/sw.js`

---

## 8. Path alias

- `@/` → `apps/web/src/`
- No existe `@api/` como alias real

---

## 9. Puntos de integración

| Componente | Depende de |
|------------|------------|
| MusicStaff | Pitch mapping, notas |
| AudioEngine | Tone.js |
| SyncStatus | SyncManager |
| SocketStatus | Socket.IO |

---

## 10. Checklist Frontend

- [ ] AudioGate en root de main.tsx
- [ ] Router usa Hash en Electron
- [ ] Providers en orden correcto
- [ ] Tailwind 4 con variables
- [ ] API layer optional
- [ ] PWA solo en web
- [ ] Path aliases correctos