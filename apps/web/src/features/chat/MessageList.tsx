// Лента сообщений. Прокручивается вниз, пока пользователь сам не отмотал вверх.
import { useEffect, useRef } from 'react'
import type { StoredMessage } from '../history/historyStore'
import MessageBubble from './MessageBubble'

const STICK_PX = 80

export default function MessageList({ messages }: { messages: StoredMessage[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const stick = useRef(true)

  useEffect(() => {
    const el = ref.current
    if (el && stick.current) el.scrollTop = el.scrollHeight
  }, [messages])

  const onScroll = () => {
    const el = ref.current
    if (el) stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < STICK_PX
  }

  return (
    <div className="messages" ref={ref} onScroll={onScroll}>
      <div className="messages-inner">
        {messages.map((m) => (
          <MessageBubble key={m.id} msg={m} />
        ))}
      </div>
    </div>
  )
}
