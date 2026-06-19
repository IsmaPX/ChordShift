---
name: testing
description: MUST be loaded before writing or modifying tests in Worship Piano. Covers Vitest, Playwright, and testing patterns across all packages.
---

# Testing Skill — Worship Piano App

## Objetivo
Asegurar calidad y consistencia en todos los tests del proyecto, cubriendo frontend (Vitest + jsdom), backend (Vitest + supertest), audio (Vitest Node) y E2E (Playwright).

---

## 1. Stack de testing

| Paquete | Framework | Ubicación |
|---------|-----------|-----------|
| `apps/web` | Vitest + jsdom | `src/test/setup.tsx` |
| `apps/api` | Vitest + supertest | Config en `vite.config.ts` |
| `packages/audio` | Vitest (Node) | Tests directos |
| `apps/web` E2E | Playwright | `apps/web/e2e/*.spec.ts` |

---

## 2. Setup de tests

### Web (`apps/web/src/test/setup.tsx`)
```typescript
// Mocks obligatorios
mock de framer-motion
mock de @/audio/AudioEngine
fake-indexeddb/auto
polyfills: structuredClone, crypto.randomUUID, crypto.subtle.digest
```

### API (`apps/api`)
- Usa base de datos `worship_piano_test` (separada de dev)
- HMR de Prisma: singleton en `config/database.ts`
- Limpiar estado entre tests si es necesario

### Audio (`packages/audio`)
- Tests en Node puro (no browser)
- Mock de Tone.js si es necesario

---

## 3. Patrones de test

### Web/React
```typescript
// Render con providers
renderWithProviders(<Component />, { initialEntries: ['/path'] })

// En setup.tsx ya se hace seed automático de styles, tips, songs
```

### API/Supertest
```typescript
// Crear app real con supertest
const app = createApp()
const res = await request(app).get('/api/endpoint')
```

### Audio/Node
```typescript
// Test directo sin mocks de browser
const engine = new AudioEngine()
await engine.init()
```

---

## 4. Comandos

```bash
# Root
pnpm test          # vitest watch (todos los paquetes)
pnpm test:run      # vitest run-once

# apps/web
cd apps/web && pnpm test

# apps/api
cd apps/api && pnpm test

# packages/audio
cd packages/audio && pnpm test

# E2E (manual)
cd apps/web && npx playwright test
```

---

## 5. Reglas de E2E (Playwright)

- Specs en `apps/web/e2e/*.spec.ts`
- **No hay script `test:e2e` en package.json**; ejecutar manualmente
- Requiere servidor corriendo (`pnpm dev` o build + serve)
- Comandos típicos:
  ```bash
  npx playwright test                    # todos
  npx playwright test --project=chromium # solo chromium
  npx playwright test file.spec.ts       # uno específico
  npx playwright test --ui              # con UI
  ```

---

## 6. CI

- Job `test` corre web + audio (NO api en CI)
- Job `lint-and-typecheck` corre typecheck + lint en web
- Ambos corren en paralelo tras `install`
- Build depende de ambos

---

## 7. Coverage y calidad

- Aim for meaningful coverage, not 100%
- Test paths críticos:
  - Reproducción de canciones
  - Sincronización offline
  - Auth y sesiones
  - Live sessions
- No testear detalles de implementación, solo comportamiento

---

## 8. Checklist de testing

- [ ] Tests pasan en local
- [ ] Setup correcto (mocks, polyfills)
- [ ] Seed automático funciona
- [ ] No依赖 de navigator.onLine sin mock
- [ ] E2E specs actualizados si hay cambios de UI
- [ ] API tests no rompen en CI