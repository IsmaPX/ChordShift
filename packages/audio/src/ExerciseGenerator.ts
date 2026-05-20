import * as Tone from 'tone'
import type { Exercise, ExerciseType } from './types'

const ROOTS = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4']

const INTERVALS: Record<string, number> = {
  'major_2nd': 2,
  'minor_3rd': 3,
  'major_3rd': 4,
  'perfect_4th': 5,
  'perfect_5th': 7,
  'major_6th': 9,
  'minor_7th': 10,
  'octave': 12,
}

const INTERVAL_NAMES: Record<string, string> = {
  'major_2nd': '2da M',
  'minor_3rd': '3ra m',
  'major_3rd': '3ra M',
  'perfect_4th': '4ta J',
  'perfect_5th': '5ta J',
  'major_6th': '6ta M',
  'minor_7th': '7ma m',
  'octave': '8va',
}

const TRIAD_QUALITIES = ['major', 'minor', 'diminished', 'augmented']
const TRIAD_NAMES = ['Mayor', 'Menor', 'Disminuida', 'Aumentada']

const SEVENTH_QUALITIES = ['maj7', 'm7', '7', 'm7b5']
const SEVENTH_NAMES = ['Maj7', 'm7', '7dom', 'm7b5']

const TRIAD_INTERVALS: Record<string, number[]> = {
  'major': [0, 4, 7],
  'minor': [0, 3, 7],
  'diminished': [0, 3, 6],
  'augmented': [0, 4, 8],
}

const SEVENTH_INTERVALS: Record<string, number[]> = {
  'maj7': [0, 4, 7, 11],
  'm7': [0, 3, 7, 10],
  '7': [0, 4, 7, 10],
  'm7b5': [0, 3, 6, 10],
}

export function generateIntervalExercise(): Exercise {
  const root = ROOTS[Math.floor(Math.random() * ROOTS.length)]
  const intervalEntries = Object.entries(INTERVALS)
  const [name, semitones] = intervalEntries[
    Math.floor(Math.random() * intervalEntries.length)
  ]

  const upper = Tone.Frequency(root).transpose(semitones).toNote()

  return {
    type: 'interval',
    notes: [root, upper],
    answer: name,
    options: Object.keys(INTERVALS),
  }
}

export function generateTriadExercise(): Exercise {
  const root = ROOTS[Math.floor(Math.random() * ROOTS.length)]
  const qualityIndex = Math.floor(Math.random() * TRIAD_QUALITIES.length)
  const quality = TRIAD_QUALITIES[qualityIndex]
  const intervals = TRIAD_INTERVALS[quality]

  const notes = intervals.map((semitones) =>
    Tone.Frequency(root).transpose(semitones).toNote()
  )

  return {
    type: 'triad',
    notes,
    answer: quality,
    options: TRIAD_QUALITIES,
  }
}

export function generateSeventhChordExercise(): Exercise {
  const root = ROOTS[Math.floor(Math.random() * ROOTS.length)]
  const qualityIndex = Math.floor(Math.random() * SEVENTH_QUALITIES.length)
  const quality = SEVENTH_QUALITIES[qualityIndex]
  const intervals = SEVENTH_INTERVALS[quality]

  const notes = intervals.map((semitones) =>
    Tone.Frequency(root).transpose(semitones).toNote()
  )

  return {
    type: 'seventh_chord',
    notes,
    answer: quality,
    options: SEVENTH_QUALITIES,
  }
}

export function generateExercise(type: ExerciseType): Exercise {
  switch (type) {
    case 'interval':
      return generateIntervalExercise()
    case 'triad':
      return generateTriadExercise()
    case 'seventh_chord':
      return generateSeventhChordExercise()
  }
}

export function getIntervalDisplayName(answer: string): string {
  return INTERVAL_NAMES[answer] || answer
}

export function getTriadDisplayName(answer: string): string {
  const index = TRIAD_QUALITIES.indexOf(answer)
  return index >= 0 ? TRIAD_NAMES[index] : answer
}

export function getSeventhDisplayName(answer: string): string {
  const index = SEVENTH_QUALITIES.indexOf(answer)
  return index >= 0 ? SEVENTH_NAMES[index] : answer
}