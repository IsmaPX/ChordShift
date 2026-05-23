export interface TrumpetFingering {
  valves: string
  written: string
  sounding: string
}

export const TRUMPET_FINGERINGS: Record<string, TrumpetFingering> = {
  'C3': { valves: '○ ○ ○', written: 'C3', sounding: 'Bb2' },
  'C#3': { valves: '● ● ●', written: 'C#3', sounding: 'B2' },
  'D3': { valves: '● ● ○', written: 'D3', sounding: 'C3' },
  'Eb3': { valves: '● ○ ○', written: 'Eb3', sounding: 'Db3' },
  'E3': { valves: '○ ○ ○', written: 'E3', sounding: 'D3' },
  'F3': { valves: '● ○ ○', written: 'F3', sounding: 'Eb3' },
  'F#3': { valves: '● ● ○', written: 'F#3', sounding: 'E3' },
  'G3': { valves: '○ ○ ○', written: 'G3', sounding: 'F3' },
  'G#3': { valves: '● ● ●', written: 'G#3', sounding: 'F#3' },
  'A3': { valves: '● ● ○', written: 'A3', sounding: 'G3' },
  'Bb3': { valves: '● ○ ○', written: 'Bb3', sounding: 'Ab3' },
  'B3': { valves: '○ ○ ○', written: 'B3', sounding: 'A3' },
  'C4': { valves: '○ ○ ○', written: 'C4', sounding: 'Bb3' },
  'C#4': { valves: '● ● ●', written: 'C#4', sounding: 'B3' },
  'D4': { valves: '● ● ○', written: 'D4', sounding: 'C4' },
  'Eb4': { valves: '● ○ ○', written: 'Eb4', sounding: 'Db4' },
  'E4': { valves: '○ ○ ○', written: 'E4', sounding: 'D4' },
  'F4': { valves: '● ○ ○', written: 'F4', sounding: 'Eb4' },
  'F#4': { valves: '● ● ○', written: 'F#4', sounding: 'E4' },
  'G4': { valves: '○ ○ ○', written: 'G4', sounding: 'F4' },
  'G#4': { valves: '● ● ●', written: 'G#4', sounding: 'F#4' },
  'A4': { valves: '● ● ○', written: 'A4', sounding: 'G4' },
  'Bb4': { valves: '● ○ ○', written: 'Bb4', sounding: 'Ab4' },
  'B4': { valves: '○ ○ ○', written: 'B4', sounding: 'A4' },
  'C5': { valves: '○ ○ ○', written: 'C5', sounding: 'Bb4' },
}

export function getTrumpetFingering(note: string): TrumpetFingering | null {
  return TRUMPET_FINGERINGS[note] || null
}
