import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Explicit project structure
  root: '.',
  build: {
    outDir: 'build',    // Match CRA's output folder name
    emptyOutDir: true,
  },
  
  server: {
    // Proxy configuration - replaces setupProxy.js from CRA
    proxy: {
      '/api/vine': {
        target: 'https://comicvine.gamespot.com/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/vine/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq) => {
            // Add required User-Agent header for Comic Vine API
            proxyReq.setHeader('User-Agent', 'ReactMarvelApp/1.0');
          });
        },
      },
    },
  },
});
