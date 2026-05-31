import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, X } from 'lucide-react'
import { variants, interactiveVariants } from '@/lib/animations/variants'

type ToastType = 'success' | 'error'

interface ToastProps {
  message: string
  type?: ToastType
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export function Toast({ message, type = 'success', isVisible, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (!isVisible) return
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [isVisible, onClose, duration])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={variants.slideLeft}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed top-4 right-4 z-50"
        >
          <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border backdrop-blur-md ${
            type === 'success'
              ? 'bg-success/10 border-success/30 text-success'
              : 'bg-danger/10 border-danger/30 text-danger'
          }`}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
            >
              {type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
            </motion.div>
            <span className="text-sm font-medium">{message}</span>
            <motion.button 
              whileHover="hover"
              whileTap="tap"
              variants={interactiveVariants.button}
              onClick={onClose} 
              className="ml-2 hover:opacity-70 transition-opacity"
            >
              <X size={16} />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
