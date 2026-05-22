import { useState, useEffect, useCallback } from 'react'
import { Link, useParams } from 'react-router'
import { Play, Pause, RotateCcw, Loader2, Download, Save, Trash2, Volume2 } from 'lucide-react'
import { ChordDisplay } from '@/components/ui/ChordDisplay'
import { chordPlayer } from '@/audio/ChordPlayer'
import { useSong } from '@/hooks/useSongs'
import { usePracticeSession } from '@/hooks/usePracticeSession'
import { useRecording } from '@/hooks/useRecording'
import * as Tone from 'tone'

export function PracticePlayerPage() {
  const params = useParams<{ songId: string }>()
  const songId = params?.songId || ''
  const { data: song, isLoading, error } = useSong(songId)
  const createSession = usePracticeSession()
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [currentChordIndex, setCurrentChordIndex] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)

  const recording = useRecording({ songId })

  const testSound = useCallback(async () => {
    console.log('[DEBUG] testSound clicked')
    try {
      await Tone.start()
      const s = new Tone.PolySynth().toDestination()
      s.triggerAttackRelease('C4', 0.5)
      console.log('[DEBUG] testSound: note played, context state:', Tone.getContext().state)
      setTimeout(() => { s.dispose(); console.log('[DEBUG] testSound: synth disposed') }, 1000)
    } catch (err) {
      console.error('[DEBUG] testSound error:', err)
    }
  }, [])

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
    let chordTimer: ReturnType<typeof setInterval> | undefined

    const playCurrentChord = async () => {
      if (currentChord) {
        console.log('[PLAY] chord:', currentChord.chord, 'duration:', beatDuration * currentChord.duration, 'bpm:', song?.bpm)
        await chordPlayer.playChord(currentChord.chord, beatDuration * currentChord.duration)
      } else {
        console.warn('[PLAY] currentChord is falsy', { currentSectionIndex, currentChordIndex, sectionsLength: sections.length })
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
  }, [isPlaying, currentSectionIndex, currentChordIndex, currentSection, currentChord, song?.bpm, sections])

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
        <button
          onClick={testSound}
          className="ml-auto p-2 rounded-lg bg-warning/20 hover:bg-warning/30 text-warning transition-colors"
          title="Probar sonido (debug)"
        >
          <Volume2 size={20} />
        </button>
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
          {recording.recordedBlob ? (
            <>
              <button
                onClick={recording.clearRecording}
                className="p-4 rounded-full bg-bg-secondary border border-border hover:border-danger/50 transition-colors"
                title="Descartar grabación"
              >
                <Trash2 className="text-danger" size={24} />
              </button>
              <button
                onClick={() => recording.downloadRecording(`${song?.title || 'grabacion'}.webm`)}
                className="p-4 rounded-full bg-bg-secondary border border-border hover:border-accent/50 transition-colors"
                title="Descargar audio"
              >
                <Download className="text-accent" size={24} />
              </button>
              <button
                onClick={async () => {
                  await recording.saveRecording()
                }}
                disabled={recording.isSaving}
                className="p-4 rounded-full bg-success/20 border border-success/50 hover:bg-success/30 transition-colors disabled:opacity-50"
                title="Guardar en la app"
              >
                <Save className="text-success" size={24} />
              </button>
            </>
          ) : (
            <>
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
              <button
                onClick={recording.isRecording ? recording.stopRecording : recording.startRecording}
                className={`p-4 rounded-full transition-colors ${
                  recording.isRecording
                    ? 'bg-danger text-white animate-pulse'
                    : 'bg-bg-secondary border border-border hover:border-danger/50 text-danger'
                }`}
                title={recording.isRecording ? 'Detener grabación' : 'Iniciar grabación'}
              >
                {recording.isRecording ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="6" />
                  </svg>
                )}
              </button>
            </>
          )}
        </div>
        {recording.isRecording && (
          <div className="flex items-center justify-center gap-2 text-danger">
            <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
            <span className="text-sm font-mono">
              {String(Math.floor(recording.recordingDuration / 60)).padStart(2, '0')}:
              {String(recording.recordingDuration % 60).padStart(2, '0')}
            </span>
          </div>
        )}
        {recording.savedRecording && (
          <div className="text-center text-sm text-success">
            Grabación guardada correctamente
          </div>
        )}
      </div>
    </div>
  )
}