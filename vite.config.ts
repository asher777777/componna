import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/ConnectToKesher': {
        target: 'https://kesherhk.info',
        changeOrigin: true,
        secure: false,
      },
      '/KesherAPI': {
        target: 'https://kesherhk.info',
        changeOrigin: true,
        secure: false,
      },
      '/api/heygen': {
        target: 'https://api.heygen.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/heygen/, ''),
        secure: false,
      },
      '/upload/heygen': {
        target: 'https://upload.heygen.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/upload\/heygen/, ''),
        secure: false,
      },
    },
  },
});
