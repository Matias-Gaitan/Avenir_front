import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['avenir-logo.png'],
      manifest: {
        name: 'Avenir - Higiene y Seguridad',
        short_name: 'Avenir',
        description: 'Sistema de gestión de higiene y seguridad laboral de Avenir.',
        theme_color: '#0F6B45',
        background_color: '#FBFBF9',
        display: 'standalone',
        start_url: '/login',
        scope: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        // El bundle incluye three.js/globe.gl/leaflet y supera el límite por defecto de 2MB
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        // El shell de la app (HTML/JS/CSS/íconos) se cachea para que la app
        // instalada abra aunque no haya señal. Las llamadas a la API van por
        // NetworkFirst: si hay conexión trae datos frescos, si no hay, sirve
        // la última respuesta buena que haya visto (mejor que una pantalla en blanco).
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'avenir-api-cache',
              networkTimeoutSeconds: 4,
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 }
            }
          }
        ]
      }
    })
  ],
  server: {
    port: Number(process.env.PORT) || 5173,
    strictPort: true,
    host: true,
  },
})
