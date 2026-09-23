// Отправка сообщения: добавляет вопрос и пустой ответ, дописывает ответ по мере стрима.
import { useCallback, useRef, useState } from 'react'
import type { ChatEvent } from '@strela/shared'
import { logClient } from '../diag/clientLog'
import { newId, titleFrom, type StoredMessage } from '../history/historyStore'
import type { ConversationsStore } from '../history/useConversations'
import { streamChat } from './streamChat'

export function useChat(store: ConversationsStore) {
  const [busy, setBusy] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const { active, create, update } = store

  const send = useCallback(
    async (text: string) => {
      if (busy || !text.trim()) return
      const userMsg: StoredMessage = { id: newId(), role: 'user', content: text }
      const botMsg: StoredMessage = { id: newId(), role: 'assistant', content: '', pending: true }
      const history = active?.messages ?? []
      const convId = active?.id ?? create(titleFrom(text))

      update(convId, (c) => ({
        ...c,
        messages: [...c.messages, userMsg, botMsg],
        updatedAt: Date.now(),
      }))
      const patchBot = (fn: (m: StoredMessage) => StoredMessage) =>
        update(convId, (c) => ({
          ...c,
          messages: c.messages.map((m) => (m.id === botMsg.id ? fn(m) : m)),
        }))

      const onEvent = (e: ChatEvent) => {
        if (e.type === 'delta') patchBot((m) => ({ ...m, content: m.content + e.text }))
        else if (e.type === 'thinking') patchBot((m) => ({ ...m, thinking: (m.thinking ?? '') + e.text }))
        else if (e.type === 'done') patchBot((m) => ({ ...m, stats: e.stats }))
        else {
          patchBot((m) => ({ ...m, error: e.message }))
          logClient('error', `chat: ${e.message}`)
        }
      }

      const ctrl = new AbortController()
      abortRef.current = ctrl
      setBusy(true)
      try {
        const messages = [...history, userMsg]
          .filter((m) => m.content && !m.error)
          .map(({ role, content }) => ({ role, content }))
        await streamChat({ messages }, onEvent, ctrl.signal)
      } catch (err) {
        if (!ctrl.signal.aborted) {
          const message = err instanceof Error ? err.message : String(err)
          patchBot((m) => ({ ...m, error: message }))
          logClient('error', `chat request: ${message}`)
        }
      } finally {
        patchBot((m) => ({ ...m, pending: false }))
        abortRef.current = null
        setBusy(false)
      }
    },
    [busy, active, create, update],
  )

  const stop = useCallback(() => abortRef.current?.abort(), [])

  return { busy, send, stop }
}
