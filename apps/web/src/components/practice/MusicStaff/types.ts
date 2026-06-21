/**
 * Tipos del componente MusicStaff.
 *
 * Renderiza un pentagrama musical con la línea amarilla de progreso
 * que marca el tiempo de la canción.
 *
 * El pentagrama se adapta al instrumento seleccionado:
 *  - `piano` | `guitar` (default): muestra el símbolo del acorde (e.g. "C")
 *    posicionado con un hash determinístico sobre 5 líneas verdes.
 *  - `trumpet`: muestra la fundamental del acorde posicionada por su
 *    pitch real en el pentagrama (Do4, Re4, ...), con líneas adicionales
 *    (ledger lines) automáticas para notas fuera del rango, e indicador
 *    de válvulas (1/2/3) en la nota activa.
 *  - `violin` | `flute`: muestra las notas del acorde por pitch real
 *    en el pentagrama, con ledger lines automáticas. Para `flute` se
 *    añade un diagrama de agujeros debajo del pentagrama.
 *  - `harmonica`: muestra la tablatura visual de agujeros (no pentagrama).
 */
import type { Section, Chord, InstrumentName } from '@/types/music'

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
  /**
   * Instrumento activo. Cuando es `trumpet`, el pentagrama se renderiza
   * adaptado a trompeta (notas individuales por pitch + válvulas).
   * Default: `'piano'`.
   */
  instrument?: InstrumentName
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
  /** Posición horizontal en % del ancho total. */
  position: number
  /**
   * Posición vertical en el pentagrama. En modo piano/guitar se mantiene
   * en el rango 0–4 (líneas 0=arriba a 4=abajo). En modo trompeta se
   * extiende fuera de ese rango (e.g. -1 = Do4 con ledger line inferior,
   * 4.5 = Sol5, 6 = Do6) para representar el pitch real de la nota.
   */
  line: number
  /** Si es el acorde actualmente sonando. */
  isCurrent: boolean
  /** Si la nota está siendo iluminada por el cursor de tiempo. */
  isIlluminated?: boolean
  /** Nombre de la nota (e.g. "C4"), solo en ciertos instrumentos. */
  noteName?: string
  /** Indicación de válvulas (e.g. "○ ● ●"), solo en modo trompeta. */
  valves?: string
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

export type VoiceType = 'melody' | 'bass' | 'chord' | 'left-hand' | 'right-hand'

export interface VoiceConfig {
  color: string
  glowColor: string
  labelColor: string
  borderColor: string
}

export const VOICE_COLORS: Record<VoiceType, VoiceConfig> = {
  melody: {
    color: '#f472b6',
    glowColor: 'rgba(244, 114, 182, 0.8)',
    labelColor: '#fce7f3',
    borderColor: 'rgba(244, 114, 182, 0.6)',
  },
  bass: {
    color: '#60a5fa',
    glowColor: 'rgba(96, 165, 250, 0.8)',
    labelColor: '#dbeafe',
    borderColor: 'rgba(96, 165, 250, 0.6)',
  },
  chord: {
    color: '#a78bfa',
    glowColor: 'rgba(167, 139, 250, 0.8)',
    labelColor: '#ede9fe',
    borderColor: 'rgba(167, 139, 250, 0.6)',
  },
  'left-hand': {
    color: '#34d399',
    glowColor: 'rgba(52, 211, 153, 0.8)',
    labelColor: '#d1fae5',
    borderColor: 'rgba(52, 211, 153, 0.6)',
  },
  'right-hand': {
    color: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.8)',
    labelColor: '#fef3c7',
    borderColor: 'rgba(251, 191, 36, 0.6)',
  },
}
