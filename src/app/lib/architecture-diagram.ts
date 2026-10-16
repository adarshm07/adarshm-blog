/**
 * The architecture-diagram model behind the system design tool, plus the
 * pure parts: node geometry, edge routing, a text serialisation for Claude,
 * and a standalone SVG for PNG export. The editor component only handles input.
 */

export type NodeKind =
  | 'client'
  | 'cdn'
  | 'lb'
  | 'gateway'
  | 'service'
  | 'worker'
  | 'cache'
  | 'db'
  | 'queue'
  | 'storage'
  | 'search'
  | 'external'

export type ArchNode = {
  id: string
  kind: NodeKind
  label: string
  note: string // technology or detail, e.g. "Postgres, sharded by user_id"
  x: number
  y: number
}

export type ArchEdge = {
  id: string
  from: string
  to: string
  label: string
  async: boolean
}

export type ArchDiagram = { nodes: ArchNode[]; edges: ArchEdge[] }

export const EMPTY_ARCH: ArchDiagram = { nodes: [], edges: [] }

export type NodeShape = 'box' | 'pill' | 'cylinder' | 'queue'

export const NODE_KINDS: Record<NodeKind, { label: string; shape: NodeShape }> = {
  client: { label: 'Client', shape: 'pill' },
  cdn: { label: 'CDN', shape: 'box' },
  lb: { label: 'Load balancer', shape: 'box' },
  gateway: { label: 'API gateway', shape: 'box' },
  service: { label: 'Service', shape: 'box' },
  worker: { label: 'Worker', shape: 'box' },
  cache: { label: 'Cache', shape: 'cylinder' },
  db: { label: 'Database', shape: 'cylinder' },
  queue: { label: 'Queue / log', shape: 'queue' },
  storage: { label: 'Object storage', shape: 'cylinder' },
  search: { label: 'Search index', shape: 'cylinder' },
  external: { label: 'External API', shape: 'pill' },
}

export const ARCH_CANVAS = { width: 800, height: 520 }
export const NODE_W = 136
export const NODE_H = 54

