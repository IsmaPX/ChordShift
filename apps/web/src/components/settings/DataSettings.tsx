import { useState } from 'react'
import { motion } from 'framer-motion'
import { Database, Trash2, Loader2 } from 'lucide-react'
import { useClearPracticeHistory, useClearEarTrainingResults } from '@/hooks/useUserSettings'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { createModuleLogger } from '@/lib/logger'

const log = createModuleLogger('DataSettings')

interface Props {
  showToast: (message: string, type?: 'success' | 'error') => void
  t: (key: string) => string
}

export function DataSettings({ showToast, t }: Props) {
  const clearPractice = useClearPracticeHistory()
  const clearEarTraining = useClearEarTrainingResults()

  const [clearPracticeModalOpen, setClearPracticeModalOpen] = useState(false)
  const [clearEarModalOpen, setClearEarModalOpen] = useState(false)

  const handleClearPractice = async () => {
    setClearPracticeModalOpen(false)
    try {
      await clearPractice.mutateAsync()
      showToast(t('settings.dataPracticeCleared'))
    } catch (error) {
      log.error('Failed to clear practice history', error as Error)
      showToast(t('settings.saveError'), 'error')
    }
  }

  const handleClearEarTraining = async () => {
    setClearEarModalOpen(false)
    try {
      await clearEarTraining.mutateAsync()
      showToast(t('settings.dataEarCleared'))
    } catch (error) {
      log.error('Failed to clear ear training results', error as Error)
      showToast(t('settings.saveError'), 'error')
    }
  }

  return (
    <>
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

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-xl p-6 border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm space-y-4"
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
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-white/[0.08] text-text-secondary hover:text-text-primary hover:border-warning/50 transition-all disabled:opacity-50"
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
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-white/[0.08] text-text-secondary hover:text-text-primary hover:border-warning/50 transition-all disabled:opacity-50"
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
    </>
  )
}
