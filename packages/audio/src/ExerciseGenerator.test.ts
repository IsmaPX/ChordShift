import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('tone', () => {
  const mockTone = {
    Frequency: (note: string) => ({
      transpose: (semitones: number) => ({
        toNote: () => {
          const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4']
          const idx = notes.indexOf(note)
          if (idx === -1) return note
          const targetIdx = Math.min(Math.max(idx + semitones / 2, 0), notes.length - 1)
          return notes[targetIdx]
        },
      }),
    }),
  }
  return { default: mockTone, ...mockTone }
})

import {
  generateIntervalExercise,
  generateTriadExercise,
  generateSeventhChordExercise,
  generateExercise,
  getIntervalDisplayName,
  getTriadDisplayName,
  getSeventhDisplayName,
} from './ExerciseGenerator'

beforeEach(() => {
  vi.spyOn(globalThis.Math, 'random').mockRestore()
})

describe('getIntervalDisplayName', () => {
  it('returns Spanish name for known interval keys', () => {
    expect(getIntervalDisplayName('major_2nd')).toBe('2da M')
    expect(getIntervalDisplayName('perfect_5th')).toBe('5ta J')
    expect(getIntervalDisplayName('octave')).toBe('8va')
  })

  it('returns the key itself for unknown keys', () => {
    expect(getIntervalDisplayName('unknown')).toBe('unknown')
  })
})

describe('getTriadDisplayName', () => {
  it('returns Spanish name for known triad qualities', () => {
    expect(getTriadDisplayName('major')).toBe('Mayor')
    expect(getTriadDisplayName('minor')).toBe('Menor')
    expect(getTriadDisplayName('diminished')).toBe('Disminuida')
    expect(getTriadDisplayName('augmented')).toBe('Aumentada')
  })

  it('returns the key itself for unknown qualities', () => {
    expect(getTriadDisplayName('unknown')).toBe('unknown')
  })
})

describe('getSeventhDisplayName', () => {
  it('returns Spanish name for known seventh qualities', () => {
    expect(getSeventhDisplayName('maj7')).toBe('Maj7')
    expect(getSeventhDisplayName('m7')).toBe('m7')
    expect(getSeventhDisplayName('7')).toBe('7dom')
    expect(getSeventhDisplayName('m7b5')).toBe('m7b5')
  })

  it('returns the key itself for unknown qualities', () => {
    expect(getSeventhDisplayName('unknown')).toBe('unknown')
  })
})

describe('generateIntervalExercise', () => {
  it('returns an Exercise with type "interval"', () => {
    vi.spyOn(globalThis.Math, 'random').mockReturnValue(0)
    const exercise = generateIntervalExercise()
    expect(exercise).toHaveProperty('type', 'interval')
    expect(exercise).toHaveProperty('notes')
    expect(exercise).toHaveProperty('answer')
    expect(exercise).toHaveProperty('options')
    expect(exercise.notes).toHaveLength(2)
    expect(exercise.options).toEqual(
      expect.arrayContaining(['major_2nd', 'minor_3rd', 'major_3rd', 'perfect_4th', 'perfect_5th', 'major_6th', 'minor_7th', 'octave'])
    )
    expect(exercise.options).toContain(exercise.answer)
  })
})

describe('generateTriadExercise', () => {
  it('returns an Exercise with type "triad"', () => {
    vi.spyOn(globalThis.Math, 'random').mockReturnValue(0)
    const exercise = generateTriadExercise()
    expect(exercise).toHaveProperty('type', 'triad')
    expect(exercise.notes).toHaveLength(3)
    expect(exercise.options).toEqual(['major', 'minor', 'diminished', 'augmented'])
    expect(exercise.options).toContain(exercise.answer)
  })
})

describe('generateSeventhChordExercise', () => {
  it('returns an Exercise with type "seventh_chord"', () => {
    vi.spyOn(globalThis.Math, 'random').mockReturnValue(0)
    const exercise = generateSeventhChordExercise()
    expect(exercise).toHaveProperty('type', 'seventh_chord')
    expect(exercise.notes).toHaveLength(4)
    expect(exercise.options).toEqual(['maj7', 'm7', '7', 'm7b5'])
    expect(exercise.options).toContain(exercise.answer)
  })
})

describe('generateExercise', () => {
  it('dispatches to the correct generator by type', () => {
    vi.spyOn(globalThis.Math, 'random').mockReturnValue(0)
    expect(generateExercise('interval')).toHaveProperty('type', 'interval')
    expect(generateExercise('triad')).toHaveProperty('type', 'triad')
    expect(generateExercise('seventh_chord')).toHaveProperty('type', 'seventh_chord')
  })
})
