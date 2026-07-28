import js from '@eslint/js'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import globals from 'globals'

export default [
  {
    ignores: ['node_modules/', 'dist/', 'build/'],
  },
  {
    files: ['client/src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        tsconfigRootDir: new URL('.', import.meta.url).pathname,
        project: ['./client/tsconfig.app.json'],
      },
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // your client rules
    },
  },
  {
    files: ['server/src/**/*.{ts,js}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        tsconfigRootDir: new URL('.', import.meta.url).pathname,
        project: ['./server/tsconfig.json'],
      },
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // your server rules
    },
  },
]
