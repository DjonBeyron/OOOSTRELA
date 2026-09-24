// Настройки пользователя: тема и очистка истории. Открываются кнопкой внизу боковой шторки.
import { useState } from 'react'
import { APP_VERSION } from '@strela/shared'
import { loadTheme, saveTheme, type Theme } from './themeStore'

const THEMES: { value: Theme; label: string }[] = [
  { value: 'auto', label: 'Как в системе' },
  { value: 'light', label: 'Светлая' },
  { value: 'dark', label: 'Тёмная' },
]

interface Props {
  onClose: () => void
  onClearHistory: () => void
}

export default function SettingsPanel({ onClose, onClearHistory }: Props) {
  const [theme, setTheme] = useState<Theme>(loadTheme)

  const pick = (t: Theme) => {
    setTheme(t)
    saveTheme(t)
  }

  const clear = () => {
    if (confirm('Удалить всю историю чатов на этом устройстве?')) {
      onClearHistory()
      onClose()
    }
  }

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <section className="sheet" onClick={(e) => e.stopPropagation()}>
        <header className="sheet-head">
          <h2 className="label-caps">Настройки</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Закрыть">×</button>
        </header>

        <div className="settings-group">
          <div className="settings-label label-caps">Тема</div>
          <div className="segmented">
            {THEMES.map((t) => (
              <button
                key={t.value}
                className={theme === t.value ? 'is-active' : ''}
                onClick={() => pick(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="settings-group">
          <div className="settings-label label-caps">История</div>
          <button className="btn btn-danger" onClick={clear}>Очистить всю историю</button>
        </div>

        <div className="settings-version">Версия {APP_VERSION}</div>
      </section>
    </div>
  )
}
