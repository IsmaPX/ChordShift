/**
 * Tipos del componente ExerciseNotesDisplay.
 *
 * Muestra las notas de un ejercicio de ear training (interval, triad,
 * seventh_chord) en formato legible: pills individuales separados por
 * flechas (2 notas) o puntos (3+ notas).
 */
import type { Exercise } from '@/types/music'

export interface ExerciseNotesDisplayProps {
  /** Ejercicio actual del cual mostrar las notas. */
  exercise: Exercise | null
  /** Si el ejercicio se está reproduciendo (resalta el contenedor). */
  isPlaying?: boolean
  /** Índice de la nota que está sonando AHORA (null = ninguna / todas a la vez). */
  activeNoteIndex?: number | null
  /** Clase CSS adicional para el contenedor. */
  className?: string
}

export type NoteSeparator = 'arrow' | 'dot'

/** Determina el separador a usar según la cantidad de notas. */
export function getSeparator(notesCount: number): NoteSeparator {
  return notesCount === 2 ? 'arrow' : 'dot'
}

/** Formatea la lista de notas como string. */
export function formatNotes(notes: string[], separator: NoteSeparator): string {
  return notes.join(separator === 'arrow' ? ' → ' : ' · ')
}
