import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

server: {
  hmr: {
    overlay: false
  }
  proxy: {
    // ... existing proxy config
  }
}
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/advertisements': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})