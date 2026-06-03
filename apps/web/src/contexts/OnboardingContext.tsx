import { createContext, useContext, useState, useEffect } from 'react'
import Dexie, { type Table } from 'dexie'
import { db } from '@/lib/db'

interface OnboardingSetting {
  id: string
  value: boolean
}

class LegacyOnboardingDB extends Dexie {
  settings!: Table<OnboardingSetting, string>

  constructor() {
    super('WorshipPianoOnboarding')
    this.version(1).stores({
      settings: 'id',
    })
  }
}

const legacyDb = new LegacyOnboardingDB()

let _hasCompletedTour: boolean | null = null

async function migrateFromLegacy(): Promise<boolean> {
  try {
    const legacySetting = await legacyDb.settings.get('hasCompletedTour')
    if (legacySetting) {
      await db.onboarding.put({ id: 'hasCompletedTour', value: legacySetting.value })
      await legacyDb.settings.delete('hasCompletedTour')
      return true
    }
  } catch {
    // no-op — migration or DB read error, proceed with default
    void 0
  }
  return false
}

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
      if (_hasCompletedTour !== null) {
        setCompletedTourState(_hasCompletedTour)
        return
      }
      let setting = await db.onboarding.get('hasCompletedTour')
      if (!setting) {
        const migrated = await migrateFromLegacy()
        if (migrated) {
          setting = await db.onboarding.get('hasCompletedTour')
        }
      }
      _hasCompletedTour = setting?.value === true
      setCompletedTourState(_hasCompletedTour)
    }
    checkTourStatus()
  }, [])

  const setCompletedTour = async (val: boolean) => {
    setCompletedTourState(val)
    await db.onboarding.put({ id: 'hasCompletedTour', value: val })
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
