import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Served from the site root (Vercel/Netlify etc.).
  base: '/',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    // Allow access via Cloudflare quick-tunnel hostnames (and any host).
    allowedHosts: true,
  },
})
