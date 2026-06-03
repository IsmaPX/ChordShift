import { useEffect, useRef } from 'react'
import { chordPlayer } from '@/audio/ChordPlayer'
import { type InstrumentName } from '@/types/music'

interface Section {
  chords: { chord: string; duration: number }[]
}

interface UseChordPlaybackOptions {
  isPlaying: boolean
  sections: Section[]
  currentSectionIndex: number
  currentChordIndex: number
  bpm: number
  instrument: InstrumentName
  onChordChange: (sectionIndex: number, chordIndex: number) => void
  onSongEnd: () => void
}

/**
 * Encapsulates the sequential chord playback logic:
 * - Triggers chord audio
 * - Advances chord/section indices on beat intervals
 * - Calls back for UI state sync
 */
export function useChordPlayback({
  isPlaying,
  sections,
  currentSectionIndex,
  currentChordIndex,
  bpm,
  instrument,
  onChordChange,
  onSongEnd,
}: UseChordPlaybackOptions) {
  const beatDuration = 60 / (bpm || 120)
  const currentSection = sections[currentSectionIndex]
  const currentChord = currentSection?.chords[currentChordIndex]
  const chordTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  // Play the current chord audio
  useEffect(() => {
    if (!isPlaying || !currentChord) return

    let cancelled = false
    const play = async () => {
      if (cancelled) return
      await chordPlayer.playChord(currentChord.chord, beatDuration * currentChord.duration, instrument)
    }

    play()

    return () => {
      cancelled = true
    }
  }, [isPlaying, currentChord?.chord, currentChord?.duration, beatDuration, instrument])

  // Advance indices on interval
  useEffect(() => {
    if (!isPlaying || sections.length === 0) {
      clearInterval(chordTimerRef.current)
      chordTimerRef.current = undefined
      return
    }

    chordTimerRef.current = setInterval(() => {
      onChordChange(currentSectionIndex, currentChordIndex)
    }, beatDuration * 1000 * 2)

    return () => clearInterval(chordTimerRef.current)
  }, [isPlaying, currentSectionIndex, currentChordIndex, beatDuration, sections.length])

  // Stop at song end
  useEffect(() => {
    if (currentSection && currentChordIndex >= currentSection.chords.length - 1) {
      if (currentSectionIndex >= sections.length - 1) {
        clearInterval(chordTimerRef.current)
        onSongEnd()
      }
    }
  }, [currentChordIndex, currentSectionIndex, currentSection, sections.length])
}