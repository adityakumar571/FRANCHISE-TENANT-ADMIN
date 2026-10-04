import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import autoprefixer from 'autoprefixer'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(() => {
  return {
    base: '/',
    plugins: [react(), tailwindcss()],

    build: {
      outDir: 'build',
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom/')) {
              return 'react-core'
            }
            if (id.includes('@coreui')) return 'coreui'
            if (id.includes('@mui'))    return 'mui'
            if (id.includes('antd') || id.includes('rc-') || id.includes('@ant-design')) return 'antd'
            if (id.includes('recharts') || id.includes('chart.js')) return 'charts'
            if (id.includes('lucide-react') || id.includes('@heroicons')) return 'icons'
          },
        },
      },
    },

    css: {
      postcss: {
        plugins: [autoprefixer({})],
      },
      preprocessorOptions: {
        scss: {
          quietDeps: true,
          silenceDeprecations: ['import', 'legacy-js-api'],
        },
      },
    },

    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.jsx?$/,
      exclude: [],
    },

    optimizeDeps: {
      esbuildOptions: {
        loader: { '.js': 'jsx' },
      },
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'axios',
        'js-cookie',
        'dayjs',
        'react-hot-toast',
      ],
    },

    resolve: {
      alias: [
        {
          find: 'src/',
          replacement: `${path.resolve(__dirname, 'src')}/`,
        },
      ],
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.scss'],
    },

    server: {
      port: 5180,
      strictPort: true,
      host: true,
      open: true,
      hmr: { overlay: true },
      proxy: {
        '/api': {
          target: 'http://localhost:9001',
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.error('[vite proxy error]', err.message)
            })
          },
        },
      },
    },
  }
})
