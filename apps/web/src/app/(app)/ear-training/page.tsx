import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Volume2, Loader2 } from 'lucide-react'
import { FeedbackCanvas } from '@/components/ui/FeedbackCanvas'
import { StreakIndicator } from '@/components/ui/StreakIndicator'
import { chordPlayer } from '@/audio/ChordPlayer'
import { useEarTrainingResult } from '@/hooks/useEarTrainingResult'
import { useAddXP } from '@/hooks/useUserSettings'
import {
  generateExercise,
  getIntervalDisplayName,
  getTriadDisplayName,
  getSeventhDisplayName,
} from '@/audio/ExerciseGenerator'
import type { Exercise } from '@/types/music'

type ExerciseType = 'interval' | 'triad' | 'seventh_chord'

const exerciseTypes: { type: ExerciseType; label: string }[] = [
  { type: 'interval', label: 'Intervalos' },
  { type: 'triad', label: 'Tríadas' },
  { type: 'seventh_chord', label: 'Acordes 7ma' },
]

export function EarTrainingPage() {
  const [selectedType, setSelectedType] = useState<ExerciseType>('interval')
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [streak, setStreak] = useState(0)
  const [xp, setXp] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)

  const saveResult = useEarTrainingResult()
  const addXP = useAddXP()

  const loadNewExercise = useCallback(() => {
    const newExercise = generateExercise(selectedType)
    setExercise(newExercise)
    setIsCorrect(null)
    setStartTime(Date.now())
  }, [selectedType])

  const handlePlaySound = async () => {
    if (!exercise || isPlaying) return

    setIsPlaying(true)
    await chordPlayer.init()

    for (const note of exercise.notes) {
      chordPlayer.playChord(note, 0.8)
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    setIsPlaying(false)
  }

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
    switch (selectedType) {
      case 'interval':
        return getIntervalDisplayName(answer)
      case 'triad':
        return getTriadDisplayName(answer)
      case 'seventh_chord':
        return getSeventhDisplayName(answer)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Ear Training</h1>
        <p className="text-text-secondary">
          Entrena tu oído identificando intervalos, tríadas y acordes
        </p>
      </div>

      <div className="flex items-center justify-between p-4 bg-bg-secondary rounded-xl border border-border">
        <div className="flex items-center gap-2">
          <StreakIndicator count={streak} />
          <span className="text-text-secondary text-sm">Racha</span>
        </div>
        <div className="text-accent font-medium">{xp} XP</div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {exerciseTypes.map((type) => (
          <button
            key={type.type}
            onClick={() => {
              setSelectedType(type.type)
              loadNewExercise()
            }}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              selectedType === type.type
                ? 'bg-accent text-white'
                : 'bg-bg-secondary text-text-secondary hover:text-text-primary'
            }`}
          >
            {type.label}
          </button>
        ))}
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
              Comenzar Ejercicio
            </button>
          </div>
        )}
      </div>
    </div>
  )
}