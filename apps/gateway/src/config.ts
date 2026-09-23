// Настройки gateway из apps/gateway/.env (если файла нет — значения по умолчанию).
try {
  process.loadEnvFile('.env')
} catch {
  // .env необязателен
}

const env = process.env

export const config = {
  host: env.HOST || '127.0.0.1',
  port: Number(env.PORT) || 8787,
  ollamaUrl: (env.OLLAMA_URL || 'http://127.0.0.1:11434').replace(/\/$/, ''),
  model: env.MODEL || 'qwen3:30b-a3b',
  keepAlive: env.KEEP_ALIVE || '30m',
  token: env.GATEWAY_TOKEN || '',
  /** Собранный фронт, который gateway раздаёт как статику (путь от apps/gateway). */
  webDist: '../web/dist',
}
