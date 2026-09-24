// Одна тема админки: запрет или заготовка ответа. Вкл/выкл, название, описание, стоп-слова, текст.
import { useState } from 'react'
import type { RuleKind, TopicRule } from '@strela/shared'

interface Props {
  rule: TopicRule
  onChange: (p: Partial<TopicRule>) => void
  onRemove: () => void
}

const toList = (s: string) => s.split(/[,\n;]/).map((k) => k.trim()).filter(Boolean)

const KINDS: { value: RuleKind; label: string }[] = [
  { value: 'block', label: '⛔ Запрет' },
  { value: 'guide', label: '📝 Заготовка ответа' },
]

export default function RuleCard({ rule, onChange, onRemove }: Props) {
  // Стоп-слова редактируем как текст (чтобы можно было спокойно набирать запятые), наверх — списком.
  const [keywordsText, setKeywordsText] = useState(rule.keywords.join(', '))

  return (
    <article className={`admin-card rule-card is-${rule.kind}${rule.enabled ? '' : ' is-off'}`}>
      <div className="rule-head">
        <label className="rules-check">
          <input type="checkbox" checked={rule.enabled} onChange={(e) => onChange({ enabled: e.target.checked })} />
          <span>{rule.enabled ? 'Включена' : 'Выключена'}</span>
        </label>
        <button className="icon-btn" onClick={onRemove} aria-label="Удалить тему" title="Удалить тему">
          🗑
        </button>
      </div>

      <div className="segmented">
        {KINDS.map((k) => (
          <button key={k.value} className={rule.kind === k.value ? 'is-active' : ''} onClick={() => onChange({ kind: k.value })}>
            {k.label}
          </button>
        ))}
      </div>

      <label className="rules-field">
        <span>Название (для вас)</span>
        <input value={rule.title} onChange={(e) => onChange({ title: e.target.value })} />
      </label>

      <label className="rules-field">
        <span>
          Описание темы простыми словами — главное поле: по нему модель узнаёт вопрос в любой формулировке.
          Перечислять все варианты не нужно, достаточно описать смысл.
        </span>
        <textarea rows={3} value={rule.description} onChange={(e) => onChange({ description: e.target.value })} />
      </label>

      {rule.kind === 'guide' ? (
        <label className="rules-field">
          <span>Что ответить — модель перескажет своими словами, каждый раз немного по-разному</span>
          <textarea rows={4} value={rule.guideText} onChange={(e) => onChange({ guideText: e.target.value })} />
        </label>
      ) : (
        <label className="rules-field">
          <span>Что увидит пользователь (пусто — ответ по умолчанию)</span>
          <textarea rows={2} value={rule.reply} onChange={(e) => onChange({ reply: e.target.value })} />
        </label>
      )}

      <label className="rules-field">
        <span>Стоп-слова через запятую (необязательно) — срабатывают мгновенно. Пишите корень: «наркот» поймает и «наркотики»</span>
        <textarea
          rows={2}
          value={keywordsText}
          onChange={(e) => {
            setKeywordsText(e.target.value)
            onChange({ keywords: toList(e.target.value) })
          }}
        />
      </label>
    </article>
  )
}
