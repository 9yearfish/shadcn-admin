import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),

      // fix loading all icon chunks in dev mode
      // https://github.com/tabler/tabler-icons/issues/1233
      '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
    },
  },
  server: {
    proxy: {
      // 所有以 /api 开头的请求将被代理到目标服务器
      '/api': {
        target: 'https://app.watchwa.com/',
        changeOrigin: true,
        secure: false,
        // 如果API不需要 /api 前缀，可以使用 rewrite 去掉
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
