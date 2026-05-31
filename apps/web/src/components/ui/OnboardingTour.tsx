import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useOnboarding, ONBOARDING_STEPS } from '@/contexts/OnboardingContext'
import { useLocation, useNavigate } from 'react-router'
import { X } from 'lucide-react'

export function OnboardingTour() {
  const { t } = useTranslation()
  const { 
    isActive, 
    currentStep, 
    nextStep, 
    prevStep 
  } = useOnboarding()
  const location = useLocation()
  const navigate = useNavigate()

  const [targetRect, setTargetRect] = useState<{ top: number, left: number, width: number, height: number } | null>(null)

  useEffect(() => {
    if (!isActive) return

    const step = ONBOARDING_STEPS[currentStep]
    
    // Navigate to the correct page if needed
    if (step.page !== location.pathname) {
      navigate(step.page)
    }

    // Update target rect after navigation and render
    const updateRect = () => {
      const el = document.getElementById(step.targetId)
      if (el) {
        setTargetRect(el.getBoundingClientRect())
      } else {
        setTargetRect(null)
      }
    }

    // We might need to wait for the page to render after navigate
    const timeout = setTimeout(updateRect, 100)
    window.addEventListener('resize', updateRect)

    return () => {
      clearTimeout(timeout)
      window.removeEventListener('resize', updateRect)
    }
  }, [isActive, currentStep, location.pathname, navigate])

  if (!isActive || !targetRect) return null

  const { top, left, width, height } = targetRect
  
  // Calculate tooltip position
  // Simple logic: put it below the element, or above if it's too low
  const tooltipTop = top + height > window.innerHeight - 200 ? top - 120 : top + height + 10
  const tooltipLeft = Math.max(10, Math.min(window.innerWidth - 320 - 10, left + width / 2 - 160))

  return (
    <>
      {/* Highlight Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/50 pointer-events-none"
        style={{
          clipPath: `polygon(
            0% 0%, 0% 100%, 100% 100%, 100% 0%,
            ${left}px ${top}px, ${left + width}px ${top}px, 
            ${left + width}px ${top + height}px, ${left}px ${top + height}px,
            ${left}px ${top}px
          )`
          // This simple clip-path isn't perfect for all browsers but works for 
          // a basic rectangular cutout. Better implementation would use a 
          // radial-gradient or a complex svg mask.
          // Since we are using Framer Motion and Tailwind, 
          // let's use a more robust approach: a div with a box-shadow
        }}
      />
      
      {/* Actual Highlight Box (to make the edge visible) */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed z-[101] border-2 border-accent rounded-lg pointer-events-none"
        style={{
          top,
          left,
          width,
          height,
        }}
      />

      {/* Tooltip */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed z-[102] w-80 bg-bg-secondary border border-border rounded-2xl p-4 shadow-2xl backdrop-blur-md bg-bg-secondary/90"
        style={{
          top: tooltipTop,
          left: tooltipLeft,
        }}
      >
        <div className="flex flex-col gap-3">
          <p className="text-text-primary text-sm leading-relaxed">
            {t(ONBOARDING_STEPS[currentStep].contentKey)}
          </p>
          
          <div className="flex items-center justify-between mt-2">
            <button 
              onClick={prevStep}
              disabled={currentStep === 0}
              className="p-2 text-text-secondary hover:text-text-primary disabled:opacity-30 transition-colors"
            >
              <X size={16} className="rotate-180" /> {/* Simple back icon */}
            </button>
            
            <span className="text-xs text-text-secondary font-medium">
              {currentStep + 1} / {ONBOARDING_STEPS.length}
            </span>

            <button 
              onClick={nextStep}
              className="px-3 py-1.5 bg-accent text-white text-xs font-semibold rounded-lg hover:bg-accent-hover transition-colors"
            >
              {currentStep === ONBOARDING_STEPS.length - 1 
                ? t('onboarding.welcomeFinish') 
                : t('onboarding.welcomeNext')}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}
