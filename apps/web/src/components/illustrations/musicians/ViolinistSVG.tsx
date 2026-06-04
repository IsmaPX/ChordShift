import type { SVGProps } from 'react'

/**
 * ViolinistSVG — Personaje anime tocando violín.
 * Estilo: silueta elegante con violín y arco.
 * Paleta: grises con acentos verdes.
 */
export function ViolinistSVG(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 240 240"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
      {...props}
    >
      <defs>
        <linearGradient id="violinist-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
        </linearGradient>
        <radialGradient id="violinist-glow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="120" cy="130" rx="100" ry="90" fill="url(#violinist-glow)" />

      {/* Cuerpo */}
      <g fill="url(#violinist-body)">
        {/* Falda larga (vestido) */}
        <path d="M85 165 L70 220 L170 220 L155 165 Z" />

        {/* Torso erguido */}
        <path d="M88 95 Q85 78 100 72 L140 72 Q155 78 152 95 L155 170 L85 170 Z" />

        {/* Cabello recogido con moño */}
        <path d="M82 70 Q78 38 120 32 Q162 38 158 70 L160 95 Q150 88 145 86 L145 65 Q140 55 120 55 Q100 55 95 65 L95 86 Q90 88 80 95 Z" />
        <circle cx="155" cy="40" r="8" opacity="0.85" />
        <path d="M148 35 Q150 28 158 30" opacity="0.7" />

        {/* Cara (hueco) */}
        <ellipse cx="120" cy="70" rx="20" ry="24" fill="#0a0a0a" />

        {/* Brazo derecho (sostiene arco) */}
        <path d="M150 105 Q180 120 195 150 L185 158 Q170 135 148 122 Z" />

        {/* Brazo izquierdo (sostiene violín) */}
        <path d="M90 100 L65 115 L60 125 L88 118 Z" />
      </g>

      {/* Violín */}
      <g fill="currentColor" transform="rotate(-25 120 115)">
        {/* Cuerpo del violín */}
        <path d="M115 110 Q105 100 105 115 Q105 130 120 130 Q135 130 135 115 Q135 100 125 110 Z" />
        <ellipse cx="120" cy="120" rx="8" ry="10" fill="#22c55e" opacity="0.5" />
        {/* Mangos (efes) */}
        <ellipse cx="120" cy="108" rx="3" ry="2" fill="#0a0a0a" />
        <ellipse cx="120" cy="132" rx="3" ry="2" fill="#0a0a0a" />
        {/* Clavijas */}
        <circle cx="115" cy="98" r="2" fill="#22c55e" />
        <circle cx="125" cy="98" r="2" fill="#22c55e" />
        {/* Mástil */}
        <rect x="118" y="80" width="4" height="20" fill="currentColor" />
      </g>

      {/* Arco */}
      <g stroke="currentColor" strokeWidth="2" fill="none" opacity="0.85">
        <path d="M120 120 Q160 110 195 145" />
        <path d="M120 120 Q160 112 195 145" stroke="#22c55e" strokeWidth="0.5" opacity="0.6" />
      </g>

      {/* Notas musicales flotando */}
      <g fill="#22c55e" opacity="0.8">
        <circle cx="40" cy="50" r="3" />
        <rect x="42" y="30" width="2" height="20" />
        <circle cx="200" cy="40" r="3.5" />
        <rect x="202" y="20" width="2" height="22" />
      </g>
    </svg>
  )
}
