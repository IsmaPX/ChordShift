import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'
import { useSetPin } from '@/hooks/useUserSettings'
import { createModuleLogger } from '@/lib/logger'
import { z } from 'zod'
import type { UserSettings } from '@/types/music'

const log = createModuleLogger('SecuritySettings')
const pinSchema = z.string().min(4).max(6).regex(/^\d{4,6}$/)

interface Props {
  settings: UserSettings | undefined
  showToast: (message: string, type?: 'success' | 'error') => void
  t: (key: string) => string
}

export function SecuritySettings({ settings, showToast, t }: Props) {
  const setPin = useSetPin()

  const [pinMode, setPinMode] = useState<'none' | 'set' | 'change'>('none')
  const [pinValue, setPinValue] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')

  const handleSavePin = async () => {
    const parsed = pinSchema.safeParse(pinValue)
    if (!parsed.success) {
      showToast(t('settings.pinErrorLength'), 'error')
      log.warn('Invalid PIN format', { errors: parsed.error.format() })
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
    } catch (error) {
      log.error('Failed to save PIN', error as Error)
      showToast(t('settings.pinError'), 'error')
    }
  }

  const handleRemovePin = async () => {
    try {
      await setPin.mutateAsync(null)
      showToast(t('settings.pinRemoved'))
    } catch (error) {
      log.error('Failed to remove PIN', error as Error)
      showToast(t('settings.pinRemoveError'), 'error')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-xl p-6 border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm space-y-4"
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
                className="flex-1 px-4 py-2.5 rounded-xl border border-white/[0.08] text-text-secondary hover:text-text-primary hover:border-accent/50 transition-all text-sm"
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
              className="w-full px-4 py-2.5 rounded-xl border border-white/[0.08] text-text-secondary hover:text-text-primary hover:border-accent/50 transition-all text-sm"
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
            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-text-primary focus:outline-none focus:border-accent text-center text-lg tracking-widest"
          />
          <input
            type="password"
            maxLength={6}
            placeholder={t('settings.pinConfirm')}
            value={pinConfirm}
            onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, ''))}
            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-text-primary focus:outline-none focus:border-accent text-center text-lg tracking-widest"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setPinMode('none')}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/[0.08] text-text-secondary hover:text-text-primary transition-all text-sm"
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
  )
}
