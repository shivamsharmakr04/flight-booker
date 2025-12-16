import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ESM Vite config so ESM-only plugins (like @vitejs/plugin-react) import cleanly.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
});
