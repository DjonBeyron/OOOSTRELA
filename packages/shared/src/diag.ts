// Контракт диагностики: GET /api/diag. Всё, что нужно для удалённой отладки ПК с 5090.
import type { ChatStats } from './chat'

export interface GpuInfo {
  name: string
  driver: string
  memUsedMb: number
  memTotalMb: number
  utilPct: number
  tempC: number
}

export interface OllamaModel {
  name: string
  sizeGb: number
}

export interface OllamaLoaded {
  name: string
  vramGb: number
  expiresAt: string
}

export interface RequestRecord {
  at: string
  status: 'ok' | 'error' | 'aborted'
  stats?: ChatStats
  error?: string
}

export interface ErrorRecord {
  at: string
  where: string
  message: string
}

export interface DiagInfo {
  version: string
  time: string
  gateway: {
    uptimeSec: number
    node: string
    platform: string
    listen: string
    model: string
    ollamaUrl: string
    tokenRequired: boolean
  }
  ollama: {
    ok: boolean
    version?: string
    error?: string
    models: OllamaModel[]
    loaded: OllamaLoaded[]
  }
  gpu: {
    ok: boolean
    error?: string
    gpus: GpuInfo[]
  }
  requests: RequestRecord[]
  errors: ErrorRecord[]
}
