import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 5173,
    host: 'localhost',
    proxy: {
      // Proxies API calls from the frontend to the backend server
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // Proxies the health check endpoint
      "/health": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    sourcemap: mode === 'development',
  },
  esbuild: {
    legalComments: 'none',
  },
  optimizeDeps: {
    esbuildOptions: {
      sourcemap: mode === 'development',
    },
  },
}));