import { useEffect, useState, useMemo } from 'react'
import { MUSICIANS, type LoginBackgroundGalleryProps } from './types'
import { galleryKeyframes, trackStyle, itemStyle } from './animation'

/**
 * Detecta si el usuario prefiere movimiento reducido.
 * SSR-safe: default `false` hasta hidratar.
 */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return reduced
}

/**
 * LoginBackgroundGallery
 *
 * Galería de fondo animada con músicos anime tocando instrumentos.
 * - Movimiento progresivo horizontal (carrusel infinito CSS-only).
 * - Tinte verde integrado con la paleta (#22c55e) vía filter.
 * - Vignette sutil en esquinas para enfoque, no en el centro.
 * - Respeta `prefers-reduced-motion: reduce` (estado estático).
 * - SSR-safe, sin acceso a `window` en primer render.
 * - Performance: solo `transform` y `opacity` (GPU), `will-change` selectivo.
 */
export function LoginBackgroundGallery({
  repeat = 3,
  duration = 75,
  tinted = true,
}: LoginBackgroundGalleryProps) {
  const reducedMotion = usePrefersReducedMotion()

  // Inyecta los keyframes una sola vez (idempotente).
  useEffect(() => {
    if (typeof document === 'undefined') return
    const id = 'lbg-keyframes'
    if (document.getElementById(id)) return
    const style = document.createElement('style')
    style.id = id
    style.textContent = galleryKeyframes
    document.head.appendChild(style)
  }, [])

  // Duplica el array de músicos para crear el loop continuo.
  // Con repeat=2x, el keyframe de -50% a 0% produce un loop sin saltos.
  const musicians = useMemo(() => {
    const loopLength = Math.max(2, Math.floor(repeat) * 2)
    const visible = MUSICIANS.length * loopLength
    return Array.from({ length: visible }, (_, i) => {
      const source = MUSICIANS[i % MUSICIANS.length]
      return {
        ...source,
        uniqueKey: `${source.id}-${i}`,
      }
    })
  }, [repeat])

  const effectiveDuration = reducedMotion ? 99999 : duration

  return (
    <div
      aria-hidden="true"
      data-testid="login-background-gallery"
      data-version="lbg-v1.0"
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
    >
      {/* Tinte verde radial de fondo */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 30% 50%, rgba(34, 197, 94, 0.12) 0%, transparent 50%), radial-gradient(ellipse at 70% 50%, rgba(34, 197, 94, 0.08) 0%, transparent 50%)',
        }}
      />

      {/* Carril 1: dirección normal (centro) */}
      <div
        className="absolute top-1/2 -translate-y-1/2 left-0"
        style={trackStyle(effectiveDuration, false)}
      >
        {musicians.map((m, i) => {
          const { Component } = m
          return (
            <div key={m.uniqueKey} style={itemStyle((i * 0.15) % 3, tinted, false)}>
              <Component
                className="w-full h-full"
                style={{ color: '#d0e8d0' }}
              />
            </div>
          )
        })}
      </div>

      {/* Carril 2: dirección inversa (parte superior) */}
      <div
        className="absolute top-[15%] left-0 scale-75"
        style={{ ...trackStyle(effectiveDuration * 1.4, true), opacity: 0.55 }}
      >
        {musicians.slice().reverse().map((m, i) => {
          const { Component } = m
          return (
            <div key={`top-${m.uniqueKey}`} style={{ ...itemStyle((i * 0.2) % 4, true, true), width: 140, height: 140 }}>
              <Component
                className="w-full h-full"
                style={{ color: '#b8d8b8' }}
              />
            </div>
          )
        })}
      </div>

      {/* Carril 3: dirección normal (parte inferior) */}
      <div
        className="absolute bottom-[15%] left-0 scale-50"
        style={{ ...trackStyle(effectiveDuration * 1.8, false), opacity: 0.45 }}
      >
        {musicians.map((m, i) => {
          const { Component } = m
          return (
            <div key={`bottom-${m.uniqueKey}`} style={{ ...itemStyle((i * 0.25) % 5, true, true), width: 160, height: 160 }}>
              <Component
                className="w-full h-full"
                style={{ color: '#a8c8a8' }}
              />
            </div>
          )
        })}
      </div>

      {/* Vignette MUY sutil SOLO en esquinas extremas */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 80% at center, transparent 0%, transparent 70%, rgba(10, 10, 10, 0.5) 100%)',
        }}
      />

      {/* Halo verde sutil alrededor del centro (donde está el formulario) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 50% 50% at center, rgba(34, 197, 94, 0.04) 0%, transparent 70%)',
        }}
      />
    </div>
  )
}
