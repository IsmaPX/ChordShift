/**
 * StaffViolin — Pentagrama de violín con estilo clásico y elegante.
 *
 * Características:
 *  - Arco decorativo SVG animado
 *  - Notas con vibrato sutil
 *  - Clave de Sol en estilo clásico
 *  - Degradados de madera/mahogany
 *  - Animación fluida tipo "reverb" en notas activas
 */
import { cn } from '@/lib/utils'
import { TrebleClef } from './StaffClef'
import type { ChordNote, BeatMark, StaffTimeline } from './types'

interface StaffViolinProps {
  notes: ChordNote[]
  beatMarks: BeatMark[]
  timeline: StaffTimeline
  isPlaying: boolean
  cursorStyle: React.CSSProperties
  resetKey: number
  illuminatedNoteIndex?: number
  className?: string
}

export function StaffViolin({
  notes,
  beatMarks,
  cursorStyle,
  resetKey,
  illuminatedNoteIndex,
  className,
}: StaffViolinProps) {
  const currentNote = notes.find(n => n.isCurrent)

  return (
    <div className={cn('flex flex-col gap-1 wooden-instrument', className)}>
      {/* ── Header elegante ── */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-rose-400/70 uppercase tracking-wider">Pentagrama · Violín</span>
          <span className="text-[8px] font-mono text-rose-400/40">Fiddle · 4 cuerdas</span>
        </div>
        {currentNote?.noteName && (
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-mono font-bold text-rose-200">{currentNote.noteName}</span>
            <div className="flex items-center gap-0.5">
              {/* Indicador de acústica tipo cordal */}
              <div className="w-1 h-3 bg-rose-400/30 rounded-full" />
              <div className="w-1 h-2 bg-rose-400/50 rounded-full" />
              <div className="w-1 h-3 bg-rose-400/30 rounded-full" />
            </div>
          </div>
        )}
      </div>

      {/* ── Pentagrama con estilo madera ── */}
      <div
        className="music-staff-track relative rounded-lg overflow-hidden border border-rose-500/20 bg-gradient-to-b from-amber-950/30 to-rose-950/20 h-36"
        role="img"
        aria-label="Pentagrama de violín"
      >
        <div className="absolute inset-0 rounded-lg border border-rose-500/10 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-rose-400/15 to-transparent" />

        {/* Decoración: arco lateral */}
        <div className="absolute left-1 top-1/2 -translate-y-1/2 pointer-events-none z-10">
          <svg width="20" height="90" viewBox="0 0 20 90" fill="none" className="opacity-30">
            <path d="M5 5 Q 5 45, 5 75 M 5 45 Q 15 45, 15 45" stroke="#fb923c" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
            <line x1="5" y1="75" x2="5" y2="85" stroke="#fb923c" strokeWidth="1.5" opacity="0.5" />
          </svg>
        </div>

        {/* Clave de Sol clásica */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none z-10">
          <TrebleClef height={80} color="#f472b6" opacity={0.7} />
        </div>

        {/* 5 líneas del pentagrama con estilo cuerda */}
        <div className="absolute left-14 right-2 inset-y-4 pointer-events-none">
          {[0, 1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="absolute left-0 right-0 h-px"
              style={{
                top: `${((4 - i) / 4) * 100}%`,
                background: `linear-gradient(90deg,
                  transparent 0%,
                  rgba(244, 114, 182, 0.2) 10%,
                  rgba(251, 146, 60, 0.5) 50%,
                  rgba(244, 114, 182, 0.2) 90%,
                  transparent 100%)`,
              }}
            />
          ))}
        </div>

        {/* Notas con vibrato */}
        <div className="absolute left-14 right-2 inset-y-4 pointer-events-none">
          {notes.map((n, idx) => {
            const topPercent = ((4 - n.line) / 4) * 100
            // Violín usa vibrato sutil cuando la nota está activa
            const vibrato = n.isCurrent ? 'animate-[pulse_0.8s_ease-in-out_infinite]' : ''
            const isIlluminated = illuminatedNoteIndex === idx

            return (
              <div
                key={idx}
                className={`absolute transition-all duration-300 ${vibrato}`}
                style={{
                  left: `calc(56px + (100% - 64px) * ${n.position / 100})`,
                  top: `${topPercent}%`,
                  transform: 'translateX(-50%)',
                }}
                data-testid="music-staff-note"
                data-chord={n.chord.chord}
                data-note={n.noteName ?? ''}
              >
                {/* Nota con forma redondeada */}
                <div
                  className={cn(
                    'w-3.5 h-3.5 rounded-full -mt-1.5 transition-all duration-300',
                    n.isCurrent
                      ? 'bg-gradient-to-br from-rose-200 to-rose-400 border-2 border-rose-300 shadow-lg shadow-rose-500/50'
                      : 'bg-gradient-to-br from-rose-300 to-rose-600 border-2 border-rose-400/60',
                    isIlluminated && 'scale-125 shadow-xl shadow-rose-400/70'
                  )}
                >
                  <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-rose-100 to-transparent opacity-50" />
                </div>

                {/* Etiqueta de nota */}
                <span className="absolute left-1/2 -translate-x-1/2 top-3 text-[9px] font-mono font-bold whitespace-nowrap pointer-events-none text-rose-200/80">
                  {n.noteName ?? n.chord.chord}
                </span>
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
            <div className="absolute inset-0 w-px bg-gradient-to-b from-rose-500/20 via-rose-400/40 to-rose-500/20" />
          </div>
        ))}

        {/* Cursor de tiempo */}
        <div
          key={resetKey}
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{ left: '56px', width: '3px', ...cursorStyle }}
          aria-hidden="true"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1/2 bg-rose-400/80 rounded-full blur-sm" />
        </div>
      </div>
    </div>
  )
}
