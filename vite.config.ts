import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    {
      name: 'serve-artifacts-and-mockups',
      configureServer(server) {
        server.middlewares.use('/artifacts', (req, res, next) => {
          const safeUrl = req.url ? req.url.split('?')[0] : '';
          const filePath = path.join(process.cwd(), 'artifacts', safeUrl);
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            res.setHeader('Content-Type', 'image/png');
            return fs.createReadStream(filePath).pipe(res);
          }
          next();
        });
        server.middlewares.use('/mockups', (req, res, next) => {
          const rawUrl = req.url ? req.url.split('?')[0].replace(/^\//, '') : '';
          let fileName: string;
          try { fileName = decodeURIComponent(rawUrl); }
          catch { res.statusCode = 400; res.end('Invalid path'); return; }
          // The canonical design collection is intentionally flat.
          if (path.basename(fileName) !== fileName || fileName.startsWith('.')) return next();
          const mockupsDir = path.join(process.cwd(), 'docs', 'mockups');
          const filePath = path.join(mockupsDir, fileName);
          const contentTypes: Record<string, string> = {
            '.png': 'image/png',
          };
          const contentType = contentTypes[path.extname(fileName)];
          if (contentType && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            res.setHeader('Content-Type', contentType);
            return fs.createReadStream(filePath).pipe(res);
          }
          next();
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          'three-vendor': ['three'],
          'react-vendor': ['react', 'react-dom'],
          'lucide-vendor': ['lucide-react'],
        },
      },
    },
  },
  server: {
    port: 3010,
    strictPort: true,
    host: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:8010',
        changeOrigin: true,
      },
      '/uploads': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:8010',
        changeOrigin: true,
      },
      '/socket.io': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:8010',
        changeOrigin: true,
        ws: true,
      },
    },
    watch: {
      ignored: ['**/.agents/**', '**/artifacts/**', '**/docs/**', '**/screenshots/**'],
    },
  },
});
