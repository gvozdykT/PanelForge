import type { ModuleSpec, PanelProject } from '../types'
import type { TFunction } from '../i18n/types'
import { MODULE_MAP } from '../data'
import { localizedModuleName } from '../i18n/catalog'
import { displayTag } from './tags'

export interface BomRow {
  tag: string
  name: string
  qty: number
}

export function buildBillOfMaterials(project: PanelProject, t: TFunction): { name: string; qty: number }[] {
  const counts = new Map<string, number>()
  for (const mod of project.modules) {
    const spec = MODULE_MAP[mod.specId]
    if (!spec) continue
    const name = localizedModuleName(spec, t)
    counts.set(name, (counts.get(name) ?? 0) + 1)
  }
  return Array.from(counts.entries()).map(([name, qty]) => ({ name, qty }))
}

export function buildTaggedList(project: PanelProject, t: TFunction): BomRow[] {
  return project.modules.map((mod) => {
    const spec = MODULE_MAP[mod.specId]
    return {
      tag: spec ? displayTag(mod.label, spec) : '?',
      name: spec ? localizedModuleName(spec, t) : mod.specId,
      qty: 1,
    }
  })
}

export function openPrintReport(
  project: PanelProject,
  enclosureName: string,
  t: TFunction,
  locale: string
): void {
  const bom = buildBillOfMaterials(project, t)
  const tagged = buildTaggedList(project, t)
  const html = `<!DOCTYPE html>
<html lang="${locale}"><head><meta charset="UTF-8"><title>${project.name}</title>
<style>
  body { font-family: Segoe UI, sans-serif; padding: 24px; color: #111; }
  h1 { color: #c05621; } table { border-collapse: collapse; width: 100%; margin-top: 16px; }
  th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
  th { background: #f7f7f7; } .meta { color: #555; margin-bottom: 20px; }
  .legend span { display: inline-block; width: 16px; height: 10px; margin-right: 6px; vertical-align: middle; }
  .tag { font-weight: 600; color: #c05621; font-family: monospace; }
</style></head><body>
  <h1>${project.name}</h1>
  <div class="meta">
    <p>${t('export.print.enclosure')} ${enclosureName} · ${project.phaseCount}φ · ${project.groundingSystem}</p>
    <p>${t('export.print.modules')} ${project.modules.length} · ${t('export.print.wires')} ${project.wires.length}</p>
    <p>${t('export.print.date')} ${new Date(project.updatedAt).toLocaleString(locale)}</p>
  </div>
  <h2>${t('export.print.tagsTitle')}</h2>
  <table><tr><th>${t('export.print.tagCol')}</th><th>${t('export.print.deviceCol')}</th></tr>
  ${tagged.map((r) => `<tr><td class="tag">${r.tag}</td><td>${r.name}</td></tr>`).join('')}
  </table>
  <h2>${t('export.print.bomTitle')}</h2>
  <table><tr><th>${t('export.print.nameCol')}</th><th>${t('export.print.qtyCol')}</th></tr>
  ${bom.map((r) => `<tr><td>${r.name}</td><td>${r.qty}</td></tr>`).join('')}
  </table>
  <h2>${t('export.print.legendTitle')}</h2>
  <div class="legend">
    <p><span style="background:#CD853F"></span>${t('export.print.l1')}</p>
    <p><span style="background:#2d2d2d"></span>${t('export.print.l2')}</p>
    <p><span style="background:#909090"></span>${t('export.print.l3')}</p>
    <p><span style="background:#1E90FF"></span>${t('export.print.n')}</p>
    <p><span style="background:#32CD32"></span>${t('export.print.pe')}</p>
  </div>
  <script>window.onload=()=>window.print()</script>
</body></html>`

  const w = window.open('', '_blank')
  if (w) {
    w.document.write(html)
    w.document.close()
  }
}

export function getSpec(specId: string): ModuleSpec {
  return MODULE_MAP[specId]
}
