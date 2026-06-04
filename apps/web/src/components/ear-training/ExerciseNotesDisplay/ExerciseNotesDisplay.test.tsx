import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { ExerciseNotesDisplay, getSeparator, formatNotes } from './index'
import type { Exercise } from '@/types/music'

const intervalExercise: Exercise = {
  type: 'interval',
  notes: ['C4', 'E4'],
  answer: 'major_3rd',
  options: [],
  root: 'C4',
}

const triadExercise: Exercise = {
  type: 'triad',
  notes: ['C4', 'E4', 'G4'],
  answer: 'major',
  options: [],
  root: 'C4',
}

const seventhExercise: Exercise = {
  type: 'seventh_chord',
  notes: ['C4', 'E4', 'G4', 'B4'],
  answer: 'maj7',
  options: [],
  root: 'C4',
}

describe('ExerciseNotesDisplay', () => {
  beforeEach(() => {
    document.getElementById('exercise-notes-keyframes')?.remove()
  })

  it('no renderiza nada cuando exercise es null', () => {
    const { container } = renderWithProviders(<ExerciseNotesDisplay exercise={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('renderiza el data-testid esperado con un intervalo', () => {
    const { container } = renderWithProviders(<ExerciseNotesDisplay exercise={intervalExercise} />)
    const el = container.querySelector('[data-testid="exercise-notes-display"]')
    expect(el).toBeInTheDocument()
    expect(el?.getAttribute('data-exercise-type')).toBe('interval')
    expect(el?.getAttribute('data-notes')).toBe('C4 → E4')
  })

  it('muestra las dos notas como pills individuales', () => {
    renderWithProviders(<ExerciseNotesDisplay exercise={intervalExercise} />)
    const pills = screen.getAllByTestId('exercise-notes-pill')
    expect(pills.length).toBe(2)
    expect(pills[0]).toHaveTextContent('C4')
    expect(pills[1]).toHaveTextContent('E4')
  })

  it('usa flecha como separador para 2 notas (interval)', () => {
    const { container } = renderWithProviders(<ExerciseNotesDisplay exercise={intervalExercise} />)
    expect(container.querySelector('.eartraining-note-separator--arrow')).toBeInTheDocument()
  })

  it('usa puntos como separador para 3 notas (triad)', () => {
    const { container } = renderWithProviders(<ExerciseNotesDisplay exercise={triadExercise} />)
    expect(container.querySelector('.eartraining-note-separator--dot')).toBeInTheDocument()
    expect(container.querySelector('.eartraining-note-separator--arrow')).not.toBeInTheDocument()
  })

  it('usa puntos como separador para 4 notas (seventh_chord)', () => {
    const { container } = renderWithProviders(<ExerciseNotesDisplay exercise={seventhExercise} />)
    const dots = container.querySelectorAll('.eartraining-note-separator--dot')
    expect(dots.length).toBe(3) // 3 separadores entre 4 notas
  })

  it('muestra el caption con la cantidad de notas', () => {
    renderWithProviders(<ExerciseNotesDisplay exercise={intervalExercise} />)
    expect(screen.getByText('2 notas')).toBeInTheDocument()
  })

  it('marca la nota activa cuando activeNoteIndex está definido', () => {
    const { container } = renderWithProviders(
      <ExerciseNotesDisplay exercise={intervalExercise} activeNoteIndex={1} />
    )
    const active = container.querySelector('.eartraining-note-pill--active')
    expect(active).toBeInTheDocument()
    expect(active?.getAttribute('data-note')).toBe('E4')
  })

  it('marca las notas pasadas como past cuando activeNoteIndex es 1', () => {
    const { container } = renderWithProviders(
      <ExerciseNotesDisplay exercise={intervalExercise} activeNoteIndex={1} />
    )
    const past = container.querySelector('.eartraining-note-pill--past')
    expect(past).toBeInTheDocument()
    expect(past?.getAttribute('data-note')).toBe('C4')
  })

  it('inyecta los keyframes solo una vez al renderizar múltiples instancias', () => {
    renderWithProviders(<ExerciseNotesDisplay exercise={intervalExercise} />)
    renderWithProviders(<ExerciseNotesDisplay exercise={triadExercise} />)
    const styles = document.querySelectorAll('#exercise-notes-keyframes')
    expect(styles.length).toBe(1)
  })
})

describe('getSeparator / formatNotes (helpers)', () => {
  it('getSeparator devuelve "arrow" para 2 notas', () => {
    expect(getSeparator(2)).toBe('arrow')
  })

  it('getSeparator devuelve "dot" para 3+ notas', () => {
    expect(getSeparator(3)).toBe('dot')
    expect(getSeparator(4)).toBe('dot')
    expect(getSeparator(7)).toBe('dot')
  })

  it('formatNotes con arrow produce formato "C4 → E4"', () => {
    expect(formatNotes(['C4', 'E4'], 'arrow')).toBe('C4 → E4')
  })

  it('formatNotes con dot produce formato "C4 · E4 · G4"', () => {
    expect(formatNotes(['C4', 'E4', 'G4'], 'dot')).toBe('C4 · E4 · G4')
  })
})
