import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAutoUpdate } from './useAutoUpdate'

const mockElectronAPI = {
  checkForUpdates: vi.fn(),
  installUpdate: vi.fn(),
  onUpdateAvailable: vi.fn(() => () => {}),
  onUpdateProgress: vi.fn(() => () => {}),
  onUpdateDownloaded: vi.fn(() => () => {}),
}

function getCallArg<T>(mock: ReturnType<typeof vi.fn>, callIndex = 0, argIndex = 0): T {
  return mock.mock.calls[callIndex]?.[argIndex] as T
}

beforeEach(() => {
  Object.defineProperty(window, 'isElectron', {
    value: true,
    writable: true,
    configurable: true,
  })
  Object.defineProperty(window, 'electronAPI', {
    value: mockElectronAPI,
    writable: true,
    configurable: true,
  })
})

afterEach(() => {
  Object.defineProperty(window, 'isElectron', {
    value: false,
    writable: true,
    configurable: true,
  })
  delete (window as Window & typeof globalThis & { electronAPI?: typeof mockElectronAPI }).electronAPI
  vi.clearAllMocks()
})

describe('useAutoUpdate', () => {
  it('starts in idle state', () => {
    const { result } = renderHook(() => useAutoUpdate())
    expect(result.current.updateState).toBe('idle')
    expect(result.current.updateProgress).toBe(0)
    expect(result.current.updateVersion).toBe('')
  })

  it('calls checkForUpdates and transitions to checking', () => {
    const { result } = renderHook(() => useAutoUpdate())
    act(() => { result.current.handleCheckForUpdates() })
    expect(mockElectronAPI.checkForUpdates).toHaveBeenCalledTimes(1)
  })

  it('transitions to available when update is found', () => {
    const { result } = renderHook(() => useAutoUpdate())
    act(() => { result.current.handleCheckForUpdates() })
    const onAvailable = getCallArg<(info: { version: string }) => void>(mockElectronAPI.onUpdateAvailable)
    act(() => { onAvailable({ version: '2.0.0' }) })
    expect(result.current.updateState).toBe('available')
    expect(result.current.updateVersion).toBe('2.0.0')
  })

  it('tracks download progress', () => {
    const { result } = renderHook(() => useAutoUpdate())
    act(() => { result.current.handleCheckForUpdates() })
    const onProgress = getCallArg<(percent: number) => void>(mockElectronAPI.onUpdateProgress)
    act(() => { onProgress(50) })
    expect(result.current.updateState).toBe('downloading')
    expect(result.current.updateProgress).toBe(50)
  })

  it('transitions to downloaded when complete', () => {
    const { result } = renderHook(() => useAutoUpdate())
    act(() => { result.current.handleCheckForUpdates() })
    const onDownloaded = getCallArg<() => void>(mockElectronAPI.onUpdateDownloaded)
    act(() => { onDownloaded() })
    expect(result.current.updateState).toBe('downloaded')
  })

  it('calls installUpdate on handleInstallUpdate', () => {
    const { result } = renderHook(() => useAutoUpdate())
    act(() => { result.current.handleInstallUpdate() })
    expect(mockElectronAPI.installUpdate).toHaveBeenCalledTimes(1)
  })

  it('resets to idle state', () => {
    const { result } = renderHook(() => useAutoUpdate())
    act(() => { result.current.handleCheckForUpdates() })
    const onAvailable = getCallArg<(info: { version: string }) => void>(mockElectronAPI.onUpdateAvailable)
    act(() => { onAvailable({ version: '2.0.0' }) })
    act(() => { result.current.resetUpdate() })
    expect(result.current.updateState).toBe('idle')
    expect(result.current.updateVersion).toBe('')
    expect(result.current.updateProgress).toBe(0)
  })

  it('does nothing if not in Electron', () => {
    Object.defineProperty(window, 'isElectron', {
      value: false,
      writable: true,
      configurable: true,
    })
    const { result } = renderHook(() => useAutoUpdate())
    act(() => { result.current.handleCheckForUpdates() })
    expect(mockElectronAPI.checkForUpdates).not.toHaveBeenCalled()
  })
})
