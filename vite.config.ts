import { defineConfig, type Plugin, loadEnv } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// Plugin to resolve figma:asset/... imports as placeholder images
function figmaAssetPlugin(): Plugin {
  const PLACEHOLDER =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88uNDPQAIhQMbT46APQAAAABJRU5ErkJggg=='
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) return '\0figma-asset:' + id
    },
    load(id) {
      if (id.startsWith('\0figma-asset:figma:asset/')) return `export default ${JSON.stringify(PLACEHOLDER)}`
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: '/',
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    server: {
      proxy: {
        '/api/verify-payment': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/verify-payment/, '/api/v1/orders/verify-payment'),
        },
      },
    },
    plugins: [
      figmaAssetPlugin(),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    assetsInclude: ['**/*.svg', '**/*.csv'],
  }
})
