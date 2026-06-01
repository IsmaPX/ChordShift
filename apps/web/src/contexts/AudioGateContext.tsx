import { createContext, useContext, useState, useCallback } from 'react'
import { AudioEngine } from '@/audio/AudioEngine'

interface AudioGateContextType {
  isAudioReady: boolean
  showGate: boolean
  error: string | null
  handleStartAudio: () => Promise<void>
}

const AudioGateContext = createContext<AudioGateContextType | undefined>(undefined)

export function AudioGateProvider({ children }: { children: React.ReactNode }) {
  const [isAudioReady, setIsAudioReady] = useState(false)
  const [showGate, setShowGate] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleStartAudio = useCallback(async () => {
    try {
      setError(null)
      await AudioEngine.initialize()
      setIsAudioReady(true)
      setShowGate(false)
    } catch (err) {
      console.error('Failed to initialize audio:', err)
      setError('Error al inicializar el audio')
    }
  }, [])

  return (
    <AudioGateContext.Provider
      value={{
        isAudioReady,
        showGate,
        error,
        handleStartAudio,
      }}
    >
      {children}
    </AudioGateContext.Provider>
  )
}

export function useAudioGate() {
  const context = useContext(AudioGateContext)
  if (!context) {
    throw new Error('useAudioGate must be used within an AudioGateProvider')
  }
  return context
}
