// Каркас приложения: шапка, боковая панель с историей, чат, панель диагностики.
import { useState } from 'react'
import { APP_VERSION } from '@strela/shared'
import ChatView from '../features/chat/ChatView'
import DiagPanel from '../features/diag/DiagPanel'
import Sidebar from '../features/history/Sidebar'
import { useConversations } from '../features/history/useConversations'

export default function App() {
  const store = useConversations()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [diagOpen, setDiagOpen] = useState(false)

  return (
    <div className="app">
      <Sidebar
        open={sidebarOpen}
        list={store.list}
        activeId={store.activeId}
        onSelect={store.select}
        onRemove={store.remove}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="app-main">
        <header className="topbar">
          <button className="icon-btn topbar-menu" onClick={() => setSidebarOpen(true)} aria-label="Меню">
            ☰
          </button>
          <div className="topbar-brand">
            Strela AI <span className="app-version">v{APP_VERSION}</span>
          </div>
          <button className="icon-btn" onClick={() => setDiagOpen(true)} aria-label="Диагностика" title="Диагностика">
            ⚙
          </button>
        </header>
        <ChatView store={store} />
      </div>
      {diagOpen && <DiagPanel onClose={() => setDiagOpen(false)} />}
    </div>
  )
}
