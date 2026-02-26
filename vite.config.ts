import { defineConfig, type Plugin } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// Plugin to resolve figma:asset/... imports as placeholder images
// These are Figma-specific imports that don't exist in a standard build environment.
function figmaAssetPlugin(): Plugin {
  // A small gray placeholder PNG (1x1 pixel) encoded as a data URI
  const PLACEHOLDER =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88uNDPQAIhQMbT46APQAAAABJRU5ErkJggg=='

  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        return '\0figma-asset:' + id
      }
    },
    load(id) {
      if (id.startsWith('\0figma-asset:figma:asset/')) {
        return `export default ${JSON.stringify(PLACEHOLDER)}`
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetPlugin(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
