import { useState, useEffect, useCallback } from 'react'
import { Link, useParams } from 'react-router'
import { Play, Pause, RotateCcw, Loader2, Download, Trash2, Volume2, Music2 } from 'lucide-react'
import { ChordDisplay } from '@/components/ui/ChordDisplay'
import { InstrumentSelector } from '@/components/ui/InstrumentSelector'
import { ChordDiagram } from '@/components/guitar/ChordDiagram'
import { Toast } from '@/components/ui/Toast'
import { NoteDisplay } from '@/components/trumpet/NoteDisplay'
import { MusicStaff } from '@/components/practice/MusicStaff'
import { chordPlayer } from '@/audio/ChordPlayer'
import { AudioEngine } from '@/audio/AudioEngine'
import { useSong, useSongAudio } from '@/hooks/useSongs'
import { usePracticeSession } from '@/hooks/usePracticeSession'
import { useRecording } from '@/hooks/useRecording'
import { useUserSettings } from '@/hooks/useUserSettings'
import { INSTRUMENTS, type InstrumentName } from '@/types/music'
import { useTranslation } from 'react-i18next'
import * as Tone from 'tone'

export function PracticePlayerPage() {
  const { t } = useTranslation()
  const params = useParams<{ songId: string }>()
  const songId = params?.songId || ''
  const { data: song, isLoading, error } = useSong(songId)
  const createSession = usePracticeSession()
  const { data: userSettings } = useUserSettings()

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [currentChordIndex, setCurrentChordIndex] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [instrument, setInstrument] = useState<InstrumentName>('piano')
  const [showDownloadToast, setShowDownloadToast] = useState(false)
  const [staffResetKey, setStaffResetKey] = useState(0)

  useEffect(() => {
    if (userSettings?.preferred_instrument) {
      setInstrument(userSettings.preferred_instrument)
    }
  }, [userSettings?.preferred_instrument])

  const handleInstrumentChange = useCallback(async (newInst: InstrumentName) => {
    setInstrument(newInst)
    await AudioEngine.setInstrument(newInst)
  }, [])

  const recording = useRecording({ songId })
  const { data: songAudio } = useSongAudio(songId)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  useEffect(() => {
    if (songAudio?.blob) {
      const url = URL.createObjectURL(songAudio.blob)
      setAudioUrl(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setAudioUrl(null)
    }
  }, [songAudio?.blob])

  const testSound = useCallback(async () => {
    try {
      await Tone.start()
      const s = new Tone.PolySynth().toDestination()
      s.triggerAttackRelease('C4', 0.5)
      setTimeout(() => { s.dispose() }, 1000)
    } catch (err) {
      console.error('[DEBUG] testSound error:', err)
    }
  }, [])

  const sections = song?.chord_data?.sections || []
  const currentSection = sections[currentSectionIndex]
  const currentChord = currentSection?.chords[currentChordIndex]

  const isTrumpet = instrument === 'trumpet'

  const currentNote = currentChord ? chordPlayer.getChordNotes(currentChord.chord, instrument)?.[0] || null : null

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

    const playCurrent = async () => {
      if (currentChord) {
        await chordPlayer.playChord(currentChord.chord, beatDuration * currentChord.duration, instrument)
      }
    }

    playCurrent()

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
  }, [isPlaying, currentSectionIndex, currentChordIndex, currentSection, currentChord, song?.bpm, sections, instrument])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentSectionIndex(0)
    setCurrentChordIndex(0)
    setStaffResetKey((k) => k + 1)
  }

  const handleDownloadRecording = useCallback(() => {
    recording.downloadRecording()
    setShowDownloadToast(true)
  }, [recording])

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
          {t('practicePlayer.notFound')}
        </div>
        <Link
          to="/practice"
          className="inline-flex items-center gap-2 text-accent hover:underline"
        >
          {t('practicePlayer.backToSongs')}
        </Link>
      </div>
    )
  }

  const instrumentInfo = INSTRUMENTS.find(i => i.value === instrument)

  return (
    <div className="player-bg -m-4 sm:-m-6 p-4 sm:p-6 min-h-[calc(100vh-80px)]">
      <div className="relative space-y-6">
        <div className="flex items-center gap-4">
          <Link
            to="/practice"
            className="p-2 rounded-lg bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-text-primary truncate">{song.title}</h1>
            <p className="text-text-secondary text-sm truncate">{song.artist || t('practicePlayer.unknownArtist')}</p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <InstrumentSelector value={instrument} onChange={handleInstrumentChange} size="sm" />
          </div>
          <button
            onClick={testSound}
            className="p-2 rounded-lg bg-warning/20 border border-warning/30 hover:bg-warning/30 text-warning transition-colors"
            title={t('practicePlayer.testSound')}
          >
            <Volume2 size={20} />
          </button>
          {recording.recordedBlob && (
            <button
              onClick={handleDownloadRecording}
              className="p-2 rounded-lg bg-accent/20 border border-accent/30 hover:bg-accent/30 text-accent transition-colors"
              title={t('practicePlayer.downloadAudio')}
            >
              <Download size={20} />
            </button>
          )}
        </div>

        <div className="sm:hidden flex justify-center">
          <InstrumentSelector value={instrument} onChange={handleInstrumentChange} size="sm" />
        </div>

        {audioUrl && (
          <div className="bg-bg-primary/60 backdrop-blur rounded-2xl p-4 space-y-2 border border-accent/15">
            <div className="flex items-center gap-2 text-text-secondary text-sm">
              <Music2 size={16} className="text-accent" />
              <span>{t('practicePlayer.referenceAudio', { name: songAudio?.name })}</span>
            </div>
            <audio controls className="w-full">
              <source src={audioUrl} type={songAudio?.type || 'audio/mpeg'} />
            </audio>
          </div>
        )}

        {/* ===== ESCENARIO: contenedor con spotlight y anillos ===== */}
        <div className="player-stage relative overflow-hidden">
          {/* Spotlight central */}
          <div className="player-spotlight left-1/2 top-0 -translate-x-1/2 -translate-y-1/2" />

          {/* Anillos pulsantes (solo cuando playing) */}
          {isPlaying && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 pointer-events-none">
              <div className="player-ripple-ring" style={{ animationDelay: '0s' }} />
              <div className="player-ripple-ring" style={{ animationDelay: '0.8s' }} />
              <div className="player-ripple-ring" style={{ animationDelay: '1.6s' }} />
            </div>
          )}

          <div className="relative z-10 space-y-8">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-accent/20 border border-accent/40 text-accent text-sm font-mono font-bold">
                  {song.key_signature || '—'}
                </span>
                <span className="text-text-secondary text-sm font-mono">{song.bpm || 120} BPM</span>
                {instrumentInfo && (
                  <span className="px-3 py-1 rounded-full bg-bg-primary/60 border border-accent/20 text-text-secondary text-sm flex items-center gap-1">
                    <span className="text-xs">{instrumentInfo.icon}</span>
                    {t('instruments.' + instrumentInfo.value)}
                  </span>
                )}
              </div>
              <span className="px-3 py-1 rounded-full bg-bg-primary/60 border border-accent/20 text-text-secondary text-sm font-mono">
                {currentSection?.name || 'Intro'}
              </span>
            </div>

            <div className="flex flex-col items-center gap-6 py-16 relative">
              {isTrumpet && currentNote ? (
                <NoteDisplay note={currentNote} isActive={isPlaying} />
              ) : (
                <ChordDisplay chord={currentChord?.chord || '—'} isActive={true} />
              )}

              {instrument === 'guitar' && currentChord && (
                <ChordDiagram chord={currentChord.chord} />
              )}
            </div>

            {/* ===== PENTAGRAMA: línea amarilla marca el tiempo =====
                Se adapta al instrumento activo:
                  - piano/guitar: símbolos de acorde (C, G, Am…)
                  - trumpet:      notas reales por pitch (C4, G4…) con válvulas */}
            {sections.length > 0 && (
              <MusicStaff
                sections={sections}
                currentSectionIndex={currentSectionIndex}
                currentChordIndex={currentChordIndex}
                isPlaying={isPlaying}
                bpm={song?.bpm || 120}
                instrument={instrument}
                resetKey={staffResetKey}
              />
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              {currentSection?.chords.map((chord, index) => (
                <div
                  key={index}
                  className={`px-3 py-3 rounded-lg text-center font-mono font-bold transition-all ${
                    index === currentChordIndex && isPlaying
                      ? 'bg-accent text-white scale-110 glow-green shadow-lg'
                      : index === currentChordIndex
                      ? 'bg-accent/20 text-accent border border-accent/40'
                      : 'bg-bg-primary/40 text-text-secondary border border-transparent'
                  }`}
                >
                  {chord.chord}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-4 pt-4">
              {recording.recordedBlob ? (
                <button
                  onClick={recording.clearRecording}
                  className="p-4 rounded-full bg-danger/10 border border-danger/40 hover:border-danger hover:bg-danger/20 transition-colors"
                  title={t('practicePlayer.discardRecording')}
                >
                  <Trash2 className="text-danger" size={24} />
                </button>
              ) : (
                <>
                  <button
                    onClick={handleReset}
                    className="p-4 rounded-full bg-bg-primary/60 border border-accent/30 hover:border-accent hover:bg-accent/10 transition-colors"
                  >
                    <RotateCcw className="text-accent" size={24} />
                  </button>
                  <button
                    onClick={handlePlayPause}
                    className={`p-7 rounded-full transition-all ${
                      isPlaying
                        ? 'bg-accent glow-green shadow-2xl shadow-accent/40 scale-110'
                        : 'bg-accent hover:bg-accent-hover glow-green'
                    }`}
                  >
                    {isPlaying ? (
                      <Pause className="text-white" size={36} />
                    ) : (
                      <Play className="text-white ml-1" size={36} />
                    )}
                  </button>
                  <button
                    onClick={handleComplete}
                    className="p-4 rounded-full bg-bg-primary/60 border border-accent/30 hover:border-success hover:bg-success/10 transition-colors group"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success group-hover:text-success">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </button>
                  <button
                    onClick={recording.isRecording ? recording.stopRecording : recording.startRecording}
                    className={`p-4 rounded-full transition-colors ${
                      recording.isRecording
                        ? 'bg-danger text-white animate-pulse shadow-lg shadow-danger/40'
                        : 'bg-bg-primary/60 border border-accent/30 hover:border-danger hover:bg-danger/10 text-danger'
                    }`}
                    title={recording.isRecording ? t('practicePlayer.stopRecording') : t('practicePlayer.startRecording')}
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
          </div>
        </div>
      </div>
      <Toast
        message={t('practicePlayer.downloadAudio')}
        type="success"
        isVisible={showDownloadToast}
        onClose={() => setShowDownloadToast(false)}
      />
    </div>
  )
}
