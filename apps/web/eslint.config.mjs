/**
 * Configuración ESLint para apps/web.
 *
 * Habilitamos el patrón de prefijo `_` para variables/argumentos no usados
 * (estilo TypeScript) ya que el monorepo usa `noUnusedParameters: true` en
 * tsconfig y queremos que TS los ignore también.
 */
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // Permitir args/vars con prefijo `_` para marcarlos como intencionalmente no usados
      // (convenio TS, en línea con `noUnusedParameters: true`).
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'release/**',
      '*.config.{js,ts,mjs,cjs}',
      'android/**',
    ],
  },
];
