import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { LandingPage } from './page'

describe('LandingPage', () => {
  it('renders the main heading', () => {
    renderWithProviders(<LandingPage />)
    expect(screen.getByText('Practica. Entrena. Adora.')).toBeInTheDocument()
  })

  it('renders register and login links', () => {
    renderWithProviders(<LandingPage />)
    expect(screen.getByText('Comenzar Gratis')).toBeInTheDocument()
    expect(screen.getByText('Ya tengo cuenta')).toBeInTheDocument()
  })

  it('renders feature cards', () => {
    renderWithProviders(<LandingPage />)
    expect(screen.getByText('Práctica')).toBeInTheDocument()
    expect(screen.getByText('Ear Training')).toBeInTheDocument()
    expect(screen.getByText('Enciclopedia')).toBeInTheDocument()
  })
})
