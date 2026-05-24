import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'error', // Suppress warnings, only show errors
  plugins: [
    react({
      // Enable Fast Refresh
      fastRefresh: true,
      // Skip JSDoc validation for faster builds
      jsxPure: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Optimize build performance
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
      },
    },
    rollupOptions: {
      output: {
        // Split code into chunks for better caching
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-carousel'],
          'animation': ['framer-motion'],
          'query': ['@tanstack/react-query'],
        },
      },
    },
  },
  server: {
    // Optimize dev server
    middlewareMode: false,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    },
  },
  optimization: {
    // Enable code splitting and tree shaking
    treeshake: true,
  },
});