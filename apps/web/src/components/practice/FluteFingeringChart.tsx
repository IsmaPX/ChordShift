import { getFluteFingering } from '@/data/fluteFingerings'
import { cn } from '@/lib/utils'

interface FluteFingeringChartProps {
  note: string
  isCurrent?: boolean
  className?: string
}

const FLUTE_HOLE_COUNT = 6

function fluteHoleState(holes: string, index: number): 'open' | 'closed' {
  const char = holes[index]
  if (char === 'X') return 'closed'
  return 'open'
}

export function FluteFingeringChart({ note, isCurrent, className }: FluteFingeringChartProps) {
  const fingering = getFluteFingering(note)

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wider">
        Digitación Flauta
      </span>
      <div className="relative flex items-center gap-0.5 px-3 py-1.5 rounded-lg bg-bg-primary/60 border border-accent/10">
        {fingering ? (
          <>
            {Array.from({ length: FLUTE_HOLE_COUNT }).map((_, i) => {
              const state = fluteHoleState(fingering.holes, i)
              return (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <div
                    className={cn(
                      'w-3 h-3 rounded-full border transition-all',
                      state === 'closed'
                        ? 'bg-accent border-accent shadow-[0_0_4px_rgba(34,197,94,0.5)]'
                        : 'border-border/50 bg-bg-secondary',
                      isCurrent && state === 'closed' && 'scale-110 shadow-[0_0_8px_rgba(250,204,21,0.6)]'
                    )}
                  />
                  {i < FLUTE_HOLE_COUNT - 1 && (
                    <div className="w-px h-1 bg-border/30" />
                  )}
                </div>
              )
            })}
          </>
        ) : (
          <span className="text-[9px] font-mono text-text-secondary/50">—</span>
        )}
      </div>
      {fingering && (
        <span className={cn(
          'text-[9px] font-mono',
          isCurrent ? 'text-warning' : 'text-text-secondary'
        )}>
          {fingering.written}
        </span>
      )}
    </div>
  )
}