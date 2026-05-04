import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from "path"
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api/search': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/proxy/thumbnail': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/lyrica': {
        target: 'https://test-0k.onrender.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/lyrica/, ''),
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
