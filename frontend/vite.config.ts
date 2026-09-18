import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/**
 * Dos destinos de compilacion:
 *
 *   npm run build          -> dist/ en la raiz del dominio. Es lo que
 *                             despliega Vercel.
 *   npm run build:backend  -> backend/public/app, para servir la interfaz
 *                             desde el propio CodeIgniter (origen unico).
 *
 * @see https://vite.dev/config/
 */
export default defineConfig(({ mode }) => {
  const paraBackend = mode === 'backend'

  return {
    plugins: [react(), tailwindcss()],
    build: paraBackend
      ? {
          outDir: resolve(import.meta.dirname, '../backend/public/app'),
          emptyOutDir: true,
        }
      : {},
    base: paraBackend ? '/app/' : '/',
  }
})
