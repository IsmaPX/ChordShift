import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/utils'
import { StyleCard } from './StyleCard'

const mockStyle = {
  id: 'style-1',
  name: 'Adoración',
  difficulty: 3,
  theory_required: ['escalas mayores'],
  techniques: ['strumming', 'fingerpicking', 'arpegios', 'slides'],
  description: 'Un estilo de adoración contemporánea',
}

describe('StyleCard', () => {
  it('renders style name and description', () => {
    renderWithProviders(<StyleCard style={mockStyle} />)
    expect(screen.getByText('Adoración')).toBeInTheDocument()
    expect(screen.getByText('Un estilo de adoración contemporánea')).toBeInTheDocument()
  })

  it('renders up to 3 technique badges', () => {
    renderWithProviders(<StyleCard style={mockStyle} />)
    expect(screen.getByText('strumming')).toBeInTheDocument()
    expect(screen.getByText('fingerpicking')).toBeInTheDocument()
    expect(screen.getByText('arpegios')).toBeInTheDocument()
  })

  it('shows overflow count when more than 3 techniques', () => {
    renderWithProviders(<StyleCard style={mockStyle} />)
    expect(screen.getByText('+1')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn()
    renderWithProviders(<StyleCard style={mockStyle} onClick={onClick} />)
    const user = userEvent.setup()
    await user.click(screen.getByText('Adoración'))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
