import { describe, it, expect, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { PracticePage } from './page'
import { db } from '@/lib/db'

const fakeSongs = [
  { id: '1', title: 'Canción Uno', artist: 'Artista A', style_id: 's1', difficulty: 2, key_signature: 'C', bpm: 120, instrument: 'piano' as const, chord_data: { sections: [] as never[] }, is_published: true, created_at: '2024-01-01' },
  { id: '2', title: 'Canción Dos', artist: 'Artista B', style_id: 's2', difficulty: 3, key_signature: 'G', bpm: 80, instrument: 'piano' as const, chord_data: { sections: [] as never[] }, is_published: true, created_at: '2024-01-02' },
]

beforeEach(async () => {
  await db.songs.clear()
})

describe('PracticePage', () => {
  it('shows loading and then empty state', async () => {
    renderWithProviders(<PracticePage />)
    expect(screen.getByText('Práctica')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('No hay canciones disponibles')).toBeInTheDocument()
    })
  })

  it('renders songs list when data loads', async () => {
    await db.songs.bulkAdd(fakeSongs)
    renderWithProviders(<PracticePage />)

    await waitFor(() => {
      expect(screen.getByText('Canción Uno')).toBeInTheDocument()
    })
    expect(screen.getByText('Canción Dos')).toBeInTheDocument()
    expect(screen.getByText('Artista A')).toBeInTheDocument()
    expect(screen.getByText('Artista B')).toBeInTheDocument()
  })

  it('shows tabs and import/create buttons', async () => {
    renderWithProviders(<PracticePage />)

    await waitFor(() => {
      expect(screen.getByText('Todas')).toBeInTheDocument()
    })
    expect(screen.getByText('Precargadas')).toBeInTheDocument()
    expect(screen.getByText('Mis Canciones')).toBeInTheDocument()
    expect(screen.getByText('Importar')).toBeInTheDocument()
    expect(screen.getByText('Crear')).toBeInTheDocument()
  })
})
