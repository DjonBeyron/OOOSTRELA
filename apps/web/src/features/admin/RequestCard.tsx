// Карточка одного запроса в журнале: вопрос, лента этапов обработки, ход мысли по шагам, ответ.
import type { AdminRequestRecord } from '@strela/shared'
import { PaperclipIcon } from '../../shared/ui/icons'
import { describeCheck } from './describeCheck'

const STATUS_LABEL: Record<AdminRequestRecord['status'], string> = {
  ok: 'готово',
  error: 'ошибка',
  aborted: 'остановлен',
  blocked: 'заблокирован',
}

export default function RequestCard({ r }: { r: AdminRequestRecord }) {
  const steps = r.thinking ? r.thinking.split(/\n{2,}/).filter((p) => p.trim()) : []
  return (
    <article className={`admin-card is-${r.status}`}>
      <div className="admin-meta">
        {new Date(r.at).toLocaleString('ru-RU')} · {STATUS_LABEL[r.status]}
      </div>
      <div className="admin-prompt">{r.prompt}</div>
      {r.attachment && (
        <div className="admin-meta admin-file">
          <PaperclipIcon size={14} /> {r.attachment}
        </div>
      )}
      {!r.stages && r.check && r.check.action !== 'pass' && <div className="admin-block">{describeCheck(r.check)}</div>}

      {r.stages && (
        <ol className="admin-stages">
          {r.stages.map((s) => (
            <li key={s.title}>
              <span className="admin-stage-title">{s.title}</span>
              <span className="admin-stage-detail">{s.detail}</span>
            </li>
          ))}
        </ol>
      )}

      {steps.length > 0 && (
        <details className="admin-details">
          <summary>Ход мысли Машинного интеллекта — шагов: {steps.length}</summary>
          <ol className="admin-thought-steps">
            {steps.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ol>
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
