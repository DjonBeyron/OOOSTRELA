// Индикатор ответа — стрелка в цвет бренда (символ «Стрелы»).
//   thinking — модель думает: стрелка смотрит влево и «натягивается», как тетива.
//   writing  — модель пишет: стрелка плавно поворачивается вниз и пульсирует вниз.
// Один и тот же элемент меняет класс, поэтому поворот между режимами анимируется.
export default function TypingArrow({ mode }: { mode: 'thinking' | 'writing' }) {
  return (
    <span
      className={`typing-arrow is-${mode}`}
      role="status"
      aria-label={mode === 'thinking' ? 'Думает' : 'Пишет ответ'}
    >
      <svg viewBox="-20 -20 40 40" width="32" height="32" aria-hidden="true">
        <g className="typing-arrow-motion">
          <path className="typing-arrow-trail" d="M-17 0h7" />
          <path className="typing-arrow-body" d="M-7 0h20m-6-6 6 6-6 6" />
        </g>
      </svg>
    </span>
  )
}
