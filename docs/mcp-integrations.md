# MCP Integrations — Arquitectura

> Cómo los 7 MCPs instalados se integran con el flujo de trabajo del repo.

---

## Mapa general

```
┌──────────────────────────────────────────────────────────────────┐
│                    OpenCode Client (este repo)                   │
│                                                                  │
│  ┌────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ AGENTS.md      │  │ MusicStaff v1.1 │  │ Turborepo       │  │
│  │ docs/Tokens.md │  │ (trompeta ready)│  │ pnpm 9 / Node24 │  │
│  └────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                  │
│                       ┌─── opencode.json ───┐                    │
│                       │  mcp: { 7 servers } │                    │
│                       └─────────┬───────────┘                    │
└─────────────────────────────────┼────────────────────────────────┘
                                  │
        ┌──────────┬──────────┬───┴────┬──────────┬──────────┐
        │          │          │        │          │          │
        ▼          ▼          ▼        ▼          ▼          ▼
   filesystem   github   obsidian  vercel   figma  semgrep  test-ai
   (local)      (local)  (local)   (remote) (remote)(docker) (local)
        │          │          │        │          │          │
        ▼          ▼          ▼        ▼          ▼          ▼
   read/write   REST API  vault    deploys   designs  SCA   demo
   local files  + GraphQL  notes   inspect   inspect  scan   tools
```

---

## Por MCP

### 1. `filesystem` — `@modelcontextprotocol/server-filesystem`
- **Tipo**: local (stdio)
- **Propósito**: leer/escribir archivos del repo desde el agente
- **Riesgo**: medio (acceso total al path configurado)
- **Mitigación**: hardcoded a la raíz del proyecto, NUNCA incluir `Documents/`, `Desktop/`, etc.
- **Uso típico**:
  - "Lista los archivos en `apps/web/src/components/`"
  - "Crea un nuevo test en `apps/web/src/...`"
- **Override de path**: editar `opencode.json` → bloque `filesystem` → array `command`

### 2. `github` — `@modelcontextprotocol/server-github`
- **Tipo**: local (stdio) con env `GITHUB_TOKEN`
- **Propósito**: interactuar con issues, PRs, Actions, código
- **Riesgo**: medio-alto (token con permisos)
- **Mitigación**: usar fine-grained token limitado al repo `worship-piano-app`
- **Uso típico**:
  - "Lista los PRs abiertos en el repo"
  - "Crea una issue con el template de bug"
  - "Revisa el último run de CI en develop"
- **Alternativa más segura**: `gh` CLI desde Bash tool (mismas capabilities, token en `gh auth`)

### 3. `obsidian` — `@markuspfundstein/mcp-obsidian`
- **Tipo**: local (stdio) con env `OBSIDIAN_VAULT_PATH`
- **Propósito**: lectura/escritura de notas de Obsidian (knowledge base personal)
- **Riesgo**: bajo (vault es personal, fuera del repo)
- **Uso típico**:
  - "Busca en mi vault la nota sobre teoría musical"
  - "Crea una nueva nota con el resumen de esta sesión"
- **Nota**: solo lectura por defecto. Para escritura, requiere `--write` flag en el binario

### 4. `vercel` — `https://mcp.vercel.com/mcp` (OAuth)
- **Tipo**: remote (HTTPS + SSE/OAuth)
- **Propósito**: inspeccionar deploys, env vars, logs, dominio
- **Riesgo**: bajo (OAuth granular, revocable)
- **Uso típico**:
  - "¿Cuál es el estado del último deploy a producción?"
  - "Lista las env vars del proyecto web-..."
- **Limitación**: NO permite redeploy directo desde MCP; para eso usar Vercel CLI

### 5. `figma` — `https://mcp.figma.com/mcp` (OAuth)
- **Tipo**: remote (HTTPS + SSE/OAuth)
- **Propósito**: leer design tokens, frames, componentes de Figma
- **Riesgo**: bajo
- **Uso típico**:
  - "Extrae los colores del design system 'ChordShift V2'"
  - "Lista los componentes del frame Login"
- **Limitación**: solo lectura (no permite editar archivos Figma)

### 6. `semgrep` — Docker `returntocorp/semgrep`
- **Tipo**: local (Docker)
- **Propósito**: análisis estático de código (SCA, SAST, secrets)
- **Riesgo**: muy bajo (read-only mount, semgrep no modifica)
- **Uso típico**:
  - "Escanea el repo con las reglas de seguridad OWASP"
  - "Detecta secretos hardcodeados en apps/web/src/"
