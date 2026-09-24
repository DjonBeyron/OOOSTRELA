// Отделяет рассуждения модели (<think>…</think>) от ответа прямо в потоке.
// Теги могут прийти разрезанными между кусками, поэтому хвост, похожий на начало тега, придерживаем.
// «Сиротский» </think> без открывающего (шаблон некоторых моделей) = всё до него было рассуждением.

const OPEN = '<think>'
const CLOSE = '</think>'

export type Segment =
  | { type: 'content'; text: string }
  | { type: 'thinking'; text: string }
  /** Встречен </think> без <think>: text — остаток рассуждения; уже отданный ответ тоже был рассуждением. */
  | { type: 'orphanClose'; text: string }

export class ThinkSplitter {
  private inThink = false
  private buf = ''

  push(text: string): Segment[] {
    this.buf += text
    const out: Segment[] = []
    for (;;) {
      const open = this.inThink ? -1 : this.buf.indexOf(OPEN)
      const close = this.buf.indexOf(CLOSE)
      const isOpen = open >= 0 && (close < 0 || open < close)

      if (isOpen) {
        emit(out, 'content', this.buf.slice(0, open))
        this.buf = this.buf.slice(open + OPEN.length)
        this.inThink = true
      } else if (close >= 0) {
        const part = this.buf.slice(0, close)
        if (this.inThink) emit(out, 'thinking', part)
        else out.push({ type: 'orphanClose', text: part })
        this.buf = this.buf.slice(close + CLOSE.length)
        this.inThink = false
      } else {
        const keep = Math.max(partialTail(this.buf, CLOSE), this.inThink ? 0 : partialTail(this.buf, OPEN))
        emit(out, this.inThink ? 'thinking' : 'content', this.buf.slice(0, this.buf.length - keep))
        this.buf = this.buf.slice(this.buf.length - keep)
        return out
      }
    }
  }

  flush(): Segment[] {
    const out: Segment[] = []
    emit(out, this.inThink ? 'thinking' : 'content', this.buf)
    this.buf = ''
    return out
  }
}

function emit(out: Segment[], type: 'content' | 'thinking', text: string) {
  if (text) out.push({ type, text })
}

/** Сколько последних символов строки совпадают с началом тега (возможный разрезанный тег). */
function partialTail(s: string, tag: string): number {
  for (let n = Math.min(tag.length - 1, s.length); n > 0; n--) {
    if (tag.startsWith(s.slice(-n))) return n
  }
  return 0
}
