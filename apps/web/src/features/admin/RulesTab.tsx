// Вкладка «Темы и ответы»: запреты и заготовки ответов, общие переключатели, проверка вопроса.
// Сохранение — кнопкой.
import { useEffect, useState } from 'react'
import type { RuleKind, RulesConfig, TopicRule } from '@strela/shared'
import { newId } from '../history/historyStore'
import { errText, fetchRules, saveRules } from './adminApi'
import RuleCard from './RuleCard'
import RuleTester from './RuleTester'

export default function RulesTab() {
  const [cfg, setCfg] = useState<RulesConfig | null>(null)
  const [dirty, setDirty] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    fetchRules()
      .then(setCfg)
      .catch((err) => setStatus(`Не удалось загрузить: ${errText(err)}`))
  }, [])

  if (!cfg) return <section className="admin-body">{status ?? 'Загрузка…'}</section>

  const patch = (p: Partial<RulesConfig>) => {
    setCfg({ ...cfg, ...p })
    setDirty(true)
    setStatus(null)
  }
  const patchRule = (id: string, p: Partial<TopicRule>) =>
    patch({ rules: cfg.rules.map((r) => (r.id === id ? { ...r, ...p } : r)) })
  const addRule = (kind: RuleKind) =>
    patch({
      rules: [
        {
          id: newId(),
          kind,
          title: kind === 'block' ? 'Новый запрет' : 'Новая заготовка',
          enabled: true,
          keywords: [],
          description: '',
          reply: '',
          guideText: '',
        },
        ...cfg.rules,
      ],
    })

  const save = async () => {
    try {
      setCfg(await saveRules(cfg))
      setDirty(false)
      setStatus('Сохранено ✓')
    } catch (err) {
      setStatus(`Ошибка сохранения: ${errText(err)}`)
    }
  }

  return (
    <section className="admin-body">
      <div className="rules-savebar">
        <button className="btn btn-primary" disabled={!dirty} onClick={() => void save()}>
          Сохранить
        </button>
        <span className="admin-note">{status ?? (dirty ? 'Есть несохранённые изменения' : 'Все изменения сохранены')}</span>
      </div>

      <RuleTester dirty={dirty} />

      <div className="admin-card rules-global">
        <label className="rules-check">
          <input type="checkbox" checked={cfg.semanticCheck} onChange={(e) => patch({ semanticCheck: e.target.checked })} />
          <span>
            <b>Проверка по смыслу</b> — модель читает вопрос и решает, относится ли он к теме (+0.3–1 с к ответу)
          </span>
        </label>
        <label className="rules-check">
          <input type="checkbox" checked={cfg.systemGuard} onChange={(e) => patch({ systemGuard: e.target.checked })} />
          <span>
            <b>Скрытая инструкция модели</b> — «не обсуждай запретные темы», страховка, если проверки что-то пропустили
          </span>
        </label>
        <label className="rules-field">
          <span>Ответ на запретную тему по умолчанию</span>
          <textarea rows={2} value={cfg.defaultReply} onChange={(e) => patch({ defaultReply: e.target.value })} />
        </label>
      </div>

      <div className="admin-row">
        <h3 className="label-caps rules-title">Темы ({cfg.rules.filter((r) => r.enabled).length} вкл.)</h3>
        <div className="rules-add">
          <button className="btn" onClick={() => addRule('block')}>+ Запрет</button>
          <button className="btn" onClick={() => addRule('guide')}>+ Заготовка</button>
        </div>
      </div>
      {cfg.rules.map((r) => (
        <RuleCard
          key={r.id}
          rule={r}
          onChange={(p) => patchRule(r.id, p)}
          onRemove={() => {
            if (confirm(`Удалить тему «${r.title}»?`)) patch({ rules: cfg.rules.filter((x) => x.id !== r.id) })
          }}
        />
      ))}
    </section>
  )
}
