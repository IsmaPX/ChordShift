import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useCallback, useRef } from 'react'

interface Note {
  id: string
  chord: string
  lane: number
  progress: number
  duration: number
}

interface Chord {
  chord: string
  beat: number
  duration: number
}

interface RhythmGameBoardProps {
  chords: Chord[]
  isPlaying: boolean
  bpm: number
}

const LANE_COLORS = [
  { gradient: 'from-[#00d4ff] to-[#0088ff]', glow: 'shadow-[0_0_15px_rgba(0,212,255,0.4)]' },
  { gradient: 'from-[#a855f7] to-[#7c3aed]', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.4)]' },
  { gradient: 'from-[#ff6ec7] to-[#ec4899]', glow: 'shadow-[0_0_15px_rgba(255,110,199,0.4)]' },
  { gradient: 'from-[#22c55e] to-[#16a34a]', glow: 'shadow-[0_0_15px_rgba(34,197,94,0.4)]' },
]

const NOTE_HEIGHTS: Record<string, string> = {
  small: 'h-12',
  medium: 'h-16',
  large: 'h-20',
}

function getNoteSize(duration: number): string {
  if (duration >= 4) return NOTE_HEIGHTS.large
  if (duration >= 2) return NOTE_HEIGHTS.medium
  return NOTE_HEIGHTS.small
}

export function RhythmGameBoard({
  chords,
  isPlaying,
  bpm,
}: RhythmGameBoardProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const animationRef = useRef<number | undefined>(undefined)
  const startTimeRef = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const BEAT_DURATION = 60 / bpm
  const FALL_DURATION = 2.5
  const HIT_LINE_POSITION = 85

  const spawnNotes = useCallback(() => {
    if (!isPlaying || chords.length === 0) return

    const newNotes: Note[] = chords.map((chord, index) => ({
      id: `note-${index}`,
      chord: chord.chord,
      lane: index % 4,
      progress: -0.1,
      duration: chord.duration,
    }))

    setNotes(newNotes)
    startTimeRef.current = Date.now()
  }, [chords, isPlaying])

  useEffect(() => {
    if (isPlaying) {
      spawnNotes()
    } else {
      setNotes([])
    }
  }, [isPlaying, spawnNotes])

  useEffect(() => {
    if (!isPlaying) return

    const animate = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000

      setNotes(prevNotes =>
        prevNotes.map((note, index) => {
          const noteStartTime = index * BEAT_DURATION
          const noteElapsed = elapsed - noteStartTime
          const progress = noteElapsed / FALL_DURATION

          return {
            ...note,
            progress: Math.min(Math.max(progress, -0.1), 1.1),
          }
        }).filter(note => note.progress < 1.1)
      )

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, BEAT_DURATION, FALL_DURATION])

  const handleNoteComplete = useCallback((noteId: string) => {
    setNotes(prev => prev.filter(n => n.id !== noteId))
  }, [])

  return (
    <div className="relative w-full h-[500px] bg-gradient-to-b from-[#0a0a15] via-[#0d0d1a] to-[#0a0a15] rounded-xl overflow-hidden border border-white/[0.05]">
      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,212,255,0.5) 2px, rgba(0,212,255,0.5) 4px)',
        }}
      />

      {/* Grid background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0,212,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }} />
      </div>

      {/* Lane dividers */}
      <div className="absolute inset-0 flex">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex-1 border-r border-white/[0.03]" />
        ))}
        <div className="flex-1" />
      </div>

      {/* Notes container */}
      <div ref={containerRef} className="absolute inset-0">
        <AnimatePresence>
          {notes.map((note) => {
            const heightClass = getNoteSize(note.duration)
            const laneStyle = LANE_COLORS[note.lane % LANE_COLORS.length]
            const isPast = note.progress > HIT_LINE_POSITION / 100

            return (
              <motion.div
                key={note.id}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: isPast ? 0.3 : 1,
                  y: `${note.progress * 100}%`,
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'linear', duration: 0.016 }}
                onAnimationComplete={() => handleNoteComplete(note.id)}
                className="absolute w-[22%]"
                style={{
                  left: `${note.lane * 25 + 1}%`,
                  top: 0,
                }}
              >
                {/* Note block */}
                <div
                  className={`
                    ${heightClass} w-full rounded-lg
                    bg-gradient-to-r ${laneStyle.gradient}
                    ${laneStyle.glow}
                    border border-white/20
                    flex items-center justify-center
                    relative
                    overflow-hidden
                  `}
                >
                  {/* Inner glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  />

                  {/* Chord label */}
                  <span className="relative z-10 font-bold text-white text-lg tracking-wider uppercase drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                    {note.chord}
                  </span>
                </div>

                {/* Lane indicator line */}
                <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${laneStyle.gradient} opacity-50`} />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Hit line / Judgment line */}
      <div
        className="absolute left-0 right-0 h-[3px]"
        style={{ top: `${HIT_LINE_POSITION}%` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00d4ff] to-transparent" />
        <div className="absolute inset-0 bg-[#00d4ff] blur-sm opacity-60" />
        <div className="absolute inset-0 bg-[#00d4ff] blur-md opacity-40" />

        {/* Center diamond marker */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            className="w-4 h-4 rotate-45 bg-[#00d4ff]"
            animate={{
              boxShadow: [
                '0 0 10px #00d4ff, 0 0 20px #00d4ff',
                '0 0 20px #00d4ff, 0 0 40px #00d4ff',
                '0 0 10px #00d4ff, 0 0 20px #00d4ff',
              ],
            }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        </div>
      </div>

      {/* Hit zone indicator */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{ top: `${HIT_LINE_POSITION - 8}%`, height: '16%' }}
      >
        <div className="h-full border border-[#00d4ff]/10 rounded-lg" />
      </div>

      {/* Top fade */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#0a0a15] to-transparent pointer-events-none" />

      {/* Bottom fade with glow at hit line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: `linear-gradient(to top, rgba(0,212,255,0.05) 0%, transparent 100%)`,
        }}
      />

      {/* Corner decorations - cyberpunk style */}
      <svg className="absolute top-2 left-2 w-6 h-6 text-[#00d4ff]/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M2 12V2h10M2 2l10 10" />
      </svg>
      <svg className="absolute top-2 right-2 w-6 h-6 text-[#a855f7]/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M22 12V2h-10M22 2l-10 10" />
      </svg>
      <svg className="absolute bottom-2 left-2 w-6 h-6 text-[#a855f7]/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M2 12v10h10M2 22l10-10" />
      </svg>
      <svg className="absolute bottom-2 right-2 w-6 h-6 text-[#00d4ff]/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M22 12v10h-10M22 22l-10-10" />
      </svg>

      {/* BPM indicator */}
      <div className="absolute top-3 right-3 flex items-center gap-2">
        <div className="px-2 py-1 bg-[#0a0a15]/80 border border-[#00d4ff]/30 rounded text-xs font-mono text-[#00d4ff]">
          {bpm} BPM
        </div>
      </div>

      {/* Current section indicator */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
        <div className="px-4 py-1.5 bg-[#0a0a15]/80 border border-[#a855f7]/30 rounded-full">
          <span className="text-xs font-medium text-white/70 uppercase tracking-wider">
            {isPlaying ? 'Playing' : 'Paused'}
          </span>
        </div>
      </div>
    </div>
  )
}