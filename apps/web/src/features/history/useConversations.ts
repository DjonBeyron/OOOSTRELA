// Список чатов + активный чат. Сохранение в localStorage с задержкой (не на каждый токен).
import { useCallback, useEffect, useMemo, useState } from 'react'
import { loadHistory, newId, saveHistory, type Conversation } from './historyStore'

const SAVE_DELAY_MS = 400

export function useConversations() {
  const [initial] = useState(loadHistory)
  const [list, setList] = useState<Conversation[]>(initial)
  const [activeId, setActiveId] = useState<string | null>(initial[0]?.id ?? null)

  useEffect(() => {
    const t = setTimeout(() => saveHistory(list), SAVE_DELAY_MS)
    return () => clearTimeout(t)
  }, [list])

  const active = useMemo(() => list.find((c) => c.id === activeId) ?? null, [list, activeId])

  const create = useCallback((title: string): string => {
    const conv: Conversation = { id: newId(), title, messages: [], updatedAt: Date.now() }
    setList((l) => [conv, ...l])
    setActiveId(conv.id)
    return conv.id
  }, [])

  const update = useCallback((id: string, fn: (c: Conversation) => Conversation) => {
    setList((l) => l.map((c) => (c.id === id ? fn(c) : c)))
  }, [])

  const remove = useCallback((id: string) => {
    setList((l) => l.filter((c) => c.id !== id))
    setActiveId((cur) => (cur === id ? null : cur))
  }, [])

  const clearAll = useCallback(() => {
    setList([])
    setActiveId(null)
  }, [])

  const sorted = useMemo(() => [...list].sort((a, b) => b.updatedAt - a.updatedAt), [list])

  return { list: sorted, active, activeId, select: setActiveId, create, update, remove, clearAll }
}

export type ConversationsStore = ReturnType<typeof useConversations>
