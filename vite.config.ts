import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Щиток — Конструктор електрощитів',
        short_name: 'Щиток',
        description: 'Конфігурація електрощитів з візуалізацією фаз, N та PE',
        theme_color: '#0f1117',
        background_color: '#1a1d23',
        display: 'standalone',
        lang: 'uk',
        icons: [
          {
            src: 'favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
    }),
  ],
})
