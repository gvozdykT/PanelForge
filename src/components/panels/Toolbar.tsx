import { useRef } from 'react'
import type { PanelProject } from '../../types'
import { exportProjectJson, importProjectJson } from '../../lib/storage'
import { openPrintReport } from '../../lib/wiring'
import { useI18n } from '../../i18n'

interface Props {
  project: PanelProject
  enclosureName: string
  onImport: (project: PanelProject) => void
  onClear: () => void
  onLoadHouseDemo: () => void
  onExportPng: () => void
  exportBusy: boolean
  mode: 'select' | 'wire' | 'pan'
  onModeChange: (mode: 'select' | 'wire' | 'pan') => void
}

export function Toolbar({
  project,
  enclosureName,
  onImport,
  onClear,
  onLoadHouseDemo,
  onExportPng,
  exportBusy,
  mode,
  onModeChange,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const { t, locale } = useI18n()

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const imported = await importProjectJson(file, t)
      onImport(imported)
    } catch (err) {
      alert(err instanceof Error ? err.message : t('toolbar.importError'))
    }
    e.target.value = ''
  }

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <button
          className={`tool-btn ${mode === 'select' ? 'active' : ''}`}
          onClick={() => onModeChange('select')}
          title={t('toolbar.tipSelect')}
        >
          {t('toolbar.select')}
        </button>
        <button
          className={`tool-btn ${mode === 'wire' ? 'active' : ''}`}
          onClick={() => onModeChange('wire')}
          title={t('toolbar.tipWire')}
        >
          {t('toolbar.wire')}
        </button>
      </div>
      <div className="toolbar-group">
        <button className="tool-btn accent" onClick={onLoadHouseDemo} title={t('toolbar.tipHouse')}>
          {t('toolbar.houseDemo')}
        </button>
        <button
          className="tool-btn"
          onClick={onExportPng}
          disabled={exportBusy}
          title={t('toolbar.tipPng')}
        >
          {exportBusy ? t('toolbar.exportPngBusy') : t('toolbar.exportPng')}
        </button>
        <button className="tool-btn" onClick={() => exportProjectJson(project)}>
          {t('toolbar.exportJson')}
        </button>
        <button className="tool-btn" onClick={() => fileRef.current?.click()}>
          {t('toolbar.import')}
        </button>
        <input ref={fileRef} type="file" accept=".json,.shield.json" hidden onChange={handleImport} />
        <button
          className="tool-btn"
          onClick={() => openPrintReport(project, enclosureName, t, locale)}
        >
          {t('toolbar.print')}
        </button>
        <button
          className="tool-btn danger"
          onClick={() => confirm(t('toolbar.confirmClear')) && onClear()}
        >
          {t('toolbar.clear')}
        </button>
      </div>
    </div>
  )
}
