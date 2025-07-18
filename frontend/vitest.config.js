import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    css: true,
    reporters: ['verbose'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*'],
      exclude: [
        'src/test/**/*',
        'src/main.jsx',
        'src/**/*.test.jsx',
        'src/**/*.test.js'
      ]
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
