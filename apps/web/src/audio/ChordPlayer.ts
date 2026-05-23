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
  'Am': ['A3', 'E4', 'A4', 'C5'],
  'A7': ['A3', 'E4', 'G4', 'C#5'],
  'B': ['B3', 'F#4', 'B4', 'D#5'],
  'B7': ['B3', 'D#4', 'F#4', 'A4'],
  'Bm': ['B3', 'F#4', 'B4', 'D5'],
  'C': ['C3', 'E3', 'G3', 'C4', 'E4'],
  'C7': ['C3', 'E3', 'G3', 'Bb3', 'C4'],
  'D': ['D3', 'F#3', 'A3', 'D4'],
  'Dm': ['D3', 'F3', 'A3', 'D4'],
  'D7': ['D3', 'F#3', 'A3', 'C4', 'D4'],
  'E': ['E3', 'B3', 'E4', 'G#4'],
  'E7': ['E3', 'B3', 'D4', 'G#4'],
  'Em': ['E3', 'B3', 'E4', 'G4'],
  'F': ['F3', 'A3', 'C4', 'F4'],
  'Fm': ['F3', 'Ab3', 'C4', 'F4'],
  'G': ['G3', 'B3', 'D4', 'G4'],
  'G7': ['G3', 'B3', 'D4', 'F4', 'G4'],
  'Gm': ['G3', 'Bb3', 'D4', 'G4'],
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
