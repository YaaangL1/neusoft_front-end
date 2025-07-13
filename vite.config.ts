import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import type { IncomingMessage, ServerResponse } from 'http'
import type { ProxyOptions } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3002,
    proxy: {
      '/api': {
        target: 'http://113.45.219.153:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, options) => {
          // 打印代理请求信息
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('代理请求:', {
              url: req.url,
              method: req.method,
              headers: req.headers,
              body: (req as any).body
            })
          })
          // 打印代理响应信息
          proxy.on('proxyRes', (proxyRes, req, res) => {
            let body = ''
            proxyRes.on('data', chunk => {
              body += chunk
            })
            proxyRes.on('end', () => {
              console.log('代理响应:', {
                status: proxyRes.statusCode,
                headers: proxyRes.headers,
                body: body
              })
            })
          })
          // 打印错误信息
          proxy.on('error', (err, req, res) => {
            console.error('代理错误:', err)
          })
        }
      }
    }
  }
})