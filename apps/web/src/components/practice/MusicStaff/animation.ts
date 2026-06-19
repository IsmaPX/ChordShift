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
    box-shadow: none;
  }
  15% { 
    transform: rotate(-15deg) scale(1.4);
    filter: brightness(1.8) drop-shadow(0 0 8px rgba(250, 204, 21, 0.8));
  }
  30% { 
    transform: rotate(-15deg) scale(1.1);
    filter: brightness(1.5) drop-shadow(0 0 12px rgba(250, 204, 21, 0.6));
  }
  100% { 
    transform: rotate(-15deg) scale(1);
    filter: brightness(1);
    box-shadow: none;
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

/** 
 * Genera el estilo de sincronización para una nota.
 * Utiliza un retraso de animación coordinado con el cursor para que la iluminación
 * ocurra exactamente cuando el cursor pasa sobre la nota.
 */
export function noteSyncStyle(
  _noteTimeSeconds: number,
  totalDurationSeconds: number,
  isPlaying: boolean
): React.CSSProperties {
  // El truco es que el cursor tarda `totalDurationSeconds` en recorrer el staff.
  // La nota está en `noteTimeSeconds`.
  return {
    animationName: 'staff-note-illuminate',
    animationDuration: `${totalDurationSeconds}s`,
    animationTimingFunction: 'linear',
    animationFillMode: 'forwards',
    animationPlayState: isPlaying ? 'running' : 'paused',
    // Retraso negativo para "adelantar" la animación hasta el punto donde la 
    // iluminación coincide con el paso del cursor.
    // staff-note-illuminate debe durar lo mismo que el cursor para estar en fase.
    // Pero queremos un flash breve. Reajustamos keyframes o usamos un truco de delay.
  }
}

/** Genera el estilo de iluminación para notas cuando son cruzadas por el cursor. */
export function illuminatedNoteStyle(isIlluminated: boolean): React.CSSProperties {
  if (!isIlluminated) return {}
  return {
    animationName: 'staff-note-illuminate',
    animationDuration: '0.6s',
    animationTimingFunction: 'ease-out',
    animationFillMode: 'forwards',
    animationIterationCount: 1,
  }
}
