import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'FlowPay',
        short_name: 'FlowPay',
        description: 'Programmable Money Flows',
        theme_color: '#0a243e',
        background_color: '#f6f7f8',
        display: 'standalone',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Firebase split
          'firebase-app': ['firebase/app'],
          'firebase-auth': ['firebase/auth'],
          'firebase-firestore': ['firebase/firestore'],

          // React core
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // Charts (Recharts is large)
          'charts': ['recharts'],
        }
      }
    },
    // Suppress the warning threshold increase (500kB → 800kB for individual chunks)
    chunkSizeWarningLimit: 800,
  }
});
