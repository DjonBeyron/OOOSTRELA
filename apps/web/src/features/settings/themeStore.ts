// Тема оформления: авто (как в системе), светлая, тёмная. Хранится в localStorage.
// На <html> всегда стоит data-theme="light" | "dark"; первичную установку до отрисовки
// делает inline-скрипт в index.html (тот же ключ KEY), здесь — смена и слежение за системой.
import { logClient } from '../diag/clientLog'

export type Theme = 'auto' | 'light' | 'dark'

const KEY = 'strela.theme.v1'
const systemDark = matchMedia('(prefers-color-scheme: dark)')

export function loadTheme(): Theme {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : 'auto'
  } catch {
    return 'auto'
  }
}

export function applyTheme(theme: Theme) {
  const dark = theme === 'dark' || (theme === 'auto' && systemDark.matches)
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
}

export function saveTheme(theme: Theme) {
  applyTheme(theme)
  try {
    localStorage.setItem(KEY, theme)
  } catch (err) {
    logClient('warn', `theme save failed: ${String(err)}`)
  }
}

/** В режиме «авто» переключаемся вслед за системой (например, вечером на телефоне). */
export function watchSystemTheme() {
  systemDark.addEventListener('change', () => applyTheme(loadTheme()))
}
