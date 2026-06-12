import { AudioEngine } from './AudioEngine'
import type { InstrumentName } from '@/types/music'

const CHORD_MAPPINGS: Record<string, string[]> = {
  'A': ['A3', 'C#4', 'E4'],
  'A7': ['A3', 'C#4', 'E4', 'G4'],
  'Ab': ['Ab3', 'C4', 'Eb4'],
  'Am': ['A3', 'C4', 'E4'],
  'Amaj7': ['A3', 'C#4', 'E4', 'G#4'],
  'Am7': ['A3', 'C4', 'E4', 'G4'],
  'B': ['B3', 'D#4', 'F#4'],
  'B7': ['B3', 'D#4', 'F#4', 'A4'],
  'Bb': ['Bb3', 'D4', 'F4'],
  'Bm': ['B3', 'D4', 'F#4'],
  'Bmaj7': ['B3', 'D#4', 'F#4', 'A#4'],
  'Bm7': ['B3', 'D4', 'F#4', 'A4'],
  'C': ['C3', 'E3', 'G3'],
  'C#dim': ['C#4', 'E4', 'G4'],
  'Cm': ['C3', 'Eb3', 'G3'],
  'Cmaj7': ['C3', 'E3', 'G3', 'B3'],
  'Cm7': ['C3', 'Eb3', 'G3', 'Bb3'],
  'C7': ['C3', 'E3', 'G3', 'Bb3'],
  'Cdim': ['C3', 'Eb3', 'Gb3'],
  'Caug': ['C3', 'E3', 'G#3'],
  'Csus2': ['C3', 'D3', 'G3'],
  'Csus4': ['C3', 'F3', 'G3'],
  'D': ['D3', 'F#3', 'A3'],
  'D#dim': ['D#4', 'F#4', 'A4'],
  'Dm': ['D3', 'F3', 'A3'],
  'Dmaj7': ['D3', 'F#3', 'A3', 'C#3'],
  'Dm7': ['D3', 'F3', 'A3', 'C3'],
  'D7': ['D3', 'F#3', 'A3', 'C3'],
  'Ddim': ['D3', 'F3', 'Ab3'],
  'E': ['E3', 'G#3', 'B3'],
  'E7': ['E3', 'G#3', 'B3', 'D3'],
  'Eb': ['Eb3', 'G3', 'Bb3'],
  'Em': ['E3', 'G3', 'B3'],
  'Emaj7': ['E3', 'G#3', 'B3', 'D#3'],
  'Em7': ['E3', 'G3', 'B3', 'D3'],
  'F': ['F3', 'A3', 'C4'],
  'F#m': ['F#3', 'A3', 'C#4'],
  'Fm': ['F3', 'Ab3', 'C4'],
  'Fmaj7': ['F3', 'A3', 'C4', 'E4'],
  'Fm7': ['F3', 'Ab3', 'C4', 'Eb4'],
  'F7': ['F3', 'A3', 'C4', 'Eb4'],
  'G': ['G3', 'B3', 'D4'],
  'G7': ['G3', 'B3', 'D4', 'F4'],
  'Gm': ['G3', 'Bb3', 'D4'],
  'Gmaj7': ['G3', 'B3', 'D4', 'F#4'],
  'Gm7': ['G3', 'Bb3', 'D4', 'F4'],
}

const CHORD_ROOTS: Record<string, string> = {
  'A': 'A3', 'A7': 'A3', 'Ab': 'Ab3', 'Am': 'A3', 'Amaj7': 'A3', 'Am7': 'A3',
  'B': 'B3', 'B7': 'B3', 'Bb': 'Bb3', 'Bm': 'B3', 'Bmaj7': 'B3', 'Bm7': 'B3',
  'C': 'C3', 'C#dim': 'C#3', 'Cm': 'C3', 'Cmaj7': 'C3', 'Cm7': 'C3', 'C7': 'C3',
  'Cdim': 'C3', 'Caug': 'C3', 'Csus2': 'C3', 'Csus4': 'C3',
  'D': 'D3', 'D#dim': 'D#3', 'Dm': 'D3', 'Dmaj7': 'D3', 'Dm7': 'D3', 'D7': 'D3', 'Ddim': 'D3',
  'E': 'E3', 'E7': 'E3', 'Eb': 'Eb3', 'Em': 'E3', 'Emaj7': 'E3', 'Em7': 'E3',
  'F': 'F3', 'F#m': 'F#3', 'Fm': 'F3', 'Fmaj7': 'F3', 'Fm7': 'F3', 'F7': 'F3',
  'G': 'G3', 'G7': 'G3', 'Gm': 'G3', 'Gmaj7': 'G3', 'Gm7': 'G3',
}

