import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Settings, Bell, Eye, LogOut, User, Loader2, Trash2, Shield, Database, Music2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import {
  useUserSettings,
  useUpdateSettings,
  useClearPracticeHistory,
  useClearEarTrainingResults,
  useSetPin,
} from '@/hooks/useUserSettings'
import { useNavigate } from 'react-router'
import { INSTRUMENTS, type InstrumentName } from '@/types/music'
import { Toast } from '@/components/ui/Toast'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

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

const feedbackOptions = [
  { value: 'rings', label: 'Anillos de Eco', description: 'Expansión suave con desvanecimiento' },
  { value: 'pulse', label: 'Pulso', description: 'Círculo central que pulsa' },
  { value: 'bar', label: 'Barra de Precisión', description: 'Línea horizontal que crece' },
] as const

const languages = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
]

const difficultyLabels = ['', 'Principiante', 'Fácil', 'Intermedio', 'Avanzado', 'Experto']

export function SettingsPage() {
  const navigate = useNavigate()
  const { user, isLoading: authLoading, logout, deleteProfile } = useAuth()
  const { data: settings, isLoading: settingsLoading } = useUserSettings()
  const updateSettings = useUpdateSettings()
  const clearPractice = useClearPracticeHistory()
  const clearEarTraining = useClearEarTrainingResults()
  const setPin = useSetPin()

  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [clearPracticeModalOpen, setClearPracticeModalOpen] = useState(false)
  const [clearEarModalOpen, setClearEarModalOpen] = useState(false)

  const [pinMode, setPinMode] = useState<'none' | 'set' | 'change'>('none')
  const [pinValue, setPinValue] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')

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
      showToast('Ajustes guardados correctamente')
    } catch (err) {
      showToast('Error al guardar ajustes', 'error')
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
    showToast('Historial de práctica eliminado')
  }

  const handleClearEarTraining = async () => {
    setClearEarModalOpen(false)
    await clearEarTraining.mutateAsync()
    showToast('Resultados de ear training eliminados')
  }

  const handleSavePin = async () => {
    if (pinValue.length < 4) {
      showToast('El PIN debe tener al menos 4 dígitos', 'error')
      return
    }
    if (pinValue !== pinConfirm) {
      showToast('Los PIN no coinciden', 'error')
      return
    }
    try {
      await setPin.mutateAsync(pinValue)
      showToast('PIN configurado correctamente')
      setPinMode('none')
      setPinValue('')
      setPinConfirm('')
    } catch (err) {
      showToast('Error al configurar PIN', 'error')
    }
  }

  const handleRemovePin = async () => {
    try {
      await setPin.mutateAsync(null)
      showToast('PIN eliminado')
    } catch (err) {
      showToast('Error al eliminar PIN', 'error')
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

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Eliminar Perfil"
        message="¿Estás seguro de eliminar este perfil? Todo tu progreso se perderá. Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleDeleteProfile}
        onCancel={() => setDeleteModalOpen(false)}
      />

      <ConfirmModal
        isOpen={clearPracticeModalOpen}
        title="Limpiar Historial"
        message="¿Eliminar todo tu historial de práctica? Los datos de canciones no se verán afectados."
        confirmLabel="Limpiar"
        cancelLabel="Cancelar"
        variant="warning"
        onConfirm={handleClearPractice}
        onCancel={() => setClearPracticeModalOpen(false)}
      />

      <ConfirmModal
        isOpen={clearEarModalOpen}
        title="Limpiar Resultados"
        message="¿Eliminar todos tus resultados de ear training? Esta acción no se puede deshacer."
        confirmLabel="Limpiar"
        cancelLabel="Cancelar"
        variant="warning"
        onConfirm={handleClearEarTraining}
        onCancel={() => setClearEarModalOpen(false)}
      />

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
            <label className="block text-text-primary text-sm mb-2">
              Dificultad predeterminada
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
          transition={{ delay: 0.05 }}
          className="bg-bg-secondary rounded-xl p-6 border border-border space-y-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-accent/20">
              <Music2 className="text-accent" size={20} />
            </div>
            <h2 className="text-lg font-medium text-text-primary">Metrónomo</h2>
          </div>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-text-secondary">Metrónomo en práctica</span>
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
                Volumen del metrónomo: {Math.round(watch('metronome_volume') * 100)}%
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
          transition={{ delay: 0.15 }}
          className="bg-bg-secondary rounded-xl p-6 border border-border space-y-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-accent/20">
              <Shield className="text-accent" size={20} />
            </div>
            <h2 className="text-lg font-medium text-text-primary">Seguridad</h2>
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
                    Cambiar PIN
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePin}
                    className="flex-1 px-4 py-2.5 rounded-xl text-danger hover:bg-danger/10 transition-colors text-sm"
                  >
                    Desactivar PIN
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => { setPinMode('set'); setPinValue(''); setPinConfirm('') }}
                  className="w-full px-4 py-2.5 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:border-accent/50 transition-all text-sm"
                >
                  Establecer PIN
                </button>
              )}
            </div>
          )}

          {(pinMode === 'set' || pinMode === 'change') && (
            <div className="space-y-3">
              <p className="text-text-secondary text-sm">
                {pinMode === 'set' ? 'Establece un PIN de 4 dígitos para proteger tu perfil' : 'Ingresa tu nuevo PIN'}
              </p>
              <input
                type="password"
                maxLength={6}
                placeholder="Nuevo PIN"
                value={pinValue}
                onChange={(e) => setPinValue(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 bg-bg-primary border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent text-center text-lg tracking-widest"
              />
              <input
                type="password"
                maxLength={6}
                placeholder="Confirmar PIN"
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
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSavePin}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-accent text-white font-medium hover:bg-accent/90 transition-colors text-sm"
                >
                  Guardar PIN
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
        transition={{ delay: 0.25 }}
        className="bg-bg-secondary rounded-xl p-6 border border-border space-y-4"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-accent/20">
            <Database className="text-accent" size={20} />
          </div>
          <h2 className="text-lg font-medium text-text-primary">Gestión de Datos</h2>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setClearPracticeModalOpen(true)}
            disabled={clearPractice.isPending}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:border-warning/50 transition-all disabled:opacity-50"
          >
            <span className="text-sm">Limpiar historial de práctica</span>
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
            <span className="text-sm">Limpiar resultados de ear training</span>
            {clearEarTraining.isPending ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Trash2 size={16} className="text-warning" />
            )}
          </button>
        </div>
      </motion.div>

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
            onClick={() => setDeleteModalOpen(true)}
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
