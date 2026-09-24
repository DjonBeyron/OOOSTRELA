// Текстовый дебаг-блок для копирования: пользователь присылает его в чат Claude целиком.
import { APP_VERSION, type DiagInfo } from '@strela/shared'
import { clientLogSnapshot } from './clientLog'

export function buildDebugText(diag: DiagInfo | null, diagError: string | null): string {
  const lines: string[] = []
  const add = (s = '') => lines.push(s)

  add(`=== STRELA DEBUG ${new Date().toISOString()} ===`)
  add(`web: v${APP_VERSION}  gateway: ${diag ? `v${diag.version}` : 'n/a'}`)
  add(`url: ${location.href}`)
  add(`ua: ${navigator.userAgent}`)
  add(`screen: ${innerWidth}x${innerHeight} dpr=${devicePixelRatio}`)
  add()

  if (!diag) {
    add(`!! /api/diag failed: ${diagError ?? 'unknown'}`)
  } else {
    const g = diag.gateway
    add(`[gateway] up=${g.uptimeSec}s node=${g.node} ${g.platform} listen=${g.listen} token=${g.tokenRequired}`)
    add(`[model] ${g.model} think=${g.think} via ${g.ollamaUrl}`)
    const o = diag.ollama
    add(o.ok ? `[ollama] v${o.version}` : `!! [ollama] ${o.error}`)
    for (const m of o.models) add(`  installed: ${m.name} ${m.sizeGb}GB`)
    for (const m of o.loaded) add(`  in VRAM:   ${m.name} ${m.vramGb}GB until ${m.expiresAt}`)
    if (!diag.gpu.ok) add(`!! [gpu] ${diag.gpu.error}`)
    for (const x of diag.gpu.gpus) {
      add(`[gpu] ${x.name} drv=${x.driver} mem=${x.memUsedMb}/${x.memTotalMb}MB util=${x.utilPct}% ${x.tempC}C`)
    }
    add()
    add('[requests] (newest first)')
    for (const r of diag.requests.slice(0, 10)) {
      const s = r.stats
      const info = s
        ? `total=${s.totalMs}ms first=${s.firstTokenMs}ms load=${s.loadMs}ms in=${s.promptTokens} out=${s.outputTokens} ${s.tokensPerSec}t/s think=${r.thinkingChars}ch`
        : (r.error ?? '')
      add(`  ${r.at} ${r.status} ${info}`)
    }
    add('[gateway errors]')
    for (const e of diag.errors.slice(0, 10)) add(`  ${e.at} ${e.where}: ${e.message}`)
  }

  add()
  add('[client log]')
  for (const e of clientLogSnapshot().slice(0, 20)) add(`  ${e.at} ${e.level}: ${e.text}`)
  add('=== END ===')
  return lines.join('\n')
}
