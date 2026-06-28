/**
 * StaffPiano — Pentagrama de piano con sistema de dos pentagramas (Gran Pentagrama).
 *
 * Diseño neon anime con diferenciación de voces por color:
 *  - Pink (melodía, octava >=5)
 *  - Blue (bajo, octava <4)
 *  - Purple (acordes, octava 4)
 *  - Claves de Sol y Fa en neon pink
 *  - Barras de compás doradas visibles
 *  - Cursor con pulso animado
 *
 * Las notas del acorde se distribuyen automáticamente entre los dos pentagramas
 * usando C4 como punto de corte. Notas >= C4 van al agudo, <C4 al grave.
 *
 * Convención de posición vertical: misma que pitch.ts (E4=0, F5=4).
 * Para el pentagrama grave se mapea: E2=0 a F3=4 (8va más grave).
 */
import { cn } from '@/lib/utils'
import { TrebleClef, BassClef } from './StaffClef'
import type { ChordNote, BeatMark, StaffTimeline } from './types'
import { VOICE_COLORS } from './types'
import { classifyVoiceType } from './pitch'

interface StaffPianoProps {
  notes: ChordNote[]
  beatMarks: BeatMark[]
  timeline: StaffTimeline
  isPlaying: boolean
  cursorStyle: React.CSSProperties
  resetKey: number
  illuminatedNoteIndex?: number
  className?: string
}

