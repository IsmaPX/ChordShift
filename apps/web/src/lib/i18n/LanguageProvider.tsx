import { useEffect, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useUserSettings } from '@/hooks/useUserSettings'
import './i18n'

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const { i18n } = useTranslation()
  const { data: settings } = useUserSettings()

  useEffect(() => {
    if (settings?.language && settings.language !== i18n.language) {
      i18n.changeLanguage(settings.language)
    }
  }, [settings?.language, i18n])

  return <>{children}</>
}
