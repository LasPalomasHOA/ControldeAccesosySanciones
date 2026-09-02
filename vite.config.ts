import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { spawn, type ChildProcess } from 'node:child_process'

function expressServerPlugin(): Plugin {
  let serverProcess: ChildProcess | null = null

  const killServer = () => {
    if (serverProcess && !serverProcess.killed) {
      serverProcess.kill()
      serverProcess = null
    }
  }

  return {
    name: 'express-server-runner',
    apply: 'serve',
    configureServer(server) {
      if (!serverProcess) {
        serverProcess = spawn(
          process.execPath,
          ['--watch', path.resolve(import.meta.dirname, 'Server/index.cjs')],
          {
            stdio: ['ignore', 'inherit', 'inherit'],
          }
        )
      }

      server.httpServer?.on('close', killServer)
      process.once('SIGINT', () => {
        killServer()
        process.exit()
      })
      process.once('SIGTERM', () => {
        killServer()
        process.exit()
      })
      process.once('exit', killServer)
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    expressServerPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
