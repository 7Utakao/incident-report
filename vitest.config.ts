import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['shared/tests/**/*.test.ts', 'lambda/tests/**/*.test.ts'],
    exclude: ['node_modules', 'dist', '.nuxt'],
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, '.'),
      '@': resolve(__dirname, '.'),
      shared: resolve(__dirname, 'shared'),
    },
  },
});
