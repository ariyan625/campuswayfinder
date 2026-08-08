import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Served from the /campuswayfinder/ subpath on GitHub Pages.
  base: '/campuswayfinder/',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
})
