import { useCallback, useRef, useState } from 'react'
import type { PlacedModule } from '../../types'
import { MODULE_MAP } from '../../data'
import { MODULE_HEIGHT_PX, positionFromPointer } from '../../lib/geometry'
import { displayTag } from '../../lib/tags'
import { useI18n } from '../../i18n'

const DRAG_THRESHOLD_PX = 5

interface Props {
  module: PlacedModule
  scale: number
  selected: boolean
  wireMode: boolean
  wireStartModuleId: string | null
  draggable?: boolean
  onSelect: () => void
  onOpenSpec: () => void
  onMove: (position: number, railId?: string) => void
  onTerminalClick: (moduleId: string, terminalId: string, role: string) => void
}

function railIdFromPoint(x: number, y: number): string | undefined {
  const el = document.elementFromPoint(x, y)
  const rail = el?.closest('[data-rail-id]') as HTMLElement | null
  return rail?.dataset.railId
}

export function ModuleRenderer({
  module,
  scale,
  selected,
  wireMode,
  wireStartModuleId,
  draggable = true,
  onSelect,
  onOpenSpec,
  onMove,
  onTerminalClick,
}: Props) {
  const { t } = useI18n()
  const spec = MODULE_MAP[module.specId]
  const widthPx = spec ? spec.widthModules * 18 * scale : 0

  const [previewPos, setPreviewPos] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const dragActive = useRef(false)
  const hasMoved = useRef(false)
  const startClientX = useRef(0)
  const previewRailId = useRef<string | undefined>(module.railId)

  const finishDrag = useCallback(() => {
    dragActive.current = false
    document.body.classList.remove('is-dragging-module')
    setIsDragging(false)
    setPreviewPos(null)
  }, [])

  const startDrag = useCallback(
    (clientX: number, _clientY: number) => {
      if (wireMode || !draggable) return

      dragActive.current = true
      hasMoved.current = false
      startClientX.current = clientX
      previewRailId.current = module.railId
      onSelect()

      const onMoveHandler = (ev: MouseEvent | TouchEvent) => {
        if (!dragActive.current) return
        const cx = 'touches' in ev ? ev.touches[0].clientX : ev.clientX
        const cy = 'touches' in ev ? ev.touches[0].clientY : ev.clientY

        if (Math.abs(cx - startClientX.current) > DRAG_THRESHOLD_PX) {
          if (!hasMoved.current) {
            hasMoved.current = true
            setIsDragging(true)
            document.body.classList.add('is-dragging-module')
          }
        }

        if (!hasMoved.current) return

        const railId = railIdFromPoint(cx, cy)
        if (railId) previewRailId.current = railId

        const rail = document.querySelector(`[data-rail-id="${previewRailId.current}"]`)
        if (!rail) return
        const rect = rail.getBoundingClientRect()
        const pos = positionFromPointer(cx, rect.left, scale)
        setPreviewPos(pos)
      }

      const onUpHandler = (ev: MouseEvent | TouchEvent) => {
        if (!dragActive.current) return

        const cx = 'changedTouches' in ev ? ev.changedTouches[0].clientX : ev.clientX
        const cy = 'changedTouches' in ev ? ev.changedTouches[0].clientY : ev.clientY

        if (hasMoved.current) {
          const railId = railIdFromPoint(cx, cy) ?? previewRailId.current
          const rail = document.querySelector(`[data-rail-id="${railId}"]`)
          if (rail) {
            const rect = rail.getBoundingClientRect()
            const pos = positionFromPointer(cx, rect.left, scale)
            onMove(pos, railId)
          }
        } else {
          onOpenSpec()
        }

        finishDrag()
        window.removeEventListener('mousemove', onMoveHandler)
        window.removeEventListener('mouseup', onUpHandler)
        window.removeEventListener('touchmove', onMoveHandler)
        window.removeEventListener('touchend', onUpHandler)
      }

      window.addEventListener('mousemove', onMoveHandler)
      window.addEventListener('mouseup', onUpHandler)
      window.addEventListener('touchmove', onMoveHandler, { passive: false })
      window.addEventListener('touchend', onUpHandler)
    },
    [wireMode, draggable, module.railId, onSelect, onOpenSpec, onMove, scale, finishDrag]
  )

  const handleMouseDown = (e: React.MouseEvent) => {
    if (wireMode || e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    startDrag(e.clientX, e.clientY)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (wireMode) return
    e.stopPropagation()
    startDrag(e.touches[0].clientX, e.touches[0].clientY)
  }

  if (!spec) return null

  const tag = displayTag(module.label, spec)
  const isCustomTag = Boolean(module.label?.trim())
  const displayPos = previewPos ?? module.position

  return (
    <div
      className={`placed-module ${selected ? 'selected' : ''} ${wireMode ? 'wire-mode' : ''} ${isCustomTag ? 'has-tag' : ''} ${isDragging ? 'dragging' : ''} ${draggable ? 'draggable' : ''}`}
      style={{ left: displayPos * scale, width: widthPx, height: MODULE_HEIGHT_PX }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      title={draggable ? t('drag', { name: tag }) : tag}
    >
      {draggable && !wireMode && (
        <div className="module-drag-handle" aria-hidden="true">
          ⠿
        </div>
      )}
      <div className="module-tag-badge" style={{ maxWidth: widthPx - 4 }}>
        {tag}
      </div>
      <ModuleFace spec={spec} widthPx={widthPx} rcdLabel={t('abbrev.rcd')} rcboLabel={t('abbrev.rcbo')} />
      <TerminalRow
        terminals={spec.terminals.filter((t) => t.position === 'top')}
        moduleId={module.instanceId}
        side="top"
        wireMode={wireMode}
        wireStartModuleId={wireStartModuleId}
        onTerminalClick={onTerminalClick}
      />
      <TerminalRow
        terminals={spec.terminals.filter((t) => t.position === 'bottom')}
        moduleId={module.instanceId}
        side="bottom"
        wireMode={wireMode}
        wireStartModuleId={wireStartModuleId}
        onTerminalClick={onTerminalClick}
      />
      <div className="module-label">{isCustomTag ? spec.name : ''}</div>
    </div>
  )
}

function ModuleFace({
  spec,
  widthPx,
  rcdLabel,
  rcboLabel,
}: {
  spec: typeof MODULE_MAP[string]
  widthPx: number
  rcdLabel: string
  rcboLabel: string
}) {
  return (
    <div className="module-face">
      <svg width={widthPx} height={MODULE_HEIGHT_PX - 20} viewBox={`0 0 ${widthPx} ${MODULE_HEIGHT_PX - 20}`}>
        <ModuleSvgBody
          type={spec.icon}
          width={widthPx}
          rated={spec.ratedCurrent}
          curve={spec.curve}
          rcdLabel={rcdLabel}
          rcboLabel={rcboLabel}
        />
      </svg>
    </div>
  )
}

function ModuleSvgBody({
  type,
  width,
  rated,
  curve,
  rcdLabel,
  rcboLabel,
}: {
  type: string
  width: number
  rated?: number
  curve?: string
  rcdLabel: string
  rcboLabel: string
}) {
  const h = MODULE_HEIGHT_PX - 20
  const fill =
    type === 'distribution' ? '#555' :
    type === 'meter' ? '#fafafa' :
    type === 'rcd' ? '#eef6ff' :
    type === 'rcbo' ? '#f0f8f0' :
    '#f5f5f0'

  return (
    <>
      <rect x="1" y="1" width={width - 2} height={h - 2} rx="3" fill={fill} stroke="#bbb" />
      {type === 'mcb' && (
        <>
          <rect x={width * 0.35} y={h * 0.3} width={width * 0.3} height={h * 0.25} rx="2" fill="#333" />
          <text x={width / 2} y={h * 0.82} textAnchor="middle" fontSize="10" fill="#333" fontWeight="bold">
            {curve ?? 'C'}{rated ?? 25}A
          </text>
        </>
      )}
      {type === 'distribution' && (
        <>
          <circle cx={width / 2} cy={h * 0.25} r="6" fill="#888" />
          {[0.45, 0.55, 0.65, 0.75, 0.85].map((y, i) => (
            <circle key={i} cx={width * (0.25 + (i % 2) * 0.5)} cy={h * y} r="3" fill="#777" />
          ))}
        </>
      )}
      {type === 'meter' && (
        <>
          <rect x="4" y="4" width="8" height="4" fill="#FFD700" stroke="#00AA44" strokeWidth="0.5" />
          <rect x="14" y="4" width="8" height="4" fill="#0066CC" />
          <rect x="24" y="4" width="8" height="4" fill="#8B4513" />
          <text x={width / 2} y={h * 0.5} textAnchor="middle" fontSize="7" fill="#666">Modbus</text>
        </>
      )}
      {(type === 'rcd' || type === 'rcbo') && (
        <text x={width / 2} y={h * 0.45} textAnchor="middle" fontSize="9" fill="#2563eb">
          {type === 'rcd' ? rcdLabel : rcboLabel}
        </text>
      )}
      {type === 'spd' && (
        <path
          d={`M${width / 2} ${h * 0.15} l-6 14 h4 l-2 10 12-16 h-4 z`}
          fill="#f59e0b"
        />
      )}
    </>
  )
}

function TerminalRow({
  terminals,
  moduleId,
  side,
  wireMode,
  wireStartModuleId,
  onTerminalClick,
}: {
  terminals: { id: string; role: string }[]
  moduleId: string
  side: 'top' | 'bottom'
  wireMode: boolean
  wireStartModuleId: string | null
  onTerminalClick: (moduleId: string, terminalId: string, role: string) => void
}) {
  return (
    <div className={`module-terminals module-terminals-${side}`}>
      {terminals.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`terminal-dot ${wireMode ? 'clickable' : ''} ${
            wireStartModuleId === moduleId ? 'wire-active' : ''
          }`}
          title={t.role}
          style={{ background: terminalBg(t.role) }}
          onClick={(e) => {
            e.stopPropagation()
            if (wireMode) onTerminalClick(moduleId, t.id, t.role)
          }}
        />
      ))}
    </div>
  )
}

function terminalBg(role: string): string {
  const map: Record<string, string> = {
    L1: '#8B4513',
    L2: '#1a1a1a',
    L3: '#808080',
    N: '#0066CC',
    PE: 'repeating-linear-gradient(90deg, #FFD700 0 2px, #00AA44 2px 4px)',
    PEN: '#00AA44',
  }
  return map[role] ?? '#999'
}
