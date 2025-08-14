import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // <— this line enables "@/..." imports
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Your backend port
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
