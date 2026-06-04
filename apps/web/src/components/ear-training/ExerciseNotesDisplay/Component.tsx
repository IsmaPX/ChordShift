/**
 * ExerciseNotesDisplay — Muestra las notas de un ejercicio de ear training.
 *
 * Formato:
 *  - 2 notas (interval):    [C4]  →  [E4]
 *  - 3 notas (triad):       [C4]  ·  [E4]  ·  [G4]
 *  - 4+ notas (seventh):    [C4]  ·  [E4]  ·  [G4]  ·  [B4]
 *
 * Si el padre pasa `activeNoteIndex`, la nota en ese índice se resalta
 * con glow amarillo para sincronizar con la reproducción.
 *
 * Si no hay ejercicio, retorna null (no muestra nada en idle).
 */
import { useEffect } from 'react'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ensureExerciseNotesKeyframes } from './animation'
import { getSeparator, formatNotes, type ExerciseNotesDisplayProps } from './types'

export function ExerciseNotesDisplay({
  exercise,
  isPlaying = false,
  activeNoteIndex = null,
  className,
}: ExerciseNotesDisplayProps) {
  useEffect(() => {
    ensureExerciseNotesKeyframes()
  }, [])

  if (!exercise) return null

  const { notes, type } = exercise
  const separator = getSeparator(notes.length)
  const label = formatNotes(notes, separator)

  return (
    <div
      data-testid="exercise-notes-display"
      data-exercise-type={type}
      data-notes={label}
      data-active-index={activeNoteIndex ?? 'none'}
      data-is-playing={isPlaying ? 'true' : 'false'}
      className={cn('eartraining-notes', className)}
      role="group"
      aria-label={`Notas del ejercicio: ${label}`}
    >
      <div className="eartraining-notes-track">
        {notes.map((note, idx) => {
          const isActive = activeNoteIndex === idx
          const isPast =
            activeNoteIndex !== null && activeNoteIndex >= 0 && idx < activeNoteIndex
          return (
            <div key={`${note}-${idx}`} className="eartraining-notes-item">
              <span
                className={cn(
                  'eartraining-note-pill',
                  isActive && 'eartraining-note-pill--active',
                  isPast && 'eartraining-note-pill--past'
                )}
                data-testid="exercise-notes-pill"
                data-note={note}
                data-active={isActive ? 'true' : 'false'}
              >
                {note}
              </span>
              {idx < notes.length - 1 && (
                separator === 'arrow' ? (
                  <ArrowRight
                    className="eartraining-note-separator eartraining-note-separator--arrow"
                    size={20}
                    aria-hidden="true"
                  />
                ) : (
                  <span
                    className="eartraining-note-separator eartraining-note-separator--dot"
                    aria-hidden="true"
                  >
                    ·
                  </span>
                )
              )}
            </div>
          )
        })}
      </div>
      <span className="eartraining-notes-caption">
        {type === 'interval' && '2 notas'}
        {type === 'triad' && '3 notas'}
        {type === 'seventh_chord' && '4 notas'}
      </span>
    </div>
  )
}
