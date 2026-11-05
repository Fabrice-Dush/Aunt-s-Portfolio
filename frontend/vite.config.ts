import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react(), {
    name: 'private-workspace-preview-shell',
    configurePreviewServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const path = (request.url ?? '').split('?')[0];
        if (!/^\/(?:$|index\.html$|favicon\.svg$|robots\.txt$|assets\/[\w-]+\.(?:js|css)$|images\/[\w-]+\.webp$|(?:login|admin|super-admin)(?:\/|$)|api\/)/.test(path ?? '')) {
          response.statusCode = 404; response.end(); return;
        }
        if (path === '/.publication.json') { response.statusCode = 404; response.end(); return; }
        if (path === '/' || path === '/index.html') {
          response.setHeader('Cache-Control', 'no-store');
          try {
            const proxy = server.config.preview.proxy?.['/api'];
            const target = typeof proxy === 'string' ? proxy : proxy?.target;
            const live = await fetch(new URL('/api/v1/public-content', typeof target === 'string' ? target : 'http://127.0.0.1:4000'), { signal: AbortSignal.timeout(5000), headers: { 'Cache-Control': 'no-cache' } });
            if (!live.ok) throw new Error('Unavailable');
            const content = await live.json() as { revision?: string };
            const directory = resolve(server.config.root, server.config.build.outDir);
            const receipt = JSON.parse(await readFile(resolve(directory, '.publication.json'), 'utf8'));
            const page = await readFile(resolve(directory, 'index.html'), 'utf8');
            if (receipt.revision !== content.revision || receipt.htmlHash !== createHash('sha256').update(page).digest('hex')) throw new Error('Stale HTML');
            response.statusCode = 200;
            response.setHeader('Content-Type', 'text/html; charset=utf-8');
            response.setHeader('Content-Length', Buffer.byteLength(page));
            response.end(request.method === 'HEAD' ? undefined : page);
            return;
          } catch {
            response.statusCode = 503; response.setHeader('Content-Type','text/html; charset=utf-8'); response.end('<!doctype html><html lang="en"><title>Portfolio temporarily unavailable</title><h1>Portfolio temporarily unavailable</h1><p>Please try again shortly.</p></html>'); return;
          }
        }
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
