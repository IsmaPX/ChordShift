import '@testing-library/jest-dom'
import { vi, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import type { ReactNode } from 'react'

afterEach(() => {
  cleanup()
})

const mockAuth = {
  getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
  onAuthStateChange: vi.fn(() => ({
    data: { subscription: { unsubscribe: vi.fn() } },
  })),
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn().mockResolvedValue({ error: null }),
  resetPasswordForEmail: vi.fn(),
  getUser: vi.fn(),
  updateUser: vi.fn(),
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
    })),
    auth: mockAuth,
  })),
}))

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('framer-motion')
  return {
    ...actual,
    motion: new Proxy({}, {
      get: () => {
        const skipKeys = new Set(['initial', 'animate', 'exit', 'transition', 'whileTap', 'whileHover', 'onAnimationComplete', 'layout', 'layoutId', 'variants'])
        return (props: Record<string, unknown>) => {
          const children = props.children as ReactNode
          const sanitized: Record<string, unknown> = {}
          for (const [k, v] of Object.entries(props)) {
            if (k === 'children' || skipKeys.has(k)) continue
            if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' || typeof v === 'function') {
              sanitized[k] = v
            }
          }
          return <div {...sanitized}>{children}</div>
        }
      },
    }),
    AnimatePresence: ({ children }: Record<string, unknown>) => <>{children}</>,
  }
})

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
