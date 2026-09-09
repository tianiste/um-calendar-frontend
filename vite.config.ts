import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import { DEFAULT_API_ORIGIN } from './src/services/apiConfig'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { offlinePlugin } from './build/offlinePlugin'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  return {
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_URL || env.VITE_API_BASE || DEFAULT_API_ORIGIN,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure(proxy) {
            // This is a server-to-server request; the API restricts browser origins.
            proxy.on('proxyReq', (request) => request.removeHeader('origin'))
          },
        },
      },
    },
    plugins: [vue(), vueDevTools(), offlinePlugin()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
