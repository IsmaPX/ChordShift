/**
 * Tests del helper de sincronización de beat.
 *
 * Cubre la interpolación lineal y la clasificación de drift.
 */

import { describe, it, expect } from 'vitest';
import { estimateLocalBeat, estimateFromPayload, classifyDrift } from './beatSync';

describe('estimateLocalBeat', () => {
  it('proyecta correctamente con BPM=120 (2 beats/s)', () => {
    const emittedAtMs = 1000;
    const now = 1500; // 500ms después
    const { beat, ageMs } = estimateLocalBeat(10, emittedAtMs, 120, now);
    expect(beat).toBeCloseTo(11, 3); // 10 + 0.5s * 2 = 11
    expect(ageMs).toBe(500);
  });

  it('proyecta correctamente con BPM=60 (1 beat/s)', () => {
    const emittedAtMs = 0;
    const now = 3000;
    const { beat } = estimateLocalBeat(5, emittedAtMs, 60, now);
    expect(beat).toBe(8); // 5 + 3s * 1 = 8
  });

  it('proyecta correctamente con BPM=200 (3.33 beats/s)', () => {
    const emittedAtMs = 0;
    const now = 1000;
    const { beat } = estimateLocalBeat(0, emittedAtMs, 200, now);
    // 0 + 1s * 200/60 = 3.333
    expect(beat).toBeCloseTo(3.333, 2);
  });

  it('no avanza si now < emittedAtMs (clamp a 0)', () => {
    const { beat, ageMs } = estimateLocalBeat(10, 1000, 120, 500);
    expect(beat).toBe(10);
    expect(ageMs).toBe(0);
  });

  it('devuelve el beat exacto en el momento de la emisión', () => {
    const { beat, ageMs } = estimateLocalBeat(42, 1000, 120, 1000);
    expect(beat).toBe(42);
    expect(ageMs).toBe(0);
  });
});

describe('estimateFromPayload', () => {
  it('acepta un payload del socket', () => {
    const { beat, ageMs } = estimateFromPayload(
      { beat: 10, emittedAtMs: 1000 },
      120,
      2500,
    );
    expect(beat).toBeCloseTo(13, 3); // 10 + 1.5s * 2 = 13
    expect(ageMs).toBe(1500);
  });
});

describe('classifyDrift', () => {
  it('clasifica < 100ms como "good"', () => {
    expect(classifyDrift(0)).toBe('good');
    expect(classifyDrift(50)).toBe('good');
    expect(classifyDrift(99)).toBe('good');
  });

  it('clasifica 100-200ms como "ok"', () => {
    expect(classifyDrift(100)).toBe('ok');
    expect(classifyDrift(150)).toBe('ok');
    expect(classifyDrift(199)).toBe('ok');
  });

  it('clasifica > 200ms como "warn"', () => {
    expect(classifyDrift(200)).toBe('warn');
    expect(classifyDrift(500)).toBe('warn');
    expect(classifyDrift(5000)).toBe('warn');
  });
});
