import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useOnboarding } from '@/contexts/OnboardingContext'

export function OnboardingWelcome() {
  const { t } = useTranslation()
  const { hasCompletedTour, startTour, setCompletedTour } = useOnboarding()

  useEffect(() => {
    // This component should be used inside a layout or a specific page
    // It handles the initial recommendation
  }, [])

  if (hasCompletedTour) return null

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-24 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50"
      >
        <div className="bg-bg-secondary border border-border rounded-2xl p-6 shadow-2xl backdrop-blur-md bg-bg-secondary/90 border-l-4 border-l-accent">
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-text-primary font-bold text-lg mb-1">
                {t('onboarding.welcomeTitle')}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {t('onboarding.welcomeDesc')}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <button 
                onClick={startTour}
                className="flex-1 px-4 py-2 bg-accent text-white text-sm font-semibold rounded-xl hover:bg-accent-hover transition-all active:scale-95"
              >
                {t('onboarding.welcomeStart')}
              </button>
              <button 
                onClick={() => setCompletedTour(true)}
                className="flex-1 px-4 py-2 bg-bg-primary text-text-secondary text-sm font-medium rounded-xl hover:bg-border transition-all active:scale-95"
              >
                {t('onboarding.welcomeSkip')}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
