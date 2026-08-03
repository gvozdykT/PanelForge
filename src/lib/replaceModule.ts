import type { ModuleSpec, PhaseCount, PlacedModule, WireConnection } from '../types'
import { MODULE_CATALOG, MODULE_MAP } from '../data'
import { clampPosition, hasOverlap } from './geometry'

export function remapTerminalId(
  terminalId: string,
  oldSpec: ModuleSpec,
  newSpec: ModuleSpec
): string | null {
  const oldTerm = oldSpec.terminals.find((t) => t.id === terminalId)
  if (!oldTerm) return null
  const match = newSpec.terminals.find(
    (t) => t.role === oldTerm.role && t.position === oldTerm.position && t.index === oldTerm.index
  )
  return match?.id ?? null
}

export function remapWiresForReplace(
  wires: WireConnection[],
  instanceId: string,
  oldSpec: ModuleSpec,
  newSpec: ModuleSpec
): WireConnection[] {
  return wires
    .map((w) => {
      let from = w.from
      let to = w.to

      if (from.moduleId === instanceId) {
        const newId = remapTerminalId(from.terminalId, oldSpec, newSpec)
        if (!newId) return null
        from = { ...from, terminalId: newId }
      }
      if (to.moduleId === instanceId) {
        const newId = remapTerminalId(to.terminalId, oldSpec, newSpec)
        if (!newId) return null
        to = { ...to, terminalId: newId }
      }

      return { ...w, from, to }
    })
    .filter((w): w is WireConnection => w !== null)
}

function connectedWireCount(wires: WireConnection[], instanceId: string): number {
  return wires.filter((w) => w.from.moduleId === instanceId || w.to.moduleId === instanceId).length
}

export function countWireLoss(
  wires: WireConnection[],
  instanceId: string,
  oldSpec: ModuleSpec,
  newSpec: ModuleSpec
): number {
  const before = connectedWireCount(wires, instanceId)
  const after = connectedWireCount(remapWiresForReplace(wires, instanceId, oldSpec, newSpec), instanceId)
  return before - after
}

export function canReplaceModule(
  modules: PlacedModule[],
  instanceId: string,
  newSpec: ModuleSpec,
  railLengthMm: number
): boolean {
  const mod = modules.find((m) => m.instanceId === instanceId)
  if (!mod) return false
  const position = clampPosition(mod.position, newSpec, railLengthMm)
  return !hasOverlap(modules, (id) => MODULE_MAP[id], mod.railId, position, newSpec, instanceId)
}

export interface ReplaceOption {
  spec: ModuleSpec
  fits: boolean
  wireLoss: number
}

export function getReplaceOptions(
  specId: string,
  instanceId: string,
  phaseCount: PhaseCount,
  modules: PlacedModule[],
  wires: WireConnection[],
  railLengthMm: number
): ReplaceOption[] {
  const current = MODULE_MAP[specId]
  if (!current) return []

  return MODULE_CATALOG.filter((m) => {
    const typeMatch =
      m.eboardType === current.eboardType ||
      (!current.eboardType && m.category === current.category)
    return typeMatch && m.phases.includes(phaseCount)
  })
    .sort((a, b) => {
      if (a.widthModules !== b.widthModules) return a.widthModules - b.widthModules
      return (a.ratedCurrent ?? 0) - (b.ratedCurrent ?? 0)
    })
    .map((spec) => ({
      spec,
      fits: canReplaceModule(modules, instanceId, spec, railLengthMm),
      wireLoss: countWireLoss(wires, instanceId, current, spec),
    }))
}
