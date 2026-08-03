import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import type {
  EditorMode,
  PanelProject,
  PlacedModule,
  TerminalRef,
  WireConnection,
} from '../types'
import { ENCLOSURE_MAP, MODULE_MAP } from '../data'
import { MODULE_WIDTH_MM } from '../data/wireColors'
import {
  clampPosition,
  createId,
  hasOverlap,
} from '../lib/geometry'
import { saveProject, createDefaultProject, loadProject } from '../lib/storage'
import { canConnectWires, validateProject } from '../lib/validation'
import { remapWiresForReplace } from '../lib/replaceModule'
import { suggestDefaultTag } from '../lib/tags'
import { useI18n } from '../i18n'

type State = {
  project: PanelProject
  selectedId: string | null
  mode: EditorMode
  wireStart: TerminalRef | null
  dragSpecId: string | null
}

type Action =
  | { type: 'SET_PROJECT'; project: PanelProject }
  | { type: 'SET_PHASE'; phaseCount: PanelProject['phaseCount'] }
  | { type: 'SET_GROUNDING'; groundingSystem: PanelProject['groundingSystem'] }
  | { type: 'SET_ENCLOSURE'; enclosureId: string }
  | { type: 'SET_NAME'; name: string }
  | { type: 'SELECT'; id: string | null }
  | { type: 'SET_MODE'; mode: EditorMode }
  | { type: 'SET_DRAG_SPEC'; specId: string | null }
  | { type: 'ADD_MODULE'; specId: string; railId: string; position: number }
  | { type: 'MOVE_MODULE'; instanceId: string; position: number; railId?: string }
  | { type: 'REMOVE_MODULE'; instanceId: string }
  | { type: 'SET_MODULE_LABEL'; instanceId: string; label: string }
  | { type: 'REPLACE_MODULE'; instanceId: string; newSpecId: string }
  | { type: 'WIRE_START'; ref: TerminalRef }
  | { type: 'WIRE_CANCEL' }
  | { type: 'WIRE_COMPLETE'; to: TerminalRef; role: WireConnection['role'] }
  | { type: 'REMOVE_WIRE'; wireId: string }
  | { type: 'CLEAR_ALL' }

