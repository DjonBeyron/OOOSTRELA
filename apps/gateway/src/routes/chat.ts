// POST /api/chat — отправляет диалог в Ollama и стримит ответ клиенту как SSE (ChatEvent).
// Перед этим вопрос проходит темы админки (запрет / заготовка). Рассуждения модели клиенту
// не уходят — только в админку.
import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import type { ChatEvent, ChatMessage, ChatRequest, ChatStats, CheckResult } from '@strela/shared'
import { config } from '../config'
import { errorMessage, recordError, recordRequest } from '../lib/metrics'
import { checkPrompt, systemPrompt } from '../lib/moderation'
import { readNdjson, type OllamaChunk } from '../lib/ollama'
import { ThinkSplitter, type Segment } from '../lib/thinkSplitter'

export const chatRoute = new Hono()

/** Потолок текста файла, который вставляем в вопрос (~20 тыс. токенов). */
const MAX_FILE_CHARS = 60_000

/** Реплика для модели: текст файла (если есть) + сам вопрос. */
function toModelContent(m: ChatMessage): string {
  if (!m.attachment?.text) return m.content
  const text = m.attachment.text.slice(0, MAX_FILE_CHARS)
  return `Пользователь приложил файл «${m.attachment.name}»:\n"""\n${text}\n"""\n\n${m.content}`
}

chatRoute.post('/chat', async (c) => {
  const body = await c.req.json<ChatRequest>().catch(() => null)
  if (!body || !Array.isArray(body.messages)) return c.json({ error: 'messages[] required' }, 400)

  const started = Date.now()
  // От клиента принимаем только реплики user/assistant — свой system он подсунуть не может.
  const incoming = body.messages.filter(
    (m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string',
  )
  const last = incoming.findLast((m) => m.role === 'user')
  const prompt = last?.content ?? ''
  if (!prompt.trim() && !last?.attachment) return c.json({ error: 'user message required' }, 400)
  const dialog = incoming.map((m) => ({ role: m.role, content: toModelContent(m) }))
  const attachment = last?.attachment?.name

  return streamSSE(c, async (stream) => {
    const send = (e: ChatEvent) => stream.writeSSE({ data: JSON.stringify(e) })
    const abort = new AbortController()
    stream.onAbort(() => abort.abort())
    const splitter = new ThinkSplitter()
    let answer = ''
    let thinking = ''
    let firstTokenMs: number | null = null
    let check: CheckResult | undefined

    const handle = async (segments: Segment[]) => {
      for (const s of segments) {
        if (s.type === 'thinking') {
          thinking += s.text
        } else if (s.type === 'orphanClose') {
          // Всё, что уже ушло как ответ, было рассуждением — забираем обратно.
          thinking += answer + s.text
          if (answer) await send({ type: 'reset' })
          answer = ''
          firstTokenMs = null
        } else {
          // Qwen после рассуждений начинает ответ с пустых строк — срезаем их.
          const text = answer ? s.text : s.text.trimStart()
          if (!text) continue
          firstTokenMs ??= Date.now() - started
          answer += text
          await send({ type: 'delta', text })
        }
      }
    }

    try {
      // Темы админки (слои 1–2) — по самому вопросу. Запрещённый вопрос в модель не уходит вообще.
      check = await checkPrompt(prompt)
      if (check.action === 'block') {
        const reply = check.reply ?? ''
        await send({ type: 'delta', text: reply })
        await send({ type: 'done' })
        recordRequest({ status: 'blocked', prompt, answer: reply, thinking: '', check, attachment })
        return
      }
      // Скрытая инструкция: кто модель + запретные темы (слой 3) + заготовка, если сработала.
      const messages = [{ role: 'system', content: systemPrompt(check) }, ...dialog]

      const res = await fetch(`${config.ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          model: config.model,
          messages,
          stream: true,
          think: config.think,
          keep_alive: config.keepAlive,
          options: { num_ctx: config.numCtx },
        }),
        signal: abort.signal,
      })
      if (!res.ok || !res.body) throw new Error(`Ollama HTTP ${res.status}: ${await res.text()}`)

      for await (const chunk of readNdjson<OllamaChunk>(res.body)) {
        if (chunk.error) throw new Error(`Ollama: ${chunk.error}`)
        const m = chunk.message
        if (m?.thinking) thinking += m.thinking
        if (m?.content) await handle(splitter.push(m.content))
        if (chunk.done) {
          await handle(splitter.flush())
          const stats = toStats(chunk, started, firstTokenMs)
          recordRequest({ status: 'ok', prompt, answer, thinking, stats, check, attachment })
          await send({ type: 'done' })
        }
      }
    } catch (err) {
      if (abort.signal.aborted) {
        recordRequest({ status: 'aborted', prompt, answer, thinking, check, attachment })
        return
      }
      const message = errorMessage(err)
      recordError('chat', message)
      recordRequest({ status: 'error', prompt, answer, thinking, error: message, check, attachment })
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
