import * as Tone from 'tone'
import type { Exercise } from '@/types/music'

const ROOTS = ['C4', 'C#4', 'D4', 'Eb4', 'E4', 'F4', 'F#4', 'G4', 'Ab4', 'A4', 'Bb4', 'B4']

const INTERVALS: Record<string, number> = {
  'minor_2nd': 1,
  'major_2nd': 2,
  'minor_3rd': 3,
  'major_3rd': 4,
  'perfect_4th': 5,
  'tritone': 6,
  'perfect_5th': 7,
  'minor_6th': 8,
  'major_6th': 9,
  'minor_7th': 10,
  'major_7th': 11,
  'octave': 12,
}

const TRIAD_QUALITIES = ['major', 'minor', 'diminished', 'augmented']

const SEVENTH_QUALITIES = ['maj7', 'm7', '7', 'm7b5']

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
    root,
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
    root,
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
    root,
  }
}

export function generateExercise(type: 'interval' | 'triad' | 'seventh_chord'): Exercise {
  switch (type) {
    case 'interval':
      return generateIntervalExercise()
    case 'triad':
      return generateTriadExercise()
    case 'seventh_chord':
      return generateSeventhChordExercise()
  }
}

export const INTERVAL_KEYS: Record<string, string> = {
  'minor_2nd': 'interval.minor_2nd',
  'major_2nd': 'interval.major_2nd',
  'minor_3rd': 'interval.minor_3rd',
  'major_3rd': 'interval.major_3rd',
  'perfect_4th': 'interval.perfect_4th',
  'tritone': 'interval.tritone',
  'perfect_5th': 'interval.perfect_5th',
  'minor_6th': 'interval.minor_6th',
  'major_6th': 'interval.major_6th',
  'minor_7th': 'interval.minor_7th',
  'major_7th': 'interval.major_7th',
  'octave': 'interval.octave',
}

export const TRIAD_KEYS: Record<string, string> = {
  'major': 'triad.major',
  'minor': 'triad.minor',
  'diminished': 'triad.diminished',
  'augmented': 'triad.augmented',
}

export const SEVENTH_KEYS: Record<string, string> = {
  'maj7': 'seventh.maj7',
  'm7': 'seventh.m7',
  '7': 'seventh.7',
  'm7b5': 'seventh.m7b5',
}

export function getIntervalDisplayName(answer: string): string {
  return INTERVAL_KEYS[answer] || answer
}

export function getTriadDisplayName(answer: string): string {
  return TRIAD_KEYS[answer] || answer
}

export function getSeventhDisplayName(answer: string): string {
  return SEVENTH_KEYS[answer] || answer
}