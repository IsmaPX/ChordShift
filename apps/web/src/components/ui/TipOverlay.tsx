import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { variants, interactiveVariants } from '@/lib/animations/variants'

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
          variants={variants.fadeInUp}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50"
        >
          <div
            className={cn(
              'relative bg-bg-secondary border border-border rounded-xl p-4 shadow-2xl',
              'backdrop-blur-md bg-bg-secondary/80'
            )}
          >
            {category && (
              <motion.span 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-block px-2 py-0.5 mb-2 text-xs font-medium rounded-full bg-accent/20 text-accent"
              >
                {category}
              </motion.span>
            )}
            <motion.p 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-text-primary text-sm leading-relaxed"
            >
              {content}
            </motion.p>
            <motion.button
              variants={interactiveVariants.button}
              whileHover="hover"
              whileTap="tap"
              onClick={onDismiss}
              className="absolute top-2 right-2 p-1 text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Dismiss tip"
            >
              <X size={16} />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
