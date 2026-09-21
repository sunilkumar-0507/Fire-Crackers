import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    globals: false,
    include: ['src/**/*.test.{js,jsx}'],
    // The shop fills its catalogue from the API at boot and bundles nothing,
    // so the suite has to supply one. A setup file rather than a per-test
    // import: several suites resolve fixtures at module level, and this is the
    // only hook that runs before a test file's own imports.
    setupFiles: ['./src/__tests__/setup/catalogue.js'],
    // Otherwise the setup file is itself collected as a suite and fails for
    // containing no tests.
    exclude: ['**/node_modules/**', '**/dist/**', 'src/__tests__/setup/**'],
  },
});
