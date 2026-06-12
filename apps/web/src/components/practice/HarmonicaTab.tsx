import { getHarmonicaTab } from '@/data/harmonicaTabs'
import { cn } from '@/lib/utils'

interface HarmonicaTabProps {
  note: string
  isCurrent?: boolean
  className?: string
}

const HOLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export function HarmonicaTab({ note, isCurrent, className }: HarmonicaTabProps) {
  const tab = getHarmonicaTab(note)

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wider">
        Armónica Diatónica C
      </span>
      <div className="relative flex items-center gap-0.5 px-2 py-1.5 rounded-lg bg-bg-primary/60 border border-accent/10 overflow-hidden">
        {HOLES.map((hole) => {
          const isActiveHole = tab?.hole === hole
          const activeBlow = isActiveHole && tab?.blow === note
          const activeDraw = isActiveHole && tab?.draw === note

          return (
            <div key={hole} className="flex flex-col items-center gap-0.5">
              <span className={cn(
                'text-[7px] font-mono leading-none transition-colors',
                activeBlow ? 'text-warning' : 'text-text-secondary/40'
              )}>
                {tab?.hole === hole && tab?.blow ? '▲' : ''}
              </span>
              <div
                className={cn(
                  'w-5 h-5 rounded-full border transition-all',
                  activeBlow
                    ? 'border-warning bg-warning/20 shadow-[0_0_6px_rgba(250,204,21,0.5)] scale-110'
                    : activeDraw
                    ? 'border-warning bg-warning/20 shadow-[0_0_6px_rgba(250,204,21,0.5)] scale-110'
                    : 'border-border/40 bg-bg-secondary',
                  isCurrent && (activeBlow || activeDraw) && 'shadow-[0_0_12px_rgba(250,204,21,0.8)]'
                )}
              >
                <span className={cn(
                  'flex items-center justify-center h-full text-[6px] font-mono font-bold',
                  (activeBlow || activeDraw) ? 'text-warning' : 'text-text-secondary/30'
                )}>
                  {hole}
                </span>
              </div>
              <span className={cn(
                'text-[7px] font-mono leading-none transition-colors',
                activeDraw ? 'text-warning' : 'text-text-secondary/40'
              )}>
                {tab?.hole === hole && tab?.draw ? '▼' : ''}
              </span>
              {hole < 10 && (
                <div className="w-px h-1 bg-border/20 self-stretch" />
              )}
            </div>
          )
        })}
      </div>
      {tab && (
        <div className="flex gap-2 text-[9px] font-mono">
          {tab.blow && (
            <span className={cn(
              isCurrent && note === tab.blow ? 'text-warning' : 'text-text-secondary'
            )}>
              sop: {tab.blow}
            </span>
          )}
          {tab.draw && (
            <span className={cn(
              isCurrent && note === tab.draw ? 'text-warning' : 'text-text-secondary'
            )}>
              asp: {tab.draw}
            </span>
          )}
          {tab.bendDraw && (
            <span className="text-text-secondary/50">bend: {tab.bendDraw}</span>
          )}
        </div>
      )}
    </div>
  )
}