import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useUserSettings, useUpdateSettings } from '@/hooks/useUserSettings'
import { useNavigate } from 'react-router'
import { Toast } from '@/components/ui/Toast'
import { useTranslation } from 'react-i18next'
import { settingsSchema, type SettingsForm } from '@/lib/settings-schema'
import { createModuleLogger } from '@/lib/logger'
import { GeneralSettings } from '@/components/settings/GeneralSettings'
import { MetronomeSettings } from '@/components/settings/MetronomeSettings'
import { NotificationsSettings } from '@/components/settings/NotificationsSettings'
import { WhatsAppSettings } from '@/components/settings/WhatsAppSettings'
import { SecuritySettings } from '@/components/settings/SecuritySettings'
import { FeedbackSettings } from '@/components/settings/FeedbackSettings'
import { DataSettings } from '@/components/settings/DataSettings'
import { UpdateSettings } from '@/components/settings/UpdateSettings'
import { DesktopDownloadSection } from '@/components/settings/DesktopDownloadSection'
import { ProfileSettings } from '@/components/settings/ProfileSettings'

const log = createModuleLogger('SettingsPage')

export function SettingsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, isLoading: authLoading, logout, deleteProfile } = useAuth()
  const { data: settings, isLoading: settingsLoading } = useUserSettings()
  const updateSettings = useUpdateSettings()

  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setToastVisible(true)
  }, [])

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      tempo_bpm: 120,
      language: 'es',
      notifications_enabled: true,
      feedback_concept: 'rings',
      preferred_instrument: 'piano',
      metronome_enabled: true,
      metronome_volume: 0.5,
      difficulty: 1,
    },
  })

  useEffect(() => {
    if (settings) {
      reset({
        tempo_bpm: settings.tempo_bpm || 120,
        language: settings.language || 'es',
        notifications_enabled: settings.notifications_enabled ?? true,
        feedback_concept: settings.feedback_concept || 'rings',
        preferred_instrument: settings.preferred_instrument || 'piano',
        metronome_enabled: settings.metronome_enabled ?? true,
        metronome_volume: settings.metronome_volume ?? 0.5,
        difficulty: settings.difficulty ?? 1,
      })
    }
  }, [settings, reset])

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
    }
  }, [authLoading, user, navigate])

  const onSubmit = async (data: SettingsForm) => {
    try {
      await updateSettings.mutateAsync(data)
      showToast(t('settings.saved'))
    } catch (err) {
      showToast(t('settings.saveError'), 'error')
      log.error('Failed to update settings', err as Error)
    }
  }

  if (authLoading || settingsLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
      />

      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">{t('settings.title')}</h1>
        <p className="text-text-secondary">{t('settings.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <GeneralSettings register={register} watch={watch} setValue={setValue} t={t} />
        <MetronomeSettings register={register} watch={watch} t={t} />
        <NotificationsSettings register={register} t={t} />
        <WhatsAppSettings settings={settings} showToast={showToast} t={t} />
        <SecuritySettings settings={settings} showToast={showToast} t={t} />
        <FeedbackSettings register={register} watch={watch} t={t} />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-accent text-white font-medium rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? t('settings.savingBtn') : t('settings.saveBtn')}
        </button>
      </form>

      <DataSettings showToast={showToast} t={t} />
      <UpdateSettings t={t} />
      <DesktopDownloadSection t={t} />
      <ProfileSettings
        user={user}
        logout={logout}
        deleteProfile={deleteProfile}
        navigate={navigate}
        t={t}
      />
    </div>
  )
}
