// Боковая панель: «Новый чат» и список прошлых чатов. На телефоне — выезжающая шторка.
import type { Conversation } from './historyStore'

interface Props {
  open: boolean
  list: Conversation[]
  activeId: string | null
  onSelect: (id: string | null) => void
  onRemove: (id: string) => void
  onClose: () => void
}

export default function Sidebar({ open, list, activeId, onSelect, onRemove, onClose }: Props) {
  const pick = (id: string | null) => {
    onSelect(id)
    onClose()
  }

  return (
    <>
      <div className={`sidebar-backdrop${open ? ' is-open' : ''}`} onClick={onClose} />
      <aside className={`sidebar${open ? ' is-open' : ''}`}>
        <button className="btn btn-primary sidebar-new label-caps" onClick={() => pick(null)}>
          + Новый чат
        </button>
        {list.length > 0 && <div className="sidebar-heading label-caps">История</div>}
        <nav className="sidebar-list">
          {list.length === 0 && <p className="sidebar-empty">Здесь появится история</p>}
          {list.map((c) => (
            <div key={c.id} className={`sidebar-item${c.id === activeId ? ' is-active' : ''}`}>
              <button className="sidebar-title" onClick={() => pick(c.id)} title={c.title}>
                {c.title}
              </button>
              <button
                className="icon-btn sidebar-del"
                aria-label="Удалить чат"
                onClick={() => {
                  if (confirm(`Удалить чат «${c.title}»?`)) onRemove(c.id)
                }}
              >
                ×
              </button>
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}
