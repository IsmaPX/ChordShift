import { useState, useRef, useCallback } from 'react'
import { AudioEngine } from '@/audio/AudioEngine'

interface RecordingOptions {
  songId: string
}

interface RecordingState {
  isRecording: boolean
  recordedBlob: Blob | null
  recordingDuration: number
}

export function useRecording({ songId }: RecordingOptions) {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    recordedBlob: null,
    recordingDuration: 0,
  })
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimestampRef = useRef<number>(0)

  const downloadBlob = useCallback((blob: Blob, filename?: string) => {
    const name = filename || `recording-${songId}-${Date.now()}.webm`
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [songId])

  const startRecording = useCallback(async () => {
    if (state.isRecording) return

    await AudioEngine.startRecording()
    startTimestampRef.current = Date.now()
    timerRef.current = setInterval(() => {
      setState((prev) => ({
        ...prev,
        recordingDuration: Math.floor((Date.now() - startTimestampRef.current) / 1000),
      }))
    }, 200)
    setState((prev) => ({ ...prev, isRecording: true }))
  }, [state.isRecording])

  const stopRecording = useCallback(async () => {
    if (!state.isRecording) return

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    const blob = await AudioEngine.stopRecording()
    const duration = Math.floor((Date.now() - startTimestampRef.current) / 1000)

    if (blob) {
      downloadBlob(blob)
    }

    setState((prev) => ({
      ...prev,
      isRecording: false,
      recordedBlob: blob,
      recordingDuration: duration,
    }))
  }, [state.isRecording, downloadBlob])

  const downloadRecording = useCallback(() => {
    if (!state.recordedBlob) return
    downloadBlob(state.recordedBlob)
  }, [state.recordedBlob, downloadBlob])

  const clearRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    AudioEngine.stop()
    setState({
      isRecording: false,
      recordedBlob: null,
      recordingDuration: 0,
    })
  }, [])

  return {
    ...state,
    startRecording,
    stopRecording,
    downloadRecording,
    clearRecording,
  }
}
