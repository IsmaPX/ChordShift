import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { PracticePage } from './page'

const { mockData } = vi.hoisted(() => ({ mockData: vi.fn() }))

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => {
        const thenable = Promise.resolve(mockData()) as Promise<unknown> & Record<string, ReturnType<typeof vi.fn>>
        thenable.eq = vi.fn(() => thenable)
        thenable.order = vi.fn(() => thenable)
        thenable.limit = vi.fn(() => thenable)
        thenable.single = vi.fn(() => thenable)
        return thenable
      }),
    })),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  })),
}))

const fakeSongs = [
  { id: '1', title: 'Canción Uno', artist: 'Artista A', style_id: 's1', difficulty: 2, key_signature: 'C', bpm: 120, chord_data: { sections: [] }, is_published: true },
  { id: '2', title: 'Canción Dos', artist: 'Artista B', style_id: 's2', difficulty: 3, key_signature: 'G', bpm: 80, chord_data: { sections: [] }, is_published: true },
]

beforeEach(() => {
  mockData.mockReset()
})

describe('PracticePage', () => {
  it('shows loading state initially', () => {
    mockData.mockReturnValue(new Promise(() => {}))
    renderWithProviders(<PracticePage />)
    expect(screen.getByText('Práctica')).toBeInTheDocument()
  })

  it('renders songs list when data loads', async () => {
    mockData.mockReturnValue({ data: fakeSongs, error: null })
    renderWithProviders(<PracticePage />)

    await waitFor(() => {
      expect(screen.getByText('Canción Uno')).toBeInTheDocument()
    })
    expect(screen.getByText('Canción Dos')).toBeInTheDocument()
    expect(screen.getByText('Artista A')).toBeInTheDocument()
    expect(screen.getByText('Artista B')).toBeInTheDocument()
  })

  it('shows empty state when no songs', async () => {
    mockData.mockReturnValue({ data: [], error: null })
    renderWithProviders(<PracticePage />)

    await waitFor(() => {
      expect(screen.getByText('No hay canciones disponibles')).toBeInTheDocument()
    })
  })

  it('shows error state when query fails', async () => {
    mockData.mockReturnValue({ data: null, error: new Error('fail') })
    renderWithProviders(<PracticePage />)

    await waitFor(() => {
      expect(screen.getByText('Error al cargar canciones. Intenta de nuevo.')).toBeInTheDocument()
    })
  })
})
