import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Backend runs on 3000 in dev; proxy avoids CORS friction and keeps
      // the frontend code talking to same-origin relative paths.
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Route-level code-splitting (see router/index.ts) means the initial
    // bundle only ships the login view; everything else lands in its own
    // chunk, fetched on demand.
    target: 'es2020',
    sourcemap: true,
  },
});
