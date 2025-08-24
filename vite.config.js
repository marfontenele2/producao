import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  publicDir: 'publico',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./codigo_fonte', import.meta.url)),
    },
  },
})
