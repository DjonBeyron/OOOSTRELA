// История чатов в localStorage (этап 0). Позже заменим на облачную с авторизацией.
import type { ChatAttachment } from '@strela/shared'
import { logClient } from '../diag/clientLog'

export interface StoredMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  /** Приложенный файл (только у вопросов пользователя). */
  attachment?: ChatAttachment
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
    // Старые записи (до v0.1.6) могли хранить рассуждения — вычищаем.
    return list.map((c) => ({ ...c, messages: c.messages.map(cleanMessage) }))
  } catch (err) {
    logClient('warn', `history load failed: ${String(err)}`)
    return []
  }
}

function cleanMessage(m: StoredMessage & { thinking?: string }): StoredMessage {
  const { thinking, ...rest } = m
  const content = rest.content.replace(/<think>[\s\S]*?(<\/think>|$)/g, '').trimStart()
  return { ...rest, content, pending: false }
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
