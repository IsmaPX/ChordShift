import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import { variants, interactiveVariants } from '@/lib/animations/variants'

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
            variants={variants.fadeIn}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.div
            variants={variants.modal}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative bg-bg-secondary border border-border rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl"
          >
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onCancel}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors"
            >
              <X size={20} />
            </motion.button>

            <div className="flex flex-col items-center text-center gap-4">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
                className={`p-3 rounded-full ${
                  variant === 'danger' ? 'bg-danger/20' : 'bg-warning/20'
                }`}
              >
                <AlertTriangle className={variant === 'danger' ? 'text-danger' : 'text-warning'} size={28} />
              </motion.div>

              <div className="space-y-1">
                <motion.h3 
                  variants={variants.fadeInUp}
                  initial="initial"
                  animate="animate"
                  className="text-lg font-medium text-text-primary"
                >
                  {title}
                </motion.h3>
                <motion.p 
                  variants={variants.fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.1 }}
                  className="text-text-secondary text-sm"
                >
                  {message}
                </motion.p>
              </div>

              <div className="flex gap-3 w-full mt-2">
                <motion.button
                  variants={interactiveVariants.button}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={onCancel}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:border-accent/50 transition-all"
                >
                  {cancelLabel}
                </motion.button>
                <motion.button
                  variants={interactiveVariants.button}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={onConfirm}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-white font-medium transition-colors ${
                    variant === 'danger'
                      ? 'bg-danger hover:bg-danger/90'
                      : 'bg-warning hover:bg-warning/90'
                  }`}
                >
                  {confirmLabel}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
