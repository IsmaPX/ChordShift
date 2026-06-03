import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkHealth, checkDatabase, checkNetwork, checkAudio } from './health'

describe('Health Checks', () => {
  beforeEach(() => {
    vi.useRealTimers()
  })

  describe('checkDatabase', () => {
    it('should return ok when database is accessible', async () => {
      const result = await checkDatabase()
      expect(result.status).toBe('ok')
      expect(result.latencyMs).toBeDefined()
    })
  })

  describe('checkNetwork', () => {
    it('should return ok when online', () => {
      Object.defineProperty(navigator, 'onLine', { value: true, writable: true })
      const result = checkNetwork()
      expect(result.status).toBe('ok')
    })

    it('should return error when offline', () => {
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true })
      const result = checkNetwork()
      expect(result.status).toBe('error')
      expect(result.message).toContain('No network')
    })
  })

  describe('checkAudio', () => {
    it('should check audio context availability', () => {
      const result = checkAudio()
      expect(result.status).toBeDefined()
    })
  })

  describe('checkHealth', () => {
    it('should aggregate all checks', async () => {
      Object.defineProperty(navigator, 'onLine', { value: true, writable: true })
      const health = await checkHealth()

      expect(health).toHaveProperty('status')
      expect(health).toHaveProperty('timestamp')
      expect(health).toHaveProperty('checks')
      expect(health.checks).toHaveProperty('database')
      expect(health.checks).toHaveProperty('network')
      expect(health.checks).toHaveProperty('audio')
    })
  })
})