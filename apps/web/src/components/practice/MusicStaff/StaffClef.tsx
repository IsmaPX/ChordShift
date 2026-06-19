/**
 * StaffClef — SVG de claves musicales por instrumento.
 *
 * Cada instrumento tiene su clave estándar:
 *  - piano: clave de Sol (pentagrama agudo) + clave de Fa (pentagrama grave)
 *  - guitar: clave de Sol con "8" abajo (suena una 8va más grave)
 *  - violin: clave de Sol
 *  - flute: clave de Sol
 *  - trumpet: clave de Sol
 *  - harmonica: clave de Sol
 */

interface ClefProps {
  height?: number
  color?: string
  opacity?: number
  className?: string
}

/** Clave de Sol (G-clef) — usada por piano (agudo), guitarra, violín, flauta, trompeta, armónica. */
export function TrebleClef({ height = 60, color = '#22c55e', opacity = 0.55, className }: ClefProps) {
  return (
    <svg
      className={className}
      width="24"
      height={height}
      viewBox="0 0 32 80"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M14.5 68.5 C 10 68 8 62 11 58 C 14 54 18 56 16 62 C 14 68 8 65 8 52 C 8 35 22 30 22 18 C 22 5 15 2 13 8 C 11 14 13 28 13 40 C 13 55 8 62 13 75 M 13 8 L 13 75 C 13 78 11 80 8 78"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={opacity}
      />
      <circle cx="20" cy="45" r="5" stroke={color} strokeWidth="1.5" opacity={opacity * 0.5} />
    </svg>
  )
}

/** Clave de Sol con "8" (guitarra) — suena una octava más grave. */
export function GuitarClef({ height = 70, color = '#22c55e', opacity = 0.55, className }: ClefProps) {
  return (
    <svg
      className={className}
      width="28"
      height={height}
      viewBox="0 0 36 90"
      fill="none"
      aria-hidden="true"
    >
      <TrebleClef height={height - 20} color={color} opacity={opacity} />
      <text
        x="13"
        y="85"
        textAnchor="middle"
        fontSize="12"
        fontFamily="serif"
        fontWeight="bold"
        fill={color}
        opacity={opacity}
        className="animate-pulse"
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      >
        8
      </text>
    </svg>
  )
}

/** Clave de Fa (F-clef / Bass clef) — usada por piano (grave). */
export function BassClef({ height = 60, color = '#22c55e', opacity = 0.55, className }: ClefProps) {
  return (
    <svg
      className={className}
      width="24"
      height={height}
      viewBox="0 0 32 80"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10 20 C 10 10, 25 10, 25 25 C 25 40, 15 55, 8 65"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        opacity={opacity}
      />
      <circle cx="10" cy="20" r="3.5" fill={color} opacity={opacity} />
      <circle cx="28" cy="18" r="2.5" fill={color} opacity={opacity} />
      <circle cx="28" cy="32" r="2.5" fill={color} opacity={opacity} />
    </svg>
  )
}


/** Clave de Do (C-clef / Viola clef) — referencia visual, no usada actualmente. */
export function AltoClef({ height = 60, color = '#22c55e', opacity = 0.55, className }: ClefProps) {
  return (
    <svg
      className={className}
      width="24"
      height={height}
      viewBox="0 0 32 80"
      fill="none"
      aria-hidden="true"
    >
      <rect x="4" y="8" width="4" height="64" fill={color} opacity={opacity} rx="1" />
      <path
        d="M8 8 L 8 40 L 22 26 L 8 12 M 8 40 L 22 54 L 8 68"
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinejoin="round"
        opacity={opacity}
      />
      <rect x="22" y="8" width="3" height="64" fill={color} opacity={opacity * 0.6} rx="1" />
    </svg>
  )
}
