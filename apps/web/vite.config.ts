import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { PluginOption } from 'vite'
import path from 'path'

export default defineConfig(async () => {
  const plugins: PluginOption[] = [react()]

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
