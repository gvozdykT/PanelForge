import { toPng } from 'html-to-image'

function sanitizeFilename(name: string): string {
  return name.replace(/[^\w\u0400-\u04FF-]+/g, '-').replace(/^-|-$/g, '') || 'shield'
}

function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  link.click()
}

/** Зберегти DOM-елемент (схему або рейку) як PNG-файл */
export async function exportDomAsPng(element: HTMLElement, filename: string): Promise<void> {
  const selected = [...element.querySelectorAll('.selected')]
  selected.forEach((el) => el.classList.remove('selected'))

  const width = element.scrollWidth
  const height = element.scrollHeight

  try {
    const dataUrl = await toPng(element, {
      width,
      height,
      pixelRatio: 2,
      backgroundColor: '#22262e',
      cacheBust: true,
      style: {
        overflow: 'visible',
        width: `${width}px`,
        height: `${height}px`,
      },
    })
    downloadDataUrl(dataUrl, `${sanitizeFilename(filename)}.png`)
  } finally {
    selected.forEach((el) => el.classList.add('selected'))
  }
}
