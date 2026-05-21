import { describe, it, expect } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { LoginPage } from './page'

describe('LoginPage', () => {
  it('renders the login form', async () => {
    renderWithProviders(<LoginPage />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Iniciar Sesión/i })).not.toBeDisabled()
    })
    expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument()
    expect(screen.getByText('¿No tienes cuenta?')).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    renderWithProviders(<LoginPage />)

    const submitBtn = screen.getByRole('button', { name: /Iniciar Sesión/i })
    await waitFor(() => expect(submitBtn).not.toBeDisabled())

    fireEvent.click(submitBtn)

    expect(await screen.findByText('Email inválido')).toBeInTheDocument()
    expect(await screen.findByText('Mínimo 6 caracteres')).toBeInTheDocument()
  })
})
