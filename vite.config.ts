// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://ocia.orginone.cn',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
      },
      '/orginone': {
        target: 'https://ocia.orginone.cn',
        changeOrigin: true,
        secure: false,
      }
    },
  },
});
