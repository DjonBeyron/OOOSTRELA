// Обращения к локальному API Ollama (https://github.com/ollama/ollama/blob/main/docs/api.md).
import type { DiagInfo } from '@strela/shared'
import { config } from '../config'
import { errorMessage } from './metrics'

/** Одна строка NDJSON-потока /api/chat. */
export interface OllamaChunk {
  message?: { role: string; content?: string; thinking?: string }
  done?: boolean
  error?: string
  total_duration?: number
  load_duration?: number
  prompt_eval_count?: number
  eval_count?: number
  eval_duration?: number
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(config.ollamaUrl + path, { signal: AbortSignal.timeout(3000) })
  if (!res.ok) throw new Error(`Ollama ${path} → HTTP ${res.status}`)
  return (await res.json()) as T
}

const GB = 1024 ** 3

export async function readOllama(): Promise<DiagInfo['ollama']> {
  try {
    const [ver, tags, ps] = await Promise.all([
      getJson<{ version: string }>('/api/version'),
      getJson<{ models: { name: string; size: number }[] }>('/api/tags'),
      getJson<{ models: { name: string; size_vram: number; expires_at: string }[] }>('/api/ps'),
    ])
    return {
      ok: true,
      version: ver.version,
      models: tags.models.map((m) => ({ name: m.name, sizeGb: round(m.size / GB) })),
      loaded: ps.models.map((m) => ({
        name: m.name,
        vramGb: round(m.size_vram / GB),
        expiresAt: m.expires_at,
      })),
    }
  } catch (err) {
    return { ok: false, error: errorMessage(err), models: [], loaded: [] }
  }
}

/** Разбор NDJSON-потока: по объекту на строку. */
export async function* readNdjson<T>(body: ReadableStream<Uint8Array>): AsyncGenerator<T> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buf = ''
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    let i: number
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim()
      buf = buf.slice(i + 1)
      if (line) yield JSON.parse(line) as T
    }
  }
  if (buf.trim()) yield JSON.parse(buf) as T
}

function round(n: number) {
  return Math.round(n * 10) / 10
}
