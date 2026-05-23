import { useState, useCallback, useEffect } from 'react'
import { AudioEngine } from '@/audio/AudioEngine'
import type { InstrumentName } from '@/types/music'

interface UseAudioReturn {
  isReady: boolean
  isPlaying: boolean
  currentInstrument: InstrumentName
  setInstrument: (name: InstrumentName) => Promise<void>
  playNote: (note: string, duration?: number) => void
  playChord: (notes: string[], duration?: number) => void
  stop: () => void
}

export function useAudio(): UseAudioReturn {
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentInstrument, setCurrentInstrument] = useState<InstrumentName>(AudioEngine.currentInstrument)

  useEffect(() => {
    const status = AudioEngine.getStatus()
    setIsReady(status.isReady)
  }, [])

  const setInstrument = useCallback(async (name: InstrumentName) => {
    await AudioEngine.setInstrument(name)
    setCurrentInstrument(name)
  }, [])

  const playNote = useCallback((note: string, duration: number = 0.5) => {
    AudioEngine.playNote(note, duration)
    setIsPlaying(true)
    setTimeout(() => setIsPlaying(false), duration * 1000)
  }, [])

  const playChord = useCallback((notes: string[], duration: number = 0.5) => {
    AudioEngine.playChord(notes, duration)
    setIsPlaying(true)
    setTimeout(() => setIsPlaying(false), duration * 1000)
  }, [])

  const stop = useCallback(() => {
    AudioEngine.stop()
    setIsPlaying(false)
  }, [])

  return {
    isReady,
    isPlaying,
    currentInstrument,
    setInstrument,
    playNote,
    playChord,
    stop,
  }
}
