// Проверка лимита строк для файлов, которые не видит ESLint (CSS, HTML).
// Потолок 400 — ошибка, ориентир 250 — предупреждение (см. CLAUDE.md).
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

const HARD = 400
const SOFT = 250
const EXT = new Set(['.css', '.html'])
const SKIP = new Set(['node_modules', 'dist', '.git'])

function walk(dir, out) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (EXT.has(extname(name))) out.push(p)
  }
  return out
}

let failed = false
for (const file of walk('apps', [])) {
  const lines = readFileSync(file, 'utf8').split('\n').length
  if (lines > HARD) {
    console.error(`ERROR ${file}: ${lines} lines (max ${HARD})`)
    failed = true
  } else if (lines > SOFT) {
    console.warn(`warn  ${file}: ${lines} lines (target ${SOFT})`)
  }
}
process.exit(failed ? 1 : 0)