- **Performance**: ~30-60s en repo medio, configurable vía `--config=auto|security-audit|secrets`
- **Output**: JSON en stdout, parseable por el agente

### 7. `test-ai` — `@modelcontextprotocol/server-everything`
- **Tipo**: local (stdio), sin credenciales
- **Propósito**: banco de pruebas de la pipeline MCP
- **Riesgo**: muy bajo (servidor de demo)
- **Uso típico**:
  - "Suma 3+4 con test-ai" (smoke test)
  - "Lista herramientas disponibles en test-ai"
- **Advertencia**: `printEnv` puede exponer variables de entorno. Solo usar en sesiones limpias.

---

## Matriz de permisos

| MCP          | Read repo | Write repo | Read secrets | Network out | Persistente |
|--------------|:---------:|:----------:|:------------:|:-----------:|:-----------:|
| filesystem   | ✅        | ✅         | ⚠ parcial    | ❌          | ❌          |
| github       | ✅        | ✅ (PR/iss) | ⚠ token      | ✅          | ❌          |
| obsidian     | ❌        | ⚠ opcional | ❌           | ❌          | ✅ vault    |
| vercel       | ✅        | ❌         | ❌           | ✅          | ❌          |
| figma        | ✅        | ❌         | ❌           | ✅          | ❌          |
| semgrep      | ✅ (ro)   | ❌         | ❌           | ✅ rules    | ❌          |
| test-ai      | ❌        | ❌         | ⚠ env dump   | ❌          | ❌          |

Leyenda:
- ✅ permitido por diseño
- ⚠ requiere acción consciente / scope mínimo
- ❌ no aplica o no permitido

---

## Context window impact

> **Advertencia OpenCode**: "MCP servers add to your context. Be careful which
> ones you enable. GitHub tends to add a lot of tokens and can easily exceed
> the context limit."

Estrategia aplicada en `opencode.json`:
- **Habilitados por defecto** (carga baja): `filesystem` (8 tools)
- **Habilitados pero con opt-in** (carga media): `github` (15 tools, ~2k tokens)
- **Deshabilitados por defecto** (carga alta o poco uso): `obsidian`, `vercel`, `figma`, `semgrep`, `test-ai`

Habilitar bajo demanda con:
```powershell
opencode mcp enable <nombre>
# o editar opencode.json directamente
```

---

## Integraciones reutilizables

### Con `apps/api` (Express + Prisma)
- `filesystem` puede leer/escribir migraciones, seeders, `.env.example`
- `github` puede abrir PRs automáticos con cambios generados por el agente
- `semgrep` puede ejecutarse en CI como alternativa a GitHub Advanced Security

### Con `apps/web` (Vite + React 19)
- `filesystem` accede a todo `apps/web/src/`
- `figma` puede sincronizar design tokens con `docs/design/Tokens.md`
- `vercel` puede inspeccionar el build deployado y comparar contra `dist/`

### Con `packages/audio` (Tone.js logic)
- `filesystem` accede a la lógica compartida
- `semgrep` puede auditar el código de audio (regex de claves musicales, etc)

### Con `packages/db` (interfaces TS)
- `filesystem` para sincronizar tipos con el schema Prisma
- `github` para abrir issues de drift entre `@chordshift/db` y `schema.prisma`

### Con `apps/web/android/` (Capacitor)
- `semgrep` cubre también Java/Kotlin
- `filesystem` accede a `android/app/build.gradle` para diagnóstico de builds
- `vercel` NO aplica (Android se publica por separado en `release.yml`)

---

## Failover y degradación

Si un MCP remoto (Vercel, Figma) cae:
- El agente recibe error en la tool call
- OpenCode NO bloquea el resto de operaciones
- El usuario puede deshabilitar el MCP con `opencode mcp disable <name>`

Si un MCP local (filesystem, github) cae:
- Generalmente por path mal configurado o token inválido
- Revisar logs de OpenCode con `--verbose`
- Validar comando manualmente: `npx -y <paquete> --help`

Si Semgrep no puede pull la imagen Docker:
- Verificar Docker Desktop está corriendo
- Verificar espacio en disco (imagen ~500 MB)
- Fallback: usar Semgrep local con `pip install semgrep` (requiere Python, no instalado)

---

## Métricas de adopción (futuro)

Una vez los MCPs estén en uso, monitorear:
- Tools invocadas por sesión (ideal: < 50)
- Latencia promedio por tool call (filesystem < 100ms, github < 1s, semgrep < 60s)
- Tasa de error por MCP (objetivo: < 5%)
- Context tokens consumidos por MCP (github es el más caro)

A implementar en `docs/mcp-metrics.md` cuando haya datos.
