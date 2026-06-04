import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, Loader2 } from 'lucide-react'
import { FeedbackCanvas } from '@/components/ui/FeedbackCanvas'
import { StreakIndicator } from '@/components/ui/StreakIndicator'
import { InstrumentSelector } from '@/components/ui/InstrumentSelector'
import { ExerciseNotesDisplay } from '@/components/ear-training/ExerciseNotesDisplay'
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
import { slideUp, popIn } from '@/lib/animations'

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
  const [activeNoteIndex, setActiveNoteIndex] = useState<number | null>(null)
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
      setActiveNoteIndex(i)
      AudioEngine.playNote(notes[i], noteDuration)
      if (i < notes.length - 1) {
        await new Promise((r) => setTimeout(r, gap * 1000))
      }
    }
    await new Promise((r) => setTimeout(r, (totalDuration - gap * (notes.length - 1)) * 1000))
    setActiveNoteIndex(null)
  }, [])

  const handlePlaySound = useCallback(async () => {
    if (!exercise || isPlaying) return

    setIsPlaying(true)
    setActiveNoteIndex(0) // arranca con la primera nota resaltada

    try {
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
        // Modo chord (todas a la vez): resalta la primera nota como
        // indicación de "estás escuchando este ejercicio".
        AudioEngine.playChord(exercise.notes, 1.2)
        await new Promise((r) => setTimeout(r, 1500))
      }
    } finally {
      setIsPlaying(false)
      setActiveNoteIndex(null)
    }
  }, [exercise, isPlaying, instrument, playArpeggiated])

  // Resetear resaltado cuando cambia el ejercicio
  useEffect(() => {
    setActiveNoteIndex(null)
  }, [exercise])

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
    <motion.div
      className="eartraining-bg -m-4 sm:-m-6 p-4 sm:p-6 min-h-[calc(100vh-80px)]"
      variants={slideUp}
      initial="initial"
      animate="animate"
    >
      <div className="relative space-y-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-px w-8 bg-accent/60" />
            <span className="text-xs uppercase tracking-widest text-accent font-mono">Sound Lab</span>
          </div>
          <motion.h1
            className="text-3xl font-bold text-text-primary"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {t('earTraining.title')}
          </motion.h1>
          <motion.p
            className="text-text-secondary"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {t('earTraining.subtitle')}
          </motion.p>
        </div>

        <div className="flex items-center justify-between p-4 bg-bg-primary/60 backdrop-blur rounded-xl border border-accent/20">
          <div className="flex items-center gap-2">
            <StreakIndicator count={streak} />
            <span className="text-text-secondary text-sm">{t('earTraining.streak')}</span>
          </div>
          <motion.div
            className="flex items-center gap-2"
            key={xp}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
          >
            <div className="text-xs text-text-secondary font-mono uppercase tracking-wider">XP</div>
            <div className="text-accent font-bold text-lg glow-green px-3 py-1 rounded-md bg-accent/10 border border-accent/30">
              {xp}
            </div>
          </motion.div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {(['interval', 'triad', 'seventh_chord'] as ExerciseType[]).map((type) => (
              <motion.button
                key={type}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedType(type)
                  loadNewExercise()
                }}
                className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all ${
                  selectedType === type
                    ? 'bg-accent text-white glow-green'
                    : 'bg-bg-primary/60 text-text-secondary hover:text-accent border border-accent/20'
                }`}
              >
                {t('earTraining.' + type)}
              </motion.button>
            ))}
          </div>
          <div className="flex-shrink-0">
            <InstrumentSelector value={instrument} onChange={handleInstrumentChange} size="sm" />
          </div>
        </div>

        {/* ===== LABORATORIO: contenedor con grid y ecualizador ===== */}
        <div className="eartraining-lab">
          {/* Ecualizador de fondo sutil */}
          <div className="eartraining-eq opacity-30 mb-6">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: '100%',
                  animationDelay: `${i * 0.05}s`,
                  animationDuration: `${0.5 + (i % 5) * 0.15}s`,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 space-y-8">
            <div className="flex flex-col items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePlaySound}
                disabled={!exercise || isPlaying}
                className="eartraining-wave-btn disabled:opacity-50"
              >
                {isPlaying ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  >
                    <Loader2 className="text-accent" size={40} />
                  </motion.div>
                ) : (
                  <Volume2 className="text-accent" size={40} />
                )}
              </motion.button>
              <p className="text-text-secondary text-xs uppercase tracking-widest font-mono">
                {isPlaying ? 'Reproduciendo...' : 'Toca para escuchar'}
              </p>

              <ExerciseNotesDisplay
                exercise={exercise}
                isPlaying={isPlaying}
                activeNoteIndex={activeNoteIndex}
              />
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
                  key={exercise.type}
                  variants={popIn}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  {exercise.options.map((option) => (
                    <motion.button
                      key={option}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      animate={isCorrect !== null ? (option === exercise.answer ? 'correct' : 'wrong') : 'initial'}
                      variants={{
                        initial: { opacity: 1 },
                        correct: { scale: 1.08, boxShadow: '0 0 30px rgba(34, 197, 94, 0.8)' },
                        wrong: { x: [0, -5, 5, -5, 5, 0], opacity: 0.5 }
                      }}
                      onClick={() => handleAnswer(option)}
                      disabled={isCorrect !== null}
                      className="eartraining-option text-text-primary disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                    >
                      {getDisplayName(option)}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {!exercise && (
              <div className="text-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={loadNewExercise}
                  className="px-8 py-4 bg-gradient-to-r from-accent to-accent-hover text-white rounded-xl font-bold hover:from-accent-hover hover:to-accent glow-green transition-all"
                >
                  {t('earTraining.startExercise')}
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
