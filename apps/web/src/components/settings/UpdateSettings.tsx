import { motion } from 'framer-motion'
import { Download, RefreshCw, Loader2 } from 'lucide-react'
import { useAutoUpdate } from '@/hooks/useAutoUpdate'

interface Props {
  t: (key: string, opts?: Record<string, unknown>) => string
}

export function UpdateSettings({ t }: Props) {
  const {
    updateState,
    updateProgress,
    updateVersion,
    handleCheckForUpdates,
    handleInstallUpdate,
  } = useAutoUpdate()

  if (!window.isElectron) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="rounded-xl p-6 border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm space-y-4"
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
            <div className="w-full h-2 rounded-full bg-white/[0.03] overflow-hidden">
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
  )
}