const GUITAR_CHORD_VOICINGS: Record<string, string[]> = {
  'A': ['A3', 'E4', 'A4', 'C#5'],
  'A7': ['A3', 'E4', 'G4', 'C#5'],
  'Ab': ['Ab3', 'C4', 'Eb4', 'Ab4'],
  'Am': ['A3', 'E4', 'A4', 'C5'],
  'B': ['B3', 'F#4', 'B4', 'D#5'],
  'B7': ['B3', 'D#4', 'F#4', 'A4'],
  'Bb': ['Bb3', 'D4', 'F4', 'Bb4'],
  'Bm': ['B3', 'F#4', 'B4', 'D5'],
  'C': ['C3', 'E3', 'G3', 'C4', 'E4'],
  'C#dim': ['C#4', 'E4', 'G4', 'C#5'],
  'C7': ['C3', 'E3', 'G3', 'Bb3', 'C4'],
  'D': ['D3', 'F#3', 'A3', 'D4'],
  'D#dim': ['D#4', 'F#4', 'A4', 'D#5'],
  'Dm': ['D3', 'F3', 'A3', 'D4'],
  'D7': ['D3', 'F#3', 'A3', 'C4', 'D4'],
  'E': ['E3', 'B3', 'E4', 'G#4'],
  'E7': ['E3', 'B3', 'D4', 'G#4'],
  'Eb': ['Eb3', 'G3', 'Bb3', 'Eb4'],
  'Em': ['E3', 'B3', 'E4', 'G4'],
  'F': ['F3', 'A3', 'C4', 'F4'],
  'F#m': ['F#3', 'A3', 'C#4', 'F#4'],
  'Fm': ['F3', 'Ab3', 'C4', 'F4'],
  'G': ['G3', 'B3', 'D4', 'G4'],
  'G7': ['G3', 'B3', 'D4', 'F4', 'G4'],
  'Gm': ['G3', 'Bb3', 'D4', 'G4'],
}

const VIOLIN_CHORD_MAPPINGS: Record<string, string[]> = {
  'A': ['A4', 'C#5', 'E5'],
  'A7': ['A4', 'C#5', 'E5', 'G5'],
  'Ab': ['Ab4', 'C5', 'Eb5'],
  'Am': ['A4', 'C5', 'E5'],
  'Amaj7': ['A4', 'C#5', 'E5', 'G#5'],
  'Am7': ['A4', 'C5', 'E5', 'G5'],
  'B': ['B3', 'D#4', 'F#4'],
  'B7': ['B3', 'D#4', 'F#4', 'A4'],
  'Bb': ['Bb3', 'D4', 'F4'],
  'Bm': ['B3', 'D4', 'F#4'],
  'Bmaj7': ['B3', 'D#4', 'F#4', 'A#4'],
  'Bm7': ['B3', 'D4', 'F#4', 'A4'],
  'C': ['C4', 'E4', 'G4'],
  'C#dim': ['C#4', 'E4', 'G4'],
  'Cm': ['C4', 'Eb4', 'G4'],
  'Cmaj7': ['C4', 'E4', 'G4', 'B4'],
  'Cm7': ['C4', 'Eb4', 'G4', 'Bb4'],
  'C7': ['C4', 'E4', 'G4', 'Bb4'],
  'Cdim': ['C4', 'Eb4', 'Gb4'],
  'Caug': ['C4', 'E4', 'G#4'],
  'Csus2': ['C4', 'D4', 'G4'],
  'Csus4': ['C4', 'F4', 'G4'],
  'D': ['D4', 'F#4', 'A4'],
  'D#dim': ['D#4', 'F#4', 'A4'],
  'Dm': ['D4', 'F4', 'A4'],
  'Dmaj7': ['D4', 'F#4', 'A4', 'C#5'],
  'Dm7': ['D4', 'F4', 'A4', 'C5'],
  'D7': ['D4', 'F#4', 'A4', 'C5'],
  'Ddim': ['D4', 'F4', 'Ab4'],
  'E': ['E4', 'G#4', 'B4'],
  'E7': ['E4', 'G#4', 'B4', 'D5'],
  'Eb': ['Eb4', 'G4', 'Bb4'],
  'Em': ['E4', 'G4', 'B4'],
  'Emaj7': ['E4', 'G#4', 'B4', 'D#5'],
  'Em7': ['E4', 'G4', 'B4', 'D5'],
  'F': ['F4', 'A4', 'C5'],
  'F#m': ['F#4', 'A4', 'C#5'],
  'Fm': ['F4', 'Ab4', 'C5'],
  'Fmaj7': ['F4', 'A4', 'C5', 'E5'],
  'Fm7': ['F4', 'Ab4', 'C5', 'Eb5'],
  'F7': ['F4', 'A4', 'C5', 'Eb5'],
  'G': ['G4', 'B4', 'D5'],
  'G7': ['G4', 'B4', 'D5', 'F5'],
  'Gm': ['G4', 'Bb4', 'D5'],
  'Gmaj7': ['G4', 'B4', 'D5', 'F#5'],
  'Gm7': ['G4', 'Bb4', 'D5', 'F5'],
}

