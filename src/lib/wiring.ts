import type { PlacedModule, TerminalPosition, ModuleBounds, WireRole } from '../types'
import { MODULE_MAP } from '../data'
import {
  EDITOR_SCALE,
  MODULE_HEIGHT_PX,
  RAIL_LABEL_HEIGHT,
  RAIL_BOX_HEIGHT,
  RAIL_ROW_GAP,
  MODULE_TOP_IN_RAIL,
  terminalOffsetX,
} from './geometry'

export function rowIndexFromRailId(railId: string): number {
  return parseInt(railId.replace('rail-', ''), 10) || 0
}

export function rowYOffset(row: number): number {
  return row * (RAIL_LABEL_HEIGHT + RAIL_BOX_HEIGHT + RAIL_ROW_GAP) + RAIL_LABEL_HEIGHT
}

export function getModuleBounds(
  modules: PlacedModule[],
  opts?: { local?: boolean; scale?: number }
): ModuleBounds[] {
  const scale = opts?.scale ?? EDITOR_SCALE
  return modules.flatMap((mod) => {
    const spec = MODULE_MAP[mod.specId]
    if (!spec) return []
    const y0 = opts?.local ? 0 : rowYOffset(rowIndexFromRailId(mod.railId))
    const left = mod.position * scale
    const width = spec.widthModules * 18 * scale
    return [{
      moduleId: mod.instanceId,
      left,
      right: left + width,
      top: y0 + MODULE_TOP_IN_RAIL,
      bottom: y0 + MODULE_TOP_IN_RAIL + MODULE_HEIGHT_PX,
      railId: mod.railId,
    }]
  })
}

export function getTerminalPositions(
  modules: PlacedModule[],
  opts?: { local?: boolean; scale?: number }
): TerminalPosition[] {
  const scale = opts?.scale ?? EDITOR_SCALE
  const positions: TerminalPosition[] = []

  for (const mod of modules) {
    const spec = MODULE_MAP[mod.specId]
    if (!spec) continue
    const y0 = opts?.local ? 0 : rowYOffset(rowIndexFromRailId(mod.railId))
    const xBase = mod.position * scale
    const widthPx = spec.widthModules * 18 * scale

    for (const terminal of spec.terminals) {
      const sameSide = spec.terminals.filter((t) => t.position === terminal.position)
      const idx = sameSide.findIndex((t) => t.id === terminal.id)
      const x = xBase + terminalOffsetX(idx, sameSide.length, widthPx)
      const y =
        terminal.position === 'top'
          ? y0 + MODULE_TOP_IN_RAIL + 2
          : y0 + MODULE_TOP_IN_RAIL + MODULE_HEIGHT_PX - 10

      positions.push({
        moduleId: mod.instanceId,
        terminalId: terminal.id,
        role: terminal.role,
        side: terminal.position,
        x,
        y,
        railId: mod.railId,
      })
    }
  }

  return positions
}

/** Ортогональна проводка під 90° — канал над/під модулями */
export function computeWirePath(
  from: TerminalPosition,
  to: TerminalPosition,
  bounds: ModuleBounds[]
): string {
  const { x: x1, y: y1, side: s1 } = from
  const { x: x2, y: y2, side: s2 } = to

  const stubLen = 10
  const channelPad = 18

  const y1Out = s1 === 'top' ? y1 - stubLen : y1 + stubLen
  const y2In = s2 === 'top' ? y2 - stubLen : y2 + stubLen

  const minX = Math.min(x1, x2) - 4
  const maxX = Math.max(x1, x2) + 4
  const blocking = bounds.filter(
    (b) =>
      b.right > minX &&
      b.left < maxX &&
      b.moduleId !== from.moduleId &&
      b.moduleId !== to.moduleId
  )

  const sameRow = from.railId === to.railId
  const sameColumn = Math.abs(x1 - x2) < 2

  let channelY: number

  if (sameColumn) {
    // Одна колонка — тільки вертикаль
    return [
      `M ${f(x1)} ${f(y1)}`,
      `L ${f(x1)} ${f(y1Out)}`,
      `L ${f(x2)} ${f(y2In)}`,
      `L ${f(x2)} ${f(y2)}`,
    ].join(' ')
  }

  const minBlockTop = blocking.length
    ? Math.min(...blocking.map((b) => b.top))
    : Math.min(y1, y2)
  const maxBlockBottom = blocking.length
    ? Math.max(...blocking.map((b) => b.bottom))
    : Math.max(y1, y2)

  const exitUpward = s1 === 'top'
  const enterUpward = s2 === 'top'

  if (sameRow) {
    if (exitUpward && enterUpward) {
      channelY = minBlockTop - channelPad
    } else if (!exitUpward && !enterUpward) {
      channelY = maxBlockBottom + channelPad
    } else {
      // вихід знизу → вхід зверху (або навпаки)
      channelY = (y1Out + y2In) / 2
    }
  } else {
    // Між рядами — горизонталь посередині
    channelY = (y1Out + y2In) / 2
    // Якщо канал перетинає модулі — піднімаємо вище
    const blockInWay = blocking.some((b) => channelY > b.top && channelY < b.bottom)
    if (blockInWay) {
      channelY = minBlockTop - channelPad
    }
  }

  // M → stub → канал (V) → горизонталь (H) → stub (V) → клема
  const points: [number, number][] = [
    [x1, y1],
    [x1, y1Out],
  ]

  if (Math.abs(y1Out - channelY) > 1) {
    points.push([x1, channelY])
  }

  points.push([x2, channelY])

  if (Math.abs(y2In - channelY) > 1) {
    points.push([x2, y2In])
  }

  points.push([x2, y2])

  return points
    .map(([x, y], i) => (i === 0 ? `M ${f(x)} ${f(y)}` : `L ${f(x)} ${f(y)}`))
    .join(' ')
}

function f(n: number): string {
  return n.toFixed(1)
}

export function wireStroke(role: WireRole): string {
  const colors: Record<WireRole, string> = {
    L1: '#CD853F',
    L2: '#2d2d2d',
    L3: '#909090',
    N: '#1E90FF',
    PE: '#32CD32',
    PEN: '#228B22',
  }
  return colors[role]
}

export function wireStrokeDark(role: WireRole): string {
  const colors: Record<WireRole, string> = {
    L1: '#5C3317',
    L2: '#000000',
    L3: '#404040',
    N: '#003366',
    PE: '#006400',
    PEN: '#004400',
  }
  return colors[role]
}

export function wirePathLegacy(x1: number, y1: number, x2: number, y2: number): string {
  const midY = (y1 + y2) / 2
  return `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`
}

// Re-export helpers used elsewhere
export { buildBillOfMaterials, openPrintReport, getSpec } from './wiring-export'
