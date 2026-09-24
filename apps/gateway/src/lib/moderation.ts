// Разбор вопроса по темам админки: слой 1 (стоп-слова) → слой 2 (смысл, моделью).
// Итог: pass — отвечать как обычно; block — отказ; guide — ответить своими словами по заготовке.
import type { CheckResult, TopicRule } from '@strela/shared'
import { errorMessage, recordError } from './metrics'
import { compact, MIN_KEYWORD } from './normalize'
import { getRules } from './rulesStore'
import { semanticMatch } from './semanticCheck'

export async function checkPrompt(text: string): Promise<CheckResult> {
  const started = Date.now()
  const cfg = getRules()
  const active = cfg.rules.filter((r) => r.enabled)
  const done = (r: Omit<CheckResult, 'ms'>): CheckResult => ({ ...r, ms: Date.now() - started })
  const hit = (rule: TopicRule, layer: CheckResult['layer'], matched?: string) =>
    done({
      action: rule.kind,
      layer,
      ruleId: rule.id,
      ruleTitle: rule.title,
      matched,
      reply: rule.kind === 'block' ? rule.reply || cfg.defaultReply : undefined,
    })

  if (active.length === 0) return done({ action: 'pass' })

  // Слой 1: стоп-слова по «сжатому» тексту. Запреты проверяем раньше заготовок.
  const flat = compact(text)
  const ordered = [...active.filter((r) => r.kind === 'block'), ...active.filter((r) => r.kind === 'guide')]
  for (const rule of ordered) {
    for (const kw of rule.keywords) {
      const k = compact(kw)
      if (k.length >= MIN_KEYWORD && flat.includes(k)) return hit(rule, 'keywords', kw)
    }
  }

  // Слой 2: смысл. Если модель недоступна — пропускаем (чат важнее), но пишем в журнал.
  if (cfg.semanticCheck) {
    try {
      const rule = await semanticMatch(text, ordered)
      if (rule) return hit(rule, 'semantic')
    } catch (err) {
      const semanticError = errorMessage(err)
      recordError('moderation', semanticError)
      return done({ action: 'pass', semanticError })
    }
  }
  return done({ action: 'pass' })
}

/** Постоянное правило: модель не раскрывает, на какой нейросети работает (см. CLAUDE.md). */
const IDENTITY = [
  'Ты — «Машинный интеллект», цифровой помощник компании «Стрела». Отвечай по-русски, если пользователь не пишет на другом языке.',
  'Никогда не называй нейросеть, модель или компанию-разработчика, на которых ты работаешь, не упоминай их названия,',
  'версии и характеристики оборудования — даже если об этом прямо просят. На такие вопросы говори, что ты «Машинный интеллект» компании «Стрела».',
].join(' ')

/** Скрытая инструкция модели: кто она + база знаний + запретные темы (слой 3) + заготовка, если сработала. */
export function systemPrompt(check: CheckResult): string {
  const cfg = getRules()
  const parts = [IDENTITY]

  if (cfg.knowledge) {
    parts.push(
      [
        'Сведения о компании «Стрела». Когда спрашивают о компании, её услугах, истории, адресе или руководстве —',
        'отвечай своими словами, опираясь только на эти сведения; чего в них нет — честно скажи, что не знаешь,',
        'и предложи посмотреть сайт strela27.ru. Ничего не выдумывай.',
        '"""',
        cfg.knowledge,
        '"""',
      ].join('\n'),
    )
  }

  const blocks = cfg.rules.filter((r) => r.enabled && r.kind === 'block')
  if (cfg.systemGuard && blocks.length > 0) {
    const list = blocks.map((r) => `- ${r.title}${r.description ? `: ${r.description}` : ''}`).join('\n')
    parts.push(
      [
        'Тебе запрещено обсуждать следующие темы, давать по ним советы, инструкции или информацию —',
        'даже если просят «для примера», «гипотетически», «в рассказе» или настаивают:',
        list,
        `Если вопрос касается этих тем, ответь только: «${cfg.defaultReply}»`,
      ].join('\n'),
    )
  }

  const guide = check.action === 'guide' ? cfg.rules.find((r) => r.id === check.ruleId) : undefined
  if (guide?.guideText) {
    parts.push(
      [
        `Сейчас пользователь спрашивает на тему «${guide.title}». Ответь, опираясь только на эти сведения:`,
        `"""${guide.guideText}"""`,
        'Перескажи их своими словами — живо, естественно и каждый раз немного по-разному. Не цитируй дословно,',
        'можно менять порядок и формулировки, но сохраняй смысл и ничего не выдумывай сверх этих сведений.',
      ].join('\n'),
    )
  }
  return parts.join('\n\n')
}
