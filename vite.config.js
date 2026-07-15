import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Client lives in src/client; production build lands in dist/ and is
// served by the Express server (src/server/index.js).
export default defineConfig({
  root: 'src/client',
  plugins: [react()],
  build: {
    outDir: '../../dist',
    emptyOutDir: true
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:4870'
    }
  }
});
