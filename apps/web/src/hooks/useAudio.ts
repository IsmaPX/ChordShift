import { useState, useCallback, useEffect } from 'react'
import { AudioEngine } from '@/audio/AudioEngine'

interface UseAudioReturn {
  isReady: boolean
  isPlaying: boolean
  playNote: (note: string, duration?: number) => void
  playChord: (notes: string[], duration?: number) => void
  stop: () => void
}

export function useAudio(): UseAudioReturn {
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const status = AudioEngine.getStatus()
    setIsReady(status.isReady)
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
    playNote,
    playChord,
    stop,
  }
}