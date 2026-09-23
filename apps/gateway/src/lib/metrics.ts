// Последние запросы и ошибки в памяти — для /api/diag. После перезапуска gateway пусто.
import type { ErrorRecord, RequestRecord } from '@strela/shared'

const LIMIT = 20
const requests: RequestRecord[] = []
const errors: ErrorRecord[] = []

function push<T>(list: T[], item: T) {
  list.unshift(item)
  if (list.length > LIMIT) list.length = LIMIT
}

export function recordRequest(record: Omit<RequestRecord, 'at'>) {
  push(requests, { at: new Date().toISOString(), ...record })
}

export function recordError(where: string, message: string) {
  push(errors, { at: new Date().toISOString(), where, message })
  console.error(`[${where}] ${message}`)
}

export function snapshot() {
  return { requests: [...requests], errors: [...errors] }
}

export function errorMessage(err: unknown): string {
  if (err instanceof Error) {
    const cause = err.cause instanceof Error ? ` (${err.cause.message})` : ''
    return err.message + cause
  }
  return String(err)
}
