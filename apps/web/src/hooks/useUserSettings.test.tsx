import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useUserSettings, useUpdateSettings } from './useUserSettings'
import { createTestQueryClient } from '@/test/utils'
import { db, DEFAULT_SETTINGS } from '@/lib/db'

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>
}

async function seedUser(overrides: Record<string, unknown> = {}) {
  const id = crypto.randomUUID()
  await db.users.add({ id, display_name: 'Test', pin_hash: null, settings: { ...DEFAULT_SETTINGS, ...overrides }, created_at: new Date().toISOString(), last_active: null, ...overrides })
  localStorage.setItem('worship_piano_active_profile', id)
  return id
}

describe('useUserSettings', () => {
  it('returns default settings when user has no custom settings', async () => {
    await seedUser()

    const { result } = renderHook(() => useUserSettings(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.tempo_bpm).toBe(120)
  })

  it('returns custom settings', async () => {
    await seedUser({ settings: { tempo_bpm: 80, language: 'en', notifications_enabled: false, feedback_concept: 'pulse', xp: 50 } })

    const { result } = renderHook(() => useUserSettings(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.tempo_bpm).toBe(80)
    expect(result.current.data?.language).toBe('en')
  })
})

describe('useUpdateSettings', () => {
  it('updates settings', async () => {
    const userId = await seedUser()

    const { result } = renderHook(() => useUpdateSettings(), { wrapper })
    await waitFor(() => expect(result.current.isIdle).toBe(true))

    await act(async () => {
      result.current.mutate({ tempo_bpm: 90, language: 'en', notifications_enabled: true, feedback_concept: 'rings', xp: 10 })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const updated = await db.users.get(userId)
    expect(updated?.settings.tempo_bpm).toBe(90)
  })
})
