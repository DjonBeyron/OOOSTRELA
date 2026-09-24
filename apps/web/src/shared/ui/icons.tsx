// Линейные иконки интерфейса (вместо эмодзи — строже и в цвет бренда через currentColor).
// Контур скрепки — из набора Lucide (лицензия ISC).
interface IconProps {
  size?: number
  className?: string
}

/** Знак запрета: круг с косой чертой. */
export function ProhibitedIcon({ size = 56, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={2} />
      <path d="m4.93 4.93 14.14 14.14" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
    </svg>
  )
}

export function PaperclipIcon({ size = 20, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  )
}
