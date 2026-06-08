/**
 * Tests de validación del schema de `opencode.json` (configuración MCP).
 *
 * Verifica invariantes estructurales del archivo de configuración para
 * detectar drift / regresiones antes de que lleguen a producción.
 *
 * No usa DOM ni DB — funciona en cualquier contexto donde se ejecute vitest.
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'

// -----------------------------------------------------------------------------
// Tipos del schema
// -----------------------------------------------------------------------------
type McpType = 'local' | 'remote'

interface McpEntry {
  type: McpType
  enabled?: boolean
  command?: string[]
  url?: string
  environment?: Record<string, string>
  headers?: Record<string, string>
  oauth?: Record<string, unknown> | false
  timeout?: number
}

interface OpencodeConfig {
  $schema?: string
  instructions?: string[]
  mcp: Record<string, McpEntry>
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

/**
 * Busca la raíz del repo subiendo desde cwd hasta encontrar opencode.json.
 * Robusto frente a ejecución desde apps/web/, raíz, o cualquier subdir.
 */
function findRepoRoot(): string {
  let dir = process.cwd()
  for (let i = 0; i < 6; i++) {
    if (existsSync(join(dir, 'opencode.json'))) return dir
    dir = resolve(dir, '..')
  }
  throw new Error('opencode.json no encontrado subiendo 6 niveles desde cwd')
}

const REPO_ROOT = findRepoRoot()
const OPENCODE_PATH = join(REPO_ROOT, 'opencode.json')

let rawContent: string
let config: OpencodeConfig

beforeAll(() => {
  rawContent = readFileSync(OPENCODE_PATH, 'utf-8')
  config = JSON.parse(rawContent) as OpencodeConfig
})

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

describe('opencode.json — estructura raíz', () => {
  it('existe y parsea como JSON válido', () => {
    expect(config).toBeDefined()
    expect(config.mcp).toBeDefined()
    expect(typeof config.mcp).toBe('object')
  })

  it('declara el $schema de opencode', () => {
    expect(config.$schema).toBe('https://opencode.ai/config.json')
  })

  it('mantiene las instructions existentes (AGENTS.md + Tokens.md)', () => {
    expect(config.instructions).toBeDefined()
    expect(config.instructions).toContain('AGENTS.md')
    expect(config.instructions).toContain('docs/design/Tokens.md')
  })
})

describe('opencode.json — inventario de MCPs', () => {
  const EXPECTED_MCPS = [
    'filesystem',
    'github',
    'obsidian',
    'vercel',
    'figma',
    'semgrep',
    'test-ai',
  ]

  it('define exactamente los 7 MCPs esperados', () => {
    const actual = Object.keys(config.mcp).sort()
    expect(actual).toEqual([...EXPECTED_MCPS].sort())
  })

  it('cada MCP tiene type válido y enabled booleano', () => {
    for (const [name, mcp] of Object.entries(config.mcp)) {
      expect(['local', 'remote'], `${name}.type`).toContain(mcp.type)
      expect(typeof mcp.enabled, `${name}.enabled`).toBe('boolean')
    }
  })
})

describe('opencode.json — MCPs locales', () => {
  it('cada MCP local tiene command array no vacío', () => {
    for (const [name, mcp] of Object.entries(config.mcp)) {
      if (mcp.type !== 'local') continue
      expect(Array.isArray(mcp.command), `${name}.command debe ser array`).toBe(true)
      expect(mcp.command!.length, `${name}.command no vacío`).toBeGreaterThan(0)
      // El primer elemento suele ser el runner (npx, docker, etc.)
      expect(mcp.command![0], `${name}.command[0] debe ser un ejecutable`).toMatch(
        /^(npx|pnpm|node|bun|docker)$/,
      )
    }
  })

  it('el MCP filesystem apunta a un path absoluto Windows', () => {
    const fs = config.mcp.filesystem
    expect(fs).toBeDefined()
    expect(fs?.type).toBe('local')
    const lastArg = fs?.command?.[fs.command.length - 1]
    expect(lastArg, 'filesystem debe apuntar a un path absoluto').toMatch(/^[A-Z]:\\/)
  })

  it('el MCP filesystem tiene enabled=true (no debe estar deshabilitado)', () => {
    expect(config.mcp.filesystem?.enabled).toBe(true)
  })

  it('el MCP github tiene enabled=true (default)', () => {
    expect(config.mcp.github?.enabled).toBe(true)
  })

  it('timeouts locales son múltiplos razonables (<= 120s)', () => {
    for (const [name, mcp] of Object.entries(config.mcp)) {
      if (mcp.type !== 'local') continue
      if (mcp.timeout !== undefined) {
        expect(mcp.timeout, `${name}.timeout`).toBeGreaterThan(0)
        expect(mcp.timeout, `${name}.timeout`).toBeLessThanOrEqual(120000)
      }
    }
  })
})

