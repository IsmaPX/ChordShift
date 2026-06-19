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
        d="M16 8 C 12 12, 10 18, 12 24 C 14 30, 18 32, 20 28 C 22 24, 18 18, 14 22 C 10 26, 8 32, 12 40 C 16 48, 22 52, 22 60 C 22 68, 16 72, 12 68 M 14 22 L 14 72 M 20 28 L 20 8"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        opacity={opacity}
      />
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
      <path
        d="M16 8 C 12 12, 10 18, 12 24 C 14 30, 18 32, 20 28 C 22 24, 18 18, 14 22 C 10 26, 8 32, 12 40 C 16 48, 22 52, 22 60 C 22 68, 16 72, 12 68 M 14 22 L 14 72 M 20 28 L 20 8"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        opacity={opacity}
      />
      {/* "8" debajo de la clave de Sol */}
      <text
        x="14"
        y="82"
        textAnchor="middle"
        fontSize="11"
        fontFamily="serif"
        fontWeight="bold"
        fill={color}
        opacity={opacity}
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
      {/* Cuerpo de la clave de Fa */}
      <path
        d="M8 20 C 8 20, 10 24, 14 24 C 18 24, 22 20, 22 14 C 22 8, 18 4, 14 6 C 10 8, 8 14, 8 20 Z"
        stroke={color}
        strokeWidth="2"
        fill="none"
        opacity={opacity}
      />
      {/* Cola de la clave */}
      <path
        d="M8 20 L 8 60"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity={opacity}
      />
      {/* Dos puntos de la clave de Fa */}
      <circle cx="24" cy="12" r="2.5" fill={color} opacity={opacity} />
      <circle cx="24" cy="22" r="2.5" fill={color} opacity={opacity} />
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
