import type { PlacedModule } from '../../types'
import { MODULE_MAP } from '../../data'
import { displayTag } from '../../lib/tags'
import { useI18n } from '../../i18n'
import { localizedModuleName } from '../../i18n/catalog'

interface Props {
  modules: PlacedModule[]
  selectedId: string | null
  onSelect: (id: string) => void
  onSetLabel: (instanceId: string, label: string) => void
}

export function TagsPanel({ modules, selectedId, onSelect, onSetLabel }: Props) {
  const { t } = useI18n()

  if (modules.length === 0) {
    return (
      <section className="panel-section tags-panel">
        <h3>{t('tags.title')}</h3>
        <p className="hint">{t('tags.empty')}</p>
      </section>
    )
  }

  const sorted = [...modules].sort((a, b) => {
    const railA = a.railId.localeCompare(b.railId)
    return railA !== 0 ? railA : a.position - b.position
  })

  return (
    <section className="panel-section tags-panel">
      <h3>{t('tags.titleCount', { count: modules.length })}</h3>
      <p className="hint">{t('tags.hint')}</p>
      <ul className="tags-list">
        {sorted.map((mod) => {
          const spec = MODULE_MAP[mod.specId]
          if (!spec) return null
          const tag = displayTag(mod.label, spec)
          const name = localizedModuleName(spec, t)
          return (
            <li
              key={mod.instanceId}
              className={`tags-list-item ${selectedId === mod.instanceId ? 'selected' : ''}`}
            >
              <button
                type="button"
                className="tags-list-select"
                onClick={() => onSelect(mod.instanceId)}
                title={`${name} · ${mod.railId}`}
              >
                <span className="tags-list-tag">{tag}</span>
                <span className="tags-list-spec">{name}</span>
              </button>
              <input
                className="tags-list-input"
                value={mod.label ?? ''}
                onChange={(e) => onSetLabel(mod.instanceId, e.target.value)}
                placeholder={tag}
                onClick={() => onSelect(mod.instanceId)}
              />
            </li>
          )
        })}
      </ul>
    </section>
  )
}
