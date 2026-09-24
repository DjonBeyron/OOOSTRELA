// GET /api/settings — публичные настройки для чата (что пользователю можно). Без тем и базы знаний.
import { Hono } from 'hono'
import type { PublicSettings } from '@strela/shared'
import { getRules } from '../lib/rulesStore'

export const settingsRoute = new Hono()

settingsRoute.get('/settings', (c) => {
  const body: PublicSettings = { filesAllowed: getRules().filesAllowed }
  return c.json(body)
})