describe('opencode.json — MCPs remotos', () => {
  it('cada MCP remoto tiene url https://', () => {
    for (const [name, mcp] of Object.entries(config.mcp)) {
      if (mcp.type !== 'remote') continue
      expect(typeof mcp.url, `${name}.url`).toBe('string')
      expect(mcp.url, `${name}.url debe ser https`).toMatch(/^https:\/\//)
    }
  })

  it('vercel y figma usan OAuth', () => {
    expect(config.mcp.vercel?.oauth, 'vercel.debe tener oauth').toBeDefined()
    expect(config.mcp.figma?.oauth, 'figma.debe tener oauth').toBeDefined()
  })
})

describe('opencode.json — seguridad', () => {
  it('no contiene tokens de GitHub hardcodeados (prefijo ghp_/gho_/ghu_/ghs_)', () => {
    expect(rawContent, 'no ghp_').not.toMatch(/ghp_[a-zA-Z0-9]{20,}/)
    expect(rawContent, 'no gho_').not.toMatch(/gho_[a-zA-Z0-9]{20,}/)
    expect(rawContent, 'no ghu_').not.toMatch(/ghu_[a-zA-Z0-9]{20,}/)
    expect(rawContent, 'no ghs_').not.toMatch(/ghs_[a-zA-Z0-9]{20,}/)
  })

  it('no contiene Authorization Bearer con valor hardcodeado', () => {
    const bearerPattern = /"Authorization"\s*:\s*"Bearer\s+[a-zA-Z0-9_\-]{20,}"/
    expect(rawContent, 'no Bearer hardcodeado').not.toMatch(bearerPattern)
  })

  it('todas las referencias {env:VAR} tienen sintaxis válida', () => {
    const envRefPattern = /^\{env:[A-Z_][A-Z0-9_]*\}$/
    for (const [name, mcp] of Object.entries(config.mcp)) {
      for (const section of ['environment', 'headers'] as const) {
        const values = mcp[section]
        if (!values) continue
        for (const [key, value] of Object.entries(values)) {
          if (typeof value === 'string' && value.includes('{env:')) {
            expect(
              envRefPattern.test(value),
              `${name}.${section}.${key} mal formado: ${value}`,
            ).toBe(true)
          }
        }
      }
    }
  })

  it('github referencia {env:GITHUB_TOKEN} (no valor literal)', () => {
    const token = config.mcp.github?.environment?.GITHUB_PERSONAL_ACCESS_TOKEN
    expect(token).toBe('{env:GITHUB_TOKEN}')
  })
})

describe('opencode.json — defaults sensatos', () => {
  it('sólo filesystem y github están ON por defecto (minimiza context window)', () => {
    const enabledByDefault = Object.entries(config.mcp)
      .filter(([, mcp]) => mcp.enabled === true)
      .map(([name]) => name)
      .sort()
    expect(enabledByDefault).toEqual(['filesystem', 'github'])
  })

  it('MCPs pesados (semgrep, test-ai) están OFF por defecto', () => {
    expect(config.mcp.semgrep?.enabled).toBe(false)
    expect(config.mcp['test-ai']?.enabled).toBe(false)
  })
})
