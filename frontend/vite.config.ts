import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      // Allow serving files from the monorepo root (one level up from frontend/)
      // This is needed so Vite can resolve imports from ../shared/src/
      allow: ['..'],
    },
    proxy: {
      // Forward all /surveys API calls to SAM local — avoids CORS entirely
      '/surveys': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
