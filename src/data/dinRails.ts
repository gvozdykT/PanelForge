import type { DinRailSpec } from '../types'
import { MODULE_WIDTH_MM } from './wireColors'

/** Стандартні DIN-рейки EN 60715 (профіль top-hat 35×7.5 мм) */
export const DIN_RAILS: DinRailSpec[] = [
  {
    id: 'rail-12',
    name: 'DIN 12 мод.',
    profile: 'top-hat',
    widthMm: 35,
    lengthModules: 12,
    lengthMm: 12 * MODULE_WIDTH_MM,
    description: '216 мм — міні-щит, 1 ряд',
  },
  {
    id: 'rail-18',
    name: 'DIN 18 мод.',
    profile: 'top-hat',
    widthMm: 35,
    lengthModules: 18,
    lengthMm: 18 * MODULE_WIDTH_MM,
    description: '324 мм — квартира, 1 ряд',
  },
  {
    id: 'rail-24',
    name: 'DIN 24 мод.',
    profile: 'top-hat',
    widthMm: 35,
    lengthModules: 24,
    lengthMm: 24 * MODULE_WIDTH_MM,
    description: '432 мм — стандартний щит, 1 ряд',
  },
  {
    id: 'rail-36',
    name: 'DIN 36 мод.',
    profile: 'top-hat',
    widthMm: 35,
    lengthModules: 36,
    lengthMm: 36 * MODULE_WIDTH_MM,
    description: '648 мм — будинок, 1 ряд',
  },
  {
    id: 'rail-48',
    name: 'DIN 48 мод.',
    profile: 'top-hat',
    widthMm: 35,
    lengthModules: 48,
    lengthMm: 48 * MODULE_WIDTH_MM,
    description: '864 мм — комерційний, 1 ряд',
  },
  {
    id: 'rail-54',
    name: 'DIN 54 мод.',
    profile: 'top-hat',
    widthMm: 35,
    lengthModules: 54,
    lengthMm: 54 * MODULE_WIDTH_MM,
    description: '972 мм — промисловий, 1 ряд',
  },
  {
    id: 'rail-72',
    name: 'DIN 72 мод.',
    profile: 'top-hat',
    widthMm: 35,
    lengthModules: 72,
    lengthMm: 72 * MODULE_WIDTH_MM,
    description: '1296 мм — великий щит, 1 ряд',
  },
]

export const DIN_RAIL_MAP = Object.fromEntries(DIN_RAILS.map((r) => [r.id, r]))
