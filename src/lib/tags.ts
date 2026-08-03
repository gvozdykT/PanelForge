import type { ModuleSpec } from '../types'

/** Типовий технічний тег — як на однолінійній схемі */
export function suggestDefaultTag(spec: ModuleSpec): string {
  const p = spec.poles === 2 && spec.category === 'rcbo' ? '1P+N' : `${spec.poles}P`

  switch (spec.category) {
    case 'mcb':
      return `CB ${p} ${spec.curve ?? 'C'}${spec.ratedCurrent ?? '?'}A`
    case 'rcd':
      return `RCD ${p} ${spec.ratedCurrent ?? '?'}A ${spec.sensitivityMa ?? 30}mA`
    case 'rcbo':
      return `RCBO ${p} ${spec.curve ?? 'C'}${spec.ratedCurrent ?? '?'}A ${spec.sensitivityMa ?? 30}mA`
    case 'spd':
      return `SPD ${p}`
    case 'meter':
      return spec.manufacturer ? `Meter ${spec.manufacturer}` : 'Meter'
    case 'contactor':
      return `KM ${p} ${spec.ratedCurrent ?? '?'}A`
    case 'relay':
      return 'Relay'
    case 'switch':
      return 'ATS 1-0-2'
    case 'afdd':
      return `AFDD ${spec.curve ?? 'B'}${spec.ratedCurrent ?? 16}A`
    case 'distribution':
      return spec.manufacturer ? `Dist ${spec.manufacturer}` : 'Distribution'
    case 'busbar':
      return spec.name.includes('PE') ? 'PE Bus' : 'N Bus'
    case 'terminal':
      return 'Terminal'
    default:
      return spec.name
  }
}

/** Ключі пресетів навантажень */
export const LOAD_TAG_KEYS = [
  'lighting',
  'sockets',
  'kitchen',
  'hob',
  'oven',
  'ac',
  'boiler',
  'washer',
  'bathroom',
  'furnace',
  'pump',
  'intercom',
  'lan',
  'motor',
  'spare',
  'ups',
  'server',
  'heating',
  'hood',
  'floorHeat',
] as const

/** Ключі системних пресетів */
export const SYSTEM_TAG_KEYS = [
  'input',
  'mainBreaker',
  'mainRcd',
  'meter',
  'spd',
  'voltageRelay',
  'distL1',
  'distL2',
  'distL3',
  'groupA',
  'groupB',
  'groupC',
  'groupD',
  'critical',
  'generator',
] as const

export type LoadTagKey = (typeof LOAD_TAG_KEYS)[number]
export type SystemTagKey = (typeof SYSTEM_TAG_KEYS)[number]

export function displayTag(label: string | undefined, spec: ModuleSpec): string {
  return label?.trim() || suggestDefaultTag(spec)
}
