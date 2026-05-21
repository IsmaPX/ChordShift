import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { LoginPage } from './page'
import { db } from '@/lib/db'
import { DEFAULT_SETTINGS } from '@/lib/db'

describe('LoginPage', () => {
  it('shows empty state when no profiles exist', async () => {
    renderWithProviders(<LoginPage />)

    await waitFor(() => {
      expect(screen.getByText('No hay perfiles creados')).toBeInTheDocument()
    })
    expect(screen.getByText('Crear Perfil')).toBeInTheDocument()
  })

  it('shows profile list when profiles exist', async () => {
    await db.users.add({ id: 'p1', display_name: 'Usuario 1', pin_hash: null, settings: { ...DEFAULT_SETTINGS }, created_at: new Date().toISOString(), last_active: null })
    await db.users.add({ id: 'p2', display_name: 'Usuario 2', pin_hash: null, settings: { ...DEFAULT_SETTINGS }, created_at: new Date().toISOString(), last_active: null })

    renderWithProviders(<LoginPage />)

    await waitFor(() => {
      expect(screen.getByText('Usuario 1')).toBeInTheDocument()
    })
    expect(screen.getByText('Usuario 2')).toBeInTheDocument()
    expect(screen.getByText('Crear nuevo perfil')).toBeInTheDocument()
  })
})
