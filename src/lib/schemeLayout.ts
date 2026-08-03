import type { PlacedModule, PanelProject } from '../types'
import type { TFunction } from '../i18n/types'
import { MODULE_MAP } from '../data'
import { MODULE_WIDTH_MM } from '../data/wireColors'

export interface SchemeGroupDef {
  id: string
  label: string
  color: string
  border: string
  moduleIds: string[]
}

/** Групування модулів для схеми щита (як на однолінійці, але з реальними модулями) */
export function buildSchemeGroups(project: PanelProject, t: TFunction): SchemeGroupDef[] {
  const byRail = (railId: string) =>
    project.modules
      .filter((m) => m.railId === railId)
      .sort((a, b) => a.position - b.position)

  const row0 = byRail('rail-0')
  const row1 = byRail('rail-1')

  if (row0.length === 0 && row1.length === 0) {
    return [{
      id: 'all',
      label: t('scheme.panel'),
      color: 'rgba(100,116,139,0.15)',
      border: '#64748b',
      moduleIds: project.modules.map((m) => m.instanceId),
    }]
  }

  const groups: SchemeGroupDef[] = []

  if (row0.length > 0) {
    groups.push({
      id: 'main',
      label: t('scheme.main'),
      color: 'rgba(167,139,250,0.2)',
      border: '#a78bfa',
      moduleIds: row0.map((m) => m.instanceId),
    })
  }

  // Розбивка другого ряду по ПЗВ (кожен ПЗВ = нова група)
  const isHouseDemo = project.id === 'demo-house-diagram'

  const phaseColors = isHouseDemo
    ? [
        { label: t('scheme.houseKitchen'), color: 'rgba(254,240,138,0.25)', border: '#eab308' },
        { label: t('scheme.houseRooms'), color: 'rgba(187,247,208,0.25)', border: '#22c55e' },
        { label: t('scheme.houseBath'), color: 'rgba(191,219,254,0.25)', border: '#3b82f6' },
        { label: t('scheme.houseGarage'), color: 'rgba(254,202,202,0.25)', border: '#ef4444' },
        { label: t('scheme.houseOther'), color: 'rgba(251,207,232,0.25)', border: '#ec4899' },
      ]
    : [
        { label: t('scheme.phase1'), color: 'rgba(254,240,138,0.25)', border: '#eab308' },
        { label: t('scheme.phase2'), color: 'rgba(187,247,208,0.25)', border: '#22c55e' },
        { label: t('scheme.phase3'), color: 'rgba(191,219,254,0.25)', border: '#3b82f6' },
        { label: t('scheme.nonPriority'), color: 'rgba(251,207,232,0.25)', border: '#ec4899' },
      ]

  let phaseIdx = 0
  let currentIds: string[] = []

  for (const mod of row1) {
    const spec = MODULE_MAP[mod.specId]
    const isRcd = spec?.category === 'rcd' || spec?.category === 'rcbo'

    if (isRcd) {
      if (currentIds.length > 0) flushGroup()
      currentIds = [mod.instanceId]
    } else {
      if (currentIds.length === 0) currentIds = [mod.instanceId]
      else currentIds.push(mod.instanceId)
    }
  }
  if (currentIds.length > 0) flushGroup()

  const row2 = byRail('rail-2')
  if (row2.length > 0) {
    const techStyle = isHouseDemo ? phaseColors[3] : phaseColors[phaseColors.length - 1]
    groups.push({
      id: 'tech-row',
      label: techStyle.label,
      color: techStyle.color,
      border: techStyle.border,
      moduleIds: row2.map((m) => m.instanceId),
    })
  }

  function flushGroup() {
    if (currentIds.length === 0) return
    const style = phaseColors[phaseIdx] ?? phaseColors[phaseColors.length - 1]
    groups.push({
      id: `phase-${phaseIdx}`,
      label: style.label,
      color: style.color,
      border: style.border,
      moduleIds: [...currentIds],
    })
    currentIds = []
    phaseIdx++
  }

  return groups
}

/** Перерахунок позицій модулів всередині групи (з 0) */
export function layoutGroupModules(
  project: PanelProject,
  group: SchemeGroupDef,
  railId: string
): PlacedModule[] {
  let pos = 0
  return group.moduleIds.flatMap((id) => {
    const mod = project.modules.find((m) => m.instanceId === id)
    if (!mod) return []
    const spec = MODULE_MAP[mod.specId]
    if (!spec) return []
    const placed: PlacedModule = { ...mod, railId, position: pos }
    pos += spec.widthModules * MODULE_WIDTH_MM
    return [placed]
  })
}

export function groupRailLengthMm(modules: PlacedModule[]): number {
  if (modules.length === 0) return MODULE_WIDTH_MM * 6
  const last = modules[modules.length - 1]
  const spec = MODULE_MAP[last.specId]
  return last.position + (spec?.widthModules ?? 1) * MODULE_WIDTH_MM
}

export function filterWiresForModules(
  wires: PanelProject['wires'],
  moduleIds: Set<string>
) {
  return wires.filter(
    (w) => moduleIds.has(w.from.moduleId) && moduleIds.has(w.to.moduleId)
  )
}
