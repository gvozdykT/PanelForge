import type { ModuleSpec, PlacedModule } from '../types'
import { MODULE_WIDTH_MM } from '../data/wireColors'

export const EDITOR_SCALE = 2.5
export const MODULE_HEIGHT_PX = 100
export const RAIL_LABEL_HEIGHT = 22
export const RAIL_BOX_HEIGHT = 120
export const RAIL_ROW_GAP = 12
export const MODULE_TOP_IN_RAIL = 10

export function snapToModule(positionMm: number): number {
  return Math.round(positionMm / MODULE_WIDTH_MM) * MODULE_WIDTH_MM
}

export function moduleWidthMm(spec: ModuleSpec): number {
  return spec.widthModules * MODULE_WIDTH_MM
}

export function clampPosition(positionMm: number, spec: ModuleSpec, railLengthMm: number): number {
  const width = moduleWidthMm(spec)
  const max = Math.max(0, railLengthMm - width)
  return Math.max(0, Math.min(snapToModule(positionMm), max))
}

export function hasOverlap(
  modules: PlacedModule[],
  getSpec: (specId: string) => ModuleSpec,
  railId: string,
  positionMm: number,
  spec: ModuleSpec,
  excludeId?: string
): boolean {
  const start = positionMm
  const end = start + moduleWidthMm(spec)

  return modules.some((m) => {
    if (m.railId !== railId || m.instanceId === excludeId) return false
    const existing = getSpec(m.specId)
    const eStart = m.position
    const eEnd = eStart + moduleWidthMm(existing)
    return start < eEnd && end > eStart
  })
}

export function positionFromPointer(clientX: number, railLeft: number, scale = EDITOR_SCALE): number {
  const x = clientX - railLeft
  return snapToModule(x / scale)
}

export function terminalOffsetX(
  terminalIndex: number,
  totalTerminals: number,
  moduleWidthPx: number
): number {
  if (totalTerminals <= 1) return moduleWidthPx / 2
  const padding = moduleWidthPx * 0.12
  const usable = moduleWidthPx - padding * 2
  return padding + (usable / (totalTerminals - 1)) * terminalIndex
}

export function createId(): string {
  return crypto.randomUUID()
}
