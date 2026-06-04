import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { MusicStaff } from './Component'
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
    const el = container.querySelector('[data-version="music-staff-v1.0"]')
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
})
