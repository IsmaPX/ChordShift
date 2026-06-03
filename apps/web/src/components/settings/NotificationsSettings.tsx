import { motion } from 'framer-motion'
import { Bell } from 'lucide-react'
import { type SettingsForm } from '@/lib/settings-schema'
import type { UseFormRegister } from 'react-hook-form'

interface Props {
  register: UseFormRegister<SettingsForm>
  t: (key: string) => string
}

export function NotificationsSettings({ register, t }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-xl p-6 border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm space-y-4"
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
          <input type="checkbox" {...register('notifications_enabled')} className="sr-only peer" />
          <div className="w-11 h-6 bg-border rounded-full peer-checked:bg-accent transition-colors" />
          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
        </div>
      </label>
    </motion.div>
  )
}
