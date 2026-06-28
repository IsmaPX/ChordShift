/**
 * Utilidades de conversión entre nombres de nota (e.g. "C4") y posición
 * vertical en el pentagrama musical.
 *
 * Sistema de coordenadas del pentagrama (convención interna):
 *  - La línea inferior del pentagrama en clave de sol (E4) está en posición 0.
 *  - Cada espacio entre líneas representa +0.5 unidades (media línea).
 *  - Cada línea +1.0 unidades (E4 → G4 → B4 → D5 → F5 son las 5 líneas).
 *  - Para soportar notas fuera del pentagrama se usan posiciones negativas
 *    (debajo) o mayores a 4 (encima):
 *      · E4 (línea inf.)   = 0
 *      · F4 (espacio)      = 0.5
 *      · G4 (línea)        = 1
 *      · B4 (línea media)  = 2
 *      · D5 (línea)        = 3
 *      · F5 (línea sup.)   = 4
 *      · G5 (espacio sup.) = 4.5
 *      · A5                = 5
 *      · C6 (ledger)       = 6
 *      · D4 (espacio inf.) = -0.5
 *      · C4 (ledger inf.)  = -1
 *      · B3                = -1.5
 *      · A3                = -2
 *
 * Solo se modelan notas diatónicas (sin sostenidos/bs) porque la trompeta
 * muestra un único tono fundamental por acorde. Notas alteradas (e.g. F#4)
 * se mapean a su enhármono natural para mantener la legibilidad visual.
 */

const NOTE_TO_SEMITONE: Record<string, number> = {
  C: 0, 'C#': 1, Db: 1,
  D: 2, 'D#': 3, Eb: 3,
  E: 4, Fb: 4,
  F: 5, 'F#': 6, Gb: 6,
  G: 7, 'G#': 8, Ab: 8,
  A: 9, 'A#': 10, Bb: 10,
  B: 11, Cb: 11,
}

/**
 * Step diatónico de cada nota natural dentro de una octava.
 * C = 0, D = 1, E = 2, F = 3, G = 4, A = 5, B = 6.
 * Notas con alteración (#/b) se mapean a su equivalente natural.
 */
const NOTE_TO_STEP: Record<string, number> = {
  C: 0, 'C#': 0, Db: 0,
  D: 1, 'D#': 1, Eb: 1,
  E: 2, Fb: 2,
  F: 3, 'F#': 3, Gb: 3,
  G: 4, 'G#': 4, Ab: 4,
  A: 5, 'A#': 5, Bb: 5,
  B: 6, Cb: 6,
}

const REFERENCE_OCTAVE = 4
const REFERENCE_STEP = 2 // E

