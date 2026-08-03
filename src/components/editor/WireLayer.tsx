import type { PanelProject, PlacedModule, TerminalRef } from '../../types'
import {
  computeWirePath,
  getModuleBounds,
  getTerminalPositions,
  wireStroke,
  wireStrokeDark,
} from '../../lib/wiring'
import { RAIL_LABEL_HEIGHT, RAIL_BOX_HEIGHT, RAIL_ROW_GAP, EDITOR_SCALE } from '../../lib/geometry'

interface Props {
  modules: PlacedModule[]
  wires: PanelProject['wires']
  canvasWidth: number
  rowCount?: number
  wireStart: TerminalRef | null
  selectedWireId: string | null
  onSelectWire: (id: string | null) => void
  local?: boolean
  scale?: number
}

export function WireLayer({
  modules,
  wires,
  canvasWidth,
  rowCount = 1,
  wireStart,
  selectedWireId,
  onSelectWire,
  local = false,
  scale: scaleProp,
}: Props) {
  const scale = scaleProp ?? EDITOR_SCALE
  const rowHeight = RAIL_LABEL_HEIGHT + RAIL_BOX_HEIGHT + RAIL_ROW_GAP
  const canvasHeight = local ? RAIL_BOX_HEIGHT + 20 : rowCount * rowHeight + 20
  const wireOpts = { local, scale }
  const bounds = getModuleBounds(modules, wireOpts)
  const terminals = getTerminalPositions(modules, wireOpts)
  const posMap = new Map(terminals.map((p) => [`${p.moduleId}:${p.terminalId}`, p]))

  return (
    <svg
      className={local ? 'wire-layer-local' : 'wire-layer-global'}
      width={canvasWidth}
      height={canvasHeight}
      aria-hidden="true"
    >
      <defs>
        <filter id="wire-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <pattern id="pe-stripe" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(0)">
          <rect width="3" height="6" fill="#FFD700" />
          <rect x="3" width="3" height="6" fill="#32CD32" />
        </pattern>
      </defs>

      {wires.map((wire) => {
        const from = posMap.get(`${wire.from.moduleId}:${wire.from.terminalId}`)
        const to = posMap.get(`${wire.to.moduleId}:${wire.to.terminalId}`)
        if (!from || !to) return null

        const path = computeWirePath(from, to, bounds)
        const color = wireStroke(wire.role)
        const dark = wireStrokeDark(wire.role)
        const isPe = wire.role === 'PE'
        const selected = selectedWireId === wire.id

        return (
          <g
            key={wire.id}
            className={`wire-group ${selected ? 'selected' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              onSelectWire(selected ? null : wire.id)
            }}
            style={{ cursor: 'pointer' }}
          >
            {/* Тінь / обводка для контрасту на сірій рейці */}
            <path
              d={path}
              fill="none"
              stroke="rgba(0,0,0,0.55)"
              strokeWidth={selected ? 8 : 6}
              strokeLinecap="round"
              strokeLinejoin="miter"
              pointerEvents="stroke"
            />
            <path
              d={path}
              fill="none"
              stroke={isPe ? 'url(#pe-stripe)' : color}
              strokeWidth={selected ? 5 : 3.5}
              strokeLinecap="round"
              strokeLinejoin="miter"
              filter="url(#wire-glow)"
              pointerEvents="stroke"
            />
            {/* Клеми на кінцях */}
            <circle cx={from.x} cy={from.y} r={selected ? 5 : 4} fill={dark} stroke={color} strokeWidth="2" />
            <circle cx={to.x} cy={to.y} r={selected ? 5 : 4} fill={dark} stroke={color} strokeWidth="2" />
          </g>
        )
      })}

      {wireStart && (() => {
        const p = posMap.get(`${wireStart.moduleId}:${wireStart.terminalId}`)
        if (!p) return null
        return (
          <>
            <circle cx={p.x} cy={p.y} r="7" fill="none" stroke="#f6ad55" strokeWidth="2" className="wire-pending-ring" />
            <circle cx={p.x} cy={p.y} r="4" fill="#f6ad55" className="wire-pending" />
          </>
        )
      })()}
    </svg>
  )
}
