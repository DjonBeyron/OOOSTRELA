// Одно сообщение: вопрос — простым текстом, ответ — markdown.
import { memo } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { StoredMessage } from '../history/historyStore'

function MessageBubble({ msg }: { msg: StoredMessage }) {
  if (msg.role === 'user') {
    return <div className="msg msg-user">{msg.content}</div>
  }
  const waiting = msg.pending && !msg.content && !msg.error
  return (
    <div className="msg msg-bot">
      {msg.thinking && (
        <details className="msg-thinking">
          <summary>Размышления</summary>
          <p>{msg.thinking}</p>
        </details>
      )}
      {waiting && <span className="typing-dot" aria-label="Модель думает" />}
      {msg.content && (
        <div className="md">
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{ a: (p) => <a {...p} target="_blank" rel="noreferrer" /> }}
          >
            {msg.content}
          </Markdown>
        </div>
      )}
      {msg.error && <div className="msg-error">{msg.error}</div>}
    </div>
  )
}

export default memo(MessageBubble)
