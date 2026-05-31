import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { Style } from '@/types/music'
import { interactiveVariants } from '@/lib/animations/variants'

interface StyleCardProps {
  style: Style
  onClick?: () => void
  className?: string
}

export function StyleCard({ style, onClick, className }: StyleCardProps) {
  return (
    <motion.button
      variants={interactiveVariants.card}
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      className={cn(
        'w-full text-left bg-bg-secondary border border-border rounded-xl p-4',
        'hover:border-accent/50 transition-colors shadow-sm hover:shadow-md',
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-text-primary font-medium text-lg">{style.name}</h3>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                i < style.difficulty ? 'bg-accent' : 'bg-border'
              )}
            />
          ))}
        </div>
      </div>

      <p className="text-text-secondary text-sm mb-4 line-clamp-2">
        {style.description}
      </p>

      {style.techniques.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {style.techniques.slice(0, 3).map((technique, index) => (
            <span
              key={index}
              className="px-2 py-0.5 text-xs rounded-full bg-border/50 text-text-secondary"
            >
              {technique}
            </span>
          ))}
          {style.techniques.length > 3 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-border/50 text-text-secondary">
              +{style.techniques.length - 3}
            </span>
          )}
        </div>
      )}
    </motion.button>
  )
}
