import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Automatically updates the app when you push new code
      devOptions: {
        enabled: true // Allows you to test the PWA locally
      },
      manifest: {
        name: 'Family Bill Tracker',
        short_name: 'Bill Tracker',
        description: 'Track and split family monthly bills.',
        theme_color: '#0f172a', // The dark slate color to match your app header
        background_color: '#0f172a',
        display: 'standalone', // This hides the Safari/Chrome search bar!
        orientation: 'portrait',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
})