import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

function typesafeProxy(apiKey: string) {
  return {
    name: 'typesafe-proxy',
    configureServer(server: { middlewares: { use: (path: string, handler: (req: any, res: any) => void) => void } }) {
      server.middlewares.use('/api/typesafe', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method not allowed')
          return
        }
        const chunks: Buffer[] = []
        for await (const chunk of req) chunks.push(Buffer.from(chunk))
        try {
          const response = await fetch('https://api.typesafe.ai/v1/systemone', {
            method: 'POST',
            headers: {
              Authorization: apiKey,
              'Content-Type': 'application/json',
            },
            body: Buffer.concat(chunks),
          })
          res.statusCode = response.status
          res.setHeader('Content-Type', 'application/json')
          res.end(await response.text())
        } catch {
          res.statusCode = 502
          res.end(JSON.stringify({ error: 'TypeSafe AI is temporarily unavailable.' }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss(), typesafeProxy(env.TYPESAFE_API_KEY ?? '')],
    server: { port: 5173, host: true },
  }
})
