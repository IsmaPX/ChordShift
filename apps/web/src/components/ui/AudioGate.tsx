import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useAudioGate } from '@/contexts/AudioGateContext'

interface AudioGateProps {
  children: React.ReactNode
}

export function AudioGate({ children }: AudioGateProps) {
  const { t } = useTranslation()
  const { showGate, error, handleStartAudio } = useAudioGate()

  return (
    <>
      {children}
      <AnimatePresence>
        {showGate && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary"
            onClick={handleStartAudio}
          >
            <div className="text-center">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-24 h-24 mx-auto mb-6 rounded-full bg-accent/20 flex items-center justify-center"
              >
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-accent"
                >
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
              </motion.div>
              <h2 className="text-text-primary text-xl font-medium mb-2">
                {t('brand.worshipPiano')}
              </h2>
              <p className="text-text-secondary text-sm">
                {t('audio.tapToStart')}
              </p>
              {error && (
                <p className="mt-4 text-danger text-sm">
                  {error}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
