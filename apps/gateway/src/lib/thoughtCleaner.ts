// Чистит ход мысли модели для журнала админки: вырезает фразы, где модель проговаривает скрытые
// правила («проверяю, чтобы не было упоминания нейросети, версий… нет эмодзи»). Такие фразы
// раскрывают, как настроен Машинный интеллект, — в журнал они не попадают.

const META: RegExp[] = [
  /нейросет/i,
  /(^|[^а-яё])модел[ьиеюя]/i,
  /(^|[^а-яё])верси[яиюй]/i,
  /эмодзи|смайл/i,
  /инструкц/i,
  /промпт/i,
  /предоставленн[а-яё]* (данн|сведен|информац)/i,
  /не (упомина|называ|раскрыва)/i,
  /разработчик/i,
  /оборудован/i,
  /офисн[а-яё]* стил/i,
  /(скрыт|системн)[а-яё]* (правил|сообщен|указан)/i,
  /\b(emoji|emojis|instructions?|system prompt|prompt|guidelines?|developer|hardware|versions?)\b/i,
  /\bthe model\b/i,
]

/** Делим на фразы, не теряя абзацы: абзац → предложения → фильтр → склеиваем обратно. */
export function cleanThinking(text: string): { text: string; removed: number } {
  let removed = 0
  const paragraphs = text
    .split(/\n{2,}|\n(?=\s*(?:\d+[.)]|[-*•])\s)/)
    .map((p) => {
      const sentences = p.split(/(?<=[.!?…])\s+/)
      let hits = 0
      const kept = sentences.filter((s) => {
        const hit = s.trim() !== '' && META.some((re) => re.test(s))
        if (hit) hits++
        return !hit
      })
      removed += hits
      const rest = kept.join(' ').trim()
      // От вычищенного абзаца остался обрывок («Всё правильно.») — убираем и его.
      if (hits > 0 && rest.length < 30) return ''
      return rest
    })
    .filter(Boolean)
  return { text: paragraphs.join('\n\n'), removed }
}

/** Шаги хода мысли для журнала — по абзацам. */
export function thinkingSteps(text: string): number {
  return text ? text.split(/\n{2,}/).filter((p) => p.trim()).length : 0
}
