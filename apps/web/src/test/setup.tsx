import '@testing-library/jest-dom'
import { vi, afterEach, beforeAll, beforeEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import type { ReactNode } from 'react'
import 'fake-indexeddb/auto'
import { db } from '@/lib/db'
import i18n from '@/lib/i18n/i18n'

beforeAll(() => {
  if (!globalThis.structuredClone) {
    globalThis.structuredClone = (val) => JSON.parse(JSON.stringify(val))
  }
  if (!globalThis.crypto.randomUUID) {
    globalThis.crypto.randomUUID = (() => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
    })) as typeof globalThis.crypto.randomUUID
  }
  globalThis.crypto.subtle.digest = vi.fn().mockResolvedValue(new ArrayBuffer(32))
})

beforeEach(async () => {
  await Promise.all(db.tables.map(t => t.clear()))
  // Seed a minimal set so useAuth's seedIfEmpty is a no-op
  await db.styles.add({ id: 'test-style', name: 'Test', difficulty: 1, theory_required: [], techniques: [], description: '' })
  await db.tips.add({ id: 'test-tip', content: 'Test', category: 'teoría', style_id: null, difficulty_min: 1 })
  await db.songs.add({ id: 'test-song', title: 'Test', artist: 'T', style_id: 'test-style', difficulty: 1, key_signature: 'C', bpm: 120, instrument: 'piano', chord_data: { sections: [] }, is_published: true, created_at: '2024-01-01' })
})

afterEach(() => {
  cleanup()
})

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
