import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,                // tärkeä, jotta pääset selaimella ulkoa (Unraid IP)
    strictPort: true,
    watch: { usePolling: true }, // tarvitaan SMB-jaolla

    proxy: {
      '/api': {
        target: 'http://api:3001',   // huom: palvelun nimi compose:ssa
        changeOrigin: true,
        secure: false
      },
      '/images': {
        target: 'http://api:3001',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
