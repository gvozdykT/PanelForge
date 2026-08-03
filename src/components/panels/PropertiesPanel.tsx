import { useMemo } from 'react'
import type { PhaseCount, PlacedModule, WireConnection } from '../../types'
import { MODULE_MAP, WIRE_COLORS } from '../../data'
import {
  LOAD_TAG_KEYS,
  SYSTEM_TAG_KEYS,
  suggestDefaultTag,
} from '../../lib/tags'
import { getReplaceOptions } from '../../lib/replaceModule'
import { ModuleIcon } from '../icons/ModuleIcons'
import { useI18n } from '../../i18n'
import { localizedModuleDescription, localizedModuleName, localizedTag } from '../../i18n/catalog'

interface Props {
  module: PlacedModule
  wiresCount: number
  phaseCount: PhaseCount
  railLengthMm: number
  allModules: PlacedModule[]
  wires: WireConnection[]
  onClose: () => void
  onRemove: () => void
  onRemoveWire: (wireId: string) => void
  onSetLabel: (label: string) => void
  onReplace: (newSpecId: string) => void
  connectedWires: { id: string; label: string }[]
}

export function PropertiesPanel({
  module,
  wiresCount,
  phaseCount,
  railLengthMm,
  allModules,
  wires,
  onClose,
  onRemove,
  connectedWires,
  onRemoveWire,
  onSetLabel,
  onReplace,
}: Props) {
  const { t } = useI18n()
  const spec = MODULE_MAP[module.specId]
  if (!spec) return null

  const presetKeys =
    spec.category === 'mcb' || spec.category === 'rcbo' ? LOAD_TAG_KEYS : SYSTEM_TAG_KEYS

  const replaceOptions = useMemo(
    () => getReplaceOptions(module.specId, module.instanceId, phaseCount, allModules, wires, railLengthMm),
    [module.specId, module.instanceId, phaseCount, allModules, wires, railLengthMm]
  )

  const hasAlternatives = replaceOptions.some((o) => o.spec.id !== module.specId)
  const defaultTag = suggestDefaultTag(spec)

  return (
    <div className="properties">
      <p>{localizedModuleDescription(spec, t)}</p>
      {spec.manufacturer && (
        <p className="meta">
          {t('properties.manufacturer')} {spec.manufacturer}
        </p>
      )}
      {spec.ratedCurrent && (
        <p className="meta">
          {t('properties.rating')} {spec.ratedCurrent}A {spec.curve && `· ${spec.curve}`}
          {spec.sensitivityMa && ` · ${spec.sensitivityMa}mA`}
          {spec.rcdType && ` · ${t('properties.type')} ${spec.rcdType}`}
          {spec.breakingKa && ` · ${spec.breakingKa}kA`}
          {spec.spdClass && ` · ${t('properties.class')} ${spec.spdClass}`}
          {spec.eboardCode && ` · ${spec.eboardCode}`}
        </p>
      )}
      <p className="meta">
        {t('properties.position')} {module.position / 18} {t('properties.modUnit')} ·{' '}
        {t('properties.connections')} {wiresCount}
      </p>

      {hasAlternatives && (
        <div className="replace-module">
          <h4>{t('properties.replaceTitle')}</h4>
          <p className="replace-hint">{t('properties.replaceHint')}</p>
          <div className="replace-list" role="listbox" aria-label={t('properties.replaceTitle')}>
            {replaceOptions.map(({ spec: candidate, fits, wireLoss }) => {
              const isCurrent = candidate.id === module.specId
              const disabled = isCurrent || !fits
              const candidateName = localizedModuleName(candidate, t)

              return (
                <button
                  key={candidate.id}
                  type="button"
                  role="option"
                  aria-selected={isCurrent}
                  className={`replace-item ${isCurrent ? 'current' : ''} ${!fits ? 'no-fit' : ''}`}
                  disabled={disabled}
                  title={
                    isCurrent
                      ? t('properties.currentModule')
                      : !fits
                        ? t('properties.noFit')
                        : wireLoss > 0
                          ? t('properties.wiresLost', { count: wireLoss })
                          : localizedModuleDescription(candidate, t)
                  }
                  onClick={() => onReplace(candidate.id)}
                >
                  <ModuleIcon type={candidate.icon} size={22} />
                  <span className="replace-item-name">{candidateName}</span>
                  <span className="replace-item-meta">
                    {candidate.widthModules}
                    {t('library.widthMod')}
                    {candidate.ratedCurrent && ` · ${candidate.ratedCurrent}A`}
                    {candidate.curve && ` ${candidate.curve}`}
                  </span>
                  {isCurrent && <span className="replace-badge">{t('properties.badgeNow')}</span>}
                  {!isCurrent && wireLoss > 0 && fits && (
                    <span className="replace-warn">
                      {t('properties.badgeWires', { count: wireLoss })}
                    </span>
                  )}
                  {!fits && !isCurrent && (
                    <span className="replace-warn">{t('properties.badgeNoFit')}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="tag-editor">
        <h4>{t('properties.tagTitle')}</h4>
        <input
          className="tag-input"
          value={module.label ?? ''}
          onChange={(e) => onSetLabel(e.target.value)}
          placeholder={defaultTag}
          maxLength={48}
        />
        <div className="tag-presets">
          {presetKeys.slice(0, 8).map((key) => {
            const label = localizedTag(
              t,
              spec.category === 'mcb' || spec.category === 'rcbo' ? 'load' : 'system',
              key
            )
            return (
              <button
                key={key}
                type="button"
                className={`tag-chip ${module.label === label ? 'active' : ''}`}
                onClick={() => onSetLabel(label)}
              >
                {label}
              </button>
            )
          })}
        </div>
        <button
          type="button"
          className="btn-small tag-reset"
          onClick={() => onSetLabel(defaultTag)}
        >
          {t('properties.defaultTag', { tag: defaultTag })}
        </button>
      </div>

      <div className="terminals">
        <h4>{t('properties.terminals')}</h4>
        {spec.terminals.map((term) => {
          const color = WIRE_COLORS.find((w) => w.role === term.role)
          return (
            <div key={term.id} className="terminal-row">
              <span
                className="wire-swatch small"
                style={{
                  background:
                    term.role === 'PE'
                      ? 'repeating-linear-gradient(90deg, #FFD700 0 2px, #00AA44 2px 4px)'
                      : color?.color,
                }}
              />
              <span>{term.role}</span>
              <span>
                {term.position === 'top' ? t('properties.terminalIn') : t('properties.terminalOut')}
              </span>
            </div>
          )
        })}
      </div>

      {connectedWires.length > 0 && (
        <div className="wires-list">
          <h4>{t('properties.connectionsTitle')}</h4>
          {connectedWires.map((w) => (
            <div key={w.id} className="wire-row">
              <span>{w.label}</span>
              <button type="button" className="btn-small" onClick={() => onRemoveWire(w.id)}>
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <button className="btn-danger" onClick={onRemove}>
        {t('properties.removeModule')}
      </button>
      <button type="button" className="btn-secondary" onClick={onClose}>
        {t('properties.close')}
      </button>
    </div>
  )
}
