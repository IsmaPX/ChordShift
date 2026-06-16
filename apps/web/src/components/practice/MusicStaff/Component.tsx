/**
 * MusicStaff — Pentagrama con línea amarilla de progreso temporal.
 *
 * Visualiza los acordes de la canción en un pentagrama musical con
 * 5 líneas verdes tenues, marca los beats/compases con líneas verticales
 * y muestra una línea amarilla vertical que se desplaza de izquierda
 * a derecha al ritmo de la canción.
 *
 * Adaptación por instrumento:
 *  - `piano` | `guitar` (default): muestra el símbolo del acorde (e.g. "C")
 *    posicionado con un hash determinístico sobre 5 líneas verdes.
 *  - `trumpet`: muestra la fundamental del acorde posicionada por su
 *    pitch real en el pentagrama (Do4, Re4, ...), con líneas adicionales
 *    (ledger lines) automáticas para notas fuera del rango, e indicador
 *    de válvulas (1/2/3) en la nota activa.
 *  - `violin` | `flute`: muestra las notas del acorde por pitch real
 *    en el pentagrama. `flute` incluye diagrama de agujeros debajo.
 *  - `harmonica`: muestra tablatura visual de agujeros (no pentagrama).
 *
 * La sincronización se hace con CSS `animation` (no rAF en JS) para
 * mantener 60fps sin recálculos por frame. El padre controla play/pause
 * vía `isPlaying` y resetea la posición incrementando `resetKey`.
 */
import { useMemo, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { chordPlayer } from '@/audio/ChordPlayer'
import { getTrumpetFingering } from '@/data/trumpetFingerings'
import { noteToStaffPosition, transposeOctaveUp } from './pitch'

import { ensureStaffKeyframes, cursorStyle } from './animation'
import type { MusicStaffProps, ChordNote, StaffTimeline, BeatMark } from './types'
import type { InstrumentName } from '@/types/music'
import { FluteFingeringChart } from '@/components/practice/FluteFingeringChart'
import { HarmonicaTab } from '@/components/practice/HarmonicaTab'

/** Hash determinístico simple: convierte un string en 0–4 (modo piano/guitarra). */
function chordLineIndex(chordName: string): number {
  let hash = 0
  for (let i = 0; i < chordName.length; i++) {
    hash = (hash * 31 + chordName.charCodeAt(i)) | 0
  }
  return Math.abs(hash) % 5
}

/** Formatea segundos a mm:ss. */
function formatTime(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds))
  const m = Math.floor(safe / 60)
  const s = safe % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** Extrae la fundamental del acorde (root) según el instrumento. */
function getRootNoteForInstrument(chordSymbol: string, instrument: InstrumentName): string | null {
  if (instrument === 'trumpet') {
    // ChordPlayer.getChordNotes devuelve [root] para trompeta.
    const notes = chordPlayer.getChordNotes(chordSymbol, 'trumpet')
    return notes?.[0] ?? null
  }
  // Para piano y guitarra seguimos mostrando el símbolo del acorde; no
  // hay una "raíz única" en el pentagrama, así que devolvemos null y se
  // usa el modo legacy (hash determinístico sobre el símbolo).
  return null
}

