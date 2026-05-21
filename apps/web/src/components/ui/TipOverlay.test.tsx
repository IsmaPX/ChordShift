import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { TipOverlay } from './TipOverlay'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('TipOverlay', () => {
  it('renders tip content when visible', () => {
    renderWithProviders(
      <TipOverlay content="Test tip" isVisible onDismiss={vi.fn()} />
    )
    expect(screen.getByText('Test tip')).toBeInTheDocument()
  })

  it('does not render when not visible', () => {
    renderWithProviders(
      <TipOverlay content="Test tip" isVisible={false} onDismiss={vi.fn()} />
    )
    expect(screen.queryByText('Test tip')).not.toBeInTheDocument()
  })

  it('renders category badge when provided', () => {
    renderWithProviders(
      <TipOverlay content="Test tip" category="teoría" isVisible onDismiss={vi.fn()} />
    )
    expect(screen.getByText('teoría')).toBeInTheDocument()
  })

  it('dismisses when close button is clicked', () => {
    const onDismiss = vi.fn()
    renderWithProviders(
      <TipOverlay content="Test tip" isVisible onDismiss={onDismiss} />
    )
    fireEvent.click(screen.getByLabelText('Dismiss tip'))
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('auto-dismisses after default timeout', () => {
    const onDismiss = vi.fn()
    renderWithProviders(
      <TipOverlay content="Test tip" isVisible onDismiss={onDismiss} />
    )
    expect(onDismiss).not.toHaveBeenCalled()
    vi.advanceTimersByTime(4000)
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('auto-dismisses after custom timeout', () => {
    const onDismiss = vi.fn()
    renderWithProviders(
      <TipOverlay content="Test tip" isVisible onDismiss={onDismiss} autoDismissMs={2000} />
    )
    vi.advanceTimersByTime(2000)
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('does not auto-dismiss when not visible', () => {
    const onDismiss = vi.fn()
    renderWithProviders(
      <TipOverlay content="Test tip" isVisible={false} onDismiss={onDismiss} />
    )
    vi.advanceTimersByTime(4000)
    expect(onDismiss).not.toHaveBeenCalled()
  })
})
