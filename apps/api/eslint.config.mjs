/**
 * Configuración ESLint mínima para apps/api.
 *
 * Usa el plugin @typescript-eslint que ya está en el monorepo (root node_modules).
 * Permitimos `{}` y `any` explícito en lugares donde Prisma/Express no dan
 * tipos útiles (controllers preexistentes, casts en routes, etc).
 */
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
];
