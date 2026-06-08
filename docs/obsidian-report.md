---
title: "Reporte MCP — ChordShift"
date: 2026-06-07
type: infrastructure-report
status: active
tags:
  - mcp
  - opencode
  - chordshift
  - infrastructure
  - security
  - tools
project: worship-piano-app
version: 1.0
author: opencode-minimax-m3-free
review_date: 2026-09-07
---

# Reporte MCP — ChordShift

> Versión Obsidian-friendly del [[setup-report|reporte de configuración]].
> Diseñado para usar en vault personal con Dataview, Graph view y backlinks.

---

## Resumen ejecutivo

- **MCPs configurados**: 7 totales (2 ON por defecto, 5 OFF)
- **Versión de OpenCode**: 1.16.2
- **Riesgo crítico**: [[#Riesgo-de-seguridad-activo|Rotación de GITHUB_TOKEN]]
- **Estado**: Producción con bloqueador de seguridad pendiente

```dataview
TABLE WITHOUT ID
  server as "MCP",
  type as "Tipo",
  enabled as "Estado"
FROM #mcp
SORT enabled DESC, server ASC
```

---

## Inventario de servidores

### Habilitados por defecto

- [[#filesystem|filesystem]] — lectura/escritura local
- [[#github|github]] — REST + GraphQL del repo

### Deshabilitados por defecto

- [[#obsidian|obsidian]] — knowledge base personal
- [[#vercel|vercel]] — inspeccionar deploys
- [[#figma|figma]] — design tokens
- [[#semgrep|semgrep]] — análisis estático (Docker)
- [[#test-ai|test-ai]] — banco de pruebas MCP

---

## Detalle por servidor

### filesystem

- **Paquete**: `@modelcontextprotocol/server-filesystem`
- **Tipo**: local stdio
- **Path permitido**: `C:\Users\Edwin\Dev\worship-piano-app`
- **Timeout**: 10000 ms
- **Habilitado**: true
- **Riesgo**: medio (escritura sobre todo el repo)

### github

- **Paquete**: `@modelcontextprotocol/server-github`
- **Tipo**: local stdio
- **Credencial**: `GITHUB_PERSONAL_ACCESS_TOKEN={env:GITHUB_TOKEN}`
- **Timeout**: 15000 ms
- **Habilitado**: true
- **Riesgo**: medio-alto (token con permisos)

### obsidian

- **Paquete**: `@markuspfundstein/mcp-obsidian`
- **Tipo**: local stdio
- **Credencial**: `OBSIDIAN_VAULT_PATH` (no seteada aún)
- **Timeout**: 10000 ms
- **Habilitado**: false
- **Riesgo**: bajo (vault personal, fuera del repo)

### vercel

- **Endpoint**: `https://mcp.vercel.com/mcp`
- **Tipo**: remote OAuth
- **Timeout**: 15000 ms
- **Habilitado**: false
- **Riesgo**: bajo (OAuth granular, revocable)
- **Acción pendiente**: `opencode mcp auth vercel`

### figma

- **Endpoint**: `https://mcp.figma.com/mcp`
- **Tipo**: remote OAuth
- **Timeout**: 15000 ms
- **Habilitado**: false
- **Riesgo**: bajo
- **Acción pendiente**: `opencode mcp auth figma`

### semgrep

- **Imagen Docker**: `returntocorp/semgrep:latest`
- **Tipo**: local (Docker)
- **Mount**: `C:\Users\Edwin\Dev\worship-piano-app:/src:ro` (read-only)
- **Timeout**: 120000 ms
- **Habilitado**: false
- **Riesgo**: muy bajo
- **Acción pendiente**: `docker pull returntocorp/semgrep:latest`

### test-ai

- **Paquete**: `@modelcontextprotocol/server-everything`
- **Tipo**: local stdio
- **Timeout**: 10000 ms
- **Habilitado**: false
- **Riesgo**: muy bajo (servidor de demo)
- **Nota**: `printEnv` puede exponer env vars, usar con cuidado

---

## Riesgo de seguridad activo

> 🔴 **CRÍTICO**: El `GITHUB_TOKEN=ghp_P6CgtBYK…` quedó expuesto en logs de
> auditoría durante la instalación. **Asumir compromiso y rotar**.

### Procedimiento de rotación

1. Generar nuevo fine-grained PAT en https://github.com/settings/tokens
2. Scopes mínimos: Contents (Read), Issues (R/W), Pull requests (R/W)
3. Expiration: 90 días
4. Reemplazar en `.mcp.env` (local, no commitear)
5. **Revocar el token anterior**
6. Verificar revocación:
   ```bash
   curl -H "Authorization: Bearer ghp_P6CgtBYK..." https://api.github.com/user
   # Debe responder 401
   ```

Más detalle en [[credentials#1. GitHub — Rotación URGENTE|docs/credentials.md §1]].

---

## Matriz de permisos

| MCP | Read repo | Write repo | Lee secretos | Network out | Persistente |
|-----|:---------:|:----------:|:------------:|:-----------:|:-----------:|
| `[[#filesystem\|filesystem]]` | ✅ | ✅ | ⚠ parcial | ❌ | ❌ |
| `[[#github\|github]]` | ✅ | ✅ | ⚠ token | ✅ | ❌ |
| `[[#obsidian\|obsidian]]` | ❌ | ⚠ | ❌ | ❌ | ✅ vault |
| `[[#vercel\|vercel]]` | ✅ | ❌ | ❌ | ✅ | ❌ |
| `[[#figma\|figma]]` | ✅ | ❌ | ❌ | ✅ | ❌ |
| `[[#semgrep\|semgrep]]` | ✅ (ro) | ❌ | ❌ | ✅ rules | ❌ |
| `[[#test-ai\|test-ai]]` | ❌ | ❌ | ⚠ env | ❌ | ❌ |

---

## Comandos rápidos

### Habilitar/deshabilitar MCPs
```powershell
# Habilitar uno o varios
.\scripts\setup-mcp.ps1 -Enable obsidian,vercel

# Deshabilitar
.\scripts\setup-mcp.ps1 -Disable github

# Ver estado actual
.\scripts\setup-mcp.ps1 -Check
```

### OAuth flow (Vercel, Figma)
```powershell
opencode mcp auth vercel    # abre navegador
opencode mcp auth figma     # abre navegador
opencode mcp auth list      # ver estado de auth
opencode mcp logout <name>  # revocar
```

### Rollback
```powershell
$backup = Get-ChildItem .backups -Directory | Sort-Object Name -Descending | Select-Object -First 1
Copy-Item "$($backup.FullName)\opencode.json" .\opencode.json -Force
```

---

## Próximos pasos

```tasks
- [ ] Rotar GITHUB_TOKEN 🔴 #security
- [ ] Crear vault de Obsidian y setear OBSIDIAN_VAULT_PATH #setup
- [ ] Ejecutar `opencode mcp auth vercel` cuando se necesite deploy #deploy
- [ ] Ejecutar `opencode mcp auth figma` cuando se necesite design #design
- [ ] `docker pull returntocorp/semgrep:latest` para análisis estático #security
- [ ] Crear tests automatizados de la config MCP #testing
```

---

## Referencias

- [[setup-report|setup-report]] — versión extendida con auditoría completa
- [[credentials|credentials]] — guía detallada de credenciales
- [[mcp-integrations|mcp-integrations]] — arquitectura por MCP
- [OpenCode MCP docs](https://opencode.ai/docs/mcp-servers/) — referencia del formato
- [Anthropic MCP spec](https://modelcontextprotocol.io/) — especificación del protocolo

---

## Changelog

- **2026-06-07** — v1.0 — Instalación inicial de los 7 MCPs
