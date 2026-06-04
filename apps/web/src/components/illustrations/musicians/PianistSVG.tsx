import type { SVGProps } from 'react'

/**
 * PianistSVG — Personaje anime tocando piano.
 * Estilo: silueta estilizada con cabello largo, manos sobre teclas.
 * Paleta: grises con acentos verdes (sustituibles vía currentColor).
 */
export function PianistSVG(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 240 240"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
      {...props}
    >
      <defs>
        <linearGradient id="pianist-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="pianist-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Aura verde de fondo */}
      <ellipse cx="120" cy="140" rx="100" ry="80" fill="url(#pianist-glow)" />

      {/* Cuerpo */}
      <g fill="url(#pianist-body)">
        {/* Torso */}
        <path d="M85 120 Q85 95 120 90 Q155 95 155 120 L155 170 L85 170 Z" />

        {/* Cabello largo (cayendo) */}
        <path d="M80 90 Q75 50 120 40 Q165 50 160 90 L160 130 Q150 115 145 110 L145 85 Q140 75 120 75 Q100 75 95 85 L95 110 Q90 115 80 130 Z" />

        {/* Cara (hueco) */}
        <ellipse cx="120" cy="75" rx="22" ry="26" fill="#0a0a0a" />

        {/* Brazos hacia el piano */}
        <path d="M85 130 L60 160 L50 175 L70 180 L90 165 L95 145 Z" />
        <path d="M155 130 L180 160 L190 175 L170 180 L150 165 L145 145 Z" />
      </g>

      {/* Teclado del piano */}
      <g>
        <rect x="40" y="180" width="160" height="20" fill="currentColor" opacity="0.85" />
        <rect x="40" y="180" width="160" height="6" fill="#22c55e" opacity="0.6" />
        {/* Teclas blancas */}
        <g fill="#1a1a1a">
          {Array.from({ length: 12 }).map((_, i) => (
            <rect key={i} x={42 + i * 13} y={186} width="12" height="12" />
          ))}
        </g>
        {/* Teclas negras */}
        <g fill="#0a0a0a">
          {Array.from({ length: 8 }).map((_, i) => {
            const positions = [52, 78, 117, 143, 182]
            return positions[i] !== undefined ? (
              <rect key={i} x={positions[i]} y={186} width="8" height="8" />
            ) : null
          })}
        </g>
      </g>

      {/* Notas musicales flotando */}
      <g fill="#22c55e" opacity="0.8">
        <circle cx="40" cy="60" r="4" />
        <rect x="43" y="35" width="2" height="25" />
        <circle cx="200" cy="50" r="3" />
        <rect x="202" y="30" width="2" height="20" />
      </g>
    </svg>
  )
}
