import type { PanelProject } from '../types'
import { PROJECT_VERSION } from '../types'

const STORAGE_KEY = 'shield-project-v1'

export function loadProject(): PanelProject | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PanelProject
    if (parsed.version !== PROJECT_VERSION) return null
    return parsed
  } catch {
    return null
  }
}

export function saveProject(project: PanelProject): void {
  const updated = { ...project, updatedAt: new Date().toISOString() }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export function exportProjectJson(project: PanelProject): void {
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${project.name.replace(/\s+/g, '-')}.shield.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importProjectJson(file: File, t: (key: string) => string): Promise<PanelProject> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string) as PanelProject
        if (parsed.version !== PROJECT_VERSION) {
          reject(new Error(t('storage.unsupportedVersion')))
          return
        }
        resolve(parsed)
      } catch {
        reject(new Error(t('storage.invalidJson')))
      }
    }
    reader.onerror = () => reject(new Error(t('storage.readError')))
    reader.readAsText(file)
  })
}

export function createDefaultProject(name: string): PanelProject {
  return {
    version: PROJECT_VERSION,
    id: crypto.randomUUID(),
    name,
    phaseCount: 1,
    groundingSystem: 'TN-C-S',
    enclosureId: 'enc-24x1',
    modules: [],
    wires: [],
    updatedAt: new Date().toISOString(),
  }
}
