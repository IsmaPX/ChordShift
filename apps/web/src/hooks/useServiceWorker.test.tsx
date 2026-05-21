import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import type { ReactNode } from 'react'

const mockRegister = vi.fn()

beforeEach(() => {
  mockRegister.mockReset()
  Object.defineProperty(navigator, 'serviceWorker', {
    value: { register: mockRegister },
    configurable: true,
    writable: true,
  })
})

function wrapper({ children }: { children: ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>
}

describe('useServiceWorker', () => {
  it('does not register in dev mode', async () => {
    vi.stubEnv('PROD', false)
    const mod = await import('./useServiceWorker')
    renderHook(() => mod.useServiceWorker(), { wrapper })
    expect(mockRegister).not.toHaveBeenCalled()
    vi.unstubAllEnvs()
  })
})
