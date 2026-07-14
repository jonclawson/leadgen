/// <reference types="vitest" />

import { defineConfig } from 'vite';
import analog from '@analogjs/platform';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    target: ['es2020'],
  },
  resolve: {
    mainFields: ['module'],
  },
  plugins: [
    analog({
      ssr: true,
      // prerender: {
      //   routes: async () => {
      //     return [];
      //   },
      // },
      nitro: {
        // prerender: {
        //   ignore: ['/api/**']
        // },
        preset: 'node-server',
        routeRules: {
          // Redirect R2 file requests to API endpoint for centralized serving
          '/r2/**': { redirect: '/api/uploads/**' },
          // Disable SSR for auth-dependent pages (client-only rendering)
          '/': { ssr: false },
          '/index': { ssr: false },
          '/signup': { ssr: false },
          '/signin': { ssr: false },
          '/signout': { ssr: false },
          '/forms/**': { ssr: false },
          '/submissions/**': { ssr: false },
          '/articles/**': { ssr: false },
          '/user/**': { ssr: false },
        },
      },
    }),
    tailwindcss()
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['**/*.spec.ts'],
    reporters: ['default'],
  },
}));
