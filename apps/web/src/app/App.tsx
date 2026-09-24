// Каркас приложения: шапка, боковая панель с историей, чат.
// Служебные экраны скрыты от пользователей и открываются только по адресу:
//   #diag  — диагностика (железо, модель, дебаг-блок для Claude)
//   #admin — админка (запросы и рассуждения модели)
import { useEffect, useState } from 'react'
import { APP_VERSION } from '@strela/shared'
import AdminPanel from '../features/admin/AdminPanel'
import ChatView from '../features/chat/ChatView'
import DiagPanel from '../features/diag/DiagPanel'
import Sidebar from '../features/history/Sidebar'
import { useConversations } from '../features/history/useConversations'
import SettingsPanel from '../features/settings/SettingsPanel'

export default function App() {
  const store = useConversations()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [hash, setHash] = useState(() => location.hash)

  useEffect(() => {
    const onHash = () => setHash(location.hash)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const closeHidden = () => {
    history.replaceState(null, '', location.pathname + location.search)
    setHash('')
  }

  return (
    <div className="app">
      <Sidebar
        open={sidebarOpen}
        list={store.list}
        activeId={store.activeId}
        onSelect={store.select}
        onRemove={store.remove}
        onOpenSettings={() => {
          setSidebarOpen(false)
          setSettingsOpen(true)
        }}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="app-main">
        <header className="topbar">
          <button className="icon-btn topbar-menu" onClick={() => setSidebarOpen(true)} aria-label="Меню">
            ☰
          </button>
          <div className="topbar-brand label-caps">
            <img className="topbar-logo" src="/logo.png" alt="Стрела" width={95} height={28} />
            <span className="topbar-text">
              <span className="topbar-title">Машинный интеллект</span>
              <span className="app-version">v{APP_VERSION}</span>
            </span>
          </div>
        </header>
        <ChatView store={store} />
      </div>
      {settingsOpen && (
        <SettingsPanel onClose={() => setSettingsOpen(false)} onClearHistory={store.clearAll} />
      )}
      {hash === '#diag' && <DiagPanel onClose={closeHidden} />}
      {hash === '#admin' && <AdminPanel onClose={closeHidden} />}
    </div>
  )
}
