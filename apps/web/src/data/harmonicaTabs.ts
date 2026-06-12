export interface HarmonicaTab {
  hole: number
  blow: string | null
  draw: string | null
  bendBlow?: string
  bendDraw?: string
}

export const HARMONICA_DIATONIC_C: HarmonicaTab[] = [
  { hole: 1, blow: 'C5', draw: 'D5', bendDraw: 'Eb5' },
  { hole: 2, blow: 'E5', draw: 'G5', bendBlow: 'F5', bendDraw: 'Ab5' },
  { hole: 3, blow: 'G5', draw: 'B5', bendBlow: 'A5', bendDraw: 'Bb5' },
  { hole: 4, blow: 'C6', draw: 'D6', bendBlow: 'B5', bendDraw: 'Eb6' },
  { hole: 5, blow: 'E6', draw: 'G6', bendBlow: 'D6', bendDraw: 'Ab6' },
  { hole: 6, blow: 'C7', draw: null, bendBlow: 'B6' },
  { hole: 7, blow: 'C7', draw: 'D7', bendBlow: 'B6', bendDraw: 'Eb7' },
  { hole: 8, blow: 'E7', draw: 'G7', bendBlow: 'D7', bendDraw: 'F7' },
  { hole: 9, blow: 'G7', draw: 'B7', bendBlow: 'F7', bendDraw: 'A7' },
  { hole: 10, blow: 'C8', draw: 'D8', bendBlow: 'B7', bendDraw: undefined },
]

export function getHarmonicaTab(note: string): HarmonicaTab | null {
  return HARMONICA_DIATONIC_C.find(t => t.blow === note || t.draw === note) || null
}

export function getHarmonicaHoleNote(hole: number, isBlow: boolean): string | null {
  const tab = HARMONICA_DIATONIC_C.find(t => t.hole === hole)
  if (!tab) return null
  return isBlow ? (tab.blow ?? null) : (tab.draw ?? null)
}