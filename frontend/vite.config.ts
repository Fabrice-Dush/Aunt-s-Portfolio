import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react(), {
    name: 'private-workspace-preview-shell',
    configurePreviewServer(server) {
      server.middlewares.use((request, _response, next) => {
        // Vite's SPA fallback otherwise serves the public prerender at clean private URLs.
        if (/^\/(login|admin|super-admin)(\/|\?|$)/.test(request.url ?? '')) request.url = '/login/index.html';
        next();
      });
    },
  }],
  server: {
    headers: { 'X-Robots-Tag': 'noindex, nofollow' },
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'es2022',
  },
});
