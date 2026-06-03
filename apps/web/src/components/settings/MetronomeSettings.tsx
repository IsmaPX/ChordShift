import { motion } from 'framer-motion'
import { Music2 } from 'lucide-react'
import { type SettingsForm } from '@/lib/settings-schema'
import type { UseFormRegister, UseFormWatch } from 'react-hook-form'

interface Props {
  register: UseFormRegister<SettingsForm>
  watch: UseFormWatch<SettingsForm>
  t: (key: string, opts?: Record<string, unknown>) => string
}

export function MetronomeSettings({ register, watch, t }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="rounded-xl p-6 border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm space-y-4"
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
          <input type="checkbox" {...register('metronome_enabled')} className="sr-only peer" />
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
  )
}
