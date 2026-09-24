// Выбор модели над полем ввода. Меню: название + одна строка описания.
// Подробное описание простыми словами — при наведении мышкой или двойном нажатии на пункт.
// Заглушки серые: выбрать нельзя, но одно нажатие сразу показывает описание.
import { useEffect, useRef, useState } from 'react'
import { MODELS, type ModelInfo } from './modelCatalog'

const DOUBLE_TAP_MS = 350
const canHover = typeof matchMedia !== 'undefined' && matchMedia('(hover: hover)').matches

interface Props {
  value: ModelInfo
  onChange: (m: ModelInfo) => void
}

export default function ModelPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [infoId, setInfoId] = useState<ModelInfo['id'] | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const lastTap = useRef<{ id: string; at: number } | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Нажатие мимо меню закрывает его.
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close()
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  useEffect(() => () => clearTimeout(closeTimer.current), [])

  function close() {
    clearTimeout(closeTimer.current)
    setOpen(false)
    setInfoId(null)
  }

  function tap(m: ModelInfo) {
    const now = Date.now()
    const isDouble = lastTap.current?.id === m.id && now - lastTap.current.at < DOUBLE_TAP_MS
    lastTap.current = { id: m.id, at: now }

    if (isDouble || !m.available) {
      clearTimeout(closeTimer.current)
      setInfoId(m.id)
      return
    }
    onChange(m)
    // Ждём, не будет ли второго нажатия (тогда покажем описание вместо закрытия).
    closeTimer.current = setTimeout(close, DOUBLE_TAP_MS)
  }

  const info = MODELS.find((m) => m.id === infoId)

  return (
    <div className="model-picker" ref={rootRef}>
      <button
        className="model-current label-caps"
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
      >
        {value.name} <span aria-hidden="true">▾</span>
      </button>

      {open && (
        <div className="model-menu" role="listbox">
          {MODELS.map((m) => (
            <button
              key={m.id}
              role="option"
              aria-selected={m.id === value.id}
              aria-disabled={!m.available}
              className={`model-item${m.available ? '' : ' is-stub'}${m.id === value.id ? ' is-active' : ''}`}
              onClick={() => tap(m)}
              onMouseEnter={canHover ? () => setInfoId(m.id) : undefined}
              onMouseLeave={canHover ? () => setInfoId(null) : undefined}
            >
              <span className="model-name label-caps">
                {m.name}
                {m.id === value.id && <span className="model-check"> ✓</span>}
              </span>
              <span className="model-short">{m.short}</span>
            </button>
          ))}
          <div className="model-hint">
            {canHover ? 'Наведите на модель, чтобы узнать подробнее' : 'Нажмите дважды на модель, чтобы узнать подробнее'}
          </div>
          {info && (
            <div className="model-info" role="tooltip">
              <div className="model-info-title label-caps">{info.name}</div>
              <p>{info.about}</p>
              {!canHover && (
                <button className="btn" onClick={() => setInfoId(null)}>Понятно</button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
