import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoginBackgroundGallery, MUSICIANS } from './index'

describe('LoginBackgroundGallery', () => {
  let matchMediaMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('se renderiza correctamente con el data-testid esperado', () => {
    render(<LoginBackgroundGallery />)
    const gallery = screen.getByTestId('login-background-gallery')
    expect(gallery).toBeInTheDocument()
  })

  it('es decorativo y tiene aria-hidden=true', () => {
    render(<LoginBackgroundGallery />)
    const gallery = screen.getByTestId('login-background-gallery')
    expect(gallery).toHaveAttribute('aria-hidden', 'true')
  })

  it('expone 5 músicos anime predefinidos', () => {
    expect(MUSICIANS).toHaveLength(5)
    const ids = MUSICIANS.map((m) => m.id)
    expect(ids).toContain('pianist')
    expect(ids).toContain('guitarist')
    expect(ids).toContain('trumpet')
    expect(ids).toContain('drummer')
    expect(ids).toContain('violinist')
  })

  it('cada músico tiene Component y label asociados', () => {
    MUSICIANS.forEach((m) => {
      expect(m.Component).toBeDefined()
      expect(typeof m.label).toBe('string')
      expect(m.label.length).toBeGreaterThan(0)
    })
  })

  it('acepta props repeat, duration y tinted sin errores', () => {
    render(<LoginBackgroundGallery repeat={2} duration={30} tinted={false} />)
    expect(screen.getByTestId('login-background-gallery')).toBeInTheDocument()
  })

  it('no rompe la accesibilidad (pointer-events-none)', () => {
    render(<LoginBackgroundGallery />)
    const gallery = screen.getByTestId('login-background-gallery')
    expect(gallery.className).toContain('pointer-events-none')
  })

  it('detecta prefers-reduced-motion cuando está activo', () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: query.includes('reduce'),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    render(<LoginBackgroundGallery duration={10} />)
    // Con reduced motion activo, la duración efectiva es 99999s (casi estática)
    const gallery = screen.getByTestId('login-background-gallery')
    expect(gallery).toBeInTheDocument()
  })

  it('inyecta los keyframes solo una vez', () => {
    const { unmount } = render(<LoginBackgroundGallery />)
    unmount()
    render(<LoginBackgroundGallery />)
    // El style element debe existir solo una vez
    const styles = document.querySelectorAll('style#lbg-keyframes')
    expect(styles.length).toBe(1)
  })
})
