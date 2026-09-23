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

/** Время и скорость одного ответа — для метрик и строки под сообщением. */
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

export type ChatEvent =
  | { type: 'thinking'; text: string }
  | { type: 'delta'; text: string }
  | { type: 'done'; stats: ChatStats }
  | { type: 'error'; message: string }
