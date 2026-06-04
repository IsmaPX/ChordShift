/**
 * Animaciones y factories de estilo para MusicStaff.
 *
 * La línea amarilla se mueve con CSS `animation` para evitar
 * recálculos en JS por frame (GPU-friendly).
 */

export const STAFF_KEYFRAMES_ID = 'music-staff-keyframes'

export const staffKeyframes = `
@keyframes staff-cursor-move {
  0%   { transform: translateX(0%); }
  100% { transform: translateX(calc(100% - var(--staff-cursor-w, 3px))); }
}

@keyframes staff-cursor-pulse {
  0%, 100% { transform: scale(1);   box-shadow: 0 0 10px rgba(250, 204, 21, 0.9), 0 0 22px rgba(250, 204, 21, 0.5); }
  50%      { transform: scale(1.18); box-shadow: 0 0 16px rgba(250, 204, 21, 1),   0 0 32px rgba(250, 204, 21, 0.75); }
}

@keyframes staff-note-bounce {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-3px); }
}
`

/** Inyecta los keyframes una sola vez (idempotente). */
export function ensureStaffKeyframes(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STAFF_KEYFRAMES_ID)) return
  const style = document.createElement('style')
  style.id = STAFF_KEYFRAMES_ID
  style.textContent = staffKeyframes
  document.head.appendChild(style)
}

/** Genera el estilo inline del cursor para la sincronización con el BPM. */
export function cursorStyle(durationSeconds: number, isPlaying: boolean): React.CSSProperties {
  return {
    animationName: 'staff-cursor-move',
    animationDuration: `${durationSeconds}s`,
    animationTimingFunction: 'linear',
    animationFillMode: 'forwards',
    animationPlayState: isPlaying ? 'running' : 'paused',
  }
}
