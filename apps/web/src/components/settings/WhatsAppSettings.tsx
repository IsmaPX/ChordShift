import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Smartphone, Loader2, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSendOTP, useUpdateSettings } from '@/hooks/useUserSettings'
import { createModuleLogger } from '@/lib/logger'
import { z } from 'zod'
import type { UserSettings } from '@/types/music'

const log = createModuleLogger('WhatsAppSettings')

const phoneSchema = z.string().min(10).max(20).regex(/^\+?[0-9]+$/)
const otpSchema = z.string().length(6).regex(/^\d{6}$/)

interface Props {
  settings: UserSettings | undefined
  showToast: (message: string, type?: 'success' | 'error') => void
  t: (key: string, opts?: Record<string, unknown>) => string
}

export function WhatsAppSettings({ settings, showToast, t }: Props) {
  const sendOTP = useSendOTP()
  const updateSettings = useUpdateSettings()

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
    const parsed = phoneSchema.safeParse(phoneInput)
    if (!parsed.success) {
      showToast(t('settings.whatsappInvalidPhone'), 'error')
      log.warn('Invalid phone input', { phone: phoneInput, errors: parsed.error.format() })
      return
    }
    setSendingOtp(true)
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      setOtpGenerated(code)
      await sendOTP.mutateAsync({ phone: phoneInput, code })
      setOtpSent(true)
      showToast(t('settings.whatsappCodeSent'))
    } catch (error) {
      log.error('Failed to send OTP', error as Error, { phone: phoneInput })
      showToast(t('settings.whatsappCodeError'), 'error')
    } finally {
      setSendingOtp(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!otpSchema.safeParse(otpCode).success) {
      showToast(t('settings.whatsappWrongCode'), 'error')
      return
    }
    setVerifyingOtp(true)
    try {
      if (otpCode === otpGenerated) {
        setPhoneVerified(true)
        setOtpSent(false)
        setOtpCode('')
        await updateSettings.mutateAsync({ phone_number: phoneInput, phone_verified: true })
        showToast(t('settings.whatsappVerifiedSuccess'))
      } else {
        showToast(t('settings.whatsappWrongCode'), 'error')
      }
    } catch (error) {
      log.error('Failed to verify phone', error as Error, { phone: phoneInput })
      setPhoneVerified(false)
      showToast(t('settings.whatsappCodeError'), 'error')
    } finally {
      setVerifyingOtp(false)
    }
  }

  const handleRemovePhone = async () => {
    try {
      await updateSettings.mutateAsync({ phone_number: '', phone_verified: false })
      setPhoneInput('')
      setPhoneVerified(false)
      setOtpSent(false)
      setOtpCode('')
      showToast(t('settings.whatsappNumberRemoved'))
    } catch (error) {
      log.error('Failed to remove phone', error as Error)
      showToast(t('settings.saveError'), 'error')
    }
  }

  const handleSaveReminderSettings = async () => {
    const time = `${reminderHour.padStart(2, '0')}:${reminderMinute.padStart(2, '0')}`
    try {
      await updateSettings.mutateAsync({
        reminder_time: time,
        reminder_days: selectedDays,
        notifications_enabled: true,
      })
      showToast(t('settings.whatsappReminderSaved'))
    } catch (error) {
      log.error('Failed to save reminder settings', error as Error, { time, days: selectedDays })
      showToast(t('settings.saveError'), 'error')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="rounded-xl p-6 border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm space-y-4"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-accent/20">
          <Smartphone className="text-accent" size={20} />
        </div>
        <h2 className="text-lg font-medium text-text-primary">{t('settings.whatsapp')}</h2>
      </div>

      {!phoneVerified ? (
        <div className="space-y-3">
          <p className="text-text-secondary text-sm">{t('settings.whatsappDesc')}</p>
          <div className="flex gap-2">
            <input
              type="tel"
              placeholder={t('settings.whatsappPhonePlaceholder')}
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value.replace(/[^0-9+]/g, ''))}
              className="flex-1 px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-text-primary focus:outline-none focus:border-accent"
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
              <p className="text-text-secondary text-sm">{t('settings.whatsappEnterCode')}</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder={t('settings.whatsappOtpPlaceholder')}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-text-primary focus:outline-none focus:border-accent text-center text-lg tracking-widest"
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
            <button type="button" onClick={handleRemovePhone} className="p-2 rounded-lg text-danger hover:bg-danger/10 transition-colors">
              <Trash2 size={16} />
            </button>
          </div>

          <div>
            <label className="block text-text-primary text-sm mb-2">{t('settings.whatsappHour')}</label>
            <div className="flex gap-2">
              <select
                value={reminderHour}
                onChange={(e) => setReminderHour(e.target.value)}
                className="flex-1 px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-text-primary focus:outline-none focus:border-accent"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={String(i).padStart(2, '0')}>{String(i).padStart(2, '0')}</option>
                ))}
              </select>
              <span className="flex items-center text-text-secondary">:</span>
              <select
                value={reminderMinute}
                onChange={(e) => setReminderMinute(e.target.value)}
                className="flex-1 px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-text-primary focus:outline-none focus:border-accent"
              >
                {['00', '15', '30', '45'].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-text-primary text-sm mb-2">{t('settings.whatsappDays')}</label>
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
                      : 'border-white/[0.08] text-text-secondary hover:border-accent/50'
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
  )
}
