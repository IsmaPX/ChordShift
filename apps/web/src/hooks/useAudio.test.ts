import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAudio } from './useAudio'

vi.mock('@/audio/AudioEngine', () => ({
  AudioEngine: {
    initialize: vi.fn().mockResolvedValue(undefined),
    getStatus: vi.fn().mockReturnValue({ isReady: true, isInitialized: true }),
    playNote: vi.fn(),
    playChord: vi.fn(),
    playChordSequence: vi.fn(),
    stop: vi.fn(),
    dispose: vi.fn(),
  },
}))

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useAudio', () => {
  it('returns isReady from AudioEngine', () => {
    const { result } = renderHook(() => useAudio())
    expect(result.current.isReady).toBe(true)
    expect(result.current.isPlaying).toBe(false)
  })

  it('sets isPlaying on playNote and clears after duration', () => {
    const { result } = renderHook(() => useAudio())
    act(() => { result.current.playNote('C4', 0.5) })
    expect(result.current.isPlaying).toBe(true)
    act(() => { vi.advanceTimersByTime(500) })
    expect(result.current.isPlaying).toBe(false)
  })

  it('sets isPlaying on playChord and clears after duration', () => {
    const { result } = renderHook(() => useAudio())
    act(() => { result.current.playChord(['C4', 'E4', 'G4'], 0.3) })
    expect(result.current.isPlaying).toBe(true)
    act(() => { vi.advanceTimersByTime(300) })
    expect(result.current.isPlaying).toBe(false)
  })

  it('calls AudioEngine.stop and clears isPlaying', () => {
    const { result } = renderHook(() => useAudio())
    act(() => { result.current.playNote('C4', 10) })
    expect(result.current.isPlaying).toBe(true)
    act(() => { result.current.stop() })
    expect(result.current.isPlaying).toBe(false)
  })
})
