// Вкладка «Запросы»: последние 50 вопросов — этапы обработки, ход мысли, ответ.
import { useCallback, useEffect, useState } from 'react'
import type { AdminRequestRecord } from '@strela/shared'
import { logClient } from '../diag/clientLog'
import { errText, fetchRequests } from './adminApi'
import RequestCard from './RequestCard'

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
        <p className="admin-note">Последние 50 запросов с момента запуска сервера. Ход мысли виден только здесь; названия технологий заменены на «Машинный интеллект».</p>
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
