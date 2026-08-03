import type { ModuleSpec } from '../../types'
import { EBOARD_GROUP_ORDER, MODULE_CATALOG } from '../../data'
import type { EboardGroup } from '../../types'
import { ModuleIcon } from '../icons/ModuleIcons'
import { useI18n } from '../../i18n'
import {
  localizedModuleDescription,
  localizedModuleName,
  localizedEboardGroup,
} from '../../i18n/catalog'
import { EBOARD_GROUP_LABELS } from '../../data'

interface Props {
  phaseCount: 1 | 2 | 3
  dragSpecId: string | null
  onDragSpec: (specId: string | null) => void
}

export function ComponentLibrary({ phaseCount, dragSpecId, onDragSpec }: Props) {
  const { t } = useI18n()

  const primary = MODULE_CATALOG.filter(
    (m) => m.eboardPrimary && m.phases.includes(phaseCount)
  )

  const grouped = EBOARD_GROUP_ORDER.reduce(
    (acc, group) => {
      const items = primary.filter((m) => m.eboardGroup === group)
      if (items.length > 0) acc[group] = items
      return acc
    },
    {} as Record<EboardGroup, ModuleSpec[]>
  )

  const presetCount = MODULE_CATALOG.filter(
    (m) => m.libraryHidden && !m.eboardPrimary && m.phases.includes(phaseCount)
  ).length

  return (
    <section className="panel-section library">
      <h3>{t('library.title')}</h3>
      <p className="hint">
        {t('library.hint')}
        {presetCount > 0 && t('library.presets', { count: presetCount })}
      </p>
      {EBOARD_GROUP_ORDER.map((group) => {
        const items = grouped[group]
        if (!items?.length) return null
        return (
          <div key={group} className="category-group">
            <h4>{localizedEboardGroup(group, t, EBOARD_GROUP_LABELS[group])}</h4>
            <div className="module-list">
              {items.map((mod) => (
                <ModuleBtn
                  key={mod.id}
                  mod={mod}
                  active={dragSpecId === mod.id}
                  onDragSpec={onDragSpec}
                />
              ))}
            </div>
          </div>
        )
      })}
    </section>
  )
}

function ModuleBtn({
  mod,
  active,
  onDragSpec,
}: {
  mod: ModuleSpec
  active: boolean
  onDragSpec: (specId: string | null) => void
}) {
  const { t } = useI18n()
  const name = localizedModuleName(mod, t)
  const description = localizedModuleDescription(mod, t)

  const meta = [
    mod.eboardCode,
    mod.ratedCurrent ? `${mod.ratedCurrent}A` : null,
    mod.curve,
    mod.sensitivityMa ? `${mod.sensitivityMa}mA` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <div
      className={`module-btn ${active ? 'active' : ''}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/shield-module', mod.id)
        e.dataTransfer.effectAllowed = 'copy'
        onDragSpec(mod.id)
      }}
      onDragEnd={() => onDragSpec(null)}
      onClick={() => onDragSpec(active ? null : mod.id)}
      title={description}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onDragSpec(active ? null : mod.id)
      }}
    >
      <ModuleIcon type={mod.icon} size={24} />
      <span className="mod-name">{name}</span>
      <span className="mod-width">
        {mod.widthModules}
        {t('library.widthMod')}
        {meta ? ` · ${meta}` : ''}
      </span>
    </div>
  )
}