export function MusicStaff({
  sections,
  currentSectionIndex,
  currentChordIndex,
  isPlaying,
  bpm,
  instrument = 'piano',
  resetKey = 0,
  className,
}: MusicStaffProps) {
  // Inyecta los keyframes una sola vez (idempotente, SSR-safe).
  useEffect(() => {
    ensureStaffKeyframes()
  }, [])

  const isTrumpet = instrument === 'trumpet'
  const isHarmonica = instrument === 'harmonica'
  const isFlute = instrument === 'flute'
  const isViolin = instrument === 'violin'

  const { timeline, notes, beatMarks } = useMemo(() => {
    const beatDuration = 60 / Math.max(1, bpm)
    interface NoteRaw {
      chord: ChordNote['chord']
      endTime: number
      line: number
      isCurrent: boolean
      noteName?: string
      valves?: string
    }
    interface MarkRaw { time: number; label?: string }
    const noteRaws: NoteRaw[] = []
    const markRaws: MarkRaw[] = []
    let elapsed = 0
    let beatCount = 0
    let currentSeconds = 0

    sections.forEach((section, sIdx) => {
      section.chords.forEach((chord, cIdx) => {
        const chordSeconds = beatDuration * Math.max(0.1, chord.duration)
        const endTime = elapsed + chordSeconds

        // Trompeta: mostrar nota fundamental con digitación de válvulas
        if (isTrumpet) {
          const root = getRootNoteForInstrument(chord.chord, 'trumpet')
          if (root) {
            const displayRoot = transposeOctaveUp(root) ?? root
            const pos = noteToStaffPosition(displayRoot)
            const line = pos ?? chordLineIndex(chord.chord)
            noteRaws.push({
              chord,
              endTime,
              line,
              isCurrent: sIdx === currentSectionIndex && cIdx === currentChordIndex,
              noteName: displayRoot,
              valves: getTrumpetFingering(root)?.valves,
            })
          } else {
            noteRaws.push({
              chord,
              endTime,
              line: chordLineIndex(chord.chord),
              isCurrent: sIdx === currentSectionIndex && cIdx === currentChordIndex,
              noteName: chord.chord,
              valves: undefined,
            })
          }
        } else {
          // Piano/guitarra: obtener notas reales del acorde y mostrar cada nota
          // en su posición correcta del pentagrama.
          const chordNotes = chordPlayer.getChordNotes(chord.chord, instrument)
          if (chordNotes && chordNotes.length > 0) {
            for (const note of chordNotes) {
              const notePos = noteToStaffPosition(note)
              const line = notePos ?? chordLineIndex(chord.chord)
              noteRaws.push({
                chord,
                endTime,
                line,
                isCurrent: sIdx === currentSectionIndex && cIdx === currentChordIndex,
                noteName: note,
                valves: undefined,
              })
            }
          } else {
            // Fallback si no hay digitación: usar hash para posición
            noteRaws.push({
              chord,
              endTime,
              line: chordLineIndex(chord.chord),
              isCurrent: sIdx === currentSectionIndex && cIdx === currentChordIndex,
              noteName: chord.chord,
              valves: undefined,
            })
          }
        }

        if (
          sIdx < currentSectionIndex ||
          (sIdx === currentSectionIndex && cIdx < currentChordIndex)
        ) {
          currentSeconds = endTime
        }

        const beatsInChord = Math.max(1, Math.round(chord.duration))
        for (let b = 0; b < beatsInChord; b++) {
          beatCount += 1
          if (beatCount > 1 && beatCount % 4 === 0) {
            const beatTime = elapsed + chordSeconds * (b / beatsInChord)
            markRaws.push({ time: beatTime })
          }
        }

        elapsed = endTime
      })

      if (sIdx > 0) {
        const lastChord = section.chords[section.chords.length - 1]
        const lastChordSeconds = beatDuration * Math.max(0.1, lastChord?.duration || 1)
        markRaws.push({ time: elapsed - lastChordSeconds, label: section.name })
      }
    })

    const totalSeconds = elapsed
    const safeTotal = Math.max(0.001, totalSeconds)

    const noteAcc: ChordNote[] = noteRaws.map((n) => ({
      chord: n.chord,
      position: (n.endTime / safeTotal) * 100,
      line: n.line,
      isCurrent: n.isCurrent,
      noteName: n.noteName,
      valves: n.valves,
    }))

    const markAcc: BeatMark[] = markRaws
      .map((m) => ({ position: (m.time / safeTotal) * 100, isBar: true as const, label: m.label }))
      .sort((a, b) => a.position - b.position)

    const timelineAcc: StaffTimeline = {
      totalSeconds,
      totalLabel: formatTime(totalSeconds),
      currentSeconds,
      currentLabel: formatTime(currentSeconds),
    }

    return { timeline: timelineAcc, notes: noteAcc, beatMarks: markAcc }
  }, [sections, currentSectionIndex, currentChordIndex, bpm, instrument])

  const remainingSeconds = Math.max(0.1, timeline.totalSeconds - timeline.currentSeconds)
  const cursorAnim = cursorStyle(remainingSeconds, isPlaying)

  if (timeline.totalSeconds <= 0) {
    return null
  }

  if (isHarmonica) {
    const currentNote = notes.find(n => n.isCurrent)
    return (
      <div
        data-testid="music-staff"
        data-version="music-staff-v1.1"
        data-instrument={instrument}
        className={cn('music-staff', className)}
        role="region"
        aria-label="Tablatura de armónica"
      >
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2 text-text-secondary text-xs font-mono">
            <span className="text-anime-glow">♪</span>
            <span className="uppercase tracking-widest">Armónica · Diatónica C</span>
          </div>
          <div className="flex items-center gap-2 text-text-secondary text-xs font-mono">
            <span className={cn(isPlaying ? 'text-warning' : 'text-text-secondary')}>
              {timeline.currentLabel}
            </span>
            <span>/</span>
            <span>{timeline.totalLabel}</span>
          </div>
        </div>
        <div className="music-staff-track relative rounded-lg overflow-hidden border border-accent/15 bg-bg-primary/40 h-20">
          <div
            key={resetKey}
            className="music-staff-cursor absolute top-0 bottom-0 pointer-events-none"
            style={{
              left: '20px',
              width: '3px',
              ...cursorAnim,
            }}
            aria-hidden="true"
          >
            <div className="music-staff-cursor-head" />
          </div>
          <div className="flex items-center justify-center h-full">
            <HarmonicaTab
              note={currentNote?.noteName ?? 'C5'}
              isCurrent={currentNote?.isCurrent ?? false}
            />
          </div>
        </div>
      </div>
    )
  }

  // En modo trompeta el track es más alto para dar espacio a las ledger
  // lines y a notas agudas/graves fuera del pentagrama.
  const trackClass = isTrumpet
    ? 'h-40'  // 160px - espacio para ledger lines
    : 'h-40'  // 160px - mismo tamaño para piano/guitarra
  const staffContainerClass = isTrumpet
    ? 'inset-y-5'  // 20px padding
    : 'inset-y-3'  // 12px padding

  return (
    <div
      data-testid="music-staff"
      data-version="music-staff-v1.1"
      data-instrument={instrument}
      data-current-section={currentSectionIndex}
      data-current-chord={currentChordIndex}
      data-is-playing={isPlaying ? 'true' : 'false'}
      className={cn('music-staff', className)}
      role="region"
      aria-label="Pentagrama de la canción con línea de tiempo"
    >
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2 text-text-secondary text-xs font-mono">
          <span className="text-anime-glow">♪</span>
          <span className="uppercase tracking-widest">
            {isTrumpet ? 'Pentagrama · Trompeta' : isViolin ? 'Pentagrama · Violín' : isFlute ? 'Pentagrama · Flauta' : 'Pentagrama'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-text-secondary text-xs font-mono">
          <span className={cn(isPlaying ? 'text-warning' : 'text-text-secondary')}>
            {timeline.currentLabel}
          </span>
          <span>/</span>
          <span>{timeline.totalLabel}</span>
        </div>
      </div>

      <div
        className={cn(
          'music-staff-track relative rounded-lg overflow-hidden border border-accent/15 bg-bg-primary/40',
          trackClass
        )}
      >
        {/* Símbolo de clave al inicio (clave de sol, apropiada para trompeta) */}
        <svg
          className="music-staff-clef absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none"
          width="32"
          height={isTrumpet ? '120' : '80'}
          viewBox="0 0 32 80"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M16 8 C 12 12, 10 18, 12 24 C 14 30, 18 32, 20 28 C 22 24, 18 18, 14 22 C 10 26, 8 32, 12 40 C 16 48, 22 52, 22 60 C 22 68, 16 72, 12 68 M 14 22 L 14 72 M 20 28 L 20 8"
            stroke="#22c55e"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.55"
          />
        </svg>

        {/* 5 líneas del pentagrama */}
        <div className={cn('music-staff-lines absolute left-12 right-2 pointer-events-none', staffContainerClass)}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="music-staff-line absolute left-0 right-0 h-px"
              style={{ top: `${(i / 4) * 100}%` }}
            />
          ))}
        </div>

        {/* Contenedor de notas: mismo inset que las líneas para alinear coordenadas.
            Ancla en top:0 para que top:0% de la nota = top:0% de la primera línea. */}
        <div className={cn('music-staff-notes-container absolute left-12 right-2 pointer-events-none', staffContainerClass)}>
        {notes.map((n, idx) => {
          // Posición vertical: mapeamos el rango [0, 4] a [0%, 100%].
          // Sin translateY(-50%), top:0% = borde superior del pentagrama.
          const topPercent = (n.line / 4) * 100

          // Ledger lines si la nota está fuera del pentagrama (0 a 4).
          const ledgersAbove = Math.max(0, Math.floor(n.line - 4))
          const ledgersBelow = Math.max(0, Math.floor(-n.line))

          // Etiqueta: mostrar nombre de nota real para todos los instrumentos,
          // no solo trompeta. El símbolo de acorde es fallback.
          const label = n.noteName ?? n.chord.chord

          return (
            <div
              key={`${idx}-${n.chord.chord}-${n.noteName ?? ''}`}
              className={cn(
                'music-staff-note-group absolute',
                isTrumpet && 'music-staff-note-group--trumpet'
              )}
              style={{
                left: `calc(48px + (100% - 56px) * ${n.position / 100})`,
                top: `${topPercent}%`,
                transform: 'translate(-50%, -50%)',
              }}
              data-testid="music-staff-note"
              data-chord={n.chord.chord}
              data-note={n.noteName ?? ''}
            >
              {/* Ledger lines (fuera del pentagrama, cualquier instrumento) */}
              {ledgersBelow > 0 && (
                <div className="music-staff-ledgers absolute left-1/2 -translate-x-1/2 pointer-events-none">
                  {Array.from({ length: ledgersBelow }).map((_, i) => (
                    <div
                      key={i}
                      className="music-staff-ledger"
                      style={{
                        // Cada ledger line adicional está 1 unidad (12.5% del staff)
                        // por debajo de la anterior.
                        top: `${(i + 1) * 12.5}%`,
                      }}
                    />
                  ))}
                </div>
              )}
              {ledgersAbove > 0 && (
                <div className="music-staff-ledgers absolute left-1/2 -translate-x-1/2 pointer-events-none">
                  {Array.from({ length: ledgersAbove }).map((_, i) => (
                    <div
                      key={i}
                      className="music-staff-ledger"
                      style={{
                        // Negativo: por encima del contenedor de la nota.
                        top: `${-(i + 1) * 12.5}%`,
                      }}
                    />
                  ))}
                </div>
              )}

              <div
                className={cn(
                  'music-staff-note',
                  isTrumpet && 'music-staff-note--trumpet',
                  n.isCurrent && 'music-staff-note--current'
                )}
                data-testid="music-staff-note-head"
                data-chord={n.chord.chord}
                data-note={n.noteName ?? ''}
              />
              <span className="music-staff-note-label absolute left-1/2 -translate-x-1/2 top-4 text-[10px] font-mono font-bold whitespace-nowrap pointer-events-none">
                {label}
              </span>

              {/* Indicador de válvulas (solo trompeta, nota activa) */}
              {isTrumpet && n.isCurrent && n.valves && (
                <span
                  className="music-staff-valves absolute left-1/2 -translate-x-1/2 -bottom-5 text-[10px] font-mono font-bold whitespace-nowrap pointer-events-none"
                  data-testid="music-staff-valves"
                  aria-label={`Válvulas: ${n.valves}`}
                >
                  {n.valves}
                </span>
              )}
            </div>
          )
        })}
        </div>

        {/* Marcas de beats/compases */}
        {beatMarks.map((m, idx) => (
          <div
            key={idx}
            className={cn(
              'music-staff-bar absolute top-3 bottom-3 pointer-events-none',
              m.label && 'music-staff-bar--labeled'
            )}
            style={{ left: `calc(48px + (100% - 56px) * ${m.position / 100})` }}
            aria-hidden="true"
          >
            {m.label && (
              <span className="music-staff-section-label absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-mono uppercase tracking-wider whitespace-nowrap">
                {m.label}
              </span>
            )}
          </div>
        ))}

        {/* Línea amarilla de progreso (cursor temporal) */}
        <div
          key={resetKey}
          className="music-staff-cursor absolute top-0 bottom-0 pointer-events-none"
          style={{
            left: '48px',
            width: '3px',
            ...cursorAnim,
          }}
          aria-hidden="true"
        >
          {/* Cabeza del cursor (circulo amarillo) */}
          <div className="music-staff-cursor-head" />
        </div>
      </div>

      {isFlute && (() => {
        const currentNote = notes.find(n => n.isCurrent)
        return (
          <div className="mt-2 flex items-center justify-center">
            <FluteFingeringChart
              note={currentNote?.noteName ?? 'C5'}
              isCurrent={currentNote?.isCurrent ?? false}
            />
          </div>
        )
      })()}
    </div>
  )
}
