import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// GitHub Pages serves from /excursion/ — override locally with BASE_PATH=/ npm run dev
const base = process.env.BASE_PATH ?? '/excursion/';

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Piano Coach',
        short_name: 'PianoCoach',
        description: 'Learn piano with your iPhone or iPad — guided songs, mic feedback, and camera view.',
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
