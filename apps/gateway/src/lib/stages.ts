// Лента этапов обработки запроса для журнала админки: вход → фильтр → правила → размышление →
// фильтр выхода → ответ. Только для владельца; реальные названия технологий сюда не попадают.
import type { ChatStats, CheckResult, RequestStage, RequestStatus } from '@strela/shared'
import { getRules } from './rulesStore'

export interface StageInput {
  status: RequestStatus
  prompt: string
  attachment?: string
  check?: CheckResult
  thinkingSteps: number
  removedThoughts: number
  emojiRemoved: number
  answer: string
  stats?: ChatStats
}

const sec = (ms: number) => `${(ms / 1000).toFixed(1)} с`

function describeInput(check?: CheckResult): string {
  if (!check) return 'не выполнен'
  const how = check.layer === 'keywords' ? `по стоп-слову «${check.matched}»` : 'по смыслу'
  const time = ` · ${check.ms} мс`
  if (check.action === 'block') return `запрет «${check.ruleTitle}», ${how}${time}`
  if (check.action === 'guide') return `заготовка «${check.ruleTitle}», ${how}${time}`
  const note = check.semanticError ? ' (проверка по смыслу не выполнилась)' : ''
  return `пропущен — запретных тем нет${note}${time}`
}

function describeRules(check?: CheckResult): string {
  const cfg = getRules()
  const parts = ['личность «Машинный интеллект»']
  if (cfg.knowledge) parts.push(`база данных о компании (${cfg.knowledge.length} симв.)`)
  const blocks = cfg.rules.filter((r) => r.enabled && r.kind === 'block').length
  if (cfg.systemGuard && blocks > 0) parts.push(`запретных тем: ${blocks}`)
  if (check?.action === 'guide') parts.push(`заготовка «${check.ruleTitle}»`)
  if (cfg.noEmoji) parts.push('строгий стиль')
  return parts.join(' · ')
}

export function buildStages(i: StageInput): RequestStage[] {
  const file = i.attachment ? ` + файл «${i.attachment}»` : ''
  const stages: RequestStage[] = [
    { title: '1. Вопрос получен', detail: `${i.prompt.length} симв.${file}` },
    { title: '2. Фильтр входа', detail: describeInput(i.check) },
  ]
  if (i.status === 'blocked') {
    stages.push({ title: '3. Отказ', detail: 'вопрос не передан Машинному интеллекту, отправлен текст отказа' })
    return stages
  }

  stages.push({ title: '3. Правила подключены', detail: describeRules(i.check) })

  const first = i.stats?.firstTokenMs != null ? ` · первое слово через ${sec(i.stats.firstTokenMs)}` : ''
  stages.push({
    title: '4. Размышление',
    detail: i.thinkingSteps > 0 ? `шагов: ${i.thinkingSteps}${first}` : `без отдельного размышления${first}`,
  })

  const cleaned: string[] = []
  if (i.removedThoughts > 0) cleaned.push(`из хода мысли убрано служебных фраз: ${i.removedThoughts}`)
  if (i.emojiRemoved > 0) cleaned.push(`вырезано смайликов: ${i.emojiRemoved}`)
  cleaned.push('названия технологий заменены')
  stages.push({ title: '5. Фильтр выхода', detail: cleaned.join(' · ') })

  const s = i.stats
  const speed = s ? ` · всего ${sec(s.totalMs)} · ${s.tokensPerSec} ток/с` : ''
  const final =
    i.status === 'ok' ? '6. Ответ отправлен' : i.status === 'aborted' ? '6. Остановлено пользователем' : '6. Ошибка'
  stages.push({ title: final, detail: `${i.answer.length} симв.${speed}` })
  return stages
}
