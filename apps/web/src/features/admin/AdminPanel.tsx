// Админ-панель (заготовка): последние запросы с рассуждениями модели. Открывается по #admin.
// Позже здесь же — стоп-правила и метрики; на этапе 2 закроем паролем.
import { useCallback, useEffect, useState } from 'react'
import type { AdminRequestRecord, AdminRequestsResponse } from '@strela/shared'
import { API_BASE } from '../../shared/apiBase'
import { logClient } from '../diag/clientLog'

const STATUS_LABEL: Record<AdminRequestRecord['status'], string> = {
  ok: 'готово',
  error: 'ошибка',
  aborted: 'остановлен',
}

export default function AdminPanel({ onClose }: { onClose: () => void }) {
  const [items, setItems] = useState<AdminRequestRecord[]>([])
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/requests`, { signal: AbortSignal.timeout(10000) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setItems(((await res.json()) as AdminRequestsResponse).requests)
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      logClient('error', `admin: ${message}`)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh()
  }, [refresh])

  return (
    <div className="admin">
      <header className="admin-head">
        <h2 className="label-caps">Админ · запросы</h2>
        <button className="btn" onClick={() => void refresh()}>Обновить</button>
        <button className="icon-btn" onClick={onClose} aria-label="Закрыть">×</button>
      </header>
      <p className="admin-note">
        Последние 50 запросов с момента запуска сервера. Рассуждения модели видны только здесь.
      </p>
      {error && <div className="msg-error">Не удалось загрузить: {error}</div>}
      {!error && items.length === 0 && <p className="admin-note">Запросов пока нет.</p>}
      <div className="admin-list">
        {items.map((r) => (
          <RequestCard key={r.id} r={r} />
        ))}
      </div>
    </div>
  )
}

function RequestCard({ r }: { r: AdminRequestRecord }) {
  const s = r.stats
  return (
    <article className={`admin-card is-${r.status}`}>
      <div className="admin-meta">
        {new Date(r.at).toLocaleString('ru-RU')} · {STATUS_LABEL[r.status]}
        {s && ` · ${(s.totalMs / 1000).toFixed(1)} с · первое слово ${((s.firstTokenMs ?? 0) / 1000).toFixed(1)} с · ${s.tokensPerSec} ток/с`}
      </div>
      <div className="admin-prompt">{r.prompt}</div>
      {r.thinking && (
        <details className="admin-thinking">
          <summary>Рассуждения ({r.thinking.length} симв.)</summary>
          <pre>{r.thinking}</pre>
        </details>
      )}
      {r.answer && (
        <details className="admin-answer">
          <summary>Ответ ({r.answer.length} симв.)</summary>
          <pre>{r.answer}</pre>
        </details>
      )}
      {r.error && <div className="msg-error">{r.error}</div>}
    </article>
  )
}
