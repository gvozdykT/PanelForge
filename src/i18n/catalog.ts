import type { EnclosureSpec, ModuleSpec } from '../types'
import type { TFunction } from './types'

function polesLabel(spec: ModuleSpec): string {
  return spec.poles === 2 && spec.category === 'rcbo' ? '1P+N' : `${spec.poles}P`
}

function moduleOverride(t: TFunction, specId: string, field: 'name' | 'description'): string | null {
  const value = t(`modules.${specId}.${field}`, undefined, '')
  return value || null
}

export function localizedModuleName(spec: ModuleSpec, t: TFunction): string {
  const override = moduleOverride(t, spec.id, 'name')
  if (override) return override

  const p = polesLabel(spec)

  switch (spec.category) {
    case 'mcb':
      return t('catalog.mcb', {
        poles: p,
        curve: spec.curve ?? 'C',
        current: spec.ratedCurrent ?? '?',
      })
    case 'rcd':
      return t('catalog.rcd', {
        poles: p,
        current: spec.ratedCurrent ?? '?',
        sensitivity: spec.sensitivityMa ?? 30,
      })
    case 'rcbo':
      return t('catalog.rcbo', {
        poles: p,
        curve: spec.curve ?? 'C',
        current: spec.ratedCurrent ?? '?',
        sensitivity: spec.sensitivityMa ?? 30,
      })
    case 'spd':
      return t('catalog.spd', { poles: p })
    case 'meter':
      return spec.manufacturer
        ? t('catalog.meterBrand', { brand: spec.manufacturer })
        : t('catalog.meter')
    case 'contactor':
      return t('catalog.contactor', { poles: p, current: spec.ratedCurrent ?? '?' })
    case 'relay':
      return t('catalog.relay')
    case 'switch':
      return t('catalog.ats')
    case 'afdd':
      return t('catalog.afdd', {
        curve: spec.curve ?? 'B',
        current: spec.ratedCurrent ?? 16,
      })
    case 'distribution':
      return spec.manufacturer
        ? t('catalog.distBrand', { brand: spec.manufacturer })
        : t('catalog.distribution')
    case 'busbar':
      return spec.id.includes('pe') || spec.name.toLowerCase().includes('pe')
        ? t('catalog.peBus')
        : t('catalog.nBus')
    case 'terminal':
      return t('catalog.terminal')
    default:
      return spec.name
  }
}

export function localizedModuleDescription(spec: ModuleSpec, t: TFunction): string {
  const override = moduleOverride(t, spec.id, 'description')
  if (override) return override

  const p = polesLabel(spec)

  switch (spec.category) {
    case 'mcb':
      return t('catalog.desc.mcb', {
        poles: p,
        curve: spec.curve ?? 'C',
        current: spec.ratedCurrent ?? '?',
      })
    case 'rcd':
      return t('catalog.desc.rcd', {
        poles: p,
        current: spec.ratedCurrent ?? '?',
        sensitivity: spec.sensitivityMa ?? 30,
      })
    case 'rcbo':
      return t('catalog.desc.rcbo', {
        poles: p,
        curve: spec.curve ?? 'C',
        current: spec.ratedCurrent ?? '?',
        sensitivity: spec.sensitivityMa ?? 30,
      })
    case 'spd':
      return t('catalog.desc.spd', { poles: p })
    case 'meter':
      return spec.manufacturer
        ? t('catalog.desc.meterBrand', { brand: spec.manufacturer })
        : t('catalog.desc.meter')
    case 'contactor':
      return t('catalog.desc.contactor', { poles: p, current: spec.ratedCurrent ?? '?' })
    case 'relay':
      return t('catalog.desc.relay')
    case 'switch':
      return t('catalog.desc.ats')
    case 'afdd':
      return t('catalog.desc.afdd', {
        curve: spec.curve ?? 'B',
        current: spec.ratedCurrent ?? 16,
      })
    case 'distribution':
      return spec.manufacturer
        ? t('catalog.desc.distBrand', { brand: spec.manufacturer })
        : t('catalog.desc.distribution')
    case 'busbar':
      return spec.id.includes('pe') || spec.name.toLowerCase().includes('pe')
        ? t('catalog.desc.peBus')
        : t('catalog.desc.nBus')
    case 'terminal':
      return t('catalog.desc.terminal')
    default:
      return spec.description
  }
}

export function localizedEnclosureName(enc: EnclosureSpec, t: TFunction): string {
  return t(`enclosures.${enc.id}.name`, undefined, enc.name)
}

export function localizedEnclosureDescription(enc: EnclosureSpec, t: TFunction): string {
  return t(`enclosures.${enc.id}.description`, undefined, enc.description)
}

export function localizedWireLabel(role: string, t: TFunction): string {
  return t(`wires.${role}`, undefined, role)
}

export function localizedEboardGroup(group: string, t: TFunction, fallback: string): string {
  return t(`eboardGroups.${group}`, undefined, fallback)
}

export function localizedTag(t: TFunction, kind: 'load' | 'system', key: string): string {
  return t(`tags.${kind}.${key}`, undefined, key)
}
