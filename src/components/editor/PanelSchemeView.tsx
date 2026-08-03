import type { Ref } from 'react'
import type { PanelProject, PlacedModule, EditorMode, TerminalRef } from '../../types'
import { RAIL_BOX_HEIGHT } from '../../lib/geometry'
import {
  buildSchemeGroups,
  layoutGroupModules,
  filterWiresForModules,
  groupRailLengthMm,
} from '../../lib/schemeLayout'
import { WireLayer } from './WireLayer'
import { ModuleRenderer } from './ModuleRenderer'
import { useI18n } from '../../i18n'

const SCHEME_SCALE = 2.2

interface SchemeRailProps {
  modules: PlacedModule[]
  wires: PanelProject['wires']
  selectedId: string | null
  mode: EditorMode
  wireStart: TerminalRef | null
  onSelect: (id: string) => void
  onOpenSpec: (id: string) => void
  onTerminalClick: (moduleId: string, terminalId: string, role: string) => void
}

function SchemeRail({
  modules,
  wires,
  selectedId,
  mode,
  wireStart,
  onSelect,
  onOpenSpec,
  onTerminalClick,
}: SchemeRailProps) {
  const railLengthMm = groupRailLengthMm(modules)
  const railWidthPx = railLengthMm * SCHEME_SCALE

  return (
    <div className="scheme-rail-wrap">
      <div className="scheme-rail" style={{ width: railWidthPx, height: RAIL_BOX_HEIGHT }}>
        <WireLayer
          modules={modules}
          wires={wires}
          canvasWidth={railWidthPx}
          wireStart={wireStart}
          selectedWireId={null}
          onSelectWire={() => {}}
          local
          scale={SCHEME_SCALE}
        />
        <div className="rail-profile" />
        {modules.map((mod) => (
          <ModuleRenderer
            key={mod.instanceId}
            module={mod}
            scale={SCHEME_SCALE}
            selected={selectedId === mod.instanceId}
            wireMode={mode === 'wire'}
            wireStartModuleId={wireStart?.moduleId ?? null}
            onSelect={() => onSelect(mod.instanceId)}
            onOpenSpec={() => onOpenSpec(mod.instanceId)}
            onMove={() => {}}
            draggable={false}
            onTerminalClick={onTerminalClick}
          />
        ))}
      </div>
    </div>
  )
}

interface Props {
  project: PanelProject
  selectedId: string | null
  mode: EditorMode
  wireStart: TerminalRef | null
  onSelect: (id: string) => void
  onOpenSpec: (id: string) => void
  onTerminalClick: (moduleId: string, terminalId: string, role: string) => void
  rootRef?: Ref<HTMLDivElement>
}

export function PanelSchemeView({
  project,
  selectedId,
  mode,
  wireStart,
  onSelect,
  onOpenSpec,
  onTerminalClick,
  rootRef,
}: Props) {
  const { t } = useI18n()
  const groups = buildSchemeGroups(project, t)

  if (project.modules.length === 0) {
    return (
      <div ref={rootRef} className="panel-scheme empty">
        <p>{t('scheme.empty')}</p>
      </div>
    )
  }

  const mainGroups = groups.filter((g) => g.id === 'main' || g.id === 'all')
  const phaseGroups = groups.filter((g) => g.id !== 'main' && g.id !== 'all')

  return (
    <div ref={rootRef} className="panel-scheme">
      <div className="panel-scheme-header">
        <h2>{project.name}</h2>
        <span>
          {project.phaseCount}ф · {project.groundingSystem} · {project.modules.length} модулів ·{' '}
          {project.wires.length} з&apos;єднань
        </span>
      </div>

      {mainGroups.map((group) => {
        const laid = layoutGroupModules(project, group, `scheme-${group.id}`)
        const ids = new Set(group.moduleIds)
        const wires = filterWiresForModules(project.wires, ids)
        return (
          <section
            key={group.id}
            className="scheme-group scheme-group-main"
            style={{ background: group.color, borderColor: group.border }}
          >
            <h3>{group.label}</h3>
            <SchemeRail
              modules={laid}
              wires={wires}
              selectedId={selectedId}
              mode={mode}
              wireStart={wireStart}
              onSelect={onSelect}
              onOpenSpec={onOpenSpec}
              onTerminalClick={onTerminalClick}
            />
          </section>
        )
      })}

      {phaseGroups.length > 0 && (
        <div className="scheme-phases">
          {phaseGroups.map((group) => {
            const laid = layoutGroupModules(project, group, `scheme-${group.id}`)
            const ids = new Set(group.moduleIds)
            const wires = filterWiresForModules(project.wires, ids)
            return (
              <section
                key={group.id}
                className="scheme-group"
                style={{ background: group.color, borderColor: group.border }}
              >
                <h3>{group.label}</h3>
                <SchemeRail
                  modules={laid}
                  wires={wires}
                  selectedId={selectedId}
                  mode={mode}
                  wireStart={wireStart}
                  onSelect={onSelect}
                  onOpenSpec={onOpenSpec}
                  onTerminalClick={onTerminalClick}
                />
              </section>
            )
          })}
        </div>
      )}

      <div className="scheme-buses">
        <div className="busbar-strip" style={{ width: '100%' }}>
          <div className="busbar-bar" style={{ background: '#0066CC' }} />
          <span className="busbar-label">{t('rail.busN')}</span>
        </div>
        <div className="busbar-strip" style={{ width: '100%' }}>
          <div className="busbar-bar" style={{ background: '#00AA44' }} />
          <span className="busbar-label">{t('rail.busPE')}</span>
        </div>
      </div>
    </div>
  )
}
