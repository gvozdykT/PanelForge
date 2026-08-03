import type {
  ModuleSpec,
  PanelProject,
  ValidationIssue,
  WireConnection,
} from '../types'
import type { TFunction } from '../i18n/types'
import { MODULE_MAP } from '../data'
import { MODULE_WIDTH_MM } from '../data/wireColors'
import { hasOverlap, moduleWidthMm } from './geometry'
import { resolveLoadPhase } from './phaseBalance'
import { localizedModuleName } from '../i18n/catalog'
import { STANDARDS } from './standards'

function isRcdCategory(category: ModuleSpec['category']): boolean {
  return category === 'rcd' || category === 'rcbo'
}

function getSpec(specId: string): ModuleSpec {
  return MODULE_MAP[specId]
}

function modName(spec: ModuleSpec, t: TFunction): string {
  return localizedModuleName(spec, t)
}

/** Клеми, що йдуть за межі щита (навантаження, вхід з мережі, резерв шини) — не вимагають проводки в редакторі */
function isPanelExternalTerminal(spec: ModuleSpec, terminal: ModuleSpec['terminals'][number]): boolean {
  const { category, id: specId } = spec
  const { position, id } = terminal

  // Вихід автоматів / АВДТ → лінія до розеток, світла тощо
  if ((category === 'mcb' || category === 'afdd') && position === 'bottom') return true
  if (category === 'rcbo' && position === 'bottom' && id.startsWith('out-')) return true

  // Вхід лічильника — кабель від мережі
  if (category === 'meter' && position === 'top') return true

  // Нижні відводи N/PE шин — до навантажень або резерв
  if (category === 'distribution' && (specId === 'dist-n-6way' || specId === 'dist-pe-6way')) {
    if (position === 'bottom') return true
  }

  // Modbus / доп. клема лічильника
  if (category === 'meter' && id === 'rs485') return true

  return false
}

