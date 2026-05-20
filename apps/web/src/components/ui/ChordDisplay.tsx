import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ChordDisplayProps {
  chord: string
  isActive?: boolean
  className?: string
}

export function ChordDisplay({ chord, isActive = false, className }: ChordDisplayProps) {
  return (
    <motion.div
      initial={false}
      animate={{
        scale: isActive ? 1 : 0.95,
        opacity: isActive ? 1 : 0.4,
      }}
      transition={{ duration: 0.2 }}
      className={cn(
        'font-mono font-bold tracking-wide transition-all',
        isActive ? 'text-text-primary text-[48px] md:text-[64px]' : 'text-text-secondary text-2xl',
        className
      )}
    >
      {chord}
    </motion.div>
  )
}