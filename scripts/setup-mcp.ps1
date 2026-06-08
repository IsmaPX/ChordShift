# =============================================================================
# setup-mcp.ps1 — Configurador de MCPs para ChordShift
# =============================================================================
# Uso:  .\scripts\setup-mcp.ps1 [-Check] [-Enable name1,name2,...] [-Disable ...]
#
# -Check    : solo valida entorno y muestra estado
# -Enable   : habilita MCPs listados en opencode.json (enabled: true)
# -Disable  : deshabilita MCPs listados
#
# Sin flags: ejecuta el wizard interactivo de primera configuración.
# =============================================================================

[CmdletBinding()]
param(
  [switch]$Check,
  [string]$Enable = "",
  [string]$Disable = ""
)

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path "$PSScriptRoot\..").Path
$opencodeConfig = Join-Path $repoRoot "opencode.json"
$envExample = Join-Path $repoRoot ".env.mcp.example"
$envActual = Join-Path $repoRoot ".mcp.env"

function Write-Step($msg) { Write-Host "`n[STEP] $msg" -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host "  [OK]   $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "  [WARN] $msg" -ForegroundColor Yellow }
function Write-Err($msg)  { Write-Host "  [ERR]  $msg" -ForegroundColor Red }

# -----------------------------------------------------------------------------
# 1. Pre-check de entorno
# -----------------------------------------------------------------------------
function Test-Environment {
  Write-Step "Validando entorno"

  $tools = @(
    @{ Name = "node";  Cmd = { node --version };        Required = $true },
    @{ Name = "npm";   Cmd = { npm --version };         Required = $true },
    @{ Name = "pnpm";  Cmd = { pnpm --version };        Required = $true },
    @{ Name = "git";   Cmd = { git --version };         Required = $true },
    @{ Name = "docker";Cmd = { docker --version };      Required = $false },
    @{ Name = "opencode"; Cmd = { opencode --version }; Required = $true }
  )

  foreach ($t in $tools) {
    try {
      $ver = & $t.Cmd 2>$null
      if ($LASTEXITCODE -eq 0) {
        Write-Ok ("{0,-12} {1}" -f $t.Name, $ver)
      } else {
        if ($t.Required) { Write-Err  ("{0,-12} MISSING (requerido)" -f $t.Name) }
        else            { Write-Warn ("{0,-12} MISSING (opcional)" -f $t.Name) }
      }
    } catch {
      if ($t.Required) { Write-Err  ("{0,-12} MISSING (requerido)" -f $t.Name) }
      else            { Write-Warn ("{0,-12} MISSING (opcional)" -f $t.Name) }
    }
  }

  # Validar opencode.json
  if (Test-Path $opencodeConfig) {
    try {
      $cfg = Get-Content $opencodeConfig -Raw | ConvertFrom-Json
      $mcpCount = ($cfg.mcp.PSObject.Properties | Measure-Object).Count
      Write-Ok ("opencode.json  {0} MCPs definidos" -f $mcpCount)
    } catch {
      Write-Err "opencode.json no parsea como JSON valido"
    }
  } else {
    Write-Err "opencode.json no existe"
  }

  # Validar .env.mcp.example
  if (Test-Path $envExample) {
    Write-Ok ".env.mcp.example presente"
  } else {
    Write-Err ".env.mcp.example no existe"
  }

  # Estado de .mcp.env
  if (Test-Path $envActual) {
    Write-Ok ".mcp.env presente (NO commitear)"
  } else {
    Write-Warn ".mcp.env no existe. Copiar de .env.mcp.example y rellenar."
  }

  # Variable GITHUB_TOKEN
  if ($env:GITHUB_TOKEN) {
    $len = $env:GITHUB_TOKEN.Length
    Write-Ok "GITHUB_TOKEN presente (length: $len)"
    if ($env:GITHUB_TOKEN.StartsWith("ghp_P6CgtBYK")) {
      Write-Warn "GITHUB_TOKEN parece ser el token EXPUESTO en auditoria. ROTAR."
    }
  } else {
    Write-Warn "GITHUB_TOKEN no definido en shell. GitHub MCP no arrancara."
  }
}

# -----------------------------------------------------------------------------
# 2. Toggle enabled en opencode.json
# -----------------------------------------------------------------------------
function Set-McpEnabled([string]$Name, [bool]$Enabled) {
  if (-not (Test-Path $opencodeConfig)) {
    Write-Err "opencode.json no existe"
    return
  }

  $json = Get-Content $opencodeConfig -Raw | ConvertFrom-Json
  if (-not $json.mcp.$Name) {
    Write-Err "MCP '$Name' no definido en opencode.json"
    return
  }

  $json.mcp.$Name.enabled = $Enabled
  $json | ConvertTo-Json -Depth 10 | Set-Content $opencodeConfig -Encoding UTF8
  $state = if ($Enabled) { "habilitado" } else { "deshabilitado" }
  Write-Ok "MCP '$Name' $state"
}

# -----------------------------------------------------------------------------
# 3. Copiar .env.mcp.example -> .mcp.env
# -----------------------------------------------------------------------------
function Initialize-EnvFile {
  if (Test-Path $envActual) {
    Write-Warn ".mcp.env ya existe. No se sobreescribe."
    return
  }
  if (-not (Test-Path $envExample)) {
    Write-Err ".env.mcp.example no existe, no se puede inicializar"
    return
  }
  Copy-Item $envExample $envActual
  Write-Ok ".mcp.env creado. Editar y rellenar valores."
}

# -----------------------------------------------------------------------------
# 4. Pull imagen Semgrep
# -----------------------------------------------------------------------------
function Initialize-Semgrep {
  try {
    $null = docker --version
  } catch {
    Write-Err "Docker no disponible. Saltando Semgrep."
    return
  }
  Write-Step "Pull imagen returntocorp/semgrep:latest (~500 MB)"
  docker pull returntocorp/semgrep:latest
  if ($LASTEXITCODE -eq 0) {
    Write-Ok "Imagen Semgrep lista"
  } else {
    Write-Err "Falló docker pull"
  }
}

# -----------------------------------------------------------------------------
# 5. Main
# -----------------------------------------------------------------------------
Write-Host "=== ChordShift MCP Setup ===" -ForegroundColor Magenta
Write-Host "Repo: $repoRoot"

Test-Environment

if ($Check) { return }

if ($Enable) {
  foreach ($n in $Enable.Split(",")) {
    Set-McpEnabled $n.Trim() $true
  }
}

if ($Disable) {
  foreach ($n in $Disable.Split(",")) {
    Set-McpEnabled $n.Trim() $false
  }
}

if (-not $Enable -and -not $Disable) {
  Write-Step "Primera configuracion (wizard)"
  $resp = Read-Host "Crear .mcp.env desde .env.mcp.example? (y/n)"
  if ($resp -eq "y") { Initialize-EnvFile }

  $resp = Read-Host "Descargar imagen Semgrep ahora? (y/n)"
  if ($resp -eq "y") { Initialize-Semgrep }

  Write-Step "MCPs disponibles (todos deshabilitados por defecto salvo filesystem/github):"
  $json = Get-Content $opencodeConfig -Raw | ConvertFrom-Json
  foreach ($prop in $json.mcp.PSObject.Properties) {
    $state = if ($prop.Value.enabled) { "ON " } else { "off" }
    Write-Host ("  [{0}] {1}" -f $state, $prop.Name)
  }
  Write-Host ""
  Write-Host "Para habilitar:  .\scripts\setup-mcp.ps1 -Enable obsidian,vercel"
  Write-Host "Para deshabilitar: .\scripts\setup-mcp.ps1 -Disable github"
}

Write-Host ""
Write-Host "=== Fin ===" -ForegroundColor Magenta
