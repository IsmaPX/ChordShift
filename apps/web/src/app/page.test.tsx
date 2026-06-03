import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/utils'
import { LandingPage } from './page'

describe('LandingPage', () => {
  it('renders all three hero words', () => {
    renderWithProviders(<LandingPage />)
    expect(screen.getByText('Practica.')).toBeInTheDocument()
    expect(screen.getByText('Entrena.')).toBeInTheDocument()
    expect(screen.getByText('Adora.')).toBeInTheDocument()
  })

  it('renders register link and login button', () => {
    renderWithProviders(<LandingPage />)
    expect(screen.getByText('Comenzar Gratis')).toBeInTheDocument()
    expect(screen.getByText('Ya tengo cuenta')).toBeInTheDocument()
  })

  it('shows login form when clicking Ya tengo cuenta', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LandingPage />)
    const loginBtn = screen.getByText('Ya tengo cuenta')
    await user.click(loginBtn)
    expect(screen.getByText('Bienvenido de vuelta')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('tu@email.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
  })
})
