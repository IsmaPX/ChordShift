import type { InstrumentName } from '@/types/music'
import { INSTRUMENTS } from '@/types/music'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { interactiveVariants } from '@/lib/animations/variants'

interface InstrumentSelectorProps {
  value: InstrumentName
  onChange: (instrument: InstrumentName) => void
  size?: 'sm' | 'md'
}

export function InstrumentSelector({ value, onChange, size = 'md' }: InstrumentSelectorProps) {
  return (
    <div className={cn('flex gap-1', size === 'sm' ? 'gap-1' : 'gap-2')}>
      {INSTRUMENTS.map((inst) => (
        <motion.button
          key={inst.value}
          variants={interactiveVariants.button}
          whileHover="hover"
          whileTap="tap"
          onClick={() => onChange(inst.value)}
          className={cn(
            'flex items-center gap-1.5 rounded-xl border transition-colors',
            size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm',
            value === inst.value
              ? 'border-accent bg-accent/10 text-accent shadow-sm'
              : 'border-border text-text-secondary hover:border-accent/50 hover:text-text-primary'
          )}
        >
          <span className={size === 'sm' ? 'text-sm' : 'text-base'}>{inst.icon}</span>
          {size !== 'sm' && <span className="font-medium">{inst.label}</span>}
        </motion.button>
      ))}
    </div>
  )
}