function reducer(state: State, action: Action): State {
  const { project } = state

  switch (action.type) {
    case 'SET_PROJECT':
      return { ...state, project: action.project, selectedId: null, wireStart: null }

    case 'SET_PHASE':
      return { ...state, project: { ...project, phaseCount: action.phaseCount } }

    case 'SET_GROUNDING':
      return { ...state, project: { ...project, groundingSystem: action.groundingSystem } }

    case 'SET_ENCLOSURE':
      return { ...state, project: { ...project, enclosureId: action.enclosureId } }

    case 'SET_NAME':
      return { ...state, project: { ...project, name: action.name } }

    case 'SELECT':
      return { ...state, selectedId: action.id, wireStart: null }

    case 'SET_MODE':
      return { ...state, mode: action.mode, wireStart: null }

    case 'SET_DRAG_SPEC':
      return { ...state, dragSpecId: action.specId }

    case 'ADD_MODULE': {
      const spec = MODULE_MAP[action.specId]
      if (!spec) return state
      const enclosure = ENCLOSURE_MAP[project.enclosureId]
      const railLengthMm = enclosure.modules * MODULE_WIDTH_MM
      const position = clampPosition(action.position, spec, railLengthMm)
      if (hasOverlap(project.modules, (id) => MODULE_MAP[id], action.railId, position, spec)) {
        return state
      }
      const placed: PlacedModule = {
        instanceId: createId(),
        specId: action.specId,
        railId: action.railId,
        position,
        label: suggestDefaultTag(spec),
      }
      return {
        ...state,
        project: { ...project, modules: [...project.modules, placed] },
        selectedId: placed.instanceId,
        dragSpecId: null,
      }
    }

    case 'MOVE_MODULE': {
      const mod = project.modules.find((m) => m.instanceId === action.instanceId)
      if (!mod) return state
      const spec = MODULE_MAP[mod.specId]
      const enclosure = ENCLOSURE_MAP[project.enclosureId]
      const railLengthMm = enclosure.modules * MODULE_WIDTH_MM
      const railId = action.railId ?? mod.railId
      const position = clampPosition(action.position, spec, railLengthMm)
      if (
        hasOverlap(
          project.modules,
          (id) => MODULE_MAP[id],
          railId,
          position,
          spec,
          mod.instanceId
        )
      ) {
        return state
      }
      return {
        ...state,
        project: {
          ...project,
          modules: project.modules.map((m) =>
            m.instanceId === action.instanceId ? { ...m, position, railId } : m
          ),
        },
      }
    }

    case 'REMOVE_MODULE': {
      const wires = project.wires.filter(
        (w) =>
          w.from.moduleId !== action.instanceId && w.to.moduleId !== action.instanceId
      )
      return {
        ...state,
        project: {
          ...project,
          modules: project.modules.filter((m) => m.instanceId !== action.instanceId),
          wires,
        },
        selectedId: state.selectedId === action.instanceId ? null : state.selectedId,
      }
    }

    case 'SET_MODULE_LABEL':
      return {
        ...state,
        project: {
          ...project,
          modules: project.modules.map((m) =>
            m.instanceId === action.instanceId ? { ...m, label: action.label } : m
          ),
        },
      }

    case 'REPLACE_MODULE': {
      const mod = project.modules.find((m) => m.instanceId === action.instanceId)
      if (!mod || mod.specId === action.newSpecId) return state
      const oldSpec = MODULE_MAP[mod.specId]
      const newSpec = MODULE_MAP[action.newSpecId]
      if (!oldSpec || !newSpec) return state

      const enclosure = ENCLOSURE_MAP[project.enclosureId]
      const railLen = enclosure.modules * MODULE_WIDTH_MM
      const position = clampPosition(mod.position, newSpec, railLen)
      if (
        hasOverlap(
          project.modules,
          (id) => MODULE_MAP[id],
          mod.railId,
          position,
          newSpec,
          mod.instanceId
        )
      ) {
        return state
      }

      const oldDefault = suggestDefaultTag(oldSpec)
      const label =
        !mod.label || mod.label === oldDefault ? suggestDefaultTag(newSpec) : mod.label

      const wires = remapWiresForReplace(
        project.wires,
        mod.instanceId,
        oldSpec,
        newSpec
      )

      return {
        ...state,
        project: {
          ...project,
          modules: project.modules.map((m) =>
            m.instanceId === action.instanceId
              ? { ...m, specId: action.newSpecId, position, label }
              : m
          ),
          wires,
        },
      }
    }

    case 'WIRE_START':
      return { ...state, wireStart: action.ref }

    case 'WIRE_CANCEL':
      return { ...state, wireStart: null }

    case 'WIRE_COMPLETE': {
      if (!state.wireStart) return state
      const specFrom = project.modules.find((m) => m.instanceId === state.wireStart!.moduleId)
      const specTo = project.modules.find((m) => m.instanceId === action.to.moduleId)
      if (!specFrom || !specTo) return state
      const termFrom = MODULE_MAP[specFrom.specId]?.terminals.find(
        (t) => t.id === state.wireStart!.terminalId
      )
      const termTo = MODULE_MAP[specTo.specId]?.terminals.find((t) => t.id === action.to.terminalId)
      if (!termFrom || !termTo) return state
      if (termFrom.role !== termTo.role) return { ...state, wireStart: null }
      const from = state.wireStart
      const role = termFrom.role
      if (!canConnectWires(project.wires, from, action.to, role)) {
        return { ...state, wireStart: null }
      }
      const wire: WireConnection = { id: createId(), from, to: action.to, role }
      return {
        ...state,
        project: { ...project, wires: [...project.wires, wire] },
        wireStart: null,
      }
    }

    case 'REMOVE_WIRE':
      return {
        ...state,
        project: {
          ...project,
          wires: project.wires.filter((w) => w.id !== action.wireId),
        },
      }

    case 'CLEAR_ALL':
      return {
        ...state,
        project: { ...project, modules: [], wires: [] },
        selectedId: null,
        wireStart: null,
      }

    default:
      return state
  }
}

export function useProject() {
  const { t, locale } = useI18n()
  const initialRef = useRef<PanelProject | null>(null)
  if (!initialRef.current) {
    initialRef.current = loadProject() ?? createDefaultProject(t('project.defaultName'))
  }

  const [state, dispatch] = useReducer(reducer, {
    project: initialRef.current,
    selectedId: null,
    mode: 'select' as EditorMode,
    wireStart: null,
    dragSpecId: null,
  })

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => saveProject(state.project), 500)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [state.project])

  const enclosure = ENCLOSURE_MAP[state.project.enclosureId]
  const railLengthMm = enclosure.modules * MODULE_WIDTH_MM

  const issues = useMemo(
    () => validateProject(state.project, railLengthMm, t),
    [state.project, railLengthMm, t, locale]
  )

  const setProject = useCallback((project: PanelProject) => {
    dispatch({ type: 'SET_PROJECT', project })
  }, [])

  const handleTerminalClick = useCallback(
    (ref: TerminalRef, role: WireConnection['role']) => {
      if (state.mode !== 'wire') return
      if (!state.wireStart) {
        dispatch({ type: 'WIRE_START', ref })
        return
      }
      dispatch({ type: 'WIRE_COMPLETE', to: ref, role })
    },
    [state.mode, state.wireStart]
  )

  return {
    ...state,
    enclosure,
    railLengthMm,
    issues,
    dispatch,
    setProject,
    handleTerminalClick,
  }
}