/** Fits text to a node's width in the monospace font used on screen and in exports. */
export function clip(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

/** Baselines for the kind tag, label and note — lower inside a cylinder, below its rim. */
export function nodeTextY(n: ArchNode) {
  const dy = NODE_KINDS[n.kind].shape === 'cylinder' ? 4 : 0
  return { kind: n.y + 17 + dy, label: n.y + 32 + dy, note: n.y + 44 + dy }
}

export function nodeCenter(n: ArchNode) {
  return { x: n.x + NODE_W / 2, y: n.y + NODE_H / 2 }
}

/** Where the line between two node centres crosses each node's border. */
export function archEdgePoints(from: ArchNode, to: ArchNode) {
  const a = nodeCenter(from)
  const b = nodeCenter(to)
  const border = (c: { x: number; y: number }, t: { x: number; y: number }) => {
    const dx = t.x - c.x
    const dy = t.y - c.y
    if (dx === 0 && dy === 0) return c
    const scale = 1 / Math.max(Math.abs(dx) / (NODE_W / 2), Math.abs(dy) / (NODE_H / 2))
    return { x: c.x + dx * scale, y: c.y + dy * scale }
  }
  return { start: border(a, b), end: border(b, a) }
}

/** SVG path for a node's outline, shared by the editor and the export. */
export function nodePath(n: ArchNode): string {
  const { x, y } = n
  const w = NODE_W
  const h = NODE_H
  switch (NODE_KINDS[n.kind].shape) {
    case 'pill': {
      const r = h / 2
      return `M${x + r},${y} H${x + w - r} A${r},${r} 0 0 1 ${x + w - r},${y + h} H${x + r} A${r},${r} 0 0 1 ${x + r},${y} Z`
    }
    case 'cylinder': {
      const ry = 6
      return `M${x},${y + ry} A${w / 2},${ry} 0 0 1 ${x + w},${y + ry} V${y + h - ry} A${w / 2},${ry} 0 0 1 ${x},${y + h - ry} Z M${x},${y + ry} A${w / 2},${ry} 0 0 0 ${x + w},${y + ry}`
    }
    case 'queue': {
      const lines = [0, 1, 2].map((i) => `M${x + w - 10 - i * 7},${y + 8} V${y + h - 8}`).join(' ')
      return `M${x + 4},${y} H${x + w - 4} Q${x + w},${y} ${x + w},${y + 4} V${y + h - 4} Q${x + w},${y + h} ${x + w - 4},${y + h} H${x + 4} Q${x},${y + h} ${x},${y + h - 4} V${y + 4} Q${x},${y} ${x + 4},${y} Z ${lines}`
    }
    default:
      return `M${x + 6},${y} H${x + w - 6} Q${x + w},${y} ${x + w},${y + 6} V${y + h - 6} Q${x + w},${y + h} ${x + w - 6},${y + h} H${x + 6} Q${x},${y + h} ${x},${y + h - 6} V${y + 6} Q${x},${y} ${x + 6},${y} Z`
  }
}

/** Plain-text form of the diagram — what Claude actually reads. */
export function archToText(d: ArchDiagram): string {
  if (d.nodes.length === 0) return '(no diagram drawn)'
  const byId = new Map(d.nodes.map((n) => [n.id, n]))
  const nodes = d.nodes.map((n) => {
    const note = n.note.trim() ? ` — ${n.note.trim()}` : ''
    return `- ${n.label || '(unnamed)'} [${NODE_KINDS[n.kind].label}]${note}`
  })
  const edges = d.edges
    .filter((e) => byId.has(e.from) && byId.has(e.to))
    .map((e) => {
      const label = e.label.trim() ? `: ${e.label.trim()}` : ''
      return `- ${byId.get(e.from)!.label} → ${byId.get(e.to)!.label}${label} (${e.async ? 'async' : 'sync'})`
    })
  return ['Components:', ...nodes, '', 'Connections:', ...(edges.length ? edges : ['(none)'])].join('\n')
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * A self-contained SVG (light theme, explicit colours, white background) for
 * export — it can't rely on the page's Tailwind classes or dark mode.
 */
export function archToSvg(d: ArchDiagram): string {
  const ink = '#262626'
  const muted = '#737373'
  const line = '#a3a3a3'
  const accent = '#16a34a'
  const byId = new Map(d.nodes.map((n) => [n.id, n]))

  let maxX = 200
  let maxY = 120
  for (const n of d.nodes) {
    maxX = Math.max(maxX, n.x + NODE_W + 20)
    maxY = Math.max(maxY, n.y + NODE_H + 20)
  }

  const edges = d.edges
    .map((e) => {
      const from = byId.get(e.from)
      const to = byId.get(e.to)
      if (!from || !to) return ''
      const { start, end } = archEdgePoints(from, to)
      const dash = e.async ? ' stroke-dasharray="6 4"' : ''
      const mx = (start.x + end.x) / 2
      const my = (start.y + end.y) / 2
      const label = e.label.trim()
        ? `<rect x="${mx - (e.label.length * 6.2) / 2 - 3}" y="${my - 8}" width="${e.label.length * 6.2 + 6}" height="14" rx="3" fill="#fff"/><text x="${mx}" y="${my + 3}" font-size="10" fill="${muted}" text-anchor="middle" font-family="monospace">${esc(e.label)}</text>`
        : ''
      return `<line x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}" stroke="${line}" stroke-width="1.4"${dash} marker-end="url(#arrow)"/>${label}`
    })
    .join('\n')

  const nodes = d.nodes
    .map((n) => {
      const c = nodeCenter(n)
      const t = nodeTextY(n)
      const note = n.note.trim()
        ? `<text x="${c.x}" y="${t.note}" font-size="9" fill="${muted}" text-anchor="middle" font-family="monospace">${esc(clip(n.note.trim(), 20))}</text>`
        : ''
      return `<path d="${nodePath(n)}" fill="#fff" stroke="${accent}" stroke-width="1.2"/>
<text x="${c.x}" y="${t.kind}" font-size="8" fill="${muted}" text-anchor="middle" font-family="monospace">${esc(NODE_KINDS[n.kind].label.toUpperCase())}</text>
<text x="${c.x}" y="${t.label}" font-size="12" font-weight="600" fill="${ink}" text-anchor="middle" font-family="monospace">${esc(clip(n.label, 17))}</text>${note}`
    })
    .join('\n')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${maxX}" height="${maxY}" viewBox="0 0 ${maxX} ${maxY}">
<rect width="100%" height="100%" fill="#fff"/>
<defs><marker id="arrow" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="10" markerHeight="10" orient="auto-start-reverse"><path d="M1,1 L11,6 L1,11" fill="none" stroke="${muted}" stroke-width="1.5"/></marker></defs>
${edges}
${nodes}
</svg>`
}

/** A typical starting point: client → LB → service → cache / DB, plus async work. */
export function starterArchitecture(makeId: (prefix: string) => string): ArchDiagram {
  const node = (kind: NodeKind, label: string, x: number, y: number): ArchNode => ({
    id: makeId('n'),
    kind,
    label,
    note: '',
    x,
    y,
  })
  const client = node('client', 'Client', 20, 233)
  const lb = node('lb', 'Load balancer', 190, 233)
  const api = node('service', 'API', 370, 233)
  const cache = node('cache', 'Cache', 600, 100)
  const db = node('db', 'Database', 600, 233)
  const queue = node('queue', 'Queue', 370, 400)
  const worker = node('worker', 'Worker', 600, 400)
  const edge = (from: ArchNode, to: ArchNode, label: string, async = false): ArchEdge => ({
    id: makeId('e'),
    from: from.id,
    to: to.id,
    label,
    async,
  })
  return {
    nodes: [client, lb, api, cache, db, queue, worker],
    edges: [
      edge(client, lb, 'HTTPS'),
      edge(lb, api, ''),
      edge(api, cache, 'read'),
      edge(api, db, 'read/write'),
      edge(api, queue, 'publish', true),
      edge(queue, worker, 'consume', true),
      edge(worker, db, 'write'),
    ],
  }
}

/** Guards a diagram restored from localStorage. */
export function isArchDiagram(value: unknown): value is ArchDiagram {
  const d = value as ArchDiagram
  return (
    !!d &&
    Array.isArray(d.nodes) &&
    Array.isArray(d.edges) &&
    d.nodes.every(
      (n) =>
        typeof n?.id === 'string' &&
        typeof n.label === 'string' &&
        typeof n.note === 'string' &&
        typeof n.x === 'number' &&
        typeof n.y === 'number' &&
        Object.hasOwn(NODE_KINDS, n.kind)
    ) &&
    d.edges.every(
      (e) =>
        typeof e?.from === 'string' && typeof e.to === 'string' && typeof e.label === 'string' && typeof e.async === 'boolean'
    )
  )
}
