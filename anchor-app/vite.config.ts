import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,bin,json,wasm}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB to allow embeddings.bin and wasm files
      },
      manifest: {
        name: 'Anchor Recovery',
        short_name: 'Anchor',
        description: 'Anonymous Recovery Companion',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        shortcuts: [
          {
            name: 'Emergency Crisis',
            short_name: 'Crisis',
            description: 'Immediate crisis pathway',
            url: '/crisis',
            icons: [{ src: '/vite.svg', sizes: '192x192' }] // Placeholder icon
          }
        ]
      }
    })
  ],
})
