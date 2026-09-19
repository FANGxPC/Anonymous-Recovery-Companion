import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [
    tailwindcss(),
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
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        shortcuts: [
          {
            name: 'Emergency Crisis',
            short_name: 'Crisis',
            description: 'Immediate crisis pathway',
            url: '/crisis',
            icons: [{ src: '/icon-192x192.png', sizes: '192x192' }]
          }
        ]
      }
    })
  ],
})
