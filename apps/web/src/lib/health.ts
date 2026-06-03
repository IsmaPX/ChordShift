import { db } from './db'

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy'

export interface CheckResult {
  status: 'ok' | 'degraded' | 'error'
  message?: string
  latencyMs?: number
}

export interface SystemHealth {
  status: HealthStatus
  timestamp: string
  checks: {
    database: CheckResult
    audio: CheckResult
    network: CheckResult
  }
}

export async function checkDatabase(): Promise<CheckResult> {
  const start = Date.now()
  try {
    await db.users.count()
    return { status: 'ok', latencyMs: Date.now() - start }
  } catch (error) {
    return { status: 'error', message: (error as Error).message }
  }
}

export function checkNetwork(): CheckResult {
  if (navigator.onLine) {
    return { status: 'ok', latencyMs: 0 }
  }
  return { status: 'error', message: 'No network connection' }
}

export function checkAudio(): CheckResult {
  const hasAudioContext = typeof window !== 'undefined' && 'AudioContext' in window
  const hasTone = typeof window !== 'undefined' && 'TONE' in window

  if (hasAudioContext && hasTone) {
    return { status: 'ok', latencyMs: 0 }
  }
  if (hasAudioContext) {
    return { status: 'degraded', message: 'Tone.js not loaded', latencyMs: 0 }
  }
  return { status: 'error', message: 'Web Audio not available' }
}

export async function checkHealth(): Promise<SystemHealth> {
  const [database, network, audio] = await Promise.all([
    checkDatabase(),
    Promise.resolve(checkNetwork()),
    Promise.resolve(checkAudio()),
  ])

  const hasErrors = [database, network, audio].some((c) => c.status === 'error')
  const hasDegraded = [database, network, audio].some((c) => c.status === 'degraded')

  let status: HealthStatus = 'healthy'
  if (hasErrors) status = 'unhealthy'
  else if (hasDegraded) status = 'degraded'

  return {
    status,
    timestamp: new Date().toISOString(),
    checks: { database, network, audio },
  }
}

export function createHealthReporter(intervalMs = 30000) {
  let intervalId: ReturnType<typeof setInterval> | null = null

  const start = (callback: (health: SystemHealth) => void) => {
    const report = async () => {
      const health = await checkHealth()
      callback(health)
    }
    report()
    intervalId = setInterval(report, intervalMs)
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }

  return { start }
}