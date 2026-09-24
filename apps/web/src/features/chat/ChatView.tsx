// Экран чата: приветствие (если чат пустой) или лента сообщений, выбор модели и поле ввода.
import { useState } from 'react'
import type { ConversationsStore } from '../history/useConversations'
import { DEFAULT_MODEL } from '../models/modelCatalog'
import ModelPicker from '../models/ModelPicker'
import Composer from './Composer'
import MessageList from './MessageList'
import { useChat } from './useChat'
import { usePublicSettings } from './usePublicSettings'

export default function ChatView({ store }: { store: ConversationsStore }) {
  const { busy, send, stop } = useChat(store)
  // Пока работает только текстовая модель; видео и фото — заглушки (выбрать нельзя).
  const [model, setModel] = useState(DEFAULT_MODEL)
  const { filesAllowed } = usePublicSettings()
  const messages = store.active?.messages ?? []

  return (
    <main className="chat">
      {messages.length === 0 ? (
        <div className="chat-empty">
          <h1>Чем могу помочь?</h1>
        </div>
      ) : (
        <MessageList messages={messages} />
      )}
      <div className="chat-tools">
        <ModelPicker value={model} onChange={setModel} />
      </div>
      <Composer busy={busy} filesAllowed={filesAllowed} onSend={send} onStop={stop} />
    </main>
  )
}
