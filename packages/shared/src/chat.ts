// Контракт чата: web → (Vercel api) → gateway. POST /api/chat, ответ — SSE-поток ChatEvent.

export type ChatRole = 'system' | 'user' | 'assistant'

export interface ChatMessage {
  role: ChatRole
  content: string
}

export interface ChatRequest {
  messages: ChatMessage[]
  /** Режим «размышлений» у Qwen3. По умолчанию выключен — быстрее. */
  think?: boolean
}

/** Время и скорость одного ответа — только для метрик в /api/diag, клиенту НЕ отдаётся. */
export interface ChatStats {
  model: string
  /** От получения запроса gateway до последнего токена. */
  totalMs: number
  /** От получения запроса до первого токена ответа. */
  firstTokenMs: number | null
  /** Сколько Ollama грузила модель в видеопамять (0, если уже была загружена). */
  loadMs: number
  promptTokens: number
  outputTokens: number
  tokensPerSec: number
}

// Правило: в поток к пользователю не попадает ничего о железе и модели (имя, скорость, VRAM).
export type ChatEvent =
  | { type: 'thinking'; text: string }
  | { type: 'delta'; text: string }
  | { type: 'done' }
  | { type: 'error'; message: string }
