// Контракт админки: GET /api/admin/requests. Только для владельца — здесь рассуждения модели,
// тексты вопросов и ответов. Пока хранится в памяти gateway (последние 50), позже — Cloudflare D1.
import type { ChatStats } from './chat'
import type { CheckResult } from './rules'

export type RequestStatus = 'ok' | 'error' | 'aborted' | 'blocked'

export interface AdminRequestRecord {
  id: string
  at: string
  status: RequestStatus
  /** Последний вопрос пользователя. */
  prompt: string
  /** Ответ, который увидел пользователь (без рассуждений). */
  answer: string
  /** Рассуждения модели — пользователю не показываются никогда. */
  thinking: string
  stats?: ChatStats
  error?: string
  /** Сработавшая тема: запрет (status = 'blocked') или заготовка ответа. */
  check?: CheckResult
  /** Имя приложенного файла, если был. */
  attachment?: string
}

export interface AdminRequestsResponse {
  requests: AdminRequestRecord[]
}
