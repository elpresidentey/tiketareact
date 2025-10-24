/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/tiketareact/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/store': path.resolve(__dirname, './src/store'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/config': path.resolve(__dirname, './src/config'),
    },
  },
  build: {
    // Enable source maps for better debugging
    sourcemap: false,
    // Optimize CSS
    cssCodeSplit: true,
    // Minify options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        // Enhanced manual chunks for better code splitting
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor'
            }
            if (id.includes('react-router')) {
              return 'router-vendor'
            }
            if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) {
              return 'form-vendor'
            }
            if (id.includes('react-hot-toast')) {
              return 'ui-vendor'
            }
            if (id.includes('zustand')) {
              return 'state-vendor'
            }
            if (id.includes('date-fns')) {
              return 'utils-vendor'
            }
            // Other vendor libraries
            return 'vendor'
          }
          
          // App chunks
          if (id.includes('/pages/')) {
            if (id.includes('Login') || id.includes('Signup') || id.includes('Auth')) {
              return 'auth-pages'
            }
            if (id.includes('Ticket') || id.includes('Dashboard')) {
              return 'app-pages'
            }
          }
          
          if (id.includes('/store/')) {
            return 'stores'
          }
          
          if (id.includes('/components/')) {
            if (id.includes('Loading') || id.includes('Skeleton') || id.includes('Spinner')) {
              return 'loading-components'
            }
            if (id.includes('Form') || id.includes('Input') || id.includes('Button')) {
              return 'form-components'
            }
            if (id.includes('Ticket') || id.includes('Card')) {
              return 'ticket-components'
            }
          }
          
          if (id.includes('/hooks/') || id.includes('/utils/')) {
            return 'utils'
          }
        },
        // Optimize chunk file names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          if (facadeModuleId) {
            const name = facadeModuleId.split('/').pop()?.replace(/\.[^/.]+$/, '')
            return `chunks/${name}-[hash].js`
          }
          return 'chunks/[name]-[hash].js'
        },
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/styles/[name]-[hash][extname]'
          }
          if (assetInfo.name?.match(/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i)) {
            return 'assets/images/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Enable asset inlining for small files
    assetsInlineLimit: 4096,
  },
  // Optimize dev server
  server: {
    hmr: {
      overlay: false,
    },
  },
  // Enable CSS preprocessing optimizations
  css: {
    devSourcemap: false,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-hook-form',
      'zod',
      'zustand',
      'react-hot-toast',
      'date-fns',
    ],
  },
  // Test configuration
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
})