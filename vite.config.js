import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // Split the heavy libraries out of the entry chunk so first paint
        // downloads as little JS as possible, and so a change to app code does
        // not invalidate the vendor bundles in cache.
        // Vite 8 runs on rolldown, which requires the function form.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          // Anchored on the trailing separator so `react-icons` does not fall
          // into the core React chunk and invalidate it on every icon change.
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom)[\\/]/.test(id))
            return 'react';
          if (id.includes('react-icons')) return 'icons';
          if (id.includes('swiper')) return 'swiper';
          return 'vendor';
        },
      },
    },
  },
});
