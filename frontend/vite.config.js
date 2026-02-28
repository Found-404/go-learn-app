import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './', // 设置为相对路径，确保在 GitHub Pages 子目录下能正确加载资源
  build: {
    outDir: '../docs', // 将输出目录设置为 go-learn-app/docs
  },
})
