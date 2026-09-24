// /api/admin/* — данные только для владельца (рассуждения модели, тексты запросов).
// TODO этап 2: закрыть паролем ADMIN_PASSWORD, когда gateway станет доступен из интернета.
import { Hono } from 'hono'
import type { AdminRequestsResponse } from '@strela/shared'
import { adminRequests } from '../lib/metrics'

export const adminRoute = new Hono()

adminRoute.get('/admin/requests', (c) => {
  const body: AdminRequestsResponse = { requests: adminRequests() }
  return c.json(body)
})