/** Determina si una nota pertenece al pentagrama grave (mano izquierda, <C4). */
function isBassNote(noteName?: string): boolean {
  if (!noteName) return false
  const match = /^([A-G][#b]?)(-?\d+)$/.exec(noteName.trim())
  if (!match) return false
  const octave = parseInt(match[2], 10)
  if (octave < 4) return true
  if (octave === 4 && /^[A-B]$/.test(match[1])) return false
  return false
}

/**
 * Mapea la posición de pentagrama de una nota al sistema grave (Fa).
 * El pentagrama de Fa en el piano estándar va de G2 (línea inf.) a A3 (línea sup.).
 * En términos de staff position (misma convención que pitch.ts):
 *   G2 = posición 0 en el sistema grave
 *   C3 = posición 2 (espacio central)
 *   F3 = posición 3.5 (última línea)
 */
function toBassStaffPosition(position: number): number {
  return position + 9
}

export function StaffPiano({
  notes,
  beatMarks,
  timeline,
  cursorStyle,
  resetKey,
  illuminatedNoteIndex,
  className,
}: StaffPianoProps) {
  const trebleNotes = notes
    .map((n, i) => ({ ...n, originalIndex: i }))
    .filter(n => !isBassNote(n.noteName))
  const bassNotes = notes
    .map((n, i) => ({ ...n, originalIndex: i }))
    .filter(n => isBassNote(n.noteName))

  const currentNote = notes.find(n => n.isCurrent)

  return (
    <div
      className={cn('flex flex-col gap-1 piano-instrument', className)}
      data-testid="music-staff"
      data-version="music-staff-v1.1"
      data-instrument="piano"
    >
      {/* ── Header: indicadores de voz + info ── */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-anime-pink text-xs font-mono font-bold uppercase tracking-widest">♪ Piano</span>
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="inline-block w-2 h-2 rounded-full bg-pink-400" />
            <span className="text-pink-300/60 font-mono">Melodía</span>
            <span className="inline-block w-2 h-2 rounded-full bg-blue-400 ml-1" />
            <span className="text-blue-300/60 font-mono">Bajo</span>
            <span className="inline-block w-2 h-2 rounded-full bg-purple-400 ml-1" />
            <span className="text-purple-300/60 font-mono">Acordes</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {currentNote && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-anime-pink/10 border border-anime-pink/30">
              <span className="text-anime-pink text-[10px] font-mono font-bold animate-pulse">♪</span>
              <span className="text-anime-blue text-[10px] font-mono font-bold">
                {currentNote.noteName ?? currentNote.chord.chord}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1 text-[10px] font-mono text-anime-pink/50">
            <span className="text-[8px] font-mono text-anime-pink/40 uppercase tracking-wider flex items-center gap-1">
              <span>{timeline.currentLabel}</span>
              <span>/</span>
              <span>{timeline.totalLabel}</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Pentagrama superior (Clave de Sol) ── */}
      <div className="piano-staff-system">
        <SingleStaff
          notes={trebleNotes}
          beatMarks={beatMarks}
          cursorStyle={cursorStyle}
          resetKey={resetKey}
          clef="treble"
          label="Pentagrama Agudo"
          height="h-32"
          inset="inset-y-2"
          illuminatedNoteIndex={illuminatedNoteIndex}
          isPlaying={timeline.currentSeconds > 0}
        />
      </div>

      {/* Brace neón + barra de sistema — solo si hay notas graves */}
      {bassNotes.length > 0 && (
        <div className="flex items-stretch gap-0 -my-1">
          <div className="w-1.5 bg-gradient-to-b from-anime-pink via-anime-purple to-anime-blue rounded-full ml-6 shrink-0 shadow-[0_0_12px_rgba(255,110,199,0.5)]" />
          <div className="flex-1 border-t border-dashed border-anime-pink/15" />
          <div className="flex items-center mr-4 gap-1">
            <span className="text-[8px] font-mono text-anime-pink/40 uppercase tracking-wider">
              {Math.round(timeline.totalSeconds)}s
            </span>
          </div>
        </div>
      )}

      {/* ── Pentagrama inferior (Clave de Fa) — solo si hay notas graves ── */}
      {bassNotes.length > 0 && (
        <div className="piano-staff-system">
          <SingleStaff
            notes={bassNotes.map(n => ({ ...n, line: toBassStaffPosition(n.line), originalIndex: n.originalIndex }))}
            beatMarks={beatMarks}
            cursorStyle={cursorStyle}
            resetKey={resetKey}
            clef="bass"
            label="Pentagrama Grave"
            height="h-28"
            inset="inset-y-2"
            hideCursor
            illuminatedNoteIndex={illuminatedNoteIndex}
            isPlaying={timeline.currentSeconds > 0}
          />
        </div>
      )}

      {/* ── Teclas de piano decorativas ── */}
      <div className="flex items-center gap-0.5 px-2 py-1 mx-6 rounded-b-lg bg-bg-card/60 border border-anime-pink/10 border-t-0 overflow-hidden">
        {['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'].map((note, i) => {
          const isActive = currentNote?.noteName?.startsWith(note)
          return (
            <div
              key={i}
              className={cn(
                'flex-1 h-4 rounded-sm transition-all duration-200 flex items-center justify-center',
                i % 2 === 0 ? 'bg-white/10' : 'bg-white/5',
                isActive && 'bg-anime-pink/30 shadow-[0_0_8px_rgba(255,110,199,0.5)]'
              )}
            >
              <span className={cn(
                'text-[6px] font-mono font-bold transition-colors',
                isActive ? 'text-anime-pink' : 'text-white/20'
              )}>
                {note}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** Sub-componente: un solo pentagrama de 5 líneas con notas coloreadas por voz. */
function SingleStaff({
  notes,
  beatMarks,
  cursorStyle,
  resetKey,
  clef,
  label,
  height,
  inset,
  hideCursor = false,
  illuminatedNoteIndex,
  isPlaying,
}: {
  notes: (ChordNote & { originalIndex?: number })[]
  beatMarks: BeatMark[]
  cursorStyle: React.CSSProperties
  resetKey: number
  clef: 'treble' | 'bass'
  label: string
  height: string
  inset: string
  hideCursor?: boolean
  illuminatedNoteIndex?: number
  isPlaying?: boolean
}) {
  return (
    <div
      className={cn(
        'piano-staff-track relative rounded-lg overflow-hidden border border-anime-pink/20 bg-gradient-to-b from-bg-primary/60 to-bg-secondary/40',
        height
      )}
      role="img"
      aria-label={label}
    >
      {/* Borde superior con gradiente neon */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-anime-pink/50 to-transparent pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-anime-blue/30 to-transparent pointer-events-none z-10" />

      {/* Clave en neon pink */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none z-10">
        {clef === 'treble' ? (
          <TrebleClef height={70} color="#ff6ec7" opacity={0.75} />
        ) : (
          <BassClef height={50} color="#ff6ec7" opacity={0.75} />
        )}
      </div>

      {/* 5 líneas del pentagrama con gradiente neon */}
      <div className={cn('piano-staff-lines absolute left-14 right-2 pointer-events-none', inset)}>
        {[0, 1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="piano-staff-line absolute left-0 right-0 h-px"
            style={{ top: `${((4 - i) / 4) * 100}%` }}
          />
        ))}
      </div>

      {/* Notas con colores por voz */}
      <div className={cn('piano-staff-notes-container absolute left-14 right-2 pointer-events-none', inset)}>
        {notes.map((n, _idx) => {
          const idx = n.originalIndex ?? _idx
          const topPercent = ((4 - n.line) / 4) * 100
          const ledgersAbove = Math.max(0, Math.floor(n.line - 4))
          const ledgersBelow = Math.max(0, Math.floor(-n.line))
          const noteLabel = n.noteName ?? n.chord.chord
          const voiceType = classifyVoiceType(n.noteName)
          const colors = VOICE_COLORS[voiceType]

          return (
            <div
              key={`${idx}-${n.chord.chord}-${n.noteName ?? ''}`}
              className="piano-staff-note-group absolute"
              style={{
                left: `calc(48px + (100% - 56px) * ${n.position / 100})`,
                top: `${topPercent}%`,
                transform: 'translateX(-50%)',
              }}
              data-testid="music-staff-note"
              data-chord={n.chord.chord}
              data-note={n.noteName ?? ''}
              data-voice={voiceType}
            >
              {/* Ledger lines */}
              {ledgersBelow > 0 && (
                <div className="piano-staff-ledgers absolute left-1/2 -translate-x-1/2 pointer-events-none">
                  {Array.from({ length: ledgersBelow }).map((_, i) => (
                    <div key={i} className="piano-staff-ledger" style={{ top: `${(i + 1) * 12.5}%` }} />
                  ))}
                </div>
              )}
              {ledgersAbove > 0 && (
                <div className="piano-staff-ledgers absolute left-1/2 -translate-x-1/2 pointer-events-none">
                  {Array.from({ length: ledgersAbove }).map((_, i) => (
                    <div key={i} className="piano-staff-ledger" style={{ top: `${-(i + 1) * 12.5}%` }} />
                  ))}
                </div>
              )}

              {/* Nota con color dinámico por voz */}
              <div
                className={cn(
                  'piano-staff-note transition-all duration-200',
                  n.isCurrent && 'piano-staff-note--current music-staff-note--current',
                  illuminatedNoteIndex === idx && 'piano-staff-note--illuminated music-staff-note--illuminated'
                )}
                style={{
                  background: illuminatedNoteIndex === idx
                    ? 'radial-gradient(ellipse at 30% 30%, #fef08a 0%, #fde047 50%, #facc15 100%)'
                    : n.isCurrent
                      ? `radial-gradient(ellipse at 30% 30%, ${colors.color} 0%, ${colors.color}cc 60%, ${colors.color}88 100%)`
                      : `radial-gradient(ellipse at 30% 30%, ${colors.color}88 0%, ${colors.color}66 60%, ${colors.color}44 100%)`,
                  borderColor: illuminatedNoteIndex === idx ? '#fef08a' : colors.borderColor,
                  boxShadow: illuminatedNoteIndex === idx
                    ? '0 0 20px rgba(250, 204, 21, 0.95), 0 0 40px rgba(250, 204, 21, 0.6)'
                    : `0 0 8px ${colors.glowColor}, 0 0 16px ${colors.glowColor}40`,
                }}
                data-testid="music-staff-note-head"
                data-chord={n.chord.chord}
                data-note={n.noteName ?? ''}
              />

              {/* Label de nota con color matching */}
              <span
                className="piano-staff-note-label absolute left-1/2 -translate-x-1/2 top-3 text-[9px] font-mono font-bold whitespace-nowrap pointer-events-none"
                style={{
                  color: illuminatedNoteIndex === idx ? '#fef08a' : colors.labelColor,
                  textShadow: illuminatedNoteIndex === idx
                    ? '0 0 8px rgba(250, 204, 21, 0.9), 0 0 16px rgba(0, 0, 0, 1)'
                    : `0 0 6px ${colors.glowColor}, 0 0 12px rgba(0, 0, 0, 1)`,
                }}
              >
                {noteLabel}
              </span>
            </div>
          )
        })}
      </div>

      {/* Barras de compás cada 4 beats (más visibles) */}
      {beatMarks.map((m, idx) => (
        <div
          key={idx}
          className={cn(
            'piano-staff-bar absolute top-2 bottom-2 pointer-events-none',
            m.label && 'piano-staff-bar--labeled'
          )}
          style={{ left: `calc(48px + (100% - 56px) * ${m.position / 100})` }}
          aria-hidden="true"
        >
          {m.label && (
            <span className="piano-staff-section-label absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-mono uppercase tracking-wider whitespace-nowrap">
              {m.label}
            </span>
          )}
        </div>
      ))}

      {/* Cursor de tiempo con animación */}
      {!hideCursor && (
        <div
          key={resetKey}
          className="piano-staff-cursor music-staff-cursor absolute top-0 bottom-0 pointer-events-none"
          style={{ left: '48px', width: '3px', ...cursorStyle }}
          aria-hidden="true"
        >
          <div className={cn('piano-staff-cursor-head', isPlaying && 'piano-staff-cursor-head--playing')} />
        </div>
      )}
    </div>
  )
}