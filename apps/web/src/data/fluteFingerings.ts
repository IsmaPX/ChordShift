export interface FluteFingering {
  holes: string
  written: string
  sounding: string
}

export const FLUTE_FINGERINGS: Record<string, FluteFingering> = {
  D4: { holes: 'XXO XO', written: 'D4', sounding: 'D4' },
  Eb4: { holes: 'XX OO', written: 'Eb4', sounding: 'Eb4' },
  E4: { holes: 'XX OO', written: 'E4', sounding: 'E4' },
  F4: { holes: 'XOO OO', written: 'F4', sounding: 'F4' },
  'F#4': { holes: 'OXO OO', written: 'F#4', sounding: 'F#4' },
  G4: { holes: 'OOX OO', written: 'G4', sounding: 'G4' },
  'G#4': { holes: 'OOO X', written: 'G#4', sounding: 'G#4' },
  A4: { holes: 'OOO O', written: 'A4', sounding: 'A4' },
  Bb4: { holes: 'XOOO O', written: 'Bb4', sounding: 'Bb4' },
  B4: { holes: 'OXOO O', written: 'B4', sounding: 'B4' },
  C5: { holes: 'XXXX X', written: 'C5', sounding: 'C5' },
  Db5: { holes: 'XXX X', written: 'Db5', sounding: 'Db5' },
  D5: { holes: 'XXX O', written: 'D5', sounding: 'D5' },
  Eb5: { holes: 'XX OO', written: 'Eb5', sounding: 'Eb5' },
  E5: { holes: 'XOO OO', written: 'E5', sounding: 'E5' },
  F5: { holes: 'OOXX X', written: 'F5', sounding: 'F5' },
  'F#5': { holes: 'OOX X', written: 'F#5', sounding: 'F#5' },
  G5: { holes: 'OOX O', written: 'G5', sounding: 'G5' },
  'G#5': { holes: 'OOO X', written: 'G#5', sounding: 'G#5' },
  A5: { holes: 'OOO O', written: 'A5', sounding: 'A5' },
  Bb5: { holes: 'XOOO O', written: 'Bb5', sounding: 'Bb5' },
  B5: { holes: 'OXOO O', written: 'B5', sounding: 'B5' },
  C6: { holes: 'XXXX X', written: 'C6', sounding: 'C6' },
  Db6: { holes: 'XXX X', written: 'Db6', sounding: 'Db6' },
  D6: { holes: 'XXX O', written: 'D6', sounding: 'D6' },
  Eb6: { holes: 'XX OO', written: 'Eb6', sounding: 'Eb6' },
  E6: { holes: 'XOO OO', written: 'E6', sounding: 'E6' },
  F6: { holes: 'OOXX X', written: 'F6', sounding: 'F6' },
  'F#6': { holes: 'OOX X', written: 'F#6', sounding: 'F#6' },
  G6: { holes: 'OOX O', written: 'G6', sounding: 'G6' },
  'G#6': { holes: 'OOO X', written: 'G#6', sounding: 'G#6' },
  A6: { holes: 'OOO O', written: 'A6', sounding: 'A6' },
  Bb6: { holes: 'XOOO O', written: 'Bb6', sounding: 'Bb6' },
  B6: { holes: 'OXOO O', written: 'B6', sounding: 'B6' },
  C7: { holes: 'XXXX X', written: 'C7', sounding: 'C7' },
}

export function getFluteFingering(note: string): FluteFingering | null {
  return FLUTE_FINGERINGS[note] || null
}