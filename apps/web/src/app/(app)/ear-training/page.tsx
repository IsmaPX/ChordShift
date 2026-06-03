import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, Loader2, Music2 } from 'lucide-react'
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

const exerciseTypes: { type: ExerciseType; label: string }[] = [
  { type: 'interval', label: 'Intervalos' },
  { type: 'triad', label: 'Tríadas' },
  { type: 'seventh_chord', label: 'Acordes 7' },
]

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
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        <h1 className="text-3xl font-bold text-white">{t('earTraining.title')}</h1>
        <p className="text-white/50">{t('earTraining.subtitle')}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
        className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm"
      >
        <div className="flex items-center gap-3">
          <StreakIndicator count={streak} />
          <span className="text-white/50 text-sm">{t('earTraining.streak')}</span>
        </div>
        <motion.div
          className="text-[#22c55e] font-bold text-lg"
          key={xp}
          initial={{ scale: 1.3, color: '#ffffff' }}
          animate={{ scale: 1, color: '#22c55e' }}
        >
          {xp} XP
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
        className="flex items-center justify-between gap-4"
      >
        <div className="flex gap-2 overflow-x-auto pb-2">
          {exerciseTypes.map(({ type, label }) => (
            <motion.button
              key={type}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedType(type)
                loadNewExercise()
              }}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                selectedType === type
                  ? 'bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                  : 'bg-white/[0.03] text-white/50 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              {label}
            </motion.button>
          ))}
        </div>
        <div className="flex-shrink-0">
          <InstrumentSelector value={instrument} onChange={handleInstrumentChange} size="sm" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
        className="rounded-2xl p-8 space-y-8 border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm"
      >
        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(34,197,94,0.3)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlaySound}
            disabled={!exercise || isPlaying}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-[#22c55e]/20 to-[#16a34a]/10 flex items-center justify-center hover:from-[#22c55e]/30 hover:to-[#16a34a]/15 transition-all disabled:opacity-50 shadow-[0_0_30px_rgba(34,197,94,0.15)]"
          >
            {isPlaying ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <Loader2 className="text-[#22c55e]" size={32} />
              </motion.div>
            ) : (
              <Volume2 className="text-[#22c55e]" size={32} />
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

        <AnimatePresence mode="wait">
          {exercise && (
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-4 gap-3"
              key={exercise.type + (exercise.notes.join(','))}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              {exercise.options.map((option) => {
                const wasChosen = isCorrect !== null && option === exercise.answer
                const wasWrong = isCorrect === false

                return (
                  <motion.button
                    key={option}
                    whileHover={isCorrect === null ? { scale: 1.02, borderColor: 'rgba(34,197,94,0.3)' } : {}}
                    whileTap={isCorrect === null ? { scale: 0.98 } : {}}
                    onClick={() => handleAnswer(option)}
                    disabled={isCorrect !== null}
                    animate={
                      wasChosen ? { scale: 1.05, borderColor: '#22c55e', borderWidth: 2 }
                        : wasWrong ? { x: [0, -5, 5, -5, 5, 0], opacity: 0.5 }
                        : { opacity: 1 }
                    }
                    className={`p-4 rounded-xl border transition-all disabled:cursor-not-allowed ${
                      wasChosen
                        ? 'bg-[#22c55e]/10 border-[#22c55e] text-white'
                        : wasWrong
                        ? 'bg-white/[0.03] border-white/[0.06] text-white/50'
                        : 'bg-white/[0.03] border-white/[0.06] text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    {getDisplayName(option)}
                  </motion.button>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {!exercise && (
          <div className="text-center">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(34,197,94,0.3)' }}
              whileTap={{ scale: 0.95 }}
              onClick={loadNewExercise}
              className="px-6 py-3 bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white font-semibold rounded-xl transition-all flex items-center gap-2 mx-auto"
            >
              <Music2 size={18} />
              {t('earTraining.startExercise')}
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  )
}