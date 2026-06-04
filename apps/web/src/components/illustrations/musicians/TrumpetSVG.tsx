import type { SVGProps } from 'react'

/**
 * TrumpetSVG — Personaje anime tocando trompeta.
 * Estilo: silueta en pose dinámica con trompeta en alto.
 * Paleta: grises con acentos verdes.
 */
export function TrumpetSVG(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 240 240"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
      {...props}
    >
      <defs>
        <linearGradient id="trumpet-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
        </linearGradient>
        <radialGradient id="trumpet-glow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="120" cy="140" rx="100" ry="90" fill="url(#trumpet-glow)" />

      {/* Cuerpo */}
      <g fill="url(#trumpet-body)">
        {/* Piernas */}
        <path d="M95 175 L88 220 L103 220 L110 180 Z" />
        <path d="M145 175 L150 220 L135 220 L130 180 Z" />

        {/* Torso erguido */}
        <path d="M88 100 Q85 80 100 73 L140 73 Q155 80 152 100 L155 170 L85 170 Z" />

        {/* Cabello corto despeinado */}
        <path d="M82 70 Q78 35 120 30 Q162 35 158 70 L160 95 Q150 85 145 82 L148 65 Q140 55 120 55 Q100 55 92 65 L95 82 Q90 85 80 95 Z" />
        <path d="M85 40 L90 25 L100 38 Z" />
        <path d="M155 40 L150 25 L140 38 Z" />

        {/* Cara (hueco) */}
        <ellipse cx="120" cy="70" rx="20" ry="24" fill="#0a0a0a" />

        {/* Brazo derecho (sostiene trompeta) */}
        <path d="M150 95 Q180 95 195 80 L200 88 Q185 105 150 110 Z" />

        {/* Brazo izquierdo (en la trompeta) */}
        <path d="M95 95 L75 90 L72 100 L95 105 Z" />
      </g>

      {/* Trompeta */}
      <g fill="currentColor">
        {/* Boquilla */}
        <ellipse cx="72" cy="93" rx="4" ry="6" fill="#22c55e" opacity="0.7" />
        {/* Tubo principal */}
        <rect x="72" y="89" width="100" height="8" rx="2" />
        {/* Campana */}
        <path d="M172 75 L210 65 L210 121 L172 111 Z" fill="currentColor" />
        <ellipse cx="210" cy="93" rx="5" ry="28" fill="currentColor" />
        {/* Válvulas */}
        <rect x="110" y="80" width="6" height="10" fill="#0a0a0a" />
        <rect x="125" y="80" width="6" height="10" fill="#0a0a0a" />
        <rect x="140" y="80" width="6" height="10" fill="#0a0a0a" />
        {/* Brillo en campana */}
        <path d="M180 80 L195 75 L195 100 L180 95 Z" fill="#22c55e" opacity="0.4" />
      </g>

      {/* Ondas de sonido */}
      <g stroke="#22c55e" strokeWidth="1.5" fill="none" opacity="0.6">
        <path d="M218 80 Q225 93 218 106" />
        <path d="M225 70 Q235 93 225 116" opacity="0.4" />
      </g>
    </svg>
  )
}
