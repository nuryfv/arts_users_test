import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  build: {
    // El build va directo a la carpeta publica del backend, que es lo que
    // sirve Herd en http://artistshot-test.test
    outDir: resolve(import.meta.dirname, '../backend/public/app'),
    emptyOutDir: true,
  },
  // Compilado, la app vive en /app del dominio del backend; en desarrollo
  // Vite la sirve en la raiz de localhost:5173.
  base: command === 'build' ? '/app/' : '/',
}))
