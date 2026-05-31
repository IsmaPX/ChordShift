import { createContext, useContext, useState, useEffect } from 'react'
import Dexie, { type Table } from 'dexie'

class OnboardingDB extends Dexie {
  settings!: Table<{ id: string; value: boolean }>

  constructor() {
    super('WorshipPianoOnboarding')
    this.version(1).stores({
      settings: 'id'
    })
  }
}

const db = new OnboardingDB()

interface OnboardingStep {
  targetId: string
  contentKey: string
  position: 'top' | 'bottom' | 'left' | 'right'
  page: string
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    targetId: 'nav-practice',
    contentKey: 'onboarding.stepPractice',
    position: 'bottom',
    page: '/practice',
  },
  {
    targetId: 'nav-ear-training',
    contentKey: 'onboarding.stepEarTraining',
    position: 'bottom',
    page: '/ear-training',
  },
  {
    targetId: 'nav-encyclopedia',
    contentKey: 'onboarding.stepEncyclopedia',
    position: 'bottom',
    page: '/encyclopedia',
  },
  {
    targetId: 'nav-settings',
    contentKey: 'onboarding.stepSettings',
    position: 'bottom',
    page: '/settings',
  },
]

interface OnboardingContextType {
  isActive: boolean
  currentStep: number
  startTour: () => void
  nextStep: () => void
  prevStep: () => void
  stopTour: () => void
  hasCompletedTour: boolean
  setCompletedTour: (val: boolean) => void
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [hasCompletedTour, setCompletedTourState] = useState(false)

  useEffect(() => {
    async function checkTourStatus() {
      const val = await db.settings.get('hasCompletedTour')
      setCompletedTourState(val?.value === true)
    }
    checkTourStatus()
  }, [])

  const setCompletedTour = async (val: boolean) => {
    setCompletedTourState(val)
    await db.settings.put({ id: 'hasCompletedTour', value: val })
  }

  const startTour = () => {
    setCurrentStep(0)
    setIsActive(true)
  }

  const nextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      stopTour()
      setCompletedTour(true)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const stopTour = () => {
    setIsActive(false)
  }

  return (
    <OnboardingContext.Provider 
      value={{ 
        isActive, 
        currentStep, 
        startTour, 
        nextStep, 
        prevStep, 
        stopTour, 
        hasCompletedTour, 
        setCompletedTour 
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}
