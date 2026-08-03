import type { WireColor } from '../types'

/** IEC 60446 / HD 308 / ДСТУ HD 60364 — стандартні кольори проводів */
export const WIRE_COLORS: WireColor[] = [
  { role: 'L1', label: 'L1', labelUk: 'Фаза 1', color: '#8B4513' },
  { role: 'L2', label: 'L2', labelUk: 'Фаза 2', color: '#1a1a1a' },
  { role: 'L3', label: 'L3', labelUk: 'Фаза 3', color: '#808080' },
  { role: 'N', label: 'N', labelUk: 'Нуль', color: '#0066CC' },
  { role: 'PE', label: 'PE', labelUk: 'Земля', color: '#FFD700' },
  { role: 'PEN', label: 'PEN', labelUk: 'PEN', color: '#00AA44' },
]

export const WIRE_COLOR_MAP = Object.fromEntries(
  WIRE_COLORS.map((w) => [w.role, w])
) as Record<string, WireColor>

/** Візуальний градієнт PE (зелено-жовтий) */
export const PE_GRADIENT = 'repeating-linear-gradient(90deg, #FFD700 0 4px, #00AA44 4px 8px)'

export const MODULE_WIDTH_MM = 18
export const DIN_RAIL_HEIGHT_MM = 35
