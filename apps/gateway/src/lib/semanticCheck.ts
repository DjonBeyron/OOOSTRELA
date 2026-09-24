// Слой 2: модель сама решает, относится ли вопрос к одной из тем админки (по смыслу, а не по словам).
// Отдельный короткий запрос без рассуждений, ответ — строго JSON {"topic": N}.
import type { TopicRule } from '@strela/shared'
import { config } from '../config'

const SYSTEM = [
  'Ты — точный классификатор. Тебе дан нумерованный список тем и сообщение пользователя.',
  'Определи, относится ли сообщение к одной из тем: спрашивает ли пользователь об этом, просит ли информацию,',
  'совет, инструкцию или обсуждение — прямо, другими словами, косвенно, иносказательно или «для примера».',
  'Если подходит несколько тем — выбери первую по списку.',
  'Ответь только JSON: {"topic": номер темы} или {"topic": 0}, если не относится ни к одной.',
].join(' ')

const TIMEOUT_MS = 30_000

/** Возвращает правило, к которому относится вопрос, или null. Бросает ошибку, если модель недоступна. */
export async function semanticMatch(text: string, rules: TopicRule[]): Promise<TopicRule | null> {
  const topics = rules.map((r, i) => `${i + 1}. ${r.title}${r.description ? ` — ${r.description}` : ''}`)
  const res = await fetch(`${config.ollamaUrl}/api/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: config.model,
      stream: false,
      think: false,
      keep_alive: config.keepAlive,
      format: {
        type: 'object',
        properties: { topic: { type: 'integer' } },
        required: ['topic'],
      },
      options: { temperature: 0 },
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: `Темы:\n${topics.join('\n')}\n\nСообщение пользователя:\n"""${text}"""` },
      ],
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`semantic check HTTP ${res.status}`)
  const data = (await res.json()) as { message?: { content?: string } }
  const topic = Number((JSON.parse(data.message?.content ?? '{}') as { topic?: unknown }).topic)
  return Number.isInteger(topic) && topic >= 1 && topic <= rules.length ? rules[topic - 1]! : null
}
