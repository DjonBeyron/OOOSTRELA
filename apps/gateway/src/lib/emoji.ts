// Вырезает эмодзи из ответа модели (страховка к инструкции «без смайликов»).
// Пиктограммы, флаги, оттенки кожи, склейки (ZWJ), варианты начертания и «кнопочные» цифры.
const EMOJI =
  /\p{Extended_Pictographic}|[\u{1F1E6}-\u{1F1FF}]|[\u{1F3FB}-\u{1F3FF}]|\u{200D}|\u{FE0F}|\u{20E3}/gu

export function stripEmoji(text: string): string {
  return text.replace(EMOJI, '')
}

/** Сколько эмодзи-символов в тексте (для журнала: сколько вырезано). */
export function countEmoji(text: string): number {
  return (text.match(EMOJI) ?? []).length
}
