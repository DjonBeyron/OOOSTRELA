// Последние запросы и ошибки в памяти — для /api/diag и /api/admin. После перезапуска gateway пусто.
import { randomUUID } from 'node:crypto'
import type { AdminRequestRecord, ErrorRecord, RequestRecord } from '@strela/shared'

const REQUEST_LIMIT = 50
const ERROR_LIMIT = 20
/** Потолки длины текстов, чтобы память gateway не росла без меры. */
const MAX_PROMPT = 2_000
const MAX_ANSWER = 8_000
const MAX_THINKING = 20_000

const requests: AdminRequestRecord[] = []
const errors: ErrorRecord[] = []

function push<T>(list: T[], item: T, limit: number) {
  list.unshift(item)
  if (list.length > limit) list.length = limit
}

function cut(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max)}…[обрезано]` : text
}

export function recordRequest(record: Omit<AdminRequestRecord, 'id' | 'at'>) {
  push(
    requests,
    {
      id: randomUUID(),
      at: new Date().toISOString(),
      ...record,
      prompt: cut(record.prompt, MAX_PROMPT),
      answer: cut(record.answer, MAX_ANSWER),
      thinking: cut(record.thinking, MAX_THINKING),
    },
    REQUEST_LIMIT,
  )
}

export function recordError(where: string, message: string) {
  push(errors, { at: new Date().toISOString(), where, message }, ERROR_LIMIT)
  console.error(`[${where}] ${message}`)
}

/** Для /api/diag: без текстов вопросов, ответов и рассуждений. */
export function snapshot(): { requests: RequestRecord[]; errors: ErrorRecord[] } {
  return {
    requests: requests.slice(0, 20).map((r) => ({
      at: r.at,
      status: r.status,
      stats: r.stats,
      error: r.error,
      thinkingChars: r.thinking.length,
    })),
    errors: [...errors],
  }
}

/** Для /api/admin/requests: полные записи. */
export function adminRequests(): AdminRequestRecord[] {
  return [...requests]
}

export function errorMessage(err: unknown): string {
  if (err instanceof Error) {
    const cause = err.cause instanceof Error ? ` (${err.cause.message})` : ''
    return err.message + cause
  }
  return String(err)
}
