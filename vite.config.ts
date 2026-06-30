import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Vercel uses root path; GitHub Pages uses /piano-coach/
const base = process.env.VERCEL ? '/' : (process.env.BASE_PATH ?? '/piano-coach/');

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Super Piano Coach',
        short_name: 'PianoCoach',
        description: 'Falling notes, finger guidance, MIDI playback, and mic verification on your real piano.',
        theme_color: '#0f0f14',
        background_color: '#0f0f14',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
});
