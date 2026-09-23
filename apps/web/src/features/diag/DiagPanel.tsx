// Панель диагностики: состояние ПК/модели и кнопка «Скопировать дебаг».
import { useCallback, useEffect, useState } from 'react'
import { APP_VERSION, type DiagInfo } from '@strela/shared'
import { API_BASE } from '../../shared/apiBase'
import { buildDebugText } from './buildDebugText'
import { logClient } from './clientLog'

export default function DiagPanel({ onClose }: { onClose: () => void }) {
  const [diag, setDiag] = useState<DiagInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/diag`, { signal: AbortSignal.timeout(10000) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setDiag((await res.json()) as DiagInfo)
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      logClient('error', `diag: ${message}`)
    }
  }, [])

  useEffect(() => {
    // Первая загрузка сразу при открытии панели, потом — только по кнопке.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh()
  }, [refresh])

  const text = buildDebugText(diag, error)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Без https (например, по IP в локальной сети) clipboard недоступен — выделяем текст.
      const pre = document.querySelector('.diag-text')
      if (pre) getSelection()?.selectAllChildren(pre)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const gpu = diag?.gpu.gpus[0]
  return (
    <div className="diag-overlay" onClick={onClose}>
      <section className="diag" onClick={(e) => e.stopPropagation()}>
        <header className="diag-head">
          <h2>Диагностика</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Закрыть">×</button>
        </header>
        <div className="diag-summary">
          <Status ok={!error && !!diag} label={error ? `Gateway: ${error}` : 'Gateway на связи'} />
          <Status ok={!!diag?.ollama.ok} label={diag?.ollama.ok ? `Ollama ${diag.ollama.version}` : 'Ollama недоступна'} />
          <Status
            ok={!!diag?.ollama.loaded.length}
            label={diag?.ollama.loaded.length ? `В памяти: ${diag.ollama.loaded[0]?.name}` : 'Модель не загружена (загрузится при первом вопросе)'}
          />
          {gpu && <Status ok label={`${gpu.name}: ${gpu.memUsedMb}/${gpu.memTotalMb} МБ, ${gpu.tempC}°C`} />}
          {diag && !diag.gpu.ok && <Status ok={false} label={`GPU не читается: ${diag.gpu.error}`} />}
          {diag && diag.version !== APP_VERSION && (
            <Status ok={false} label={`Версии разные: сайт v${APP_VERSION}, gateway v${diag.version} — перезапустите start.ps1`} />
          )}
        </div>
        <div className="diag-actions">
          <button className="btn" onClick={() => void refresh()}>Обновить</button>
          <button className="btn btn-primary" onClick={() => void copy()}>
            {copied ? 'Скопировано' : 'Скопировать дебаг'}
          </button>
        </div>
        <pre className="diag-text">{text}</pre>
      </section>
    </div>
  )
}

function Status({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="diag-status">
      <span className={`diag-dot ${ok ? 'ok' : 'bad'}`} />
      {label}
    </div>
  )
}
