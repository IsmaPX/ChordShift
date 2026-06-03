import '@testing-library/jest-dom'
import { vi, afterEach, beforeAll, beforeEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import type { ReactNode } from 'react'
import 'fake-indexeddb/auto'
import { db } from '@/lib/db'

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
  await db.styles.add({ id: 'test-style', name: 'Test', difficulty: 1, theory_required: [], techniques: [], description: '' })
  await db.tips.add({ id: 'test-tip', content: 'Test', category: 'teoría', style_id: null, difficulty_min: 1 })
  await db.songs.add({ id: 'test-song', title: 'Test', artist: 'T', style_id: 'test-style', difficulty: 1, key_signature: 'C', bpm: 120, instrument: 'piano', chord_data: { sections: [] }, is_published: true, created_at: '2024-01-01' })
})

afterEach(() => {
  cleanup()
})

function createMotionComponent(props: { children?: ReactNode; [key: string]: unknown }): React.ReactElement {
  const { children, ...rest } = props
  return <div data-testid="motion-component" {...rest}>{children}</div>
}

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('framer-motion')
  return {
    ...actual,
    motion: new Proxy({}, {
      get: (_target, prop) => {
        if (prop === 'div') {
          return createMotionComponent
        }
        return createMotionComponent
      },
    }) as unknown as typeof actual.motion,
    AnimatePresence: ({ children }: { children?: ReactNode }) => <>{children}</>,
    useAnimation: () => ({
      start: vi.fn(),
    }),
    useScroll: () => ({
      scrollYProgress: { get current() { return 0 } },
    }),
    useTransform: () => (v: unknown) => v,
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