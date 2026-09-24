// Публичные настройки чата с сервера (например, разрешены ли файлы). Пока не пришли — всё закрыто.
import { useEffect, useState } from 'react'
import type { PublicSettings } from '@strela/shared'
import { API_BASE } from '../../shared/apiBase'
import { logClient } from '../diag/clientLog'

const CLOSED: PublicSettings = { filesAllowed: false }

export function usePublicSettings(): PublicSettings {
  const [settings, setSettings] = useState<PublicSettings>(CLOSED)

  useEffect(() => {
    fetch(`${API_BASE}/api/settings`, { signal: AbortSignal.timeout(10_000) })
      .then((r) => (r.ok ? (r.json() as Promise<PublicSettings>) : CLOSED))
      .then(setSettings)
      .catch((err) => logClient('warn', `settings: ${String(err)}`))
  }, [])

  return settings
}
