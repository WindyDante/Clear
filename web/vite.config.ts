// vite.config.ts

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      manifest: {
        name: 'Clear',
        short_name: 'Clear',
        description: '简洁之美 效率之选',
        start_url: '.',
        display: 'standalone',
        icons: [
          {
            src: '/favicon.svg',    // 您的 SVG 文件路径
            sizes: 'any',           // 关键：对于 SVG，sizes 必须是 'any'
            type: 'image/svg+xml'   // 关键：type 必须是 'image/svg+xml'
          }
        ],
      },
    }),
  ],
})