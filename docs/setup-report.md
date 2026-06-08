# Reporte de Configuración MCP — ChordShift

> Documento vivo. Última edición: 2026-06-07.
> Audiencia: desarrolladores onboardeados, auditores de seguridad, mantenedores.

---

## 1. Resumen ejecutivo

Se instaló un stack de **7 servidores MCP** para OpenCode en el repositorio
`worship-piano-app` (ChordShift). La configuración está activa en
`opencode.json` y validada offline (JSON, typecheck, sintaxis PS).

**2 MCPs habilitados por defecto** (carga baja de context window):
- `filesystem` — acceso al repo local
- `github` — interacción con el repo remoto

**5 MCPs deshabilitados por defecto** (requieren acción del usuario):
- `obsidian` — knowledge base personal
- `vercel` — inspeccionar deploys
- `figma` — design tokens
- `semgrep` — análisis estático (Docker)
- `test-ai` — banco de pruebas MCP

**Riesgo crítico pendiente**: el `GITHUB_TOKEN` actual (`ghp_P6CgtBYK…`) está
expuesto en logs de auditoría. Debe rotarse antes de exponer la
configuración externamente.

---

## 2. Arquitectura

### Diagrama lógico

```
┌────────────────────────────────────────────────────────────────────┐
│                      OpenCode 1.16.2 (cliente)                     │
│  ┌──────────────┐  ┌──────────────────┐  ┌─────────────────────┐   │
│  │ AGENTS.md    │  │ MusicStaff v1.1  │  │ Turborepo + pnpm 9  │   │
│  │ Tokens.md    │  │ (trompeta ready) │  │ Node 24 / TS strict │   │
│  └──────────────┘  └──────────────────┘  └─────────────────────┘   │
│                              │                                     │
│                       opencode.json                                │
│                              │                                     │
│                  ┌───────────┴───────────┐                         │
│                  │   mcp: { 7 servers }  │                         │
│                  └───────────┬───────────┘                         │
└──────────────────────────────┼────────────────────────────────────┘
                               │
        ┌──────────┬───────────┼───────┬──────────┬──────────┐
        ▼          ▼           ▼       ▼          ▼          ▼
   filesystem   github     obsidian  vercel    figma   semgrep   test-ai
   (local)      (local)    (local)   (remote)  (remote) (local)   (local)
   ON           ON         off       off       off     off       off
   stdio        stdio      stdio     HTTPS     HTTPS   Docker    stdio
```

### Decisiones clave de arquitectura

| Decisión | Alternativa descartada | Justificación |
|----------|------------------------|---------------|
| Filesystem con path absoluto a la raíz del repo | Path relativo `.` | El servidor MCP filesystem requiere paths absolutos; hardcodeado por seguridad |
| GitHub con `enabled: true` | `enabled: false` | El agente lo usa frecuentemente para issues/PRs/CI; el context cost (~2k tokens) es aceptable |
| Vercel y Figma con OAuth remoto | Local stdio | Ambos proveen endpoints remotos oficiales; OAuth elimina gestión de tokens |
| Semgrep vía Docker (returntocorp/semgrep) | CLI local o community MCP | Imagen oficial es la más estable; ya hay Docker 29.4.3 disponible |
| "Test AI MCP" = `@modelcontextprotocol/server-everything` | Producto comercial desconocido | Es el servidor de demostración oficial de Anthropic; comportamiento predecible y bien documentado |
| Mayoría OFF por defecto | Todos ON | Advertencia explícita de OpenCode: "MCPs añaden al context,GitHub tiende a excederlo" |
| Secrets en `.mcp.env` (no commiteado) | Hardcodeados en opencode.json | Principio de mínimo privilegio + rotación |
| Referencias con `{env:VAR}` en opencode.json | Valores literales | Permite cambiar credenciales sin tocar config |

---

## 3. Estado actual

### Lo que funciona (validado 2026-06-07)

| Componente | Validación | Resultado |
|------------|------------|-----------|
| `opencode.json` | `ConvertFrom-Json` | 7 MCPs, sintaxis válida |
| Typecheck del repo | `pnpm typecheck` | 2/2 paquetes verde (api, web) |
| Script PowerShell | `Parser.ParseFile` | Sintaxis válida, `-Check` ejecuta OK |
| `.gitignore` | diff visual | `.mcp.env` + `.backups/` ignorados |
| Filesystem MCP | command array | Apunta a `C:\Users\Edwin\Dev\worship-piano-app` |
| GitHub MCP | env var | `GITHUB_PERSONAL_ACCESS_TOKEN={env:GITHUB_TOKEN}` resuelto |
| Respaldos | timestamp dir | `.backups/mcp-setup-20260607-102059/` con 5 archivos |

