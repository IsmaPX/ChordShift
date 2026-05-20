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
            backgroundColor: i < filledDots ? '#7c5cfc' : 'rgba(255,255,255,0.1)',
          }}
          transition={{ duration: 0.2 }}
          className="w-2 h-2 rounded-full"
        />
      ))}
    </div>
  )
}