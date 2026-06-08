# Credenciales MCP — Guía de Scopes y Rotación

> Documento de referencia para configurar los 7 MCPs instalados.
> Mantener sincronizado con `.env.mcp.example` (plantilla sin secretos).

---

## Estado actual (post-auditoría 2026-06-07)

| Servicio  | Estado           | Acción requerida                                    |
|-----------|------------------|-----------------------------------------------------|
| GitHub    | ⚠ Token expuesto | **Rotar inmediatamente** + limitar scopes          |
| Obsidian  | ⛔ No configurado| Crear vault + definir `OBSIDIAN_VAULT_PATH`         |
| Figma     | ⛔ No configurado| Ejecutar `opencode mcp auth figma` (OAuth)          |
| Vercel    | ⛔ No configurado| Ejecutar `opencode mcp auth vercel` (OAuth)         |
| Filesystem| ✅ Configurado   | Sin acción                                          |
| Semgrep   | ⛔ No configurado| `docker pull returntocorp/semgrep:latest`           |
| Test AI   | ✅ Disponible    | `opencode mcp enabled test-ai true` si se necesita  |

---

## 1. GitHub — Rotación URGENTE

### Riesgo actual
El `GITHUB_TOKEN=ghp_P6CgtBYK...` apareció en la salida de la auditoría de
entorno (Fase 1). Esto significa que el token ya fue capturado por logs del
sistema, por OpenCode o por la sesión actual. **Asumir compromiso**.

### Procedimiento de rotación
1. Generar nuevo token en https://github.com/settings/tokens
2. Tipo recomendado: **Fine-grained personal access token**
3. Scopes EXACTOS (mínimo privilegio):
   - Repository access: solo `worship-piano-app` (público)
   - Permissions:
     - Contents: Read
     - Metadata: Read (obligatorio)
     - Pull requests: Read & Write (para PR automation)
     - Issues: Read & Write
     - Workflows: Read (para status de CI)
     - Actions: Read
4. Expiration: 90 días (renovar antes)
5. Guardar en `.mcp.env` o en Windows Credential Manager
6. **Revocar el token anterior** desde la misma página
7. Verificar revocación:
   ```powershell
   curl -H "Authorization: Bearer ghp_P6CgtBYK..." https://api.github.com/user
   # Debe responder 401
   ```

### Verificar uso del nuevo token
```powershell
# Test rápido del MCP server
npx -y @modelcontextprotocol/server-github &
# En otro terminal:
# (la invocación real se hace desde OpenCode)
```

---

## 2. Obsidian — Configuración inicial

### Crear vault (si no existe)
1. Abrir Obsidian
2. "Create new vault" → elegir ruta (ej: `D:\Notes\ChordShift`)
3. Cerrar Obsidian (dejar el vault libre para que el MCP lo lea)

### Configurar variable de entorno
```powershell
# En PowerShell (sesión actual):
$env:OBSIDIAN_VAULT_PATH = "D:\Notes\ChordShift"

# Persistente (nuevo shell):
[Environment]::SetEnvironmentVariable("OBSIDIAN_VAULT_PATH", "D:\Notes\ChordShift", "User")
```

### Habilitar MCP
```powershell
# Editar opencode.json: cambiar "enabled": false a true en bloque "obsidian"
# O desde CLI:
opencode mcp enable obsidian
```

### Validar
```powershell
# El servidor debe arrancar sin error
npx -y @markuspfundstein/mcp-obsidian
# Si todo va bien, abre conexión stdio y espera comandos MCP
```

---

## 3. Figma — OAuth flow

### Pre-requisitos
- Cuenta Figma con acceso a archivos del team
- Para server local (Dev Mode): Figma Desktop corriendo con Dev Mode activo en `http://127.0.0.1:3845`

### Procedimiento
```powershell
# Habilitar el MCP
opencode mcp enable figma

# Disparar OAuth (abrirá navegador)
opencode mcp auth figma

# Verificar estado
opencode mcp auth list
```

### Token storage
OpenCode almacena el token post-OAuth en:
```
%LOCALAPPDATA%\opencode\mcp-auth.json
```
NO está en env ni en el repo. Es seguro.

