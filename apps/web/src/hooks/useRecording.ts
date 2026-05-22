import { useState, useRef, useCallback } from 'react'
import { AudioEngine } from '@/audio/AudioEngine'
import { db } from '@/lib/db'
import { useAuth } from './useAuth'
import type { Recording } from '@/types/music'

interface RecordingOptions {
  songId: string
  practiceSessionId?: string | null
}

interface RecordingState {
  isRecording: boolean
  recordedBlob: Blob | null
  isSaving: boolean
  savedRecording: Recording | null
  recordingDuration: number
}

export function useRecording({ songId, practiceSessionId }: RecordingOptions) {
  const { user } = useAuth()
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    recordedBlob: null,
    isSaving: false,
    savedRecording: null,
    recordingDuration: 0,
  })
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimestampRef = useRef<number>(0)

  const startRecording = useCallback(async () => {
    if (state.isRecording || !user) return

    await AudioEngine.startRecording()
    startTimestampRef.current = Date.now()
    timerRef.current = setInterval(() => {
      setState((prev) => ({
        ...prev,
        recordingDuration: Math.floor((Date.now() - startTimestampRef.current) / 1000),
      }))
    }, 200)
    setState((prev) => ({ ...prev, isRecording: true }))
  }, [state.isRecording, user])

  const stopRecording = useCallback(async () => {
    if (!state.isRecording) return

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    const blob = await AudioEngine.stopRecording()
    const duration = Math.floor((Date.now() - startTimestampRef.current) / 1000)

    setState((prev) => ({
      ...prev,
      isRecording: false,
      recordedBlob: blob,
      recordingDuration: duration,
    }))
  }, [state.isRecording])

  const downloadRecording = useCallback((filename?: string) => {
    if (!state.recordedBlob) return

    const name = filename || `recording-${songId}-${Date.now()}.webm`
    const url = URL.createObjectURL(state.recordedBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [state.recordedBlob, songId])

  const saveRecording = useCallback(async () => {
    if (!state.recordedBlob || !user || state.isSaving) return null

    setState((prev) => ({ ...prev, isSaving: true }))

    try {
      const recording: Recording = {
        id: crypto.randomUUID(),
        user_id: user.id,
        song_id: songId,
        practice_session_id: practiceSessionId || null,
        title: `Práctica - ${new Date().toLocaleDateString()}`,
        started_at: new Date(startTimestampRef.current).toISOString(),
        duration_s: state.recordingDuration,
        audio_data: state.recordedBlob,
      }

      await db.recordings.add(recording)
      setState((prev) => ({ ...prev, isSaving: false, savedRecording: recording }))
      return recording
    } catch (err) {
      setState((prev) => ({ ...prev, isSaving: false }))
      throw err
    }
  }, [state.recordedBlob, state.isSaving, state.recordingDuration, user, songId, practiceSessionId])

  const clearRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    AudioEngine.stop()
    setState({
      isRecording: false,
      recordedBlob: null,
      isSaving: false,
      savedRecording: null,
      recordingDuration: 0,
    })
  }, [])

  return {
    ...state,
    startRecording,
    stopRecording,
    downloadRecording,
    saveRecording,
    clearRecording,
  }
}
