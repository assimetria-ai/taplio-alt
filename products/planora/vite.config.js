// vite.config.js - Vite configuration
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@custom': path.resolve(__dirname, './@custom'),
      '@system': path.resolve(__dirname, './@system')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
