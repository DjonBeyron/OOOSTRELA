// «Проверить вопрос»: прогон текста через темы админки без отправки в модель на ответ.
import { useState } from 'react'
import type { CheckResult } from '@strela/shared'
import { errText, testRule } from './adminApi'
import { describeCheck } from './describeCheck'

export default function RuleTester({ dirty }: { dirty: boolean }) {
  const [text, setText] = useState('')
  const [result, setResult] = useState<CheckResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const run = async () => {
    if (!text.trim()) return
    setBusy(true)
    setError(null)
    try {
      setResult(await testRule(text))
    } catch (err) {
      setError(errText(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-card rule-tester">
      <label className="rules-field">
        <span>Проверить вопрос — какая тема сработает (запрет, заготовка или обычный ответ)</span>
        <input
          value={text}
          placeholder="Например: ты вообще кто такой?"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && void run()}
        />
      </label>
      <div className="admin-row">
        <button className="btn" disabled={busy || !text.trim()} onClick={() => void run()}>
          {busy ? 'Проверяю…' : 'Проверить'}
        </button>
        {dirty && <span className="admin-note">Проверяются сохранённые правила — сначала нажмите «Сохранить»</span>}
      </div>
      {error && <div className="msg-error">{error}</div>}
      {result && !error && (
        <div className={`rule-result is-${result.action}`}>{describeCheck(result)}</div>
      )}
    </div>
  )
}
