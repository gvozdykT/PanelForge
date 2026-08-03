import type { PlacedModule, EditorMode, TerminalRef } from '../../types'
import { EDITOR_SCALE, RAIL_BOX_HEIGHT } from '../../lib/geometry'
import { ModuleRenderer } from './ModuleRenderer'
import { useI18n } from '../../i18n'

interface Props {
  row: number
  railId: string
  railLengthMm: number
  modules: PlacedModule[]
  selectedId: string | null
  mode: EditorMode
  wireStart: TerminalRef | null
  dragSpecId: string | null
  onSelect: (id: string) => void
  onOpenSpec: (id: string) => void
  onAddModule: (specId: string, railId: string, position: number) => void
  onMoveModule: (instanceId: string, position: number, railId?: string) => void
  onTerminalClick: (moduleId: string, terminalId: string, role: string) => void
}

export function DinRail({
  row,
  railId,
  railLengthMm,
  modules,
  selectedId,
  mode,
  wireStart,
  dragSpecId,
  onSelect,
  onOpenSpec,
  onAddModule,
  onMoveModule,
  onTerminalClick,
}: Props) {
  const { t } = useI18n()
  const railWidthPx = railLengthMm * EDITOR_SCALE
  const railModules = modules.filter((m) => m.railId === railId)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const specId = e.dataTransfer.getData('application/shield-module') || dragSpecId
    if (!specId) return
    const rect = e.currentTarget.getBoundingClientRect()
    const positionMm = Math.round((e.clientX - rect.left) / EDITOR_SCALE / 18) * 18
    onAddModule(specId, railId, positionMm)
  }

  const handleClick = (e: React.MouseEvent) => {
    if (dragSpecId && mode === 'select') {
      const rect = e.currentTarget.getBoundingClientRect()
      const positionMm = Math.round((e.clientX - rect.left) / EDITOR_SCALE / 18) * 18
      onAddModule(dragSpecId, railId, positionMm)
    }
  }

  return (
    <div className="rail-row">
      <div className="rail-label">{t('rail.row', { n: row + 1 })}</div>
      <div
        className={`din-rail ${dragSpecId ? 'drop-ready' : ''}`}
        data-rail-id={railId}
        style={{ width: railWidthPx, height: RAIL_BOX_HEIGHT }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="rail-profile" />

        {railModules.map((mod) => (
          <ModuleRenderer
            key={mod.instanceId}
            module={mod}
            scale={EDITOR_SCALE}
            selected={selectedId === mod.instanceId}
            wireMode={mode === 'wire'}
            wireStartModuleId={wireStart?.moduleId ?? null}
            onSelect={() => onSelect(mod.instanceId)}
            onOpenSpec={() => onOpenSpec(mod.instanceId)}
            onMove={(pos, targetRailId) =>
              onMoveModule(mod.instanceId, pos, targetRailId ?? railId)
            }
            onTerminalClick={onTerminalClick}
          />
        ))}
      </div>
    </div>
  )
}

export function BusbarStrip({ role, widthPx }: { role: 'N' | 'PE'; widthPx: number }) {
  const { t } = useI18n()
  const color = role === 'N' ? '#0066CC' : '#00AA44'
  const label = role === 'N' ? t('rail.busN') : t('rail.busPE')
  return (
    <div className="busbar-strip" style={{ width: widthPx }}>
      <div className="busbar-bar" style={{ background: color }} />
      <span className="busbar-label">{label}</span>
    </div>
  )
}
