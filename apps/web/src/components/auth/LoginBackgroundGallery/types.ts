import type { ComponentType, SVGProps } from 'react'
import { PianistSVG } from '@/components/illustrations/musicians/PianistSVG'
import { GuitaristSVG } from '@/components/illustrations/musicians/GuitaristSVG'
import { TrumpetSVG } from '@/components/illustrations/musicians/TrumpetSVG'
import { DrummerSVG } from '@/components/illustrations/musicians/DrummerSVG'
import { ViolinistSVG } from '@/components/illustrations/musicians/ViolinistSVG'

/**
 * Tipo de un elemento de la galería.
 * Cada elemento es un SVG original de un músico anime.
 */
export type MusicianIllustration = {
  id: string
  label: string
  Component: ComponentType<SVGProps<SVGSVGElement>>
}

export const MUSICIANS: readonly MusicianIllustration[] = [
  { id: 'pianist', label: 'Pianista', Component: PianistSVG },
  { id: 'guitarist', label: 'Guitarrista', Component: GuitaristSVG },
  { id: 'trumpet', label: 'Trompetista', Component: TrumpetSVG },
  { id: 'drummer', label: 'Baterista', Component: DrummerSVG },
  { id: 'violinist', label: 'Violinista', Component: ViolinistSVG },
] as const

export type LoginBackgroundGalleryProps = {
  /**
   * Cantidad de repeticiones del carrusel.
   * Más repeticiones = más músicos visibles simultáneamente.
   * Default: 3 (≈15 músicos visibles en desktop).
   */
  repeat?: number
  /**
   * Duración en segundos del ciclo completo de traslación.
   * Default: 75s (movimiento lento, contemplativo).
   */
  duration?: number
  /**
   * Si `true`, aplica tinte verde adicional sobre cada imagen.
   * Default: true.
   */
  tinted?: boolean
}
