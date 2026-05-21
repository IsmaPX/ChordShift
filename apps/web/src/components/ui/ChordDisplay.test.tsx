import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { ChordDisplay } from './ChordDisplay'

describe('ChordDisplay', () => {
  it('renders the chord text', () => {
    renderWithProviders(<ChordDisplay chord="C" />)
    expect(screen.getByText('C')).toBeInTheDocument()
  })

  it('renders a longer chord name', () => {
    renderWithProviders(<ChordDisplay chord="G/B" />)
    expect(screen.getByText('G/B')).toBeInTheDocument()
  })

  it('applies active styles when isActive is true', () => {
    const { container } = renderWithProviders(<ChordDisplay chord="Dm7" isActive />)
    const element = container.firstChild as HTMLElement
    expect(element.className).toContain('text-text-primary')
    expect(element.className).toContain('text-[48px]')
  })

  it('applies inactive styles when isActive is false', () => {
    const { container } = renderWithProviders(<ChordDisplay chord="Dm7" isActive={false} />)
    const element = container.firstChild as HTMLElement
    expect(element.className).toContain('text-text-secondary')
  })
})
