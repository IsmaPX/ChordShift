/**
 * StaffPiano — Pentagrama de piano con sistema de dos pentagramas (Gran Pentagrama).
 *
 * Muestra el sistema clásico del piano:
 *  - Pentagrama superior (agudo): clave de Sol, notas de la mano derecha (C4+)
 *  - Pentagrama inferior (grave): clave de Fa, notas de la mano izquierda (<C4)
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
  // Notas por debajo de C4 van al pentagrama grave
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
 * Ajustamos restando 7 steps (7 notas diatónicas = una 8va) × 2 = -14 unidades.
 * Pero visualmente centramos en el rango [-14, -7] → [0, 4].
 */
function toBassStaffPosition(position: number): number {
  // Convertir posición de clave de sol a clave de fa:
  // El "Do central" (C4) en clave de sol está en pos -1; en clave de fa está en pos 3.5.
  // Diferencia: ~4.5 unidades (9 steps diatónicos).
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
  // Separar notas en dos pentagramas, manteniendo el índice original
  const trebleNotes = notes
    .map((n, i) => ({ ...n, originalIndex: i }))
    .filter(n => !isBassNote(n.noteName))
  const bassNotes = notes
    .map((n, i) => ({ ...n, originalIndex: i }))
    .filter(n => isBassNote(n.noteName))

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {/* ── Pentagrama superior (Clave de Sol) ── */}
      <div className="piano-staff-system">
        <SingleStaff
          notes={trebleNotes}
          beatMarks={beatMarks}
          timeline={timeline}
          cursorStyle={cursorStyle}
          resetKey={resetKey}
          clef="treble"
          label="Pentagrama Agudo"
          height="h-28"
          inset="inset-y-2"
          illuminatedNoteIndex={illuminatedNoteIndex}
        />
      </div>

      {/* Brace y barras de sistema (decorativo) */}
      <div className="flex items-stretch gap-0 -my-1">
        <div className="w-1 bg-gradient-to-b from-[rgba(212,175,55,0.6)] via-[rgba(251,191,36,0.8)] to-[rgba(212,175,55,0.6)] rounded-full ml-6 shrink-0" />
        <div className="flex-1 border-t border-dashed border-[rgba(212,175,55,0.15)]" />
      </div>

      {/* ── Pentagrama inferior (Clave de Fa) ── */}
      <div className="piano-staff-system">
        <SingleStaff
          notes={bassNotes.map(n => ({ ...n, line: toBassStaffPosition(n.line), originalIndex: n.originalIndex }))}
          beatMarks={beatMarks}
          timeline={timeline}
          cursorStyle={cursorStyle}
          resetKey={resetKey}
          clef="bass"
          label="Pentagrama Grave"
          height="h-28"
          inset="inset-y-2"
          hideCursor // El cursor solo aparece en el pentagrama superior
          illuminatedNoteIndex={illuminatedNoteIndex}
        />
      </div>
    </div>
  )
}

/** Sub-componente: un solo pentagrama de 5 líneas. */
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
}: {
  notes: ChordNote[]
  beatMarks: BeatMark[]
  timeline: StaffTimeline
  cursorStyle: React.CSSProperties
  resetKey: number
  clef: 'treble' | 'bass'
  label: string
  height: string
  inset: string
  hideCursor?: boolean
  illuminatedNoteIndex?: number
}) {
  return (
    <div
      className={cn(
        'music-staff-track relative rounded-lg overflow-hidden border border-accent/15 bg-bg-primary/40',
        height
      )}
      role="img"
      aria-label={label}
    >
      {/* Clave */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none z-10">
        {clef === 'treble' ? (
          <TrebleClef height={60} color="#22c55e" opacity={0.65} />
        ) : (
          <BassClef height={48} color="#22c55e" opacity={0.65} />
        )}
      </div>

      {/* 5 líneas del pentagrama */}
      <div className={cn('music-staff-lines absolute left-12 right-2 pointer-events-none', inset)}>
        {[0, 1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="music-staff-line absolute left-0 right-0 h-px"
            style={{ top: `${((4 - i) / 4) * 100}%` }}
          />
        ))}
      </div>

      {/* Notas */}
      <div className={cn('music-staff-notes-container absolute left-12 right-2 pointer-events-none', inset)}>
        {notes.map((n, _idx) => {
          const idx = (n as any).originalIndex ?? _idx
          const topPercent = ((4 - n.line) / 4) * 100
          const ledgersAbove = Math.max(0, Math.floor(n.line - 4))
          const ledgersBelow = Math.max(0, Math.floor(-n.line))
          const label = n.noteName ?? n.chord.chord

          return (
            <div
              key={`${idx}-${n.chord.chord}-${n.noteName ?? ''}`}
              className="music-staff-note-group absolute"
              style={{
                left: `calc(48px + (100% - 56px) * ${n.position / 100})`,
                top: `${topPercent}%`,
                transform: 'translateX(-50%)',
              }}
              data-testid="music-staff-note"
              data-chord={n.chord.chord}
              data-note={n.noteName ?? ''}
            >
              {ledgersBelow > 0 && (
                <div className="music-staff-ledgers absolute left-1/2 -translate-x-1/2 pointer-events-none">
                  {Array.from({ length: ledgersBelow }).map((_, i) => (
                    <div key={i} className="music-staff-ledger" style={{ top: `${(i + 1) * 12.5}%` }} />
                  ))}
                </div>
              )}
              {ledgersAbove > 0 && (
                <div className="music-staff-ledgers absolute left-1/2 -translate-x-1/2 pointer-events-none">
                  {Array.from({ length: ledgersAbove }).map((_, i) => (
                    <div key={i} className="music-staff-ledger" style={{ top: `${-(i + 1) * 12.5}%` }} />
                  ))}
                </div>
              )}

              <div
                className={cn(
                  'music-staff-note -mt-1.5',
                  n.isCurrent && 'music-staff-note--current',
                  illuminatedNoteIndex === idx && 'music-staff-note--illuminated'
                )}
                data-testid="music-staff-note-head"
                data-chord={n.chord.chord}
                data-note={n.noteName ?? ''}
              />
              <span className="music-staff-note-label absolute left-1/2 -translate-x-1/2 top-3 text-[9px] font-mono font-bold whitespace-nowrap pointer-events-none">
                {label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Barras de compás */}
      {beatMarks.map((m, idx) => (
        <div
          key={idx}
          className={cn(
            'music-staff-bar absolute top-2 bottom-2 pointer-events-none',
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

      {/* Cursor de tiempo */}
      {!hideCursor && (
        <div
          key={resetKey}
          className="music-staff-cursor absolute top-0 bottom-0 pointer-events-none"
          style={{ left: '48px', width: '3px', ...cursorStyle }}
          aria-hidden="true"
        >
          <div className="music-staff-cursor-head" />
        </div>
      )}
    </div>
  )
}
