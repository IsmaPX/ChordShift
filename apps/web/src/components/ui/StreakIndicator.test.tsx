import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '@/test/utils'
import { StreakIndicator } from './StreakIndicator'

describe('StreakIndicator', () => {
  it('renders 10 dots', () => {
    const { container } = renderWithProviders(<StreakIndicator count={0} />)
    const dots = container.querySelectorAll('.rounded-full')
    expect(dots).toHaveLength(10)
  })

  it('renders with non-zero count', () => {
    const { container } = renderWithProviders(<StreakIndicator count={5} />)
    const dots = container.querySelectorAll('.rounded-full')
    expect(dots).toHaveLength(10)
  })

  it('clamps count to maximum of 10', () => {
    const { container } = renderWithProviders(<StreakIndicator count={15} />)
    const dots = container.querySelectorAll('.rounded-full')
    expect(dots).toHaveLength(10)
  })

  it('accepts custom className', () => {
    const { container } = renderWithProviders(<StreakIndicator count={3} className="custom-class" />)
    const outerDiv = container.firstChild as HTMLElement
    expect(outerDiv.className).toContain('custom-class')
  })
})
