import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Props {
  children: ReactNode
  className?: string
  hover?: boolean
}

export function GlassCard({ children, className, hover = true }: Props) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, transition: { type: 'spring', stiffness: 400, damping: 25 } } : undefined}
      whileTap={hover ? { scale: 0.98 } : undefined}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl',
        'hover:bg-white/[0.05] hover:border-white/[0.1]',
        'transition-all duration-300',
        className
      )}
    >
      {/* Top shine effect */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Inner glow on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        {children ?? null}
      </div>
    </motion.div>
  )
}
