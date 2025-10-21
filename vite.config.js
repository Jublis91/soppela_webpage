import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const defaultProxyTarget = process.env.NODE_ENV === 'production'
  ? 'http://api:3001'
  : 'http://localhost:3001'

const proxyTarget = process.env.VITE_PROXY_TARGET ?? defaultProxyTarget

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,                
    strictPort: true,
    watch: { usePolling: true }, 

    proxy: {
      '/api': {
        target: proxyTarget,   
        changeOrigin: true,
        secure: false
      },
      '/images': {
        target: proxyTarget,
        changeOrigin: true,
        secure: false
      }
    }
  }
})
