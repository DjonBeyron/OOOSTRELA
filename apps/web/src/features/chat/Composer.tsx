// Поле ввода: растёт по высоте, Enter — отправить (на ПК), Shift+Enter — перенос строки.
// Скрепка — прикрепить текстовый файл (модель прочитает его вместе с вопросом).
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import type { ChatAttachment } from '@strela/shared'
import { logClient } from '../diag/clientLog'
import { ACCEPT, readAttachment } from './fileAttach'

interface Props {
  busy: boolean
  onSend: (text: string, attachment?: ChatAttachment) => void
  onStop: () => void
}

const MAX_HEIGHT_PX = 200
const isTouch = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches
/** Если к файлу не написали вопрос. */
const DEFAULT_FILE_QUESTION = 'Прочитай этот файл и кратко расскажи, что в нём.'

function fitHeight(el: HTMLTextAreaElement | null) {
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT_PX)}px`
}

export default function Composer({ busy, onSend, onStop }: Props) {
  const [text, setText] = useState('')
  const [file, setFile] = useState<ChatAttachment | null>(null)
  const [note, setNote] = useState<{ text: string; error: boolean } | null>(null)
  const ref = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

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

  const canSend = !busy && (text.trim() !== '' || file !== null)

  const submit = () => {
    if (!canSend) return
    onSend(text.trim() || DEFAULT_FILE_QUESTION, file ?? undefined)
    setText('')
    setFile(null)
    setNote(null)
  }

  const pickFile = async (f: File | undefined) => {
    if (fileRef.current) fileRef.current.value = '' // чтобы можно было выбрать тот же файл снова
    if (!f) return
    try {
      const { attachment, truncated } = await readAttachment(f)
      setFile(attachment)
      setNote(truncated ? { text: 'Файл длинный — модель прочитает только начало (~40 страниц).', error: false } : null)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setNote({ text: message, error: true })
      logClient('warn', `attach: ${message}`)
    }
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
      {(file || note) && (
        <div className="composer-attach">
          {file && (
            <span className="file-chip">
              📎 {file.name}
              <button className="file-chip-del" onClick={() => setFile(null)} aria-label="Убрать файл">×</button>
            </span>
          )}
          {note && <span className={`composer-note${note.error ? ' is-error' : ''}`}>{note.text}</span>}
        </div>
      )}
      <div className="composer-box">
        <button className="attach-btn" onClick={() => fileRef.current?.click()} aria-label="Прикрепить файл" title="Прикрепить файл">
          📎
        </button>
        <input ref={fileRef} type="file" accept={ACCEPT} hidden onChange={(e) => void pickFile(e.target.files?.[0])} />
        <textarea
          ref={ref}
          rows={1}
          value={text}
          placeholder={file ? 'Что сделать с файлом?' : 'Спросите что-нибудь…'}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
        />
        {busy ? (
          <button className="send-btn" onClick={onStop} aria-label="Остановить">
            ■
          </button>
        ) : (
          <button className="send-btn" onClick={submit} disabled={!canSend} aria-label="Отправить">
            ↑
          </button>
        )}
      </div>
    </div>
  )
}
