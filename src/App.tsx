import { useState, useEffect, useRef } from 'react'
import { ENCLOSURES, WIRE_COLORS } from './data'
import { DEMO_HOUSE_PROJECT } from './data/demoHouseProject'
import { EDITOR_SCALE } from './lib/geometry'
import { exportDomAsPng } from './lib/imageExport'
import { useProject } from './hooks/useProject'
import { DinRail, BusbarStrip } from './components/editor/DinRail'
import { WireLayer } from './components/editor/WireLayer'
import { PanelSchemeView } from './components/editor/PanelSchemeView'
import { ComponentLibrary } from './components/library/ComponentLibrary'
import { ValidationPanel } from './components/panels/ValidationPanel'
import { Toolbar } from './components/panels/Toolbar'
import { PropertiesPanel } from './components/panels/PropertiesPanel'
import { ModuleSpecModal } from './components/panels/ModuleSpecModal'
import { MODULE_MAP } from './data'
import { TagsPanel } from './components/panels/TagsPanel'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import { useI18n } from './i18n'
import {
  localizedEnclosureDescription,
  localizedEnclosureName,
  localizedModuleName,
  localizedWireLabel,
} from './i18n/catalog'
import './App.css'

export default function App() {
  const { t } = useI18n()
  const {
    project,
    enclosure,
    railLengthMm,
    selectedId,
    mode,
    wireStart,
    dragSpecId,
    issues,
    dispatch,
    setProject,
    handleTerminalClick,
  } = useProject()

  const [selectedWireId, setSelectedWireId] = useState<string | null>(null)
  const [modalModuleId, setModalModuleId] = useState<string | null>(null)
  const [view, setView] = useState<'rail' | 'schematic'>('schematic')
  const [exportBusy, setExportBusy] = useState(false)
  const exportRootRef = useRef<HTMLDivElement>(null)

  const openSpec = (id: string) => {
    setSelectedWireId(null)
    dispatch({ type: 'SELECT', id })
    setModalModuleId(id)
  }

  const closeSpec = () => {
    setModalModuleId(null)
    dispatch({ type: 'SELECT', id: null })
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('demo') === 'house') {
      setProject({
        ...DEMO_HOUSE_PROJECT,
        name: t('project.houseDemo'),
      })
      setView('schematic')
    }
  }, [setProject, t])

  const loadHouseDemo = () => {
    setProject({
      ...DEMO_HOUSE_PROJECT,
      name: t('project.houseDemo'),
      updatedAt: new Date().toISOString(),
    })
    setView('schematic')
  }

  const handleExportPng = async () => {
    const root = exportRootRef.current
    if (!root) return
    if (project.modules.length === 0) {
      alert(t('export.emptyPanel'))
      return
    }
    setExportBusy(true)
    try {
      const suffix = view === 'schematic' ? t('scheme.suffix') : t('rail.suffix')
      await exportDomAsPng(root, `${project.name}-${suffix}`)
    } catch {
      alert(t('export.pngFailed'))
    } finally {
      setExportBusy(false)
    }
  }

  const modalModule = project.modules.find((m) => m.instanceId === modalModuleId)
  const railWidthPx = railLengthMm * EDITOR_SCALE
  const enclosureLabel = localizedEnclosureName(enclosure, t)

  const connectedWires = (modalModuleId ?? selectedId)
    ? project.wires
        .filter((w) => {
          const id = modalModuleId ?? selectedId
          return w.from.moduleId === id || w.to.moduleId === id
        })
        .map((w) => ({
          id: w.id,
          label: `${w.role}: ${w.from.terminalId} ↔ ${w.to.terminalId}`,
        }))
    : []

  const modalSpec = modalModule ? MODULE_MAP[modalModule.specId] : undefined

  return (
    <div className="app">
      <header className="header">
        <div className="header-brand">
          <h1>{t('app.title')}</h1>
          <span className="subtitle">{t('app.subtitle')}</span>
        </div>
        <input
          className="project-name"
          value={project.name}
          onChange={(e) => dispatch({ type: 'SET_NAME', name: e.target.value })}
          aria-label={t('app.projectName')}
        />
        <LanguageSwitcher />
        <Toolbar
          project={project}
          enclosureName={enclosureLabel}
          onImport={setProject}
          onClear={() => dispatch({ type: 'CLEAR_ALL' })}
          onLoadHouseDemo={loadHouseDemo}
          onExportPng={handleExportPng}
          exportBusy={exportBusy}
          mode={mode}
          onModeChange={(m) => dispatch({ type: 'SET_MODE', mode: m })}
        />
        <div className="view-tabs">
          <button
            type="button"
            className={`view-tab ${view === 'schematic' ? 'active' : ''}`}
            onClick={() => setView('schematic')}
          >
            {t('app.viewSchematic')}
          </button>
          <button
            type="button"
            className={`view-tab ${view === 'rail' ? 'active' : ''}`}
            onClick={() => setView('rail')}
          >
            {t('app.viewRail')}
          </button>
        </div>
      </header>

      <aside className="sidebar">
        <section className="panel-section">
          <h3>{t('settings.title')}</h3>
          <label>
            {t('settings.phases')}
            <select
              value={project.phaseCount}
              onChange={(e) =>
                dispatch({ type: 'SET_PHASE', phaseCount: Number(e.target.value) as 1 | 2 | 3 })
              }
            >
              <option value={1}>{t('settings.phase1')}</option>
              <option value={2}>{t('settings.phase2')}</option>
              <option value={3}>{t('settings.phase3')}</option>
            </select>
          </label>
          <label>
            {t('settings.grounding')}
            <select
              value={project.groundingSystem}
              onChange={(e) =>
                dispatch({
                  type: 'SET_GROUNDING',
                  groundingSystem: e.target.value as typeof project.groundingSystem,
                })
              }
            >
              <option value="TN-C-S">{t('settings.groundingTnCS')}</option>
              <option value="TN-S">TN-S</option>
              <option value="TN-C">TN-C</option>
              <option value="TT">TT</option>
              <option value="IT">IT</option>
            </select>
          </label>
          <label>
            {t('settings.enclosure')}
            <select
              value={project.enclosureId}
              onChange={(e) => dispatch({ type: 'SET_ENCLOSURE', enclosureId: e.target.value })}
            >
              {ENCLOSURES.map((e) => (
                <option key={e.id} value={e.id}>
                  {localizedEnclosureName(e, t)} — {localizedEnclosureDescription(e, t)}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="panel-section">
          <h3>{t('settings.wireColors')}</h3>
          <div className="wire-legend">
            {WIRE_COLORS.filter((w) => w.role !== 'PEN' || project.phaseCount >= 2).map((w) => (
              <div key={w.role} className="wire-item">
                <span
                  className="wire-swatch"
                  style={{
                    background:
                      w.role === 'PE'
                        ? 'repeating-linear-gradient(90deg, #FFD700 0 3px, #00AA44 3px 6px)'
                        : w.color,
                  }}
                />
                <span>{localizedWireLabel(w.role, t)}</span>
                <span className="wire-code">{w.label}</span>
              </div>
            ))}
          </div>
        </section>

        <ValidationPanel
          issues={issues}
          onSelectModule={(id) => dispatch({ type: 'SELECT', id })}
        />

        <TagsPanel
          modules={project.modules}
          selectedId={selectedId}
          onSelect={(id) => dispatch({ type: 'SELECT', id })}
          onSetLabel={(instanceId, label) =>
            dispatch({ type: 'SET_MODULE_LABEL', instanceId, label })
          }
        />

        <ComponentLibrary
          phaseCount={project.phaseCount}
          dragSpecId={dragSpecId}
          onDragSpec={(id) => dispatch({ type: 'SET_DRAG_SPEC', specId: id })}
        />
      </aside>

      <main className="workspace">
        {mode === 'wire' && (
          <div className="mode-banner">
            {wireStart ? t('mode.wirePick') : t('mode.wireHint')}
            {wireStart && (
              <button type="button" onClick={() => dispatch({ type: 'WIRE_CANCEL' })}>
                {t('mode.cancel')}
              </button>
            )}
          </div>
        )}

        {view === 'schematic' ? (
          <PanelSchemeView
            rootRef={exportRootRef}
            project={project}
            selectedId={selectedId}
            mode={mode}
            wireStart={wireStart}
            onSelect={(id) => {
              setSelectedWireId(null)
              dispatch({ type: 'SELECT', id })
            }}
            onOpenSpec={openSpec}
            onTerminalClick={(moduleId, terminalId, role) =>
              handleTerminalClick(
                { moduleId, terminalId },
                role as import('./types').WireRole
              )
            }
          />
        ) : (
          <>
            <div ref={exportRootRef} className="enclosure-view">
              <div className="enclosure-label">
                {enclosureLabel} · {enclosure.modules} {t('rail.modules')} × {enclosure.rows}{' '}
                {t('rail.rows')} · {project.phaseCount}φ · {project.groundingSystem} ·{' '}
                {project.modules.length} {t('rail.modulesCount')} · {project.wires.length}{' '}
                {t('rail.wiresCount')} ·{' '}
                <span className="hint-inline">{t('rail.dragHint')}</span>
              </div>

              <div className="enclosure-canvas" style={{ width: railWidthPx }}>
                <WireLayer
                  modules={project.modules}
                  wires={project.wires}
                  canvasWidth={railWidthPx}
                  rowCount={enclosure.rows}
                  wireStart={wireStart}
                  selectedWireId={selectedWireId}
                  onSelectWire={setSelectedWireId}
                />

                <div className="rails-layer">
                  {Array.from({ length: enclosure.rows }).map((_, row) => {
                    const railId = `rail-${row}`
                    return (
                      <DinRail
                        key={railId}
                        row={row}
                        railId={railId}
                        railLengthMm={railLengthMm}
                        modules={project.modules}
                        selectedId={selectedId}
                        mode={mode}
                        wireStart={wireStart}
                        dragSpecId={dragSpecId}
                        onSelect={(id) => {
                          setSelectedWireId(null)
                          dispatch({ type: 'SELECT', id })
                        }}
                        onOpenSpec={openSpec}
                        onAddModule={(specId, rId, pos) =>
                          dispatch({ type: 'ADD_MODULE', specId, railId: rId, position: pos })
                        }
                        onMoveModule={(instanceId, pos, railId) =>
                          dispatch({ type: 'MOVE_MODULE', instanceId, position: pos, railId })
                        }
                        onTerminalClick={(moduleId, terminalId, role) =>
                          handleTerminalClick(
                            { moduleId, terminalId },
                            role as import('./types').WireRole
                          )
                        }
                      />
                    )
                  })}
                </div>
              </div>

              <div className="busbars">
                <BusbarStrip role="N" widthPx={railWidthPx} />
                <BusbarStrip role="PE" widthPx={railWidthPx} />
              </div>
            </div>
          </>
        )}

        {modalModule && modalSpec && (
          <ModuleSpecModal
            open
            title={localizedModuleName(modalSpec, t)}
            onClose={closeSpec}
          >
            <PropertiesPanel
              module={modalModule}
              wiresCount={connectedWires.length}
              connectedWires={connectedWires}
              phaseCount={project.phaseCount}
              railLengthMm={railLengthMm}
              allModules={project.modules}
              wires={project.wires}
              onClose={closeSpec}
              onSetLabel={(label) =>
                dispatch({ type: 'SET_MODULE_LABEL', instanceId: modalModule.instanceId, label })
              }
              onReplace={(newSpecId) =>
                dispatch({ type: 'REPLACE_MODULE', instanceId: modalModule.instanceId, newSpecId })
              }
              onRemove={() => {
                dispatch({ type: 'REMOVE_MODULE', instanceId: modalModule.instanceId })
                closeSpec()
              }}
              onRemoveWire={(wireId) => dispatch({ type: 'REMOVE_WIRE', wireId })}
            />
          </ModuleSpecModal>
        )}
      </main>
    </div>
  )
}
