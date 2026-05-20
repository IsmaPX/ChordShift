import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router'
import { Play, Pause, RotateCcw, Loader2 } from 'lucide-react'
import { ChordDisplay } from '@/components/ui/ChordDisplay'
import { chordPlayer } from '@/audio/ChordPlayer'
import { useSong } from '@/hooks/useSongs'
import { usePracticeSession } from '@/hooks/usePracticeSession'

export function PracticePlayerPage() {
  const params = useParams<{ songId: string }>()
  const songId = params?.songId || ''
  const { data: song, isLoading, error } = useSong(songId)
  const createSession = usePracticeSession()
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [currentChordIndex, setCurrentChordIndex] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)

  const sections = song?.chord_data?.sections || []
  const currentSection = sections[currentSectionIndex]
  const currentChord = currentSection?.chords[currentChordIndex]

  useEffect(() => {
    if (song && !startTime) {
      setStartTime(Date.now())
      createSession.mutate({
        song_id: song.id,
        completed: false,
      })
    }
  }, [song])

  useEffect(() => {
    if (!isPlaying || sections.length === 0) return

    const beatDuration = 60 / (song?.bpm || 120)
    let chordTimer: ReturnType<typeof setInterval>

    const playCurrentChord = async () => {
      if (currentChord) {
        await chordPlayer.playChord(currentChord.chord, beatDuration * currentChord.duration)
      }
    }

    playCurrentChord()

    chordTimer = setInterval(() => {
      setCurrentChordIndex((prevChord) => {
        if (currentSection && prevChord >= currentSection.chords.length - 1) {
          if (currentSectionIndex < sections.length - 1) {
            setCurrentSectionIndex((prev) => prev + 1)
            return 0
          } else {
            setIsPlaying(false)
            return prevChord
          }
        }
        return prevChord + 1
      })
    }, beatDuration * 1000 * 2)

    return () => clearInterval(chordTimer)
  }, [isPlaying, currentSectionIndex, currentSection, song?.bpm, sections])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentSectionIndex(0)
    setCurrentChordIndex(0)
  }

  const handleComplete = () => {
    if (song && startTime) {
      const duration = Math.floor((Date.now() - startTime) / 1000)
      createSession.mutate({
        song_id: song.id,
        duration_s: duration,
        completed: true,
      })
    }
    setIsPlaying(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    )
  }

  if (error || !song) {
    return (
      <div className="space-y-6">
        <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger">
          No se pudo cargar la canción.
        </div>
        <Link
          to="/practice"
          className="inline-flex items-center gap-2 text-accent hover:underline"
        >
          Volver a canciones
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/practice"
          className="p-2 rounded-lg hover:bg-bg-secondary transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-primary">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{song.title}</h1>
          <p className="text-text-secondary">{song.artist || 'Artista desconocido'}</p>
        </div>
      </div>

      <div className="bg-bg-secondary rounded-2xl p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-sm">
              {song.key_signature || '—'}
            </span>
            <span className="text-text-secondary">{song.bpm || 120} BPM</span>
          </div>
          <span className="px-3 py-1 rounded-full bg-border text-text-secondary text-sm">
            {currentSection?.name || 'Intro'}
          </span>
        </div>

        <div className="flex justify-center py-12">
          <ChordDisplay chord={currentChord?.chord || '—'} isActive={true} />
        </div>

        <div className="space-y-2">
          {currentSection?.chords.map((chord, index) => (
            <div
              key={index}
              className={`px-4 py-2 rounded-lg text-center transition-colors ${
                index === currentChordIndex && isPlaying
                  ? 'bg-accent text-white'
                  : 'text-text-secondary'
              }`}
            >
              {chord.chord}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleReset}
            className="p-4 rounded-full bg-bg-secondary border border-border hover:border-accent/50 transition-colors"
          >
            <RotateCcw className="text-text-primary" size={24} />
          </button>
          <button
            onClick={handlePlayPause}
            className="p-6 rounded-full bg-accent hover:bg-accent/90 transition-colors"
          >
            {isPlaying ? (
              <Pause className="text-white" size={32} />
            ) : (
              <Play className="text-white ml-1" size={32} />
            )}
          </button>
          <button
            onClick={handleComplete}
            className="p-4 rounded-full bg-bg-secondary border border-border hover:border-success/50 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}