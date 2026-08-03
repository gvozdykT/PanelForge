export type PhaseCount = 1 | 2 | 3

export type WireRole = 'L1' | 'L2' | 'L3' | 'N' | 'PE' | 'PEN'

export type GroundingSystem = 'TN-S' | 'TN-C-S' | 'TN-C' | 'TT' | 'IT'

export type EditorMode = 'select' | 'wire' | 'pan'

export type EboardGroup =
  | 'protection'
  | 'switching'
  | 'monitoring'
  | 'metering'
  | 'power'
  | 'infrastructure'
  | 'custom'

export type ModuleCategory =
  | 'mcb'
  | 'rcd'
  | 'rcbo'
  | 'contactor'
  | 'relay'
  | 'meter'
  | 'spd'
  | 'afdd'
  | 'switch'
  | 'distribution'
  | 'terminal'
  | 'busbar'
  | 'other'

export type ValidationSeverity = 'error' | 'warning' | 'info'

export interface WireColor {
  role: WireRole
  label: string
  color: string
  labelUk: string
}

export interface DinRailSpec {
  id: string
  name: string
  profile: 'top-hat' | 'g-profile'
  widthMm: number
  lengthModules: number
  lengthMm: number
  description: string
}

export interface EnclosureSpec {
  id: string
  name: string
  modules: number
  rows: number
  widthMm: number
  heightMm: number
  depthMm: number
  ip: string
  mounting: 'surface' | 'flush'
  description: string
}

export interface ModuleTerminal {
  id: string
  role: WireRole
  position: 'top' | 'bottom'
  index: number
}

export interface ModuleSpec {
  id: string
  name: string
  manufacturer?: string
  category: ModuleCategory
  widthModules: number
  poles: 1 | 2 | 3 | 4
  ratedCurrent?: number
  curve?: 'B' | 'C' | 'D'
  sensitivityMa?: number
  rcdType?: 'AC' | 'A' | 'B'
  breakingKa?: number
  spdClass?: 'I' | 'II' | 'III'
  /** Тип приладу за класифікацією ElectroBoard (29 типів) */
  eboardType?: string
  eboardGroup?: EboardGroup
  eboardCode?: string
  /** Основний пункт бібліотеки (1 з 29 типів ElectroBoard) */
  eboardPrimary?: boolean
  /** Приховати з бібліотеки — лише для сумісності демо/імпорту */
  libraryHidden?: boolean
  phases: PhaseCount[]
  terminals: ModuleTerminal[]
  description: string
  icon: string
}

export interface PlacedModule {
  instanceId: string
  specId: string
  railId: string
  position: number
  label?: string
}

export interface TerminalRef {
  moduleId: string
  terminalId: string
}

export interface WireConnection {
  id: string
  from: TerminalRef
  to: TerminalRef
  role: WireRole
}

export interface ValidationIssue {
  id: string
  severity: ValidationSeverity
  message: string
  rule: string
  moduleId?: string
}

export interface PanelProject {
  version: 1
  id: string
  name: string
  phaseCount: PhaseCount
  groundingSystem: GroundingSystem
  enclosureId: string
  modules: PlacedModule[]
  wires: WireConnection[]
  updatedAt: string
}

export interface TerminalPosition {
  moduleId: string
  terminalId: string
  role: WireRole
  side: 'top' | 'bottom'
  x: number
  y: number
  railId: string
}

export interface ModuleBounds {
  moduleId: string
  left: number
  right: number
  top: number
  bottom: number
  railId: string
}

export const PROJECT_VERSION = 1 as const
