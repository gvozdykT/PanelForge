import type { ModuleSpec } from '../types'

export function mcbTerminals(poles: 1 | 2 | 3 | 4): ModuleSpec['terminals'] {
  const roles: ModuleSpec['terminals'] = []
  const phaseRoles = ['L1', 'L2', 'L3'] as const
  for (let i = 0; i < poles; i++) {
    const role = i < 3 ? phaseRoles[i] : i === 3 ? 'N' : 'PE'
    roles.push(
      { id: `in-${i}`, role, position: 'top', index: i },
      { id: `out-${i}`, role, position: 'bottom', index: i }
    )
  }
  return roles
}

export function rcd2pTerminals(): ModuleSpec['terminals'] {
  return [
    { id: 'in-l', role: 'L1', position: 'top', index: 0 },
    { id: 'in-n', role: 'N', position: 'top', index: 1 },
    { id: 'out-l', role: 'L1', position: 'bottom', index: 0 },
    { id: 'out-n', role: 'N', position: 'bottom', index: 1 },
  ]
}

export function relay1pnTerminals(): ModuleSpec['terminals'] {
  return [
    { id: 'in-l', role: 'L1', position: 'top', index: 0 },
    { id: 'in-n', role: 'N', position: 'top', index: 1 },
    { id: 'out', role: 'L1', position: 'bottom', index: 0 },
  ]
}

export function distBlockTerminals(outputs: number): ModuleSpec['terminals'] {
  const terminals: ModuleSpec['terminals'] = [
    { id: 'in', role: 'L1', position: 'top', index: 0 },
  ]
  for (let i = 0; i < outputs; i++) {
    terminals.push({
      id: `out-${i + 1}`,
      role: 'L1',
      position: 'bottom',
      index: i,
    })
  }
  return terminals
}

export function nBlockTerminals(count: number): ModuleSpec['terminals'] {
  return Array.from({ length: count + 1 }, (_, i) => ({
    id: `n-${i}`,
    role: 'N' as const,
    position: (i === 0 ? 'top' : 'bottom') as 'top' | 'bottom',
    index: i,
  }))
}

export function peBlockTerminals(count: number): ModuleSpec['terminals'] {
  return Array.from({ length: count + 1 }, (_, i) => ({
    id: `pe-${i}`,
    role: 'PE' as const,
    position: (i === 0 ? 'top' : 'bottom') as 'top' | 'bottom',
    index: i,
  }))
}