const FLUTE_CHORD_MAPPINGS: Record<string, string[]> = {
  'A': ['A4', 'C#5', 'E5'],
  'A7': ['A4', 'C#5', 'E5', 'G5'],
  'Ab': ['Ab4', 'C5', 'Eb5'],
  'Am': ['A4', 'C5', 'E5'],
  'Amaj7': ['A4', 'C#5', 'E5', 'G#5'],
  'Am7': ['A4', 'C5', 'E5', 'G5'],
  'B': ['B4', 'D#5', 'F#5'],
  'B7': ['B4', 'D#5', 'F#5', 'A5'],
  'Bb': ['Bb4', 'D5', 'F5'],
  'Bm': ['B4', 'D5', 'F#5'],
  'Bmaj7': ['B4', 'D#5', 'F#5', 'A#5'],
  'Bm7': ['B4', 'D5', 'F#5', 'A5'],
  'C': ['C5', 'E5', 'G5'],
  'C#dim': ['C#5', 'E5', 'G5'],
  'Cm': ['C5', 'Eb5', 'G5'],
  'Cmaj7': ['C5', 'E5', 'G5', 'B5'],
  'Cm7': ['C5', 'Eb5', 'G5', 'Bb5'],
  'C7': ['C5', 'E5', 'G5', 'Bb5'],
  'Cdim': ['C5', 'Eb5', 'Gb5'],
  'Caug': ['C5', 'E5', 'G#5'],
  'Csus2': ['C5', 'D5', 'G5'],
  'Csus4': ['C5', 'F5', 'G5'],
  'D': ['D5', 'F#5', 'A5'],
  'D#dim': ['D#5', 'F#5', 'A5'],
  'Dm': ['D5', 'F5', 'A5'],
  'Dmaj7': ['D5', 'F#5', 'A5', 'C#6'],
  'Dm7': ['D5', 'F5', 'A5', 'C6'],
  'D7': ['D5', 'F#5', 'A5', 'C6'],
  'Ddim': ['D5', 'F5', 'Ab5'],
  'E': ['E5', 'G#5', 'B5'],
  'E7': ['E5', 'G#5', 'B5', 'D6'],
  'Eb': ['Eb5', 'G5', 'Bb5'],
  'Em': ['E5', 'G5', 'B5'],
  'Emaj7': ['E5', 'G#5', 'B5', 'D#6'],
  'Em7': ['E5', 'G5', 'B5', 'D6'],
  'F': ['F5', 'A5', 'C6'],
  'F#m': ['F#5', 'A5', 'C#6'],
  'Fm': ['F5', 'Ab5', 'C6'],
  'Fmaj7': ['F5', 'A5', 'C6', 'E6'],
  'Fm7': ['F5', 'Ab5', 'C6', 'Eb6'],
  'F7': ['F5', 'A5', 'C6', 'Eb6'],
  'G': ['G5', 'B5', 'D6'],
  'G7': ['G5', 'B5', 'D6', 'F6'],
  'Gm': ['G5', 'Bb5', 'D6'],
  'Gmaj7': ['G5', 'B5', 'D6', 'F#6'],
  'Gm7': ['G5', 'Bb5', 'D6', 'F6'],
}

