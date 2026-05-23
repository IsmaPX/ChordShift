import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Settings, Bell, Eye, LogOut, User, Loader2, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useUserSettings, useUpdateSettings } from '@/hooks/useUserSettings'
import { useNavigate } from 'react-router'
import { INSTRUMENTS, type InstrumentName } from '@/types/music'

const settingsSchema = z.object({
  tempo_bpm: z.number().min(60).max(200),
  language: z.string(),
  notifications_enabled: z.boolean(),
  feedback_concept: z.enum(['pulse', 'bar', 'rings']),
  preferred_instrument: z.enum(['piano', 'guitar', 'trumpet']),
})

type SettingsForm = z.infer<typeof settingsSchema>

const feedbackOptions = [
  { value: 'rings', label: 'Anillos de Eco', description: 'Expansión suave con desvanecimiento' },
  { value: 'pulse', label: 'Pulso', description: 'Círculo central que pulsa' },
  { value: 'bar', label: 'Barra de Precisión', description: 'Línea horizontal que crece' },
] as const

const languages = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
]

export function SettingsPage() {
  const navigate = useNavigate()
  const { user, isLoading: authLoading, logout, deleteProfile } = useAuth()
  const { data: settings, isLoading: settingsLoading } = useUserSettings()
  const updateSettings = useUpdateSettings()

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { isSubmitting },
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      tempo_bpm: 120,
      language: 'es',
      notifications_enabled: true,
      feedback_concept: 'rings',
      preferred_instrument: 'piano' as InstrumentName,
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
    } catch (err) {
      console.error('Failed to update settings:', err)
    }
  }

  const handleSwitchProfile = async () => {
    await logout()
    navigate('/login')
  }

  const handleDeleteProfile = async () => {
    if (!user) return
    const confirmed = window.confirm('¿Estás seguro de eliminar este perfil? Todo tu progreso se perderá.')
    if (!confirmed) return
    await deleteProfile(user.id)
    navigate('/register')
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
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Ajustes</h1>
        <p className="text-text-secondary">
          Personaliza tu experiencia en la app
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
            <h2 className="text-lg font-medium text-text-primary">General</h2>
          </div>

          <div>
            <label className="block text-text-primary text-sm mb-2">
              Idioma
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
              Tempo predeterminado: {watch('tempo_bpm')} BPM
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
            <label className="block text-text-primary text-sm mb-3">
              Instrumento preferido
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
                  <span className="text-text-primary text-sm font-medium">{inst.label}</span>
                </label>
              ))}
            </div>
          </div>
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
            <h2 className="text-lg font-medium text-text-primary">Notificaciones</h2>
          </div>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-text-secondary">Recordatorios de práctica</span>
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
          transition={{ delay: 0.2 }}
          className="bg-bg-secondary rounded-xl p-6 border border-border space-y-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-accent/20">
              <Eye className="text-accent" size={20} />
            </div>
            <h2 className="text-lg font-medium text-text-primary">Concepto de Feedback</h2>
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
          {isSubmitting ? 'Guardando...' : 'Guardar Ajustes'}
        </button>
      </form>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
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
            Cambiar Perfil
          </button>
          <button
            onClick={handleDeleteProfile}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-danger hover:bg-danger/10 transition-colors"
          >
            <Trash2 size={18} />
            Eliminar Perfil
          </button>
        </div>
      </motion.div>
    </div>
  )
}
