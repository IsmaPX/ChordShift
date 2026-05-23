import { GUITAR_CHORD_DIAGRAMS } from '@/data/guitarChords'

interface ChordDiagramProps {
  chord: string
}

const FRET_COUNT = 5
const STRING_SPACING = 24
const FRET_SPACING = 28
const MARGIN_X = 20
const MARGIN_Y = 30
const DOT_RADIUS = 8
const WIDTH = MARGIN_X * 2 + STRING_SPACING * 5
const HEIGHT = MARGIN_Y + FRET_SPACING * FRET_COUNT + 10

export function ChordDiagram({ chord }: ChordDiagramProps) {
  const diagram = GUITAR_CHORD_DIAGRAMS[chord]
  if (!diagram) return null

  const nutOffset = diagram.position && diagram.position > 0 ? 0 : FRET_SPACING

  function stringX(stringIndex: number): number {
    return MARGIN_X + stringIndex * STRING_SPACING
  }

  function fretY(fretIndex: number): number {
    return MARGIN_Y + nutOffset + fretIndex * FRET_SPACING
  }

  const maxFret = Math.max(...diagram.frets.filter(f => f > 0), 0)
  const barreFret = diagram.barres?.[0]?.fret || 1
  const displayPosition = diagram.position || (maxFret > 4 ? barreFret : 0)

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="mx-auto"
    >
      {displayPosition > 0 && (
        <text
          x={4}
          y={MARGIN_Y + nutOffset / 2 + 4}
          className="fill-text-secondary text-[10px]"
          textAnchor="middle"
          fontSize="10"
        >
          {displayPosition}
        </text>
      )}

      {displayPosition === 0 && (
        <rect
          x={MARGIN_X - 3}
          y={MARGIN_Y}
          width={STRING_SPACING * 5 + 6}
          height={4}
          rx={1}
          className="fill-text-primary"
        />
      )}

      {Array.from({ length: FRET_COUNT + 1 }).map((_, i) => (
        <line
          key={`fret-${i}`}
          x1={MARGIN_X}
          y1={fretY(i)}
          x2={MARGIN_X + STRING_SPACING * 5}
          y2={fretY(i)}
          className="stroke-text-secondary"
          strokeWidth={i === 0 && displayPosition === 0 ? 4 : 1}
        />
      ))}

      {Array.from({ length: 6 }).map((_, i) => (
        <line
          key={`string-${i}`}
          x1={stringX(i)}
          y1={fretY(0)}
          x2={stringX(i)}
          y2={fretY(FRET_COUNT)}
          className="stroke-text-secondary"
          strokeWidth={1}
        />
      ))}

      {diagram.barres?.map((barre, bIdx) => {
        const x1 = stringX(barre.from - 1)
        const x2 = stringX(barre.to - 1)
        const y = fretY(barre.fret - (displayPosition > 0 ? displayPosition - 1 : 0) - 1) + FRET_SPACING / 2
        return (
          <rect
            key={`barre-${bIdx}`}
            x={x1 - DOT_RADIUS}
            y={y - DOT_RADIUS}
            width={x2 - x1 + DOT_RADIUS * 2}
            height={DOT_RADIUS * 2}
            rx={DOT_RADIUS}
            className="fill-accent"
          />
        )
      })}

      {diagram.frets.map((fret, stringIndex) => {
        if (fret === -1) {
          return (
            <text
              key={`x-${stringIndex}`}
              x={stringX(stringIndex)}
              y={MARGIN_Y - 8}
              className="fill-text-secondary"
              textAnchor="middle"
              fontSize="12"
            >
              ✕
            </text>
          )
        }
        if (fret === 0) {
          return (
            <circle
              key={`o-${stringIndex}`}
              cx={stringX(stringIndex)}
              cy={MARGIN_Y - 8}
              r={6}
              className="fill-none stroke-text-secondary"
              strokeWidth={1.5}
            />
          )
        }

        const actualFret = fret - (displayPosition > 0 ? displayPosition - 1 : 0)
        if (actualFret < 1 || actualFret > FRET_COUNT) return null

        const cy = fretY(actualFret - 1) + FRET_SPACING / 2

        const isBarred = diagram.barres?.some(
          b => b.fret === fret && stringIndex >= b.from - 1 && stringIndex <= b.to - 1
        )
        if (isBarred) return null

        return (
          <circle
            key={`dot-${stringIndex}`}
            cx={stringX(stringIndex)}
            cy={cy}
            r={DOT_RADIUS}
            className="fill-accent"
          />
        )
      })}

      {diagram.frets.map((fret, stringIndex) => {
        if (fret <= 0) return null
        const finger = diagram.fingers[stringIndex]
        if (!finger || finger === 0) return null

        const actualFret = fret - (displayPosition > 0 ? displayPosition - 1 : 0)
        if (actualFret < 1 || actualFret > FRET_COUNT) return null

        const cy = fretY(actualFret - 1) + FRET_SPACING / 2

        const isBarred = diagram.barres?.some(
          b => b.fret === fret && stringIndex >= b.from - 1 && stringIndex <= b.to - 1
        )
        if (isBarred) return null

        return (
          <text
            key={`finger-${stringIndex}`}
            x={stringX(stringIndex)}
            y={cy + 1}
            className="fill-white text-[9px]"
            textAnchor="middle"
            fontSize="9"
            dominantBaseline="middle"
          >
            {finger}
          </text>
        )
      })}
    </svg>
  )
}
