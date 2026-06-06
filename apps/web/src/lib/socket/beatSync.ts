/**
 * Helpers para sincronización de beat entre clientes.
 *
 * Estos helpers son puros (no dependen de React ni del socket) para
 * facilitar su testing y reutilización.
 */

import type { BeatPayload } from './socket.types'

/**
 * Calcula el beat actual estimado en el cliente, dados:
 * - El último beat recibido del server
 * - El timestamp en que el server lo emitió
 * - El BPM
 *
 * Usa interpolación lineal: el beat avanza a razón de `bpm/60_000` beats/ms
 * desde el momento de la emisión.
 *
 * Ejemplo:
 *   - bpm = 120 → 2 beats/s = 0.002 beats/ms
 *   - Si recibimos beat=10 con emittedAtMs=t0
 *   - Y consultamos 500ms después: beat estimado = 10 + 500*0.002 = 11
 */
export function estimateLocalBeat(
  lastBeat: number,
  emittedAtMs: number,
  bpm: number,
  nowMs: number = Date.now(),
): { beat: number; ageMs: number } {
  const ageMs = Math.max(0, nowMs - emittedAtMs)
  const beatsPerMs = bpm / 60_000
  const projectedBeat = lastBeat + ageMs * beatsPerMs
  return { beat: projectedBeat, ageMs }
}

/**
 * Versión que toma el payload crudo del socket.
 */
export function estimateFromPayload(
  payload: Pick<BeatPayload, 'beat' | 'emittedAtMs'>,
  bpm: number,
  nowMs?: number,
): { beat: number; ageMs: number } {
  return estimateLocalBeat(payload.beat, payload.emittedAtMs, bpm, nowMs)
}

/**
 * Determina si el drift entre un cliente y el host es "alto" (síntoma de
 * red lenta o cliente sobrecargado).
 *
 * Umbrales:
 * - < 100ms: excelente (verde)
 * - 100-200ms: aceptable (sin warning)
 * - > 200ms: warning (amarillo)
 */
export function classifyDrift(ageMs: number): 'good' | 'ok' | 'warn' {
  if (ageMs < 100) return 'good'
  if (ageMs < 200) return 'ok'
  return 'warn'
}
