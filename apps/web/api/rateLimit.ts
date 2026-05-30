const REQUESTS = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(key: string, maxRequests = 5, windowMs = 60000): boolean {
  const now = Date.now()
  const entry = REQUESTS.get(key)
  if (!entry || now > entry.resetAt) {
    REQUESTS.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (entry.count >= maxRequests) return false
  entry.count++
  return true
}
