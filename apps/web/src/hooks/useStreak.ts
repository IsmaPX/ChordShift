import { useState, useCallback } from 'react'

interface UseStreakReturn {
  count: number
  increment: () => void
  reset: () => void
}

export function useStreak(): UseStreakReturn {
  const [count, setCount] = useState(0)

  const increment = useCallback(() => {
    setCount((prev) => prev + 1)
  }, [])

  const reset = useCallback(() => {
    setCount(0)
  }, [])

  return {
    count,
    increment,
    reset,
  }
}