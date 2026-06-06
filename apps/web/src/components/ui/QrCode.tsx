/**
 * Componente de QR code.
 *
 * Usa la librería `qrcode` para generar un SVG inline.
 * No usa canvas para mejor accesibilidad y para permitir
 * estilos CSS (color, tamaño, etc).
 */

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { cn } from '@/lib/utils'

export type QrCodeProps = {
  /** Contenido a codificar (URL, texto, etc). */
  value: string
  /** Tamaño en pixels. Default 256. */
  size?: number
  /** Nivel de corrección de errores (L=7%, M=15%, Q=25%, H=30%). */
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
  /** Color del QR. */
  fgColor?: string
  /** Color de fondo. */
  bgColor?: string
  className?: string
}

export function QrCode({
  value,
  size = 256,
  errorCorrectionLevel = 'M',
  fgColor = '#22c55e',
  bgColor = 'transparent',
  className,
}: QrCodeProps) {
  const [svg, setSvg] = useState<string>('')

  useEffect(() => {
    let cancelled = false
    QRCode.toString(value, {
      type: 'svg',
      width: size,
      margin: 1,
      errorCorrectionLevel,
      color: { dark: fgColor, light: bgColor === 'transparent' ? '#00000000' : bgColor },
    })
      .then((s: string) => {
        if (!cancelled) setSvg(s)
      })
      .catch(() => {
        if (!cancelled) setSvg('')
      })
    return () => {
      cancelled = true
    }
  }, [value, size, errorCorrectionLevel, fgColor, bgColor])

  if (!svg) {
    return (
      <div
        className={cn('flex items-center justify-center', className)}
        style={{ width: size, height: size }}
        aria-busy="true"
      >
        <span className="text-text-secondary text-sm">Generando QR...</span>
      </div>
    )
  }

  return (
    <div
      className={cn('inline-block', className)}
      style={{ width: size, height: size }}
      // El SVG viene de una lib confiable con control total del input
      dangerouslySetInnerHTML={{ __html: svg }}
      role="img"
      aria-label="Código QR"
    />
  )
}
