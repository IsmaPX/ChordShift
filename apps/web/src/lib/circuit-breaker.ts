type CircuitState = 'closed' | 'open' | 'half_open'

interface CircuitBreakerOptions {
  failureThreshold?: number
  resetTimeout?: number
  onStateChange?: (state: CircuitState) => void
  onFailure?: (error: Error) => void
  onSuccess?: () => void
}

export class CircuitBreaker {
  private state: CircuitState = 'closed'
  private failureCount = 0
  private lastFailureTime: number | null = null
  private readonly failureThreshold: number
  private readonly resetTimeout: number
  private readonly onStateChange?: (state: CircuitState) => void
  private readonly onFailure?: (error: Error) => void
  private readonly onSuccess?: () => void

  constructor(options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold ?? 3
    this.resetTimeout = options.resetTimeout ?? 30000
    this.onStateChange = options.onStateChange
    this.onFailure = options.onFailure
    this.onSuccess = options.onSuccess
  }

  async execute<T>(fn: () => T | Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (this.shouldAttemptReset()) {
        this.setState('half_open')
      } else {
        throw new CircuitBreakerOpenError('Circuit breaker is OPEN')
      }
    }

    try {
      const result = await fn()
      this.onSuccess?.()
      this.recordSuccess()
      return result
    } catch (error) {
      this.onFailure?.(error as Error)
      this.recordFailure(error as Error)
      throw error
    }
  }

  private recordSuccess() {
    if (this.state === 'half_open') {
      this.reset()
    } else {
      this.failureCount = 0
    }
  }

  private recordFailure(_error: Error) {
    this.failureCount++
    this.lastFailureTime = Date.now()
    void _error // intentionally unused — failure is recorded by count only

    if (this.state === 'half_open' || this.failureCount >= this.failureThreshold) {
      this.setState('open')
    }
  }

  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return true
    return Date.now() - this.lastFailureTime >= this.resetTimeout
  }

  private setState(state: CircuitState) {
    if (this.state !== state) {
      this.state = state
      this.onStateChange?.(state)
    }
  }

  getState(): CircuitState {
    return this.state
  }

  reset() {
    this.state = 'closed'
    this.failureCount = 0
    this.lastFailureTime = null
    this.onStateChange?.('closed')
  }

  isClosed(): boolean {
    return this.state === 'closed'
  }

  isOpen(): boolean {
    return this.state === 'open'
  }
}

export class CircuitBreakerOpenError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CircuitBreakerOpenError'
  }
}

export function createCircuitBreaker(options?: CircuitBreakerOptions): CircuitBreaker {
  return new CircuitBreaker(options)
}