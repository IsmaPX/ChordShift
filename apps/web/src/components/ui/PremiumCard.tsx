import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface PremiumCardProps {
  children: ReactNode
  className?: string
  hoverEffect?: 'lift' | 'glow' | 'scale'
  delay?: number
}

export function PremiumCard({ children, className = '', hoverEffect = 'lift', delay = 0 }: PremiumCardProps) {
  const prefersReducedMotion = useReducedMotion()

  const getHoverClass = () => {
    switch (hoverEffect) {
      case 'glow':
        return 'hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]'
      case 'scale':
        return ''
      default:
        return ''
    }
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={prefersReducedMotion ? {} : { y: -4, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
      className={`
        relative overflow-hidden rounded-2xl border border-white/[0.06]
        bg-white/[0.03] backdrop-blur-xl
        hover:bg-white/[0.05]
        transition-colors duration-300
        ${getHoverClass()}
        ${className}
      `}
    >
      {/* Subtle top shine */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      {/* Inner glow on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}