export function validateProject(
  project: PanelProject,
  railLengthMm: number,
  t: TFunction
): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const { modules, wires, phaseCount, groundingSystem } = project

  // Перевірка переповнення рейки та накладання
  for (const mod of modules) {
    const spec = getSpec(mod.specId)
    const end = mod.position + moduleWidthMm(spec)
    if (end > railLengthMm + 0.01) {
      issues.push({
        id: `overflow-${mod.instanceId}`,
        severity: 'error',
        message: t('validation.overRail', { name: modName(spec, t) }),
        rule: 'rail-capacity',
        moduleId: mod.instanceId,
      })
    }
    if (
      hasOverlap(modules, getSpec, mod.railId, mod.position, spec, mod.instanceId)
    ) {
      issues.push({
        id: `overlap-${mod.instanceId}`,
        severity: 'error',
        message: t('validation.overlap', { name: modName(spec, t) }),
        rule: 'no-overlap',
        moduleId: mod.instanceId,
      })
    }
    if (!spec.phases.includes(phaseCount)) {
      issues.push({
        id: `phase-${mod.instanceId}`,
        severity: 'error',
        message: t('validation.phaseMismatch', { name: modName(spec, t), phases: phaseCount }),
        rule: 'phase-match',
        moduleId: mod.instanceId,
      })
    }
  }

  // ДБН В.2.5-23:2025 §5.1 — для житлових будівель TN-S або TN-C-S
  if (groundingSystem === 'TN-C' && modules.length > 0) {
    issues.push({
      id: 'dbn-tn-c-deprecated',
      severity: 'warning',
      message: t('validation.tnCDeprecated'),
      rule: 'dbn-tn-c-deprecated',
    })
  }

  // ДБН В.2.5-27 / HD 60364-4-41 — ПЗВ заборонено в TN-C (N і PE не розділені)
  if (groundingSystem === 'TN-C') {
    for (const mod of modules) {
      const spec = getSpec(mod.specId)
      if (!isRcdCategory(spec.category)) continue
      issues.push({
        id: `tn-c-rcd-${mod.instanceId}`,
        severity: 'error',
        message: t('validation.tnCRcd'),
        rule: 'hd60364-tn-c-no-rcd',
        moduleId: mod.instanceId,
      })
    }
  }

  // HD 60364-4-41 — TT вимагає ПЗВ на вводі
  if (groundingSystem === 'TT') {
    const hasRcd = modules.some((m) => isRcdCategory(getSpec(m.specId).category))
    if (!hasRcd && modules.length > 0) {
      issues.push({
        id: 'tt-requires-rcd',
        severity: 'warning',
        message: t('validation.ttRcd'),
        rule: 'hd60364-tt-rcd',
      })
    }
  }

  // ДБН В.2.5-23 — рекомендовано ПЗВ для розеточних груп (30 мА)
  const rcdModules = modules.filter((m) => isRcdCategory(getSpec(m.specId).category))
  const hasMcbs = modules.some((m) => getSpec(m.specId).category === 'mcb')
  if (
    hasMcbs &&
    rcdModules.length === 0 &&
    modules.length > 0 &&
    groundingSystem !== 'TN-C'
  ) {
    issues.push({
      id: 'dbn-rcd-recommended',
      severity: 'info',
      message: t('validation.rcdRecommended', { sensitivity: STANDARDS.RCD_SOCKET_SENSITIVITY_MA }),
      rule: 'dbn-rcd-recommended',
    })
  }

  // ДБН В.2.5-23, п. 12.18 — селективність каскадних ПЗВ (IΔn ввідного ≥ 3× групового)
  const rcdWithSensitivity = rcdModules
    .map((m) => ({ mod: m, spec: getSpec(m.specId), sensitivity: getSpec(m.specId).sensitivityMa }))
    .filter((r): r is typeof r & { sensitivity: number } => r.sensitivity != null)

  if (rcdWithSensitivity.length >= 2) {
    const sensitivities = rcdWithSensitivity.map((r) => r.sensitivity)
    const minSensitivity = Math.min(...sensitivities)
    const maxSensitivity = Math.max(...sensitivities)

    if (maxSensitivity < minSensitivity * STANDARDS.RCD_SELECTIVITY_RATIO) {
      const downstream = rcdWithSensitivity.find((r) => r.sensitivity === minSensitivity)!
      const upstream = rcdWithSensitivity.find((r) => r.sensitivity === maxSensitivity)!
      issues.push({
        id: 'rcd-selectivity',
        severity: 'warning',
        message: t('validation.rcdSelectivity', {
          upstreamName: modName(upstream.spec, t),
          upstreamMa: upstream.sensitivity,
          downstreamName: modName(downstream.spec, t),
          downstreamMa: downstream.sensitivity,
          ratio: STANDARDS.RCD_SELECTIVITY_RATIO,
        }),
        rule: 'dbn-rcd-selectivity',
        moduleId: downstream.mod.instanceId,
      })
    }
  }

  // Селективність: ввідний автомат ≥ групових
  const mcbs = modules
    .map((m) => ({ mod: m, spec: getSpec(m.specId) }))
    .filter(({ spec }) => spec.category === 'mcb' && spec.ratedCurrent)

  if (mcbs.length >= 2) {
    const sorted = [...mcbs].sort(
      (a, b) => (b.spec.ratedCurrent ?? 0) - (a.spec.ratedCurrent ?? 0)
    )
    const main = sorted[0]
    for (const { mod, spec } of sorted.slice(1)) {
      if ((spec.ratedCurrent ?? 0) >= (main.spec.ratedCurrent ?? 0)) {
        issues.push({
          id: `selectivity-${mod.instanceId}`,
          severity: 'warning',
          message: t('validation.selectivity', {
            name: modName(spec, t),
            current: spec.ratedCurrent ?? 0,
            mainName: modName(main.spec, t),
            mainCurrent: main.spec.ratedCurrent ?? 0,
          }),
          rule: 'selectivity',
          moduleId: mod.instanceId,
        })
      }
    }
  }

  // Баланс фаз (3ф) — 1P автомати за фактичною фазою живлення
  if (phaseCount === 3) {
    const phaseLoads = { L1: 0, L2: 0, L3: 0 }
    for (const mod of modules) {
      const spec = getSpec(mod.specId)
      if (spec.category === 'mcb' && spec.ratedCurrent) {
        if (spec.poles === 1) {
          const phase = resolveLoadPhase(mod.instanceId, wires, modules)
          phaseLoads[phase] += spec.ratedCurrent
        } else if (spec.poles >= 3) {
          phaseLoads.L1 += spec.ratedCurrent
          phaseLoads.L2 += spec.ratedCurrent
          phaseLoads.L3 += spec.ratedCurrent
        }
      }
    }
    const values = Object.values(phaseLoads)
    const max = Math.max(...values)
    const min = Math.min(...values)
    if (max > 0 && max - min > max * 0.3) {
      issues.push({
        id: 'phase-imbalance',
        severity: 'warning',
        message: t('validation.phaseImbalance', {
          l1: phaseLoads.L1,
          l2: phaseLoads.L2,
          l3: phaseLoads.L3,
        }),
        rule: 'phase-balance',
      })
    }
  }

  // Непідключені клеми
  const connected = new Set<string>()
  for (const wire of wires) {
    connected.add(`${wire.from.moduleId}:${wire.from.terminalId}`)
    connected.add(`${wire.to.moduleId}:${wire.to.terminalId}`)
  }
  let unconnected = 0
  for (const mod of modules) {
    const spec = getSpec(mod.specId)
    for (const t of spec.terminals) {
      if (isPanelExternalTerminal(spec, t)) continue
      const key = `${mod.instanceId}:${t.id}`
      if (!connected.has(key)) unconnected++
    }
  }
  if (unconnected > 0 && modules.length > 1) {
    issues.push({
      id: 'unconnected-terminals',
      severity: 'info',
      message: t('validation.unconnected', { count: unconnected }),
      rule: 'wiring-complete',
    })
  }

  // Загальний струм vs місткість рейки
  const usedModules = modules.reduce((sum, m) => sum + getSpec(m.specId).widthModules, 0)
  const capacity = railLengthMm / MODULE_WIDTH_MM
  if (usedModules > capacity) {
    issues.push({
      id: 'rail-modules-exceeded',
      severity: 'error',
      message: t('validation.railFull', { used: usedModules, capacity }),
      rule: 'rail-capacity',
    })
  }

  if (modules.length === 0) {
    issues.push({
      id: 'empty-panel',
      severity: 'info',
      message: t('validation.empty'),
      rule: 'empty',
    })
  }

  return issues
}

export function canConnectWires(
  wires: WireConnection[],
  from: WireConnection['from'],
  to: WireConnection['to'],
  role: WireConnection['role']
): boolean {
  if (from.moduleId === to.moduleId && from.terminalId === to.terminalId) return false
  const duplicate = wires.some(
    (w) =>
      w.role === role &&
      ((w.from.moduleId === from.moduleId &&
        w.from.terminalId === from.terminalId &&
        w.to.moduleId === to.moduleId &&
        w.to.terminalId === to.terminalId) ||
        (w.from.moduleId === to.moduleId &&
          w.from.terminalId === to.terminalId &&
          w.to.moduleId === from.moduleId &&
          w.to.terminalId === from.terminalId))
  )
  return !duplicate
}
