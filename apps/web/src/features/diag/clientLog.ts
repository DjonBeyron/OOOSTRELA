// Журнал событий браузера (ошибки JS, сбои запросов) — попадает в дебаг-блок.
export interface ClientLogEntry {
  at: string
  level: 'info' | 'warn' | 'error'
  text: string
}

const LIMIT = 50
const entries: ClientLogEntry[] = []

export function logClient(level: ClientLogEntry['level'], text: string) {
  entries.unshift({ at: new Date().toISOString(), level, text })
  if (entries.length > LIMIT) entries.length = LIMIT
  if (level !== 'info') console[level](`[client] ${text}`)
}

export function clientLogSnapshot(): ClientLogEntry[] {
  return [...entries]
}

export function installClientLog() {
  window.addEventListener('error', (e) => logClient('error', `js: ${e.message} @ ${e.filename}:${e.lineno}`))
  window.addEventListener('unhandledrejection', (e) => logClient('error', `promise: ${String(e.reason)}`))
  logClient('info', `start ${location.href}`)
}
