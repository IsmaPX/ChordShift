import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-bg-secondary border border-border rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl"
          >
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center gap-4">
              <div className={`p-3 rounded-full ${
                variant === 'danger' ? 'bg-danger/20' : 'bg-warning/20'
              }`}>
                <AlertTriangle className={variant === 'danger' ? 'text-danger' : 'text-warning'} size={28} />
              </div>

              <div>
                <h3 className="text-lg font-medium text-text-primary mb-1">{title}</h3>
                <p className="text-text-secondary text-sm">{message}</p>
              </div>

              <div className="flex gap-3 w-full">
                <button
                  onClick={onCancel}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:border-accent/50 transition-all"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={onConfirm}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-white font-medium transition-colors ${
                    variant === 'danger'
                      ? 'bg-danger hover:bg-danger/90'
                      : 'bg-warning hover:bg-warning/90'
                  }`}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
