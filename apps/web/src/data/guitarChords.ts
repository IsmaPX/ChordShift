export interface GuitarChordDiagram {
  frets: number[]
  fingers: number[]
  barres?: { fret: number; from: number; to: number }[]
  position?: number
}

export const GUITAR_CHORD_DIAGRAMS: Record<string, GuitarChordDiagram> = {
  'A': { frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0] },
  'Am': { frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0] },
  'A7': { frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 1, 0, 2, 0] },
  'B': { frets: [-1, 2, 4, 4, 4, 2], fingers: [0, 1, 2, 3, 4, 1], barres: [{ fret: 2, from: 1, to: 5 }] },
  'B7': { frets: [-1, 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4] },
  'Bm': { frets: [-1, 2, 4, 4, 3, 2], fingers: [0, 1, 3, 4, 2, 1], barres: [{ fret: 2, from: 1, to: 5 }] },
  'C': { frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
  'C7': { frets: [-1, 3, 2, 3, 1, 0], fingers: [0, 2, 1, 3, 1, 0], barres: [{ fret: 1, from: 4, to: 4 }] },
  'D': { frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2] },
  'Dm': { frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1] },
  'D7': { frets: [-1, -1, 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3] },
  'E': { frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0] },
  'E7': { frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0] },
  'Em': { frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0] },
  'F': { frets: [1, 1, 2, 3, 3, 1], fingers: [1, 1, 2, 3, 4, 1], barres: [{ fret: 1, from: 1, to: 6 }] },
  'F#m': { frets: [2, 2, 4, 4, 3, 2], fingers: [1, 1, 3, 4, 2, 1], barres: [{ fret: 2, from: 1, to: 6 }] },
  'Fm': { frets: [1, 1, 3, 3, 2, 1], fingers: [1, 1, 3, 4, 2, 1], barres: [{ fret: 1, from: 1, to: 6 }] },
  'G': { frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3] },
  'G7': { frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1] },
  'Gm': { frets: [3, 3, 3, 5, 4, 3], fingers: [1, 1, 1, 3, 2, 1], barres: [{ fret: 3, from: 1, to: 6 }] },
  'C#dim': { frets: [-1, 4, 3, 4, 3, -1], fingers: [0, 2, 1, 3, 1, 0], barres: [{ fret: 3, from: 2, to: 4 }] },
  'Bb': { frets: [1, 1, 3, 3, 3, 1], fingers: [1, 1, 2, 3, 4, 1], barres: [{ fret: 1, from: 1, to: 6 }] },
  'Eb': { frets: [-1, 6, 5, 3, 4, 3], fingers: [0, 3, 2, 1, 1, 1], barres: [{ fret: 3, from: 4, to: 6 }] },
  'Ab': { frets: [4, 3, 2, 4, 4, 4], fingers: [2, 1, 0, 3, 3, 3], barres: [{ fret: 4, from: 4, to: 6 }] },
}
