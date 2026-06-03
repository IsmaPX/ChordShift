import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, LogOut, Trash2 } from 'lucide-react'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { createModuleLogger } from '@/lib/logger'
import type { LocalProfile } from '@/types/profile'

const log = createModuleLogger('ProfileSettings')

interface Props {
  user: LocalProfile | null
  logout: () => Promise<void>
  deleteProfile: (id: string) => Promise<void>
  navigate: (path: string) => void
  t: (key: string) => string
}

export function ProfileSettings({ user, logout, deleteProfile, navigate, t }: Props) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const handleSwitchProfile = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      log.error('Failed to switch profile', error as Error)
    }
  }

  const handleDeleteProfile = async () => {
    if (!user) return
    setDeleteModalOpen(false)
    try {
      await deleteProfile(user.id)
      navigate('/register')
    } catch (error) {
      log.error('Failed to delete profile', error as Error, { userId: user.id })
    }
  }

  return (
    <>
      <ConfirmModal
        isOpen={deleteModalOpen}
        title={t('settings.confirmDeleteTitle')}
        message={t('settings.confirmDeleteMsg')}
        confirmLabel={t('settings.confirmDeleteBtn')}
        cancelLabel={t('practice.cancel')}
        variant="danger"
        onConfirm={handleDeleteProfile}
        onCancel={() => setDeleteModalOpen(false)}
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="rounded-xl p-6 border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm space-y-4"
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
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-white/[0.08] text-text-secondary hover:text-text-primary hover:border-accent/50 transition-all"
          >
            <LogOut size={18} />
            {t('settings.profileSwitch')}
          </button>
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-danger hover:bg-danger/10 transition-colors"
          >
            <Trash2 size={18} />
            {t('settings.profileDelete')}
          </button>
        </div>
      </motion.div>
    </>
  )
}
