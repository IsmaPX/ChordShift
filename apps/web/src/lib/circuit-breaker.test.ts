import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CircuitBreaker, CircuitBreakerOpenError } from './circuit-breaker'

describe('CircuitBreaker', () => {
  beforeEach(() => {
    vi.useRealTimers()
  })

  it('should start in closed state', () => {
    const cb = new CircuitBreaker()
    expect(cb.getState()).toBe('closed')
    expect(cb.isClosed()).toBe(true)
    expect(cb.isOpen()).toBe(false)
  })

  it('should execute function when closed', async () => {
    const cb = new CircuitBreaker()
    const fn = vi.fn().mockResolvedValue('success')

    const result = await cb.execute(fn)

    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should open after reaching failure threshold', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 3 })
    const fn = vi.fn().mockRejectedValue(new Error('fail'))

    for (let i = 0; i < 3; i++) {
      await expect(cb.execute(fn)).rejects.toThrow('fail')
    }

    expect(cb.getState()).toBe('open')
    expect(cb.isOpen()).toBe(true)
  })

  it('should throw CircuitBreakerOpenError when open', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 1 })
    const fn = vi.fn().mockRejectedValue(new Error('fail'))

    await expect(cb.execute(fn)).rejects.toThrow('fail')
    await expect(cb.execute(fn)).rejects.toThrow(CircuitBreakerOpenError)
  })

  it('should call onStateChange callback', async () => {
    const onStateChange = vi.fn()
    const cb = new CircuitBreaker({ failureThreshold: 1, onStateChange })
    const fn = vi.fn().mockRejectedValue(new Error('fail'))

    try {
      await cb.execute(fn)
    } catch { void 0 }

    expect(onStateChange).toHaveBeenCalledWith('open')
  })

  it('should call onSuccess callback', async () => {
    const onSuccess = vi.fn()
    const cb = new CircuitBreaker({ onSuccess })
    const fn = vi.fn().mockResolvedValue('success')

    await cb.execute(fn)

    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  it('should call onFailure callback', async () => {
    const onFailure = vi.fn()
    const cb = new CircuitBreaker({ failureThreshold: 2, onFailure })
    const fn = vi.fn().mockRejectedValue(new Error('fail'))

    await expect(cb.execute(fn)).rejects.toThrow('fail')
    expect(onFailure).toHaveBeenCalledTimes(1)
  })

  it('should reset state manually', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 1 })
    const fn = vi.fn().mockRejectedValue(new Error('fail'))

    try {
      await cb.execute(fn)
    } catch { void 0 }

    expect(cb.isOpen()).toBe(true)

    cb.reset()
    expect(cb.isClosed()).toBe(true)
  })
})