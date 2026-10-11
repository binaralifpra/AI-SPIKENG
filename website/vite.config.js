import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // GitHub Pages serves the site from https://<user>.github.io/AI-SPIKENG/
  base: command === 'build' ? '/AI-SPIKENG/' : '/',
  server: {
    port: 5174,
    open: true
  }
}))
