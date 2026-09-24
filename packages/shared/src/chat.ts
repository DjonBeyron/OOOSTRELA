// Контракт чата: web → (Vercel api) → gateway. POST /api/chat, ответ — SSE-поток ChatEvent.

export type ChatRole = 'system' | 'user' | 'assistant'

export interface ChatAttachment {
  name: string
  /** Текст файла (модель читает только текст). */
  text: string
}

export interface ChatMessage {
  role: ChatRole
  content: string
  /** Приложенный текстовый файл — gateway вставит его в вопрос для модели. */
  attachment?: ChatAttachment
}

export interface ChatRequest {
  messages: ChatMessage[]
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

// Правило: в поток к пользователю не попадает ничего о железе и модели (имя, скорость, VRAM)
// и НИКОГДА — рассуждения модели (они только в админке).
export type ChatEvent =
  | { type: 'delta'; text: string }
  /** Уже отданный текст оказался рассуждением — клиент очищает ответ и ждёт новый. */
  | { type: 'reset' }
  | { type: 'done' }
  | { type: 'error'; message: string }
