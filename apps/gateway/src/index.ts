// Точка входа gateway на ПК с 5090: API (/api/*) + раздача собранного фронта.
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { APP_VERSION } from '@strela/shared'
import { config } from './config'
import { adminRoute } from './routes/admin'
import { chatRoute } from './routes/chat'
import { diagRoute } from './routes/diag'

const app = new Hono()

// Токен нужен только когда gateway смотрит наружу (этап 2). Локально GATEWAY_TOKEN пустой.
app.use('/api/*', async (c, next) => {
  if (config.token && c.req.header('x-gateway-token') !== config.token) {
    return c.json({ error: 'unauthorized' }, 401)
  }
  await next()
})

app.get('/api/health', (c) => c.json({ ok: true, version: APP_VERSION }))
app.route('/api', chatRoute)
app.route('/api', diagRoute)
app.route('/api', adminRoute)

app.use('/*', serveStatic({ root: config.webDist }))
app.get('*', serveStatic({ path: `${config.webDist}/index.html` }))

serve({ fetch: app.fetch, hostname: config.host, port: config.port }, (info) => {
  console.log(`Strela gateway v${APP_VERSION}`)
  console.log(`  open:   http://localhost:${info.port}`)
  console.log(`  diag:   http://localhost:${info.port}/api/diag`)
})