/** Convierte un nombre de nota tipo "C4" en un índice MIDI (C-1 = 0). */
export function noteToMidi(note: string): number | null {
  const match = /^([A-G][#b]?)(-?\d+)$/.exec(note.trim())
  if (!match) return null
  const [, name, octaveStr] = match
  const semitone = NOTE_TO_SEMITONE[name]
  if (semitone === undefined) return null
  const octave = parseInt(octaveStr, 10)
  return (octave + 1) * 12 + semitone
}

/** Inverso de `noteToMidi`. */
export function midiToNoteName(midi: number): string {
  const semitone = ((midi % 12) + 12) % 12
  const octave = Math.floor(midi / 12) - 1
  const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  return `${names[semitone]}${octave}`
}

/**
 * Devuelve la posición vertical del pentagrama para un nombre de nota tipo "C4".
 * Devuelve `null` si el nombre no es reconocible.
 *
 * Convención: E4 = 0 (línea inferior), F5 = 4 (línea superior). Cada unidad
 * representa un step diatónico (media línea). Posiciones negativas están
 * por debajo del pentagrama (con ledger lines), > 4 por encima.
 */
export function noteToStaffPosition(note: string): number | null {
  const match = /^([A-G][#b]?)(-?\d+)$/.exec(note.trim())
  if (!match) return null
  const [, name, octaveStr] = match
  const step = NOTE_TO_STEP[name]
  if (step === undefined) return null
  const octave = parseInt(octaveStr, 10)

  // Distancia diatónica desde E4 en steps (positiva = nota más aguda).
  const totalStepsFromE4 = (octave - REFERENCE_OCTAVE) * 7 + (step - REFERENCE_STEP)

  // Cada step = 0.5 unidades de pentagrama.
  return totalStepsFromE4 * 0.5
}

/**
 * Indica si la nota cae fuera del pentagrama (necesita ledger lines).
 * Devuelve la cantidad de ledger lines a dibujar (0 si la nota está sobre
 * una línea o espacio del pentagrama 0-4).
 */
export function ledgerLinesCount(position: number): number {
  if (position < 0) {
    // Cada ledger line está separada por 1 unidad completa de pentagrama
    // (2 steps diatónicos). C4 (pos -1) → 1 línea. A3 (pos -2) → 2 líneas.
    return Math.floor(-position)
  }
  if (position > 4) {
    // G5 (pos 4.5) → 0 líneas adicionales (espacio superior, no necesita).
    // A5 (pos 5) → 1 línea. C6 (pos 6) → 2 líneas.
    return Math.floor(position - 4)
  }
  return 0
}

/**
 * Transpone una nota una octava arriba (e.g. "C3" → "C4"). Devuelve la
 * nota original si no se puede parsear. Se usa para display de trompeta
 * porque `chordPlayer.getChordNotes('C', 'trumpet')` devuelve "C3" (la
 * fundamental en octava 3), que cae muy por debajo del pentagrama.
 * Transponer a la 4ª octava la deja en una posición legible.
 */
export function transposeOctaveUp(note: string): string | null {
  const match = /^([A-G][#b]?)(-?\d+)$/.exec(note.trim())
  if (!match) return null
  const [, name, octaveStr] = match
  return `${name}${parseInt(octaveStr, 10) + 1}`
}

import type { VoiceType } from './types'
import type { InstrumentName } from '@/types/music'

export function classifyVoiceType(noteName?: string): VoiceType {
  if (!noteName) return 'chord'
  const match = /^([A-G][#b]?)(-?\d+)$/.exec(noteName.trim())
  if (!match) return 'chord'
  const octave = parseInt(match[2], 10)
  if (octave < 4) return 'bass'
  if (octave >= 5) return 'melody'
  return 'chord'
}

export function classifyVoiceByPosition(position: number): VoiceType {
  if (position < 1.5) return 'bass'
  if (position < 2.5) return 'melody'
  return 'chord'
}

/**
 * Lógica Anti-Vacío: Genera notas del acorde dinámicamente
 * si un instrumento no tiene notas predefinidas para el acorde.
 */
export function getFallbackNotesForChord(chordName: string, instrument: InstrumentName): string[] {
  // Limpiar el acorde para extraer la fundamental (ej: D/F# -> D, Am7 -> Am, Csus4 -> Csus4)
  const baseChord = chordName.split('/')[0].trim()
  const match = /^([A-G][#b]?)(.*)$/.exec(baseChord)
  if (!match) {
    // Si no es parseable, default a Do mayor
    return instrument === 'bass' ? ['C3'] : ['C4', 'E4', 'G4']
  }

  const root = match[1]
  const suffix = match[2]

  // Determinar la octava adecuada según el instrumento
  let defaultOctave = 4
  if (instrument === 'bass') defaultOctave = 2
  else if (instrument === 'guitar') defaultOctave = 3
  else if (instrument === 'flute' || instrument === 'violin') defaultOctave = 5

  // Notas diatónicas ordenadas para buscar terceras/quintas
  const notesOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const rootIndex = notesOrder.indexOf(root)

  if (rootIndex === -1) {
    return [`${root}${defaultOctave}`]
  }

  // Si es bajo, solo mostramos la fundamental
  if (instrument === 'bass') {
    return [`${root}${defaultOctave}`]
  }

  // Si es trompeta, solo mostramos la fundamental transportada a una zona cómoda
  if (instrument === 'trumpet') {
    return [`${root}4`]
  }

  // Batería usa mapeos fijos de percusión
  if (instrument === 'drums') {
    return ['C4', 'E4', 'G4'] // Mapeado a bombo/caja/hi-hat en StaffDrums
  }

  // Generar tercera y quinta según el sufijo
  let thirdOffset = 4 // Mayor por defecto
  let fifthOffset = 7

  if (suffix.includes('m') && !suffix.includes('maj')) {
    thirdOffset = 3 // Menor
  }
  if (suffix.includes('dim')) {
    thirdOffset = 3
    fifthOffset = 6 // Disminuida
  }
  if (suffix.includes('aug')) {
    fifthOffset = 8 // Aumentada
  }
  if (suffix.includes('sus2')) {
    thirdOffset = 2
  }
  if (suffix.includes('sus4') || suffix.includes('sus')) {
    thirdOffset = 5
  }

  const getNoteNameWithOctave = (offset: number): string => {
    const idx = (rootIndex + offset) % 12
    const octaveOffset = Math.floor((rootIndex + offset) / 12)
    return `${notesOrder[idx]}${defaultOctave + octaveOffset}`
  }

  const notes = [
    `${root}${defaultOctave}`,
    getNoteNameWithOctave(thirdOffset),
    getNoteNameWithOctave(fifthOffset),
  ]

  // Si es de viento/melódico (flauta, violín), preferimos solo 1 o 2 notas para no saturar
  if (instrument === 'flute' || instrument === 'violin') {
    return [notes[0], notes[2]]
  }

  // Si es guitarra o piano, mostramos el acorde completo de 3 notas
  return notes
}

