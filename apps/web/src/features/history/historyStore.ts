// История чатов в localStorage (этап 0). Позже заменим на облачную с авторизацией.
import type { ChatStats } from '@strela/shared'
import { logClient } from '../diag/clientLog'

export interface StoredMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  thinking?: string
  stats?: ChatStats
  error?: string
  pending?: boolean
}

export interface Conversation {
  id: string
  title: string
  messages: StoredMessage[]
  updatedAt: number
}

const KEY = 'strela.history.v1'
const MAX_CONVERSATIONS = 100

export function loadHistory(): Conversation[] {
  try {
    const raw = localStorage.getItem(KEY)
    const list = raw ? (JSON.parse(raw) as Conversation[]) : []
    // Ответ, оборванный перезагрузкой страницы, больше не «печатается».
    return list.map((c) => ({ ...c, messages: c.messages.map((m) => ({ ...m, pending: false })) }))
  } catch (err) {
    logClient('warn', `history load failed: ${String(err)}`)
    return []
  }
}

export function saveHistory(list: Conversation[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX_CONVERSATIONS)))
  } catch (err) {
    logClient('warn', `history save failed: ${String(err)}`)
  }
}

export function newId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function titleFrom(text: string): string {
  const oneLine = text.replace(/\s+/g, ' ').trim()
  return oneLine.length > 40 ? `${oneLine.slice(0, 40)}…` : oneLine || 'Новый чат'
}
