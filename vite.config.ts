import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/exam-master/',
  plugins: [
    react(),
    tailwindcss(),
  ],
})
