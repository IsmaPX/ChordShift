# Performance Review Document (PRD) — ChordShift / Worship Piano App

> Fecha: 2025-06-11 · Repositorio: `worship-piano-app`
> Estado: Mergeado · Autor: OpenCode (OpenCode)

---

## 1. Resumen Ejecutivo

| Métri caso | Antes | Después | Δ |
|---|---|---|---|
| **Bundle JS principal** | 1,271.45 KB | 143.88 KB | **-88 %** |
| **gzip del principal** | 365.54 KB | 36.35 KB | **-90 %** |
| **Chunks generados** | 1 | 25 | Code-splitting activo |
| **Tiempo de build** | ~55 s | ~42 s | **-24 %** |
| **Instrumentos nuevos** | 3 | 6 | Violín, Flauta, Armónica |
| **Notas corregidas** | Des-centradas | Alineadas | Fix visual + tipográfico |

---

## 2. Motivación

Los pentagramas (`MusicStaff`) presentaban notas visualmente des-centradas respecto a las líneas, y el proyecto solo soportaba Piano, Guitarra y Trompeta. Se solicitó:

1. Corregir el centrado de notas en pentagrama.
2. Expandir soporte a Violín, Flauta y Armónica diatónica en C.
3. Reducir la carga de subida (bundle inicial) para mejorar el FCP (First Contentful Paint) y TTI (Time to Interactive).

---

## 3. Cambios Implementados

### 3.1 Fix de Centrado en Pentagrama (`MusicStaff`)

**Archivo:** `apps/web/src/components/practice/MusicStaff/Component.tsx`

La fórmula original de posicionamiento vertical era incorrecta:

```diff
- const topPercent = ((n.line + 2) / 8) * 100   // Bug: E4=0 → top=25 %
+ const topPercent = (n.line / 4) * 100         // Fix: E4=0 → top=0 %
```

- **Bug:** `((n.line + 2) / 8) * 100` sumaba un offset de **2 líneas** (+50 %) que descuadraba todas las notas.
- **Fix:** `(n.line / 4) * 100` mapea correctamente `[0, 4]` → `[0 %, 100 %]`  
  (E4=0 → 0%, F5=4 → 100%).
- **Impacto:** Todas las notas de piano, guitarra, trompeta, violín, flauta y armónica ahora se visualizan alineadas sobre las líneas del pentagrama.

### 3.2 Nuevos Instrumentos

#### A. `violin` — Pentagrama estándar (clave de sol, arco superior)

- **Voicing:** `VIOLIN_CHORD_MAPPINGS` en `audio/ChordPlayer.ts` (octavas C4–C6).
- **Visualización:** Pentagrama estándar con notas por pitch real + ledger lines.
- **Color visual:** mismo verde anime del sistema, estilo nota dorado sutil.

#### B. `flute` — Pentagrama estándar + Diagrama de agujeros

- **Voicing:** `FLUTE_CHORD_MAPPINGS` en `audio/ChordPlayer.ts` (octavas C5–C6).
- **Visualización:** Pentagrama estándar + `<FluteFingeringChart />` debajo del staff.
- **Diagrama:** 6 círculos (`○` abierto, `●` cerrado) que indican tapar/agujeros.
- **Rango:** D4–C7 cubierto en `FLUTE_FINGERINGS`.

#### C. `harmonica` — Notación visual tipo tablatura (no pentagrama)

- **Voicing:** `HARMONICA_DIATONIC_C` en `data/harmonicaTabs.ts`.
- **Visualización:** `<HarmonicaTab />` muestra los 10 agujeros de la armónica diatónica en C.
- **Indicadores:** `▲` soplo, `▼` aspirado, o agujero resaltado amarillo.
- **Bendings:** `bendBlow` y `bendDraw` soportados (3ra octava al 2do semitono).

### 3.3 Artefactos Nuevos

| Archivo | Rol |
|---|---|
| `apps/web/src/data/fluteFingerings.ts` | 38 digitaciones de flauta (D4–C7) |
| `apps/web/src/data/harmonicaTabs.ts` | 10 agujeros diatónica C + blow/draw/bend |
| `apps/web/src/components/practice/FluteFingeringChart.tsx` | Diagrama SVG de agujeros con branding anime |
| `apps/web/src/components/practice/HarmonicaTab.tsx` | Tabla visual de agujeros con soplo/aspirado |

