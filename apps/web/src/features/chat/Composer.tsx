// Поле ввода: растёт по высоте, Enter — отправить (на ПК), Shift+Enter — перенос строки.
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'

interface Props {
  busy: boolean
  onSend: (text: string) => void
  onStop: () => void
}

const MAX_HEIGHT_PX = 200
const isTouch = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches

function fitHeight(el: HTMLTextAreaElement | null) {
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT_PX)}px`
}

export default function Composer({ busy, onSend, onStop }: Props) {
  const [text, setText] = useState('')
  const ref = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => fitHeight(ref.current), [text])

  // Ширина поля меняется (стили догрузились, поворот экрана) — пересчитываем высоту.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let lastWidth = el.clientWidth
    const ro = new ResizeObserver(() => {
      if (el.clientWidth === lastWidth) return
      lastWidth = el.clientWidth
      fitHeight(el)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const submit = () => {
    if (busy || !text.trim()) return
    onSend(text.trim())
    setText('')
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // На телефоне Enter = новая строка, отправка — кнопкой.
    if (e.key === 'Enter' && !e.shiftKey && !isTouch && !e.nativeEvent.isComposing) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="composer">
      <div className="composer-box">
        <textarea
          ref={ref}
          rows={1}
          value={text}
          placeholder="Спросите что-нибудь…"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
        />
        {busy ? (
          <button className="send-btn" onClick={onStop} aria-label="Остановить">
            ■
          </button>
        ) : (
          <button className="send-btn" onClick={submit} disabled={!text.trim()} aria-label="Отправить">
            ↑
          </button>
        )}
      </div>
    </div>
  )
}
