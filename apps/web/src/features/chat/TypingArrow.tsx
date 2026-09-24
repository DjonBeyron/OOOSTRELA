// Индикатор «модель пишет»: минималистичная стрелка в цвет бренда, летящая вправо (символ «Стрелы»).
export default function TypingArrow() {
  return (
    <span className="typing-arrow" role="status" aria-label="Пишет ответ">
      <svg viewBox="0 0 40 16" width="40" height="16" aria-hidden="true">
        <path className="typing-arrow-trail" d="M2 8h10" />
        <path className="typing-arrow-body" d="M14 8h20m-6-5 6 5-6 5" />
      </svg>
    </span>
  )
}
