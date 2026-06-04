import type { SVGProps } from 'react'

/**
 * GuitaristSVG — Personaje anime tocando guitarra.
 * Estilo: silueta con guitarra acústica, pose de concierto.
 * Paleta: grises con acentos verdes.
 */
export function GuitaristSVG(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 240 240"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
      {...props}
    >
      <defs>
        <linearGradient id="guitarist-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
        </linearGradient>
        <radialGradient id="guitarist-glow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="120" cy="130" rx="105" ry="85" fill="url(#guitarist-glow)" />

      {/* Cuerpo */}
      <g fill="url(#guitarist-body)">
        {/* Piernas */}
        <path d="M95 175 L90 220 L105 220 L110 180 Z" />
        <path d="M145 175 L150 220 L135 220 L130 180 Z" />

        {/* Torso inclinado */}
        <path d="M88 100 Q85 85 100 78 L140 78 Q155 85 152 100 L155 165 L85 165 Z" />

        {/* Cabello con mechón */}
        <path d="M82 75 Q78 45 120 35 Q162 45 158 75 L160 100 Q150 90 145 88 L145 70 Q140 60 120 60 Q100 60 95 70 L95 88 Q90 90 80 100 Z" />
        <path d="M155 50 Q165 35 158 25 L150 30 Q152 40 155 50" opacity="0.7" />

        {/* Cara (hueco) */}
        <ellipse cx="120" cy="72" rx="20" ry="24" fill="#0a0a0a" />

        {/* Brazo derecho (rasgueo) */}
        <path d="M150 110 Q175 115 180 140 L175 155 Q165 140 150 130 Z" />

        {/* Brazo izquierdo (mastil) */}
        <path d="M90 100 L60 70 L55 78 L85 110 Z" />
      </g>

      {/* Guitarra */}
      <g>
        {/* Mastil */}
        <rect
          x="40"
          y="60"
          width="55"
          height="14"
          rx="3"
          transform="rotate(-30 67 67)"
          fill="currentColor"
          opacity="0.85"
        />
        {/* Cabeza de la guitarra */}
        <rect
          x="28"
          y="50"
          width="20"
          height="22"
          rx="2"
          transform="rotate(-30 38 61)"
          fill="currentColor"
          opacity="0.85"
        />
        {/* Cuerpo de la guitarra */}
        <ellipse cx="160" cy="155" rx="42" ry="50" fill="currentColor" opacity="0.9" />
        <ellipse cx="160" cy="155" rx="32" ry="40" fill="#1a1a1a" opacity="0.6" />
        {/* Hueco central */}
        <circle cx="160" cy="155" r="10" fill="#0a0a0a" />
        <circle cx="160" cy="155" r="10" fill="none" stroke="#22c55e" strokeWidth="1.5" opacity="0.7" />
        {/* Cuerdas */}
        <g stroke="#22c55e" strokeWidth="0.5" opacity="0.4">
          <line x1="125" y1="140" x2="200" y2="140" />
          <line x1="125" y1="145" x2="200" y2="145" />
          <line x1="125" y1="150" x2="200" y2="150" />
          <line x1="125" y1="160" x2="200" y2="160" />
          <line x1="125" y1="170" x2="200" y2="170" />
        </g>
      </g>

      {/* Nota musical */}
      <g fill="#22c55e" opacity="0.8">
        <circle cx="210" cy="50" r="3.5" />
        <rect x="212" y="28" width="2" height="22" />
        <path d="M214 28 Q220 28 220 35 L220 38 Q220 32 214 32 Z" />
      </g>
    </svg>
  )
}
