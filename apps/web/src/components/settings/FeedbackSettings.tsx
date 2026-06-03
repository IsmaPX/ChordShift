import { motion } from 'framer-motion'
import { Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type SettingsForm } from '@/lib/settings-schema'
import type { UseFormRegister, UseFormWatch } from 'react-hook-form'

interface Props {
  register: UseFormRegister<SettingsForm>
  watch: UseFormWatch<SettingsForm>
  t: (key: string, opts?: Record<string, unknown>) => string
}

export function FeedbackSettings({ register, watch, t }: Props) {
  const feedbackOptions = [
    { value: 'rings', label: t('settings.feedbackRings'), description: t('settings.feedbackRingsDesc') },
    { value: 'pulse', label: t('settings.feedbackPulse'), description: t('settings.feedbackPulseDesc') },
    { value: 'bar', label: t('settings.feedbackBar'), description: t('settings.feedbackBarDesc') },
  ] as const

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-xl p-6 border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm space-y-4"
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
                : 'border-white/[0.08] hover:border-accent/50'
            )}
          >
            <input type="radio" value={option.value} {...register('feedback_concept')} className="sr-only" />
            <div
              className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                watch('feedback_concept') === option.value
                  ? 'border-accent bg-accent'
                  : 'border-white/[0.08]'
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
  )
}
