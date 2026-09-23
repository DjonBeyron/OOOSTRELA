// Экран чата: приветствие (если чат пустой) или лента сообщений + поле ввода.
import type { ConversationsStore } from '../history/useConversations'
import Composer from './Composer'
import MessageList from './MessageList'
import { useChat } from './useChat'

export default function ChatView({ store }: { store: ConversationsStore }) {
  const { busy, send, stop } = useChat(store)
  const messages = store.active?.messages ?? []

  return (
    <main className="chat">
      {messages.length === 0 ? (
        <div className="chat-empty">
          <h1>Чем могу помочь?</h1>
          <p>Модель работает на собственном сервере с RTX 5090</p>
        </div>
      ) : (
        <MessageList messages={messages} />
      )}
      <Composer busy={busy} onSend={send} onStop={stop} />
    </main>
  )
}
