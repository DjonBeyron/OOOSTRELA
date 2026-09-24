// Контракт админки: GET /api/admin/requests. Только для владельца — здесь рассуждения модели,
// тексты вопросов и ответов. Пока хранится в памяти gateway (последние 50), позже — Cloudflare D1.
import type { ChatStats } from './chat'

export interface AdminRequestRecord {
  id: string
  at: string
  status: 'ok' | 'error' | 'aborted'
  /** Последний вопрос пользователя. */
  prompt: string
  /** Ответ, который увидел пользователь (без рассуждений). */
  answer: string
  /** Рассуждения модели — пользователю не показываются никогда. */
  thinking: string
  stats?: ChatStats
  error?: string
}

export interface AdminRequestsResponse {
  requests: AdminRequestRecord[]
}
