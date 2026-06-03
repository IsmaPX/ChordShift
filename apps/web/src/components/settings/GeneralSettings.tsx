import { motion } from 'framer-motion'
import { Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { INSTRUMENTS } from '@/types/music'
import { type SettingsForm } from '@/lib/settings-schema'
import type { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form'

interface Props {
  register: UseFormRegister<SettingsForm>
  watch: UseFormWatch<SettingsForm>
  setValue: UseFormSetValue<SettingsForm>
  t: (key: string, opts?: Record<string, unknown>) => string
}

const languages = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
]

export function GeneralSettings({ register, watch, setValue, t }: Props) {
  const difficultyLabels = ['', t('settings.difficultyLabel.1'), t('settings.difficultyLabel.2'), t('settings.difficultyLabel.3'), t('settings.difficultyLabel.4'), t('settings.difficultyLabel.5')]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-6 border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm space-y-4"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-accent/20">
          <Settings className="text-accent" size={20} />
        </div>
        <h2 className="text-lg font-medium text-text-primary">{t('settings.general')}</h2>
      </div>

      <div>
        <label className="block text-text-primary text-sm mb-2">{t('settings.language')}</label>
        <select
          {...register('language')}
          className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-text-primary focus:outline-none focus:border-accent/50 transition-all"
        >
          {languages.map((lang) => (
            <option key={lang.value} value={lang.value}>{lang.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-text-primary text-sm mb-2">{t('settings.tempo', { bpm: watch('tempo_bpm') })}</label>
        <input
          type="range"
          min="60"
          max="200"
          {...register('tempo_bpm', { valueAsNumber: true })}
          className="w-full accent-accent"
        />
      </div>

      <div>
        <label className="block text-text-primary text-sm mb-2">{t('settings.difficulty')}</label>
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
                  : 'border-white/[0.08] text-text-secondary hover:border-accent/50'
              )}
            >
              {d}
            </button>
          ))}
        </div>
        <p className="text-text-secondary text-xs mt-1">{difficultyLabels[watch('difficulty')]}</p>
      </div>

      <div>
        <label className="block text-text-primary text-sm mb-3">{t('settings.instrument')}</label>
        <div className="grid grid-cols-3 gap-2">
          {INSTRUMENTS.map((inst) => (
            <label
              key={inst.value}
              className={cn(
                'flex flex-col items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors',
                watch('preferred_instrument') === inst.value
                  ? 'border-accent bg-accent/10'
                  : 'border-white/[0.08] hover:border-accent/50'
              )}
            >
              <input type="radio" value={inst.value} {...register('preferred_instrument')} className="sr-only" />
              <span className="text-2xl">{inst.icon}</span>
              <span className="text-text-primary text-sm font-medium">{t('instruments.' + inst.value)}</span>
            </label>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
