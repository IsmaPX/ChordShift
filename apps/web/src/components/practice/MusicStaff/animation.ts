/**
 * Animaciones y factories de estilo para MusicStaff.
 *
 * La línea dorada se mueve con CSS `animation` para evitar
 * recálculos en JS por frame (GPU-friendly).
 * Incluye animaciones de iluminación para notas cuando son cruzadas por el cursor.
 */

export const STAFF_KEYFRAMES_ID = 'music-staff-keyframes'

export const staffKeyframes = `
@keyframes staff-cursor-move {
  0%   { transform: translateX(0%); }
  100% { transform: translateX(calc(100% - var(--staff-cursor-w, 4px))); }
}

@keyframes staff-cursor-glow-pulse {
  0%, 100% { 
    transform: translate(-50%, -50%) scale(1);   
    box-shadow: 
      0 0 16px rgba(255, 255, 255, 0.9), 
      0 0 32px rgba(250, 204, 21, 0.8),
      0 0 48px rgba(251, 191, 36, 0.5); 
  }
  50% { 
    transform: translate(-50%, -50%) scale(1.1); 
    box-shadow: 
      0 0 24px rgba(255, 255, 255, 1), 
      0 0 48px rgba(250, 204, 21, 0.9),
      0 0 72px rgba(251, 191, 36, 0.7); 
  }
}

@keyframes staff-note-pop {
  0% { transform: scale(0) rotate(-45deg); opacity: 0; }
  60% { transform: scale(1.2) rotate(-10deg); opacity: 1; }
  100% { transform: scale(1) rotate(-15deg); opacity: 1; }
}

@keyframes staff-note-illuminate {
  0% { 
    transform: rotate(-15deg) scale(1);
    filter: brightness(1);
  }
  50% { 
    transform: rotate(-15deg) scale(1.3);
    filter: brightness(1.4);
  }
  100% { 
    transform: rotate(-15deg) scale(1);
    filter: brightness(1);
  }
}

@keyframes eartraining-note-pulse {
  0%, 100% { 
    transform: scale(1);
    box-shadow: 
      inset 0 1px 0 rgba(250, 204, 21, 0.4),
      0 0 16px rgba(250, 204, 21, 0.7);
  }
  50% { 
    transform: scale(1.08);
    box-shadow: 
      inset 0 1px 0 rgba(250, 204, 21, 0.6),
      0 0 24px rgba(250, 204, 21, 0.9),
      0 0 48px rgba(251, 191, 36, 0.5);
  }
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

/** Genera el estilo de iluminación para notas cuando son cruzadas por el cursor. */
export function illuminatedNoteStyle(isIlluminated: boolean): React.CSSProperties {
  if (!isIlluminated) return {}
  return {
    animationName: 'staff-note-illuminate',
    animationDuration: '0.3s',
    animationTimingFunction: 'ease-out',
    animationFillMode: 'forwards',
  }
}
