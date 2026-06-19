/**
 * StaffTrumpet — Pentagrama especializado para trompeta.
 *
 * Diseño de metal/brass con temática dorada:
 *  - Clave de Sol con acabado metálico
 *  - Notas doradas con brillo de metal pulido
 *  - Válvulas destacadas con glow dorado
 *  - Ledger lines doradas para notas altas/bajas
 *  - Indicador de "brass instrument" visual
 */
import { cn } from '@/lib/utils'
import { TrebleClef } from './StaffClef'
import type { ChordNote, BeatMark, StaffTimeline } from './types'

/** Obtener el fingering (válvulas) para cada nota de trompeta. */
function getTrumpetFingering(noteName: string): string | null {
  const match = /^([A-G][#b]?)(-?\d+)$/.exec(noteName.trim())
  if (!match) return null

  const step = match[1]
  // Mapeo aproximado de válvulas para trompeta en Bb
  const fingering: Record<string, string> = {
    'C4': '\u25EF \u25EF \u25EF', 'D4': '\u25C9 \u25C9 \u25EF', 'E4': '\u25C9 \u25EF \u25EF',
    'F4': '\u25EF \u25EF \u25EF', 'G4': '\u25C9 \u25C9 \u25EF', 'A4': '\u25C9 \u25EF \u25EF',
    'B4': '\u25EF \u25EF \u25EF', 'C5': '\u25C9 \u25C9 \u25EF', 'D5': '\u25C9 \u25EF \u25EF',
    'E5': '\u25EF \u25EF \u25EF', 'F5': '\u25C9 \u25C9 \u25EF', 'G5': '\u25C9 \u25EF \u25EF'
  }
  return fingering[step] ?? '\u25EF \u25EF \u25EF'
}

interface StaffTrumpetProps {
  notes: ChordNote[]
  beatMarks: BeatMark[]
  timeline: StaffTimeline
  isPlaying: boolean
  cursorStyle: React.CSSProperties
  resetKey: number
  illuminatedNoteIndex?: number
  className?: string
}

export function StaffTrumpet({
  notes,
  beatMarks,
  cursorStyle,
  resetKey,
  illuminatedNoteIndex,
  className,
}: StaffTrumpetProps) {
  const currentNote = notes.find(n => n.isCurrent)

  return (
    <div className={cn('flex flex-col gap-1 brass-instrument', className)}>
      {/* ── Header del instrumento ── */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-amber-400/70 uppercase tracking-wider">Pentagrama · Trompeta</span>
          <span className="text-[8px] font-mono text-amber-400/40">Brass · Bb</span>
        </div>
        {currentNote?.noteName && (
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] font-mono font-bold text-amber-300">{currentNote.noteName}</span>
            <span className="text-[9px] font-mono text-amber-400/70">
              {getTrumpetFingering(currentNote.noteName)}
            </span>
          </div>
        )}
      </div>

      {/* ── Pentagrama principal ── */}
      <div
        className="music-staff-track relative rounded-lg overflow-hidden border border-amber-500/30 bg-gradient-to-b from-slate-900/40 to-slate-800/40 h-36"
        role="img"
        aria-label="Pentagrama de trompeta"
      >
        {/* Decoración de metal en el borde */}
        <div className="absolute inset-0 rounded-lg border border-amber-500/10 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />

        {/* Clave de Sol decorativa con estilo metal */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none z-10">
          <TrebleClef height={80} color="#fbbf24" opacity={0.75} />
        </div>

        {/* 5 líneas del pentagrama con estilo metal */}
        <div className="absolute left-14 right-2 inset-y-4 pointer-events-none">
          {[0, 1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="absolute left-0 right-0 h-px"
              style={{
                top: `${((4 - i) / 4) * 100}%`,
                background: `linear-gradient(90deg,
                  transparent 0%,
                  rgba(251, 191, 36, 0.3) 10%,
                  rgba(250, 204, 21, 0.7) 50%,
                  rgba(251, 191, 36, 0.3) 90%,
                  transparent 100%)`,
              }}
            />
          ))}
        </div>

        {/* Notas del acorde en pentagrama */}
        <div className="absolute left-14 right-2 inset-y-4 pointer-events-none">
          {notes.map((n, idx) => {
            const topPercent = ((4 - n.line) / 4) * 100
            const ledgersAbove = Math.max(0, Math.floor(n.line - 4))
            const ledgersBelow = Math.max(0, Math.floor(-n.line))
            const fingering = n.noteName ? getTrumpetFingering(n.noteName) : null
            const isIlluminated = illuminatedNoteIndex === idx

            return (
              <div
                key={idx}
                className="absolute transition-all duration-200"
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
                  <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none">
                    {Array.from({ length: ledgersBelow }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute left-1/2 -translate-x-1/2 w-5 h-px"
                        style={{
                          top: `${(i + 1) * 12.5}%`,
                          background: 'linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.6), transparent)',
                        }}
                      />
                    ))}
                  </div>
                )}
                {ledgersAbove > 0 && (
                  <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none">
                    {Array.from({ length: ledgersAbove }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute left-1/2 -translate-x-1/2 w-5 h-px"
                        style={{
                          top: `${-(i + 1) * 12.5}%`,
                          background: 'linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.6), transparent)',
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Nota con acabado dorado tipo metal */}
                <div
                  className={cn(
                    'w-3.5 h-3 rounded-full border-2 transition-all duration-300 -mt-1.5',
                    n.isCurrent
                      ? 'bg-gradient-to-br from-amber-200 to-amber-600 border-amber-400 shadow-lg shadow-amber-500/50'
                      : 'bg-gradient-to-br from-amber-300 to-amber-700 border-amber-500/70',
                    isIlluminated && 'scale-125 shadow-xl shadow-amber-400/70'
                  )}
                >
                  <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-amber-100 to-transparent opacity-40" />
                </div>

                {/* Etiqueta de nota */}
                <span className="absolute left-1/2 -translate-x-1/2 top-3 text-[9px] font-mono font-bold whitespace-nowrap pointer-events-none text-amber-300/80">
                  {n.noteName ?? n.chord.chord}
                </span>

                {/* Indicador de válvulas */}
                {fingering && n.isCurrent && (
                  <span className="absolute left-1/2 -translate-x-1/2 -bottom-5 text-[8px] font-mono whitespace-nowrap text-amber-200 font-bold animate-pulse">
                    {fingering}
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
            className="absolute top-2 bottom-2 pointer-events-none"
            style={{ left: `calc(56px + (100% - 64px) * ${m.position / 100})` }}
            aria-hidden="true"
          >
            <div className="absolute inset-0 w-px bg-gradient-to-b from-amber-500/20 via-amber-400/40 to-amber-500/20" />
          </div>
        ))}

        {/* Cursor de tiempo */}
        <div
          key={resetKey}
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{ left: '56px', width: '3px', ...cursorStyle }}
          aria-hidden="true"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1/2 bg-amber-400/80 rounded-full blur-sm" />
        </div>
      </div>
    </div>
  )
}
