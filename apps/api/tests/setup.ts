/**
 * Setup para tests con vitest.
 * Usa variables de entorno de testing por defecto.
 */

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL_TEST ?? 'postgresql://postgres:postgres@localhost:5432/worship_piano_test';
process.env.JWT_SECRET = 'test-secret-que-debe-tener-al-menos-32-caracteres-ok';
process.env.CORS_ORIGIN = 'http://localhost:5173';
