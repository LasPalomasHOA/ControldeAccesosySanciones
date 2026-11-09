import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { spawn, type ChildProcess } from 'node:child_process'

function expressServerPlugin(): Plugin {
  let serverProcess: ChildProcess | null = null
  let isRestarting = false
  let restartTimeout: ReturnType<typeof setTimeout> | null = null

  const killServer = (onKilled?: () => void) => {
    if (!serverProcess) {
      if (onKilled) onKilled()
      return
    }

    const proc = serverProcess
    serverProcess = null

    if (process.platform === 'win32' && proc.pid) {
      try {
        const killer = spawn('taskkill', ['/pid', String(proc.pid), '/f', '/t'], { stdio: 'ignore' })
        killer.on('close', () => {
          if (onKilled) onKilled()
        })
        killer.on('error', () => {
          proc.kill('SIGKILL')
          if (onKilled) onKilled()
        })
        return
      } catch {
        proc.kill('SIGKILL')
      }
    } else {
      proc.kill('SIGTERM')
    }

    if (onKilled) {
      setTimeout(onKilled, 300)
    }
  }

  const startServer = () => {
    if (serverProcess && !serverProcess.killed) return
    const serverScript = path.resolve(process.cwd(), 'Server/index.cjs')
    const current = spawn(process.execPath, [serverScript], {
      stdio: 'inherit',
      env: { ...process.env },
    })
    serverProcess = current

    current.on('error', (err) => {
      console.error('❌ Error al iniciar el servidor Express:', err)
    })

    current.on('exit', (code) => {
      if (serverProcess === current) {
        serverProcess = null
      }
      if (code !== 0 && code !== null && !isRestarting) {
        console.warn(`⚠️ Servidor Express finalizó con código: ${code}`)
        // Auto-reintento si cayó por EADDRINUSE o cierre inesperado
        setTimeout(() => {
          if (!serverProcess && !isRestarting) {
            console.log('🔄 Reintentando levantar servidor Express en puerto 5000...')
            startServer()
          }
        }, 1500)
      }
    })
  }

  const restartServer = () => {
    if (restartTimeout) clearTimeout(restartTimeout)
    restartTimeout = setTimeout(() => {
      isRestarting = true
      killServer(() => {
        setTimeout(() => {
          isRestarting = false
          startServer()
        }, 300)
      })
    }, 200)
  }

  return {
    name: 'express-server-runner',
    apply: 'serve',
    configureServer(server) {
      startServer()

      server.watcher.on('change', (file) => {
        if (file.includes('Server') || file.includes('server')) {
          restartServer()
        }
      })

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
        configure: (proxy) => {
          proxy.on('error', (err, _req, res) => {
            if ((err as any).code === 'ECONNREFUSED') {
              if (res && 'writeHead' in res && !(res as any).headersSent) {
                res.writeHead(503, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ error: 'Backend iniciando...' }))
              }
            }
          })
        },
      },
      '/uploads': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