### Lo que NO funciona (bloqueado por credenciales)

| Componente | Bloqueador | Acción del usuario |
|------------|------------|---------------------|
| GitHub MCP runtime | Token expuesto en logs | Rotar y revocar el anterior (ver `docs/credentials.md` §1) |
| Obsidian MCP | Sin vault configurado | Crear vault + setear `OBSIDIAN_VAULT_PATH` |
| Vercel MCP | OAuth no ejecutado | `opencode mcp auth vercel` |
| Figma MCP | OAuth no ejecutado | `opencode mcp auth figma` |
| Semgrep MCP | Imagen Docker no descargada | `docker pull returntocorp/semgrep:latest` |
| Test AI MCP | Deshabilitado por defecto | `opencode mcp enable test-ai` |

---

## 4. Versiones

### Entorno detectado (auditoría 2026-06-07)

| Componente | Versión | Estado |
|------------|---------|--------|
| OS | Windows 10 Home 10.0.19045 64-bit | ✓ |
| PowerShell | 5.1.19041.6456 | ✓ |
| Node | v24.15.0 | ✓ |
| npm | 11.12.1 | ✓ |
| pnpm | 9.0.0 | ✓ (en `packageManager`) |
| Git | 2.53.0.windows.2 | ✓ |
| Docker | 29.4.3 | ✓ |
| OpenCode | 1.16.2 | ✓ |
| WSL | 2.7.3.0 | ✓ (no usado) |
| Python | no instalado | ✗ (bloquea `pip install semgrep` como fallback) |
| bun | no instalado | ✗ (no requerido) |

### Paquetes MCP (a instalar on-demand via `npx`)

| Paquete | Versión objetivo | Notas |
|---------|------------------|-------|
| `@modelcontextprotocol/server-filesystem` | latest | Estándar Anthropic |
| `@modelcontextprotocol/server-github` | latest | Estándar Anthropic |
| `@markuspfundstein/mcp-obsidian` | latest | Community, requiere vault path |
| `@modelcontextprotocol/server-everything` | latest | Estándar Anthropic (test) |
| `returntocorp/semgrep` Docker | `latest` | Imagen oficial Semgrep |

### Aplicación (sin cambios por este setup)

| Paquete | Versión |
|---------|---------|
| worship-piano-app (root) | 1.0.0 |
| apps/web | 0.2.1 |
| apps/api | 1.0.0 |
| MusicStaff | v1.1 (con soporte trompeta) |

---

## 5. Integraciones

Ver [`docs/mcp-integrations.md`](./mcp-integrations.md) para detalle completo.
Resumen:

- **con `apps/web`**: filesystem + figma + vercel
- **con `apps/api`**: filesystem + github + semgrep
- **con `packages/audio`**: filesystem + semgrep
- **con `packages/db`**: filesystem + github
- **con `apps/web/android/`**: filesystem + semgrep (Java/Kotlin)

---

## 6. Seguridad

### Controles implementados

| Control | Aplicado a | Detalle |
|---------|------------|---------|
| Allowed-paths filesystem | `filesystem` | Hardcodeado a la raíz del repo (no acceso a `Documents/`, `Desktop/`, etc) |
| Token via `{env:VAR}` | `github` | No hay secretos en `opencode.json`; fallback a env del shell |
| OAuth para remotos | `vercel`, `figma` | Token almacenado en `%LOCALAPPDATA%\opencode\mcp-auth.json`, NO en repo |
| `.mcp.env` en `.gitignore` | todos los locales | Imposible commitear secretos por accidente |
| Timeouts por servidor | todos | 10-120s según criticidad; evita cuelgues |
| Estado OFF por defecto | `obsidian`, `vercel`, `figma`, `semgrep`, `test-ai` | Reduce superficie de ataque y context window |
| Read-only mount Semgrep | `semgrep` | `:ro` en Docker mount; semgrep no puede modificar |
| Detección de token expuesto | script setup | Compara contra prefijo conocido y avisa |

### Hallazgos de seguridad

