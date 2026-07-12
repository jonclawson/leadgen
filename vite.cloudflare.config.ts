/// <reference types="vitest" />

import { defineConfig } from 'vite';
import analog from '@analogjs/platform';
import tailwindcss from '@tailwindcss/vite';

/**
 * Vite configuration for Cloudflare Pages/Workers deployment
 * Build with: npm run build:cf
 * Deploy with: wrangler deploy
 */
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
      nitro: {
        // Use Cloudflare Pages preset for Workers/Pages Functions
        preset: 'cloudflare_pages',
        output: {
          dir: './dist/analog/public',
          serverDir: './dist/analog/public/_worker.js',
        },
        routeRules: {
          // All admin URLs are only rendered on the client
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
        // Environment binding pass-through for Cloudflare
        env: {
          autoAlias: true,
        },
        alias: {
          'better-auth': 'better-auth/dist/index.js'
        }
      },
    }),
    tailwindcss()
  ],
  define: {
    'ngDevMode': 'false',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['**/*.spec.ts'],
    reporters: ['default'],
  },
}));