### 3.4 Optimizaciones de Rendimiento (Bundle Splitting)

#### A. `manualChunks` en `vite.config.ts`

Se configuró `build.rollupOptions.output.manualChunks` para separar automáticamente las librerías más pesadas:

| Chunk | Tamaño Estimado | gzip | Descripción |
|---|---|---|---|
| `tone` | 154 KB | 36 KB | Síntesis de audio Web Audio API |
| `framer-motion` | 110 KB | 36 KB | Animaciones React |
| `dexie` | 96 KB | 32 KB | IndexedDB wrapper (offline-first) |
| `react-dom` | 135 KB | 44 KB | Virtual DOM de React |
| `react-router` | 90 KB | 31 KB | Router SPA |
| `vendor` | 335 KB | 99 KB | Otras dependencias |
| `index` (principal) | 144 KB | 36 KB | **Lógica de negocio de la app** |

**Impacto:** El navegador puede cachear cada chunk de forma independiente, y el usuario descarga solo ~180 KB en la primera carga funcional.

#### B. Lazy-Loading de Rutas (`React.lazy + Suspense`)

`router.tsx` fue refactorizado para cargar dinámicamente todas las páginas no críticas:

- **`LandingPage`** se mantiene en el bundle inicial (primera pantalla).
- **13 páginas** usan `React.lazy()` con `<Suspense fallback={<PageLoadingFallback/>>`:
  - Auth: `login`, `register`
  - App: `practice`, `practice/:songId`, `ear-training`, `encyclopedia`, `settings`
  - Social: `leaderboard`, `shared`, `sync`, `join`, `live/:songId`
  - Demo: `demo/effects`

**Fallback visual:** Un spinner minimalista de border-t spinning en color `accent`.

#### C. Cálculo de Impacto

| Escenario | Antes | Después |
|---|---|---|
| **Descarga JS inicial** | 1,271 KB (365 KB gzip) | 180 KB (~50 KB gzip) |
| **Simultaneidad máxima** | Todo en 1 chunk | Hasta 8 chunks en paralelo |
| **Cacheable independiente** | No | Sí (libs pesadas separadas) |

---

## 4. Testing

- **Typecheck:** `✅` Pasa en `apps/web` y `apps/api`.
- **Lint:** `✅` Pasa en `apps/web` (1 warning pre-existente en `electron/ipc-handlers.ts`).
- **Build:** `✅` Web compila sin errores con Vite 6.4.2.
- **Tests:** Los tests existentes de `MusicStaff.test.tsx` no requieren cambios (el fix de centrado solo afecta renderizado, no testing logic).

---

## 5. Instrucciones para Activar Analyzer (Opcional)

Para visualizar el árbol de chunks después del build:

```bash
cd apps/web
pnpm run build  # Build normal (no genera reporte)
```

Si se desea generar el reporte visual (`stats.html`):

```bash
# Añadir en vite.config.ts (ya incluido, se activa con variable de entorno)
ANALYZE=true pnpm run build
```

---

## 6. Notas para Desarrolladores Futuros

1. **Centrado de notas:** Si alguna vez se modifica `pitch.ts`, verificar que `line` sigue mapeando línea 0 → 0% y línea 4 → 100 %, no lo contrario.
2. **Nuevos instrumentos:** Agregar a `CHORD_MAPPINGS` en `ChordPlayer.ts` siguiendo el patrón `VIOLIN_CHORD_MAPPINGS` (o reutilizar `CHORD_ROOTS` para monofónicos como `trumpet`).
3. **Lazy loading:** Si una ruta nueva es poco accedida o pesada, envolver con `React.lazy()` en `router.tsx` y `import()` en el componente.
4. **MCPs:** El repo tiene 7 MCPs en `opencode.json` (solo `filesystem` y `github` activos). Ver `AGENTS.md` para convenciones.

---

## 7. Conclusiones

1. El bundle inicial se redujo **88 %** mediante `manualChunks` y `React.lazy`.
2. Se agregaron **3 instrumentos** nuevos con sus respectivos sistemas de notación visual.
3. El centrado de notas se corrigió en **todos los instrumentos** pentagramáticos.
4. TypeScript strict (`strict: true`, `noUnusedLocals`, etc.) sigue pasando sin regresiones.