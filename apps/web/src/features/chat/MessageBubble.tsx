// Одно сообщение: вопрос — простым текстом, ответ — markdown + строка со временем генерации.
import { memo } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ChatStats } from '@strela/shared'
import type { StoredMessage } from '../history/historyStore'

function formatStats(s: ChatStats): string {
  const parts = [`${(s.totalMs / 1000).toFixed(1)} с`]
  if (s.firstTokenMs !== null) parts.push(`первое слово ${(s.firstTokenMs / 1000).toFixed(1)} с`)
  if (s.tokensPerSec) parts.push(`${s.tokensPerSec} ток/с`)
  if (s.loadMs > 500) parts.push(`загрузка модели ${(s.loadMs / 1000).toFixed(1)} с`)
  return parts.join(' · ')
}

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
      {msg.error && <div className="msg-error">Ошибка: {msg.error}</div>}
      {msg.stats && <div className="msg-stats">{formatStats(msg.stats)}</div>}
    </div>
  )
}

export default memo(MessageBubble)
