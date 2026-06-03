import { useState, useEffect, useCallback } from 'react'
import { Link, useParams } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Loader2, Download, Trash2, Volume2, Music2 } from 'lucide-react'
import { ChordDisplay } from '@/components/ui/ChordDisplay'
import { InstrumentSelector } from '@/components/ui/InstrumentSelector'
import { ChordDiagram } from '@/components/guitar/ChordDiagram'
import { Toast } from '@/components/ui/Toast'
import { NoteDisplay } from '@/components/trumpet/NoteDisplay'
import { RhythmGameBoard } from '@/components/practice/RhythmGameBoard'
import { chordPlayer } from '@/audio/ChordPlayer'
import { AudioEngine } from '@/audio/AudioEngine'
import { useSong, useSongAudio } from '@/hooks/useSongs'
import { usePracticeSession } from '@/hooks/usePracticeSession'
import { useRecording } from '@/hooks/useRecording'
import { useUserSettings } from '@/hooks/useUserSettings'
import { useChordPlayback } from '@/hooks/useChordPlayback'
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
  const [showRhythmMode, setShowRhythmMode] = useState(true)

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

  // Advance chord/section indices every 2 beats
  const handleChordChange = useCallback((secIdx: number, _chordIdx: number) => {
    const section = sections[secIdx]
    if (section && _chordIdx >= section.chords.length - 1) {
      if (secIdx < sections.length - 1) {
        setCurrentSectionIndex(secIdx + 1)
        setCurrentChordIndex(0)
      } else {
        setIsPlaying(false)
      }
    } else {
      setCurrentChordIndex(prev => Math.min(prev + 1, (sections[secIdx]?.chords.length ?? 1) - 1))
    }
  }, [sections])

  useChordPlayback({
    isPlaying,
    sections,
    currentSectionIndex,
    currentChordIndex,
    bpm: song?.bpm || 120,
    instrument,
    onChordChange: handleChordChange,
    onSongEnd: () => setIsPlaying(false),
  })

  useEffect(() => {
    if (song && !startTime) {
      setStartTime(Date.now())
      createSession.mutate({
        song_id: song.id,
        completed: false,
      })
    }
  }, [song])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentSectionIndex(0)
    setCurrentChordIndex(0)
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
        <Loader2 className="animate-spin text-[#22c55e]" size={32} />
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
          className="inline-flex items-center gap-2 text-[#22c55e] hover:underline"
        >
          {t('practicePlayer.backToSongs')}
        </Link>
      </div>
    )
  }

  const instrumentInfo = INSTRUMENTS.find(i => i.value === instrument)

  return (
    <div className="space-y-6">
      {/* Top Navigation Bar - UNCHANGED */}
      <div className="flex items-center gap-4">
        <Link
          to="/practice"
          className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{song.title}</h1>
          <p className="text-white/50">{song.artist || t('practicePlayer.unknownArtist')}</p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <InstrumentSelector value={instrument} onChange={handleInstrumentChange} size="sm" />
        </div>
        <button
          onClick={testSound}
          className="p-2 rounded-lg hover:bg-white/[0.06] text-white/50 hover:text-white transition-colors"
          title={t('practicePlayer.testSound')}
        >
          <Volume2 size={20} />
        </button>
        {recording.recordedBlob && (
          <button
            onClick={handleDownloadRecording}
            className="p-2 rounded-lg hover:bg-white/[0.06] text-[#22c55e] transition-colors"
            title={t('practicePlayer.downloadAudio')}
          >
            <Download size={20} />
          </button>
        )}
      </div>

      {/* Mobile instrument selector */}
      <div className="sm:hidden flex justify-center">
        <InstrumentSelector value={instrument} onChange={handleInstrumentChange} size="sm" />
      </div>

      {/* Audio player if available */}
      {audioUrl && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-4 space-y-2 border border-white/[0.06] bg-white/[0.03]"
        >
          <div className="flex items-center gap-2 text-white/50 text-sm">
            <Music2 size={16} />
            <span>{t('practicePlayer.referenceAudio', { name: songAudio?.name })}</span>
          </div>
          <audio controls className="w-full">
            <source src={audioUrl} type={songAudio?.type || 'audio/mpeg'} />
          </audio>
        </motion.div>
      )}

      {/* Main Practice Container */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm overflow-hidden">
        {/* Metadata Header - UNCHANGED */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.05]">
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 rounded-full bg-[#22c55e]/15 text-[#22c55e] text-sm font-medium">
              {song.key_signature || '—'}
            </span>
            <span className="text-white/50 text-sm font-mono">{song.bpm || 120} BPM</span>
            {instrumentInfo && (
              <span className="px-3 py-1 rounded-full bg-white/[0.06] text-white/50 text-sm flex items-center gap-1">
                <span className="text-xs">{instrumentInfo.icon}</span>
                {t('instruments.' + instrumentInfo.value)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* View mode toggle */}
            <button
              onClick={() => setShowRhythmMode(!showRhythmMode)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                showRhythmMode
                  ? 'bg-gradient-to-r from-[#00d4ff] to-[#a855f7] text-white'
                  : 'bg-white/[0.05] text-white/50 hover:text-white'
              }`}
            >
              {showRhythmMode ? '🎮 Ritmo' : '📋 Lista'}
            </button>
            <span className="px-3 py-1 rounded-full bg-white/[0.06] text-white/50 text-sm">
              {currentSection?.name || 'Intro'}
            </span>
          </div>
        </div>

        {/* Central Practice Area - TRANSFORMED */}
        <div className="p-4">
          <AnimatePresence mode="wait">
            {showRhythmMode ? (
              <motion.div
                key="rhythm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <RhythmGameBoard
                  chords={currentSection?.chords || []}
                  isPlaying={isPlaying}
                  bpm={song.bpm || 120}
                />
              </motion.div>
            ) : (
              <motion.div
                key="classic"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Classic chord display */}
                <div className="flex flex-col items-center gap-6 py-12">
                  {isTrumpet && currentNote ? (
                    <NoteDisplay note={currentNote} isActive={isPlaying} />
                  ) : (
                    <ChordDisplay chord={currentChord?.chord || '—'} isActive={true} />
                  )}

                  {instrument === 'guitar' && currentChord && (
                    <ChordDiagram chord={currentChord.chord} />
                  )}
                </div>

                {/* Chord list */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {currentSection?.chords.map((chord, index) => (
                    <div
                      key={index}
                      className={`px-4 py-2.5 rounded-lg text-center transition-all ${
                        index === currentChordIndex && isPlaying
                          ? 'bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                          : index < currentChordIndex
                          ? 'bg-white/[0.02] text-white/30'
                          : 'bg-white/[0.05] text-white/70'
                      }`}
                    >
                      <span className="font-medium">{chord.chord}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Playback Controls - UNCHANGED */}
        <div className="flex items-center justify-center gap-4 p-6 border-t border-white/[0.05]">
          {recording.recordedBlob ? (
            <button
              onClick={recording.clearRecording}
              className="p-4 rounded-full bg-white/[0.03] border border-white/[0.08] hover:border-danger/50 transition-all"
              title={t('practicePlayer.discardRecording')}
            >
              <Trash2 className="text-danger" size={24} />
            </button>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReset}
                className="p-4 rounded-full bg-white/[0.03] border border-white/[0.08] hover:border-[#22c55e]/50 transition-all"
              >
                <RotateCcw className="text-white" size={24} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1, boxShadow: '0 0 40px rgba(34,197,94,0.4)' }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePlayPause}
                className="p-6 rounded-full bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#16a34a] hover:to-[#22c55e] transition-all shadow-[0_0_30px_rgba(34,197,94,0.3)]"
              >
                {isPlaying ? (
                  <Pause className="text-white" size={32} />
                ) : (
                  <Play className="text-white ml-1" size={32} />
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleComplete}
                className="p-4 rounded-full bg-white/[0.03] border border-white/[0.08] hover:border-[#22c55e]/50 transition-all"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={recording.isRecording ? recording.stopRecording : recording.startRecording}
                className={`p-4 rounded-full transition-all ${
                  recording.isRecording
                    ? 'bg-danger text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                    : 'bg-white/[0.03] border border-white/[0.08] hover:border-danger/50 text-danger'
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
              </motion.button>
            </>
          )}
        </div>

        {/* Recording indicator */}
        <AnimatePresence>
          {recording.isRecording && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center justify-center gap-2 pb-4 text-danger"
            >
              <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
              <span className="text-sm font-mono">
                {String(Math.floor(recording.recordingDuration / 60)).padStart(2, '0')}:
                {String(recording.recordingDuration % 60).padStart(2, '0')}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
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