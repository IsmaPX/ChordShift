import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { popIn } from '@/lib/animations'

interface ChordDisplayProps {
  chord: string
  isActive?: boolean
  className?: string
}

export function ChordDisplay({ chord, isActive = false, className }: ChordDisplayProps) {
  return (
    <motion.div
      initial="initial"
      animate={isActive ? "animate" : "initial"}
      variants={popIn}
      transition={{ 
        duration: 0.3, 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      }}
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
