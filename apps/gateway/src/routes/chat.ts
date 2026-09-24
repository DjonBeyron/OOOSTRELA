// POST /api/chat — отправляет диалог в Ollama и стримит ответ клиенту как SSE (ChatEvent).
import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import type { ChatEvent, ChatRequest, ChatStats } from '@strela/shared'
import { config } from '../config'
import { errorMessage, recordError, recordRequest } from '../lib/metrics'
import { readNdjson, type OllamaChunk } from '../lib/ollama'

export const chatRoute = new Hono()

chatRoute.post('/chat', async (c) => {
  const body = await c.req.json<ChatRequest>().catch(() => null)
  if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
    return c.json({ error: 'messages[] required' }, 400)
  }
  const started = Date.now()

  return streamSSE(c, async (stream) => {
    const send = (e: ChatEvent) => stream.writeSSE({ data: JSON.stringify(e) })
    const abort = new AbortController()
    stream.onAbort(() => abort.abort())
    let firstTokenMs: number | null = null

    try {
      const res = await fetch(`${config.ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          model: config.model,
          messages: body.messages,
          stream: true,
          think: body.think ?? false,
          keep_alive: config.keepAlive,
        }),
        signal: abort.signal,
      })
      if (!res.ok || !res.body) throw new Error(`Ollama HTTP ${res.status}: ${await res.text()}`)

      for await (const chunk of readNdjson<OllamaChunk>(res.body)) {
        if (chunk.error) throw new Error(`Ollama: ${chunk.error}`)
        const m = chunk.message
        if (m?.thinking) await send({ type: 'thinking', text: m.thinking })
        if (m?.content) {
          firstTokenMs ??= Date.now() - started
          await send({ type: 'delta', text: m.content })
        }
        if (chunk.done) {
          const stats = toStats(chunk, started, firstTokenMs)
          recordRequest({ status: 'ok', stats })
          await send({ type: 'done' })
        }
      }
    } catch (err) {
      if (abort.signal.aborted) {
        recordRequest({ status: 'aborted' })
        return
      }
      const message = errorMessage(err)
      recordError('chat', message)
      recordRequest({ status: 'error', error: message })
      // Подробности (Ollama, модель) — только в /api/diag, пользователю — общий текст.
      await send({ type: 'error', message: 'Не удалось получить ответ. Попробуйте ещё раз.' })
    }
  })
})

const NS_IN_MS = 1e6

function toStats(chunk: OllamaChunk, started: number, firstTokenMs: number | null): ChatStats {
  const outputTokens = chunk.eval_count ?? 0
  const evalMs = (chunk.eval_duration ?? 0) / NS_IN_MS
  return {
    model: config.model,
    totalMs: Date.now() - started,
    firstTokenMs,
    loadMs: Math.round((chunk.load_duration ?? 0) / NS_IN_MS),
    promptTokens: chunk.prompt_eval_count ?? 0,
    outputTokens,
    tokensPerSec: evalMs > 0 ? Math.round((outputTokens / evalMs) * 1000 * 10) / 10 : 0,
  }
}
