// Вкладка «Запросы»: последние 50 вопросов с ответами, рассуждениями и причиной блокировки.
import { useCallback, useEffect, useState } from 'react'
import type { AdminRequestRecord } from '@strela/shared'
import { logClient } from '../diag/clientLog'
import { errText, fetchRequests } from './adminApi'
import { describeCheck } from './describeCheck'

const STATUS_LABEL: Record<AdminRequestRecord['status'], string> = {
  ok: 'готово',
  error: 'ошибка',
  aborted: 'остановлен',
  blocked: 'заблокирован',
}

export default function RequestsTab() {
  const [items, setItems] = useState<AdminRequestRecord[]>([])
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setItems(await fetchRequests())
      setError(null)
    } catch (err) {
      setError(errText(err))
      logClient('error', `admin requests: ${errText(err)}`)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh()
  }, [refresh])

  return (
    <section className="admin-body">
      <div className="admin-row">
        <p className="admin-note">Последние 50 запросов с момента запуска сервера. Рассуждения видны только здесь.</p>
        <button className="btn" onClick={() => void refresh()}>Обновить</button>
      </div>
      {error && <div className="msg-error">Не удалось загрузить: {error}</div>}
      {!error && items.length === 0 && <p className="admin-note">Запросов пока нет.</p>}
      {items.map((r) => (
        <RequestCard key={r.id} r={r} />
      ))}
    </section>
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
      {r.attachment && <div className="admin-meta">📎 {r.attachment}</div>}
      {r.check && r.check.action !== 'pass' && <div className="admin-block">{describeCheck(r.check)}</div>}
      {r.thinking && (
        <details className="admin-details">
          <summary>Рассуждения ({r.thinking.length} симв.)</summary>
          <pre>{r.thinking}</pre>
        </details>
      )}
      {r.answer && (
        <details className="admin-details">
          <summary>Ответ ({r.answer.length} симв.)</summary>
          <pre>{r.answer}</pre>
        </details>
      )}
      {r.error && <div className="msg-error">{r.error}</div>}
    </article>
  )
}
