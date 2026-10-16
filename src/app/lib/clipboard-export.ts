/**
 * Browser-only helpers for handing work to Claude: copying text, and turning
 * an exported SVG diagram into a PNG to copy or download.
 */

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false // insecure context, permission denied, or no clipboard API
  }
}

/** Renders a standalone SVG string to a 2× PNG blob. */
export function svgToPng(svg: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const scale = 2
      const canvas = document.createElement('canvas')
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas not available'))
      ctx.scale(scale, scale)
      ctx.drawImage(img, 0, 0)
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Export failed'))), 'image/png')
    }
    img.onerror = () => reject(new Error('Could not render the diagram'))
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  })
}

/**
 * Copies the diagram as a PNG where the browser allows image clipboard
 * writes, and downloads it otherwise (or when asked to).
 */
export async function exportPng(svg: string, filename: string, mode: 'copy' | 'download'): Promise<'copied' | 'downloaded'> {
  const blob = await svgToPng(svg)
  if (mode === 'copy' && typeof ClipboardItem !== 'undefined') {
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      return 'copied'
    } catch {
      // fall through to a download
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
  return 'downloaded'
}
