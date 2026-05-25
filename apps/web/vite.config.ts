import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { PluginOption } from 'vite'
import path from 'path'
import fs from 'fs'

const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'))
const APP_VERSION = pkg.version

export default defineConfig(async () => {
  const plugins: PluginOption[] = [react()]

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
                external: ['electron', 'twilio'],
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
    },
  }
})
