/**
 * Tests unitarios: validación de variables de entorno.
 */

import { describe, it, expect } from 'vitest';

describe('env validation', () => {
  it('exports expected env variables', async () => {
    const { env } = await import('../src/config/env.js');
    expect(env).toHaveProperty('DATABASE_URL');
    expect(env).toHaveProperty('JWT_SECRET');
    expect(env.JWT_SECRET.length).toBeGreaterThanOrEqual(32);
  });
});
