// Одно сообщение: вопрос — простым текстом, ответ — markdown.
import { memo } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { StoredMessage } from '../history/historyStore'
import TypingArrow from './TypingArrow'

function MessageBubble({ msg }: { msg: StoredMessage }) {
  if (msg.role === 'user') {
    return <div className="msg msg-user">{msg.content}</div>
  }
  // Стрелка летит, пока модель думает и пока печатает ответ.
  const writing = msg.pending && !msg.error
  return (
    <div className="msg msg-bot">
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
      {writing && <TypingArrow />}
      {msg.error && <div className="msg-error">{msg.error}</div>}
    </div>
  )
}

export default memo(MessageBubble)
