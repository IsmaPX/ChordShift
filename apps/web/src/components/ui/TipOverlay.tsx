import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TipOverlayProps {
  content: string
  category?: string
  isVisible: boolean
  onDismiss: () => void
  autoDismissMs?: number
}

export function TipOverlay({
  content,
  category,
  isVisible,
  onDismiss,
  autoDismissMs = 4000,
}: TipOverlayProps) {
  useEffect(() => {
    if (!isVisible) return

    const timer = setTimeout(() => {
      onDismiss()
    }, autoDismissMs)

    return () => clearTimeout(timer)
  }, [isVisible, autoDismissMs, onDismiss])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96"
        >
          <div
            className={cn(
              'relative bg-bg-secondary border border-border rounded-xl p-4 shadow-2xl',
              'backdrop-blur-sm bg-bg-secondary/90'
            )}
          >
            {category && (
              <span className="inline-block px-2 py-0.5 mb-2 text-xs font-medium rounded-full bg-accent/20 text-accent">
                {category}
              </span>
            )}
            <p className="text-text-primary text-sm leading-relaxed">{content}</p>
            <button
              onClick={onDismiss}
              className="absolute top-2 right-2 p-1 text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Dismiss tip"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}