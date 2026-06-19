/**
 * StaffGuitar — Pentagrama especializado para guitarra.
 *
 * La guitarra usa clave de Sol con "8" (ottava bassa) porque suena
 * una octava más grave de lo escrito. Adicionalmente muestra:
 *  - Las 6 cuerdas de la guitarra como referencia visual (E2, A2, D3, G3, B3, E4)
 *  - El nombre de la cuerda donde se toca cada nota del acorde
 *  - Diagrama de acordes en tablatura (tab) abreviada al costado
 *
 * El pentagrama mantiene el mismo sistema de posición que pitch.ts,
 * pero las notas de guitarra típicamente van de E2 a B5.
 */
import { cn } from '@/lib/utils'
import { GuitarClef } from './StaffClef'
import type { ChordNote, BeatMark, StaffTimeline } from './types'

/** Cuerdas estándar de guitarra (de grave a aguda). */
const GUITAR_STRINGS = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4']

/** Nombres de cuerdas en texto. */
const STRING_LABELS = ['6ª·E', '5ª·A', '4ª·D', '3ª·G', '2ª·B', '1ª·e']

/** Indica en qué cuerda de guitarra se toca una nota, aproximadamente. */
function getNoteString(noteName: string): string | null {
  const match = /^([A-G][#b]?)(-?\d+)$/.exec(noteName.trim())
  if (!match) return null

  const noteNames: Record<string, number> = {
    C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4,
    F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8,
    A: 9, 'A#': 10, Bb: 10, B: 11,
  }
  const semitone = noteNames[match[1]]
  if (semitone === undefined) return null
  const octave = parseInt(match[2], 10)
  const midiNote = (octave + 1) * 12 + semitone

  // Rangos MIDI de cada cuerda (afinación estándar, desde traste 0 hasta 17)
  const stringRanges = [
    { label: STRING_LABELS[0], min: 40, max: 57 }, // E2–A3
    { label: STRING_LABELS[1], min: 45, max: 62 }, // A2–D4
    { label: STRING_LABELS[2], min: 50, max: 67 }, // D3–G4
    { label: STRING_LABELS[3], min: 55, max: 72 }, // G3–C5
    { label: STRING_LABELS[4], min: 59, max: 76 }, // B3–E5
    { label: STRING_LABELS[5], min: 64, max: 81 }, // E4–A5
  ]

  // Encontrar la cuerda más grave que pueda tocar esta nota
  for (const s of stringRanges) {
    if (midiNote >= s.min && midiNote <= s.max) return s.label
  }
  return null
}

interface StaffGuitarProps {
  notes: ChordNote[]
  beatMarks: BeatMark[]
  timeline: StaffTimeline
  cursorStyle: React.CSSProperties
  resetKey: number
  className?: string
}

export function StaffGuitar({
  notes,
  beatMarks,
  cursorStyle,
  resetKey,
  className,
}: StaffGuitarProps) {
  // La guitarra escribe una 8ª más alta de lo que suena.
  // Ajuste: sumamos 7 steps (una octava diatónica = 7 notas) × 0.5 = +3.5
  const adjustedNotes = notes.map(n => ({ ...n, line: n.line + 3.5 }))

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {/* Pentagrama principal con clave de guitarra */}
      <div
        className="music-staff-track relative rounded-lg overflow-hidden border border-accent/15 bg-bg-primary/40 h-32"
        role="img"
        aria-label="Pentagrama de guitarra"
      >
        {/* Clave de guitarra (Sol con "8") */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none z-10">
          <GuitarClef height={70} color="#22c55e" opacity={0.65} />
        </div>

        {/* 5 líneas del pentagrama */}
        <div className="music-staff-lines absolute left-14 right-2 pointer-events-none inset-y-3">
          {[0, 1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="music-staff-line absolute left-0 right-0 h-px"
              style={{ top: `${((4 - i) / 4) * 100}%` }}
            />
          ))}
        </div>

        {/* Notas del acorde en pentagrama */}
        <div className="music-staff-notes-container absolute left-14 right-2 pointer-events-none inset-y-3">
          {adjustedNotes.map((n, idx) => {
            const topPercent = ((4 - n.line) / 4) * 100
            const ledgersAbove = Math.max(0, Math.floor(n.line - 4))
            const ledgersBelow = Math.max(0, Math.floor(-n.line))
            const stringLabel = n.noteName ? getNoteString(n.noteName) : null

            return (
              <div
                key={`${idx}-${n.chord.chord}-${n.noteName ?? ''}`}
                className="music-staff-note-group absolute"
                style={{
                  left: `calc(56px + (100% - 64px) * ${n.position / 100})`,
                  top: `${topPercent}%`,
                  transform: 'translateX(-50%)',
                }}
                data-testid="music-staff-note"
                data-chord={n.chord.chord}
                data-note={n.noteName ?? ''}
              >
                {ledgersBelow > 0 && (
                  <div className="music-staff-ledgers absolute left-1/2 -translate-x-1/2">
                    {Array.from({ length: ledgersBelow }).map((_, i) => (
                      <div key={i} className="music-staff-ledger" style={{ top: `${(i + 1) * 12.5}%` }} />
                    ))}
                  </div>
                )}
                {ledgersAbove > 0 && (
                  <div className="music-staff-ledgers absolute left-1/2 -translate-x-1/2">
                    {Array.from({ length: ledgersAbove }).map((_, i) => (
                      <div key={i} className="music-staff-ledger" style={{ top: `${-(i + 1) * 12.5}%` }} />
                    ))}
                  </div>
                )}

                <div
                  className={cn(
                    'music-staff-note -mt-1.5',
                    n.isCurrent && 'music-staff-note--current'
                  )}
                  data-testid="music-staff-note-head"
                  data-chord={n.chord.chord}
                  data-note={n.noteName ?? ''}
                />
                <span className="music-staff-note-label absolute left-1/2 -translate-x-1/2 top-3 text-[8px] font-mono font-bold whitespace-nowrap pointer-events-none">
                  {n.noteName ?? n.chord.chord}
                </span>
                {/* Indicador de cuerda */}
                {stringLabel && n.isCurrent && (
                  <span
                    className="absolute left-1/2 -translate-x-1/2 -bottom-5 text-[7px] font-mono whitespace-nowrap pointer-events-none"
                    style={{ color: '#fbbf24', textShadow: '0 0 6px rgba(251,191,36,0.7)' }}
                  >
                    {stringLabel}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* Barras de compás */}
        {beatMarks.map((m, idx) => (
          <div
            key={idx}
            className={cn('music-staff-bar absolute top-2 bottom-2 pointer-events-none', m.label && 'music-staff-bar--labeled')}
            style={{ left: `calc(56px + (100% - 64px) * ${m.position / 100})` }}
            aria-hidden="true"
          >
            {m.label && (
              <span className="music-staff-section-label absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-mono uppercase tracking-wider whitespace-nowrap">
                {m.label}
              </span>
            )}
          </div>
        ))}

        {/* Cursor de tiempo */}
        <div
          key={resetKey}
          className="music-staff-cursor absolute top-0 bottom-0 pointer-events-none"
          style={{ left: '56px', width: '3px', ...cursorStyle }}
          aria-hidden="true"
        >
          <div className="music-staff-cursor-head" />
        </div>
      </div>

      {/* Cuerdas de referencia (TAB simplificado) */}
      <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-bg-primary/30 border border-accent/10">
        <span className="text-[8px] font-mono text-text-secondary/50 mr-2 uppercase tracking-wider">TAB</span>
        <div className="flex-1 flex items-center gap-0 relative">
          {/* 6 líneas de tablatura */}
          {GUITAR_STRINGS.map((str, i) => {
            const activeNote = notes.find(n =>
              n.isCurrent && n.noteName && getNoteString(n.noteName) === STRING_LABELS[i]
            )
            return (
              <div key={str} className="flex-1 relative flex items-center justify-center" style={{ height: 14 }}>
                <div
                  className="absolute inset-x-0"
                  style={{
                    top: '50%',
                    height: 1,
                    background: activeNote
                      ? 'rgba(250,204,21,0.6)'
                      : 'rgba(34,197,94,0.15)',
                  }}
                />
                <span
                  className="relative text-[7px] font-mono font-bold"
                  style={{
                    color: activeNote ? '#fde047' : 'rgba(134,239,172,0.4)',
                    textShadow: activeNote ? '0 0 6px rgba(250,204,21,0.8)' : undefined,
                  }}
                >
                  {activeNote ? activeNote.noteName?.replace(/\d/, '') ?? '—' : str.replace(/\d/, '')}
                </span>
              </div>
            )
          })}
        </div>
        <span className="text-[8px] font-mono text-text-secondary/40 ml-2">←6 cuerdas</span>
      </div>
    </div>
  )
}