const NOTE_TO_SEMITONE: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1,
  'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'Fb': 4,
  'F': 5, 'F#': 6, 'Gb': 6,
  'G': 7, 'G#': 8, 'Ab': 8,
  'A': 9, 'A#': 10, 'Bb': 10,
  'B': 11, 'Cb': 11,
}

function noteNameWithoutOctave(note: string): string {
  return note.replace(/\d+$/, '')
}

function semitonesFromRoot(notes: string[]): number[] {
  if (notes.length === 0) return []
  const rootName = noteNameWithoutOctave(notes[0])
  const rootSemitone = NOTE_TO_SEMITONE[rootName] ?? 0
  const semitones = new Set<number>()
  for (const note of notes) {
    const name = noteNameWithoutOctave(note)
    const semitone = (NOTE_TO_SEMITONE[name] ?? 0) - rootSemitone
    semitones.add(((semitone % 12) + 12) % 12)
  }
  return [...semitones].sort((a, b) => a - b)
}

const TRIAD_PATTERNS: Record<string, string> = {
  '0,4,7': '',
  '0,3,7': 'm',
  '0,3,6': 'dim',
  '0,4,8': 'aug',
}

const SEVENTH_PATTERNS: Record<string, string> = {
  '0,3,7,10': 'm7',
  '0,4,7,10': '7',
  '0,4,7,11': 'maj7',
  '0,3,6,10': 'm7b5',
}

export function notesToChordSymbol(notes: string[]): string | null {
  if (notes.length === 2) return null
  const intervals = semitonesFromRoot(notes)
  const key = intervals.join(',')
  const rootName = noteNameWithoutOctave(notes[0])

  if (notes.length === 3) {
    const suffix = TRIAD_PATTERNS[key]
    if (suffix !== undefined) return rootName + suffix
    return null
  }

  if (notes.length === 4) {
    const suffix = SEVENTH_PATTERNS[key]
    if (suffix !== undefined) return rootName + suffix
    return null
  }

  return null
}

export class ChordPlayer {
  private isInitialized = false

  async init(): Promise<void> {
    if (this.isInitialized) return
    await AudioEngine.initialize()
    this.isInitialized = true
  }

  async playChord(chordSymbol: string, duration: number = 1, instrument?: InstrumentName): Promise<void> {
    await this.init()
    const notes = this.getChordNotes(chordSymbol, instrument)
    if (notes) {
      AudioEngine.playChord(notes, duration)
    }
  }

  async playNote(note: string, duration: number = 1): Promise<void> {
    await this.init()
    AudioEngine.playNote(note, duration)
  }

  getChordNotes(chordSymbol: string, instrument?: InstrumentName): string[] | null {
    const normalized = chordSymbol.trim()
    const inst = instrument || AudioEngine.currentInstrument

    if (inst === 'trumpet') {
      const root = CHORD_ROOTS[normalized]
      return root ? [root] : null
    }

    if (inst === 'violin') {
      return VIOLIN_CHORD_MAPPINGS[normalized] || CHORD_MAPPINGS[normalized] || null
    }

    if (inst === 'flute') {
      return FLUTE_CHORD_MAPPINGS[normalized] || CHORD_MAPPINGS[normalized] || null
    }

    if (inst === 'guitar') {
      return GUITAR_CHORD_VOICINGS[normalized] || CHORD_MAPPINGS[normalized] || null
    }

    return CHORD_MAPPINGS[normalized] || null
  }

  async playSequence(chords: string[], bpm: number = 120, instrument?: InstrumentName): Promise<void> {
    await this.init()
    const chordData = chords.map((chord) => ({
      notes: this.getChordNotes(chord, instrument) || [],
      duration: 1,
    }))
    AudioEngine.playChordSequence(chordData, bpm)
  }

  stop(): void {
    AudioEngine.stop()
  }
}

export const chordPlayer = new ChordPlayer()
