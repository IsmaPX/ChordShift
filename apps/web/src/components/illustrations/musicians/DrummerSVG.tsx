import type { SVGProps } from 'react'

/**
 * DrummerSVG — Personaje anime tocando batería.
 * Estilo: silueta detrás de batería con baquetas.
 * Paleta: grises con acentos verdes.
 */
export function DrummerSVG(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 240 240"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
      {...props}
    >
      <defs>
        <linearGradient id="drummer-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
        </linearGradient>
        <radialGradient id="drummer-glow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="120" cy="130" rx="110" ry="85" fill="url(#drummer-glow)" />

      {/* Cuerpo */}
      <g fill="url(#drummer-body)">
        {/* Piernas separadas */}
        <path d="M95 180 L80 220 L98 220 L108 185 Z" />
        <path d="M145 180 L160 220 L142 220 L132 185 Z" />

        {/* Torso inclinado hacia adelante */}
        <path d="M88 105 Q85 85 100 78 L140 78 Q155 85 152 105 L158 175 L82 175 Z" />

        {/* Cabello desordenado */}
        <path d="M80 80 Q75 40 120 32 Q165 40 160 80 L162 105 Q155 95 150 92 L150 70 Q140 60 120 60 Q100 60 90 70 L90 92 Q85 95 78 105 Z" />
        <path d="M88 45 L95 30 L105 45 Z" />
        <path d="M152 45 L145 30 L135 45 Z" />

        {/* Cara (hueco) */}
        <ellipse cx="120" cy="72" rx="20" ry="24" fill="#0a0a0a" />

        {/* Brazos extendidos */}
        <path d="M88 110 L40 130 L35 145 L85 140 Z" />
        <path d="M152 110 L200 130 L205 145 L155 140 Z" />
      </g>

      {/* Baquetas */}
      <g stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <line x1="35" y1="138" x2="55" y2="125" />
        <line x1="205" y1="138" x2="185" y2="125" />
      </g>

      {/* Batería */}
      <g>
        {/* Bombo central */}
        <ellipse cx="120" cy="195" rx="55" ry="25" fill="currentColor" opacity="0.85" />
        <ellipse cx="120" cy="190" rx="48" ry="20" fill="#1a1a1a" />
        <ellipse cx="120" cy="190" rx="48" ry="20" fill="none" stroke="#22c55e" strokeWidth="1" opacity="0.5" />
        <text x="120" y="195" textAnchor="middle" fill="#22c55e" fontSize="14" fontWeight="bold" opacity="0.8">♪</text>

        {/* Toms laterales */}
        <ellipse cx="60" cy="180" rx="20" ry="15" fill="currentColor" opacity="0.8" />
        <ellipse cx="60" cy="178" rx="16" ry="11" fill="#1a1a1a" />
        <ellipse cx="60" cy="178" rx="16" ry="11" fill="none" stroke="#22c55e" strokeWidth="1" opacity="0.5" />

        <ellipse cx="180" cy="180" rx="20" ry="15" fill="currentColor" opacity="0.8" />
        <ellipse cx="180" cy="178" rx="16" ry="11" fill="#1a1a1a" />
        <ellipse cx="180" cy="178" rx="16" ry="11" fill="none" stroke="#22c55e" strokeWidth="1" opacity="0.5" />

        {/* Platillos */}
        <ellipse cx="35" cy="100" rx="18" ry="4" fill="#22c55e" opacity="0.7" />
        <line x1="35" y1="100" x2="35" y2="125" stroke="currentColor" strokeWidth="2" />
        <ellipse cx="205" cy="100" rx="18" ry="4" fill="#22c55e" opacity="0.7" />
        <line x1="205" y1="100" x2="205" y2="125" stroke="currentColor" strokeWidth="2" />
      </g>

      {/* Notas de impacto */}
      <g fill="#22c55e" opacity="0.8">
        <circle cx="25" cy="80" r="3" />
        <circle cx="215" cy="80" r="3" />
      </g>
    </svg>
  )
}
