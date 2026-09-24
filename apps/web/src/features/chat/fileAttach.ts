// Чтение прикреплённого файла в текст. Модель МС 1.5 понимает только текст, поэтому пока —
// текстовые форматы. PDF и Word — следующим шагом (нужно извлечение текста).
import type { ChatAttachment } from '@strela/shared'

const TEXT_EXT = [
  'txt', 'md', 'csv', 'tsv', 'json', 'xml', 'html', 'htm', 'log', 'yaml', 'yml', 'ini', 'rtf',
  'js', 'ts', 'tsx', 'jsx', 'py', 'java', 'cs', 'cpp', 'c', 'h', 'sql', 'css', 'ps1', 'sh', 'bat',
]

export const ACCEPT = TEXT_EXT.map((e) => `.${e}`).join(',')

/** Столько символов модель прочитает (~40 страниц); остальное отрезаем и предупреждаем. */
export const MAX_FILE_CHARS = 60_000
const MAX_FILE_BYTES = 2_000_000

export interface ReadResult {
  attachment: ChatAttachment
  truncated: boolean
}

export async function readAttachment(file: File): Promise<ReadResult> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'pdf' || ext === 'doc' || ext === 'docx') {
    throw new Error('PDF и Word пока не поддерживаются — скоро добавим. Сейчас можно текстовые файлы (.txt, .md, .csv…).')
  }
  if (!TEXT_EXT.includes(ext)) {
    throw new Error('Можно прикрепить только текстовый файл: .txt, .md, .csv, .json и подобные.')
  }
  if (file.size > MAX_FILE_BYTES) throw new Error('Файл слишком большой — больше 2 МБ.')

  const text = decode(await file.arrayBuffer()).replace(/\r\n/g, '\n')
  if (!text.trim()) throw new Error('Файл пустой.')
  return {
    attachment: { name: file.name, text: text.slice(0, MAX_FILE_CHARS) },
    truncated: text.length > MAX_FILE_CHARS,
  }
}

/** UTF-8, а если в тексте «битые» символы — пробуем Windows-1251 (частый случай для русских .txt). */
function decode(buf: ArrayBuffer): string {
  const utf8 = new TextDecoder('utf-8').decode(buf)
  const broken = (utf8.match(/�/g) ?? []).length
  if (broken === 0 || broken < utf8.length / 1000) return utf8
  return new TextDecoder('windows-1251').decode(buf)
}
