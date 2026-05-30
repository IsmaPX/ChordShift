import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface StreakIndicatorProps {
  count: number
  className?: string
}

export function StreakIndicator({ count, className }: StreakIndicatorProps) {
  const normalizedCount = Math.min(count, 10)
  const filledDots = normalizedCount

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.div
          key={i}
          initial={false}
          animate={{
            scale: i < filledDots ? 1 : 0.8,
            opacity: i < filledDots ? 1 : 0.3,
          }}
          transition={{ 
            delay: i * 0.05, 
            type: "spring", 
            stiffness: 300, 
            damping: 15 
          }}
          className={cn(
            "w-2 h-2 rounded-full transition-colors",
            i < filledDots ? "bg-success" : "bg-border"
          )}
        />
      ))}
    </div>
  )
}
