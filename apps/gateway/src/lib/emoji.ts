// Вырезает эмодзи из ответа модели (страховка к инструкции «без смайликов»).
// Флаги, пиктограммы, склейки (ZWJ), варианты начертания и «кнопочные» цифры.
const EMOJI = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{1F3FB}-\u{1F3FF}‍️⃣]/gu

export function stripEmoji(text: string): string {
  return text.replace(EMOJI, '')
}
