// GET /api/diag — полный снимок состояния ПК: версия, Ollama, GPU, последние запросы и ошибки.
import { Hono } from 'hono'
import { APP_VERSION, type DiagInfo } from '@strela/shared'
import { config } from '../config'
import { readGpu } from '../lib/gpu'
import { snapshot } from '../lib/metrics'
import { readOllama } from '../lib/ollama'

export const diagRoute = new Hono()

diagRoute.get('/diag', async (c) => {
  const [ollama, gpu] = await Promise.all([readOllama(), readGpu()])
  const info: DiagInfo = {
    version: APP_VERSION,
    time: new Date().toISOString(),
    gateway: {
      uptimeSec: Math.round(process.uptime()),
      node: process.version,
      platform: `${process.platform} ${process.arch}`,
      listen: `${config.host}:${config.port}`,
      model: config.model,
      ollamaUrl: config.ollamaUrl,
      tokenRequired: Boolean(config.token),
    },
    ollama,
    gpu,
    ...snapshot(),
  }
  return c.json(info)
})
