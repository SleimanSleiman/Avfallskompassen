import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  test: {
    globals: true, 
    environment: 'jsdom',
    setupFiles: ["./setupTests.js"],
    include: ['tests/**/*.test.{ts,tsx}'],
    reporters: ['default', 'html'],      
    
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
      '/images': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      }
    }
  },

})