// Темы на диске ПК: apps/gateway/data/rules.json (не в git). Читаются один раз, держатся в памяти.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { randomUUID } from 'node:crypto'
import type { RulesConfig, TopicRule } from '@strela/shared'
import { errorMessage, recordError } from './metrics'

const FILE = 'data/rules.json'

const DEFAULT_REPLY = 'Извините, на эту тему я не могу отвечать. Спросите, пожалуйста, о чём-нибудь другом.'

const DEFAULTS: RulesConfig = {
  semanticCheck: true,
  systemGuard: true,
  defaultReply: DEFAULT_REPLY,
  rules: [
    {
      id: 'who-are-you',
      kind: 'guide',
      title: 'Кто ты?',
      enabled: true,
      keywords: [],
      description:
        'Пользователь спрашивает, кто ты, как тебя зовут, что ты за программа, кто тебя сделал, на чём ты работаешь, что ты умеешь.',
      reply: '',
      guideText:
        'Я — «Машинный интеллект», цифровой помощник компании «Стрела». Сейчас отвечаю на вопросы, помогаю разобраться в сложном и объясняю простыми словами. Я развиваюсь в сторону мультимодальности: готовятся два кластера генерации — фотографии и видео природы.',
    },
    {
      id: 'plans-history',
      kind: 'guide',
      title: 'Планы и история разработки',
      enabled: true,
      keywords: [],
      description:
        'Пользователь спрашивает, когда и как тебя создали, сколько времени идёт разработка, на чём и как тебя обучали, какие у тебя планы, что ты будешь уметь в будущем, будешь ли создавать фото, картинки или видео.',
      reply: '',
      guideText:
        'Разработка «Машинного интеллекта» началась около года назад в компании «Стрела». Следующий большой шаг — мультимодальность: создаются два кластера генерации — фотографии природы и видео природы. Обучение проходит в закрытой среде на собственной базе видеоматериалов компании — в ней уже около 10 тысяч единиц контента. Пока эти возможности готовятся, я отвечаю на вопросы текстом.',
    },
    {
      id: 'example-block',
      kind: 'block',
      title: 'Пример: наркотики',
      enabled: false,
      keywords: ['наркот', 'закладк'],
      description: 'Где купить, как изготовить или употреблять наркотики и запрещённые вещества.',
      reply: '',
      guideText: '',
    },
  ],
}

let cache: RulesConfig | null = null

export function getRules(): RulesConfig {
  if (cache) return cache
  try {
    cache = sanitize(JSON.parse(readFileSync(FILE, 'utf8')))
  } catch {
    cache = DEFAULTS
  }
  return cache
}

export function saveRules(input: unknown): RulesConfig {
  const next = sanitize(input)
  try {
    mkdirSync(dirname(FILE), { recursive: true })
    writeFileSync(FILE, JSON.stringify(next, null, 2), 'utf8')
  } catch (err) {
    recordError('rules', `save failed: ${errorMessage(err)}`)
    throw err
  }
  cache = next
  return next
}

/** Всё, что пришло из админки, приводим к правильной форме — битый файл не должен ронять чат. */
function sanitize(input: unknown): RulesConfig {
  const o = (input ?? {}) as Partial<RulesConfig>
  const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
  const rules: TopicRule[] = (Array.isArray(o.rules) ? o.rules : []).slice(0, 200).map((r) => ({
    id: str(r?.id, 64) || randomUUID(),
    kind: r?.kind === 'guide' ? 'guide' : 'block',
    title: str(r?.title, 120) || 'Без названия',
    enabled: r?.enabled !== false,
    keywords: (Array.isArray(r?.keywords) ? r.keywords : [])
      .map((k) => str(k, 60))
      .filter(Boolean)
      .slice(0, 200),
    description: str(r?.description, 1000),
    reply: str(r?.reply, 1000),
    guideText: str(r?.guideText, 4000),
  }))
  return {
    rules,
    semanticCheck: o.semanticCheck !== false,
    systemGuard: o.systemGuard !== false,
    defaultReply: str(o.defaultReply, 1000) || DEFAULT_REPLY,
  }
}
