import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Volume2, Loader2 } from 'lucide-react'
import { FeedbackCanvas } from '@/components/ui/FeedbackCanvas'
import { StreakIndicator } from '@/components/ui/StreakIndicator'
import { InstrumentSelector } from '@/components/ui/InstrumentSelector'
import { AudioEngine } from '@/audio/AudioEngine'
import { chordPlayer, notesToChordSymbol } from '@/audio/ChordPlayer'
import { useEarTrainingResult } from '@/hooks/useEarTrainingResult'
import { useAddXP, useUserSettings } from '@/hooks/useUserSettings'
import {
  generateExercise,
  INTERVAL_KEYS,
  TRIAD_KEYS,
  SEVENTH_KEYS,
} from '@/audio/ExerciseGenerator'
import { useTranslation } from 'react-i18next'
import type { Exercise, InstrumentName } from '@/types/music'

type ExerciseType = 'interval' | 'triad' | 'seventh_chord'

const displayNameKeys: Record<ExerciseType, Record<string, string>> = {
  interval: INTERVAL_KEYS,
  triad: TRIAD_KEYS,
  seventh_chord: SEVENTH_KEYS,
}

export function EarTrainingPage() {
  const { t } = useTranslation()
  const [selectedType, setSelectedType] = useState<ExerciseType>('interval')
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [streak, setStreak] = useState(0)
  const [xp, setXp] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [instrument, setInstrument] = useState<InstrumentName>('piano')

  const { data: userSettings } = useUserSettings()
  const saveResult = useEarTrainingResult()
  const addXP = useAddXP()

  useEffect(() => {
    if (userSettings?.preferred_instrument) {
      setInstrument(userSettings.preferred_instrument)
    }
  }, [userSettings?.preferred_instrument])

  const handleInstrumentChange = useCallback(async (newInst: InstrumentName) => {
    setInstrument(newInst)
    await AudioEngine.setInstrument(newInst)
  }, [])

  const loadNewExercise = useCallback(() => {
    const newExercise = generateExercise(selectedType)
    setExercise(newExercise)
    setIsCorrect(null)
    setStartTime(Date.now())
  }, [selectedType])

  const playArpeggiated = useCallback(async (notes: string[], totalDuration: number) => {
    if (notes.length === 0) return
    const gap = 0.12
    const noteDuration = Math.max(totalDuration / notes.length, totalDuration - gap * (notes.length - 1))
    for (let i = 0; i < notes.length; i++) {
      AudioEngine.playNote(notes[i], noteDuration)
      if (i < notes.length - 1) {
        await new Promise((r) => setTimeout(r, gap * 1000))
      }
    }
    await new Promise((r) => setTimeout(r, (totalDuration - gap * (notes.length - 1)) * 1000))
  }, [])

  const handlePlaySound = useCallback(async () => {
    if (!exercise || isPlaying) return

    setIsPlaying(true)

    if (instrument === 'trumpet') {
      await playArpeggiated(exercise.notes, 1.5)
    } else if (instrument === 'guitar' && exercise.notes.length >= 3) {
      const symbol = notesToChordSymbol(exercise.notes)
      if (symbol) {
        await chordPlayer.playChord(symbol, 1.2, 'guitar')
        await new Promise((r) => setTimeout(r, 1500))
      } else {
        AudioEngine.playChord(exercise.notes, 1.2)
        await new Promise((r) => setTimeout(r, 1500))
      }
    } else {
      AudioEngine.playChord(exercise.notes, 1.2)
      await new Promise((r) => setTimeout(r, 1500))
    }

    setIsPlaying(false)
  }, [exercise, isPlaying, instrument, playArpeggiated])

  const handleAnswer = async (selectedAnswer: string) => {
    if (!exercise || isCorrect !== null) return

    const correct = selectedAnswer === exercise.answer
    const responseMs = startTime ? Date.now() - startTime : 0

    setIsCorrect(correct)

    // Save result to database
    saveResult.mutate({
      exercise_type: exercise.type,
      question: {
        notes: exercise.notes,
        root: exercise.notes[0],
      },
      answer_given: selectedAnswer,
      correct_answer: exercise.answer,
      is_correct: correct,
      response_ms: responseMs,
    })

    if (correct) {
      setStreak((prev) => prev + 1)
      const bonus = responseMs < 3000 ? 5 : 0
      setXp((prev) => prev + 10 + bonus)
      addXP.mutate(10 + bonus)
    } else {
      setStreak(0)
    }

    setTimeout(() => {
      loadNewExercise()
    }, 1200)
  }

  const getDisplayName = (answer: string) => {
    const keyMap = displayNameKeys[selectedType]
    const key = keyMap[answer] || answer
    return t(key)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">{t('earTraining.title')}</h1>
        <p className="text-text-secondary">
          {t('earTraining.subtitle')}
        </p>
      </div>

      <div className="flex items-center justify-between p-4 bg-bg-secondary rounded-xl border border-border">
        <div className="flex items-center gap-2">
          <StreakIndicator count={streak} />
          <span className="text-text-secondary text-sm">{t('earTraining.streak')}</span>
        </div>
        <div className="text-accent font-medium">{xp} XP</div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
        {(['interval', 'triad', 'seventh_chord'] as ExerciseType[]).map((type) => (
          <button
            key={type}
            onClick={() => {
              setSelectedType(type)
              loadNewExercise()
            }}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              selectedType === type
                ? 'bg-accent text-white'
                : 'bg-bg-secondary text-text-secondary hover:text-text-primary'
            }`}
          >
            {t('earTraining.' + type)}
          </button>
        ))}
      </div>
        <div className="flex-shrink-0">
          <InstrumentSelector value={instrument} onChange={handleInstrumentChange} size="sm" />
        </div>
      </div>

      <div className="bg-bg-secondary rounded-2xl p-8 space-y-8">
        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlaySound}
            disabled={!exercise || isPlaying}
            className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center hover:bg-accent/30 transition-colors disabled:opacity-50"
          >
            {isPlaying ? (
              <Loader2 className="text-accent animate-spin" size={32} />
            ) : (
              <Volume2 className="text-accent" size={32} />
            )}
          </motion.button>
        </div>

        <div className="flex justify-center">
          <FeedbackCanvas
            concept="rings"
            isCorrect={isCorrect}
            onAnimationComplete={() => {}}
          />
        </div>

        {exercise && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {exercise.options.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                disabled={isCorrect !== null}
                className="p-4 rounded-xl bg-bg-primary border border-border text-text-primary hover:border-accent/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {getDisplayName(option)}
              </button>
            ))}
          </div>
        )}

        {!exercise && (
          <div className="text-center">
            <button
              onClick={loadNewExercise}
              className="px-6 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-colors"
            >
              {t('earTraining.startExercise')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}