// /api/admin/* — данные только для владельца: запросы с рассуждениями и запретные темы.
// TODO этап 2: закрыть паролем ADMIN_PASSWORD, когда gateway станет доступен из интернета.
import { Hono } from 'hono'
import type { AdminRequestsResponse, RuleTestRequest } from '@strela/shared'
import { adminRequests, errorMessage } from '../lib/metrics'
import { checkPrompt } from '../lib/moderation'
import { getRules, saveRules } from '../lib/rulesStore'

export const adminRoute = new Hono()

adminRoute.get('/admin/requests', (c) => {
  const body: AdminRequestsResponse = { requests: adminRequests() }
  return c.json(body)
})

adminRoute.get('/admin/rules', (c) => c.json(getRules()))

adminRoute.put('/admin/rules', async (c) => {
  try {
    return c.json(saveRules(await c.req.json()))
  } catch (err) {
    return c.json({ error: errorMessage(err) }, 500)
  }
})

/** «Проверить вопрос»: прогоняет текст через те же слои, что и чат, но в модель не отправляет. */
adminRoute.post('/admin/rules/test', async (c) => {
  const body = await c.req.json<RuleTestRequest>().catch(() => null)
  if (!body?.text?.trim()) return c.json({ error: 'text required' }, 400)
  return c.json(await checkPrompt(body.text))
})
