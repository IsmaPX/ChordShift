/**
 * Variantes de animación para LoginBackgroundGallery.
 *
 * Diseño de movimiento:
 * - Loop infinito continuo usando CSS (no Framer Motion) para máximo rendimiento.
 * - Cada carril (`track`) se traslada horizontalmente de -50% a 0% en `duration`s.
 * - El track se duplica (repeat=2x) para que el loop sea perfectamente continuo
 *   sin "saltos" visuales cuando la primera mitad sale de pantalla.
 * - Las imágenes tienen `animation-delay` escalonado y dirección alternada.
 */

export const galleryKeyframes = `
@keyframes lbg-marquee {
  from { transform: translate3d(-50%, 0, 0); }
  to   { transform: translate3d(0, 0, 0); }
}

@keyframes lbg-float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}

@keyframes lbg-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
`

/**
 * Estilos para un único carril (track) de músicos.
 * Duplica el array de músicos para crear el loop continuo.
 */
export const trackStyle = (duration: number, reverse: boolean): React.CSSProperties => ({
  display: 'flex',
  gap: '2.5rem',
  width: 'max-content',
  animation: `lbg-marquee ${duration}s linear infinite${reverse ? ' reverse' : ''}`,
  willChange: 'transform',
})

/**
 * Estilos para un músico individual dentro del track.
 * - Float vertical sutil (efecto orgánico).
 * - Tinte verde mediante filter para integración cromática con la paleta.
 *
 * @param delaySeconds - delay de la animación
 * @param tinted - aplica tinte verde (filter CSS)
 * @param light - versión más clara (para carriles secundarios)
 */
export const itemStyle = (delaySeconds: number, tinted: boolean, light: boolean): React.CSSProperties => ({
  flex: '0 0 auto',
  width: '180px',
  height: '180px',
  opacity: 0,
  animation: `lbg-fade-in 1.2s ease-out ${delaySeconds}s forwards, lbg-float 6s ease-in-out ${delaySeconds}s infinite`,
  filter: tinted
    ? light
      // Carril secundario: verde tenue con glow sutil
      ? 'brightness(0.95) sepia(0.3) hue-rotate(70deg) saturate(0.9) drop-shadow(0 0 10px rgba(34, 197, 94, 0.4))'
      // Carril principal: verde más vibrante con glow notorio
      : 'brightness(1) sepia(0.4) hue-rotate(70deg) saturate(1.1) drop-shadow(0 0 14px rgba(34, 197, 94, 0.6))'
    : 'brightness(0.9)',
  willChange: 'transform, opacity',
})
