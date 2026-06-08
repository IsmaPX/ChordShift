import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { MusicStaff } from './Component'
import { noteToStaffPosition, ledgerLinesCount, transposeOctaveUp, noteToMidi } from './pitch'
import type { Section } from '@/types/music'

const sampleSections: Section[] = [
  {
    name: 'Verso',
    chords: [
      { chord: 'C', beat: 0, duration: 2 },
      { chord: 'G', beat: 2, duration: 2 },
      { chord: 'Am', beat: 4, duration: 2 },
      { chord: 'F', beat: 6, duration: 2 },
    ],
  },
  {
    name: 'Coro',
    chords: [
      { chord: 'C', beat: 8, duration: 2 },
      { chord: 'F', beat: 10, duration: 2 },
    ],
  },
]

describe('MusicStaff', () => {
  beforeEach(() => {
    // Limpia cualquier <style> residual de tests previos
    document.getElementById('music-staff-keyframes')?.remove()
  })

  it('se renderiza con el data-testid esperado', () => {
    const { container } = renderWithProviders(
      <MusicStaff
        sections={sampleSections}
        currentSectionIndex={0}
        currentChordIndex={0}
        isPlaying={false}
        bpm={120}
      />
    )
    const el = container.querySelector('[data-testid="music-staff"]')
    expect(el).toBeInTheDocument()
  })

  it('incluye identificador de versión para invalidación de caché', () => {
    const { container } = renderWithProviders(
      <MusicStaff
        sections={sampleSections}
        currentSectionIndex={0}
        currentChordIndex={0}
        isPlaying={false}
        bpm={120}
      />
    )
    const el = container.querySelector('[data-version="music-staff-v1.1"]')
    expect(el).toBeInTheDocument()
  })

  it('es decorativo y no bloquea interacción (pointer-events-none en cursor)', () => {
    const { container } = renderWithProviders(
      <MusicStaff
        sections={sampleSections}
        currentSectionIndex={0}
        currentChordIndex={0}
        isPlaying={false}
        bpm={120}
      />
    )
    const cursor = container.querySelector('.music-staff-cursor')
    expect(cursor).toBeInTheDocument()
  })

  it('muestra el tiempo total formateado mm:ss', () => {
    renderWithProviders(
      <MusicStaff
        sections={sampleSections}
        currentSectionIndex={0}
        currentChordIndex={0}
        isPlaying={false}
        bpm={120}
      />
    )
    // BPM 120, cada chord dura 2 beats = 1s, total 6 chords * 1s = 6s
    expect(screen.getByText('00:06')).toBeInTheDocument()
  })

  it('renderiza al menos un acorde como cabeza de nota', () => {
    const { container } = renderWithProviders(
      <MusicStaff
        sections={sampleSections}
        currentSectionIndex={0}
        currentChordIndex={0}
        isPlaying={false}
        bpm={120}
      />
    )
    const notes = container.querySelectorAll('[data-testid="music-staff-note"]')
    expect(notes.length).toBe(6)
  })

  it('marca como current el acorde que coincide con currentSectionIndex/currentChordIndex', () => {
    const { container } = renderWithProviders(
      <MusicStaff
        sections={sampleSections}
        currentSectionIndex={0}
        currentChordIndex={2}
        isPlaying={false}
        bpm={120}
      />
    )
    const current = container.querySelector('.music-staff-note--current')
    expect(current).toBeInTheDocument()
    expect(current?.getAttribute('data-chord')).toBe('Am')
  })

  it('inyecta los keyframes solo una vez (idempotente)', () => {
    renderWithProviders(
      <MusicStaff
        sections={sampleSections}
        currentSectionIndex={0}
        currentChordIndex={0}
        isPlaying={false}
        bpm={120}
      />
    )
    renderWithProviders(
      <MusicStaff
        sections={sampleSections}
        currentSectionIndex={0}
        currentChordIndex={1}
        isPlaying={true}
        bpm={120}
      />
    )
    const styles = document.querySelectorAll('#music-staff-keyframes')
    expect(styles.length).toBe(1)
  })

  it('no renderiza nada si no hay secciones', () => {
    const { container } = renderWithProviders(
      <MusicStaff
        sections={[]}
        currentSectionIndex={0}
        currentChordIndex={0}
        isPlaying={false}
        bpm={120}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  // ===== Modo trompeta =====
  describe('modo trompeta', () => {
    it('expone data-instrument="trumpet" cuando se pasa instrument="trumpet"', () => {
      const { container } = renderWithProviders(
        <MusicStaff
          sections={sampleSections}
          currentSectionIndex={0}
          currentChordIndex={0}
          isPlaying={false}
          bpm={120}
          instrument="trumpet"
        />
      )
      const el = container.querySelector('[data-instrument="trumpet"]')
      expect(el).toBeInTheDocument()
    })

    it('expone data-instrument="piano" por default', () => {
      const { container } = renderWithProviders(
        <MusicStaff
          sections={sampleSections}
          currentSectionIndex={0}
          currentChordIndex={0}
          isPlaying={false}
          bpm={120}
        />
      )
      const el = container.querySelector('[data-instrument="piano"]')
      expect(el).toBeInTheDocument()
    })

    it('muestra el título "Pentagrama · Trompeta" en el header', () => {
      renderWithProviders(
        <MusicStaff
          sections={sampleSections}
          currentSectionIndex={0}
          currentChordIndex={0}
          isPlaying={false}
          bpm={120}
          instrument="trumpet"
        />
      )
      expect(screen.getByText('Pentagrama · Trompeta')).toBeInTheDocument()
    })

    it('renderiza la nota fundamental por chord (no el símbolo del acorde) en data-note', () => {
      const { container } = renderWithProviders(
        <MusicStaff
          sections={sampleSections}
          currentSectionIndex={0}
          currentChordIndex={0}
          isPlaying={false}
          bpm={120}
          instrument="trumpet"
        />
      )
      // Para chord "C" trompeta devuelve "C3" (CHORD_ROOTS), que se
      // transpone una octava arriba para display → "C4".
      const heads = container.querySelectorAll('[data-testid="music-staff-note-head"]')
      expect(heads.length).toBe(6)
      expect(heads[0].getAttribute('data-note')).toBe('C4')
      expect(heads[1].getAttribute('data-note')).toBe('G4')
      expect(heads[2].getAttribute('data-note')).toBe('A4')
      expect(heads[3].getAttribute('data-note')).toBe('F4')
    })

    it('muestra el indicador de válvulas solo en la nota activa', () => {
      const { container } = renderWithProviders(
        <MusicStaff
          sections={sampleSections}
          currentSectionIndex={0}
          currentChordIndex={2}
          isPlaying={false}
          bpm={120}
          instrument="trumpet"
        />
      )
      const valves = container.querySelectorAll('[data-testid="music-staff-valves"]')
      expect(valves.length).toBe(1)
      // La nota activa es Am → A3 (CHORD_ROOTS) → digitación "● ● ○".
      expect(valves[0].textContent?.trim()).toBe('● ● ○')
    })

    it('no muestra válvulas si el instrumento es piano', () => {
      const { container } = renderWithProviders(
        <MusicStaff
          sections={sampleSections}
          currentSectionIndex={0}
          currentChordIndex={0}
          isPlaying={false}
          bpm={120}
          instrument="piano"
        />
      )
      const valves = container.querySelectorAll('[data-testid="music-staff-valves"]')
      expect(valves.length).toBe(0)
    })

    it('aplica la clase music-staff-note--trumpet a la cabeza de nota', () => {
      const { container } = renderWithProviders(
        <MusicStaff
          sections={sampleSections}
          currentSectionIndex={0}
          currentChordIndex={0}
          isPlaying={false}
          bpm={120}
          instrument="trumpet"
        />
      )
      const trumpetNotes = container.querySelectorAll('.music-staff-note--trumpet')
      expect(trumpetNotes.length).toBe(6)
    })

    it('renderiza ledger lines para notas fuera del pentagrama', () => {
      // Chord "C" → raíz C3 → display C4 (1 ledger line abajo).
      const { container } = renderWithProviders(
        <MusicStaff
          sections={[{ name: 'Test', chords: [{ chord: 'C', beat: 0, duration: 2 }] }]}
          currentSectionIndex={0}
          currentChordIndex={0}
          isPlaying={false}
          bpm={120}
          instrument="trumpet"
        />
      )
      const ledgers = container.querySelectorAll('.music-staff-ledger')
      // C4 está exactamente en position -1, lo que requiere 1 ledger line.
      expect(ledgers.length).toBe(1)
    })
  })
})

// ===== Utilidades de pitch =====
// (Se testean en el mismo archivo para evitar crear un archivo .test.ts
// adicional; pitch.ts es lógica pura sin React/DOM.)

describe('noteToMidi', () => {
  it('convierte notas naturales correctamente', () => {
    expect(noteToMidi('C4')).toBe(60)  // Middle C
    expect(noteToMidi('A4')).toBe(69)  // A440
    expect(noteToMidi('C5')).toBe(72)
  })

  it('maneja sostenidos y bemoles', () => {
    expect(noteToMidi('C#4')).toBe(61)
    expect(noteToMidi('Db4')).toBe(61)
    expect(noteToMidi('Bb3')).toBe(58)
  })

  it('devuelve null para entradas inválidas', () => {
    expect(noteToMidi('H4')).toBeNull()
    expect(noteToMidi('4')).toBeNull()
    expect(noteToMidi('')).toBeNull()
  })
})

describe('noteToStaffPosition', () => {
  it('ubica las 5 líneas del pentagrama en 0, 1, 2, 3, 4', () => {
    expect(noteToStaffPosition('E4')).toBe(0)  // línea inferior
    expect(noteToStaffPosition('G4')).toBe(1)
    expect(noteToStaffPosition('B4')).toBe(2)  // línea media
    expect(noteToStaffPosition('D5')).toBe(3)
    expect(noteToStaffPosition('F5')).toBe(4)  // línea superior
  })

  it('ubica los espacios entre líneas en 0.5, 1.5, 2.5, 3.5', () => {
    expect(noteToStaffPosition('F4')).toBe(0.5)
    expect(noteToStaffPosition('A4')).toBe(1.5)
    expect(noteToStaffPosition('C5')).toBe(2.5)
    expect(noteToStaffPosition('E5')).toBe(3.5)
  })

  it('devuelve posiciones negativas para notas graves con ledger lines', () => {
    expect(noteToStaffPosition('C4')).toBe(-1)  // 1 ledger line abajo
    expect(noteToStaffPosition('B3')).toBe(-1.5)
    expect(noteToStaffPosition('A3')).toBe(-2)  // 2 ledger lines abajo
  })

  it('devuelve posiciones > 4 para notas agudas con ledger lines', () => {
    expect(noteToStaffPosition('G5')).toBe(4.5)  // espacio de arriba
    expect(noteToStaffPosition('A5')).toBe(5)    // 1 ledger line arriba
    expect(noteToStaffPosition('C6')).toBe(6)    // 2 ledger lines arriba
  })

  it('mapea alteradas a su equivalente natural', () => {
    // F#4 se mapea a F4 (step 3) → 0.5
    expect(noteToStaffPosition('F#4')).toBe(0.5)
    // Bb3 es enharmónico de A3 (step 5) → -2
    expect(noteToStaffPosition('Bb3')).toBe(-2)
  })
})

describe('ledgerLinesCount', () => {
  it('devuelve 0 para notas dentro del pentagrama', () => {
    expect(ledgerLinesCount(0)).toBe(0)
    expect(ledgerLinesCount(2)).toBe(0)
    expect(ledgerLinesCount(4)).toBe(0)
    expect(ledgerLinesCount(0.5)).toBe(0)
    expect(ledgerLinesCount(3.5)).toBe(0)
  })

  it('cuenta ledger lines abajo para posiciones negativas', () => {
    expect(ledgerLinesCount(-1)).toBe(1)  // C4
    expect(ledgerLinesCount(-2)).toBe(2)  // A3
    expect(ledgerLinesCount(-3)).toBe(3)  // F3
  })

  it('cuenta ledger lines arriba para posiciones > 4', () => {
    expect(ledgerLinesCount(4.5)).toBe(0)  // G5 (espacio, sin ledger)
    expect(ledgerLinesCount(5)).toBe(1)    // A5
    expect(ledgerLinesCount(6)).toBe(2)    // C6
  })
})

describe('transposeOctaveUp', () => {
  it('sube la octava manteniendo el nombre de la nota', () => {
    expect(transposeOctaveUp('C3')).toBe('C4')
    expect(transposeOctaveUp('F#4')).toBe('F#5')
    expect(transposeOctaveUp('Bb3')).toBe('Bb4')
  })

  it('maneja octavas negativas', () => {
    expect(transposeOctaveUp('A-1')).toBe('A0')
  })

  it('devuelve null para entradas inválidas', () => {
    expect(transposeOctaveUp('H4')).toBeNull()
    expect(transposeOctaveUp('C')).toBeNull()
    expect(transposeOctaveUp('')).toBeNull()
  })
})
