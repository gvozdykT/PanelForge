import type { PanelProject, WireConnection } from '../types'
import { MODULE_MAP } from '../data'

type PhaseRole = 'L1' | 'L2' | 'L3'

/** Визначає фазу живлення 1P автомата за проводкою вгору по ланцюгу */
export function resolveLoadPhase(
  moduleId: string,
  wires: WireConnection[],
  modules: PanelProject['modules']
): PhaseRole {
  const visited = new Set<string>()

  function trace(modId: string, termId: string): PhaseRole | null {
    const key = `${modId}:${termId}`
    if (visited.has(key)) return null
    visited.add(key)

    const mod = modules.find((m) => m.instanceId === modId)
    const spec = mod ? MODULE_MAP[mod.specId] : undefined

    if (spec?.category === 'rcd' || spec?.category === 'rcbo') {
      if (termId === 'out-l') return trace(modId, 'in-l')
    }

    if (spec?.category === 'mcb' && termId === 'out-0') {
      return trace(modId, 'in-0')
    }

    const incoming = wires.filter((w) => w.to.moduleId === modId && w.to.terminalId === termId)
    for (const w of incoming) {
      const fromTerm = w.from.terminalId
      if (fromTerm === 'out-0') return 'L1'
      if (fromTerm === 'out-1') return 'L2'
      if (fromTerm === 'out-2') return 'L3'
      if (fromTerm === 'out') {
        const up = trace(w.from.moduleId, 'in-l')
        if (up) return up
      }

      const up = trace(w.from.moduleId, fromTerm)
      if (up) return up
    }

    return null
  }

  return trace(moduleId, 'in-0') ?? 'L1'
}
