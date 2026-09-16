import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const apiProxy = {
  '/api': {
    target: process.env.VITE_API_TARGET ?? 'http://localhost:5080',
    changeOrigin: true,
  },
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // The storefront and the admin talk to the API on a relative `/api` path, so
  // there is no origin to configure and no CORS pre-flight in development. Set
  // VITE_API_URL to point a build at an API on another host.
  server: { proxy: apiProxy },
  // `npm run preview` serves the real build, and the real build still asks for
  // a same-origin /api. Without this the previewed shop falls back to its
  // bundled JSON and shows the offline banner — which is not what you are
  // trying to look at when you preview a build.
  preview: { proxy: apiProxy },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // es2022 for top-level await: `main.jsx` fetches the catalogue before it
    // mounts React, so the shop never renders a frame of placeholder data.
    // Every browser that supports module scripts with top-level await is
    // already past es2020, so this costs no reach.
    target: 'es2022',
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
