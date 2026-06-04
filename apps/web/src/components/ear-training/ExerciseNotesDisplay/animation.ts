/**
 * Animaciones para ExerciseNotesDisplay.
 *
 * El componente es estático por diseño (muestra las notas, no las anima
 * por sí solo). El padre controla la sincronización pasando
 * `activeNoteIndex`. Este módulo define los keyframes que las CSS
 * utilities referencian.
 */

export const EXERCISE_NOTES_KEYFRAMES_ID = 'exercise-notes-keyframes'

export const exerciseNotesKeyframes = `
@keyframes eartraining-note-pulse {
  0%, 100% { transform: scale(1);    box-shadow: 0 0 8px rgba(250, 204, 21, 0.5); }
  50%      { transform: scale(1.08); box-shadow: 0 0 16px rgba(250, 204, 21, 0.9); }
}
`

/** Inyecta los keyframes una sola vez (idempotente, SSR-safe). */
export function ensureExerciseNotesKeyframes(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(EXERCISE_NOTES_KEYFRAMES_ID)) return
  const style = document.createElement('style')
  style.id = EXERCISE_NOTES_KEYFRAMES_ID
  style.textContent = exerciseNotesKeyframes
  document.head.appendChild(style)
}
