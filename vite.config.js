// vite.config.js
// --------------------------------------------------------------
// Vite-konfiguraatio React-sovellukselle, joka määrittää
// kehityspalvelimen asetukset ja proxy-säännöt API-kutsuille.
// --------------------------------------------------------------

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Määritellään oletusproxy-kohde ympäristömuuttujien perusteella
const defaultProxyTarget =
  process.env.NODE_ENV === 'production'
    ? 'http://api:3001'
    : 'http://soppela_prod:3001' 

const proxyTarget = process.env.VITE_PROXY_TARGET ?? defaultProxyTarget

// Vite-konfiguraatio
export default defineConfig({
  // Otetaan käyttöön React-plugin
  plugins: [react()],
  server: {
    host: true, // Kuunnellaan kaikilla verkko-osoitteilla
    port: 5173, // Määritellään portti
    strictPort: true, // Epäonnistutaan, jos portti on varattu
    watch: { usePolling: true }, // Käytetään pollingia tiedostojen muutosten havaitsemiseen

    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/api/, '/api')
      },
      '/uploads': {
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