### Revocar acceso
- Figma: Settings → Security → Authorized apps → OpenCode → Revoke
- OpenCode: `opencode mcp logout figma`

---

## 4. Vercel — OAuth flow

### Pre-requisitos
- Cuenta con acceso al proyecto `web-1tmdqw12l-maikel-js-projects`
- Rol mínimo: Member (no requiere Owner)

### Procedimiento
```powershell
opencode mcp enable vercel
opencode mcp auth vercel
opencode mcp auth list
```

### Permisos que se solicitan
- `read:project` — leer config del proyecto
- `read:deployment` — historial de deploys
- `read:env` — variables de entorno (necesario para sync)
- `write:deployment` — triggear deploys (manual, bajo demanda)

---

## 5. Filesystem — Sin acción

Paths permitidos (hardcodeados en `opencode.json`):
- `C:\Users\Edwin\Dev\worship-piano-app` (raíz del proyecto)

El servidor rechaza cualquier path fuera de esta lista (seguridad nativa del MCP filesystem).

### Si se mueve el repo
Editar `opencode.json` → bloque `filesystem` → último elemento del array `command`.

---

## 6. Semgrep — Setup Docker

### Pre-requisitos
- Docker Desktop corriendo (verificado en auditoría: 29.4.3 ✓)

### Setup
```powershell
# Descargar imagen (~500 MB)
docker pull returntocorp/semgrep:latest

# Test manual
docker run --rm -i -v "C:\Users\Edwin\Dev\worship-piano-app:/src:ro" returntocorp/semgrep:latest semgrep scan --config=auto --json --quiet /src | Out-Null
```

### Habilitar
```powershell
opencode mcp enable semgrep
```

### Notas
- El path de Windows debe usar mount style `:ro` (read-only) para que Semgrep no modifique archivos
- El timeout configurado (120000ms = 2 min) es holgado para proyectos medianos
- Para escaneos grandes, considerar usar `semgrep ci` en lugar del MCP ad-hoc

---

## 7. Test AI — `@modelcontextprotocol/server-everything`

### Decisión documentada
"No existe un producto canónico llamado 'Test AI MCP'. La elección más
defendible es el servidor oficial de demostración de Anthropic, que ejerce
como banco de pruebas de la pipeline MCP."

### Uso
```powershell
# Habilitar bajo demanda
opencode mcp enable test-ai

# En el prompt, forzar uso:
# "Lista las herramientas del test-ai MCP"
```

### Herramientas expuestas (referencia)
- `echo` — echo de mensajes
- `add` — suma de números
- `longRunningOperation` — simulación de operación async
- `sampleLLM` — sample de LLM (requiere API key adicional)
- `getTinyImage` — imagen de prueba
- `printEnv` — imprime env vars (¡CUIDADO con secretos!)

### Advertencia
`printEnv` puede exponer variables de entorno. Usar solo en sesiones limpias.

---

## Matriz de secretos

| Servicio  | Tipo        | Storage        | Rotación        |
|-----------|-------------|----------------|-----------------|
| GitHub    | PAT         | `.mcp.env`     | 90 días         |
| Obsidian  | Path (no secret) | env var   | N/A             |
| Figma     | OAuth token | OpenCode store | 365 días (auto) |
| Vercel    | OAuth token | OpenCode store | 365 días (auto) |
| Filesystem| N/A         | N/A            | N/A             |
| Semgrep   | N/A         | N/A            | N/A             |
| Test AI   | N/A         | N/A            | N/A             |

---

## Checklist de onboarding

- [ ] Rotar `GITHUB_TOKEN` y revocar el anterior
- [ ] Crear vault de Obsidian (si aplica)
- [ ] Definir `OBSIDIAN_VAULT_PATH` en env del usuario
- [ ] Habilitar MCPs según necesidad (`opencode mcp enable <name>`)
- [ ] Ejecutar OAuth para Figma y Vercel (cuando se necesiten)
- [ ] Verificar `opencode mcp auth list` muestra estado correcto
