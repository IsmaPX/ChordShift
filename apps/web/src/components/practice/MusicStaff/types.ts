/**
 * Tipos del componente MusicStaff.
 *
 * Renderiza un pentagrama musical con la línea amarilla de progreso
 * que marca el tiempo de la canción.
 */
import type { Section, Chord } from '@/types/music'

export interface MusicStaffProps {
  /** Secciones de la canción con sus acordes. */
  sections: Section[]
  /** Índice de la sección actual (0-based). */
  currentSectionIndex: number
  /** Índice del acorde actual dentro de la sección (0-based). */
  currentChordIndex: number
  /** Si la canción se está reproduciendo. */
  isPlaying: boolean
  /** BPM de la canción (afecta la velocidad de la línea). */
  bpm: number
  /** Versión para forzar re-render del cursor al hacer reset. */
  resetKey?: number
  /** Clase CSS adicional para el contenedor. */
  className?: string
}

export interface BeatMark {
  /** Posición en % del ancho total. */
  position: number
  /** True si es una barra de compás (cada 4 beats). */
  isBar: true
  /** Etiqueta opcional (ej. nombre de sección). */
  label?: string
}

export interface ChordNote {
  chord: Chord
  /** Posición horizontal en % (0–100). */
  position: number
  /** Línea vertical del pentagrama (0–4, donde 0 = arriba). */
  line: number
  /** Si es el acorde actualmente sonando. */
  isCurrent: boolean
}

export interface StaffTimeline {
  /** Duración total en segundos. */
  totalSeconds: number
  /** Duración formateada mm:ss. */
  totalLabel: string
  /** Tiempo actual en segundos (al inicio del chord actual). */
  currentSeconds: number
  /** Tiempo actual formateado mm:ss. */
  currentLabel: string
}
