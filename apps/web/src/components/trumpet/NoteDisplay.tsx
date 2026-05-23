import { getTrumpetFingering } from '@/data/trumpetFingerings'

interface NoteDisplayProps {
  note: string
  isActive?: boolean
}

export function NoteDisplay({ note, isActive }: NoteDisplayProps) {
  const fingering = getTrumpetFingering(note)

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`text-6xl font-bold transition-colors ${
          isActive ? 'text-accent' : 'text-text-primary'
        }`}
      >
        {note.replace(/\d/, '')}
        <span className="text-3xl text-text-secondary">{note.match(/\d/)?.[0] || ''}</span>
      </div>

      {fingering && (
        <div className="flex flex-col items-center gap-1">
          <div className="flex gap-2">
            {[1, 2, 3].map((valve) => (
              <div
                key={valve}
                className={`w-8 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${
                  fingering.valves[valve * 2 - 2] === '●'
                    ? 'border-accent bg-accent/20 text-accent'
                    : 'border-border text-text-secondary'
                }`}
              >
                <span className="text-xs font-bold">{valve}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 text-xs text-text-secondary">
            <span>Real: {fingering.sounding}</span>
          </div>
        </div>
      )}
    </div>
  )
}
