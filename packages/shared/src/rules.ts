// Темы (админка): запреты и заготовки ответов. Хранятся на ПК в apps/gateway/data/rules.json,
// позже — в Cloudflare D1. Вопрос проверяется в слоях: стоп-слова → смысл (моделью) → инструкция модели.

export type RuleKind = 'block' | 'guide'

export interface TopicRule {
  id: string
  /** block — не отвечать; guide — ответить своими словами по заготовке админа. */
  kind: RuleKind
  title: string
  enabled: boolean
  /** Корни слов (быстрый слой 1). Необязательно: смысл ловит слой 2 по описанию. */
  keywords: string[]
  /** Описание темы простыми словами — по нему модель узнаёт вопрос в любой формулировке. */
  description: string
  /** block: что увидит пользователь (пусто — ответ по умолчанию). */
  reply: string
  /** guide: сведения, которые модель перескажет своими словами. */
  guideText: string
}

export interface RulesConfig {
  rules: TopicRule[]
  /** Слой 2: смысловая проверка вопроса моделью перед ответом (+0.3–1 с). */
  semanticCheck: boolean
  /** Слой 3: добавлять модели скрытую инструкцию «не обсуждай запретные темы». */
  systemGuard: boolean
  /** Ответ пользователю на запретную тему по умолчанию. */
  defaultReply: string
  /** База знаний о компании: всегда лежит в скрытой инструкции, модель отвечает по ней своими словами. */
  knowledge: string
  /** Можно ли пользователям прикреплять файлы (по умолчанию нет — нужно согласование с директором). */
  filesAllowed: boolean
  /** Запретить модели смайлики: инструкция + вырезание эмодзи из ответа на сервере. */
  noEmoji: boolean
}

/** Публичные настройки для чата (GET /api/settings) — без тем и базы знаний. */
export interface PublicSettings {
  filesAllowed: boolean
}

export type CheckLayer = 'keywords' | 'semantic'

export interface CheckResult {
  action: 'pass' | 'block' | 'guide'
  layer?: CheckLayer
  ruleId?: string
  ruleTitle?: string
  /** Для стоп-слов — какое слово сработало. */
  matched?: string
  /** block: текст отказа для пользователя. */
  reply?: string
  ms: number
  /** Смысловая проверка не выполнилась (модель недоступна) — вопрос пропущен. */
  semanticError?: string
}

export interface RuleTestRequest {
  text: string
}
