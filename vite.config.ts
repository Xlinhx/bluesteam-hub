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
          const safeUrl = req.url ? req.url.split('?')[0] : '';
          const mockupsDir = 'C:/Users/ADMIN/Downloads/ocean';
          const filePath = path.join(mockupsDir, safeUrl);
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            res.setHeader('Content-Type', 'image/png');
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
    port: 5173,
    host: true,
    watch: {
      ignored: ['**/.agents/**', '**/artifacts/**', '**/docs/**'],
    },
  },
});
