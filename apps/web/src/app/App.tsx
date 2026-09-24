// Каркас приложения: шапка, боковая панель с историей, чат.
// Диагностика скрыта от пользователей: открывается только по адресу с #diag (для владельца).
import { useEffect, useState } from 'react'
import { APP_VERSION } from '@strela/shared'
import ChatView from '../features/chat/ChatView'
import DiagPanel from '../features/diag/DiagPanel'
import Sidebar from '../features/history/Sidebar'
import { useConversations } from '../features/history/useConversations'

const DIAG_HASH = '#diag'

export default function App() {
  const store = useConversations()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [diagOpen, setDiagOpen] = useState(() => location.hash === DIAG_HASH)

  useEffect(() => {
    const onHash = () => setDiagOpen(location.hash === DIAG_HASH)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const closeDiag = () => {
    history.replaceState(null, '', location.pathname + location.search)
    setDiagOpen(false)
  }

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
          <div className="topbar-brand label-caps">
            <img className="topbar-logo" src="/logo.png" alt="Стрела" width={95} height={28} />
            AI <span className="app-version">v{APP_VERSION}</span>
          </div>
        </header>
        <ChatView store={store} />
      </div>
      {diagOpen && <DiagPanel onClose={closeDiag} />}
    </div>
  )
}
