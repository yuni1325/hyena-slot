import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages: https://yuni1325.github.io/hyena-slot/
  base: '/hyena-slot/',
})
