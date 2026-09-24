// Админ-панель (#admin): вкладки «Запросы» и «Темы и ответы». На этапе 2 закроем паролем.
import { useState } from 'react'
import RequestsTab from './RequestsTab'
import RulesTab from './RulesTab'

type Tab = 'requests' | 'rules'

export default function AdminPanel({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('requests')

  return (
    <div className="admin">
      <header className="admin-head">
        <h2 className="label-caps">Админ</h2>
        <button className="icon-btn" onClick={onClose} aria-label="Закрыть">×</button>
      </header>
      <nav className="admin-tabs segmented">
        <button className={tab === 'requests' ? 'is-active' : ''} onClick={() => setTab('requests')}>
          Запросы
        </button>
        <button className={tab === 'rules' ? 'is-active' : ''} onClick={() => setTab('rules')}>
          Темы и ответы
        </button>
      </nav>
      {tab === 'requests' ? <RequestsTab /> : <RulesTab />}
    </div>
  )
}
