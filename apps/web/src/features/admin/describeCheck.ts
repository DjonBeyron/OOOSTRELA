// Результат разбора вопроса по темам — человеческим языком (журнал запросов и «Проверить вопрос»).
import type { CheckResult } from '@strela/shared'

export function describeCheck(c: CheckResult): string {
  if (c.action === 'pass') {
    return c.semanticError
      ? `Обычный ответ: проверка по смыслу не сработала (${c.semanticError}) · ${c.ms} мс`
      : `Обычный ответ — ни одна тема не подошла · ${c.ms} мс`
  }
  const how = c.layer === 'keywords' ? `стоп-слово «${c.matched}»` : 'по смыслу'
  const what = c.action === 'block' ? '⛔ Запрет' : '📝 Заготовка'
  return `${what}: тема «${c.ruleTitle}», ${how} · ${c.ms} мс`
}
