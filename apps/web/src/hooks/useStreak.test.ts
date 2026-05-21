import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useStreak } from './useStreak'

describe('useStreak', () => {
  it('starts with count 0', () => {
    const { result } = renderHook(() => useStreak())
    expect(result.current.count).toBe(0)
  })

  it('increments count by 1', () => {
    const { result } = renderHook(() => useStreak())
    act(() => { result.current.increment() })
    expect(result.current.count).toBe(1)
  })

  it('increments multiple times', () => {
    const { result } = renderHook(() => useStreak())
    act(() => { result.current.increment() })
    act(() => { result.current.increment() })
    act(() => { result.current.increment() })
    expect(result.current.count).toBe(3)
  })

  it('resets count to 0', () => {
    const { result } = renderHook(() => useStreak())
    act(() => { result.current.increment() })
    act(() => { result.current.increment() })
    expect(result.current.count).toBe(2)
    act(() => { result.current.reset() })
    expect(result.current.count).toBe(0)
  })
})