| Severidad | Hallazgo | Estado |
|-----------|----------|--------|
| 🔴 Alta | `GITHUB_TOKEN=ghp_P6CgtBYK…` visible en env del shell | **Pendiente rotación** |
| 🟡 Media | Script `setup-mcp.ps1` lee `GITHUB_TOKEN` y compara prefijo hardcodeado | Riesgo bajo; el prefijo no es un secret |
| 🟢 Baja | Filesystem MCP permite escribir en todo el repo | Aceptable: el agente ya tiene acceso al workspace |
| 🟢 Baja | Test AI MCP expone `printEnv` que vuelca env vars | Mitigado: solo usar con sesión limpia |

### Hardening adicional recomendado (futuro)

- Implementar pre-commit hook que valide que `.mcp.env` no fue agregado al stage
- Rotar `GITHUB_TOKEN` automáticamente cada 90 días (recordatorio en `docs/credentials.md`)
- Configurar `mcp-timeout` global más agresivo (default 5000ms está bien para servidores rápidos)
- Considerar `gh` CLI como alternativa al GitHub MCP (mismas capabilities, secret en `gh auth`)

---

## 7. Procedimiento de recuperación (rollback)

Si la configuración MCP causa problemas:

### Opción A: Deshabilitar MCPs problemáticos
```powershell
.\scripts\setup-mcp.ps1 -Disable github,filesystem
```

### Opción B: Rollback completo al estado pre-MCP
```powershell
$backup = Get-ChildItem .backups -Directory | Sort-Object Name -Descending | Select-Object -First 1
Copy-Item "$($backup.FullName)\opencode.json" -Destination .\opencode.json -Force
Write-Host "Restaurado opencode.json desde $($backup.Name)"
```

### Opción C: Borrar configuración MCP y dejar solo `instructions`
Editar `opencode.json` y eliminar el bloque `mcp`. Quedará la config original.

### Verificación post-rollback
```powershell
# Typecheck
pnpm typecheck

# Estado MCPs
.\scripts\setup-mcp.ps1 -Check
```

---

## 8. Problemas conocidos

| # | Problema | Workaround |
|---|----------|------------|
| 1 | Semgrep timeout de 120s puede ser insuficiente para monorepos grandes | Aumentar timeout en `opencode.json` o usar `semgrep ci` desde CI |
| 2 | Figma MCP requiere Figma Desktop con Dev Mode para self-hosted | Usar endpoint remoto `https://mcp.figma.com/mcp` (OAuth) |
| 3 | Obsidian MCP puede tener conflictos si Obsidian Desktop está editando el vault | Cerrar Obsidian antes de operaciones de escritura |
| 4 | PowerShell 5.1 no soporta `??` y `?.` (null-conditional) | El script `setup-mcp.ps1` evita estos operadores |
| 5 | El script no valida JSON antes de modificarlo | Validar manualmente con `ConvertFrom-Json` si se edita a mano |
| 6 | No hay tests automatizados del setup MCP | Pendiente: crear `tests/mcp-config.test.ts` con validación de schema |

---

## 9. Próximos pasos

| Prioridad | Acción | Esfuerzo |
|-----------|--------|----------|
| 🔴 Alta | Rotar `GITHUB_TOKEN` | 5 min |
| 🟡 Media | Crear tests automatizados de la config MCP | 2-3 h |
| 🟡 Media | Configurar `OBSIDIAN_VAULT_PATH` y habilitar Obsidian MCP | 15 min |
| 🟢 Baja | Implementar métricas de adopción de MCPs | 1 d |
| 🟢 Baja | Evaluar reemplazar GitHub MCP por `gh` CLI (reducir context) | 1 d |
| 🟢 Baja | Documentar flujo de trabajo recomendado con MCPs en `AGENTS.md` | 30 min |

---

## 10. Referencias

- [`opencode.json`](./../opencode.json) — configuración activa
- [`docs/credentials.md`](./credentials.md) — guía detallada de credenciales
- [`docs/mcp-integrations.md`](./mcp-integrations.md) — arquitectura por MCP
- [`docs/obsidian-report.md`](./obsidian-report.md) — versión Obsidian-friendly
- [`scripts/setup-mcp.ps1`](./../scripts/setup-mcp.ps1) — instalador/validador
- [`.env.mcp.example`](./../.env.mcp.example) — plantilla de variables
- [`.backups/mcp-setup-20260607-102059/`](./../.backups/) — respaldo pre-cambio
- [OpenCode MCP docs](https://opencode.ai/docs/mcp-servers/) — referencia del formato
