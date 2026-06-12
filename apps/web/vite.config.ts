import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { PluginOption } from 'vite'
import path from 'path'
import fs from 'fs'

const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'))
const APP_VERSION = pkg.version

export default defineConfig(async () => {
  const plugins: PluginOption[] = [react()]

  // Plugin visualizer solo en modo análisis (opcional, se activa con --mode analyze)
  if (process.env.ANALYZE === 'true') {
    const { visualizer } = await import('rollup-plugin-visualizer')
    plugins.push(
      visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
        filename: 'dist/stats.html',
      }) as PluginOption
    )
  }

  if (process.env.VITE_ELECTRON_BUILD === 'true') {
    plugins.push({
      name: 'strip-crossorigin',
      transformIndexHtml(html) {
        return html
          .replace(/<script([^>]*) crossorigin([^>]*)>/gi, '<script$1$2>')
          .replace(/<link([^>]*) crossorigin([^>]*)>/gi, '<link$1$2>')
      },
    })
  }

  if (process.env.VITE_ELECTRON_BUILD === 'true') {
    const electron = (await import('vite-plugin-electron')).default
    const renderer = (await import('vite-plugin-electron-renderer')).default

    plugins.push(
      electron([
        {
          entry: 'electron/main.ts',
          vite: {
            build: {
              outDir: 'dist-electron',
              lib: {
                formats: ['cjs'],
              },
              rollupOptions: {
                external: ['electron'],
              },
            },
          },
        },
        {
          entry: 'electron/preload.ts',
          vite: {
            build: {
              outDir: 'dist-electron',
              lib: {
                formats: ['cjs'],
              },
            },
          },
          onstart(args) {
            args.reload()
          },
        },
      ]),
      renderer(),
    )
  }

  return {
    base: process.env.VITE_ELECTRON_BUILD === 'true' ? './' : '/',
    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(APP_VERSION),
    },
    plugins,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      host: true,
    },
    build: {
      target: 'chrome120',
      sourcemap: true,
      /**
       * Manual chunks para optimizar el tamaño del bundle principal.
       * Separa las librerías más pesadas de forma que el bundle inicial
       * cargue lo estrictamente necesario y las librerías pesadas se
       * descarguen en paralelo.
       */
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Separar librerías grandes en chunks independientes
            if (id.includes('node_modules')) {
              if (id.includes('tone')) return 'tone'
              if (id.includes('framer-motion')) return 'framer-motion'
              if (id.includes('react-router')) return 'react-router'
              if (id.includes('@tanstack/react-query')) return 'react-query'
              if (id.includes('dexie')) return 'dexie'
              if (id.includes('lucide-react')) return 'lucide'
              if (id.includes('socket.io-client')) return 'socket'
              if (id.includes('react-dom')) return 'react-dom'
              // Todo lo demás de node_modules va a un chunk común
              return 'vendor'
            }
          },
        },
      },
    },
  }
})
