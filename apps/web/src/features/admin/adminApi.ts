// Запросы админки к gateway: журнал запросов, запретные темы, проверка вопроса.
import type { AdminRequestsResponse, CheckResult, RulesConfig } from '@strela/shared'
import { API_BASE } from '../../shared/apiBase'

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}/api/admin${path}`, {
    ...init,
    headers: { 'content-type': 'application/json' },
    signal: AbortSignal.timeout(40_000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} ${(await res.text().catch(() => '')).slice(0, 200)}`)
  return (await res.json()) as T
}

export const fetchRequests = () => call<AdminRequestsResponse>('/requests').then((r) => r.requests)
export const fetchRules = () => call<RulesConfig>('/rules')
export const saveRules = (cfg: RulesConfig) =>
  call<RulesConfig>('/rules', { method: 'PUT', body: JSON.stringify(cfg) })
export const testRule = (text: string) =>
  call<CheckResult>('/rules/test', { method: 'POST', body: JSON.stringify({ text }) })

export function errText(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}
