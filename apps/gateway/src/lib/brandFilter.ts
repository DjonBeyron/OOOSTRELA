// Прячет названия реальной нейросети, её разработчика и движка — в журнале админки
// везде «Машинный интеллект» (см. CLAUDE.md: секретность модели и железа).
const REAL_NAMES =
  /(alibaba[\s-]*cloud|alibaba|qwen[\w.:-]*|tongyi(?:[\s-]*qianwen)?|通义千问|通义|千问|阿里巴巴|阿里云|ollama|алибаб[а-яё]*|квен[а-яё]*)/gi

export const BRAND = 'Машинный интеллект'

export function maskModelNames(text: string): string {
  return text.replace(REAL_NAMES, BRAND)
}
