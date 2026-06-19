/**
 * StaffFlute  — Pentagrama especializado para flauta.
 *
 * Diseño aireado etéreo con temática plateada/cromo:
 *  - Tailwind-animated estelas suaves
 *  - Notas con resplandor etéreo propio
 *  - Clave de Sol con terminación pulida
 *  - Animación sutil para reflejar el soplo de aire
 */
import { cn } from '@/lib/utils'
import { TrebleClef } from './StaffClef'
import type { ChordNote, BeatMark, StaffTimeline } from './types'

interface StaffFluteProps {
  notes: ChordNote[]
  beatMarks: BeatMark[]
  timeline: StaffTimeline
  isPlaying: boolean
  cursorStyle: React.CSSProperties
  resetKey: number
  illuminatedNoteIndex?: number
  className?: string
}

export function StaffFlute({
  notes,
  beatMarks,
  cursorStyle,
  resetKey,
  illuminatedNoteIndex,
  className,
}: StaffFluteProps) {
  const currentNote = notes.find(n => n.isCurrent)

  return (
    <div className={cn('flex flex-col gap-1 wind-instrument', className)}>
      {/* ── Header del instrumento ── */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-cyan-400/70 uppercase tracking-wider">Pentagrama · Flauta</span>
          <span className="text-[8px] font-mono text-cyan-400/40">Woodwind · C</span>
        </div>
        {currentNote?.noteName && (
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] font-mono font-bold text-cyan-200">{currentNote.noteName}</span>
            <div className="w-4 h-2 bg-gradient-to-r from-cyan-400/30 to-cyan-200/50 rounded-full" />
          </div>
        )}
      </div>

      {/* ── Pentagrama con estilo aireado ── */}
      <div
        className="music-staff-track relative rounded-lg overflow-hidden border border-cyan-500/20 bg-gradient-to-b from-cyan-950/20 to-sky-950/30 h-36"
        role="img"
        aria-label="Pentagrama de flauta"
      >
        <div className="absolute inset-0 rounded-lg border border-cyan-500/10 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/15 to-transparent" />

        {/* Decoración: estela de aire sutil */}
        <div className="absolute left-0 top-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-0 w-20 h-[1px] bg-cyan-400/10 blur-sm animate-[slide-in_4s_linear_infinite]" />
          <div className="absolute top-3/4 left-1/3 w-16 h-[1px] bg-cyan-400/10 blur-sm animate-[slide-in_5s_linear_infinite]" />
        </div>

        {/* Clave de Sol pulida */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none z-10">
          <TrebleClef height={80} color="#67e8f9" opacity={0.7} />
        </div>

        {/* 5 líneas del pentagrama con estilo flauta (líneas finas y brillantes) */}
        <div className="absolute left-14 right-2 inset-y-4 pointer-events-none">
          {[0, 1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="absolute left-0 right-0 h-px"
              style={{
                top: `${((4 - i) / 4) * 100}%`,
                background: `linear-gradient(90deg,
                  transparent 0%,
                  rgba(103, 232, 249, 0.25) 10%,
                  rgba(165, 243, 252, 0.5) 50%,
                  rgba(103, 232, 249, 0.25) 90%,
                  transparent 100%)`,
              }}
            />
          ))}
        </div>

        {/* Notas con resplandor etéreo */}
        <div className="absolute left-14 right-2 inset-y-4 pointer-events-none">
          {notes.map((n, idx) => {
            const topPercent = ((4 - n.line) / 4) * 100
            const isIlluminated = illuminatedNoteIndex === idx

            return (
              <div
                key={idx}
                className="absolute transition-all duration-300"
                style={{
                  left: `calc(56px + (100% - 64px) * ${n.position / 100})`,
                  top: `${topPercent}%`,
                  transform: 'translateX(-50%)',
                }}
                data-testid="music-staff-note"
                data-chord={n.chord.chord}
                data-note={n.noteName ?? ''}
              >
                {/* Nota con resplandor */}
                <div
                  className={cn(
                    'w-3.5 h-3.5 rounded-full border-[1.5px] transition-all duration-300 -mt-1.5',
                    n.isCurrent
                      ? 'bg-gradient-to-br from-cyan-100 to-cyan-300 border-cyan-300 shadow-lg shadow-cyan-400/50'
                      : 'bg-gradient-to-br from-cyan-200 to-cyan-500 border-cyan-400/70',
                    isIlluminated && 'scale-125 shadow-xl shadow-cyan-400/70'
                  )}
                >
                  <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-cyan-50 to-transparent opacity-60" />
                </div>

                {/* Etiqueta de nota */}
                <span className="absolute left-1/2 -translate-x-1/2 top-3 text-[9px] font-mono font-bold whitespace-nowrap pointer-events-none text-cyan-200/80">
                  {n.noteName ?? n.chord.chord}
                </span>

                {/* Indicador de soplo (breath) */}
                {n.isCurrent && (
                  <div className="absolute left-1/2 -translate-x-1/2 -bottom-5 flex items-center gap-0.5">
                    <div className="w-1 h-1 bg-cyan-300/60 rounded-full animate-ping" />
                    <div className="w-1 h-1 bg-cyan-400/40 rounded-full animate-ping [animation-delay:0.2s]" />
                    <div className="w-1 h-1 bg-cyan-500/30 rounded-full animate-ping [animation-delay:0.4s]" />
                  </div>
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
            <div className="absolute inset-0 w-px bg-gradient-to-b from-cyan-500/20 via-cyan-400/40 to-cyan-500/20" />
          </div>
        ))}

        {/* Cursor de tiempo */}
        <div
          key={resetKey}
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{ left: '56px', width: '3px', ...cursorStyle }}
          aria-hidden="true"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1/2 bg-cyan-400/80 rounded-full blur-sm" />
        </div>
      </div>
    </div>
  )
}
