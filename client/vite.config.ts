import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { buildLiveSquad } from './anakin-feed'

// Dev middleware: serves the live World Cup squad at /api/squad by calling the
// anakin.io Search API server-side. The key stays in .env (never shipped to the
// browser). Results are cached so we don't re-scrape on every reload.
function liveFeed(key: string): Plugin {
  let cache: { at: number; data: unknown } | null = null
  const TTL = 30 * 60 * 1000 // 30 min — searches cost credits, so cache hard

  return {
    name: 'cardclash-live-feed',
    configureServer(server) {
      server.middlewares.use('/api/squad', async (_req, res) => {
        res.setHeader('Content-Type', 'application/json')
        if (!key) { res.statusCode = 200; res.end(JSON.stringify({ cards: [], live: false })); return }
        try {
          if (!cache || Date.now() - cache.at > TTL) {
            const cards = await buildLiveSquad(key)
            cache = { at: Date.now(), data: cards }
          }
          res.end(JSON.stringify({ cards: cache.data, live: true }))
        } catch (e) {
          res.statusCode = 200
          res.end(JSON.stringify({ cards: [], live: false, error: String(e) }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '') // load all, incl. non-VITE_ keys
  return {
    plugins: [react(), liveFeed(env.ANAKIN_API_KEY)],
  }
})
