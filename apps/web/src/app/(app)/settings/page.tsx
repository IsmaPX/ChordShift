import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Settings, Bell, Eye, LogOut, User, Loader2, Trash2, Shield, Database, Music2, Smartphone, Download, RefreshCw, ChevronDown, Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import {
  useUserSettings,
  useUpdateSettings,
  useClearPracticeHistory,
  useClearEarTrainingResults,
  useSetPin,
  useSendOTP,
} from '@/hooks/useUserSettings'
import { useNavigate } from 'react-router'
import { INSTRUMENTS, type InstrumentName } from '@/types/music'
import { Toast } from '@/components/ui/Toast'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useTranslation } from 'react-i18next'

const settingsSchema = z.object({
  tempo_bpm: z.number().min(60).max(200),
  language: z.string(),
  notifications_enabled: z.boolean(),
  feedback_concept: z.enum(['pulse', 'bar', 'rings']),
  preferred_instrument: z.enum(['piano', 'guitar', 'trumpet']),
  metronome_enabled: z.boolean(),
  metronome_volume: z.number().min(0).max(1),
  difficulty: z.number().min(1).max(5),
})

type SettingsForm = z.infer<typeof settingsSchema>

const languages = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
]

export function SettingsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, isLoading: authLoading, logout, deleteProfile } = useAuth()
  const { data: settings, isLoading: settingsLoading } = useUserSettings()
  const updateSettings = useUpdateSettings()
  const clearPractice = useClearPracticeHistory()
  const clearEarTraining = useClearEarTrainingResults()
  const setPin = useSetPin()

  const feedbackOptions = [
    { value: 'rings', label: t('settings.feedbackRings'), description: t('settings.feedbackRingsDesc') },
    { value: 'pulse', label: t('settings.feedbackPulse'), description: t('settings.feedbackPulseDesc') },
    { value: 'bar', label: t('settings.feedbackBar'), description: t('settings.feedbackBarDesc') },
  ] as const

  const difficultyLabels = ['', t('settings.difficultyLabel.1'), t('settings.difficultyLabel.2'), t('settings.difficultyLabel.3'), t('settings.difficultyLabel.4'), t('settings.difficultyLabel.5')]

  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [clearPracticeModalOpen, setClearPracticeModalOpen] = useState(false)
  const [clearEarModalOpen, setClearEarModalOpen] = useState(false)

  const [pinMode, setPinMode] = useState<'none' | 'set' | 'change'>('none')
  const [pinValue, setPinValue] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [showAllPlatforms, setShowAllPlatforms] = useState(false)

  const [phoneInput, setPhoneInput] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpGenerated, setOtpGenerated] = useState('')
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [reminderHour, setReminderHour] = useState('18')
  const [reminderMinute, setReminderMinute] = useState('00')
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 3, 5])
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)

  const sendOTP = useSendOTP()

  const [updateState, setUpdateState] = useState<'idle' | 'checking' | 'available' | 'downloading' | 'downloaded'>('idle')
  const [updateProgress, setUpdateProgress] = useState(0)
  const [updateVersion, setUpdateVersion] = useState('')

  const handleCheckForUpdates = useCallback(() => {
    if (window.isElectron && window.electronAPI) {
      setUpdateState('checking')
      window.electronAPI.checkForUpdates()
      window.electronAPI.onUpdateAvailable((info) => {
        setUpdateVersion(info.version)
        setUpdateState('available')
      })
      window.electronAPI.onUpdateProgress((percent) => {
        setUpdateProgress(percent)
        setUpdateState('downloading')
      })
      window.electronAPI.onUpdateDownloaded(() => {
        setUpdateState('downloaded')
      })
    }
  }, [])

  const handleInstallUpdate = useCallback(() => {
    if (window.isElectron && window.electronAPI) {
      window.electronAPI.installUpdate()
    }
  }, [])

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
      preferred_instrument: 'piano' as InstrumentName,
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
      console.error('Failed to update settings:', err)
    }
  }

  const handleSwitchProfile = async () => {
    await logout()
    navigate('/login')
  }

  const handleDeleteProfile = async () => {
    if (!user) return
    setDeleteModalOpen(false)
    await deleteProfile(user.id)
    navigate('/register')
  }

  const handleClearPractice = async () => {
    setClearPracticeModalOpen(false)
    await clearPractice.mutateAsync()
    showToast(t('settings.dataPracticeCleared'))
  }

  const handleClearEarTraining = async () => {
    setClearEarModalOpen(false)
    await clearEarTraining.mutateAsync()
    showToast(t('settings.dataEarCleared'))
  }

  const handleSavePin = async () => {
    if (pinValue.length < 4) {
      showToast(t('settings.pinErrorLength'), 'error')
      return
    }
    if (pinValue !== pinConfirm) {
      showToast(t('settings.pinErrorMatch'), 'error')
      return
    }
    try {
      await setPin.mutateAsync(pinValue)
      showToast(t('settings.pinSuccess'))
      setPinMode('none')
      setPinValue('')
      setPinConfirm('')
    } catch (err) {
      showToast(t('settings.pinError'), 'error')
    }
  }

  const handleRemovePin = async () => {
    try {
      await setPin.mutateAsync(null)
      showToast(t('settings.pinRemoved'))
    } catch (err) {
      showToast(t('settings.pinRemoveError'), 'error')
    }
  }

  useEffect(() => {
    if (settings) {
      setPhoneInput(settings.phone_number || '')
      setPhoneVerified(settings.phone_verified || false)
      if (settings.reminder_time) {
        const [h, m] = settings.reminder_time.split(':')
        setReminderHour(h || '18')
        setReminderMinute(m || '00')
      }
      setSelectedDays(settings.reminder_days || [])
    }
  }, [settings])

  const handleSendOTP = async () => {
    if (phoneInput.length < 10) {
      showToast(t('settings.whatsappInvalidPhone'), 'error')
      return
    }
    setSendingOtp(true)
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      setOtpGenerated(code)
      await sendOTP.mutateAsync({ phone: phoneInput, code })
      setOtpSent(true)
      showToast(t('settings.whatsappCodeSent'))
    } catch (err) {
      showToast(t('settings.whatsappCodeError'), 'error')
    } finally {
      setSendingOtp(false)
    }
  }

  const handleVerifyOTP = () => {
    setVerifyingOtp(true)
    try {
      if (otpCode === otpGenerated) {
        setPhoneVerified(true)
        setOtpSent(false)
        setOtpCode('')
        showToast(t('settings.whatsappVerifiedSuccess'))
        updateSettings.mutate({ phone_number: phoneInput, phone_verified: true })
      } else {
        showToast(t('settings.whatsappWrongCode'), 'error')
      }
    } finally {
      setVerifyingOtp(false)
    }
  }

  const handleRemovePhone = () => {
    setPhoneInput('')
    setPhoneVerified(false)
    setOtpSent(false)
    setOtpCode('')
    updateSettings.mutate({ phone_number: '', phone_verified: false })
    showToast(t('settings.whatsappNumberRemoved'))
  }

  const handleSaveReminderSettings = () => {
    const time = `${reminderHour.padStart(2, '0')}:${reminderMinute.padStart(2, '0')}`
    updateSettings.mutate({
      reminder_time: time,
      reminder_days: selectedDays,
      notifications_enabled: true,
    })
    showToast(t('settings.whatsappReminderSaved'))
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

      <ConfirmModal
        isOpen={deleteModalOpen}
        title={t('settings.confirmDeleteTitle')}
        message={t('settings.confirmDeleteMsg')}
        confirmLabel={t('settings.confirmDeleteBtn')}
        cancelLabel={t('practice.cancel')}
        variant="danger"
        onConfirm={handleDeleteProfile}
        onCancel={() => setDeleteModalOpen(false)}
      />

      <ConfirmModal
        isOpen={clearPracticeModalOpen}
        title={t('settings.confirmClearPracticeTitle')}
        message={t('settings.confirmClearPracticeMsg')}
        confirmLabel={t('settings.confirmClearBtn')}
        cancelLabel={t('practice.cancel')}
        variant="warning"
        onConfirm={handleClearPractice}
        onCancel={() => setClearPracticeModalOpen(false)}
      />

      <ConfirmModal
        isOpen={clearEarModalOpen}
        title={t('settings.confirmClearEarTitle')}
        message={t('settings.confirmClearEarMsg')}
        confirmLabel={t('settings.confirmClearBtn')}
        cancelLabel={t('practice.cancel')}
        variant="warning"
        onConfirm={handleClearEarTraining}
        onCancel={() => setClearEarModalOpen(false)}
      />

      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">{t('settings.title')}</h1>
        <p className="text-text-secondary">
          {t('settings.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-bg-secondary rounded-xl p-6 border border-border space-y-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-accent/20">
              <Settings className="text-accent" size={20} />
            </div>
            <h2 className="text-lg font-medium text-text-primary">{t('settings.general')}</h2>
          </div>

          <div>
            <label className="block text-text-primary text-sm mb-2">
              {t('settings.language')}
            </label>
            <select
              {...register('language')}
              className="w-full px-4 py-3 bg-bg-primary border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent"
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-text-primary text-sm mb-2">
              {t('settings.tempo', { bpm: watch('tempo_bpm') })}
            </label>
            <input
              type="range"
              min="60"
              max="200"
              {...register('tempo_bpm', { valueAsNumber: true })}
              className="w-full accent-accent"
            />
          </div>

          <div>
            <label className="block text-text-primary text-sm mb-2">
              {t('settings.difficulty')}
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setValue('difficulty', d)}
                  className={cn(
                    'flex-1 px-3 py-2 rounded-xl border text-sm font-medium transition-colors',
                    watch('difficulty') === d
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border text-text-secondary hover:border-accent/50'
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
            <p className="text-text-secondary text-xs mt-1">
              {difficultyLabels[watch('difficulty')]}
            </p>
          </div>

          <div>
            <label className="block text-text-primary text-sm mb-3">
              {t('settings.instrument')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {INSTRUMENTS.map((inst) => (
                <label
                  key={inst.value}
                  className={cn(
                    'flex flex-col items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors',
                    watch('preferred_instrument') === inst.value
                      ? 'border-accent bg-accent/10'
                      : 'border-border hover:border-accent/50'
                  )}
                >
                  <input
                    type="radio"
                    value={inst.value}
                    {...register('preferred_instrument')}
                    className="sr-only"
                  />
                  <span className="text-2xl">{inst.icon}</span>
                  <span className="text-text-primary text-sm font-medium">{t('instruments.' + inst.value)}</span>
                </label>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-bg-secondary rounded-xl p-6 border border-border space-y-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-accent/20">
              <Music2 className="text-accent" size={20} />
            </div>
            <h2 className="text-lg font-medium text-text-primary">{t('settings.metronome')}</h2>
          </div>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-text-secondary">{t('settings.metronomeToggle')}</span>
            <div className="relative">
              <input
                type="checkbox"
                {...register('metronome_enabled')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-border rounded-full peer-checked:bg-accent transition-colors" />
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
            </div>
          </label>

          {watch('metronome_enabled') && (
            <div>
              <label className="block text-text-primary text-sm mb-2">
                {t('settings.metronomeVolume', { pct: Math.round(watch('metronome_volume') * 100) })}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                {...register('metronome_volume', { valueAsNumber: true })}
                className="w-full accent-accent"
              />
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-bg-secondary rounded-xl p-6 border border-border space-y-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-accent/20">
              <Bell className="text-accent" size={20} />
            </div>
            <h2 className="text-lg font-medium text-text-primary">{t('settings.notifications')}</h2>
          </div>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-text-secondary">{t('settings.notificationsToggle')}</span>
            <div className="relative">
              <input
                type="checkbox"
                {...register('notifications_enabled')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-border rounded-full peer-checked:bg-accent transition-colors" />
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
            </div>
          </label>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-bg-secondary rounded-xl p-6 border border-border space-y-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-accent/20">
              <Smartphone className="text-accent" size={20} />
            </div>
            <h2 className="text-lg font-medium text-text-primary">{t('settings.whatsapp')}</h2>
          </div>

          {!phoneVerified ? (
            <div className="space-y-3">
              <p className="text-text-secondary text-sm">
                {t('settings.whatsappDesc')}
              </p>
              <div className="flex gap-2">
                <input
                  type="tel"
                  placeholder={t('settings.whatsappPhonePlaceholder')}
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value.replace(/[^0-9+]/g, ''))}
                  className="flex-1 px-4 py-3 bg-bg-primary border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent"
                />
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={sendingOtp || phoneInput.length < 10}
                  className="px-4 py-3 bg-accent text-white font-medium rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {sendingOtp ? <Loader2 className="animate-spin" size={18} /> : t('settings.whatsappSendCode')}
                </button>
              </div>

              {otpSent && (
                <div className="space-y-2">
                  <p className="text-text-secondary text-sm">
                    {t('settings.whatsappEnterCode')}
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder={t('settings.whatsappOtpPlaceholder')}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 px-4 py-3 bg-bg-primary border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent text-center text-lg tracking-widest"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOTP}
                      disabled={verifyingOtp || otpCode.length < 6}
                      className="px-4 py-3 bg-accent text-white font-medium rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-50"
                    >
                      {verifyingOtp ? <Loader2 className="animate-spin" size={18} /> : t('settings.whatsappVerify')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-success/10 border border-success/20">
                <div>
                  <p className="text-text-primary text-sm font-medium">{t('settings.whatsappVerified')}</p>
                  <p className="text-success text-sm">{phoneInput}</p>
                </div>
                <button
                  type="button"
                  onClick={handleRemovePhone}
                  className="p-2 rounded-lg text-danger hover:bg-danger/10 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div>
                <label className="block text-text-primary text-sm mb-2">
                  {t('settings.whatsappHour')}
                </label>
                <div className="flex gap-2">
                  <select
                    value={reminderHour}
                    onChange={(e) => setReminderHour(e.target.value)}
                    className="flex-1 px-4 py-3 bg-bg-primary border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={String(i).padStart(2, '0')}>
                        {String(i).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  <span className="flex items-center text-text-secondary">:</span>
                  <select
                    value={reminderMinute}
                    onChange={(e) => setReminderMinute(e.target.value)}
                    className="flex-1 px-4 py-3 bg-bg-primary border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent"
                  >
                    {['00', '15', '30', '45'].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-text-primary text-sm mb-2">
                  {t('settings.whatsappDays')}
                </label>
                <div className="flex gap-2">
                  {[
                    { n: 0, key: 'sun' },
                    { n: 1, key: 'mon' },
                    { n: 2, key: 'tue' },
                    { n: 3, key: 'wed' },
                    { n: 4, key: 'thu' },
                    { n: 5, key: 'fri' },
                    { n: 6, key: 'sat' },
                  ].map(({ n, key }) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => {
                        setSelectedDays((prev) =>
                          prev.includes(n) ? prev.filter((d) => d !== n) : [...prev, n]
                        )
                      }}
                      className={cn(
                        'flex-1 px-2 py-2 rounded-xl border text-xs font-medium transition-colors',
                        selectedDays.includes(n)
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border text-text-secondary hover:border-accent/50'
                      )}
                    >
                      {t('days.' + key)}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveReminderSettings}
                className="w-full py-2.5 bg-accent text-white font-medium rounded-xl hover:bg-accent/90 transition-colors text-sm"
              >
                {t('settings.whatsappSaveSchedule')}
              </button>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-bg-secondary rounded-xl p-6 border border-border space-y-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-accent/20">
              <Shield className="text-accent" size={20} />
            </div>
            <h2 className="text-lg font-medium text-text-primary">{t('settings.security')}</h2>
          </div>

          {pinMode === 'none' && (
            <div className="flex gap-3">
              {settings?.pin_enabled ? (
                <>
                  <button
                    type="button"
                    onClick={() => { setPinMode('change'); setPinValue(''); setPinConfirm('') }}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:border-accent/50 transition-all text-sm"
                  >
                    {t('settings.pinChangeBtn')}
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePin}
                    className="flex-1 px-4 py-2.5 rounded-xl text-danger hover:bg-danger/10 transition-colors text-sm"
                  >
                    {t('settings.pinRemoveBtn')}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => { setPinMode('set'); setPinValue(''); setPinConfirm('') }}
                  className="w-full px-4 py-2.5 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:border-accent/50 transition-all text-sm"
                >
                  {t('settings.pinSetBtn')}
                </button>
              )}
            </div>
          )}

          {(pinMode === 'set' || pinMode === 'change') && (
            <div className="space-y-3">
              <p className="text-text-secondary text-sm">
                {pinMode === 'set' ? t('settings.pinSet') : t('settings.pinChange')}
              </p>
              <input
                type="password"
                maxLength={6}
                placeholder={t('settings.pinNew')}
                value={pinValue}
                onChange={(e) => setPinValue(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 bg-bg-primary border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent text-center text-lg tracking-widest"
              />
              <input
                type="password"
                maxLength={6}
                placeholder={t('settings.pinConfirm')}
                value={pinConfirm}
                onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 bg-bg-primary border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent text-center text-lg tracking-widest"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPinMode('none')}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border text-text-secondary hover:text-text-primary transition-all text-sm"
                >
                  {t('settings.pinCancelBtn')}
                </button>
                <button
                  type="button"
                  onClick={handleSavePin}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-accent text-white font-medium hover:bg-accent/90 transition-colors text-sm"
                >
                  {t('settings.pinSaveBtn')}
                </button>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-bg-secondary rounded-xl p-6 border border-border space-y-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-accent/20">
              <Eye className="text-accent" size={20} />
            </div>
            <h2 className="text-lg font-medium text-text-primary">{t('settings.feedback')}</h2>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {feedbackOptions.map((option) => (
              <label
                key={option.value}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors',
                  watch('feedback_concept') === option.value
                    ? 'border-accent bg-accent/10'
                    : 'border-border hover:border-accent/50'
                )}
              >
                <input
                  type="radio"
                  value={option.value}
                  {...register('feedback_concept')}
                  className="sr-only"
                />
                <div
                  className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                    watch('feedback_concept') === option.value
                      ? 'border-accent bg-accent'
                      : 'border-border'
                  )}
                >
                  {watch('feedback_concept') === option.value && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <div>
                  <p className="text-text-primary font-medium">{option.label}</p>
                  <p className="text-text-secondary text-sm">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
        </motion.div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-accent text-white font-medium rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? t('settings.savingBtn') : t('settings.saveBtn')}
        </button>
      </form>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-bg-secondary rounded-xl p-6 border border-border space-y-4"
      >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-accent/20">
              <Database className="text-accent" size={20} />
            </div>
            <h2 className="text-lg font-medium text-text-primary">{t('settings.data')}</h2>
          </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setClearPracticeModalOpen(true)}
            disabled={clearPractice.isPending}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:border-warning/50 transition-all disabled:opacity-50"
          >
            <span className="text-sm">{t('settings.dataClearPractice')}</span>
            {clearPractice.isPending ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Trash2 size={16} className="text-warning" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setClearEarModalOpen(true)}
            disabled={clearEarTraining.isPending}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:border-warning/50 transition-all disabled:opacity-50"
          >
            <span className="text-sm">{t('settings.dataClearEar')}</span>
            {clearEarTraining.isPending ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Trash2 size={16} className="text-warning" />
            )}
          </button>
        </div>
      </motion.div>

      {window.isElectron && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-bg-secondary rounded-xl p-6 border border-border space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/20">
              <Download className="text-accent" size={20} />
            </div>
            <div>
              <p className="text-text-primary font-medium">{t('settings.updates')}</p>
              <p className="text-text-secondary text-sm">{t('settings.updatesDesc')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {(updateState === 'idle' || updateState === 'checking') && (
              <button
                onClick={handleCheckForUpdates}
                disabled={updateState === 'checking'}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                {updateState === 'checking' ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <RefreshCw size={18} />
                )}
                {t('settings.checkUpdates')}
              </button>
            )}

            {updateState === 'available' && (
              <p className="text-text-secondary text-sm">
                {t('settings.updateAvailable', { version: updateVersion })}
              </p>
            )}

            {updateState === 'downloading' && (
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">{t('settings.downloading')}</span>
                  <span className="text-accent">{Math.round(updateProgress)}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-bg-primary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-300"
                    style={{ width: `${updateProgress}%` }}
                  />
                </div>
              </div>
            )}

            {updateState === 'downloaded' && (
              <button
                onClick={handleInstallUpdate}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white hover:bg-accent/90 transition-colors"
              >
                <Download size={18} />
                {t('settings.restartInstall')}
              </button>
            )}
          </div>
        </motion.div>
      )}

      {!window.isElectron && (
        <DesktopDownloadSection
          showAll={showAllPlatforms}
          onToggle={() => setShowAllPlatforms(!showAllPlatforms)}
          t={t}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-bg-secondary rounded-xl p-6 border border-border space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/20">
            <User className="text-accent" size={20} />
          </div>
          <div>
            <p className="text-text-primary font-medium">{user?.display_name}</p>
            <p className="text-text-secondary text-sm">{user?.settings?.xp || 0} XP</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSwitchProfile}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:border-accent/50 transition-all"
          >
            <LogOut size={18} />
            {t('settings.profileSwitch')}
          </button>
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-danger hover:bg-danger/10 transition-colors"
          >
            <Trash2 size={18} />
            {t('settings.profileDelete')}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function DesktopDownloadSection({ showAll, onToggle, t }: { showAll: boolean; onToggle: () => void; t: (key: string, opts?: Record<string, string>) => string }) {
  const ua = navigator.userAgent
  const detected = ua.includes('Windows') ? 'win' : ua.includes('Mac') ? 'mac' : ua.includes('Linux') ? 'linux' : null
  const os = detected ?? 'win'
  const osName: Record<string, string> = { win: 'Windows', mac: 'macOS', linux: 'Linux' }
  const ver = 'v1.0.0'
  const base = `https://github.com/IsmaPX/ChordShift/releases/download/${ver}`
  const urls = {
    win: `${base}/Worship-Piano-Setup-1.0.0.exe`,
    mac: `${base}/Worship-Piano-1.0.0.dmg`,
    linux: `${base}/Worship-Piano-1.0.0.AppImage`,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-bg-secondary rounded-xl p-6 border border-border space-y-4"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-accent/20">
          <Monitor className="text-accent" size={20} />
        </div>
        <div>
          <p className="text-text-primary font-medium">{t('desktop.title')}</p>
          <p className="text-text-secondary text-sm">{t('desktop.desc')}</p>
        </div>
      </div>

      <a
        href={urls[os]}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent/90 transition-colors text-sm"
      >
        <Download size={18} />
        {t('desktop.download', { os: osName[os] })}
      </a>

      <button
        onClick={onToggle}
        className="flex items-center justify-center gap-1 w-full text-xs text-text-secondary hover:text-text-primary transition-colors"
      >
        {t('desktop.otherPlatforms')}
        <ChevronDown size={14} className={`transition-transform ${showAll ? 'rotate-180' : ''}`} />
      </button>

      {showAll && (
        <div className="flex flex-col sm:flex-row gap-3">
          {(['win', 'mac', 'linux'] as const).map((p) => (
            <a key={p} href={urls[p]} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 flex-1 px-4 py-2 rounded-xl bg-bg-card text-text-primary border border-border hover:border-accent/50 hover:bg-accent-light transition-all text-sm">
              <Download size={14} /> {t('desktop.' + ({ win: 'windows', mac: 'mac', linux: 'linux' } as const)[p])}
            </a>
          ))}
        </div>
      )}

      <p className="text-text-secondary text-xs text-center">
        {t('desktop.benefits')}
      </p>
    </motion.div>
  )
}
